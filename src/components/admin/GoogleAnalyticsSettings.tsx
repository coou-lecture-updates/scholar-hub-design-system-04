import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart3, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const GoogleAnalyticsSettings: React.FC = () => {
  const [analyticsKey, setAnalyticsKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsKey();
  }, []);

  const fetchAnalyticsKey = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'ga_measurement_id')
        .single();

      if (data && data.value) {
        const key = (data.value as string).replace(/"/g, '');
        setAnalyticsKey(key);
      }
    } catch (error) {
      console.error('Error fetching analytics key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: 'ga_measurement_id',
          value: analyticsKey,
          description: 'Google Analytics tracking key for the application'
        }, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Google Analytics key has been updated successfully.",
      });

      // Reload the page to apply new analytics
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Error saving analytics key:', error);
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setAnalyticsKey('');
    await handleSave();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Google Analytics
        </CardTitle>
        <CardDescription>
          Configure Google Analytics tracking for your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="analyticsKey">Google Analytics Tracking ID</Label>
          <div className="relative">
            <Input
              id="analyticsKey"
              type={showKey ? 'text' : 'password'}
              placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
              value={analyticsKey}
              onChange={(e) => setAnalyticsKey(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowKey(!showKey)}
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your Google Analytics tracking ID to enable analytics tracking
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Privacy Notice:</strong> Adding Google Analytics will track user interactions 
            on your website. Make sure you comply with privacy regulations like GDPR and 
            inform users about data collection in your privacy policy.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={saving || !analyticsKey.trim()}
            className="min-w-[100px]"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              'Save Settings'
            )}
          </Button>
          
          {analyticsKey && (
            <Button 
              variant="outline" 
              onClick={handleClear}
              disabled={saving}
            >
              Clear
            </Button>
          )}
        </div>

        {analyticsKey && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Google Analytics is configured and active
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoogleAnalyticsSettings;