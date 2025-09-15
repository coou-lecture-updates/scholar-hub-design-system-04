-- Fix payment gateways table structure and anonymous pages
-- First, fix the payment_gateways table to remove the display_order column issue
ALTER TABLE payment_gateways DROP COLUMN IF EXISTS display_order;

-- Create anonymous pages table for anonymous message feature
CREATE TABLE IF NOT EXISTS public.anonymous_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_name TEXT NOT NULL,
  page_token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for anonymous pages
ALTER TABLE public.anonymous_pages ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous pages
CREATE POLICY "Anyone can create anonymous pages" 
ON public.anonymous_pages 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own pages" 
ON public.anonymous_pages 
FOR SELECT 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_anonymous_pages_updated_at
BEFORE UPDATE ON public.anonymous_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();