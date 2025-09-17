-- Fix anonymous_pages table structure and add missing features
-- Update existing records with missing public_link
UPDATE anonymous_pages 
SET public_link = UPPER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 6))
WHERE public_link IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_anonymous_pages_public_link ON anonymous_pages(public_link);
CREATE INDEX IF NOT EXISTS idx_anonymous_pages_expires_at ON anonymous_pages(expires_at);
CREATE INDEX IF NOT EXISTS idx_anonymous_submissions_page_id ON anonymous_submissions(page_id);

-- Create function to clean up expired pages and submissions
CREATE OR REPLACE FUNCTION cleanup_expired_anonymous_data()
RETURNS void AS $$
BEGIN
  -- Delete expired submissions first (due to foreign key)
  DELETE FROM anonymous_submissions 
  WHERE page_id IN (
    SELECT id FROM anonymous_pages 
    WHERE expires_at < NOW()
  );
  
  -- Delete expired pages
  DELETE FROM anonymous_pages 
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to generate unique public link
CREATE OR REPLACE FUNCTION generate_unique_public_link()
RETURNS TEXT AS $$
DECLARE
  new_link TEXT;
  link_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 6 character alphanumeric link
    new_link := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 6));
    
    -- Check if link already exists
    SELECT EXISTS(SELECT 1 FROM anonymous_pages WHERE public_link = new_link) INTO link_exists;
    
    -- Exit loop if unique
    IF NOT link_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_link;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS set_public_link_trigger ON anonymous_pages;

CREATE OR REPLACE FUNCTION set_public_link_and_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.public_link IS NULL THEN
    NEW.public_link := generate_unique_public_link();
  END IF;
  
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NOW() + INTERVAL '48 hours';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_public_link_trigger
  BEFORE INSERT ON anonymous_pages
  FOR EACH ROW
  EXECUTE FUNCTION set_public_link_and_expiry();

-- Add analytics tracking table for anonymous pages
CREATE TABLE IF NOT EXISTS anonymous_page_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES anonymous_pages(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'share', 'message_sent'
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE anonymous_page_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for analytics (admin only view)
CREATE POLICY "Admins can view analytics" ON anonymous_page_analytics
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Policy for inserting analytics (service role)
CREATE POLICY "Service can insert analytics" ON anonymous_page_analytics
  FOR INSERT
  WITH CHECK (true);