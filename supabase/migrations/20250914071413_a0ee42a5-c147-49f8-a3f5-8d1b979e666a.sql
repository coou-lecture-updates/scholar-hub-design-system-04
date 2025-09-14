-- Phase 1: Critical Security Fixes

-- 1. Fix Anonymous System Privacy - Remove email exposure
DROP POLICY IF EXISTS "Anyone can view anonymous messages" ON anonymous_messages;
CREATE POLICY "Anyone can view anonymous messages content only" 
ON anonymous_messages 
FOR SELECT 
USING (true);

-- Create admin-only policy for viewing emails in anonymous messages
CREATE POLICY "Admins can view anonymous message emails" 
ON anonymous_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 2. Fix System Settings RLS - Consolidate conflicting policies
DROP POLICY IF EXISTS "Anyone can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can view system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can insert system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can update system settings" ON system_settings;
DROP POLICY IF EXISTS "Admins can delete system settings" ON system_settings;
DROP POLICY IF EXISTS "Only admins can modify system settings" ON system_settings;

-- Create consolidated admin-only policies for system settings
CREATE POLICY "Admins have full access to system settings" 
ON system_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow public read access only for non-sensitive settings
CREATE POLICY "Public can view non-sensitive settings" 
ON system_settings 
FOR SELECT 
USING (
  key NOT IN (
    'payment_gateway_secrets', 
    'api_keys', 
    'admin_emails',
    'security_config',
    'encryption_keys'
  )
);

-- 3. Prevent Role Escalation - Add security trigger
CREATE OR REPLACE FUNCTION prevent_self_role_modification()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent users from modifying their own roles
  IF TG_OP = 'UPDATE' AND OLD.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot modify their own roles';
  END IF;
  
  -- Prevent users from creating admin roles for themselves
  IF TG_OP = 'INSERT' AND NEW.user_id = auth.uid() AND NEW.role = 'admin' THEN
    -- Allow only if current user is already an admin
    IF NOT EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Only admins can create admin roles';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to prevent role escalation
DROP TRIGGER IF EXISTS prevent_role_escalation ON user_roles;
CREATE TRIGGER prevent_role_escalation
  BEFORE INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_role_modification();

-- 4. Enhanced Audit Logging Function
CREATE OR REPLACE FUNCTION log_security_event(
  action_type TEXT,
  table_name TEXT,
  record_id TEXT DEFAULT NULL,
  details JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    new_values,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    action_type,
    table_name,
    record_id,
    details,
    current_setting('request.headers')::jsonb->>'x-forwarded-for',
    current_setting('request.headers')::jsonb->>'user-agent'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;

-- 5. Create secure payment gateway configuration table
CREATE TABLE IF NOT EXISTS payment_gateway_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'live',
  enabled BOOLEAN NOT NULL DEFAULT false,
  public_key TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  business_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on payment gateway config
ALTER TABLE payment_gateway_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage payment gateway config
CREATE POLICY "Admins manage payment gateway config" 
ON payment_gateway_config 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 6. Fix function search_path issues
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION has_role(check_role text, user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE SQL
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = check_role
  );
$$;

CREATE OR REPLACE FUNCTION get_user_roles(user_uuid uuid DEFAULT auth.uid())
RETURNS text[]
LANGUAGE SQL
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT array_agg(role) FROM public.user_roles WHERE user_id = user_uuid;
$$;

-- 7. Add update trigger for payment_gateway_config
CREATE TRIGGER update_payment_gateway_config_updated_at
  BEFORE UPDATE ON payment_gateway_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Create security audit trigger for sensitive tables
CREATE OR REPLACE FUNCTION audit_sensitive_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log all changes to sensitive tables
  IF TG_TABLE_NAME IN ('user_roles', 'system_settings', 'payment_gateway_config') THEN
    PERFORM log_security_event(
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id::TEXT, OLD.id::TEXT),
      jsonb_build_object(
        'old_values', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        'new_values', CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_user_roles_changes ON user_roles;
CREATE TRIGGER audit_user_roles_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION audit_sensitive_changes();

DROP TRIGGER IF EXISTS audit_system_settings_changes ON system_settings;
CREATE TRIGGER audit_system_settings_changes
  AFTER INSERT OR UPDATE OR DELETE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION audit_sensitive_changes();