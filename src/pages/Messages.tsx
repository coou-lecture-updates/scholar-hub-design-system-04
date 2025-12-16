import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/auth/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBookmarks } from '@/hooks/useBookmarks';
import { MessageInput } from '@/components/messages/MessageInput';
import { MessageList } from '@/components/messages/MessageList';
import { FilterPanel } from '@/components/messages/FilterPanel';
import { AnnouncementBanner } from '@/components/messages/AnnouncementBanner';
import { ThreadedReplies } from '@/components/messages/ThreadedReplies';
import { TrendingTopics } from '@/components/messages/TrendingTopics';
import { Message } from '@/components/messages/MessageItem';
import { NativeAdCard } from '@/components/messages/NativeAdCard';
import { BannerAdCarousel } from '@/components/messages/BannerAdCarousel';
import { AdStatistics } from '@/components/messages/AdStatistics';
import { AdCreationDialog } from '@/components/messages/AdCreationDialog';
import { ActiveUsersRow } from '@/components/messages/ActiveUsersRow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Plus, Users, MessageCircle, Sparkles, Bookmark } from 'lucide-react';

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { bookmarkedIds, toggleBookmark, isBookmarked } = useBookmarks();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showSaved, setShowSaved] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nativeAds, setNativeAds] = useState<any[]>([]);
  const [bannerAds, setBannerAds] = useState<any[]>([]);
  const [showAdStats, setShowAdStats] = useState(false);
  const [showAdCreate, setShowAdCreate] = useState(false);

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

  // Fetch ads (only active and non-expired)
  const fetchAds = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      
      const { data: nativeAdsData } = await supabase
        .from('message_ads')
        .select('*')
        .eq('ad_type', 'native')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: bannerAdsData } = await supabase
        .from('message_ads')
        .select('*')
        .eq('ad_type', 'banner')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false })
        .limit(5);

      setNativeAds(nativeAdsData || []);
      setBannerAds(bannerAdsData || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

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

  const handleSendMessage = async (content: string, isAnonymous: boolean, topic?: string, parentId?: string, imageUrl?: string, videoUrl?: string) => {
    if (!user && !isAnonymous) {
      toast({
        title: 'Error',
        description: 'Please log in to send messages',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Moderate content before posting
      const { data: moderationResult, error: moderationError } = await supabase.functions.invoke('moderate-content', {
        body: { content }
      });

      if (moderationError) {
        console.error('Moderation check failed:', moderationError);
        // Continue posting if moderation fails (fail open)
      } else if (moderationResult && !moderationResult.safe) {
        toast({
          title: 'Content Not Allowed',
          description: `Your message was blocked: ${moderationResult.reason || 'Inappropriate content detected'}`,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('community_messages').insert({
        user_id: isAnonymous ? null : user?.id,
        content,
        is_anonymous: isAnonymous,
        topic,
        parent_id: parentId,
        image_url: imageUrl || null,
        video_url: videoUrl || null,
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
    if (showSaved && !bookmarkedIds.has(msg.id)) {
      return false;
    }
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
  
  // Calculate trending topics with counts
  const trendingTopics = topics.map(topic => ({
    name: topic,
    count: messages.filter(m => m.topic === topic).length
  })).sort((a, b) => b.count - a.count);

  const replyingMessage = messages.find(m => m.id === replyingTo);

  // Stats for header
  const totalMessages = messages.length;
  const todayMessages = messages.filter(m => {
    const msgDate = new Date(m.created_at);
    const today = new Date();
    return msgDate.toDateString() === today.toDateString();
  }).length;

  // Sidebar visibility state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] w-full md:max-w-7xl md:mx-auto">
        {/* Enhanced Header */}
        <div className="flex-none bg-gradient-to-b from-card to-background border-b border-border/50 sticky top-0 z-40">
          <div className="px-4 md:px-6 pt-4 pb-3">
            {/* Title Section */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Community Forum</h1>
                  <p className="text-xs text-muted-foreground">Connect with fellow students</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="gap-1.5"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">{sidebarOpen ? 'Hide' : 'Show'} Info</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/saved-messages')}
                  className="gap-1.5"
                >
                  <Bookmark className="h-4 w-4" />
                  {bookmarkedIds.size > 0 && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                      {bookmarkedIds.size}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAdCreate(true)}
                  className="gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Ad</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdStats(true)}
                  className="gap-1.5"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">My Ads</span>
                </Button>
              </div>
            </div>

            {/* Pinned Announcements */}
            {pinnedMessages.length > 0 && (
              <div className="mb-3">
                <AnnouncementBanner announcements={pinnedMessages} />
              </div>
            )}

            {/* Filter Panel */}
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
              showSaved={showSaved}
              onShowSavedChange={setShowSaved}
              savedCount={bookmarkedIds.size}
              onClearFilters={() => {
                setSearchQuery('');
                setSelectedTopic('all');
                setSelectedRole('all');
                setSortBy('recent');
                setShowSaved(false);
              }}
            />

            {/* Banner Ads */}
            {bannerAds.length > 0 && (
              <div className="mt-3">
                <BannerAdCarousel ads={bannerAds} />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area with Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-4 pb-28 md:pb-32">
            <div className="space-y-3">
              {regularMessages.map((message, index) => (
                <div key={message.id} className="space-y-3">
                  <MessageList
                    messages={[message]}
                    loading={false}
                    currentUserId={user?.id}
                    currentUserRoles={userRoles}
                    onReply={setReplyingTo}
                    onReact={handleReact}
                    onDelete={handleDelete}
                    onPin={handlePin}
                    onBookmark={toggleBookmark}
                    isBookmarked={isBookmarked}
                  />

                  {/* Inject native ad every 5 messages */}
                  {(index + 1) % 5 === 0 && nativeAds[Math.floor(index / 5)] && (
                    <NativeAdCard ad={nativeAds[Math.floor(index / 5)]} />
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-sm">Loading messages...</p>
                </div>
              )}

              {!loading && regularMessages.length === 0 && (
                <Card className="p-8 text-center border-dashed">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <h3 className="font-medium mb-1">No messages yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Be the first to start a conversation!</p>
                </Card>
              )}
            </div>
          </div>

          {/* Collapsible Info Sidebar */}
          {sidebarOpen && (
            <div className="hidden md:block w-80 border-l border-border overflow-y-auto bg-background">
              <div className="p-4 space-y-4 sticky top-0">
                {/* Quick Stats */}
                <Card className="bg-card border-0 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-foreground">{totalMessages}</span>
                      <span className="text-muted-foreground">posts</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium text-foreground">{todayMessages}</span>
                      <span className="text-muted-foreground">today</span>
                    </div>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary w-full justify-center">
                        {unreadCount} new messages
                      </Badge>
                    )}
                  </CardContent>
                </Card>

                {/* Active Users */}
                <Card className="bg-card border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Active This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <ActiveUsersRow />
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                {trendingTopics.length > 0 && (
                  <Card className="bg-card border-0 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Trending Topics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <TrendingTopics
                        topics={trendingTopics}
                        selectedTopic={selectedTopic}
                        onTopicSelect={setSelectedTopic}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Message Input */}
        <div className="fixed bottom-16 md:bottom-0 left-0 md:left-64 right-0 border-t border-border bg-card/98 backdrop-blur-md shadow-2xl z-40">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-3">
            <MessageInput onSend={handleSendMessage} />
          </div>
        </div>

        {/* Threaded Replies Dialog */}
        {replyingMessage && (
          <ThreadedReplies
            parentMessage={replyingMessage}
            isOpen={!!replyingTo}
            onClose={() => setReplyingTo(null)}
            currentUserId={user?.id}
            currentUserRoles={userRoles}
          />
        )}
        
        {/* Ad Statistics Dialog */}
        <AdStatistics
          open={showAdStats}
          onClose={() => setShowAdStats(false)}
        />
        
        {/* Ad Creation Dialog */}
        <AdCreationDialog
          open={showAdCreate}
          onClose={() => setShowAdCreate(false)}
          onAdCreated={() => {
            fetchAds();
            setShowAdCreate(false);
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Messages;
