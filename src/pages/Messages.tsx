import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MessageInput } from '@/components/messages/MessageInput';
import { MessageList } from '@/components/messages/MessageList';
import { FilterPanel } from '@/components/messages/FilterPanel';
import { AnnouncementBanner } from '@/components/messages/AnnouncementBanner';
import { Message } from '@/components/messages/MessageItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Bell } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user roles
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (data) {
        setUserRoles(data.map(r => r.role));
      }
    };

    fetchUserRoles();
  }, [user]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: messagesData, error } = await supabase
        .from('community_messages')
        .select('*')
        .is('parent_id', null)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch additional data for each message
      const formattedMessages = await Promise.all((messagesData || []).map(async (msg) => {
        // Fetch user info
        let users = null;
        if (msg.user_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('full_name, email')
            .eq('id', msg.user_id)
            .single();
          users = userData;
        }

        // Fetch user roles
        let user_roles: Array<{ role: string }> = [];
        if (msg.user_id) {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', msg.user_id);
          user_roles = rolesData || [];
        }

        // Fetch reactions
        const { data: reactionsData } = await supabase
          .from('message_reactions')
          .select('*')
          .eq('message_id', msg.id);

        // Fetch reply count
        const { count: replyCount } = await supabase
          .from('community_messages')
          .select('*', { count: 'exact', head: true })
          .eq('parent_id', msg.id);

        return {
          ...msg,
          users,
          user_roles,
          reactions: reactionsData || [],
          reply_count: replyCount || 0,
        };
      }));

      setMessages(formattedMessages as Message[]);

      // Calculate unread count
      if (user) {
        const { data: readStatus } = await supabase
          .from('message_read_status')
          .select('message_id')
          .eq('user_id', user.id);

        const readIds = new Set(readStatus?.map(r => r.message_id) || []);
        const unread = formattedMessages.filter(m => !readIds.has(m.id)).length;
        setUnreadCount(unread);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('community_messages_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_messages' }, () => {
        fetchMessages();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, () => {
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  const handleSendMessage = async (content: string, isAnonymous: boolean, topic?: string, parentId?: string) => {
    if (!user && !isAnonymous) {
      toast({
        title: 'Error',
        description: 'Please log in to send messages',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('community_messages').insert({
        user_id: isAnonymous ? null : user?.id,
        content,
        is_anonymous: isAnonymous,
        topic,
        parent_id: parentId,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message sent successfully',
      });

      setReplyingTo(null);
      fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleReact = async (messageId: string, reactionType: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to react to messages',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if already reacted
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .single();

      if (existing) {
        // Remove reaction
        await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id);
      } else {
        // Add reaction
        await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            reaction_type: reactionType,
          });
      }

      fetchMessages();
    } catch (error: any) {
      console.error('Error reacting:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Message deleted successfully',
      });

      fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handlePin = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_pinned: !message.is_pinned })
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: message.is_pinned ? 'Message unpinned' : 'Message pinned',
      });

      fetchMessages();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to pin message',
        variant: 'destructive',
      });
    }
  };

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    if (searchQuery && !msg.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedTopic !== 'all' && msg.topic !== selectedTopic) {
      return false;
    }
    if (selectedRole !== 'all') {
      if (selectedRole === 'anonymous' && !msg.is_anonymous) return false;
      if (selectedRole !== 'anonymous' && !msg.user_roles?.some(r => r.role === selectedRole)) return false;
    }
    return true;
  });

  // Sort messages
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else {
      // popular
      return (b.reactions?.length || 0) - (a.reactions?.length || 0);
    }
  });

  const pinnedMessages = sortedMessages.filter(m => m.is_pinned);
  const regularMessages = sortedMessages.filter(m => !m.is_pinned);
  const topics = Array.from(new Set(messages.map(m => m.topic).filter(Boolean))) as string[];

  const replyingMessage = messages.find(m => m.id === replyingTo);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageCircle className="h-8 w-8" />
              Community Messages
            </h1>
            <p className="text-muted-foreground mt-1">Connect with students and staff</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <Bell className="h-3 w-3" />
              {unreadCount} unread
            </Badge>
          )}
        </div>

        <AnnouncementBanner announcements={pinnedMessages} />

        <FilterPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          topics={topics}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedTopic('all');
            setSelectedRole('all');
            setSortBy('recent');
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MessageList
              messages={regularMessages}
              loading={loading}
              currentUserId={user?.id}
              currentUserRoles={userRoles}
              onReply={setReplyingTo}
              onReact={handleReact}
              onDelete={handleDelete}
              onPin={handlePin}
            />

            <MessageInput onSend={handleSendMessage} />
          </CardContent>
        </Card>

        {/* Reply Dialog */}
        <Dialog open={!!replyingTo} onOpenChange={(open) => !open && setReplyingTo(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reply to Message</DialogTitle>
            </DialogHeader>
            {replyingMessage && (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">
                    {replyingMessage.is_anonymous ? 'Anonymous' : replyingMessage.users?.full_name}
                  </p>
                  <p className="text-muted-foreground">{replyingMessage.content}</p>
                </div>
                <MessageInput
                  onSend={handleSendMessage}
                  parentId={replyingTo || undefined}
                  placeholder="Write your reply..."
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
