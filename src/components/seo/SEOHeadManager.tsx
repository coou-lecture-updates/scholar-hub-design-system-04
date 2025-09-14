import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SEOSettings {
  site_title: string;
  site_description: string;
  site_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_url: string;
  twitter_card: string;
  twitter_site: string;
  twitter_creator: string;
  google_verification: string;
  bing_verification: string;
  canonical_url: string;
}

const SEOHeadManager: React.FC = () => {
  const [seoSettings, setSeoSettings] = useState<Partial<SEOSettings>>({});

  useEffect(() => {
    const fetchSEOSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key, value')
          .in('key', [
            'site_title',
            'site_description', 
            'site_keywords',
            'og_title',
            'og_description',
            'og_image',
            'og_url',
            'twitter_card',
            'twitter_site',
            'twitter_creator',
            'google_verification',
            'bing_verification',
            'canonical_url'
          ]);

        if (error || !data) return;

        const settings: Partial<SEOSettings> = {};
        data.forEach(setting => {
          if (setting.value && setting.value !== '""' && setting.value.trim() !== '') {
            settings[setting.key as keyof SEOSettings] = setting.value.replace(/"/g, '');
          }
        });

        setSeoSettings(settings);
      } catch (error) {
        console.error('Error fetching SEO settings:', error);
      }
    };

    fetchSEOSettings();

    // Listen for changes to system settings
    const subscription = supabase
      .channel('seo_settings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'system_settings' },
        () => {
          fetchSEOSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    if (Object.keys(seoSettings).length === 0) return;

    // Update document title
    if (seoSettings.site_title) {
      document.title = seoSettings.site_title;
    }

    // Remove existing meta tags that we manage
    const managedTags = [
      'description',
      'keywords', 
      'google-site-verification',
      'msvalidate.01',
      'canonical'
    ];

    const managedProperties = [
      'og:title',
      'og:description',
      'og:image',
      'og:url',
      'og:type',
      'twitter:card',
      'twitter:site',
      'twitter:creator',
      'twitter:title',
      'twitter:description',
      'twitter:image'
    ];

    // Remove existing managed meta tags
    managedTags.forEach(name => {
      const existing = document.querySelector(`meta[name="${name}"]`);
      if (existing) existing.remove();
    });

    managedProperties.forEach(property => {
      const existing = document.querySelector(`meta[property="${property}"]`);
      if (existing) existing.remove();
    });

    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) existingCanonical.remove();

    // Add new meta tags
    const metaTags = [
      // Basic SEO
      { name: 'description', content: seoSettings.site_description },
      { name: 'keywords', content: seoSettings.site_keywords },
      
      // Search engine verification
      { name: 'google-site-verification', content: seoSettings.google_verification },
      { name: 'msvalidate.01', content: seoSettings.bing_verification },
      
      // Open Graph
      { property: 'og:title', content: seoSettings.og_title || seoSettings.site_title },
      { property: 'og:description', content: seoSettings.og_description || seoSettings.site_description },
      { property: 'og:image', content: seoSettings.og_image },
      { property: 'og:url', content: seoSettings.og_url || window.location.href },
      { property: 'og:type', content: 'website' },
      
      // Twitter Card
      { name: 'twitter:card', content: seoSettings.twitter_card || 'summary_large_image' },
      { name: 'twitter:site', content: seoSettings.twitter_site },
      { name: 'twitter:creator', content: seoSettings.twitter_creator },
      { name: 'twitter:title', content: seoSettings.og_title || seoSettings.site_title },
      { name: 'twitter:description', content: seoSettings.og_description || seoSettings.site_description },
      { name: 'twitter:image', content: seoSettings.og_image }
    ];

    // Add meta tags to document head
    metaTags.forEach(tag => {
      if (tag.content && tag.content.trim() !== '') {
        const meta = document.createElement('meta');
        if (tag.name) meta.name = tag.name;
        if (tag.property) meta.setAttribute('property', tag.property);
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });

    // Add canonical URL
    if (seoSettings.canonical_url) {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = seoSettings.canonical_url;
      document.head.appendChild(canonical);
    }

    // Add structured data for organization
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": seoSettings.site_title || "COOU Updates",
      "description": seoSettings.site_description || "Official updates portal for Chukwuemeka Odumegwu Ojukwu University",
      "url": seoSettings.og_url || window.location.origin,
      "logo": seoSettings.og_image,
      "sameAs": seoSettings.twitter_site ? [`https://twitter.com/${seoSettings.twitter_site.replace('@', '')}`] : []
    };

    // Remove existing structured data
    const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
    if (existingStructuredData) existingStructuredData.remove();

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [seoSettings]);

  return null; // This component doesn't render anything visible
};

export default SEOHeadManager;