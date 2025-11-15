import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface BannerAdCarouselProps {
  ads: Array<{
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    link_url: string;
  }>;
}

export const BannerAdCarousel: React.FC<BannerAdCarouselProps> = ({ ads }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (ads.length === 0) return;

    // Track impression
    const trackImpression = async () => {
      const { data: currentAd } = await supabase
        .from('message_ads')
        .select('impressions')
        .eq('id', ads[currentIndex].id)
        .single();

      if (currentAd) {
        await supabase
          .from('message_ads')
          .update({ impressions: currentAd.impressions + 1 })
          .eq('id', ads[currentIndex].id);
      }
    };

    trackImpression();
  }, [currentIndex, ads]);

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length]);

  if (ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  const handleClick = async () => {
    const adId = currentAd.id;
    const { data: adData } = await supabase
      .from('message_ads')
      .select('clicks')
      .eq('id', adId)
      .single();

    if (adData) {
      await supabase
        .from('message_ads')
        .update({ clicks: adData.clicks + 1 })
        .eq('id', adId);
    }

    window.open(currentAd.link_url, '_blank');
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  return (
    <Card className="bg-white p-4 mb-4">
      <div className="flex items-start gap-2 mb-2">
        <Badge variant="outline" className="text-xs">Sponsored</Badge>
      </div>

      <div className="relative group">
        <div
          className="flex gap-4 items-center cursor-pointer"
          onClick={handleClick}
        >
          {currentAd.image_url && (
            <img
              src={currentAd.image_url}
              alt={currentAd.title}
              className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
            />
          )}
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">{currentAd.title}</h3>
            {currentAd.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {currentAd.description}
              </p>
            )}
            <div className="flex items-center gap-1 mt-2 text-primary">
              <ExternalLink className="h-4 w-4" />
              <span className="text-sm truncate">
                {currentAd.link_url.replace(/^https?:\/\//, '')}
              </span>
            </div>
          </div>
        </div>

        {ads.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {ads.length > 1 && (
        <div className="flex justify-center gap-1 mt-3">
          {ads.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 w-8 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}
    </Card>
  );
};
