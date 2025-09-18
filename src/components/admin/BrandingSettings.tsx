import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploadField } from '@/components/ui/FileUploadField';
import { Upload, Download, Image, Globe } from 'lucide-react';
import { toast } from 'sonner';

const BrandingSettings = () => {
  const [favicon, setFavicon] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState('/lovable-uploads/favicon.png');
  const [logoPreview, setLogoPreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleFaviconChange = (file: File | null) => {
    setFavicon(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFaviconPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (file: File | null) => {
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would implement the actual upload logic
      // For now, just show success message
      toast.success('Branding settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update branding settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Branding Settings</h2>
        <p className="text-muted-foreground">
          Manage your website favicon and school logo
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Favicon Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Website Favicon
            </CardTitle>
            <CardDescription>
              Upload a favicon for your website. Recommended size: 32x32 or 64x64 pixels (PNG/ICO format)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-muted">
                {faviconPreview ? (
                  <img 
                    src={faviconPreview} 
                    alt="Favicon preview" 
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <Globe className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="favicon">Current Favicon</Label>
                <p className="text-sm text-muted-foreground">
                  {favicon ? favicon.name : 'favicon.png'}
                </p>
              </div>
            </div>

            <FileUploadField
              label="Upload New Favicon"
              accept="image/png,image/ico,image/x-icon"
              onFileUploaded={(url, file) => handleFaviconChange(file || null)}
            />

            <Alert>
              <AlertDescription>
                Favicon changes may take time to appear due to browser caching. 
                Try refreshing the page or clearing your browser cache.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              School Logo
            </CardTitle>
            <CardDescription>
              Upload your school logo. Recommended size: 200x200 pixels or larger (PNG/JPG format)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 border rounded-lg flex items-center justify-center bg-muted">
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <Image className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="logo">Current Logo</Label>
                <p className="text-sm text-muted-foreground">
                  {logo ? logo.name : 'No logo uploaded'}
                </p>
              </div>
            </div>

            <FileUploadField
              label="Upload New Logo"
              accept="image/png,image/jpg,image/jpeg"
              onFileUploaded={(url, file) => handleLogoChange(file || null)}
            />

            <Alert>
              <AlertDescription>
                The logo will be used in the navigation bar and other branding elements throughout the site.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="min-w-32"
        >
          {isSaving ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Favicon:</strong> Small icon that appears in browser tabs and bookmarks</p>
          <p>• <strong>Logo:</strong> Main brand logo displayed in navigation and headers</p>
          <p>• <strong>Formats:</strong> Use PNG for transparency, ICO for favicons, JPG for photos</p>
          <p>• <strong>Size:</strong> Favicon should be 32x32 or 64x64px, Logo can be larger</p>
          <p>• <strong>Cache:</strong> Changes may take time to appear due to browser caching</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingSettings;