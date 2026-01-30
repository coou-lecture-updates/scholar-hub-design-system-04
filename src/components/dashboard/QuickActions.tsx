import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Users,
  Clock,
  CreditCard
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Fund Wallet',
    description: 'Add money to your wallet',
    icon: <Wallet className="h-6 w-6" />,
    href: '/wallet/fund',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    title: 'View Timetable',
    description: 'Check your class schedule',
    icon: <Clock className="h-6 w-6" />,
    href: '/timetable',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Upcoming Events',
    description: 'Browse campus events',
    icon: <Calendar className="h-6 w-6" />,
    href: '/events',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Community Forum',
    description: 'Connect with students',
    icon: <MessageSquare className="h-6 w-6" />,
    href: '/messages',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  },
  {
    title: 'Course Updates',
    description: 'Latest course information',
    icon: <BookOpen className="h-6 w-6" />,
    href: '/course-updates',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  },
  {
    title: 'Payment History',
    description: 'View transactions',
    icon: <CreditCard className="h-6 w-6" />,
    href: '/payment-history',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  },
];

const QuickActions: React.FC = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action, index) => (
          <Link key={index} to={action.href}>
            <Card className="h-full hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer border-border/50">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={`p-3 rounded-xl mb-3 ${action.color}`}>
                  {action.icon}
                </div>
                <h4 className="font-medium text-sm text-foreground mb-1">{action.title}</h4>
                <p className="text-xs text-muted-foreground hidden sm:block">{action.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
