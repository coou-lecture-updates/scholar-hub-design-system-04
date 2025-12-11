
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Calendar, BookOpen, Users } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  target_audience: string[];
  created_at: string;
  link?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  target_audience: string[];
  created_at: string;
  priority: string;
}

const UserLevelNotifications: React.FC = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile) {
      fetchUserSpecificContent();
    }
  }, [userProfile]);

  const fetchUserSpecificContent = async () => {
    if (!userProfile) return;

    setLoading(true);
    try {
      const userLevel = userProfile.level?.toString() || 'all';
      const userDepartment = userProfile.department || 'all';
      const userFaculty = userProfile.faculty || 'all';
      const userCampus = userProfile.campus || 'all';

      // Fetch notifications targeted to user's level, department, faculty, or all
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .or(`target_audience.cs.{all},target_audience.cs.{${userLevel}},target_audience.cs.{${userDepartment}},target_audience.cs.{${userFaculty}},target_audience.cs.{${userCampus}}`)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
      } else {
        setNotifications(notificationsData || []);
      }

      // Fetch announcements targeted to user's level, department, faculty, or all
      const { data: announcementsData, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .or(`target_audience.cs.{all},target_audience.cs.{${userLevel}},target_audience.cs.{${userDepartment}},target_audience.cs.{${userFaculty}},target_audience.cs.{${userCampus}}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (announcementsError) {
        console.error('Error fetching announcements:', announcementsError);
      } else {
        setAnnouncements(announcementsData || []);
      }

    } catch (error) {
      console.error('Error fetching user-specific content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <BookOpen className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'administrative':
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="text-blue-600 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-foreground">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements */}
      {announcements.length > 0 && (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Important Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground">{announcement.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant={getPriorityColor(announcement.priority)}>
                          {announcement.priority} priority
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {announcement.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {notifications.length === 0 && announcements.length === 0 && (
        <Card className="bg-card">
          <CardContent className="text-center py-8">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No notifications for your level at this time.</p>
            <p className="text-sm text-muted-foreground">
              {userProfile?.level && `Showing content for Level ${userProfile.level}`}
              {userProfile?.department && `, ${userProfile.department} Department`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserLevelNotifications;
