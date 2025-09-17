-- Fix security issues: Add search_path to new functions
CREATE OR REPLACE FUNCTION cleanup_expired_anonymous_data()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix search_path for unique link generation function
CREATE OR REPLACE FUNCTION generate_unique_public_link()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix search_path for trigger function
CREATE OR REPLACE FUNCTION set_public_link_and_expiry()
RETURNS TRIGGER 
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