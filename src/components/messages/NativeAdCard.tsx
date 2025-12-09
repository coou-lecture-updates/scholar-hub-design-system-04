import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NativeAdCardProps {
  ad: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    link_url: string;
    link_preview_data: any;
  };
}

export const NativeAdCard: React.FC<NativeAdCardProps> = ({ ad }) => {
  useEffect(() => {
    // Track impression
    const trackImpression = async () => {
      const { data: currentAd } = await supabase
        .from('message_ads')
        .select('impressions')
        .eq('id', ad.id)
        .single();

      if (currentAd) {
        await supabase
          .from('message_ads')
          .update({ impressions: currentAd.impressions + 1 })
          .eq('id', ad.id);
      }
    };

    trackImpression();
  }, [ad.id]);

  const handleClick = async () => {
    // Track click
    const { data: currentAd } = await supabase
      .from('message_ads')
      .select('clicks')
      .eq('id', ad.id)
      .single();

    if (currentAd) {
      await supabase
        .from('message_ads')
        .update({ clicks: currentAd.clicks + 1 })
        .eq('id', ad.id);
    }

    window.open(ad.link_url, '_blank');
  };

  return (
    <Card className="bg-white p-4 border-2 border-primary/60 hover:border-primary hover:shadow-lg transition-all cursor-pointer" onClick={handleClick}>
      <div className="flex items-start gap-1 mb-2">
        <Badge className="text-xs bg-primary/10 text-primary border-primary/30">
          Sponsored
        </Badge>
      </div>
      
      <div className="flex gap-3">
        {ad.image_url && (
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2 text-foreground">{ad.title}</h3>
          {ad.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {ad.description}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2 text-primary">
            <ExternalLink className="h-3 w-3" />
            <span className="text-xs truncate">
              {ad.link_url.replace(/^https?:\/\//, '')}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
