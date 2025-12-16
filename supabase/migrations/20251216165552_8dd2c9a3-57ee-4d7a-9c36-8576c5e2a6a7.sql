-- Fix Security Definer View Issue and Function Search Paths

-- ============================================
-- FIX ANONYMOUS_PAGES PUBLIC VIEW
-- ============================================

-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.anonymous_pages_public;

-- Recreate view without security definer (it's not needed for public access)
CREATE OR REPLACE VIEW public.anonymous_pages_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  created_at,
  page_name,
  page_token,
  public_link,
  expires_at,
  updated_at
FROM anonymous_pages
WHERE expires_at > now();

-- Grant select on the public view
GRANT SELECT ON public.anonymous_pages_public TO anon, authenticated;

-- ============================================
-- FIX FUNCTION SEARCH PATHS
-- ============================================

-- Fix log_anonymous_page_access function
CREATE OR REPLACE FUNCTION log_anonymous_page_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'SELECT' AND auth.uid() IS NOT NULL THEN
    PERFORM log_security_event(
      'ANONYMOUS_PAGE_EMAIL_ACCESS',
      'anonymous_pages',
      NEW.id::text,
      jsonb_build_object('email', NEW.email)
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Fix update_community_message_updated_at function
CREATE OR REPLACE FUNCTION update_community_message_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    NEW.edited_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix set_public_link function
CREATE OR REPLACE FUNCTION set_public_link()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.public_link IS NULL THEN
    NEW.public_link := generate_short_link();
    -- Ensure uniqueness
    WHILE EXISTS(SELECT 1 FROM anonymous_pages WHERE public_link = NEW.public_link) LOOP
      NEW.public_link := generate_short_link();
    END LOOP;
  END IF;
  
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := (now() + interval '48 hours');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix update_message_ads_updated_at function
CREATE OR REPLACE FUNCTION update_message_ads_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix set_public_link_and_expiry function
CREATE OR REPLACE FUNCTION set_public_link_and_expiry()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.public_link IS NULL THEN
    NEW.public_link := generate_unique_public_link();
  END IF;
  
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NOW() + INTERVAL '48 hours';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix generate_unique_ticket_code function
CREATE OR REPLACE FUNCTION generate_unique_ticket_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.ticket_code := UPPER(SUBSTRING(MD5(NEW.id::text || now()::text) FROM 1 FOR 8));
  RETURN NEW;
END;
$$;

-- Fix generate_unique_ticket_id function
CREATE OR REPLACE FUNCTION generate_unique_ticket_id()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.ticket_id := substring(md5(random()::text) from 1 for 10);
  RETURN NEW;
END;
$$;

-- Fix generate_ticket_qr_code function
CREATE OR REPLACE FUNCTION generate_ticket_qr_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.qr_code := 'QR_' || UPPER(SUBSTRING(MD5(NEW.id::text || now()::text) FROM 1 FOR 12));
  NEW.recovery_token := UPPER(SUBSTRING(MD5(NEW.id::text || 'recovery' || now()::text) FROM 1 FOR 16));
  RETURN NEW;
END;
$$;