import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploadField } from '@/components/ui/FileUploadField';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const BrandingSettings = () => {
  const [favicon, setFavicon] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFaviconChange = (file: File | null) => {
    setFavicon(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaviconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFaviconPreview(null);
    }
  };

  const handleLogoChange = (file: File | null) => {
    setLogo(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoPreview(null);
    }
  };

  const uploadFile = async (file: File, type: 'favicon' | 'logo') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('branding')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('branding')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = [];

      if (favicon) {
        const faviconUrl = await uploadFile(favicon, 'favicon');
        updates.push({
          key: 'site_favicon',
          value: faviconUrl,
          description: 'Website favicon URL'
        });

        // Update favicon in DOM immediately
        const existingFavicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (existingFavicon) {
          existingFavicon.href = faviconUrl;
        } else {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.href = faviconUrl;
          document.head.appendChild(link);
        }
      }

      if (logo) {
        const logoUrl = await uploadFile(logo, 'logo');
        updates.push({
          key: 'site_logo',
          value: logoUrl,
          description: 'Website logo URL'
        });
      }

      // Save to system settings
      for (const update of updates) {
        await supabase
          .from('system_settings')
          .upsert({
            key: update.key,
            value: update.value,
            description: update.description
          });
      }
      
      toast({
        title: "Success",
        description: "Branding settings have been saved successfully.",
      });

      // Reset form
      setFavicon(null);
      setLogo(null);
      setFaviconPreview(null);
      setLogoPreview(null);
      
    } catch (error) {
      console.error('Branding save error:', error);
      toast({
        title: "Error",
        description: "Failed to save branding settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Favicon Settings */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Website Favicon</CardTitle>
            <CardDescription className="text-sm">
              Upload a favicon for your website. Recommended: PNG/JPG, 32x32 or 16x16 pixels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FileUploadField
              onFileUploaded={(url, file) => handleFaviconChange(file || null)}
              accept="image/png,image/jpeg,image/jpg"
              maxFileSize={1} // 1MB
              label="Choose favicon file"
              bucketName="branding"
            />
            {faviconPreview && (
              <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                <span className="text-sm font-medium">Preview:</span>
                <img
                  src={faviconPreview}
                  alt="Favicon preview"
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded border"
                />
              </div>
            )}
            <Alert className="text-xs">
              <AlertDescription>
                <strong>Note:</strong> Favicons may be cached. Users might need to refresh 
                to see the updated favicon.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* School Logo Settings */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">School Logo</CardTitle>
            <CardDescription className="text-sm">
              Upload your school's logo for navigation and site display.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FileUploadField
              onFileUploaded={(url, file) => handleLogoChange(file || null)}
              accept="image/png,image/jpeg,image/jpg"
              maxFileSize={5} // 5MB
              label="Choose logo file"
              bucketName="branding"
            />
            {logoPreview && (
              <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                <span className="text-sm font-medium">Preview:</span>
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="max-w-24 max-h-12 sm:max-w-32 sm:max-h-16 object-contain rounded border"
                />
              </div>
            )}
            <Alert className="text-xs">
              <AlertDescription>
                <strong>Tip:</strong> Use PNG with transparent background for best results. 
                Logo will be resized automatically.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={isSaving || (!favicon && !logo)}
          className="w-full sm:w-auto min-w-40"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Branding Settings
        </Button>
      </div>
    </div>
  );
};

export default BrandingSettings;