import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Wrench, AlertTriangle, Users, Globe } from 'lucide-react';

interface MaintenanceSettingsProps {
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

const MaintenanceSettings: React.FC<MaintenanceSettingsProps> = ({
  getSetting,
  onUpdate,
  isUpdating
}) => {
  // Maintenance Mode Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceTitle, setMaintenanceTitle] = useState('');
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceEstimate, setMaintenanceEstimate] = useState('');
  
  // Scheduled Maintenance
  const [scheduledMaintenance, setScheduledMaintenance] = useState(false);
  const [scheduledStartDate, setScheduledStartDate] = useState('');
  const [scheduledStartTime, setScheduledStartTime] = useState('');
  const [scheduledEndDate, setScheduledEndDate] = useState('');
  const [scheduledEndTime, setScheduledEndTime] = useState('');
  
  // Admin Access during Maintenance
  const [allowAdminAccess, setAllowAdminAccess] = useState(true);
  const [allowedEmails, setAllowedEmails] = useState('');
  
  // Maintenance Page Customization
  const [customLogo, setCustomLogo] = useState('');
  const [customBackgroundColor, setCustomBackgroundColor] = useState('#1f2937');
  const [contactEmail, setContactEmail] = useState('');
  const [socialLinks, setSocialLinks] = useState('');

  useEffect(() => {
    // Load basic maintenance settings
    setMaintenanceMode(getSetting('maintenance_mode') === 'true');
    setMaintenanceTitle(getSetting('maintenance_title') || 'We\'ll be back soon!');
    setMaintenanceMessage(getSetting('maintenance_message') || 'We are currently performing scheduled maintenance.');
    setMaintenanceEstimate(getSetting('maintenance_estimate'));
    
    // Load scheduled maintenance settings
    setScheduledMaintenance(getSetting('scheduled_maintenance') === 'true');
    setScheduledStartDate(getSetting('scheduled_start_date'));
    setScheduledStartTime(getSetting('scheduled_start_time'));
    setScheduledEndDate(getSetting('scheduled_end_date'));
    setScheduledEndTime(getSetting('scheduled_end_time'));
    
    // Load admin access settings
    setAllowAdminAccess(getSetting('allow_admin_access') !== 'false');
    setAllowedEmails(getSetting('allowed_emails'));
    
    // Load customization settings
    setCustomLogo(getSetting('maintenance_logo'));
    setCustomBackgroundColor(getSetting('maintenance_bg_color') || '#1f2937');
    setContactEmail(getSetting('maintenance_contact_email'));
    setSocialLinks(getSetting('maintenance_social_links'));
  }, [getSetting]);

