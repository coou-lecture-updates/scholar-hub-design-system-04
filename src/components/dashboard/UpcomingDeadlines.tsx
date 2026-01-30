import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/useAuth';
import { format, differenceInDays } from 'date-fns';
import { Clock, Calendar, FileText, AlertTriangle } from 'lucide-react';

interface Deadline {
  id: string;
  title: string;
  type: 'exam' | 'event' | 'deadline';
  date: string;
  daysLeft: number;
}

const UpcomingDeadlines: React.FC = () => {
  const { userProfile } = useAuth();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const now = new Date();
        const items: Deadline[] = [];

        // Fetch upcoming exams
        if (userProfile?.level && userProfile?.department) {
          const { data: exams } = await supabase
            .from('exams')
            .select('id, course_title, exam_date')
            .eq('level', userProfile.level)
            .eq('department', userProfile.department)
            .gte('exam_date', now.toISOString())
            .order('exam_date', { ascending: true })
            .limit(3);

          if (exams) {
            exams.forEach(exam => {
              items.push({
                id: exam.id,
                title: exam.course_title,
                type: 'exam',
                date: exam.exam_date,
                daysLeft: differenceInDays(new Date(exam.exam_date), now),
              });
            });
          }
        }

        // Fetch upcoming events
        const { data: events } = await supabase
          .from('events')
          .select('id, title, event_date')
          .eq('published', true)
          .gte('event_date', now.toISOString())
          .order('event_date', { ascending: true })
          .limit(3);

        if (events) {
          events.forEach(event => {
            items.push({
              id: event.id,
              title: event.title,
              type: 'event',
              date: event.event_date,
              daysLeft: differenceInDays(new Date(event.event_date), now),
            });
          });
        }

        // Sort by date and take top 5
        items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setDeadlines(items.slice(0, 5));
      } catch (error) {
        console.error('Error fetching deadlines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
  }, [userProfile]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'exam':
        return <FileText className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 2) return 'bg-destructive text-destructive-foreground';
    if (daysLeft <= 7) return 'bg-orange-500 text-white';
    return 'bg-primary text-primary-foreground';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-muted rounded mb-1" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming deadlines
          </p>
        ) : (
          <div className="space-y-3">
            {deadlines.map((deadline) => (
              <div key={deadline.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground">
                    {getIcon(deadline.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {deadline.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(deadline.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <Badge className={getUrgencyColor(deadline.daysLeft)}>
                  {deadline.daysLeft === 0 ? 'Today' : 
                   deadline.daysLeft === 1 ? 'Tomorrow' : 
                   `${deadline.daysLeft} days`}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingDeadlines;
