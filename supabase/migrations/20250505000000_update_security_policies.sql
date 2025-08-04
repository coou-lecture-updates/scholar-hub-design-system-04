
-- Update RLS for events table
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;

-- Public can view published events
CREATE POLICY IF NOT EXISTS "Public can view published events" 
ON public.events
FOR SELECT 
USING (published = true);

-- Create a security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

-- Users with admin role can manage all events using the security definer function
CREATE POLICY "Admins can manage all events" 
ON public.events
USING (public.get_current_user_role() = 'admin');

-- Update RLS for users table
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own data
CREATE POLICY "Users can view and update their own data"
ON public.users
USING (auth.uid() = id);

-- Admins can view all users data
CREATE POLICY "Admins can view all users"
ON public.users
USING (public.get_current_user_role() = 'admin');

-- Update RLS for blog posts
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can view published blog posts
CREATE POLICY IF NOT EXISTS "Public can view published blog posts" 
ON public.blog_posts
FOR SELECT 
USING (published = true);

-- Admins can manage all blog posts
CREATE POLICY IF NOT EXISTS "Admins can manage all blog posts"
ON public.blog_posts
USING (public.get_current_user_role() = 'admin');

-- Update RLS for courses
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;

-- Public can view all courses
CREATE POLICY IF NOT EXISTS "Public can view all courses" 
ON public.courses
FOR SELECT 
USING (true);

-- Admins can manage courses
CREATE POLICY IF NOT EXISTS "Admins can manage courses"
ON public.courses
USING (public.get_current_user_role() = 'admin');

-- Update RLS for lost_and_found
ALTER TABLE IF EXISTS public.lost_and_found ENABLE ROW LEVEL SECURITY;

-- Fix foreign key constraint to set NULL on user deletion
ALTER TABLE IF EXISTS public.lost_and_found
DROP CONSTRAINT IF EXISTS lost_and_found_user_id_fkey,
ADD CONSTRAINT lost_and_found_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id)
ON DELETE SET NULL;

-- Users can view all lost and found items
CREATE POLICY IF NOT EXISTS "All users can view lost and found items" 
ON public.lost_and_found
FOR SELECT 
USING (true);

-- Authenticated users can create lost and found items
CREATE POLICY IF NOT EXISTS "Authenticated users can create lost and found items" 
ON public.lost_and_found
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Users can update their own lost and found items
CREATE POLICY IF NOT EXISTS "Users can update their own lost and found items" 
ON public.lost_and_found
FOR UPDATE 
USING (auth.uid() = user_id);
