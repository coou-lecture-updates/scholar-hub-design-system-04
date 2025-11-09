import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Image } from "lucide-react";
import { Event } from "../Events";

const EVENTS_BUCKET_URL = "https://hhcitezdbueybdtslkth.supabase.co/storage/v1/object/public/lovable-uploads/";

function GallerySlider({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return null;
  return (
    <div className="relative flex items-center aspect-video overflow-hidden">
      <img 
        src={images[idx]?.startsWith('http') ? images[idx] : EVENTS_BUCKET_URL + images[idx]} 
        alt={`gallery-${idx}`} 
        className="object-cover w-full h-full"
      />
      {images.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={e => { e.stopPropagation(); setIdx(idx === 0 ? images.length - 1 : idx - 1); }}
              className="bg-white/80"
              aria-label="Previous"
            >‹</Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={e => { e.stopPropagation(); setIdx(idx === images.length - 1 ? 0 : idx + 1); }}
              className="bg-white/80"
              aria-label="Next"
            >›</Button>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === idx ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};
const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });
};

const EventCard: React.FC<{ event: import('../Events').Event; onBuyTickets?: (event: import('../Events').Event) => void }> = ({ event, onBuyTickets }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
    {event.gallery && event.gallery.length > 0 ? (
      <GallerySlider images={event.gallery} />
    ) : event.image_url ? (
      <div className="aspect-video relative overflow-hidden">
        <img
          src={event.image_url.startsWith('http') ? event.image_url : EVENTS_BUCKET_URL + event.image_url}
          alt={event.title}
          className="w-full h-full object-cover"
        />
      </div>
    ) : (
      <div className="flex items-center justify-center aspect-video bg-gray-100">
        <Image className="h-10 w-10 text-gray-400" />
      </div>
    )}
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <CardTitle className="text-base md:text-lg line-clamp-2">{event.title}</CardTitle>
          <CardDescription className="mt-1 flex flex-wrap gap-1 md:gap-2">
            <Badge variant="outline" className="text-xs">{event.event_type}</Badge>
            <Badge variant={event.type === 'paid' ? 'default' : 'secondary'} className="text-xs">
              {event.type === 'paid' ? 'Paid' : 'Scheduled'}
            </Badge>
            {event.slug && (
              <span className="text-xs font-mono text-blue-500">/{event.slug}</span>
            )}
          </CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-4 flex-1 flex flex-col">
      <p className="text-xs md:text-sm text-gray-600 line-clamp-2 md:line-clamp-3">{event.description}</p>
      <div className="space-y-1.5 md:space-y-2 flex-1">
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
          <Calendar className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
          <span className="truncate">{formatDate(event.event_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
          <Clock className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
          <span>{formatTime(event.event_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
          <MapPin className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>
      {event.type === 'paid' ? (
        <div className="pt-3 md:pt-4 border-t mt-auto">
          <Button 
            onClick={() => onBuyTickets?.(event)}
            className="w-full text-sm md:text-base h-9 md:h-10"
          >
            <Users className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            <span className="truncate">Buy Tickets {event.price && event.price > 0 ? `- ₦${event.price}` : 'FREE'}</span>
          </Button>
        </div>
      ) : (
        <div className="pt-3 md:pt-4 border-t text-center mt-auto">
          <Badge variant="secondary" className="text-xs">Registration not required</Badge>
        </div>
      )}
    </CardContent>
  </Card>
);
export default EventCard;
