import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Settings, Globe, CreditCard, Shield, Wrench, BarChart3, AlertTriangle, TestTube, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const SystemSettingsNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationItems = [
    {
      path: '/admin/settings/general',
      label: 'General',
      icon: Settings,
      description: 'Site information and basic settings'
    },
    {
      path: '/admin/settings/seo',
      label: 'SEO & Meta',
      icon: Globe,
      description: 'Search engine optimization'
    },
    {
      path: '/admin/settings/seo-tools',
      label: 'SEO Tools',
      icon: Search,
      description: 'Sitemap generator and robots.txt'
    },
    {
      path: '/admin/settings/payments',
      label: 'Payment Gateways',
      icon: CreditCard,
      description: 'Configure payment methods'
    },
    {
      path: '/admin/settings/events',
      label: 'Event Settings',
      icon: AlertTriangle,
      description: 'Event creation and pricing'
    },
    {
      path: '/admin/settings/security',
      label: 'Security',
      icon: Shield,
      description: 'Password, MFA, and security settings'
    },
    {
      path: '/admin/settings/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Google Analytics and tracking'
    },
    {
      path: '/admin/settings/maintenance',
      label: 'Maintenance',
      icon: Wrench,
      description: 'Site maintenance and downtime'
    },
    {
      path: '/admin/settings/testing',
      label: 'System Testing',
      icon: TestTube,
      description: 'Test system functionality'
    }
  ];

  return (
    <Card>
      <CardContent className="p-0">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-sm transition-colors hover:bg-muted rounded-md mx-1 my-0.5",
                  isActive ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-accent"
                )}
              >
                <Icon className="mr-3 h-4 w-4" />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};

export default SystemSettingsNavigation;