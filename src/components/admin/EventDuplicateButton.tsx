import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EventDuplicateProps {
  event: any;
  onDuplicate: (eventData: any) => void;
}

const EventDuplicateButton: React.FC<EventDuplicateProps> = ({ event, onDuplicate }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleDuplicate = () => {
    // Create a copy of the event with a new title
    const duplicatedEvent = {
      title: `${event.title} (Copy)`,
      description: event.description,
      location: event.location,
      event_date: event.event_date,
      event_type: event.event_type,
      image_url: event.image_url,
      published: false, // Start as unpublished
      requires_tickets: event.requires_tickets,
      price: event.price,
      max_tickets: event.max_tickets,
    };

    onDuplicate(duplicatedEvent);
    setCopied(true);
    
    toast({
      title: 'Event Duplicated',
      description: 'A copy of the event has been created. You can now edit it.',
    });

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDuplicate}
      className="h-8 w-8 p-0"
      title="Duplicate Event"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};

export default EventDuplicateButton;
