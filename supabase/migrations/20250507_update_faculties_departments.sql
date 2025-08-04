
-- Add campus field to faculties table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                  WHERE table_schema='public' AND table_name='faculties' AND column_name='campus') THEN
        ALTER TABLE public.faculties ADD COLUMN campus TEXT;
    END IF;
END
$$;

-- Add campus field to departments table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                  WHERE table_schema='public' AND table_name='departments' AND column_name='campus') THEN
        ALTER TABLE public.departments ADD COLUMN campus TEXT;
    END IF;
END
$$;

-- Add anonymous_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.anonymous_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_email TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Grant RLS permissions on anonymous_messages
ALTER TABLE public.anonymous_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous_messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'anonymous_messages' 
        AND policyname = 'Users can view their own anonymous messages'
    ) THEN
        CREATE POLICY "Users can view their own anonymous messages" 
        ON public.anonymous_messages 
        FOR SELECT 
        USING (auth.jwt() IS NOT NULL AND sender_email = current_setting('request.jwt.claims', true)::json->>'email');
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'anonymous_messages' 
        AND policyname = 'Users can create their own anonymous messages'
    ) THEN
        CREATE POLICY "Users can create their own anonymous messages" 
        ON public.anonymous_messages 
        FOR INSERT 
        WITH CHECK (auth.jwt() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'anonymous_messages' 
        AND policyname = 'Users can delete their own anonymous messages'
    ) THEN
        CREATE POLICY "Users can delete their own anonymous messages" 
        ON public.anonymous_messages 
        FOR DELETE 
        USING (auth.jwt() IS NOT NULL AND sender_email = current_setting('request.jwt.claims', true)::json->>'email');
    END IF;
END
$$;
