-- Create a table for message bookmarks
CREATE TABLE public.message_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

-- Enable Row Level Security
ALTER TABLE public.message_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own bookmarks" 
ON public.message_bookmarks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
ON public.message_bookmarks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
ON public.message_bookmarks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_message_bookmarks_user_id ON public.message_bookmarks(user_id);
CREATE INDEX idx_message_bookmarks_message_id ON public.message_bookmarks(message_id);