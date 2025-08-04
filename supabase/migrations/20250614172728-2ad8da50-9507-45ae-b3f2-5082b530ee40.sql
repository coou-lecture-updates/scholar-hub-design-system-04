
-- Add gallery (text[]) and slug (text) columns to events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS gallery text[] DEFAULT ARRAY[]::text[];

ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS slug text;

-- Optionally, set NOT NULL if you want, but here allowing nulls/default
