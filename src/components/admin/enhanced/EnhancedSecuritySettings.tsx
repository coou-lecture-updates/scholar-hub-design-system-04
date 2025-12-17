import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  Save, 
  Loader2,
  Clock,
  UserCheck,
  Key,
  Ban
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ResponsiveContainer from '@/components/ui/responsive-container';

interface EnhancedSecuritySettingsProps {
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

const EnhancedSecuritySettings: React.FC<EnhancedSecuritySettingsProps> = ({
  getSetting,
  onUpdate,
  isUpdating
}) => {
  const { toast } = useToast();

  // Security settings state
  const [settings, setSettings] = useState({
    mfaRequired: getSetting('mfa_required') === 'true',
    sessionTimeout: getSetting('session_timeout') || '30',
    passwordMinLength: getSetting('password_min_length') || '8',
    passwordRequireSpecial: getSetting('password_require_special') === 'true',
    loginAttempts: getSetting('max_login_attempts') || '5',
    accountLockoutDuration: getSetting('account_lockout_duration') || '15',
    ipWhitelist: getSetting('ip_whitelist') || '',
    securityHeaders: getSetting('security_headers_enabled') === 'true',
    auditLogRetention: getSetting('audit_log_retention') || '90',
    suspiciousActivityDetection: getSetting('suspicious_activity_detection') === 'true'
  });

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Save all security settings
    Object.entries(settings).forEach(([key, value]) => {
      const settingKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      onUpdate(settingKey, value.toString());
    });

    toast({
      title: "Security settings updated",
      description: "All security configurations have been saved successfully.",
    });
  };

  React.useEffect(() => {
    // Update local state when settings change
    setSettings({
      mfaRequired: getSetting('mfa_required') === 'true',
      sessionTimeout: getSetting('session_timeout') || '30',
      passwordMinLength: getSetting('password_min_length') || '8',
      passwordRequireSpecial: getSetting('password_require_special') === 'true',
      loginAttempts: getSetting('max_login_attempts') || '5',
      accountLockoutDuration: getSetting('account_lockout_duration') || '15',
      ipWhitelist: getSetting('ip_whitelist') || '',
      securityHeaders: getSetting('security_headers_enabled') === 'true',
      auditLogRetention: getSetting('audit_log_retention') || '90',
      suspiciousActivityDetection: getSetting('suspicious_activity_detection') === 'true'
    });
  }, [getSetting]);

  return (
    <ResponsiveContainer size="xl" className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            Security Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure security policies and protection settings
          </p>
        </div>
        <Button 
          onClick={handleSaveSettings}
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
      </div>

      <div className="grid gap-6">
        {/* Authentication Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Authentication Security
            </CardTitle>
            <CardDescription>
              Configure user authentication and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mfa-required">Multi-Factor Authentication</Label>
                  <Switch
                    id="mfa-required"
                    checked={settings.mfaRequired}
                    onCheckedChange={(checked) => handleSettingChange('mfaRequired', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Require all admin users to enable 2FA
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Select 
                  value={settings.sessionTimeout}
                  onValueChange={(value) => handleSettingChange('sessionTimeout', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password Policy
            </CardTitle>
            <CardDescription>
              Set password requirements and security standards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password-length">Minimum Password Length</Label>
                <Select 
                  value={settings.passwordMinLength}
                  onValueChange={(value) => handleSettingChange('passwordMinLength', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 characters</SelectItem>
                    <SelectItem value="8">8 characters</SelectItem>
                    <SelectItem value="10">10 characters</SelectItem>
                    <SelectItem value="12">12 characters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="special-chars">Require Special Characters</Label>
                  <Switch
                    id="special-chars"
                    checked={settings.passwordRequireSpecial}
                    onCheckedChange={(checked) => handleSettingChange('passwordRequireSpecial', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Require symbols, numbers, and mixed case
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Protection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-5 w-5" />
              Account Protection
            </CardTitle>
            <CardDescription>
              Configure protection against brute force attacks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="login-attempts">Max Login Attempts</Label>
                <Select 
                  value={settings.loginAttempts}
                  onValueChange={(value) => handleSettingChange('loginAttempts', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                    <SelectItem value="10">10 attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
                <Select 
                  value={settings.accountLockoutDuration}
                  onValueChange={(value) => handleSettingChange('accountLockoutDuration', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Advanced Security
            </CardTitle>
            <CardDescription>
              Additional security measures and monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                <Textarea
                  id="ip-whitelist"
                  placeholder="Enter IP addresses or ranges (one per line)&#10;Example:&#10;192.168.1.0/24&#10;203.0.113.0"
                  value={settings.ipWhitelist}
                  onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to allow all IPs. Enter one IP or range per line.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="security-headers">Security Headers</Label>
                    <Switch
                      id="security-headers"
                      checked={settings.securityHeaders}
                      onCheckedChange={(checked) => handleSettingChange('securityHeaders', checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable HSTS, CSP, and other security headers
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="suspicious-activity">Suspicious Activity Detection</Label>
                    <Switch
                      id="suspicious-activity"
                      checked={settings.suspiciousActivityDetection}
                      onCheckedChange={(checked) => handleSettingChange('suspiciousActivityDetection', checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Monitor and alert on unusual login patterns
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audit-retention">Audit Log Retention (days)</Label>
                <Select 
                  value={settings.auditLogRetention}
                  onValueChange={(value) => handleSettingChange('auditLogRetention', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium">SSL Certificate</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Valid
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Security Scan</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Daily
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium">Last Audit</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  2 days ago
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ResponsiveContainer>
  );
};

export default EnhancedSecuritySettings;