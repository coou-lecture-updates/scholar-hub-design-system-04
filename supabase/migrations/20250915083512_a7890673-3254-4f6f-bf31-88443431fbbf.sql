-- Add public_link field to anonymous_pages table and set up 48-hour expiration
ALTER TABLE anonymous_pages 
ADD COLUMN public_link TEXT UNIQUE,
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '48 hours');

-- Generate short random public links for existing records
UPDATE anonymous_pages 
SET public_link = SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6),
    expires_at = (now() + interval '48 hours')
WHERE public_link IS NULL;

-- Create function to generate short random link
CREATE OR REPLACE FUNCTION generate_short_link()
RETURNS TEXT AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate public_link on insert
CREATE OR REPLACE FUNCTION set_public_link()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_set_public_link 
  BEFORE INSERT ON anonymous_pages 
  FOR EACH ROW EXECUTE FUNCTION set_public_link();