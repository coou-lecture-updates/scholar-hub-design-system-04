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
    <div className="space-y-2">
      {announcements.map((announcement, index) => (
        <Alert
          key={announcement.id}
          className={cn(
            'border-l-4 border-l-primary bg-primary/5',
            index > 0 && 'mt-2'
          )}
        >
          <Pin className="h-4 w-4 text-primary fill-primary" />
          <AlertDescription className="ml-2 flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Pinned Announcement</p>
              <p className="text-sm">{announcement.content}</p>
              <p className="text-xs text-muted-foreground">
                By {announcement.users?.full_name || 'Admin'} •{' '}
                {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
              </p>
            </div>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => onDismiss(announcement.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};
