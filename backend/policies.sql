ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY; ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY; ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY; ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY; ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY; ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY; ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY; ALTER TABLE public.banned_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_read ON public.profiles FOR SELECT USING (true); CREATE POLICY profile_update ON public.profiles FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY categories_read ON public.categories FOR SELECT USING (true); CREATE POLICY listings_read ON public.listings FOR SELECT USING (is_active = true OR auth.uid() = seller_id); CREATE POLICY listings_insert ON public.listings FOR INSERT WITH CHECK (auth.uid() = seller_id); CREATE POLICY listings_update ON public.listings FOR UPDATE USING (auth.uid() = seller_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')); CREATE POLICY listings_delete ON public.listings FOR DELETE USING (auth.uid() = seller_id);
CREATE POLICY orders_read ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id); CREATE POLICY orders_insert ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id); CREATE POLICY orders_update ON public.orders FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY cart_own ON public.cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY messages_own_read ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
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
CREATE POLICY messages_send ON public.messages FOR INSERT WITH CHECK (public.can_send_message(auth.uid(), receiver_id, listing_id));
CREATE POLICY messages_read ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);
CREATE POLICY announcements_read ON public.announcements FOR SELECT TO authenticated USING (true); CREATE POLICY announcements_admin ON public.announcements FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')); CREATE POLICY announcements_admin_update ON public.announcements FOR UPDATE USING (auth.uid() = admin_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY returns_read ON public.returns FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id); CREATE POLICY returns_insert ON public.returns FOR INSERT WITH CHECK (auth.uid() = buyer_id); CREATE POLICY returns_update ON public.returns FOR UPDATE USING (auth.uid() = seller_id);
