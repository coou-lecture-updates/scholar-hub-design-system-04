import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageItem, Message } from './MessageItem';
import { MessageInput } from './MessageInput';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ThreadedRepliesProps {
  parentMessage: Message;
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: string;
  currentUserRoles?: string[];
}

export const ThreadedReplies: React.FC<ThreadedRepliesProps> = ({
  parentMessage,
  isOpen,
  onClose,
  currentUserId,
  currentUserRoles = [],
}) => {
  const { toast } = useToast();
  const [replies, setReplies] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && parentMessage) {
      fetchReplies();
    }
  }, [isOpen, parentMessage]);

  const fetchReplies = async () => {
    setLoading(true);
    try {
      const { data: repliesData, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('parent_id', parentMessage.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedReplies = await Promise.all((repliesData || []).map(async (msg) => {
        let users = null;
        if (msg.user_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', msg.user_id)
            .single();
          users = userData;
        }

        let user_roles: Array<{ role: string }> = [];
        if (msg.user_id) {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', msg.user_id);
          user_roles = rolesData || [];
        }

        const { data: reactionsData } = await supabase
          .from('message_reactions')
          .select('*')
          .eq('message_id', msg.id);

        return {
          ...msg,
          users,
          user_roles,
          reactions: reactionsData || [],
        };
      }));

      setReplies(formattedReplies as Message[]);
    } catch (error: any) {
      console.error('Error fetching replies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load replies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (content: string, isAnonymous: boolean) => {
    if (!currentUserId && !isAnonymous) {
      toast({
        title: 'Error',
        description: 'Please log in to send replies',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('community_messages').insert({
        user_id: isAnonymous ? null : currentUserId,
        content,
        is_anonymous: isAnonymous,
        parent_id: parentMessage.id,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Reply sent successfully',
      });

      fetchReplies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reply',
        variant: 'destructive',
      });
    }
  };

  const handleReact = async (messageId: string, reactionType: string) => {
    if (!currentUserId) {
      toast({
        title: 'Error',
        description: 'Please log in to react',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', currentUserId)
        .eq('reaction_type', reactionType)
        .single();

      if (existing) {
        await supabase.from('message_reactions').delete().eq('id', existing.id);
      } else {
        await supabase.from('message_reactions').insert({
          message_id: messageId,
          user_id: currentUserId,
          reaction_type: reactionType,
        });
      }

      fetchReplies();
    } catch (error: any) {
      console.error('Error reacting:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Reply deleted successfully',
      });

      fetchReplies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete reply',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Thread: {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 border-b bg-muted/30">
          <MessageItem
            message={parentMessage}
            currentUserId={currentUserId}
            currentUserRoles={currentUserRoles}
            onReply={() => {}}
            onReact={handleReact}
            onDelete={handleDelete}
            showReplies={false}
          />
        </div>

        <ScrollArea className="flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : replies.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">No replies yet</p>
                <p className="text-sm">Be the first to reply!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <MessageItem
                  key={reply.id}
                  message={reply}
                  currentUserId={currentUserId}
                  currentUserRoles={currentUserRoles}
                  onReply={() => {}}
                  onReact={handleReact}
                  onDelete={handleDelete}
                  showReplies={false}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-background">
          <MessageInput
            onSend={handleSendReply}
            placeholder="Write your reply..."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
