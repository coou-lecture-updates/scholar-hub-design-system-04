-- Create a comprehensive ticket system for events
CREATE TABLE IF NOT EXISTS public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL DEFAULT 'general',
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  quantity_total INTEGER NOT NULL DEFAULT 100,
  quantity_sold INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on event_tickets
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view active tickets
CREATE POLICY "Anyone can view active tickets" ON public.event_tickets
FOR SELECT USING (is_active = true);

-- Only admins can manage tickets
CREATE POLICY "Admins can manage tickets" ON public.event_tickets
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('blog-images', 'blog-images', true),
  ('event-images', 'event-images', true),
  ('lost-found-images', 'lost-found-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for blog images
CREATE POLICY "Blog images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' AND 
  auth.role() = 'authenticated'
);

-- Create storage policies for event images  
CREATE POLICY "Event images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Authenticated users can upload event images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'event-images' AND 
  auth.role() = 'authenticated'
);

-- Create storage policies for lost and found images
CREATE POLICY "Lost and found images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'lost-found-images');

CREATE POLICY "Authenticated users can upload lost and found images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'lost-found-images' AND 
  auth.role() = 'authenticated'
);

-- Update events table to support ticket integration
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_tickets INTEGER DEFAULT NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS requires_tickets BOOLEAN DEFAULT false;