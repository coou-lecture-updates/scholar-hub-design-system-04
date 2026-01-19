-- Add unique constraint for payment_gateways upsert to work properly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_gateways_provider_mode_key'
  ) THEN
    ALTER TABLE public.payment_gateways 
    ADD CONSTRAINT payment_gateways_provider_mode_key UNIQUE (provider, mode);
  END IF;
END $$;

-- Normalize existing provider names to lowercase
UPDATE public.payment_gateways 
SET provider = LOWER(provider) 
WHERE provider != LOWER(provider);