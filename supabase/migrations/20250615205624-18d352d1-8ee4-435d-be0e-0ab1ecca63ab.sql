
-- Create payment_gateways table for production-grade payment config
CREATE TABLE public.payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- e.g., 'Flutterwave', 'Korapay', 'Paystack'
  enabled BOOLEAN DEFAULT FALSE NOT NULL,
  mode TEXT DEFAULT 'test' NOT NULL, -- 'test' or 'live'
  public_key TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  encryption_key TEXT, -- nullable for gateways that need it
  merchant_id TEXT,     -- nullable for those who need it
  business_name TEXT,
  webhook_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on this table!
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Allow only admins to SELECT/INSERT/UPDATE/DELETE (you likely want this just for admins)
CREATE POLICY "Admins manage payment gateways"
  ON public.payment_gateways
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
