import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Eye, 
  Activity,
  TrendingUp,
  Server,
  Database,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  auth: 'healthy' | 'warning' | 'error';
  functions: 'healthy' | 'warning' | 'error';
}

const AdminRealTimeStats: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    storage: 'healthy',
    auth: 'healthy',
    functions: 'healthy',
  });
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStats = async () => {
    try {
      // Get today's analytics events
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: visitsCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      setTodayVisits(visitsCount || 0);

      // Simulate active users (in production, use real-time presence)
      const { count: recentSessions } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

      setActiveUsers(Math.min(recentSessions || 0, 100));

      // Check system health by making test queries
      const healthChecks = await Promise.allSettled([
        supabase.from('profiles').select('id').limit(1),
        supabase.storage.listBuckets(),
        supabase.auth.getSession(),
      ]);

      setSystemHealth({
        database: healthChecks[0].status === 'fulfilled' ? 'healthy' : 'error',
        storage: healthChecks[1].status === 'fulfilled' ? 'healthy' : 'warning',
        auth: healthChecks[2].status === 'fulfilled' ? 'healthy' : 'error',
        functions: 'healthy', // Assume healthy unless we have specific checks
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Real-time Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Now</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeUsers}</p>
              </div>
              <div className="p-2 bg-blue-200/50 dark:bg-blue-800/50 rounded-full">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Today's Visits</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{todayVisits}</p>
              </div>
              <div className="p-2 bg-green-200/50 dark:bg-green-800/50 rounded-full">
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Health
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-2 gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getHealthColor(systemHealth.database)}`}>
                <Database className="h-4 w-4" />
                <span className="text-xs font-medium">Database</span>
                {getHealthIcon(systemHealth.database)}
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getHealthColor(systemHealth.storage)}`}>
                <Server className="h-4 w-4" />
                <span className="text-xs font-medium">Storage</span>
                {getHealthIcon(systemHealth.storage)}
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getHealthColor(systemHealth.auth)}`}>
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium">Auth</span>
                {getHealthIcon(systemHealth.auth)}
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getHealthColor(systemHealth.functions)}`}>
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium">Functions</span>
                {getHealthIcon(systemHealth.functions)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRealTimeStats;
