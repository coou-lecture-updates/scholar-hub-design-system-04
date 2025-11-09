import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  content: string;
  created_at: string;
  users?: {
    full_name: string;
  };
}

interface AnnouncementBannerProps {
  announcements: Announcement[];
  onDismiss?: (id: string) => void;
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  announcements,
  onDismiss,
}) => {
  if (announcements.length === 0) return null;

  return (
    <div className="space-y-2 px-0 md:px-0">
      {announcements.map((announcement, index) => (
        <Alert
          key={announcement.id}
          className={cn(
            'border-l-4 border-l-primary bg-primary/5 rounded-none md:rounded-lg border-0 md:border-l-4',
            index > 0 && 'mt-2'
          )}
        >
          <Pin className="h-3 w-3 md:h-4 md:w-4 text-primary fill-primary" />
          <AlertDescription className="ml-2 flex items-start justify-between gap-2 md:gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-xs md:text-sm font-medium">Pinned Announcement</p>
              <p className="text-xs md:text-sm">{announcement.content}</p>
              <p className="text-xs text-muted-foreground">
                By {announcement.users?.full_name || 'Admin'} •{' '}
                {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
              </p>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 md:h-6 md:w-6 shrink-0"
                onClick={() => onDismiss(announcement.id)}
              >
                <X className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
