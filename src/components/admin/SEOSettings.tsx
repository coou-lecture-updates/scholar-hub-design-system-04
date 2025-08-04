import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Globe, Save, Loader2 } from 'lucide-react';

interface SEOSettingsProps {
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

const SEOSettings: React.FC<SEOSettingsProps> = ({ getSetting, onUpdate, isUpdating }) => {
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [twitterCard, setTwitterCard] = useState('');
  const [googleVerification, setGoogleVerification] = useState('');
  const [bingVerification, setBingVerification] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    setSeoTitle(getSetting('seo_title'));
    setSeoDescription(getSetting('seo_description'));
    setSeoKeywords(getSetting('seo_keywords'));
    setOgTitle(getSetting('og_title'));
    setOgDescription(getSetting('og_description'));
    setOgImage(getSetting('og_image'));
    setTwitterCard(getSetting('twitter_card'));
    setGoogleVerification(getSetting('google_verification'));
    setBingVerification(getSetting('bing_verification'));
  }, [getSetting]);

  const handleSaveAll = () => {
    const updates = [
      { key: 'seo_title', value: seoTitle },
      { key: 'seo_description', value: seoDescription },
      { key: 'seo_keywords', value: seoKeywords },
      { key: 'og_title', value: ogTitle },
      { key: 'og_description', value: ogDescription },
      { key: 'og_image', value: ogImage },
      { key: 'twitter_card', value: twitterCard },
      { key: 'google_verification', value: googleVerification },
      { key: 'bing_verification', value: bingVerification }
    ];

    updates.forEach(({ key, value }) => onUpdate(key, value));
  };

  return (
    <div className="space-y-6">
      {/* Basic SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Basic SEO Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input
              id="seo-title"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Your site's SEO title"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 50-60 characters. Current: {seoTitle.length}/60
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-description">SEO Description</Label>
            <Textarea
              id="seo-description"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              placeholder="Brief description for search engines"
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 150-160 characters. Current: {seoDescription.length}/160
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-keywords">SEO Keywords</Label>
            <Input
              id="seo-keywords"
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-muted-foreground">
              Separate keywords with commas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Open Graph (Social Media)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="og-title">OG Title</Label>
            <Input
              id="og-title"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder="Title for social media shares"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-description">OG Description</Label>
            <Textarea
              id="og-description"
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="Description for social media shares"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-image">OG Image URL</Label>
            <Input
              id="og-image"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Recommended size: 1200x630 pixels
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter-card">Twitter Card Type</Label>
            <Input
              id="twitter-card"
              value={twitterCard}
              onChange={(e) => setTwitterCard(e.target.value)}
              placeholder="summary_large_image"
            />
          </div>
        </CardContent>
      </Card>

      {/* Search Engine Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Search Engine Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-verification">Google Search Console</Label>
            <Input
              id="google-verification"
              value={googleVerification}
              onChange={(e) => setGoogleVerification(e.target.value)}
              placeholder="Google verification meta tag content"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bing-verification">Bing Webmaster Tools</Label>
            <Input
              id="bing-verification"
              value={bingVerification}
              onChange={(e) => setBingVerification(e.target.value)}
              placeholder="Bing verification meta tag content"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button 
        onClick={handleSaveAll}
        disabled={isUpdating}
        className="w-full sm:w-auto"
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save All SEO Settings
      </Button>
    </div>
  );
};

export default SEOSettings;