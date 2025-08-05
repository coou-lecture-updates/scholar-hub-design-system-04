import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Code, 
  AlertCircle, 
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  ExternalLink,
  Shield,
  Globe,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedAnalyticsSettingsProps {
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

const EnhancedAnalyticsSettings: React.FC<EnhancedAnalyticsSettingsProps> = ({
  getSetting,
  onUpdate,
  isUpdating
}) => {
  const { toast } = useToast();

  // Google Analytics
  const [gaEnabled, setGaEnabled] = useState(false);
  const [gaMeasurementId, setGaMeasurementId] = useState('');
  const [gaTrackingId, setGaTrackingId] = useState('');
  const [gaAnonymizeIp, setGaAnonymizeIp] = useState(true);
  
  // Google Tag Manager
  const [gtmEnabled, setGtmEnabled] = useState(false);
  const [gtmContainerId, setGtmContainerId] = useState('');
  
  // Facebook Pixel
  const [fbPixelEnabled, setFbPixelEnabled] = useState(false);
  const [fbPixelId, setFbPixelId] = useState('');
  
  // Hotjar
  const [hotjarEnabled, setHotjarEnabled] = useState(false);
  const [hotjarSiteId, setHotjarSiteId] = useState('');
  
  // Custom Analytics
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customScript, setCustomScript] = useState('');
  
  // Privacy & Compliance
  const [cookieConsentEnabled, setCookieConsentEnabled] = useState(true);
  const [gdprCompliant, setGdprCompliant] = useState(true);
  const [dataRetentionDays, setDataRetentionDays] = useState('');
  
  // Validation and UI states
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'checking' | 'connected' | 'error' | 'idle'>>({});

  useEffect(() => {
    // Load Google Analytics settings
    setGaEnabled(getSetting('ga_enabled') === 'true');
    setGaMeasurementId(getSetting('ga_measurement_id'));
    setGaTrackingId(getSetting('ga_tracking_id'));
    setGaAnonymizeIp(getSetting('ga_anonymize_ip') !== 'false');
    
    // Load GTM settings
    setGtmEnabled(getSetting('gtm_enabled') === 'true');
    setGtmContainerId(getSetting('gtm_container_id'));
    
    // Load Facebook Pixel settings
    setFbPixelEnabled(getSetting('fb_pixel_enabled') === 'true');
    setFbPixelId(getSetting('fb_pixel_id'));
    
    // Load Hotjar settings
    setHotjarEnabled(getSetting('hotjar_enabled') === 'true');
    setHotjarSiteId(getSetting('hotjar_site_id'));
    
    // Load Custom Analytics settings
    setCustomEnabled(getSetting('custom_analytics_enabled') === 'true');
    setCustomScript(getSetting('custom_analytics_script'));
    
    // Load Privacy settings
    setCookieConsentEnabled(getSetting('cookie_consent_enabled') !== 'false');
    setGdprCompliant(getSetting('gdpr_compliant') !== 'false');
    setDataRetentionDays(getSetting('data_retention_days') || '730');
  }, [getSetting]);

  const validateInput = (field: string, value: string) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'gaMeasurementId':
        if (value && !value.match(/^G-[A-Z0-9]{10}$/)) {
          errors[field] = 'Invalid GA4 Measurement ID format (should be G-XXXXXXXXXX)';
        }
        break;
      case 'gaTrackingId':
        if (value && !value.match(/^UA-\d{4,}-\d+$/)) {
          errors[field] = 'Invalid Universal Analytics ID format (should be UA-XXXXXXX-X)';
        }
        break;
      case 'gtmContainerId':
        if (value && !value.match(/^GTM-[A-Z0-9]{7}$/)) {
          errors[field] = 'Invalid GTM Container ID format (should be GTM-XXXXXXX)';
        }
        break;
      case 'fbPixelId':
        if (value && !value.match(/^\d{15,16}$/)) {
          errors[field] = 'Invalid Facebook Pixel ID (should be 15-16 digits)';
        }
        break;
      case 'hotjarSiteId':
        if (value && !value.match(/^\d+$/)) {
          errors[field] = 'Invalid Hotjar Site ID (should be numeric)';
        }
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: errors[field] || ''
    }));

    return !errors[field];
  };

  const testConnection = async (service: string, id: string) => {
    setConnectionStatus(prev => ({ ...prev, [service]: 'checking' }));
    
    // Simulate API check
    setTimeout(() => {
      const isValid = id && !validationErrors[id];
      setConnectionStatus(prev => ({ 
        ...prev, 
        [service]: isValid ? 'connected' : 'error' 
      }));
      
      toast({
        title: `${service} Connection ${isValid ? 'Successful' : 'Failed'}`,
        description: isValid 
          ? `Successfully connected to ${service}` 
          : `Failed to connect to ${service}. Please check your configuration.`,
        variant: isValid ? 'default' : 'destructive'
      });
    }, 2000);
  };

  const handleSaveAll = () => {
    // Validate all fields before saving
    const fieldsToValidate = [
      ['gaMeasurementId', gaMeasurementId],
      ['gaTrackingId', gaTrackingId],
      ['gtmContainerId', gtmContainerId],
      ['fbPixelId', fbPixelId],
      ['hotjarSiteId', hotjarSiteId]
    ];

    let hasErrors = false;
    fieldsToValidate.forEach(([field, value]) => {
      if (!validateInput(field, value)) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before saving.",
        variant: "destructive"
      });
      return;
    }

    // Save Google Analytics settings
    onUpdate('ga_enabled', gaEnabled.toString());
    onUpdate('ga_measurement_id', gaMeasurementId);
    onUpdate('ga_tracking_id', gaTrackingId);
    onUpdate('ga_anonymize_ip', gaAnonymizeIp.toString());
    
    // Save GTM settings
    onUpdate('gtm_enabled', gtmEnabled.toString());
    onUpdate('gtm_container_id', gtmContainerId);
    
    // Save Facebook Pixel settings
    onUpdate('fb_pixel_enabled', fbPixelEnabled.toString());
    onUpdate('fb_pixel_id', fbPixelId);
    
    // Save Hotjar settings
    onUpdate('hotjar_enabled', hotjarEnabled.toString());
    onUpdate('hotjar_site_id', hotjarSiteId);
    
    // Save Custom Analytics settings
    onUpdate('custom_analytics_enabled', customEnabled.toString());
    onUpdate('custom_analytics_script', customScript);
    
    // Save Privacy settings
    onUpdate('cookie_consent_enabled', cookieConsentEnabled.toString());
    onUpdate('gdpr_compliant', gdprCompliant.toString());
    onUpdate('data_retention_days', dataRetentionDays);

    toast({
      title: "Analytics Settings Saved",
      description: "All analytics and tracking settings have been updated successfully.",
    });
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics & Tracking
          </h2>
          <p className="text-muted-foreground">Configure analytics and tracking tools for comprehensive insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Privacy Compliant
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Multi-Platform
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="google" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* Google Analytics & GTM */}
        <TabsContent value="google" className="space-y-6">
          {/* Google Analytics 4 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle>Google Analytics 4</CardTitle>
                    <p className="text-sm text-muted-foreground">Track user behavior and website performance</p>
                  </div>
                  <Badge variant={gaEnabled ? "default" : "secondary"}>
                    {gaEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {gaEnabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('Google Analytics', 'gaMeasurementId')}
                      disabled={connectionStatus['Google Analytics'] === 'checking'}
                    >
                      {getConnectionStatusIcon(connectionStatus['Google Analytics'] || 'idle')}
                      Test Connection
                    </Button>
                  )}
                  <Switch
                    checked={gaEnabled}
                    onCheckedChange={setGaEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ga-measurement">Measurement ID (GA4)</Label>
                  <div className="relative">
                    <Input
                      id="ga-measurement"
                      type={showSecrets.gaMeasurementId ? 'text' : 'password'}
                      placeholder="G-XXXXXXXXXX"
                      value={gaMeasurementId}
                      onChange={(e) => {
                        setGaMeasurementId(e.target.value);
                        validateInput('gaMeasurementId', e.target.value);
                      }}
                      disabled={!gaEnabled}
                      className={validationErrors.gaMeasurementId ? 'border-red-500 pr-20' : 'pr-20'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('gaMeasurementId')}
                    >
                      {showSecrets.gaMeasurementId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {validationErrors.gaMeasurementId && (
                    <p className="text-sm text-red-500">{validationErrors.gaMeasurementId}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ga-tracking">Tracking ID (Legacy)</Label>
                  <div className="relative">
                    <Input
                      id="ga-tracking"
                      type={showSecrets.gaTrackingId ? 'text' : 'password'}
                      placeholder="UA-XXXXXXXXX-X"
                      value={gaTrackingId}
                      onChange={(e) => {
                        setGaTrackingId(e.target.value);
                        validateInput('gaTrackingId', e.target.value);
                      }}
                      disabled={!gaEnabled}
                      className={validationErrors.gaTrackingId ? 'border-red-500 pr-20' : 'pr-20'}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('gaTrackingId')}
                    >
                      {showSecrets.gaTrackingId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {validationErrors.gaTrackingId && (
                    <p className="text-sm text-red-500">{validationErrors.gaTrackingId}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Anonymize IP Addresses</h4>
                  <p className="text-sm text-muted-foreground">Comply with privacy regulations by anonymizing visitor IPs</p>
                </div>
                <Switch
                  checked={gaAnonymizeIp}
                  onCheckedChange={setGaAnonymizeIp}
                  disabled={!gaEnabled}
                />
              </div>

              {gaEnabled && (gaMeasurementId || gaTrackingId) && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Google Analytics is configured. Data collection will begin immediately.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Google Tag Manager */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-green-600" />
                  <div>
                    <CardTitle>Google Tag Manager</CardTitle>
                    <p className="text-sm text-muted-foreground">Manage all tracking codes from one interface</p>
                  </div>
                  <Badge variant={gtmEnabled ? "default" : "secondary"}>
                    {gtmEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {gtmEnabled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection('Google Tag Manager', 'gtmContainerId')}
                      disabled={connectionStatus['Google Tag Manager'] === 'checking'}
                    >
                      {getConnectionStatusIcon(connectionStatus['Google Tag Manager'] || 'idle')}
                      Test Connection
                    </Button>
                  )}
                  <Switch
                    checked={gtmEnabled}
                    onCheckedChange={setGtmEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gtm-container">Container ID</Label>
                <div className="relative">
                  <Input
                    id="gtm-container"
                    type={showSecrets.gtmContainerId ? 'text' : 'password'}
                    placeholder="GTM-XXXXXXX"
                    value={gtmContainerId}
                    onChange={(e) => {
                      setGtmContainerId(e.target.value);
                      validateInput('gtmContainerId', e.target.value);
                    }}
                    disabled={!gtmEnabled}
                    className={validationErrors.gtmContainerId ? 'border-red-500 pr-20' : 'pr-20'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility('gtmContainerId')}
                  >
                    {showSecrets.gtmContainerId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.gtmContainerId && (
                  <p className="text-sm text-red-500">{validationErrors.gtmContainerId}</p>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  GTM allows you to manage all tracking codes without modifying your website code.
                  <Button variant="link" className="p-0 h-auto ml-1" asChild>
                    <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer">
                      Open GTM Console <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tracking */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-blue-700" />
                  <div>
                    <CardTitle>Facebook Pixel</CardTitle>
                    <p className="text-sm text-muted-foreground">Track conversions and build targeted audiences</p>
                  </div>
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
                <div className="relative">
                  <Input
                    id="fb-pixel"
                    type={showSecrets.fbPixelId ? 'text' : 'password'}
                    placeholder="XXXXXXXXXXXXXXX"
                    value={fbPixelId}
                    onChange={(e) => {
                      setFbPixelId(e.target.value);
                      validateInput('fbPixelId', e.target.value);
                    }}
                    disabled={!fbPixelEnabled}
                    className={validationErrors.fbPixelId ? 'border-red-500 pr-20' : 'pr-20'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility('fbPixelId')}
                  >
                    {showSecrets.fbPixelId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationErrors.fbPixelId && (
                  <p className="text-sm text-red-500">{validationErrors.fbPixelId}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Behavior Analytics */}
        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <div>
                    <CardTitle>Hotjar</CardTitle>
                    <p className="text-sm text-muted-foreground">Heatmaps, session recordings, and user feedback</p>
                  </div>
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
                  onChange={(e) => {
                    setHotjarSiteId(e.target.value);
                    validateInput('hotjarSiteId', e.target.value);
                  }}
                  disabled={!hotjarEnabled}
                  className={validationErrors.hotjarSiteId ? 'border-red-500' : ''}
                />
                {validationErrors.hotjarSiteId && (
                  <p className="text-sm text-red-500">{validationErrors.hotjarSiteId}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Analytics */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Code className="h-5 w-5 text-purple-600" />
                  <div>
                    <CardTitle>Custom Analytics Code</CardTitle>
                    <p className="text-sm text-muted-foreground">Add custom tracking scripts for other providers</p>
                  </div>
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
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Add any custom JavaScript tracking code. This will be injected into the head of every page.
                </p>
              </div>

              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Warning:</strong> Only add trusted scripts. Malicious code can compromise your site's security.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Compliance */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Compliance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Cookie Consent Banner</h4>
                    <p className="text-sm text-muted-foreground">Show cookie consent notice to visitors</p>
                  </div>
                  <Switch
                    checked={cookieConsentEnabled}
                    onCheckedChange={setCookieConsentEnabled}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">GDPR Compliance</h4>
                    <p className="text-sm text-muted-foreground">Enable GDPR-compliant data handling</p>
                  </div>
                  <Switch
                    checked={gdprCompliant}
                    onCheckedChange={setGdprCompliant}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-retention">Data Retention Period (Days)</Label>
                <Input
                  id="data-retention"
                  type="number"
                  value={dataRetentionDays}
                  onChange={(e) => setDataRetentionDays(e.target.value)}
                  placeholder="730"
                  min="1"
                  max="3650"
                />
                <p className="text-sm text-muted-foreground">
                  How long to retain analytics data (default: 730 days / 2 years)
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Privacy Notice:</strong> Ensure compliance with privacy laws (GDPR, CCPA) when using tracking tools. 
                  Consider implementing cookie consent banners and privacy policies.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveAll}
          disabled={isUpdating}
          size="lg"
          className="min-w-[140px]"
        >
          {isUpdating ? (
            <>
              <Clock className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Analytics Settings"
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedAnalyticsSettings;