-- Enable RLS on party_orders table
ALTER TABLE public.party_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for party_orders
CREATE POLICY "Users can view their own orders" 
ON public.party_orders 
FOR SELECT 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can view all orders" 
ON public.party_orders 
FOR ALL 
USING (get_current_user_role() = 'admin');

CREATE POLICY "Service can create orders" 
ON public.party_orders 
FOR INSERT 
WITH CHECK (true);

-- Enable RLS on resumes table  
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for resumes
CREATE POLICY "Users can manage their own resumes" 
ON public.resumes 
FOR ALL 
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admins can view all resumes" 
ON public.resumes 
FOR SELECT 
USING (get_current_user_role() = 'admin');