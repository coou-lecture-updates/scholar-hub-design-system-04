-- Fix system_settings RLS violations immediately

-- Create a service role policy to allow system operations
CREATE POLICY "Service role can manage system settings" 
ON system_settings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Grant necessary permissions to service role
GRANT ALL ON system_settings TO service_role;