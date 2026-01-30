import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, BookOpen, Calendar, GraduationCap } from 'lucide-react';
import { useInView } from 'react-intersection-observer';

interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
  suffix?: string;
}

const AnimatedCounter: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ 
  end, 
  duration = 2000,
  suffix = ''
}) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const StatsCounter: React.FC = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: usersCount },
          { count: coursesCount },
          { count: eventsCount },
          { count: departmentsCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('events').select('*', { count: 'exact', head: true }).eq('published', true),
          supabase.from('departments').select('*', { count: 'exact', head: true })
        ]);

        setStats([
          { label: 'Students', value: usersCount || 0, icon: <Users className="h-8 w-8" />, suffix: '+' },
          { label: 'Courses', value: coursesCount || 0, icon: <BookOpen className="h-8 w-8" /> },
          { label: 'Events', value: eventsCount || 0, icon: <Calendar className="h-8 w-8" /> },
          { label: 'Departments', value: departmentsCount || 0, icon: <GraduationCap className="h-8 w-8" /> },
        ]);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-12 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-primary/20 rounded-full mb-3" />
                <div className="h-8 w-20 bg-primary/20 rounded mb-2" />
                <div className="h-4 w-16 bg-primary/20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-primary mb-3">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsCounter;
