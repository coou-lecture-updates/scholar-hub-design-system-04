-- Fix the last remaining function search path
ALTER FUNCTION public.validate_email_format() SET search_path = 'public';