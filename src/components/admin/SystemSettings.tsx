import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Settings, BarChart3, Globe, Shield, CreditCard, Wrench, Save, Loader2 } from 'lucide-react';
import SystemTestPanel from '@/components/admin/SystemTestPanel';
import BrandingSettings from '@/components/admin/BrandingSettings';
import AdminSecuritySettings from '@/components/admin/AdminSecuritySettings';
import SEOSettings from '@/components/admin/SEOSettings';
import PaymentGatewaySettings from '@/components/admin/PaymentGatewaySettings';
import AnalyticsSettings from '@/components/admin/AnalyticsSettings';
import MaintenanceSettings from '@/components/admin/MaintenanceSettings';
import SystemSettingsNavigation from '@/components/admin/SystemSettingsNavigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AdSettingsPanel from '@/components/admin/AdSettingsPanel';

// Enhanced Settings Components
import EnhancedGeneralSettings from '@/components/admin/enhanced/EnhancedGeneralSettings';
import EnhancedAnalyticsSettings from '@/components/admin/enhanced/EnhancedAnalyticsSettings';
import EnhancedPaymentSettings from '@/components/admin/enhanced/EnhancedPaymentSettings';
import EnhancedSecuritySettings from '@/components/admin/enhanced/EnhancedSecuritySettings';
import SEOToolsPanel from '@/components/admin/SEOToolsPanel';

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

const SystemSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');
      
      if (error) throw error;
      return data as SystemSetting[];
    }
  });

  // Update system setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value }, { onConflict: 'key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast({
        title: "Settings updated",
        description: "System settings have been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getSetting = (key: string): string => {
    return settings?.find(s => s.key === key)?.value || '';
  };

  const handleSettingUpdate = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading settings...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <SystemSettingsNavigation />
          </div>
          <div className="lg:col-span-3">
            <Routes>
          <Route 
            index
            element={
              <EnhancedGeneralSettings 
                getSetting={getSetting} 
                onUpdate={handleSettingUpdate}
                isUpdating={updateSettingMutation.isPending}
              />
            } 
          />
          <Route 
            path="general" 
            element={
              <EnhancedGeneralSettings 
                getSetting={getSetting} 
                onUpdate={handleSettingUpdate}
                isUpdating={updateSettingMutation.isPending}
              />
            } 
          />
          <Route 
            path="seo" 
            element={
              <SEOSettings 
                getSetting={getSetting} 
                onUpdate={handleSettingUpdate}
                isUpdating={updateSettingMutation.isPending}
              />
            } 
          />
          <Route 
            path="seo-tools" 
            element={
              <SEOToolsPanel 
                getSetting={getSetting} 
                onUpdate={handleSettingUpdate}
                isUpdating={updateSettingMutation.isPending}
              />
            } 
          />
          <Route 
            path="ads" 
            element={<AdSettingsPanel />} 
          />
          <Route 
            path="analytics" 
            element={
              <EnhancedAnalyticsSettings 
                getSetting={getSetting} 
                onUpdate={handleSettingUpdate}
                isUpdating={updateSettingMutation.isPending}
              />
            } 
          />
          <Route 
            path="payments" 
            element={
              <EnhancedPaymentSettings 
                getSetting={getSetting} 
                onUpdate={handleSettingUpdate}
                isUpdating={updateSettingMutation.isPending}
              />
            } 
          />
          <Route 
            path="events" 
            element={
              <EventSettings 
                getSetting={getSetting} 
                onUpdate={handleSettingUpdate}
                isUpdating={updateSettingMutation.isPending}
              />
            } 
          />
          <Route 
            path="security" 
            element={
              <EnhancedSecuritySettings 
                getSetting={getSetting} 
                onUpdate={handleSettingUpdate}
                isUpdating={updateSettingMutation.isPending}
              />
            } 
          />
          <Route 
            path="maintenance" 
            element={
              <MaintenanceSettings 
                getSetting={getSetting} 
                onUpdate={handleSettingUpdate}
                isUpdating={updateSettingMutation.isPending}
              />
            } 
          />
          <Route 
            path="testing" 
            element={<SystemTestPanel />} 
          />
          <Route 
            path="branding" 
            element={<BrandingSettings />} 
          />
        </Routes>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// General Settings Component
const GeneralSettings: React.FC<{
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}> = ({ getSetting, onUpdate, isUpdating }) => {
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');

  React.useEffect(() => {
    setSiteName(getSetting('site_name'));
    setSiteDescription(getSetting('site_description'));
  }, [getSetting]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Site Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Site Name</Label>
            <Input
              id="site-name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Your site name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Textarea
              id="site-description"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="Brief description of your site"
              rows={3}
            />
          </div>
          <Button 
            onClick={() => {
              onUpdate('site_name', siteName);
              onUpdate('site_description', siteDescription);
            }}
            disabled={isUpdating}
            className="w-full sm:w-auto"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Event Settings Component
const EventSettings: React.FC<{
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}> = ({ getSetting, onUpdate, isUpdating }) => {
  const [eventCreationFee, setEventCreationFee] = useState('');

  React.useEffect(() => {
    setEventCreationFee(getSetting('event_creation_fee'));
  }, [getSetting]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event-fee">Event Creation Fee (NGN)</Label>
            <Input
              id="event-fee"
              type="number"
              value={eventCreationFee}
              onChange={(e) => setEventCreationFee(e.target.value)}
              placeholder="2000"
            />
            <p className="text-sm text-muted-foreground">
              Fee charged to moderators for creating paid events
            </p>
          </div>
          <Button 
            onClick={() => onUpdate('event_creation_fee', eventCreationFee)}
            disabled={isUpdating}
            className="w-full sm:w-auto"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};



export default SystemSettings;