import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useBookmarks } from '@/hooks/useBookmarks';
import PageSEO from '@/components/seo/PageSEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Bookmark, Search, MessageSquare, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface BookmarkedMessage {
  id: string;
  content: string;
  topic: string | null;
  is_anonymous: boolean;
  created_at: string;
  user_id: string | null;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  } | null;
  bookmarked_at: string;
}

const SavedMessages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const [messages, setMessages] = useState<BookmarkedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarkedMessages = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('message_bookmarks')
          .select('message_id, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (bookmarksError) throw bookmarksError;

        if (!bookmarks || bookmarks.length === 0) {
          setMessages([]);
          setLoading(false);
          return;
        }

        const messageIds = bookmarks.map(b => b.message_id);
        const bookmarkDates = Object.fromEntries(
          bookmarks.map(b => [b.message_id, b.created_at])
        );

        const { data: messagesData, error: messagesError } = await supabase
          .from('community_messages')
          .select(`
            id,
            content,
            topic,
            is_anonymous,
            created_at,
            user_id,
            profiles:user_id (
              full_name,
              avatar_url
            )
          `)
          .in('id', messageIds);

        if (messagesError) throw messagesError;

        const enrichedMessages = (messagesData || []).map(msg => ({
          ...msg,
          profiles: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles,
          bookmarked_at: bookmarkDates[msg.id]
        }));

        // Sort by bookmark date
        enrichedMessages.sort((a, b) => 
          new Date(b.bookmarked_at).getTime() - new Date(a.bookmarked_at).getTime()
        );

        setMessages(enrichedMessages);
      } catch (error) {
        console.error('Error fetching bookmarked messages:', error);
        toast.error('Failed to load saved messages');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedMessages();
  }, [user]);

  const handleRemoveBookmark = async (messageId: string) => {
    await toggleBookmark(messageId);
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  // Get unique topics
  const topics = [...new Set(messages.filter(m => m.topic).map(m => m.topic as string))];

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = !searchQuery || 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = !selectedTopic || msg.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#EFF4FA] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Login Required</h2>
            <p className="text-muted-foreground mb-4">
              Please login to view your saved messages.
            </p>
            <Button onClick={() => navigate('/login')}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PageSEO 
        title="Saved Messages | CoouConnect"
        description="View and manage your bookmarked messages"
      />
      
      <div className="min-h-screen bg-[#EFF4FA]">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/messages')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-primary" />
                Saved Messages
              </h1>
              <p className="text-muted-foreground text-sm">
                {messages.length} saved {messages.length === 1 ? 'message' : 'messages'}
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search saved messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {topics.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={selectedTopic === null ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTopic(null)}
                    >
                      All
                    </Button>
                    {topics.map(topic => (
                      <Button
                        key={topic}
                        variant={selectedTopic === topic ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTopic(topic)}
                      >
                        {topic}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {messages.length === 0 ? 'No saved messages yet' : 'No messages match your search'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {messages.length === 0 
                    ? 'Bookmark messages from the community to save them here for later.'
                    : 'Try adjusting your search or filters.'}
                </p>
                <Button onClick={() => navigate('/messages')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Browse Messages
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map(message => (
                <Card key={message.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Author Info */}
                        <div className="flex items-center gap-2 mb-2">
                          {message.is_anonymous ? (
                            <span className="text-sm text-muted-foreground">Anonymous</span>
                          ) : (
                            <span className="text-sm font-medium">
                              {message.profiles?.full_name || 'Unknown User'}
                            </span>
                          )}
                          {message.topic && (
                            <Badge variant="secondary" className="text-xs">
                              {message.topic}
                            </Badge>
                          )}
                        </div>

                        {/* Content */}
                        <p className="text-foreground mb-3 line-clamp-3">
                          {message.content}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Posted {format(new Date(message.created_at), 'MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bookmark className="h-3 w-3" />
                            Saved {format(new Date(message.bookmarked_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveBookmark(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate('/messages')}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SavedMessages;
