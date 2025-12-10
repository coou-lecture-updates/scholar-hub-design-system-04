import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MousePointerClick, Pause, Play, Trash2, RefreshCw, Clock, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';
import { format, isPast, addDays } from 'date-fns';

const RENEWAL_OPTIONS = [
  { days: 7, label: '7 Days', multiplier: 1 },
  { days: 14, label: '14 Days', multiplier: 1.8 },
  { days: 30, label: '30 Days', multiplier: 3 },
];

interface AdStatisticsProps {
  open: boolean;
  onClose: () => void;
}

export const AdStatistics: React.FC<AdStatisticsProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const { wallet, addTransaction, refetch: refetchWallet } = useWallet();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewingAdId, setRenewingAdId] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [baseAdCost, setBaseAdCost] = useState(1000);

  useEffect(() => {
    const fetchAdSettings = async () => {
      const { data } = await supabase
        .from('ad_settings')
        .select('ad_cost_native')
        .limit(1)
        .single();
      if (data?.ad_cost_native) {
        setBaseAdCost(data.ad_cost_native);
      }
    };
    fetchAdSettings();
  }, []);

  useEffect(() => {
    if (open && user) {
      fetchUserAds();
    }
  }, [open, user]);

  const fetchUserAds = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_ads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdStatus = async (adId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('message_ads')
        .update({ is_active: !currentStatus })
        .eq('id', adId);

      if (error) throw error;
      toast.success(`Ad ${!currentStatus ? 'activated' : 'paused'}`);
      fetchUserAds();
    } catch (error) {
      console.error('Error toggling ad:', error);
      toast.error('Failed to update ad');
    }
  };

  const deleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      const { error } = await supabase
        .from('message_ads')
        .delete()
        .eq('id', adId);

      if (error) throw error;
      toast.success('Ad deleted successfully');
      fetchUserAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    }
  };

  const calculateCTR = (clicks: number, impressions: number) => {
    if (impressions === 0) return 0;
    return ((clicks / impressions) * 100).toFixed(2);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return isPast(new Date(expiresAt));
  };

  const getRenewalCost = () => {
    const option = RENEWAL_OPTIONS.find(o => o.days === selectedDuration);
    return Math.round(baseAdCost * (option?.multiplier || 1));
  };

  const renewAd = async (adId: string) => {
    const cost = getRenewalCost();
    
    if (!wallet || wallet.balance < cost) {
      toast.error(`Insufficient balance. You need ₦${cost.toLocaleString()}`);
      return;
    }

    try {
      const newExpiresAt = addDays(new Date(), selectedDuration).toISOString();
      
      // Update ad with new expiry and reactivate
      const { error: adError } = await supabase
        .from('message_ads')
        .update({ 
          expires_at: newExpiresAt,
          duration_days: selectedDuration,
          is_active: true
        })
        .eq('id', adId);

      if (adError) throw adError;

      // Deduct from wallet
      await addTransaction(
        -cost,
        'debit',
        `Ad renewal (${selectedDuration} days)`,
        `AD_RENEW_${adId}`
      );

      toast.success(`Ad renewed for ${selectedDuration} days!`);
      setRenewingAdId(null);
      setSelectedDuration(7);
      fetchUserAds();
      refetchWallet();
    } catch (error) {
      console.error('Error renewing ad:', error);
      toast.error('Failed to renew ad');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>My Advertisements</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : ads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No ads created yet
            </div>
          ) : (
            ads.map((ad) => {
              const expired = isExpired(ad.expires_at);
              const isRenewing = renewingAdId === ad.id;

              return (
                <Card key={ad.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold">{ad.title}</h3>
                        {expired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                            {ad.is_active ? 'Active' : 'Paused'}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {ad.ad_type}
                        </Badge>
                      </div>
                      {ad.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {ad.description}
                        </p>
                      )}
                      {ad.expires_at && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {expired ? 'Expired' : 'Expires'}: {format(new Date(ad.expires_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Impressions</p>
                        <p className="font-semibold">{ad.impressions.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                        <p className="font-semibold">{ad.clicks.toLocaleString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CTR</p>
                      <p className="font-semibold">{calculateCTR(ad.clicks, ad.impressions)}%</p>
                    </div>
                  </div>

                  {/* Renewal Section */}
                  {isRenewing && (
                    <div className="mb-3 p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Renew Ad</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Wallet className="h-3 w-3" />
                          Balance: ₦{wallet?.balance?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex gap-2 mb-2">
                        {RENEWAL_OPTIONS.map((option) => (
                          <Button
                            key={option.days}
                            variant={selectedDuration === option.days ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedDuration(option.days)}
                            className="flex-1"
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          Cost: ₦{getRenewalCost().toLocaleString()}
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRenewingAdId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => renewAd(ad.id)}
                            disabled={!wallet || wallet.balance < getRenewalCost()}
                          >
                            Confirm Renewal
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {(expired || !isRenewing) && (
                      <Button
                        variant={expired ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRenewingAdId(isRenewing ? null : ad.id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {expired ? 'Renew Ad' : 'Extend'}
                      </Button>
                    )}
                    {!expired && !isRenewing && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                      >
                        {ad.is_active ? (
                          <>
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Activate
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAd(ad.id)}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
