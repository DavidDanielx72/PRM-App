-- Run after creating admin@cput.ac.za in Supabase Authentication.
UPDATE public.profiles SET role = 'admin', full_name = 'System Admin' WHERE email = 'admin@cput.ac.za';

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS residence TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_seller)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE WHEN NEW.email LIKE '%@cput.ac.za' THEN 'admin' ELSE 'student' END,
    COALESCE((NEW.raw_user_meta_data->>'is_seller')::boolean, false)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
