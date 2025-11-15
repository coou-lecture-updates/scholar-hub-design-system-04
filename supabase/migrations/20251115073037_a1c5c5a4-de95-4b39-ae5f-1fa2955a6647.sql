-- Add image support to community messages
ALTER TABLE community_messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create message ads table
CREATE TABLE IF NOT EXISTS message_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES community_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('native', 'banner', 'slider')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT NOT NULL,
  link_preview_data JSONB,
  cost DECIMAL NOT NULL DEFAULT 1000,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ad settings table
CREATE TABLE IF NOT EXISTS ad_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_cost_native DECIMAL DEFAULT 1000,
  ad_cost_banner DECIMAL DEFAULT 1000,
  ad_cost_slider DECIMAL DEFAULT 1000,
  min_wallet_balance DECIMAL DEFAULT 0,
  max_ads_per_user INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default ad settings
INSERT INTO ad_settings (ad_cost_native, ad_cost_banner, ad_cost_slider)
VALUES (1000, 1000, 1000)
ON CONFLICT DO NOTHING;

-- Create storage buckets for message images and ad images
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-images', 'message-images', true)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('ad-images', 'ad-images', true)
ON CONFLICT DO NOTHING;

-- RLS policies for message_ads
ALTER TABLE message_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active ads"
ON message_ads FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create their own ads"
ON message_ads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ads"
ON message_ads FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ads"
ON message_ads FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for ad_settings (admin only)
ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view ad settings"
ON ad_settings FOR SELECT
USING (true);

-- Storage policies for message-images
CREATE POLICY "Users can upload message images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'message-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view message images"
ON storage.objects FOR SELECT
USING (bucket_id = 'message-images');

CREATE POLICY "Users can delete their own message images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'message-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for ad-images
CREATE POLICY "Users can upload ad images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ad-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view ad images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-images');

CREATE POLICY "Users can delete their own ad images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ad-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Trigger to update message_ads updated_at
CREATE OR REPLACE FUNCTION update_message_ads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER message_ads_updated_at
BEFORE UPDATE ON message_ads
FOR EACH ROW
EXECUTE FUNCTION update_message_ads_updated_at();