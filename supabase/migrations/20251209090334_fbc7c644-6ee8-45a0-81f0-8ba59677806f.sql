-- Add expires_at column to message_ads table
ALTER TABLE public.message_ads 
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT NULL;

-- Add duration_days column to track the selected duration
ALTER TABLE public.message_ads 
ADD COLUMN IF NOT EXISTS duration_days integer DEFAULT 7;

-- Create index for efficient expired ad filtering
CREATE INDEX IF NOT EXISTS idx_message_ads_expires_at ON public.message_ads(expires_at);

-- Update existing ads to have a default expiry of 7 days from creation
UPDATE public.message_ads 
SET expires_at = created_at + interval '7 days',
    duration_days = 7
WHERE expires_at IS NULL;