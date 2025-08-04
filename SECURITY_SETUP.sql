-- CRITICAL SECURITY SETUP FOR COOU SCHOOL UPDATES
-- Run this SQL in your Supabase SQL Editor to apply all security fixes
-- This addresses the critical vulnerabilities identified in the security review

-- ============================================================================
-- PHASE 1: ROW LEVEL SECURITY (RLS) SETUP
-- ============================================================================

-- 1. Enable RLS on user_roles table (CRITICAL)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "users_can_view_own_roles" ON user_roles;
DROP POLICY IF EXISTS "admins_can_insert_roles" ON user_roles;
DROP POLICY IF EXISTS "admins_can_update_roles" ON user_roles;
DROP POLICY IF EXISTS "admins_can_delete_roles" ON user_roles;

-- Policy: Users can only view their own roles
CREATE POLICY "users_can_view_own_roles" ON user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Only admins can INSERT roles
CREATE POLICY "admins_can_insert_roles" ON user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Policy: Only admins can UPDATE roles
CREATE POLICY "admins_can_update_roles" ON user_roles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Policy: Only admins can DELETE roles
CREATE POLICY "admins_can_delete_roles" ON user_roles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- ============================================================================
-- PHASE 2: AUDIT LOGS SECURITY
-- ============================================================================

-- 2. Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing audit log policies
DROP POLICY IF EXISTS "admins_can_view_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "system_can_insert_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "users_can_insert_own_audit_logs" ON audit_logs;

-- Policy: Only admins can view audit logs
CREATE POLICY "admins_can_view_audit_logs" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'admin'
    )
  );

-- Policy: System can insert audit logs (service role)
CREATE POLICY "system_can_insert_audit_logs" ON audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy: Authenticated users can insert their own audit logs
CREATE POLICY "users_can_insert_own_audit_logs" ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PHASE 3: SECURITY FUNCTIONS
-- ============================================================================

-- 3. Create security event logging function
CREATE OR REPLACE FUNCTION log_security_event(
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    auth.uid(),
    p_action,
    p_table_name,
    p_record_id,
    p_old_values,
    p_new_values,
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent',
    NOW()
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- 4. Create function to check admin privileges
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = user_uuid 
    AND role = 'admin'
  );
END;
$$;

-- 5. Create function for secure role assignment with validation
CREATE OR REPLACE FUNCTION assign_user_role(
  target_user_id UUID,
  new_role TEXT,
  faculty_id UUID DEFAULT NULL,
  department_id UUID DEFAULT NULL,
  level INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valid_roles TEXT[] := ARRAY['user', 'course_rep', 'moderator', 'admin'];
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Insufficient privileges to assign roles';
  END IF;
  
  -- Validate role
  IF NOT (new_role = ANY(valid_roles)) THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  
  -- Validate target user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'Target user does not exist';
  END IF;
  
  -- Insert or update the role
  INSERT INTO user_roles (user_id, role, faculty_id, department_id, level)
  VALUES (target_user_id, new_role, faculty_id, department_id, level)
  ON CONFLICT (user_id, role) 
  DO UPDATE SET 
    faculty_id = EXCLUDED.faculty_id,
    department_id = EXCLUDED.department_id,
    level = EXCLUDED.level,
    updated_at = NOW();
    
  RETURN TRUE;
END;
$$;

-- ============================================================================
-- PHASE 4: AUDIT TRIGGERS
-- ============================================================================

-- 6. Create audit trigger function for user_roles
CREATE OR REPLACE FUNCTION audit_user_roles_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_security_event(
      'role_assigned',
      'user_roles',
      NEW.id::TEXT,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_security_event(
      'role_updated',
      'user_roles',
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_security_event(
      'role_removed',
      'user_roles',
      OLD.id::TEXT,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS audit_user_roles_trigger ON user_roles;
CREATE TRIGGER audit_user_roles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_user_roles_changes();

-- ============================================================================
-- PHASE 5: SECURITY MONITORING
-- ============================================================================

-- 7. Create security monitoring view for admins
CREATE OR REPLACE VIEW security_dashboard AS
SELECT 
  'failed_logins' as metric,
  COUNT(*) as count,
  DATE_TRUNC('hour', created_at) as time_bucket
FROM audit_logs 
WHERE action LIKE '%failed%' 
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
UNION ALL
SELECT 
  'role_changes' as metric,
  COUNT(*) as count,
  DATE_TRUNC('hour', created_at) as time_bucket
FROM audit_logs 
WHERE action IN ('role_assigned', 'role_updated', 'role_removed')
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at)
UNION ALL
SELECT 
  'admin_access' as metric,
  COUNT(*) as count,
  DATE_TRUNC('hour', created_at) as time_bucket
FROM audit_logs 
WHERE action LIKE '%admin%'
  AND created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at);

-- ============================================================================
-- PHASE 6: PERMISSIONS AND INDEXES
-- ============================================================================

-- 8. Grant appropriate permissions
GRANT EXECUTE ON FUNCTION log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION assign_user_role TO authenticated;
GRANT SELECT ON security_dashboard TO authenticated;

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the security setup is working correctly:

-- 1. Check RLS is enabled
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_roles', 'audit_logs') 
  AND schemaname = 'public';

-- 2. List RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('user_roles', 'audit_logs');

-- 3. Check functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name IN ('log_security_event', 'is_admin', 'assign_user_role')
  AND routine_schema = 'public';

-- 4. Check triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'audit_user_roles_trigger';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

-- If you see this message without errors, all security fixes have been applied successfully!
SELECT 'CRITICAL SECURITY FIXES APPLIED SUCCESSFULLY!' as status;

-- Next steps:
-- 1. Test the security setup using the Security Setup Panel in the Admin Dashboard
-- 2. Monitor audit logs for any suspicious activity
-- 3. Review and update admin credentials if needed
-- 4. Set up regular security audits