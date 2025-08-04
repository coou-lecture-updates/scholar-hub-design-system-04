-- Fix remaining function search paths
ALTER FUNCTION public.audit_trigger_function() SET search_path = 'public';
ALTER FUNCTION public.custom_access_token_hook(jsonb) SET search_path = 'public';