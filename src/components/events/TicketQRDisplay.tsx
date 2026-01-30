import React from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Ticket, Download, Share2 } from 'lucide-react';
import { format } from 'date-fns';

interface TicketDisplayProps {
  ticket: {
    id: string;
    ticket_code: string;
    full_name: string;
    email: string;
    status: string;
  };
  event: {
    id: string;
    title: string;
    event_date: string;
    location: string;
    image_url?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TicketQRDisplay: React.FC<TicketDisplayProps> = ({
  ticket,
  event,
  open,
  onOpenChange,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (ticket?.ticket_code) {
      const ticketData = JSON.stringify({
        code: ticket.ticket_code,
        event: event.id,
        holder: ticket.full_name,
      });
      
      QRCode.toDataURL(ticketData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff',
        },
      }).then(setQrCodeUrl);
    }
  }, [ticket, event]);

  const downloadTicket = async () => {
    // Create a downloadable ticket image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 600;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(0, 0, canvas.width, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EVENT TICKET', canvas.width / 2, 60);

    // Event Title
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(event.title, canvas.width / 2, 140);

    // Event Details
    ctx.font = '14px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(format(new Date(event.event_date), 'MMMM dd, yyyy • h:mm a'), canvas.width / 2, 180);
    ctx.fillText(event.location, canvas.width / 2, 200);

    // QR Code
    if (qrCodeUrl) {
      const qrImage = new Image();
      qrImage.src = qrCodeUrl;
      await new Promise(resolve => {
        qrImage.onload = resolve;
      });
      ctx.drawImage(qrImage, (canvas.width - 180) / 2, 240, 180, 180);
    }

    // Ticket Code
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(ticket.ticket_code, canvas.width / 2, 460);

    // Holder Name
    ctx.font = '14px Arial';
    ctx.fillStyle = '#6b7280';
    ctx.fillText(`Ticket Holder: ${ticket.full_name}`, canvas.width / 2, 500);

    // Footer
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(0, 550, canvas.width, 50);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial';
    ctx.fillText('Powered by CoouConnect', canvas.width / 2, 580);

    // Download
    const link = document.createElement('a');
    link.download = `ticket-${ticket.ticket_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareTicket = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Ticket for ${event.title}`,
        text: `My ticket code: ${ticket.ticket_code}`,
        url: window.location.href,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Your Event Ticket
          </DialogTitle>
          <DialogDescription>
            Show this QR code at the event entrance
          </DialogDescription>
        </DialogHeader>

        <Card className="overflow-hidden">
          {event.image_url && (
            <div className="h-32 w-full overflow-hidden">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
            
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(event.event_date), 'MMMM dd, yyyy • h:mm a')}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {event.location}
              </div>
            </div>

            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-xl inline-block shadow-sm border">
                <img src={qrCodeUrl} alt="Ticket QR Code" className="w-48 h-48" />
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Ticket Code</p>
              <p className="font-mono font-bold text-lg tracking-wide">{ticket.ticket_code}</p>
            </div>

            <Badge variant={ticket.status === 'active' ? 'default' : 'secondary'}>
              {ticket.status === 'active' ? '✓ Valid Ticket' : ticket.status}
            </Badge>

            <div className="flex gap-2 justify-center pt-4">
              <Button variant="outline" size="sm" onClick={downloadTicket}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              {navigator.share && (
                <Button variant="outline" size="sm" onClick={shareTicket}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default TicketQRDisplay;
