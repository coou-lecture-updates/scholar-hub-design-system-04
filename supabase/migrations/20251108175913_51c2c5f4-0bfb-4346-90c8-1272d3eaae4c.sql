-- Enhanced messaging system with threads, reactions, mentions, and pinning

-- Drop existing messages table and recreate with enhanced features
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create enhanced community messages table
CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES public.community_messages(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  topic text,
  mentions text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  edited_at timestamp with time zone
);

-- Create message reactions table
CREATE TABLE public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.community_messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL, -- 'like', 'heart', 'fire', 'laugh', 'sad', 'thinking'
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(message_id, user_id, reaction_type)
);

-- Create read status tracking table
CREATE TABLE public.message_read_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES public.community_messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_messages

-- Anyone can view messages
CREATE POLICY "Anyone can view community messages"
  ON public.community_messages
  FOR SELECT
  USING (true);

-- Authenticated users can create messages
CREATE POLICY "Authenticated users can create messages"
  ON public.community_messages
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR is_anonymous = true);

-- Users can update their own messages (within 15 mins)
CREATE POLICY "Users can edit own messages"
  ON public.community_messages
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    AND created_at > now() - interval '15 minutes'
  );

-- Admins can manage all messages
CREATE POLICY "Admins can manage all messages"
  ON public.community_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admins and moderators can pin messages
CREATE POLICY "Admins can pin messages"
  ON public.community_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON public.community_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for message_reactions

-- Anyone can view reactions
CREATE POLICY "Anyone can view reactions"
  ON public.message_reactions
  FOR SELECT
  USING (true);

-- Authenticated users can add reactions
CREATE POLICY "Users can add reactions"
  ON public.message_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Users can remove own reactions"
  ON public.message_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for message_read_status

-- Users can view their own read status
CREATE POLICY "Users can view own read status"
  ON public.message_read_status
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark messages as read
CREATE POLICY "Users can mark messages read"
  ON public.message_read_status
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_community_messages_user_id ON public.community_messages(user_id);
CREATE INDEX idx_community_messages_parent_id ON public.community_messages(parent_id);
CREATE INDEX idx_community_messages_created_at ON public.community_messages(created_at DESC);
CREATE INDEX idx_community_messages_topic ON public.community_messages(topic);
CREATE INDEX idx_community_messages_pinned ON public.community_messages(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_message_read_status_user_id ON public.message_read_status(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_community_message_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    NEW.edited_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamps
CREATE TRIGGER update_community_messages_updated_at
  BEFORE UPDATE ON public.community_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_community_message_updated_at();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_read_status;