import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, DollarSign, Users, Wallet } from 'lucide-react';

interface AdSettings {
  id: string;
  ad_cost_native: number | null;
  ad_cost_banner: number | null;
  ad_cost_slider: number | null;
  min_wallet_balance: number | null;
  max_ads_per_user: number | null;
}

interface AdSettingsPanelProps {
  getSetting?: (key: string) => string;
  onUpdate?: (key: string, value: string) => void;
  isUpdating?: boolean;
}

const AdSettingsPanel: React.FC<AdSettingsPanelProps> = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [nativeCost, setNativeCost] = useState('1000');
  const [bannerCost, setBannerCost] = useState('1000');
  const [sliderCost, setSliderCost] = useState('1000');
  const [minBalance, setMinBalance] = useState('0');
  const [maxAds, setMaxAds] = useState('10');

  // Fetch ad settings
  const { data: adSettings, isLoading } = useQuery({
    queryKey: ['ad-settings-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as AdSettings | null;
    }
  });

  // Update form when data loads
  useEffect(() => {
    if (adSettings) {
      setNativeCost(String(adSettings.ad_cost_native || 1000));
      setBannerCost(String(adSettings.ad_cost_banner || 1000));
      setSliderCost(String(adSettings.ad_cost_slider || 1000));
      setMinBalance(String(adSettings.min_wallet_balance || 0));
      setMaxAds(String(adSettings.max_ads_per_user || 10));
    }
  }, [adSettings]);

  // Update ad settings mutation
  const updateMutation = useMutation({
    mutationFn: async (settings: Partial<AdSettings>) => {
      if (adSettings?.id) {
        // Update existing
        const { error } = await supabase
          .from('ad_settings')
          .update(settings)
          .eq('id', adSettings.id);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('ad_settings')
          .insert(settings);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-settings-admin'] });
      queryClient.invalidateQueries({ queryKey: ['ad-settings'] });
      toast({
        title: "Settings saved",
        description: "Ad settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    updateMutation.mutate({
      ad_cost_native: parseFloat(nativeCost) || 1000,
      ad_cost_banner: parseFloat(bannerCost) || 1000,
      ad_cost_slider: parseFloat(sliderCost) || 1000,
      min_wallet_balance: parseFloat(minBalance) || 0,
      max_ads_per_user: parseInt(maxAds) || 10,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading ad settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Ad Pricing
          </CardTitle>
          <CardDescription>
            Configure the cost for different ad types (in NGN)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="native-cost">Native Ad Cost (₦)</Label>
              <Input
                id="native-cost"
                type="number"
                value={nativeCost}
                onChange={(e) => setNativeCost(e.target.value)}
                placeholder="1000"
              />
              <p className="text-xs text-muted-foreground">
                In-feed ads shown within messages
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner-cost">Banner Ad Cost (₦)</Label>
              <Input
                id="banner-cost"
                type="number"
                value={bannerCost}
                onChange={(e) => setBannerCost(e.target.value)}
                placeholder="1000"
              />
              <p className="text-xs text-muted-foreground">
                Carousel ads at the top of the page
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slider-cost">Slider Ad Cost (₦)</Label>
              <Input
                id="slider-cost"
                type="number"
                value={sliderCost}
                onChange={(e) => setSliderCost(e.target.value)}
                placeholder="1000"
              />
              <p className="text-xs text-muted-foreground">
                Rotating side widget ads
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Limits
          </CardTitle>
          <CardDescription>
            Set restrictions on ad creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-ads">Max Ads Per User</Label>
              <Input
                id="max-ads"
                type="number"
                value={maxAds}
                onChange={(e) => setMaxAds(e.target.value)}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                Maximum number of active ads a user can have
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-balance">Minimum Wallet Balance (₦)</Label>
              <Input
                id="min-balance"
                type="number"
                value={minBalance}
                onChange={(e) => setMinBalance(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Minimum balance required to create ads (0 = no minimum)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full sm:w-auto"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Ad Settings
        </Button>
      </div>
    </div>
  );
};

export default AdSettingsPanel;
