-- 1) Create anonymous_pages table for tokenized anonymous messaging pages
CREATE TABLE IF NOT EXISTS public.anonymous_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  page_name text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and policies on anonymous_pages
ALTER TABLE public.anonymous_pages ENABLE ROW LEVEL SECURITY;

-- Allow public read access (token is not secret data; submissions remain protected separately)
DROP POLICY IF EXISTS "Public can view anonymous pages" ON public.anonymous_pages;
CREATE POLICY "Public can view anonymous pages"
ON public.anonymous_pages
FOR SELECT
USING (true);

-- Admins can manage anonymous pages
DROP POLICY IF EXISTS "Admins can manage anonymous pages" ON public.anonymous_pages;
CREATE POLICY "Admins can manage anonymous pages"
ON public.anonymous_pages
FOR ALL
USING (public.get_current_user_role() = 'admin');

-- Helpful index for quick lookup by token
CREATE INDEX IF NOT EXISTS idx_anonymous_pages_token ON public.anonymous_pages(page_token);

-- 2) Link anonymous_submissions.page_id to anonymous_pages.id (if not already linked)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_anonymous_submissions_page'
  ) THEN
    ALTER TABLE public.anonymous_submissions
    ADD CONSTRAINT fk_anonymous_submissions_page
    FOREIGN KEY (page_id) REFERENCES public.anonymous_pages(id)
    ON DELETE CASCADE;
  END IF;
END
$$;

-- 3) Ensure wallet balance stays in sync after transactions insert
DROP TRIGGER IF EXISTS tr_wallet_balance_on_insert ON public.wallet_transactions;
CREATE TRIGGER tr_wallet_balance_on_insert
AFTER INSERT ON public.wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_wallet_balance();

-- 4) Deduct event creation fee from creator wallet for paid events
DROP TRIGGER IF EXISTS tr_event_creation_fee ON public.events;
CREATE TRIGGER tr_event_creation_fee
AFTER INSERT ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.handle_event_creation_fee();