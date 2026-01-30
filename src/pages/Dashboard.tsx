import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RealUserStats from '@/components/dashboard/RealUserStats';
import UserLevelNotifications from '@/components/dashboard/UserLevelNotifications';
import CreateEventCTA from '@/components/dashboard/CreateEventCTA';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentActivity from '@/components/dashboard/RecentActivity';
import UpcomingDeadlines from '@/components/dashboard/UpcomingDeadlines';
import { Loader2, BookOpen, Calendar, FileText, MessageSquare, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import UserProfileInfo from '@/components/dashboard/UserProfileInfo';
import UserRoleDisplay from '@/components/dashboard/UserRoleDisplay';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  totalLectures: number;
  totalExams: number;
  messages: number;
  events: number;
}

const Dashboard = () => {
  const { userProfile, refreshProfile, user, profileLoading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalLectures: 0,
    totalExams: 0,
    messages: 0,
    events: 0,
  });
  const [loading, setLoading] = useState(true);
  const hasLoadedStats = useRef(false);

  useEffect(() => {
    if (!user) return;
    refreshProfile?.();
  }, [user]);

  useEffect(() => {
    if (!userProfile || hasLoadedStats.current) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const lecturePromise =
          userProfile.level && userProfile.department && userProfile.faculty && userProfile.campus
            ? supabase.from('lectures')
                .select('*', { count: 'exact', head: true })
                .eq('level', userProfile.level)
                .eq('department', userProfile.department)
                .eq('faculty', userProfile.faculty)
                .eq('campus', userProfile.campus)
            : Promise.resolve({ count: 0 });
        const examsPromise =
          userProfile.level && userProfile.department
            ? supabase.from('exams')
                .select('*', { count: 'exact', head: true })
                .eq('level', userProfile.level)
                .eq('department', userProfile.department)
            : Promise.resolve({ count: 0 });
        const messagesPromise = supabase.from('community_messages').select('*', { count: 'exact', head: true }).is('parent_id', null);
        const eventsPromise = supabase.from('events').select('*', { count: 'exact', head: true }).eq('published', true);

        const [lecturesResult, examsResult, messagesResult, eventsResult] = await Promise.all([
          lecturePromise, examsPromise, messagesPromise, eventsPromise
        ]);

        if (!cancelled) {
          setAnalytics({
            totalLectures: lecturesResult.count || 0,
            totalExams: examsResult.count || 0,
            messages: messagesResult.count || 0,
            events: eventsResult.count || 0,
          });
          setLoading(false);
          hasLoadedStats.current = true;
        }
      } catch (e) {
        setLoading(false);
        hasLoadedStats.current = true;
        console.error('Error fetching analytics:', e);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [userProfile]);

  if (profileLoading && !userProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              No profile data found.<br />Please check your account settings.
            </p>
            <a
              href="/user-settings"
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Go to Profile Settings
            </a>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const levelLabel = (() => {
    const raw = userProfile?.level ?? user?.user_metadata?.level;
    const found = [100,200,300,400,500,600,700].includes(Number(raw));
    return found ? `${raw} Level` : 'Not provided';
  })();

  const userInfo = [
    { 
      label: 'Full Name', 
      value: userProfile?.full_name || user?.user_metadata?.full_name || 'Not provided',
      icon: <User className="h-4 w-4" />
    },
    { 
      label: 'Email', 
      value: userProfile?.email || user?.email || 'Not provided',
      icon: <MessageSquare className="h-4 w-4" />
    },
    { 
      label: 'Campus', 
      value: userProfile?.campus || user?.user_metadata?.campus || 'Not provided',
      icon: <BookOpen className="h-4 w-4" />
    },
    { 
      label: 'Faculty', 
      value: userProfile?.faculty || user?.user_metadata?.faculty || 'Not provided',
      icon: <BookOpen className="h-4 w-4" />
    },
    { 
      label: 'Department', 
      value: userProfile?.department || user?.user_metadata?.department || 'Not provided',
      icon: <BookOpen className="h-4 w-4" />
    },
    { 
      label: 'Level', 
      value: levelLabel,
      icon: <Calendar className="h-4 w-4" />
    }
  ];

  const stats = [
    {
      title: 'Total Lectures',
      value: analytics.totalLectures,
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Total Exams',
      value: analytics.totalExams,
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200'
    },
    {
      title: 'Messages',
      value: analytics.messages,
      icon: <MessageSquare className="h-6 w-6 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200'
    },
    {
      title: 'Events',
      value: analytics.events,
      icon: <Calendar className="h-6 w-6 text-pink-600" />,
      color: 'bg-pink-50 border-pink-200'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-3">
        <DashboardHeader fullName={userProfile?.full_name} />
        
        <QuickActions />
        
        <CreateEventCTA />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RecentActivity />
          <UpcomingDeadlines />
        </div>
        
        <UserProfileInfo userInfo={userInfo} />
        <UserRoleDisplay />
        <DashboardStats stats={stats} loading={loading} />
        <RealUserStats />
        <UserLevelNotifications />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
