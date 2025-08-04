
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  link?: string;
  target_audience?: string[];
  created_by?: string;
}

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notifications.',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        const filteredNotifications = data.filter((notification) => {
          if (!notification.target_audience || notification.target_audience.length === 0) {
            return true;
          }
          // TODO: Replace 'userRole' with the actual way to get the user's role
          // const userRole = getUserRole();
          // return notification.target_audience.includes(userRole);
          return true;
        });
        setNotifications(filteredNotifications as NotificationProps[]);
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load notifications.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Alert key={notification.id} variant={notification.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>
            <strong className="block font-medium">{notification.title}</strong>
            {notification.message}
            {notification.link && (
              <a href={notification.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                Learn more
              </a>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export default Notifications;
