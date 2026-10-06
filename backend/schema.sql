CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT,
  student_number TEXT,
  campus TEXT,
  address TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','seller','admin')),
  is_seller BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  bio TEXT,
  banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE public.categories (id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, slug TEXT UNIQUE NOT NULL, icon TEXT DEFAULT 'package');
CREATE TABLE public.listings (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, price NUMERIC(10,2) NOT NULL CHECK (price >= 0), category_id INTEGER REFERENCES public.categories(id), image_url TEXT, is_service BOOLEAN DEFAULT FALSE, is_promotion BOOLEAN DEFAULT FALSE, is_active BOOLEAN DEFAULT TRUE, stock INTEGER DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.orders (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), buyer_id UUID NOT NULL REFERENCES public.profiles(id), seller_id UUID NOT NULL REFERENCES public.profiles(id), listing_id UUID NOT NULL REFERENCES public.listings(id), quantity INTEGER NOT NULL DEFAULT 1, total NUMERIC(10,2) NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled','returned')), delivery_date TIMESTAMPTZ, delivery_notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.cart_items (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE, quantity INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(user_id, listing_id));
CREATE TABLE public.messages (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL, order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL, content TEXT NOT NULL, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.announcements (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), admin_id UUID NOT NULL REFERENCES public.profiles(id), title TEXT NOT NULL, body TEXT NOT NULL, priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high')), created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.returns (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE, buyer_id UUID NOT NULL REFERENCES public.profiles(id), seller_id UUID NOT NULL REFERENCES public.profiles(id), reason TEXT NOT NULL, status TEXT DEFAULT 'requested' CHECK (status IN ('requested','approved','rejected','completed')), created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE public.banned_keywords (id SERIAL PRIMARY KEY, keyword TEXT UNIQUE NOT NULL);
INSERT INTO public.banned_keywords(keyword) VALUES ('weed'),('marijuana'),('cannabis'),('dildo'),('sex toy'),('condom'),('escort'),('prostitute'),('onlyfans'),('nudes'),('drugs'),('cocaine'),('meth'),('heroin'),('gun'),('weapon') ON CONFLICT DO NOTHING;
