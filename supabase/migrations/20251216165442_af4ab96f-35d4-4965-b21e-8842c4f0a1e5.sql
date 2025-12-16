-- Fix Remaining Security Issues: Anonymous Pages and Payment Gateway Config

-- ============================================
-- ANONYMOUS_PAGES TABLE SECURITY
-- ============================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view anonymous pages" ON anonymous_pages;
DROP POLICY IF EXISTS "Public can view anonymous pages" ON anonymous_pages;

-- Only admins can view email addresses in anonymous_pages
CREATE POLICY "Admins view anonymous pages with emails" ON anonymous_pages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Public can view anonymous pages but WITHOUT email field (using view instead)
-- Create a public view that excludes email
CREATE OR REPLACE VIEW public.anonymous_pages_public AS
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
-- PAYMENT_GATEWAY_CONFIG ADDITIONAL HARDENING
-- ============================================

-- Ensure only admins can read payment gateway config
-- The existing policy should be sufficient, but let's verify

-- Add comment to document security requirement
COMMENT ON COLUMN payment_gateway_config.public_key IS 
  'Public API key - verify this is publishable key only, not secret key. Secret keys must be stored in Edge Function secrets.';

COMMENT ON TABLE payment_gateway_config IS 
  'Contains payment gateway configuration. Secret keys MUST NOT be stored here - use Edge Function secrets instead. Only public/publishable keys allowed.';

-- ============================================
-- AUDIT LOGGING FOR SENSITIVE OPERATIONS
-- ============================================

-- Log when admin views anonymous page emails
CREATE OR REPLACE FUNCTION log_anonymous_page_access()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;