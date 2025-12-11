
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Calendar, MessageSquare, Bell, Users } from 'lucide-react';

interface UserStats {
  upcomingLectures: number;
  unreadMessages: number;
  activeNotifications: number;
  departmentCourses: number;
  upcomingEvents: number;
}

const RealUserStats: React.FC = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    upcomingLectures: 0,
    unreadMessages: 0,
    activeNotifications: 0,
    departmentCourses: 0,
    upcomingEvents: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      fetchUserStats();
    }
  }, [userProfile]);

  const fetchUserStats = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      const userId = userProfile.id;
      const userLevel = userProfile.level;
      const userDepartment = userProfile.department;
      const userFaculty = userProfile.faculty;

      // Get upcoming lectures for user's level, department, and faculty
      const { count: lecturesCount } = await supabase
        .from('lectures')
        .select('*', { count: 'exact', head: true })
        .eq('level', userLevel)
        .eq('department', userDepartment)
        .eq('faculty', userFaculty);

      // Get unread community messages for the user
      const { count: messagesCount } = await supabase
        .from('community_messages')
        .select('*', { count: 'exact', head: true })
        .is('parent_id', null);

      // Get active notifications for user's level/department
      const userTargets = ['all', userLevel?.toString(), userDepartment, userFaculty].filter(Boolean);
      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .overlaps('target_audience', userTargets)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString());

      // Get courses for user's department and level
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', userDepartment)
        .eq('level', userLevel);

      // Get upcoming events
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)
        .gte('event_date', new Date().toISOString());

      setStats({
        upcomingLectures: lecturesCount || 0,
        unreadMessages: messagesCount || 0,
        activeNotifications: notificationsCount || 0,
        departmentCourses: coursesCount || 0,
        upcomingEvents: eventsCount || 0
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Upcoming Lectures',
      value: stats.upcomingLectures,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Active Notifications',
      value: stats.activeNotifications,
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Department Courses',
      value: stats.departmentCourses,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            {userProfile && (
              <p className="text-xs text-muted-foreground mt-1">
                Level {userProfile.level} • {userProfile.department}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RealUserStats;
