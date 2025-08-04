
-- Add required columns to the users table if missing
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS reg_number TEXT;

-- Ensure other columns you need exist (most already do)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS campus TEXT,
  ADD COLUMN IF NOT EXISTS faculty TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS level INTEGER;

-- Optionally, ensure full_name is present
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Optionally, ensure role column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update triggers or default values if necessary
ALTER TABLE public.users
  ALTER COLUMN updated_at SET DEFAULT now(),
  ALTER COLUMN created_at SET DEFAULT now();
