import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Download, Search, Globe, FileText } from 'lucide-react';
import { downloadSitemap, downloadRobotsTxt, generateSitemap, generateRobotsTxt } from '@/utils/sitemap';

interface SEOToolsPanelProps {
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

const SEOToolsPanel: React.FC<SEOToolsPanelProps> = ({ getSetting, onUpdate, isUpdating }) => {
  const [robotsContent, setRobotsContent] = useState(
    getSetting('robots_txt_content') || ''
  );
  const [sitemapPreview, setSitemapPreview] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerateSitemap = async () => {
    setGenerating(true);
    try {
      const sitemap = await generateSitemap();
      setSitemapPreview(sitemap);
      toast.success('Sitemap generated successfully');
    } catch (error) {
      toast.error('Error generating sitemap');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveRobots = () => {
    onUpdate('robots_txt_content', robotsContent);
    toast.success('Robots.txt content saved');
  };

  const testSearchEngineIndexing = () => {
    const currentUrl = window.location.origin;
    const searchEngines = [
      {
        name: 'Google',
        url: `https://www.google.com/ping?sitemap=${encodeURIComponent(currentUrl + '/sitemap.xml')}`
      },
      {
        name: 'Bing',
        url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(currentUrl + '/sitemap.xml')}`
      }
    ];

    searchEngines.forEach(engine => {
      window.open(engine.url, '_blank');
    });
    
    toast.success('Opened sitemap submission pages for Google and Bing');
  };

  return (
    <div className="space-y-6">
      {/* Sitemap Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Sitemap Generator
          </CardTitle>
          <CardDescription>
            Generate XML sitemap for search engines to crawl your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateSitemap}
              disabled={generating}
              variant="outline"
            >
              <Search className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate Sitemap'}
            </Button>
            <Button
              onClick={downloadSitemap}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sitemap
            </Button>
            <Button
              onClick={testSearchEngineIndexing}
              variant="outline"
            >
              <Globe className="w-4 h-4 mr-2" />
              Submit to Search Engines
            </Button>
          </div>
          
          {sitemapPreview && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Sitemap Preview:</label>
              <Textarea
                value={sitemapPreview}
                readOnly
                className="font-mono text-xs"
                rows={10}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Robots.txt Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Robots.txt Configuration
          </CardTitle>
          <CardDescription>
            Configure crawler access rules for search engines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Robots.txt Content:</label>
            <Textarea
              value={robotsContent}
              onChange={(e) => setRobotsContent(e.target.value)}
              placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/"
              className="font-mono text-xs"
              rows={8}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSaveRobots}
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Robots.txt'}
            </Button>
            <Button
              onClick={downloadRobotsTxt}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Robots.txt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SEO Status */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Status & Tips</CardTitle>
          <CardDescription>
            Important information for search engine optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Search Engine Verification</h4>
              <p>Make sure to:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Add your Google Search Console verification meta tag</li>
                <li>Add your Bing Webmaster Tools verification meta tag</li>
                <li>Submit your sitemap to both search engines</li>
                <li>Monitor your site's indexing status regularly</li>
              </ul>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium mb-2">SEO Best Practices</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Keep page titles under 60 characters</li>
                <li>Keep meta descriptions under 160 characters</li>
                <li>Use descriptive, keyword-rich URLs</li>
                <li>Optimize images with alt text</li>
                <li>Ensure fast page loading times</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOToolsPanel;