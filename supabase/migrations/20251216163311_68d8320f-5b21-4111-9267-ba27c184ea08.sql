-- Fix Missing RLS Policies for Payments and Tickets Tables

-- ============================================
-- PAYMENTS TABLE SECURITY
-- ============================================

-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Anyone can view payments" ON payments;
DROP POLICY IF EXISTS "Public can view payments" ON payments;
DROP POLICY IF EXISTS "Service role creates payments" ON payments;
DROP POLICY IF EXISTS "Service role updates payments" ON payments;

-- Users can view their own payments (only if not already exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Users view own payments'
  ) THEN
    CREATE POLICY "Users view own payments" ON payments
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Admins can view all payments
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Admins view all payments for management'
  ) THEN
    CREATE POLICY "Admins view all payments for management" ON payments
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM user_roles 
          WHERE user_id = auth.uid() 
          AND role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================
-- TICKETS TABLE SECURITY
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can verify valid tickets" ON tickets;
DROP POLICY IF EXISTS "Users can insert tickets for events" ON tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON tickets;

-- Users can view their own tickets by email
CREATE POLICY "Users view own tickets by email" ON tickets
  FOR SELECT 
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Event organizers can view tickets for their events
CREATE POLICY "Organizers view event tickets" ON tickets
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = tickets.event_id 
      AND e.created_by = auth.uid()
    )
  );

-- Admins can view all tickets
CREATE POLICY "Admins view all tickets" ON tickets
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow ticket status updates for owners, organizers, and admins
CREATE POLICY "Update ticket status" ON tickets
  FOR UPDATE 
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = tickets.event_id 
      AND e.created_by = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );