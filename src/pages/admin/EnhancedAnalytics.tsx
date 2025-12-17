import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import AdSettingsPanel from "@/components/admin/AdSettingsPanel";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  LineChart, 
  Line,
  Area,
  AreaChart
} from "recharts";
import { 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Eye,
  MessageSquare,
  Mail,
  Star,
  Wallet,
  CreditCard,
  Filter,
  Megaphone,
  Globe
} from "lucide-react";

const EnhancedAnalytics = () => {
  const { hasAccess, userRole } = useAdminAccess();
  const [selectedModerator, setSelectedModerator] = useState("all");
  const [selectedEventType, setSelectedEventType] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = () => {
    try {
      setIsExporting(true);
      const rows: string[] = [];
      rows.push('Section,Metric,Value');
      rows.push(`Overview,Total Users,${overview?.users ?? 0}`);
      rows.push(`Overview,Total Events,${overview?.events ?? 0}`);
      rows.push(`Overview,Total Revenue,${overview?.totalRevenue ?? 0}`);
      rows.push(`Ads,Total Ads,${adsSummary?.totalAds ?? 0}`);
      rows.push(`Ads,Active Ads,${adsSummary?.activeAds ?? 0}`);
      rows.push(`Ads,Total Impressions,${adsSummary?.totalImpressions ?? 0}`);
      rows.push(`Ads,Total Clicks,${adsSummary?.totalClicks ?? 0}`);
      rows.push(`Payments,Total Wallet Balance,${walletStats?.totalBalance ?? 0}`);
      rows.push(`Payments,Total Credits,${walletStats?.totalCredits ?? 0}`);
      rows.push(`Payments,Total Debits,${walletStats?.totalDebits ?? 0}`);
      rows.push(`Search,Total Analytics Events,${searchAnalytics?.totalEvents ?? 0}`);
      rows.push(`Search,Anonymous Page Views,${searchAnalytics?.anonymousPageViews ?? 0}`);

      const csvContent = rows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'analytics-report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  // Enhanced analytics queries
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['enhanced-analytics-overview'],
    queryFn: async () => {
      const [users, events, blogs, payments, tickets, contactMessages] = await Promise.all([
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("amount, created_at, payment_status"),
        supabase.from("tickets").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }),
      ]);

      const totalRevenue = payments.data?.reduce((sum, p) => 
        p.payment_status === 'processed' ? sum + Number(p.amount || 0) : sum, 0) || 0;
      
      const successfulPayments = payments.data?.filter(p => p.payment_status === 'processed').length || 0;
      
      return {
        users: users.count || 0,
        events: events.count || 0,
        blogs: blogs.count || 0,
        tickets: tickets.count || 0,
        contactMessages: contactMessages.count || 0,
        totalRevenue,
        successfulPayments,
        conversionRate: payments.data?.length ? 
          (successfulPayments / payments.data.length * 100).toFixed(1) : '0'
      };
    },
  });

  // Revenue trends
  const { data: revenueTrends, isLoading: loadingRevenue } = useQuery({
    queryKey: ['analytics-revenue-trends'],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("amount, created_at, payment_status")
        .eq('payment_status', 'processed')
        .order("created_at", { ascending: true });

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const last12Months = [];

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last12Months.push({ 
          month: months[d.getMonth()], 
          year: d.getFullYear(), 
          revenue: 0, 
          transactions: 0 
        });
      }

      (data || []).forEach(payment => {
        const d = new Date(payment.created_at);
        const slot = last12Months.find(m => 
          m.month === months[d.getMonth()] && m.year === d.getFullYear()
        );
        if (slot) {
          slot.revenue += Number(payment.amount || 0);
          slot.transactions += 1;
        }
      });

      return last12Months;
    }
  });

  // User growth trends
  const { data: userGrowth, isLoading: loadingUserGrowth } = useQuery({
    queryKey: ['analytics-user-growth'],
    queryFn: async () => {
      const { data } = await supabase
        .from("users")
        .select("created_at")
        .order("created_at", { ascending: true });

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const now = new Date();
      const last12Months = [];

      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        last12Months.push({ 
          month: months[d.getMonth()], 
          year: d.getFullYear(), 
          newUsers: 0,
          totalUsers: 0
        });
      }

      let totalUsers = 0;
      (data || []).forEach(user => {
        const d = new Date(user.created_at);
        const slotIndex = last12Months.findIndex(m => 
          m.month === months[d.getMonth()] && m.year === d.getFullYear()
        );
        if (slotIndex !== -1) {
          last12Months[slotIndex].newUsers += 1;
          totalUsers += 1;
          // Update total users for this month and all subsequent months
          for (let i = slotIndex; i < last12Months.length; i++) {
            last12Months[i].totalUsers = totalUsers;
          }
        }
      });

      return last12Months;
    }
  });

  // Event performance
  const { data: eventStats, isLoading: loadingEvents } = useQuery({
    queryKey: ['analytics-event-stats'],
    queryFn: async () => {
      const { data: events } = await supabase
        .from("events")
        .select("event_type, published, created_at")
        .order("created_at", { ascending: false });

      const typeBreakdown: Record<string, number> = {};
      const published = events?.filter(e => e.published).length || 0;
      const total = events?.length || 0;

      events?.forEach(event => {
        const type = event.event_type || "Other";
        typeBreakdown[type] = (typeBreakdown[type] || 0) + 1;
      });

      return {
        total,
        published,
        draft: total - published,
        typeBreakdown: Object.entries(typeBreakdown).map(([name, value]) => ({ name, value }))
      };
    }
  });

  // Moderator monitoring - Admin only
  const { data: moderatorStats, isLoading: loadingModerators } = useQuery({
    queryKey: ['analytics-moderator-stats'],
    queryFn: async () => {
      if (userRole !== 'admin') return [];
      
      // Get users with moderator role
      const { data: users } = await supabase
        .from("users")
        .select("id, email, full_name")
        .eq('role', 'moderator');

      if (!users) return [];

      // Get additional data for each moderator
      const moderatorData = await Promise.all(
        users.map(async (user) => {
          const [walletData, eventsData, transactionsData] = await Promise.all([
            supabase.from("wallets").select("balance").eq("user_id", user.id).maybeSingle(),
            supabase.from("events").select("id, title, ticket_price").eq("created_by", user.id),
            supabase.from("wallet_transactions").select("amount").eq("user_id", user.id).eq("type", "debit")
          ]);

          return {
            id: user.id,
            email: user.email,
            name: user.full_name || user.email,
            walletBalance: walletData.data?.balance || 0,
            totalEvents: eventsData.data?.length || 0,
            paidEvents: eventsData.data?.filter(e => e.ticket_price > 0).length || 0,
            totalSpent: transactionsData.data?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0
          };
        })
      );

      return moderatorData;
    },
    enabled: userRole === 'admin'
  });

  // Wallet analytics - Admin only
  const { data: walletStats, isLoading: loadingWallets } = useQuery({
    queryKey: ['analytics-wallet-stats'],
    queryFn: async () => {
      if (userRole !== 'admin') return null;

      const [walletsData, transactionsData] = await Promise.all([
        supabase.from("wallets").select("balance"),
        supabase.from("wallet_transactions").select("amount, type")
      ]);

      const totalBalance = walletsData.data?.reduce((sum, w) => sum + Number(w.balance), 0) || 0;
      const totalCredits = transactionsData.data
        ?.filter(t => t.type === 'credit')
        ?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalDebits = transactionsData.data
        ?.filter(t => t.type === 'debit')
        ?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;

      return {
        totalBalance,
        totalCredits,
        totalDebits,
        totalTransactions: transactionsData.data?.length || 0,
        activeWallets: walletsData.data?.filter(w => Number(w.balance) > 0).length || 0
      };
    },
    enabled: userRole === 'admin'
  });

  // Enhanced event analytics with filtering
  const { data: eventAnalytics, isLoading: loadingEventAnalytics } = useQuery({
    queryKey: ['analytics-events-detailed', selectedModerator, selectedEventType],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("id, title, event_type, ticket_price, published, created_at, created_by");

      if (selectedModerator !== 'all') {
        query = query.eq('created_by', selectedModerator);
      }
      if (selectedEventType !== 'all') {
        query = query.eq('event_type', selectedEventType);
      }

      const { data: events } = await query.order('created_at', { ascending: false });
      
      if (!events) return [];

      // Get user data and analytics for events
      const eventsWithData = await Promise.all(
        events.map(async (event) => {
          const [userData, analyticsData] = await Promise.all([
            supabase.from("users").select("email, full_name").eq("id", event.created_by).maybeSingle(),
            supabase.from("event_analytics").select("views, tickets_sold, revenue").eq("event_id", event.id).maybeSingle()
          ]);

          return {
            id: event.id,
            title: event.title,
            type: event.event_type,
            price: event.ticket_price || 0,
            published: event.published,
            creator: userData.data?.full_name || userData.data?.email || 'Unknown',
            creatorEmail: userData.data?.email,
            views: analyticsData.data?.views || 0,
            ticketsSold: analyticsData.data?.tickets_sold || 0,
            revenue: analyticsData.data?.revenue || 0,
            createdAt: event.created_at
          };
        })
      );

      return eventsWithData;
    }
  });

  // Advertisement performance analytics
  const { data: adsSummary, isLoading: loadingAds } = useQuery({
    queryKey: ['analytics-ads-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_ads')
        .select('is_active, impressions, clicks, cost, expires_at');

      if (error) throw error;

      const now = new Date();
      const totalAds = data?.length || 0;
      const activeAds = data?.filter(ad => ad.is_active && (!ad.expires_at || new Date(ad.expires_at) > now)).length || 0;
      const expiredAds = data?.filter(ad => ad.expires_at && new Date(ad.expires_at) <= now).length || 0;
      const totalImpressions = data?.reduce((sum, ad) => sum + (ad.impressions || 0), 0) || 0;
      const totalClicks = data?.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0;
      const totalCost = data?.reduce((sum, ad) => sum + Number(ad.cost || 0), 0) || 0;
      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      return {
        totalAds,
        activeAds,
        expiredAds,
        totalImpressions,
        totalClicks,
        totalCost,
        avgCTR: Number(avgCTR.toFixed(2)),
      };
    }
  });

  // Detailed payments & wallet analytics (for Payments tab)
  interface PaymentRecord {
    id: string;
    full_name: string;
    email: string;
    amount: number;
    payment_type: string;
    payment_status: string | null;
    payment_reference: string;
    created_at: string;
  }

  interface WalletTransactionRecord {
    id: string;
    amount: number;
    type: string;
    description: string;
    created_at: string;
    reference: string | null;
  }

  const { data: paymentsDetailed, isLoading: loadingPayments } = useQuery({
    queryKey: ['analytics-payments-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('id, full_name, email, amount, payment_type, payment_status, payment_reference, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as PaymentRecord[];
    }
  });

  const { data: walletDetailed, isLoading: loadingWalletDetailed } = useQuery({
    queryKey: ['analytics-wallet-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('id, amount, type, description, created_at, reference')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as WalletTransactionRecord[];
    }
  });

  // Search Console & Bing verification + basic traffic
  const { data: searchAnalytics, isLoading: loadingSearch } = useQuery({
    queryKey: ['analytics-search-verification'],
    queryFn: async () => {
      const [{ data: settings }, analyticsEvents, anonymousPageViews] = await Promise.all([
        supabase
          .from('system_settings')
          .select('key, value')
          .in('key', ['google_verification', 'bing_verification']),
        supabase
          .from('analytics_events')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('anonymous_page_analytics')
          .select('*', { count: 'exact', head: true }),
      ]);

      const googleVerification = settings?.find(s => s.key === 'google_verification')?.value || '';
      const bingVerification = settings?.find(s => s.key === 'bing_verification')?.value || '';

      return {
        googleConnected: !!googleVerification,
        bingConnected: !!bingVerification,
        googleVerification,
        bingVerification,
        totalEvents: analyticsEvents.count || 0,
        anonymousPageViews: anonymousPageViews.count || 0,
      };
    }
  });

  // Get list of moderators for filtering
  const { data: moderatorsList } = useQuery({
    queryKey: ['moderators-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from("users")
        .select("id, email, full_name")
        .eq('role', 'moderator');
      return data || [];
    },
    enabled: userRole === 'admin'
  });

  const isLoading = loadingOverview || loadingRevenue || loadingUserGrowth || loadingEvents || loadingAds || loadingPayments || loadingWalletDetailed || loadingSearch;

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#3ecfff', '#67db86', '#ffd166', '#fa6134'];

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-2 md:px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive insights into your platform performance</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Live View
            </Button>
            <Button size="sm" onClick={handleExportReport}>
              Export Report
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.users}</div>
                  <p className="text-xs text-muted-foreground">+2.1% from last month</p>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{overview?.totalRevenue?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{overview?.conversionRate}% conversion rate</p>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.events}</div>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs">{eventStats?.published} Live</Badge>
                    <Badge variant="outline" className="text-xs">{eventStats?.draft} Draft</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overview?.tickets}</div>
                  <p className="text-xs text-muted-foreground">{overview?.successfulPayments} transactions</p>
                </CardContent>
              </Card>
            </div>

            {/* Search & Ads summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Search Traffic</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">
                    {(searchAnalytics?.totalEvents || 0) + (searchAnalytics?.anonymousPageViews || 0)} total page events
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Google Search Console: {searchAnalytics?.googleConnected ? 'Connected' : 'Not connected'} • Bing: {searchAnalytics?.bingConnected ? 'Connected' : 'Not connected'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ad Performance</CardTitle>
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">{adsSummary?.totalAds || 0} ads • {adsSummary?.activeAds || 0} active</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    CTR: {adsSummary ? `${adsSummary.avgCTR}%` : '0%'} • Impressions: {adsSummary?.totalImpressions?.toLocaleString?.() || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wallet Overview</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">₦{walletStats?.totalBalance?.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {walletStats?.totalTransactions} transactions • {walletStats?.activeWallets} active wallets
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trends */}
              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Revenue Trends</CardTitle>
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTrends || []}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₦${Number(value).toLocaleString()}`, 'Revenue']} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1} 
                          fill="url(#colorRevenue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Growth */}
              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>User Growth</CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userGrowth || []}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="totalUsers" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="newUsers" 
                          stroke="#3ecfff" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Event Types Breakdown */}
              <Card className="col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Event Types</CardTitle>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={eventStats?.typeBreakdown || []} 
                          dataKey="value" 
                          nameKey="name" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={100} 
                          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {(eventStats?.typeBreakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Platform Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">Blog Posts</p>
                        <p className="text-sm text-muted-foreground">Content engagement</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{overview?.blogs}</p>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">Contact Messages</p>
                        <p className="text-sm text-muted-foreground">User inquiries</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{overview?.contactMessages}</p>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Star className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">Platform Score</p>
                        <p className="text-sm text-muted-foreground">Overall health</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">98%</p>
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Role-based Analytics Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="flex flex-wrap gap-2 w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {userRole === 'admin' && <TabsTrigger value="moderators">Moderators</TabsTrigger>}
                {userRole === 'admin' && <TabsTrigger value="wallets">Wallets</TabsTrigger>}
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="ads">Ads</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Existing charts content already shown above */}
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Overview analytics shown above in the main dashboard.</p>
                </div>
              </TabsContent>

              {/* Moderator Monitoring Tab - Admin Only */}
              {userRole === 'admin' && (
                <TabsContent value="moderators" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Moderator Monitoring
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingModerators ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {moderatorStats?.map((moderator) => (
                            <div key={moderator.id} className="flex items-center justify-between p-4 border rounded-lg">
                              <div>
                                <h4 className="font-medium">{moderator.name}</h4>
                                <p className="text-sm text-muted-foreground">{moderator.email}</p>
                              </div>
                              <div className="flex gap-6 text-sm">
                                <div className="text-center">
                                  <p className="font-semibold">₦{moderator.walletBalance.toLocaleString()}</p>
                                  <p className="text-muted-foreground">Balance</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-semibold">{moderator.totalEvents}</p>
                                  <p className="text-muted-foreground">Events</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-semibold">{moderator.paidEvents}</p>
                                  <p className="text-muted-foreground">Paid</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-semibold">₦{moderator.totalSpent.toLocaleString()}</p>
                                  <p className="text-muted-foreground">Spent</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!moderatorStats || moderatorStats.length === 0) && (
                            <div className="text-center py-8">
                              <p className="text-muted-foreground">No moderators found.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Wallet Analytics Tab - Admin Only */}
              {userRole === 'admin' && (
                <TabsContent value="wallets" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">₦{walletStats?.totalBalance?.toLocaleString()}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">₦{walletStats?.totalCredits?.toLocaleString()}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
                        <TrendingUp className="h-4 w-4 text-red-600" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">₦{walletStats?.totalDebits?.toLocaleString()}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{walletStats?.totalTransactions}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{walletStats?.activeWallets}</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}

              {/* Enhanced Events Tab */}
              <TabsContent value="events" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Event Analytics
                      </CardTitle>
                      <div className="flex gap-2">
                        <Select value={selectedModerator} onValueChange={setSelectedModerator}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by moderator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Moderators</SelectItem>
                            {moderatorsList?.map((mod) => (
                              <SelectItem key={mod.id} value={mod.id}>
                                {mod.full_name || mod.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="conference">Conference</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                            <SelectItem value="meetup">Meetup</SelectItem>
                            <SelectItem value="seminar">Seminar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingEventAnalytics ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {eventAnalytics?.map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{event.title}</h4>
                                <Badge variant={event.published ? "default" : "secondary"}>
                                  {event.published ? "Published" : "Draft"}
                                </Badge>
                                <Badge variant="outline">{event.type}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Created by {event.creator} • {new Date(event.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-6 text-sm">
                              <div className="text-center">
                                <p className="font-semibold">₦{event.price.toLocaleString()}</p>
                                <p className="text-muted-foreground">Price</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold">{event.views}</p>
                                <p className="text-muted-foreground">Views</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold">{event.ticketsSold}</p>
                                <p className="text-muted-foreground">Sold</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold">₦{event.revenue.toLocaleString()}</p>
                                <p className="text-muted-foreground">Revenue</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {(!eventAnalytics || eventAnalytics.length === 0) && (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">No events found for the selected filters.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EnhancedAnalytics;