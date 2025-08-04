-- First ensure we have a unique constraint on provider field
ALTER TABLE public.payment_gateways ADD CONSTRAINT payment_gateways_provider_unique UNIQUE (provider);

-- Insert default payment gateway configurations with proper conflict handling
INSERT INTO public.payment_gateways (
  provider,
  mode,
  public_key,
  secret_key,
  enabled,
  business_name,
  webhook_url
) VALUES 
(
  'flutterwave',
  'test',
  'FLWPUBK_TEST-000000000000000-X',
  'FLWSECK_TEST-000000000000000-X',
  true,
  'COOU Events',
  'https://hhcitezdbueybdtslkth.supabase.co/functions/v1/verify-payment'
),
(
  'korapay',
  'test',
  'pk_test_000000000000000000000000',
  'sk_test_000000000000000000000000',
  true,
  'COOU Events',
  'https://hhcitezdbueybdtslkth.supabase.co/functions/v1/verify-payment'
),
(
  'paystack',
  'test',
  'pk_test_000000000000000000000000',
  'sk_test_000000000000000000000000',
  true,
  'COOU Events',
  'https://hhcitezdbueybdtslkth.supabase.co/functions/v1/verify-payment'
)
ON CONFLICT (provider) DO UPDATE SET
  enabled = EXCLUDED.enabled,
  business_name = EXCLUDED.business_name,
  webhook_url = EXCLUDED.webhook_url;