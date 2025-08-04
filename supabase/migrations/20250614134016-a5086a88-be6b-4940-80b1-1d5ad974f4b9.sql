
-- Create 'profiles' table to store user info separately from auth 'users'
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  campus TEXT,
  faculty TEXT,
  department TEXT,
  level INTEGER,
  reg_number TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Optionally, migrate any user-profile-related columns out of 'users'
-- (You can remove these columns from 'users' after migration if you want to enforce the split.)

-- Add RLS: Users access ONLY their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles: Self view" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles: Self update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles: Self insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-insert new profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
  RETURN NEW;
END
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile();
