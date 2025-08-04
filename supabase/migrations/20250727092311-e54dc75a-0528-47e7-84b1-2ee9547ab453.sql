-- Fix wallet RLS policies to allow users to create and manage their own wallets
DROP POLICY IF EXISTS "Users can view their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;
DROP POLICY IF EXISTS "Admins can view all wallets" ON public.wallets;

-- Create comprehensive wallet policies
CREATE POLICY "Users can create their own wallet" 
ON public.wallets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own wallet" 
ON public.wallets 
FOR SELECT 
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

CREATE POLICY "Users can update their own wallet" 
ON public.wallets 
FOR UPDATE 
USING (auth.uid() = user_id OR get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all wallets" 
ON public.wallets 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Add wallet update trigger to automatically update wallet balance when transactions are made
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update wallet balance when transaction is inserted
  IF TG_OP = 'INSERT' THEN
    UPDATE public.wallets 
    SET balance = balance + NEW.amount,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Create wallet if it doesn't exist
    IF NOT FOUND THEN
      INSERT INTO public.wallets (user_id, balance)
      VALUES (NEW.user_id, GREATEST(0, NEW.amount))
      ON CONFLICT (user_id) DO UPDATE SET
        balance = wallets.balance + NEW.amount,
        updated_at = now();
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for wallet balance updates
DROP TRIGGER IF EXISTS wallet_balance_update_trigger ON public.wallet_transactions;
CREATE TRIGGER wallet_balance_update_trigger
  AFTER INSERT ON public.wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();