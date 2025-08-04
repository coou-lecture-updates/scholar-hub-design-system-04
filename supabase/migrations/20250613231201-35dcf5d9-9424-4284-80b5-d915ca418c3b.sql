
-- Add payment provider configuration
CREATE TABLE payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flutterwave', 'korapay')),
  is_active BOOLEAN DEFAULT true,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enhanced tickets table with QR codes and recovery
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS qr_code TEXT UNIQUE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS recovery_token TEXT UNIQUE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Payment transactions for tracking
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  provider TEXT NOT NULL,
  provider_reference TEXT,
  webhook_data JSONB,
  status TEXT DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Analytics data collection
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID,
  session_id TEXT,
  data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Advanced system configuration
CREATE TABLE system_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(category, key)
);

-- RLS policies
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;

-- Admin only policies for payment providers
CREATE POLICY "Admins can manage payment providers" ON payment_providers
  FOR ALL USING (get_current_user_role() = 'admin');

-- Payment transactions viewable by admins and payment owners
CREATE POLICY "Payment transaction access" ON payment_transactions
  FOR SELECT USING (
    get_current_user_role() = 'admin' OR 
    EXISTS (SELECT 1 FROM payments WHERE payments.id = payment_transactions.payment_id AND payments.user_id = auth.uid())
  );

-- Analytics events for admins only
CREATE POLICY "Admins can view analytics" ON analytics_events
  FOR ALL USING (get_current_user_role() = 'admin');

-- System configurations for admins only
CREATE POLICY "Admins can manage system config" ON system_configurations
  FOR ALL USING (get_current_user_role() = 'admin');

-- Update tickets table with QR code generation trigger
CREATE OR REPLACE FUNCTION generate_ticket_qr_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.qr_code := 'QR_' || UPPER(SUBSTRING(MD5(NEW.id::text || now()::text) FROM 1 FOR 12));
  NEW.recovery_token := UPPER(SUBSTRING(MD5(NEW.id::text || 'recovery' || now()::text) FROM 1 FOR 16));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ticket_qr_code_trigger
  BEFORE INSERT ON tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_qr_code();

-- Enhanced departments foreign key constraint
ALTER TABLE departments ADD CONSTRAINT fk_departments_faculty 
  FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE;
