import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Heart, ThumbsUp, Flame, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/components/messages/MessageItem';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  bio?: string | null;
}

interface UserStats {
  totalPosts: number;
  totalReactions: number;
  totalReplies: number;
}

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [stats, setStats] = useState<UserStats>({ totalPosts: 0, totalReactions: 0, totalReplies: 0 });
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        setLoading(true);

        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, full_name, email, created_at')
          .eq('id', userId)
          .single();

        if (userError) throw userError;

        // Try to get bio separately (graceful fallback if column doesn't exist)
        let bio = null;
        try {
          const { data: bioData } = await supabase
            .from('users')
            .select('bio')
            .eq('id', userId)
            .single();
          bio = (bioData as any)?.bio || null;
        } catch (e) {
          // Bio column may not exist yet
        }

        setProfile({ ...userData, bio });

        // Fetch user roles
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (rolesData) {
          setUserRoles(rolesData.map(r => r.role));
        }

        // Fetch user's messages
        const { data: messagesData } = await supabase
          .from('community_messages')
          .select('*')
          .eq('user_id', userId)
          .is('parent_id', null)
          .order('created_at', { ascending: false })
          .limit(50);

        if (messagesData) {
          // Fetch reactions for each message
          const formattedMessages = await Promise.all(messagesData.map(async (msg) => {
            const { data: reactionsData } = await supabase
              .from('message_reactions')
              .select('*')
              .eq('message_id', msg.id);

            const { count: replyCount } = await supabase
              .from('community_messages')
              .select('*', { count: 'exact', head: true })
              .eq('parent_id', msg.id);

            return {
              ...msg,
              users: userData,
              user_roles: rolesData || [],
              reactions: reactionsData || [],
              reply_count: replyCount || 0,
            };
          }));

          setMessages(formattedMessages as Message[]);

          // Calculate stats
          const totalReactions = formattedMessages.reduce((acc, msg) => acc + (msg.reactions?.length || 0), 0);
          const { count: totalReplies } = await supabase
            .from('community_messages')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .not('parent_id', 'is', null);

          setStats({
            totalPosts: messagesData.length,
            totalReactions,
            totalReplies: totalReplies || 0,
          });
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">User not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-primary text-primary-foreground',
      moderator: 'bg-secondary text-secondary-foreground',
      course_rep: 'bg-accent text-accent-foreground',
      student: 'bg-muted text-muted-foreground',
    };

    return (
      <Badge className={roleColors[role] || roleColors.student}>
        {role === 'course_rep' ? 'Course Rep' : role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {profile.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">{profile.full_name}</h1>
                <div className="flex flex-wrap gap-2 mb-2">
                  {userRoles.map(role => getRoleBadge(role))}
                </div>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mb-2">{profile.bio}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Member since {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <p className="text-2xl font-bold">{stats.totalReactions}</p>
              <p className="text-sm text-muted-foreground">Reactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-accent-foreground" />
              <p className="text-2xl font-bold">{stats.totalReplies}</p>
              <p className="text-sm text-muted-foreground">Replies</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No posts yet</p>
            ) : (
              <div className="space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.topic && (
                        <Badge variant="outline" className="text-xs">
                          #{message.topic}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{message.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {message.reactions?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {message.reply_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
