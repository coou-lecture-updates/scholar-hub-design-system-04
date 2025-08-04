import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { handleAdminError } from '@/utils/adminErrorHandler';
import { 
  BarChart,
  PieChart,
  Calendar,
  Settings,
  Users,
  BookOpen,
  ClipboardList,
  MessageCircle,
  FileText,
  Share2,
  Bell,
  GraduationCap,
  Shield
} from 'lucide-react';

type AdminStats = {
  users: number;
  blogPosts: number;
  events: number;
  courses: number;
  messages: number;
  faculties: number;
  departments: number;
  roles: number;
};

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { hasAccess, userRole, loading: accessLoading } = useAdminAccess();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    users: 0,
    blogPosts: 0,
    events: 0,
    courses: 0,
    messages: 0,
    faculties: 0,
    departments: 0,
    roles: 0
  });

  useEffect(() => {
    if (!accessLoading) {
      if (!hasAccess) {
        navigate('/unauthorized');
        return;
      }
      fetchStats();
    }
    // eslint-disable-next-line
  }, [hasAccess, accessLoading]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch all stats in parallel, always getting real DB data
      const [
        { count: userCount },
        { count: blogCount },
        { count: eventCount },
        { count: courseCount },
        { count: messageCount },
        { count: facultiesCount },
        { count: departmentsCount },
        { count: rolesCount }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('faculties').select('*', { count: 'exact', head: true }),
        supabase.from('departments').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        users: userCount || 0,
        blogPosts: blogCount || 0,
        events: eventCount || 0,
        courses: courseCount || 0,
        messages: messageCount || 0,
        faculties: facultiesCount || 0,
        departments: departmentsCount || 0,
        roles: rolesCount || 0
      });

    } catch (error) {
      handleAdminError(error, 'Fetch Dashboard Statistics');
    } finally {
      setLoading(false);
    }
  };

  // Only real data (no fake entries)
  const adminModules = [
    {
      title: 'Users',
      description: 'Manage user accounts and permissions',
      icon: <Users className="h-8 w-8 text-blue-600" />,
      path: '/admin/users',
      count: stats.users,
      requiredRole: 'admin' as const
    },
    {
      title: 'Blog Posts',
      description: 'Create and manage blog content',
      icon: <FileText className="h-8 w-8 text-indigo-600" />,
      path: '/admin/blogs',
      count: stats.blogPosts,
      requiredRole: 'moderator' as const
    },
    {
      title: 'Events',
      description: 'Schedule and manage campus events',
      icon: <Calendar className="h-8 w-8 text-green-600" />,
      path: '/admin/events',
      count: stats.events,
      requiredRole: 'moderator' as const
    },
    {
      title: 'Courses',
      description: 'Manage course information and materials',
      icon: <BookOpen className="h-8 w-8 text-yellow-600" />,
      path: '/admin/courses',
      count: stats.courses,
      requiredRole: 'moderator' as const
    },
    {
      title: 'Faculties & Departments',
      description: 'Manage faculties and departments',
      icon: <GraduationCap className="h-8 w-8 text-purple-600" />,
      path: '/admin/faculties',
      count: `${stats.faculties} / ${stats.departments}`,
      requiredRole: 'admin' as const
    },
    {
      title: 'Exam Management',
      description: 'Schedule and manage exams',
      icon: <ClipboardList className="h-8 w-8 text-red-600" />,
      path: '/admin/exams',
      requiredRole: 'moderator' as const
    },
    {
      title: 'Community',
      description: 'Manage external community platforms',
      icon: <Share2 className="h-8 w-8 text-purple-600" />,
      path: '/admin/community',
      requiredRole: 'moderator' as const
    },
    {
      title: 'Messages',
      description: 'View and respond to contact messages',
      icon: <MessageCircle className="h-8 w-8 text-blue-600" />,
      path: '/admin/messages',
      count: stats.messages,
      requiredRole: 'moderator' as const
    },
    {
      title: 'Notifications',
      description: 'Send announcements and alerts',
      icon: <Bell className="h-8 w-8 text-orange-600" />,
      path: '/admin/notifications',
      requiredRole: 'moderator' as const
    },
    {
      title: 'Settings',
      description: 'Configure system settings and preferences',
      icon: <Settings className="h-8 w-8 text-gray-600" />,
      path: '/admin/settings',
      requiredRole: 'admin' as const
    }
  ];

  // Only show modules the user can actually access
  const hasModuleAccess = (requiredRole: 'admin' | 'moderator') => {
    if (!userRole) return false;
    const roleHierarchy = { 'user': 1, 'course_rep': 2, 'moderator': 3, 'admin': 4 };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };
  const accessibleModules = adminModules.filter(module => 
    hasModuleAccess(module.requiredRole)
  );

  if (accessLoading || loading) {
    return (
      <DashboardLayout role="admin">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!hasAccess) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-2 md:px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-y-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">
              Welcome back, {userProfile?.full_name || 'Admin'} 
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {userRole?.toUpperCase()}
              </span>
            </p>
          </div>
          {/* Top Buttons: "New Campaign" removed as requested */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => navigate('/admin/analytics')}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button
              variant="outline"
              className="flex items-center"
              onClick={() => navigate('/admin/reports')}
            >
              <PieChart className="mr-2 h-4 w-4" />
              Reports
            </Button>
            {/* The "New Campaign" button was here -- REMOVED */}
          </div>
        </div>
        {/* Stats grid - enhanced responsiveness */}
        <div className="w-full overflow-x-auto pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 min-w-[450px]">
            <div className="flex flex-col bg-blue-50 p-3 rounded-lg font-medium shadow-sm min-w-[110px]">
              <span className="text-xs text-gray-600">Users</span>
              <span className="text-xl font-bold">{stats.users}</span>
            </div>
            <div className="flex flex-col bg-green-50 p-3 rounded-lg font-medium shadow-sm min-w-[110px]">
              <span className="text-xs text-gray-600">Blog Posts</span>
              <span className="text-xl font-bold">{stats.blogPosts}</span>
            </div>
            <div className="flex flex-col bg-yellow-50 p-3 rounded-lg font-medium shadow-sm min-w-[110px]">
              <span className="text-xs text-gray-600">Events</span>
              <span className="text-xl font-bold">{stats.events}</span>
            </div>
            <div className="flex flex-col bg-purple-50 p-3 rounded-lg font-medium shadow-sm min-w-[110px]">
              <span className="text-xs text-gray-600">Courses</span>
              <span className="text-xl font-bold">{stats.courses}</span>
            </div>
            <div className="flex flex-col bg-pink-50 p-3 rounded-lg font-medium shadow-sm min-w-[110px]">
              <span className="text-xs text-gray-600">Faculties</span>
              <span className="text-xl font-bold">{stats.faculties}</span>
            </div>
            <div className="flex flex-col bg-orange-50 p-3 rounded-lg font-medium shadow-sm min-w-[110px]">
              <span className="text-xs text-gray-600">Departments</span>
              <span className="text-xl font-bold">{stats.departments}</span>
            </div>
          </div>
        </div>
        {/* Module Cards grid, responsive and scrollable on mobile */}
        <div className="mt-6 w-full overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-w-[320px]">
            {accessibleModules.map((module, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow min-w-[280px]">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="bg-blue-50 p-3 rounded-lg">{module.icon}</div>
                    {typeof module.count !== 'undefined' && (
                      <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                        {module.count}
                      </div>
                    )}
                  </div>
                  <CardTitle className="mt-4">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full mt-2 hover:bg-blue-50"
                    onClick={() => navigate(module.path)}
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
