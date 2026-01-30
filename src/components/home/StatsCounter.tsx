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
  // Use fake data for now - 1000+ students and 71 events
  const stats: Stat[] = [
    { label: 'Students', value: 1000, icon: <Users className="h-8 w-8" />, suffix: '+' },
    { label: 'Courses', value: 156, icon: <BookOpen className="h-8 w-8" /> },
    { label: 'Events', value: 71, icon: <Calendar className="h-8 w-8" /> },
    { label: 'Departments', value: 42, icon: <GraduationCap className="h-8 w-8" /> },
  ];

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
