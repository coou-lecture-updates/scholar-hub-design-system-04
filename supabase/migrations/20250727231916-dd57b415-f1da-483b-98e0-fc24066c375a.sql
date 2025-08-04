-- Fix RLS issues: Enable RLS for anonymous_pages table and update function search paths
-- Enable RLS for anonymous_pages table
ALTER TABLE public.anonymous_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous_pages
CREATE POLICY "Allow public read access to anonymous pages" 
ON public.anonymous_pages 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage anonymous pages" 
ON public.anonymous_pages 
FOR ALL 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Fix function search paths to improve security
ALTER FUNCTION public.get_user_roles(uuid) SET search_path = 'public';
ALTER FUNCTION public.has_role(text, uuid) SET search_path = 'public';
ALTER FUNCTION public.create_user_wallet() SET search_path = 'public';
ALTER FUNCTION public.get_current_user_role() SET search_path = 'public';
ALTER FUNCTION public.update_wallet_balance() SET search_path = 'public';
ALTER FUNCTION public.generate_unique_ticket_code() SET search_path = 'public';
ALTER FUNCTION public.generate_unique_ticket_id() SET search_path = 'public';
ALTER FUNCTION public.get_faculty_id(text) SET search_path = 'public';
ALTER FUNCTION public.handle_new_profile() SET search_path = 'public';
ALTER FUNCTION public.validate_event_date() SET search_path = 'public';
ALTER FUNCTION public.delete_expired_anon_images() SET search_path = 'public';
ALTER FUNCTION public.trigger_set_timestamp() SET search_path = 'public';
ALTER FUNCTION public.generate_ticket_qr_code() SET search_path = 'public';
ALTER FUNCTION public.handle_event_creation_fee() SET search_path = 'public';