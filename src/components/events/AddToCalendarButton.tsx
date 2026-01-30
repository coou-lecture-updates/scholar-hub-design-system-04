import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, Plus } from 'lucide-react';
import { Event } from '@/pages/Events';

interface AddToCalendarButtonProps {
  event: Event;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const AddToCalendarButton: React.FC<AddToCalendarButtonProps> = ({ 
  event, 
  variant = 'outline',
  size = 'sm'
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
  };

  const endDate = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 2); // Assume 2-hour event
    return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
  };

  const generateGoogleCalendarUrl = () => {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(event.event_date)}/${endDate(event.event_date)}`,
      details: event.description,
      location: event.location,
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const generateICalFile = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CoouConnect//Event//EN
BEGIN:VEVENT
UID:${event.id}@coouconnect.com
DTSTAMP:${formatDate(new Date().toISOString())}
DTSTART:${formatDate(event.event_date)}
DTEND:${endDate(event.event_date)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateOutlookUrl = () => {
    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
    const params = new URLSearchParams({
      subject: event.title,
      startdt: event.event_date,
      body: event.description,
      location: event.location,
      path: '/calendar/action/compose',
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-1">
          <Plus className="h-3 w-3" />
          <Calendar className="h-3 w-3" />
          <span className="hidden sm:inline">Add to Calendar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a 
            href={generateGoogleCalendarUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="h-4 w-4" 
            />
            Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a 
            href={generateOutlookUrl()} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <img 
              src="https://outlook.live.com/favicon.ico" 
              alt="Outlook" 
              className="h-4 w-4" 
            />
            Outlook Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={generateICalFile} className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Download .ics File
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AddToCalendarButton;
