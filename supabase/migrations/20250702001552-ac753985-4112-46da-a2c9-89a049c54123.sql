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

-- Enable RLS on event_tickets (safe if already enabled)
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('blog-images', 'blog-images', true),
  ('event-images', 'event-images', true),
  ('lost-found-images', 'lost-found-images', true)
ON CONFLICT (id) DO NOTHING;

-- Update events table to support ticket integration
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_tickets INTEGER DEFAULT NULL;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS ticket_price DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS requires_tickets BOOLEAN DEFAULT false;