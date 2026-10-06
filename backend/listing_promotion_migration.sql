ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN NOT NULL DEFAULT FALSE;

NOTIFY pgrst, 'reload schema';
