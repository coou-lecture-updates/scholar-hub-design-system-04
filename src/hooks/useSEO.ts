import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SEOPageOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export const useSEO = (options: SEOPageOptions = {}) => {
  useEffect(() => {
    const updatePageSEO = async () => {
      // If page-specific title is provided, use it, otherwise keep current
      if (options.title) {
        document.title = options.title;
      }

      // Remove existing page-specific meta tags
      const pageSpecificTags = ['description', 'keywords'];
      const pageSpecificProperties = ['og:title', 'og:description', 'og:image', 'og:url'];

      if (options.description || options.keywords || options.ogTitle || options.ogDescription || options.ogImage) {
        pageSpecificTags.forEach(name => {
          const existing = document.querySelector(`meta[name="${name}"]`);
          if (existing) existing.remove();
        });

        pageSpecificProperties.forEach(property => {
          const existing = document.querySelector(`meta[property="${property}"]`);
          if (existing) existing.remove();
        });

        // Remove existing canonical
        const existingCanonical = document.querySelector('link[rel="canonical"]');
        if (existingCanonical) existingCanonical.remove();
      }

      // Add page-specific meta tags
      const metaTags = [
        { name: 'description', content: options.description },
        { name: 'keywords', content: options.keywords },
        { property: 'og:title', content: options.ogTitle || options.title },
        { property: 'og:description', content: options.ogDescription || options.description },
        { property: 'og:image', content: options.ogImage },
        { property: 'og:url', content: options.canonicalUrl || window.location.href },
        { name: 'twitter:title', content: options.ogTitle || options.title },
        { name: 'twitter:description', content: options.ogDescription || options.description },
        { name: 'twitter:image', content: options.ogImage }
      ];

      metaTags.forEach(tag => {
        if (tag.content && tag.content.trim() !== '') {
          const meta = document.createElement('meta');
          if (tag.name) meta.name = tag.name;
          if (tag.property) meta.setAttribute('property', tag.property);
          meta.content = tag.content;
          document.head.appendChild(meta);
        }
      });

      // Add canonical URL if provided
      if (options.canonicalUrl) {
        const canonical = document.createElement('link');
        canonical.rel = 'canonical';
        canonical.href = options.canonicalUrl;
        document.head.appendChild(canonical);
      }

      // Handle noIndex
      if (options.noIndex) {
        const existing = document.querySelector('meta[name="robots"]');
        if (existing) existing.remove();
        
        const robots = document.createElement('meta');
        robots.name = 'robots';
        robots.content = 'noindex, nofollow';
        document.head.appendChild(robots);
      }
    };

    updatePageSEO();
  }, [options]);
};

export default useSEO;
