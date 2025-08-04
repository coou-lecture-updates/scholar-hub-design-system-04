import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  CreditCard, 
  Shield, 
  BarChart3, 
  Globe, 
  Wrench, 
  TestTube,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AdminSettingsLayoutProps {
  children: React.ReactNode;
}

const AdminSettingsLayout: React.FC<AdminSettingsLayoutProps> = ({ children }) => {
  const location = useLocation();

  const settingsNavItems = [
    {
      title: 'General',
      path: '/admin/settings',
      icon: Globe,
      description: 'Site information & basic settings'
    },
    {
      title: 'Analytics',
      path: '/admin/settings/analytics',
      icon: BarChart3,
      description: 'Google Analytics & tracking'
    },
    {
      title: 'Payment Gateways',
      path: '/admin/settings/payments',
      icon: CreditCard,
      description: 'Configure payment providers'
    },
    {
      title: 'Security',
      path: '/admin/settings/security',
      icon: Shield,
      description: 'Authentication & access control'
    },
    {
      title: 'Maintenance',
      path: '/admin/settings/maintenance',
      icon: Wrench,
      description: 'Maintenance mode & system health'
    },
    {
      title: 'System Testing',
      path: '/admin/settings/testing',
      icon: TestTube,
      description: 'Test system functionality'
    }
  ];

  // Check if we're on the main settings page
  const isMainSettingsPage = location.pathname === '/admin/settings';

  if (isMainSettingsPage) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsNavItems.map((item) => (
            <Link key={item.path} to={item.path} className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group-hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    {item.title === 'System Testing' && (
                      <Badge variant="outline" className="border-blue-500 text-blue-600">
                        Developer Tool
                      </Badge>
                    )}
                    {item.title === 'Payment Gateways' && (
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        Integration
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Link 
          to="/admin/settings" 
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-foreground font-medium">
          {settingsNavItems.find(item => item.path === location.pathname)?.title || 'Settings'}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {settingsNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

export default AdminSettingsLayout;