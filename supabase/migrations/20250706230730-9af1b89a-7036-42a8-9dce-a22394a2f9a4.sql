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

-- Enhance events table RLS for moderator wallet checks
DROP POLICY IF EXISTS "Enhanced moderator event creation with wallet check" ON public.events;
CREATE POLICY "Enhanced moderator event creation with wallet check" ON public.events
FOR INSERT WITH CHECK (
  -- Check if user is moderator
  (get_current_user_role() = ANY(ARRAY['admin'::text, 'moderator'::text])) AND
  -- For paid events, check wallet balance
  (
    (ticket_price = 0 OR ticket_price IS NULL) OR -- Free events
    (
      ticket_price > 0 AND 
      EXISTS (
        SELECT 1 FROM public.wallets 
        WHERE user_id = auth.uid() 
        AND balance >= (
          SELECT COALESCE(
            (SELECT value::numeric FROM public.system_settings WHERE key = 'event_creation_fee'), 
            2000
          )
        )
      )
    )
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
  ('event_creation_fee', '2000', 'Fee charged to moderators for creating paid events')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_analytics_event_id ON public.event_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON public.wallet_transactions(user_id);

-- Create comprehensive admin analytics view
CREATE OR REPLACE VIEW public.admin_analytics AS
SELECT 
  u.id as user_id,
  u.email,
  u.full_name,
  ur.role,
  w.balance as wallet_balance,
  COUNT(e.id) as total_events,
  COUNT(CASE WHEN e.ticket_price > 0 THEN 1 END) as paid_events,
  COALESCE(SUM(ea.revenue), 0) as total_revenue,
  COALESCE(SUM(ea.tickets_sold), 0) as total_tickets_sold
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.wallets w ON u.id = w.user_id
LEFT JOIN public.events e ON u.id = e.created_by
LEFT JOIN public.event_analytics ea ON e.id = ea.event_id
GROUP BY u.id, u.email, u.full_name, ur.role, w.balance;

-- Grant access to admin analytics view
GRANT SELECT ON public.admin_analytics TO authenticated;

-- Create RLS policy for admin analytics view
CREATE POLICY "Admins can view analytics" ON public.admin_analytics
FOR SELECT USING (get_current_user_role() = 'admin');