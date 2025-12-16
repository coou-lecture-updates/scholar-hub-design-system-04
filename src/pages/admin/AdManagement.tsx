import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Eye, MousePointer, DollarSign, Loader2, Trash2, ToggleLeft, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MessageAd {
  id: string;
  user_id: string;
  ad_type: string;
  title: string;
  description: string | null;
  link_url: string;
  image_url: string | null;
  cost: number;
  impressions: number | null;
  clicks: number | null;
  is_active: boolean | null;
  expires_at: string | null;
  created_at: string | null;
}

interface ProfileSummary {
  id: string;
  full_name: string;
  email: string;
}

const AdManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all ads
  const { data: ads, isLoading } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_ads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MessageAd[];
    }
  });

  // Fetch ad settings
  const { data: adSettings } = useQuery({
    queryKey: ['ad-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch basic user profile info for ad owners
  const { data: profiles } = useQuery({
    queryKey: ['admin-ad-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email');
      if (error) throw error;
      return (data || []) as ProfileSummary[];
    }
  });

  // Toggle ad active status
  const toggleAdMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('message_ads')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
      toast({ title: "Ad status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update ad", description: error.message, variant: "destructive" });
    }
  });

  // Delete ad
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
      toast({ title: "Ad deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete ad", description: error.message, variant: "destructive" });
    }
  });

  // Filter ads
  const filteredAds = ads?.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ad.link_url.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const isExpired = ad.expires_at ? new Date(ad.expires_at) < now : false;
    
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = ad.is_active === true && !isExpired;
    else if (statusFilter === 'inactive') matchesStatus = ad.is_active === false;
    else if (statusFilter === 'expired') matchesStatus = isExpired;
    
    let matchesType = true;
    if (typeFilter !== 'all') matchesType = ad.ad_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate stats
  const stats = {
    totalAds: ads?.length || 0,
    activeAds: ads?.filter(a => a.is_active && (!a.expires_at || new Date(a.expires_at) > new Date())).length || 0,
    totalRevenue: ads?.reduce((sum, a) => sum + (a.cost || 0), 0) || 0,
    totalImpressions: ads?.reduce((sum, a) => sum + (a.impressions || 0), 0) || 0,
    totalClicks: ads?.reduce((sum, a) => sum + (a.clicks || 0), 0) || 0,
  };

  const getAdTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      native: 'bg-blue-100 text-blue-800',
      banner: 'bg-purple-100 text-purple-800',
      slider: 'bg-green-100 text-green-800',
    };
    return variants[type] || 'bg-muted text-muted-foreground';
  };

  const isAdExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading ads...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Ad Management</h1>
          <p className="text-muted-foreground">Manage user advertisements and settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="text-xs md:text-sm text-muted-foreground">Total Ads</div>
              <div className="text-xl md:text-2xl font-bold text-foreground">{stats.totalAds}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="text-xs md:text-sm text-muted-foreground">Active Ads</div>
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.activeAds}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="text-xs md:text-sm text-muted-foreground">Total Revenue</div>
              <div className="text-xl md:text-2xl font-bold text-primary">₦{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="h-3 w-3" /> Impressions
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground">{stats.totalImpressions.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-0 shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                <MousePointer className="h-3 w-3" /> Clicks
              </div>
              <div className="text-xl md:text-2xl font-bold text-foreground">{stats.totalClicks.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Current Ad Pricing */}
        {adSettings && (
          <Card className="bg-card border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Ad Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Native</Badge>
                  <span className="font-medium">₦{adSettings.ad_cost_native?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Banner</Badge>
                  <span className="font-medium">₦{adSettings.ad_cost_banner?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Slider</Badge>
                  <span className="font-medium">₦{adSettings.ad_cost_slider?.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="bg-card border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search ads by title or URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="native">Native</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="slider">Slider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Ads Table */}
        <Card className="bg-card border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Ad</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[100px]">Cost</TableHead>
                    <TableHead className="min-w-[140px]">Owner</TableHead>
                    <TableHead className="min-w-[100px]">Stats</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Expires</TableHead>
                    <TableHead className="min-w-[140px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {filteredAds?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No ads found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAds?.map((ad) => {
                    const expired = isAdExpired(ad.expires_at);
                    return (
                      <TableRow key={ad.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="font-medium text-foreground truncate">{ad.title}</div>
                            <a 
                              href={ad.link_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline truncate block"
                            >
                              {ad.link_url}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getAdTypeBadge(ad.ad_type)}>
                            {ad.ad_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₦{ad.cost.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const owner = profiles?.find((p) => p.id === ad.user_id);
                            if (!owner) return <span className="text-xs text-muted-foreground">Unknown</span>;
                            return (
                              <div className="text-xs">
                                <div className="font-medium text-foreground truncate">{owner.full_name}</div>
                                <div className="text-muted-foreground truncate">{owner.email}</div>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-muted-foreground" />
                              {ad.impressions || 0}
                            </div>
                            <div className="flex items-center gap-1">
                              <MousePointer className="h-3 w-3 text-muted-foreground" />
                              {ad.clicks || 0}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {expired ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : ad.is_active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {ad.expires_at ? format(new Date(ad.expires_at), 'MMM d, yyyy') : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Switch
                              checked={ad.is_active ?? false}
                              onCheckedChange={(checked) => toggleAdMutation.mutate({ id: ad.id, is_active: checked })}
                              disabled={toggleAdMutation.isPending}
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Ad</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this ad? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                  <AlertDialogCancel className="m-0">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteAdMutation.mutate(ad.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 m-0"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdManagement;
