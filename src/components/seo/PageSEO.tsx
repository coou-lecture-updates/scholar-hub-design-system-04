import React from 'react';
import { useSEO } from '@/hooks/useSEO';

interface PageSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

const PageSEO: React.FC<PageSEOProps> = (props) => {
  useSEO(props);
  return null;
};

export default PageSEO;