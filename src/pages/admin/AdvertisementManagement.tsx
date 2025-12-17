import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Pause, Play, Trash2, ExternalLink, TrendingUp, TrendingDown, Activity, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ad {
  id: string;
  title: string;
  description: string | null;
  ad_type: string;
  link_url: string;
  image_url: string | null;
  cost: number;
  impressions: number;
  clicks: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  user_id: string;
}

const AdvertisementManagement = () => {
  // Existing filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Advanced filters
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [minImpressions, setMinImpressions] = useState<string>('');
  const [maxImpressions, setMaxImpressions] = useState<string>('');
  const [minClicks, setMinClicks] = useState<string>('');
  const [maxClicks, setMaxClicks] = useState<string>('');
  
  // Bulk selection
  const [selectedAdIds, setSelectedAdIds] = useState<Set<string>>(new Set());
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch ad creators for filter dropdown
  const { data: adCreators } = useQuery({
    queryKey: ['ad-creators'],
    queryFn: async () => {
      const { data: ads } = await supabase
        .from('message_ads')
        .select('user_id');
      
      const uniqueUserIds = [...new Set(ads?.map(ad => ad.user_id))];
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', uniqueUserIds);
      
      return profiles || [];
    }
  });

  const { data: ads, isLoading } = useQuery({
    queryKey: [
      'admin-ads',
      searchQuery,
      typeFilter,
      statusFilter,
      dateRange?.from?.toISOString(),
      dateRange?.to?.toISOString(),
      selectedUserId,
      minImpressions,
      maxImpressions,
      minClicks,
      maxClicks
    ],
    queryFn: async () => {
      let query = supabase
        .from('message_ads')
        .select('*')
        .order('created_at', { ascending: false });

      // Existing filters
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      if (typeFilter !== 'all') {
        query = query.eq('ad_type', typeFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('is_active', statusFilter === 'active');
      }

      // Advanced filters - Date range
      if (dateRange?.from) {
        query = query.gte('created_at', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      // User filter
      if (selectedUserId !== 'all') {
        query = query.eq('user_id', selectedUserId);
      }

      // Impressions range
      if (minImpressions) {
        query = query.gte('impressions', parseInt(minImpressions));
      }
      if (maxImpressions) {
        query = query.lte('impressions', parseInt(maxImpressions));
      }

      // Clicks range
      if (minClicks) {
        query = query.gte('clicks', parseInt(minClicks));
      }
      if (maxClicks) {
        query = query.lte('clicks', parseInt(maxClicks));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Ad[];
    },
  });

  const toggleAdMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('message_ads')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
      toast({ title: 'Ad status updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update ad status', variant: 'destructive' });
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('message_ads')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
      toast({ title: 'Ad deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete ad', variant: 'destructive' });
    },
  });

  // Bulk actions mutations
  const bulkToggleMutation = useMutation({
    mutationFn: async (activate: boolean) => {
      const { error } = await supabase
        .from('message_ads')
        .update({ is_active: activate })
        .in('id', Array.from(selectedAdIds));
      if (error) throw error;
    },
    onSuccess: (_, activate) => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
      setSelectedAdIds(new Set());
      setIsSelectAllChecked(false);
      toast({ 
        title: `${selectedAdIds.size} ad${selectedAdIds.size > 1 ? 's' : ''} ${activate ? 'activated' : 'paused'} successfully` 
      });
    },
    onError: () => {
      toast({ title: 'Failed to update ads', variant: 'destructive' });
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('message_ads')
        .delete()
        .in('id', Array.from(selectedAdIds));
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
      const count = selectedAdIds.size;
      setSelectedAdIds(new Set());
      setIsSelectAllChecked(false);
      toast({ title: `${count} ad${count > 1 ? 's' : ''} deleted successfully` });
    },
    onError: () => {
      toast({ title: 'Failed to delete ads', variant: 'destructive' });
    }
  });

  // Selection handlers
  const handleSelectAll = () => {
    if (isSelectAllChecked) {
      setSelectedAdIds(new Set());
    } else {
      setSelectedAdIds(new Set(ads?.map(ad => ad.id) || []));
    }
    setIsSelectAllChecked(!isSelectAllChecked);
  };

  const handleSelectAd = (adId: string) => {
    const newSelected = new Set(selectedAdIds);
    if (newSelected.has(adId)) {
      newSelected.delete(adId);
    } else {
      newSelected.add(adId);
    }
    setSelectedAdIds(newSelected);
    setIsSelectAllChecked(newSelected.size === ads?.length);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setDateRange(undefined);
    setSelectedUserId('all');
    setMinImpressions('');
    setMaxImpressions('');
    setMinClicks('');
    setMaxClicks('');
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const activeAds = ads?.filter(ad => ad.is_active && !isExpired(ad.expires_at)) || [];
  const expiredAds = ads?.filter(ad => isExpired(ad.expires_at)) || [];
  
  // Performance metrics
  const highPerformers = ads?.filter(ad => (ad.clicks || 0) > 100) || [];
  const lowPerformers = ads?.filter(ad => (ad.clicks || 0) < 10 && (ad.impressions || 0) > 500) || [];
  const totalImpressions = ads?.reduce((sum, ad) => sum + (ad.impressions || 0), 0) || 0;
  const totalClicks = ads?.reduce((sum, ad) => sum + (ad.clicks || 0), 0) || 0;
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Advertisement Management</h1>
            <p className="text-muted-foreground mt-1">Manage all user-created advertisements</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{activeAds.length} Active</Badge>
            <Badge variant="outline">{expiredAds.length} Expired</Badge>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Ads</p>
                  <p className="text-2xl font-bold">{ads?.length || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Performers</p>
                  <p className="text-2xl font-bold">{highPerformers.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Performers</p>
                  <p className="text-2xl font-bold">{lowPerformers.length}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg CTR</p>
                  <p className="text-2xl font-bold">{avgCTR}%</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Row 1: Basic filters */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Ad Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="native">Native</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="slider">Slider</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Row 2: Advanced filters */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                placeholder="Select date range"
                className="w-full"
              />
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by creator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Creators</SelectItem>
                  {adCreators?.map((creator) => (
                    <SelectItem key={creator.id} value={creator.id}>
                      {creator.full_name || creator.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min impressions"
                  value={minImpressions}
                  onChange={(e) => setMinImpressions(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max impressions"
                  value={maxImpressions}
                  onChange={(e) => setMaxImpressions(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min clicks"
                  value={minClicks}
                  onChange={(e) => setMinClicks(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max clicks"
                  value={maxClicks}
                  onChange={(e) => setMaxClicks(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading advertisements...</span>
              </div>
            ) : ads && ads.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isSelectAllChecked}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all ads"
                        />
                      </TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Impressions</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ads.map((ad) => (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedAdIds.has(ad.id)}
                            onCheckedChange={() => handleSelectAd(ad.id)}
                            aria-label={`Select ${ad.title}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-xs truncate">
                          {ad.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {ad.ad_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isExpired(ad.expires_at) ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : ad.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Paused</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{ad.impressions || 0}</TableCell>
                        <TableCell className="text-right">{ad.clicks || 0}</TableCell>
                        <TableCell className="text-right">₦{ad.cost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(ad.link_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleAdMutation.mutate({ id: ad.id, isActive: ad.is_active })}
                              disabled={toggleAdMutation.isPending}
                            >
                              {ad.is_active ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Delete this ad permanently?')) {
                                  deleteAdMutation.mutate(ad.id);
                                }
                              }}
                              disabled={deleteAdMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No advertisements found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedAdIds.size > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-card border rounded-lg shadow-lg p-4 flex flex-col md:flex-row items-center gap-4 z-50 w-[calc(100%-2rem)] md:w-auto">
            <span className="font-medium text-sm">{selectedAdIds.size} ad{selectedAdIds.size > 1 ? 's' : ''} selected</span>
            <div className="flex gap-2 flex-wrap justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkToggleMutation.mutate(true)}
                disabled={bulkToggleMutation.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Activate All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkToggleMutation.mutate(false)}
                disabled={bulkToggleMutation.isPending}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause All
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`Delete ${selectedAdIds.size} ad${selectedAdIds.size > 1 ? 's' : ''} permanently?`)) {
                    bulkDeleteMutation.mutate();
                  }
                }}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedAdIds(new Set());
                  setIsSelectAllChecked(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdvertisementManagement;
