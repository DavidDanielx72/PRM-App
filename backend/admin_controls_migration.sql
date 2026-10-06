ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN NOT NULL DEFAULT FALSE;

DROP POLICY IF EXISTS announcements_admin_update ON public.announcements;
CREATE POLICY announcements_admin_update
ON public.announcements
FOR UPDATE
USING (
  auth.uid() = admin_id
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  auth.uid() = admin_id
  AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

NOTIFY pgrst, 'reload schema';
