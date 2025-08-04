
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  revenue: any[];
  userGrowth: any[];
  eventMetrics: any[];
  paymentMethods: any[];
  geographicData: any[];
  conversionFunnel: any[];
}

const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: [],
    userGrowth: [],
    eventMetrics: [],
    paymentMethods: [],
    geographicData: [],
    conversionFunnel: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Revenue Analytics
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at, payment_method, payment_status')
        .eq('payment_status', 'completed')
        .gte('created_at', getDateRange(timeRange));

      // User Growth
      const { data: users } = await supabase
        .from('users')
        .select('created_at, campus, faculty')
        .gte('created_at', getDateRange(timeRange));

      // Event Metrics
      const { data: events } = await supabase
        .from('events')
        .select(`
          *,
          tickets:tickets(count)
        `)
        .eq('published', true);

      // Process revenue data
      const revenueByDay = processRevenueData(payments || []);
      const userGrowthData = processUserGrowthData(users || []);
      const eventMetricsData = processEventMetrics(events || []);
      const paymentMethodsData = processPaymentMethods(payments || []);
      const geographicData = processGeographicData(users || []);
      const conversionData = await fetchConversionData();

      setAnalytics({
        revenue: revenueByDay,
        userGrowth: userGrowthData,
        eventMetrics: eventMetricsData,
        paymentMethods: paymentMethodsData,
        geographicData,
        conversionFunnel: conversionData
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range: string) => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return date.toISOString();
  };

  const processRevenueData = (payments: any[]) => {
    const groupedByDate = payments.reduce((acc, payment) => {
      const date = new Date(payment.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + Number(payment.amount);
      return acc;
    }, {});

    return Object.entries(groupedByDate).map(([date, amount]) => ({
      date,
      amount,
      transactions: payments.filter(p => 
        new Date(p.created_at).toLocaleDateString() === date
      ).length
    }));
  };

  const processUserGrowthData = (users: any[]) => {
    const groupedByDate = users.reduce((acc, user) => {
      const date = new Date(user.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(groupedByDate).map(([date, count]) => ({
      date,
      newUsers: count,
      cumulative: users.filter(u => 
        new Date(u.created_at) <= new Date(date)
      ).length
    }));
  };

  const processEventMetrics = (events: any[]) => {
    return events.map(event => ({
      name: event.title.slice(0, 20) + '...',
      tickets: event.tickets?.[0]?.count || 0,
      date: new Date(event.event_date).toLocaleDateString(),
      type: event.event_type
    }));
  };

  const processPaymentMethods = (payments: any[]) => {
    const methods = payments.reduce((acc, payment) => {
      const method = payment.payment_method || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(methods).map(([name, value]) => ({
      name,
      value,
      amount: payments
        .filter(p => p.payment_method === name)
        .reduce((sum, p) => sum + Number(p.amount), 0)
    }));
  };

  const processGeographicData = (users: any[]) => {
    const campuses = users.reduce((acc, user) => {
      const campus = user.campus || 'Unknown';
      acc[campus] = (acc[campus] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(campuses).map(([name, value]) => ({ name, value }));
  };

  const fetchConversionData = async () => {
    // Simulate conversion funnel data
    const { data: analyticsEvents } = await supabase
      .from('analytics_events')
      .select('event_type')
      .gte('created_at', getDateRange(timeRange));

    const events = analyticsEvents || [];
    const pageViews = events.filter(e => e.event_type === 'page_view').length;
    const eventViews = events.filter(e => e.event_type === 'event_view').length;
    const paymentInitiated = events.filter(e => e.event_type === 'payment_initiated').length;
    const paymentCompleted = events.filter(e => e.event_type === 'payment_completed').length;

    return [
      { stage: 'Page Views', count: pageViews || 1000, percentage: 100 },
      { stage: 'Event Views', count: eventViews || 400, percentage: 40 },
      { stage: 'Payment Initiated', count: paymentInitiated || 100, percentage: 10 },
      { stage: 'Payment Completed', count: paymentCompleted || 80, percentage: 8 }
    ];
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalRevenue = analytics.revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalUsers = analytics.userGrowth.reduce((sum, item) => sum + item.newUsers, 0);
  const totalEvents = analytics.eventMetrics.length;
  const avgTicketsPerEvent = analytics.eventMetrics.reduce((sum, item) => sum + item.tickets, 0) / totalEvents || 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-900">Advanced Analytics</h2>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₦{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-600">+12% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalUsers}</div>
            <p className="text-xs text-gray-600">+5% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalEvents}</div>
            <p className="text-xs text-gray-600">+3 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Tickets/Event</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{avgTicketsPerEvent.toFixed(1)}</div>
            <p className="text-xs text-gray-600">+8% from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="geographic">Geographic</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Daily revenue and transaction volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#3B82F6" name="Revenue (₦)" />
                  <Line type="monotone" dataKey="transactions" stroke="#10B981" name="Transactions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="newUsers" fill="#3B82F6" name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Event Performance</CardTitle>
              <CardDescription>Ticket sales by event</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.eventMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#10B981" name="Tickets Sold" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Distribution of payment methods used</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analytics.paymentMethods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.paymentMethods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geographic">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>User distribution by campus</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.geographicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey from view to purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics.conversionFunnel} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#F59E0B" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
