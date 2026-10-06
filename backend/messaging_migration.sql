ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS messages_own_read ON public.messages;
DROP POLICY IF EXISTS messages_send ON public.messages;
DROP POLICY IF EXISTS messages_read ON public.messages;

CREATE POLICY messages_own_read ON public.messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE OR REPLACE FUNCTION public.can_send_message(sender UUID, receiver UUID, related_listing UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE sender_role TEXT;
BEGIN
  SELECT role INTO sender_role FROM profiles WHERE id = sender;
  IF sender <> auth.uid() OR sender_role IS NULL THEN RETURN FALSE; END IF;
  IF sender_role = 'admin' THEN RETURN TRUE; END IF;
  IF sender_role = 'student' THEN
    RETURN EXISTS (
      SELECT 1 FROM profiles seller
      JOIN listings listing ON listing.seller_id = seller.id
      WHERE seller.id = receiver AND seller.role = 'seller'
        AND listing.id = related_listing AND listing.is_active = true
    ) OR EXISTS (
      SELECT 1 FROM messages existing_thread
      WHERE (existing_thread.sender_id = sender AND existing_thread.receiver_id = receiver)
         OR (existing_thread.sender_id = receiver AND existing_thread.receiver_id = sender)
    );
  END IF;
  IF sender_role = 'seller' THEN
    RETURN EXISTS (
      SELECT 1 FROM messages first_message
      JOIN profiles student ON student.id = first_message.sender_id
      WHERE first_message.sender_id = receiver
        AND first_message.receiver_id = sender
        AND student.role = 'student'
    ) OR EXISTS (
      SELECT 1 FROM messages existing_thread
      WHERE (existing_thread.sender_id = sender AND existing_thread.receiver_id = receiver)
         OR (existing_thread.sender_id = receiver AND existing_thread.receiver_id = sender)
    );
  END IF;
  RETURN FALSE;
END;
$$;

CREATE POLICY messages_send ON public.messages
FOR INSERT WITH CHECK (public.can_send_message(auth.uid(), receiver_id, listing_id));

CREATE POLICY messages_read ON public.messages
FOR UPDATE USING (auth.uid() = receiver_id);
