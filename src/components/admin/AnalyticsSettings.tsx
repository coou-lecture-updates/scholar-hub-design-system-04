import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Target, Code, AlertCircle } from 'lucide-react';

interface AnalyticsSettingsProps {
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

const AnalyticsSettings: React.FC<AnalyticsSettingsProps> = ({
  getSetting,
  onUpdate,
  isUpdating
}) => {
  // Google Analytics
  const [gaEnabled, setGaEnabled] = useState(false);
  const [gaMeasurementId, setGaMeasurementId] = useState('');
  const [gaTrackingId, setGaTrackingId] = useState('');
  
  // Google Tag Manager
  const [gtmEnabled, setGtmEnabled] = useState(false);
  const [gtmContainerId, setGtmContainerId] = useState('');
  
  // Facebook Pixel
  const [fbPixelEnabled, setFbPixelEnabled] = useState(false);
  const [fbPixelId, setFbPixelId] = useState('');
  
  // Custom Analytics
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customScript, setCustomScript] = useState('');
  
  // Heatmap & Session Recording
  const [hotjarEnabled, setHotjarEnabled] = useState(false);
  const [hotjarSiteId, setHotjarSiteId] = useState('');

  useEffect(() => {
    // Load Google Analytics settings
    setGaEnabled(getSetting('ga_enabled') === 'true');
    setGaMeasurementId(getSetting('ga_measurement_id'));
    setGaTrackingId(getSetting('ga_tracking_id'));
    
    // Load GTM settings
    setGtmEnabled(getSetting('gtm_enabled') === 'true');
    setGtmContainerId(getSetting('gtm_container_id'));
    
    // Load Facebook Pixel settings
    setFbPixelEnabled(getSetting('fb_pixel_enabled') === 'true');
    setFbPixelId(getSetting('fb_pixel_id'));
    
    // Load Custom Analytics settings
    setCustomEnabled(getSetting('custom_analytics_enabled') === 'true');
    setCustomScript(getSetting('custom_analytics_script'));
    
    // Load Hotjar settings
    setHotjarEnabled(getSetting('hotjar_enabled') === 'true');
    setHotjarSiteId(getSetting('hotjar_site_id'));
  }, [getSetting]);

  const handleSaveAll = () => {
    // Save Google Analytics settings
    onUpdate('ga_enabled', gaEnabled.toString());
    onUpdate('ga_measurement_id', gaMeasurementId);
    onUpdate('ga_tracking_id', gaTrackingId);
    
    // Save GTM settings
    onUpdate('gtm_enabled', gtmEnabled.toString());
    onUpdate('gtm_container_id', gtmContainerId);
    
    // Save Facebook Pixel settings
    onUpdate('fb_pixel_enabled', fbPixelEnabled.toString());
    onUpdate('fb_pixel_id', fbPixelId);
    
    // Save Custom Analytics settings
    onUpdate('custom_analytics_enabled', customEnabled.toString());
    onUpdate('custom_analytics_script', customScript);
    
    // Save Hotjar settings
    onUpdate('hotjar_enabled', hotjarEnabled.toString());
    onUpdate('hotjar_site_id', hotjarSiteId);
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Tracking Settings</h2>
          <p className="text-muted-foreground">Configure analytics and tracking tools for your platform</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics Configuration
        </Badge>
      </div>

      {/* Google Analytics 4 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <CardTitle>Google Analytics 4</CardTitle>
              <Badge variant={gaEnabled ? "default" : "secondary"}>
                {gaEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Switch
              checked={gaEnabled}
              onCheckedChange={setGaEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ga-measurement">Measurement ID (GA4)</Label>
              <Input
                id="ga-measurement"
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={gaMeasurementId}
                onChange={(e) => setGaMeasurementId(e.target.value)}
                disabled={!gaEnabled}
              />
              <p className="text-xs text-muted-foreground">New GA4 format starting with G-</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ga-tracking">Tracking ID (Legacy)</Label>
              <Input
                id="ga-tracking"
                type="text"
                placeholder="UA-XXXXXXXXX-X"
                value={gaTrackingId}
                onChange={(e) => setGaTrackingId(e.target.value)}
                disabled={!gaEnabled}
              />
              <p className="text-xs text-muted-foreground">Legacy Universal Analytics format</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Tag Manager */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-green-600" />
              <CardTitle>Google Tag Manager</CardTitle>
              <Badge variant={gtmEnabled ? "default" : "secondary"}>
                {gtmEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Switch
              checked={gtmEnabled}
              onCheckedChange={setGtmEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gtm-container">Container ID</Label>
            <Input
              id="gtm-container"
              type="text"
              placeholder="GTM-XXXXXXX"
              value={gtmContainerId}
              onChange={(e) => setGtmContainerId(e.target.value)}
              disabled={!gtmEnabled}
            />
            <p className="text-xs text-muted-foreground">
              GTM allows you to manage all tracking codes from one interface
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Facebook Pixel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-blue-700" />
              <CardTitle>Facebook Pixel</CardTitle>
              <Badge variant={fbPixelEnabled ? "default" : "secondary"}>
                {fbPixelEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Switch
              checked={fbPixelEnabled}
              onCheckedChange={setFbPixelEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fb-pixel">Pixel ID</Label>
            <Input
              id="fb-pixel"
              type="text"
              placeholder="XXXXXXXXXXXXXXX"
              value={fbPixelId}
              onChange={(e) => setFbPixelId(e.target.value)}
              disabled={!fbPixelEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Track conversions, optimize ads, and build targeted audiences
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Hotjar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <CardTitle>Hotjar (Heatmaps & Recordings)</CardTitle>
              <Badge variant={hotjarEnabled ? "default" : "secondary"}>
                {hotjarEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Switch
              checked={hotjarEnabled}
              onCheckedChange={setHotjarEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hotjar-site">Site ID</Label>
            <Input
              id="hotjar-site"
              type="text"
              placeholder="XXXXXXX"
              value={hotjarSiteId}
              onChange={(e) => setHotjarSiteId(e.target.value)}
              disabled={!hotjarEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Understand user behavior with heatmaps and session recordings
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Analytics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code className="h-5 w-5 text-purple-600" />
              <CardTitle>Custom Analytics Code</CardTitle>
              <Badge variant={customEnabled ? "default" : "secondary"}>
                {customEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Switch
              checked={customEnabled}
              onCheckedChange={setCustomEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-script">Custom Tracking Script</Label>
            <Textarea
              id="custom-script"
              placeholder="<!-- Your custom analytics code here -->"
              value={customScript}
              onChange={(e) => setCustomScript(e.target.value)}
              disabled={!customEnabled}
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Add custom tracking scripts for other analytics providers
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Privacy & Compliance</h4>
              <p className="text-sm text-blue-700 mt-1">
                Ensure compliance with privacy laws (GDPR, CCPA) when using tracking tools. 
                Consider implementing cookie consent banners and privacy policies.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveAll}
          disabled={isUpdating}
          size="lg"
        >
          {isUpdating ? "Saving..." : "Save Analytics Settings"}
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsSettings;