import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  type: string;
}

const AnnouncementsTicker: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, content, priority, type')
        .eq('is_published', true)
        .gte('expires_at', new Date().toISOString())
        .order('priority', { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        setAnnouncements(data);
      }
    };

    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0) return null;

  const current = announcements[currentIndex];
  const priorityColors = {
    high: 'bg-destructive text-destructive-foreground',
    medium: 'bg-primary text-primary-foreground',
    low: 'bg-secondary text-secondary-foreground',
  };

  return (
    <div className={`w-full py-2 px-4 ${priorityColors[current.priority as keyof typeof priorityColors] || priorityColors.medium}`}>
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Bell className="h-4 w-4 flex-shrink-0 animate-pulse" />
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-semibold text-sm whitespace-nowrap">{current.title}:</span>
            <span className="text-sm truncate">{current.content}</span>
          </div>
        </div>
        <Link 
          to="/announcements" 
          className="flex items-center gap-1 text-sm font-medium hover:underline whitespace-nowrap"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      {announcements.length > 1 && (
        <div className="flex justify-center gap-1 mt-1">
          {announcements.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 w-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white w-4' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementsTicker;