  const handleSaveAll = () => {
    // Save basic maintenance settings
    onUpdate('maintenance_mode', maintenanceMode.toString());
    onUpdate('maintenance_title', maintenanceTitle);
    onUpdate('maintenance_message', maintenanceMessage);
    onUpdate('maintenance_estimate', maintenanceEstimate);
    
    // Save scheduled maintenance settings
    onUpdate('scheduled_maintenance', scheduledMaintenance.toString());
    onUpdate('scheduled_start_date', scheduledStartDate);
    onUpdate('scheduled_start_time', scheduledStartTime);
    onUpdate('scheduled_end_date', scheduledEndDate);
    onUpdate('scheduled_end_time', scheduledEndTime);
    
    // Save admin access settings
    onUpdate('allow_admin_access', allowAdminAccess.toString());
    onUpdate('allowed_emails', allowedEmails);
    
    // Save customization settings
    onUpdate('maintenance_logo', customLogo);
    onUpdate('maintenance_bg_color', customBackgroundColor);
    onUpdate('maintenance_contact_email', contactEmail);
    onUpdate('maintenance_social_links', socialLinks);
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Mode Settings</h2>
          <p className="text-muted-foreground">Configure site maintenance and downtime settings</p>
        </div>
        <Badge variant={maintenanceMode ? "destructive" : "secondary"} className="flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          {maintenanceMode ? "Maintenance Active" : "Site Online"}
        </Badge>
      </div>

      {/* Maintenance Mode Warning */}
      {maintenanceMode && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Maintenance Mode is Active</h4>
                <p className="text-sm text-red-700 mt-1">
                  Your site is currently in maintenance mode. Regular users cannot access the site.
                  {allowAdminAccess && " Admins and whitelisted users can still access the site."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Maintenance Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-amber-600" />
              <CardTitle>Maintenance Mode</CardTitle>
            </div>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={setMaintenanceMode}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maintenance-title">Maintenance Page Title</Label>
            <Input
              id="maintenance-title"
              type="text"
              placeholder="We'll be back soon!"
              value={maintenanceTitle}
              onChange={(e) => setMaintenanceTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenance-message">Maintenance Message</Label>
            <Textarea
              id="maintenance-message"
              placeholder="We are currently performing scheduled maintenance to improve your experience."
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenance-estimate">Estimated Completion</Label>
            <Input
              id="maintenance-estimate"
              type="text"
              placeholder="We expect to be back online in 2 hours"
              value={maintenanceEstimate}
              onChange={(e) => setMaintenanceEstimate(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Maintenance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle>Scheduled Maintenance</CardTitle>
            </div>
            <Switch
              checked={scheduledMaintenance}
              onCheckedChange={setScheduledMaintenance}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={scheduledStartDate}
                onChange={(e) => setScheduledStartDate(e.target.value)}
                disabled={!scheduledMaintenance}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                disabled={!scheduledMaintenance}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={scheduledEndDate}
                onChange={(e) => setScheduledEndDate(e.target.value)}
                disabled={!scheduledMaintenance}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={scheduledEndTime}
                onChange={(e) => setScheduledEndTime(e.target.value)}
                disabled={!scheduledMaintenance}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Access Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-600" />
              <CardTitle>Admin Access During Maintenance</CardTitle>
            </div>
            <Switch
              checked={allowAdminAccess}
              onCheckedChange={setAllowAdminAccess}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allowed-emails">Whitelisted Email Addresses</Label>
            <Textarea
              id="allowed-emails"
              placeholder="admin@example.com, developer@example.com"
              value={allowedEmails}
              onChange={(e) => setAllowedEmails(e.target.value)}
              disabled={!allowAdminAccess}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of email addresses that can bypass maintenance mode
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Page Customization */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-purple-600" />
            <CardTitle>Maintenance Page Customization</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-logo">Custom Logo URL</Label>
              <Input
                id="custom-logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={customLogo}
                onChange={(e) => setCustomLogo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bg-color">Background Color</Label>
              <Input
                id="bg-color"
                type="color"
                value={customBackgroundColor}
                onChange={(e) => setCustomBackgroundColor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="support@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="social-links">Social Media Links</Label>
              <Input
                id="social-links"
                type="text"
                placeholder="Twitter, Facebook URLs"
                value={socialLinks}
                onChange={(e) => setSocialLinks(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMaintenanceTitle("Emergency Maintenance");
                setMaintenanceMessage("We are currently experiencing technical difficulties and are working to resolve them as quickly as possible.");
                setMaintenanceEstimate("Expected resolution within 30 minutes");
              }}
            >
              Emergency Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMaintenanceTitle("Scheduled Maintenance");
                setMaintenanceMessage("We are performing scheduled maintenance to improve your experience. Thank you for your patience.");
                setMaintenanceEstimate("Maintenance will complete in approximately 2 hours");
              }}
            >
              Scheduled Template
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMaintenanceTitle("System Upgrade");
                setMaintenanceMessage("We are upgrading our systems to serve you better. The site will be back online shortly.");
                setMaintenanceEstimate("Upgrade expected to complete within 1 hour");
              }}
            >
              Upgrade Template
            </Button>
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
          {isUpdating ? "Saving..." : "Save Maintenance Settings"}
        </Button>
      </div>
    </div>
  );
};

export default MaintenanceSettings;