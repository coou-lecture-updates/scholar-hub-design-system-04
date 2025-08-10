-- Add missing title column to events table to match application code
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT '';

-- Performance: index by event_date for faster sorting/filtering
CREATE INDEX IF NOT EXISTS idx_events_event_date ON public.events (event_date);
