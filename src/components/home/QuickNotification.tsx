
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { X, Calendar, Users, BookOpen, AlertCircle, Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  target_audience: string[];
  start_date: string;
  end_date: string;
}

const notificationTypes = ['info', 'warning', 'success', 'error'];

const QuickNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString())
        .lte('start_date', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      const validData = (data || []).map((item: any) => ({
        ...item,
        type: (notificationTypes.includes(item.type) ? item.type : 'info') as Notification['type'],
      }));
      setNotifications(validData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const activeNotifications = notifications.filter(n => !dismissed.includes(n.id));
    
    if (activeNotifications.length > 1) {
      const interval = setInterval(() => {
        setIsSliding(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % activeNotifications.length);
          setIsSliding(false);
        }, 300);
      }, 4000);
      
      return () => clearInterval(interval);
    }
  }, [notifications.length, dismissed]);

  const handleDismiss = (notificationId: string) => {
    setDismissed(prev => [...prev, notificationId]);
    
    const activeNotifications = notifications.filter(n => !dismissed.includes(n.id) && n.id !== notificationId);
    if (activeNotifications.length > 0) {
      setCurrentIndex(0);
    }
  };

  if (loading) {
    return <div className="h-24"></div>;
  }

  const activeNotifications = notifications.filter(n => !dismissed.includes(n.id));
  
  if (activeNotifications.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-full">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">Latest Updates</h3>
              <Badge variant="default" className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                0 New
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <div className="p-2 bg-blue-50 rounded-full">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 text-sm">All Caught Up!</h4>
              <p className="text-gray-600 text-sm">No new notifications at the moment.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentNotification = activeNotifications[currentIndex % activeNotifications.length];

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'success': return <Calendar className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">Latest Updates</h3>
              <Badge variant="default" className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {activeNotifications.length} New
              </Badge>
            </div>
          </div>
          {activeNotifications.length > 1 && (
            <div className="flex space-x-1">
              {activeNotifications.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index === currentIndex % activeNotifications.length ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        
        <div 
          className={`transition-all duration-500 ease-in-out ${
            isSliding ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'
          }`}
        >
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getIcon(currentNotification.type)}
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{currentNotification.title}</h4>
                <p className="text-gray-600 text-sm">{currentNotification.message}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {new Date(currentNotification.start_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDismiss(currentNotification.id)}
              className="h-8 w-8 p-0 hover:bg-gray-200"
            >
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickNotification;
