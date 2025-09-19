import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SEOSettings {
  site_name: string;
  site_favicon: string;
  site_logo: string;
  site_title: string;
  site_description: string;
  site_keywords: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_url: string;
  twitter_card: string;
  twitter_site: string;
  twitter_image: string;
  google_site_verification: string;
  bing_site_verification: string;
}

const SEOHeadManager: React.FC = () => {
  const [seoSettings, setSeoSettings] = useState<Partial<SEOSettings>>({});

  useEffect(() => {
    async function fetchSEOSettings() {
      const { data } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', [
          'site_name', 'seo_title', 'seo_description', 'seo_keywords', 'seo_canonical_url',
          'og_title', 'og_description', 'og_image', 'og_url', 
          'twitter_card', 'twitter_site', 'twitter_image',
          'google_site_verification', 'bing_site_verification',
          'site_favicon', 'site_logo'
        ]);

      if (data) {
        const settings: Partial<SEOSettings> = {};
        data.forEach(item => {
          settings[item.key as keyof SEOSettings] = item.value;
        });
        setSeoSettings(settings);
      }
    }

    fetchSEOSettings();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('seo-settings')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'system_settings' },
        () => fetchSEOSettings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  useEffect(() => {
    if (!seoSettings) return;

    // Update document title
    if (seoSettings.site_name) {
      document.title = seoSettings.site_name;
    } else if (seoSettings.seo_title) {
      document.title = seoSettings.seo_title;
    }

    // Update favicon if available
    if (seoSettings.site_favicon) {
      let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = seoSettings.site_favicon;
    }

    // Remove existing managed meta tags
    const existingTags = document.querySelectorAll('meta[data-managed="seo"]');
    existingTags.forEach(tag => tag.remove());

    // Remove existing canonical link
    const existingCanonical = document.querySelector('link[rel="canonical"][data-managed="seo"]');
    if (existingCanonical) existingCanonical.remove();

    // Add new meta tags
    const metaTags = [
      // Basic SEO
      seoSettings.seo_description && { name: 'description', content: seoSettings.seo_description },
      seoSettings.seo_keywords && { name: 'keywords', content: seoSettings.seo_keywords },
      
      // Search engine verification
      seoSettings.google_site_verification && { name: 'google-site-verification', content: seoSettings.google_site_verification },
      seoSettings.bing_site_verification && { name: 'msvalidate.01', content: seoSettings.bing_site_verification },
      
      // Open Graph
      seoSettings.og_title && { property: 'og:title', content: seoSettings.og_title },
      seoSettings.og_description && { property: 'og:description', content: seoSettings.og_description },
      seoSettings.og_image && { property: 'og:image', content: seoSettings.og_image },
      seoSettings.og_url && { property: 'og:url', content: seoSettings.og_url },
      { property: 'og:type', content: 'website' },
      
      // Twitter Card
      seoSettings.twitter_card && { name: 'twitter:card', content: seoSettings.twitter_card },
      seoSettings.twitter_site && { name: 'twitter:site', content: seoSettings.twitter_site },
      seoSettings.twitter_image && { name: 'twitter:image', content: seoSettings.twitter_image },
    ].filter(Boolean);

    metaTags.forEach(tag => {
      if (tag) {
        const meta = document.createElement('meta');
        if ('name' in tag) meta.name = tag.name;
        if ('property' in tag) meta.setAttribute('property', tag.property);
        meta.content = tag.content;
        meta.setAttribute('data-managed', 'seo');
        document.head.appendChild(meta);
      }
    });

    // Add canonical URL if specified
    if (seoSettings.seo_canonical_url) {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = seoSettings.seo_canonical_url;
      canonical.setAttribute('data-managed', 'seo');
      document.head.appendChild(canonical);
    }

    // Add structured data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": seoSettings.site_name || seoSettings.seo_title || "CoouConnect Online",
      "description": seoSettings.seo_description || "University community platform",
      "url": seoSettings.og_url || window.location.origin,
      "logo": seoSettings.site_logo || seoSettings.og_image,
      "sameAs": [
        // Add social media links here if available
      ]
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    script.setAttribute('data-managed', 'seo');
    document.head.appendChild(script);

  }, [seoSettings]);

  return null; // This component doesn't render anything visible
};

export default SEOHeadManager;