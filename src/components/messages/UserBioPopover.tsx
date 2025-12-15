import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Heart, ExternalLink, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserBioPopoverProps {
  userId: string;
  userName: string;
  userRole?: string;
  children: React.ReactNode;
}

interface UserBioData {
  full_name: string;
  bio: string | null;
  created_at: string;
}

interface UserStats {
  posts: number;
  reactions: number;
}

export const UserBioPopover: React.FC<UserBioPopoverProps> = ({
  userId,
  userName,
  userRole = 'student',
  children,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [bioData, setBioData] = useState<UserBioData | null>(null);
  const [stats, setStats] = useState<UserStats>({ posts: 0, reactions: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserBio = async () => {
      if (!open || !userId) return;
      
      setLoading(true);
      try {
        // Fetch user info (bio may not exist yet in DB)
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, created_at')
          .eq('id', userId)
          .single();

        if (userData) {
          // Try to get bio separately (gracefully handle if column doesn't exist)
          const { data: bioData } = await supabase
            .from('users')
            .select('bio')
            .eq('id', userId)
            .single();
          
          setBioData({
            full_name: userData.full_name,
            bio: (bioData as any)?.bio || null,
            created_at: userData.created_at,
          });
        }

        // Fetch quick stats
        const { count: postsCount } = await supabase
          .from('community_messages')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .is('parent_id', null);

        const { data: messagesData } = await supabase
          .from('community_messages')
          .select('id')
          .eq('user_id', userId);

        let reactionsCount = 0;
        if (messagesData && messagesData.length > 0) {
          const messageIds = messagesData.map(m => m.id);
          const { count } = await supabase
            .from('message_reactions')
            .select('*', { count: 'exact', head: true })
            .in('message_id', messageIds);
          reactionsCount = count || 0;
        }

        setStats({
          posts: postsCount || 0,
          reactions: reactionsCount,
        });
      } catch (error) {
        console.error('Error fetching user bio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBio();
  }, [open, userId]);

  const getRoleBadgeStyle = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-primary text-primary-foreground',
      moderator: 'bg-secondary text-secondary-foreground',
      course_rep: 'bg-accent text-accent-foreground',
      student: 'bg-muted text-muted-foreground',
    };
    return styles[role] || styles.student;
  };

  const formatRole = (role: string) => {
    if (role === 'course_rep') return 'Course Rep';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">{bioData?.full_name || userName}</h4>
              <Badge className={cn('text-xs mt-1', getRoleBadgeStyle(userRole))}>
                {formatRole(userRole)}
              </Badge>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-3">
            {loading ? (
              <div className="h-12 animate-pulse bg-muted rounded" />
            ) : bioData?.bio ? (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {bioData.bio}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No bio yet
              </p>
            )}
          </div>

          <Separator className="my-3" />

          {/* Stats */}
          <div className="flex items-center justify-around text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">{stats.posts}</span>
              </div>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Heart className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">{stats.reactions}</span>
              </div>
              <p className="text-xs text-muted-foreground">Reactions</p>
            </div>
          </div>

          <Separator className="my-3" />

          {/* View Profile Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => {
              setOpen(false);
              navigate(`/user/${userId}`);
            }}
          >
            <User className="h-4 w-4" />
            View Full Profile
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
