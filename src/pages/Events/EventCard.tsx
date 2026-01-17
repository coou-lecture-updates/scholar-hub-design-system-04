import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Image, Ticket, Gift } from "lucide-react";
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
              className="bg-white/80 h-8 w-8"
              aria-label="Previous"
            >‹</Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={e => { e.stopPropagation(); setIdx(idx === images.length - 1 ? 0 : idx + 1); }}
              className="bg-white/80 h-8 w-8"
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
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });
};

interface EventCardProps {
  event: Event;
  onBuyTickets?: (event: Event) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onBuyTickets }) => {
  const isFreeEvent = !event.price || event.price === 0;
  const isPaidEvent = event.type === 'paid';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full group">
      {/* Image Section */}
      <div className="relative">
        {event.gallery && event.gallery.length > 0 ? (
          <GallerySlider images={event.gallery} />
        ) : event.image_url ? (
          <div className="aspect-video relative overflow-hidden">
            <img
              src={event.image_url.startsWith('http') ? event.image_url : EVENTS_BUCKET_URL + event.image_url}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
            <Image className="h-10 w-10 text-gray-400" />
          </div>
        )}

        {/* Price Badge Overlay */}
        {isPaidEvent && (
          <div className="absolute top-3 right-3">
            {isFreeEvent ? (
              <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-3 py-1 shadow-lg">
                <Gift className="h-3 w-3 mr-1" />
                FREE
              </Badge>
            ) : (
              <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm px-3 py-1 shadow-lg">
                ₦{event.price?.toLocaleString()}
              </Badge>
            )}
          </div>
        )}
      </div>

      <CardHeader className="pb-2 md:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base md:text-lg line-clamp-2 leading-tight">{event.title}</CardTitle>
            <CardDescription className="mt-1.5 flex flex-wrap gap-1 md:gap-1.5">
              <Badge variant="outline" className="text-xs">
                {event.event_type}
              </Badge>
              {isPaidEvent ? (
                <Badge variant="default" className="text-xs bg-blue-600">
                  <Ticket className="h-3 w-3 mr-1" />
                  Ticketed
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Open Event
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 md:space-y-4 flex-1 flex flex-col pt-0">
        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-primary" />
            <span className="truncate">{formatDate(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-primary" />
            <span>{formatTime(event.event_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 text-primary" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Action Section */}
        {isPaidEvent ? (
          <div className="pt-3 border-t mt-auto">
            <Button 
              onClick={() => onBuyTickets?.(event)}
              className={`w-full text-sm md:text-base h-10 md:h-11 font-semibold ${
                isFreeEvent 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {isFreeEvent ? (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Get Free Ticket
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Buy Ticket - ₦{event.price?.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="pt-3 border-t text-center mt-auto">
            <Badge variant="secondary" className="text-xs">
              No registration required
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;
