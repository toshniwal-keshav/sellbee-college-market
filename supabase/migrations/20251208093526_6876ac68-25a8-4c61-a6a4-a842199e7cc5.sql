-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('product', 'service')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('product', 'service')),
  condition TEXT CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
  images TEXT[],
  is_auction BOOLEAN DEFAULT false,
  auction_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create bids table for auctions
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);

-- Listings policies
CREATE POLICY "Listings are viewable by everyone" ON public.listings FOR SELECT USING (true);
CREATE POLICY "Users can create listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = user_id);

-- Bids policies
CREATE POLICY "Bids are viewable by everyone" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Users can create bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categories (name, type) VALUES
  ('Tutoring', 'service'),
  ('Design & Creative', 'service'),
  ('Tech & Development', 'service'),
  ('Writing & Translation', 'service'),
  ('Textbooks', 'product'),
  ('Electronics', 'product'),
  ('Furniture', 'product'),
  ('Clothing', 'product'),
  ('Sports Equipment', 'product'),
  ('Other', 'product');