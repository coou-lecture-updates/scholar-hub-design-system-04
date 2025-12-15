import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { UserBioPopover } from './UserBioPopover';
import { cn } from '@/lib/utils';

interface ActiveUser {
  id: string;
  full_name: string;
  role?: string;
}

export const ActiveUsersRow: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        // Get users who posted in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: recentMessages } = await supabase
          .from('community_messages')
          .select('user_id')
          .not('user_id', 'is', null)
          .eq('is_anonymous', false)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (!recentMessages || recentMessages.length === 0) {
          setLoading(false);
          return;
        }

        // Get unique user IDs (limit to 15)
        const uniqueUserIds = [...new Set(recentMessages.map(m => m.user_id))].slice(0, 15);

        // Fetch user details
        const { data: usersData } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', uniqueUserIds);

        // Fetch roles for these users
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', uniqueUserIds);

        const usersWithRoles = (usersData || []).map(user => ({
          ...user,
          role: rolesData?.find(r => r.user_id === user.id)?.role || 'student',
        }));

        setActiveUsers(usersWithRoles);
      } catch (error) {
        console.error('Error fetching active users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveUsers();
  }, []);

  if (loading || activeUsers.length === 0) return null;

  return (
    <div className="py-3">
      <p className="text-xs font-medium text-muted-foreground mb-2 px-1">Active this week</p>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-1">
          {activeUsers.map((user) => (
            <UserBioPopover
              key={user.id}
              userId={user.id}
              userName={user.full_name}
              userRole={user.role}
            >
              <button className="flex flex-col items-center gap-1 group">
                <div className="relative">
                  <Avatar className={cn(
                    "h-12 w-12 ring-2 ring-primary/20 transition-all group-hover:ring-primary group-hover:scale-105"
                  )}>
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                      {user.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                </div>
                <span className="text-xs text-muted-foreground truncate max-w-[60px] group-hover:text-foreground transition-colors">
                  {user.full_name.split(' ')[0]}
                </span>
              </button>
            </UserBioPopover>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
