-- Fix tickets table RLS policies to allow ticket purchases
CREATE POLICY "Users can insert tickets for events" 
ON public.tickets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own tickets" 
ON public.tickets 
FOR UPDATE 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Fix the event creation fee function to use the correct price field
CREATE OR REPLACE FUNCTION public.handle_event_creation_fee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  creation_fee NUMERIC;
BEGIN
  -- Get the event creation fee from settings (default 2000)
  SELECT COALESCE(
    (SELECT value::numeric FROM public.system_settings WHERE key = 'event_creation_fee'), 
    2000
  ) INTO creation_fee;
  
  -- Only deduct fee for paid events created by moderators
  -- Use both price and ticket_price for compatibility
  IF (COALESCE(NEW.price, 0) > 0 OR COALESCE(NEW.ticket_price, 0) > 0) AND NEW.created_by IS NOT NULL THEN
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
        reference,
        event_id
      ) VALUES (
        NEW.created_by,
        creation_fee,
        'debit',
        'Event creation fee for: ' || NEW.title,
        'EVENT_FEE_' || NEW.id,
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;