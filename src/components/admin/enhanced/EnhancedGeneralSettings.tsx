import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Globe, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Users,
  Shield,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedGeneralSettingsProps {
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

const EnhancedGeneralSettings: React.FC<EnhancedGeneralSettingsProps> = ({ 
  getSetting, 
  onUpdate, 
  isUpdating 
}) => {
  const { toast } = useToast();

  // Basic Site Information
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  
  // Advanced Settings
  const [timezone, setTimezone] = useState('');
  const [dateFormat, setDateFormat] = useState('');
  const [language, setLanguage] = useState('');
  const [currency, setCurrency] = useState('');
  
  // Feature Toggles
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load all settings
    setSiteName(getSetting('site_name') || '');
    setSiteDescription(getSetting('site_description') || '');
    setSiteTagline(getSetting('site_tagline') || '');
    setAdminEmail(getSetting('admin_email') || '');
    setSupportEmail(getSetting('support_email') || '');
    setTimezone(getSetting('timezone') || 'UTC');
    setDateFormat(getSetting('date_format') || 'YYYY-MM-DD');
    setLanguage(getSetting('language') || 'en');
    setCurrency(getSetting('currency') || 'NGN');
    setRegistrationEnabled(getSetting('registration_enabled') !== 'false');
    setMaintenanceMode(getSetting('maintenance_mode') === 'true');
    setDebugMode(getSetting('debug_mode') === 'true');
    setAnalyticsEnabled(getSetting('analytics_enabled') !== 'false');
  }, [getSetting]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!siteName.trim()) {
      newErrors.siteName = 'Site name is required';
    } else if (siteName.length > 100) {
      newErrors.siteName = 'Site name must be less than 100 characters';
    }

    if (!siteDescription.trim()) {
      newErrors.siteDescription = 'Site description is required';
    } else if (siteDescription.length > 500) {
      newErrors.siteDescription = 'Description must be less than 500 characters';
    }

    if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
      newErrors.adminEmail = 'Invalid email format';
    }

    if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      newErrors.supportEmail = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAll = () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving.",
        variant: "destructive",
      });
      return;
    }

    // Save basic settings
    onUpdate('site_name', siteName);
    onUpdate('site_description', siteDescription);
    onUpdate('site_tagline', siteTagline);
    onUpdate('admin_email', adminEmail);
    onUpdate('support_email', supportEmail);
    
    // Save advanced settings
    onUpdate('timezone', timezone);
    onUpdate('date_format', dateFormat);
    onUpdate('language', language);
    onUpdate('currency', currency);
    
    // Save feature toggles
    onUpdate('registration_enabled', registrationEnabled.toString());
    onUpdate('maintenance_mode', maintenanceMode.toString());
    onUpdate('debug_mode', debugMode.toString());
    onUpdate('analytics_enabled', analyticsEnabled.toString());

    setHasChanges(false);
    
    toast({
      title: "Settings Updated",
      description: "All general settings have been saved successfully.",
    });
  };

  const timezones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Africa/Lagos',
    'Australia/Sydney', 'America/Toronto'
  ];

  const currencies = [
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            General Settings
          </h2>
          <p className="text-muted-foreground">Configure your site's basic information and behavior</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Unsaved Changes
            </Badge>
          )}
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            System Settings
          </Badge>
        </div>
      </div>

      {/* Maintenance Mode Warning */}
      {maintenanceMode && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Maintenance Mode is Active:</strong> Your site is currently in maintenance mode. 
            Regular users cannot access the site.
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Site Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Site Name *</Label>
              <Input
                id="site-name"
                value={siteName}
                onChange={(e) => {
                  setSiteName(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Your site name"
                className={errors.siteName ? 'border-red-500' : ''}
              />
              {errors.siteName && (
                <p className="text-sm text-red-500">{errors.siteName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {siteName.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-tagline">Site Tagline</Label>
              <Input
                id="site-tagline"
                value={siteTagline}
                onChange={(e) => {
                  setSiteTagline(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Short descriptive tagline"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description *</Label>
            <Textarea
              id="site-description"
              value={siteDescription}
              onChange={(e) => {
                setSiteDescription(e.target.value);
                setHasChanges(true);
              }}
              placeholder="Brief description of your site"
              rows={3}
              className={errors.siteDescription ? 'border-red-500' : ''}
            />
            {errors.siteDescription && (
              <p className="text-sm text-red-500">{errors.siteDescription}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {siteDescription.length}/500 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="admin@yoursite.com"
                className={errors.adminEmail ? 'border-red-500' : ''}
              />
              {errors.adminEmail && (
                <p className="text-sm text-red-500">{errors.adminEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-email">Support Email</Label>
              <Input
                id="support-email"
                type="email"
                value={supportEmail}
                onChange={(e) => {
                  setSupportEmail(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="support@yoursite.com"
                className={errors.supportEmail ? 'border-red-500' : ''}
              />
              {errors.supportEmail && (
                <p className="text-sm text-red-500">{errors.supportEmail}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Localization & Format Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full p-2 border rounded-md"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <select
                id="date-format"
                value={dateFormat}
                onChange={(e) => {
                  setDateFormat(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="en">English</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  setHasChanges(true);
                }}
                className="w-full p-2 border rounded-md"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">User Registration</h4>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                checked={registrationEnabled}
                onCheckedChange={(checked) => {
                  setRegistrationEnabled(checked);
                  setHasChanges(true);
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">Maintenance Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable site for maintenance
                </p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={(checked) => {
                  setMaintenanceMode(checked);
                  setHasChanges(true);
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">Debug Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Enable detailed error reporting
                </p>
              </div>
              <Switch
                checked={debugMode}
                onCheckedChange={(checked) => {
                  setDebugMode(checked);
                  setHasChanges(true);
                }}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">Analytics Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Enable user behavior analytics
                </p>
              </div>
              <Switch
                checked={analyticsEnabled}
                onCheckedChange={(checked) => {
                  setAnalyticsEnabled(checked);
                  setHasChanges(true);
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSaveAll}
          disabled={isUpdating || !hasChanges}
          size="lg"
          className="w-full sm:w-auto min-w-[120px]"
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedGeneralSettings;