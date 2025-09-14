import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const GoogleAnalytics: React.FC = () => {
  const [analyticsKey, setAnalyticsKey] = useState<string>('');

  useEffect(() => {
    const fetchAnalyticsKey = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'ga_measurement_id')
          .single();

        if (error || !data) return;

        const key = data.value as string;
        if (key && key !== '""' && key.trim() !== '') {
          setAnalyticsKey(key.replace(/"/g, ''));
        }
      } catch (error) {
        console.error('Error fetching analytics key:', error);
      }
    };

    fetchAnalyticsKey();
  }, []);

  useEffect(() => {
    if (!analyticsKey) return;

    // Load Google Analytics script
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsKey}`;
    document.head.appendChild(script1);

    // Initialize Google Analytics
    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${analyticsKey}', {
        page_title: document.title,
        page_location: window.location.href,
        send_page_view: true
      });
      
      // Track page views on route changes
      window.gtag = gtag;
    `;
    document.head.appendChild(script2);

    return () => {
      // Cleanup scripts on unmount
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [analyticsKey]);

  return null; // This component doesn't render anything visible
};

export default GoogleAnalytics;