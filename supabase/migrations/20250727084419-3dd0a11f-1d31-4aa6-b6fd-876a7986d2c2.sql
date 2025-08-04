-- Security Fix Migration: Critical Vulnerabilities Remediation (Corrected)

-- 1. Create anonymous_pages table with proper RLS (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.anonymous_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text,
  is_public boolean DEFAULT false,
  expires_at timestamp with time zone DEFAULT (now() + interval '30 days'),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on anonymous_pages
ALTER TABLE public.anonymous_pages ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for anonymous_pages
CREATE POLICY "Public can view public anonymous pages" 
ON public.anonymous_pages 
FOR SELECT 
USING (is_public = true AND expires_at > now());

CREATE POLICY "Admins can manage all anonymous pages" 
ON public.anonymous_pages 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- 2. Secure existing database functions by adding proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- 3. Create secure role checking function for user_roles table
CREATE OR REPLACE FUNCTION public.get_user_roles(user_uuid uuid DEFAULT auth.uid())
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT array_agg(role) FROM public.user_roles WHERE user_id = user_uuid;
$$;

-- 4. Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(check_role text, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = check_role
  );
$$;

-- 5. Add missing profiles table with proper RLS
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create secure RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (has_role('admin'));

-- 6. Add input validation triggers
CREATE OR REPLACE FUNCTION public.validate_email_format()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.email;
  END IF;
  RETURN NEW;
END;
$$;

-- Apply email validation to relevant tables
DROP TRIGGER IF EXISTS validate_user_email ON public.users;
CREATE TRIGGER validate_user_email
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION validate_email_format();

-- 7. Add timestamp update trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();