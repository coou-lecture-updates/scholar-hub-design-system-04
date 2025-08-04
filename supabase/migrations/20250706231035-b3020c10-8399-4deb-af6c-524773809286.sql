-- Create event analytics table if not exists
CREATE TABLE IF NOT EXISTS public.event_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  tickets_sold INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on event_analytics
ALTER TABLE public.event_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event_analytics
CREATE POLICY "Admins can manage all event analytics" ON public.event_analytics
FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Moderators can view their event analytics" ON public.event_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE events.id = event_analytics.event_id 
    AND events.created_by = auth.uid()
  )
);

-- Create function to handle event creation fee deduction
CREATE OR REPLACE FUNCTION public.handle_event_creation_fee()
RETURNS TRIGGER AS $$
DECLARE
  creation_fee NUMERIC;
BEGIN
  -- Get the event creation fee from settings (default 2000)
  SELECT COALESCE(
    (SELECT value::numeric FROM public.system_settings WHERE key = 'event_creation_fee'), 
    2000
  ) INTO creation_fee;
  
  -- Only deduct fee for paid events created by moderators
  IF NEW.ticket_price > 0 AND NEW.created_by IS NOT NULL THEN
    -- Check if user has sufficient balance first
    IF EXISTS (
      SELECT 1 FROM public.wallets 
      WHERE user_id = NEW.created_by AND balance >= creation_fee
    ) THEN
      -- Deduct fee from wallet
      UPDATE public.wallets 
      SET balance = balance - creation_fee, updated_at = now()
      WHERE user_id = NEW.created_by;
      
      -- Log the transaction
      INSERT INTO public.wallet_transactions (
        user_id, 
        amount, 
        type, 
        description, 
        reference
      ) VALUES (
        NEW.created_by,
        -creation_fee,
        'debit',
        'Event creation fee for: ' || NEW.title,
        'EVENT_FEE_' || NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for event creation fee
DROP TRIGGER IF EXISTS event_creation_fee_trigger ON public.events;
CREATE TRIGGER event_creation_fee_trigger
  AFTER INSERT ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_event_creation_fee();

-- Insert default system settings for event management
INSERT INTO public.system_settings (key, value, description) 
VALUES 
  ('event_creation_fee', '2000', 'Fee charged to moderators for creating paid events'),
  ('site_name', 'COOU Portal', 'Site name for branding'),
  ('site_description', 'Official COOU Student Portal', 'Site description for SEO'),
  ('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
  ('google_analytics_id', '', 'Google Analytics tracking ID')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_analytics_event_id ON public.event_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);