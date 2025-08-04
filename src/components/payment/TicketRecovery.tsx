
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Mail, Phone, Download, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TicketRecovery = () => {
  const [loading, setLoading] = useState(false);
  const [recoveredTickets, setRecoveredTickets] = useState<any[]>([]);
  const [searchType, setSearchType] = useState<'email' | 'phone' | 'token'>('email');
  const [searchValue, setSearchValue] = useState('');
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    
    setLoading(true);
    try {
      let query = supabase.from('tickets').select(`
        *,
        events:event_id (
          title,
          event_date,
          location
        )
      `);

      switch (searchType) {
        case 'email':
          query = query.eq('email', searchValue);
          break;
        case 'phone':
          query = query.eq('phone', searchValue);
          break;
        case 'token':
          query = query.eq('recovery_token', searchValue.toUpperCase());
          break;
      }

      const { data, error } = await query;

      if (error) throw error;

      setRecoveredTickets(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No tickets found",
          description: "No tickets were found with the provided information.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Tickets found",
          description: `Found ${data.length} ticket(s) matching your search.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = (ticket: any) => {
    const ticketData = {
      ticketCode: ticket.ticket_code,
      qrCode: ticket.qr_code,
      eventTitle: ticket.events?.title,
      eventDate: ticket.events?.event_date,
      location: ticket.events?.location,
      holderName: ticket.full_name,
      email: ticket.email
    };

    const dataStr = JSON.stringify(ticketData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${ticket.ticket_code}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-900">
            <Search className="h-6 w-6" />
            <span>Ticket Recovery</span>
          </CardTitle>
          <CardDescription>
            Lost your tickets? Search and recover them using your email, phone, or recovery token.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={searchType} onValueChange={(value) => setSearchType(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Phone</span>
              </TabsTrigger>
              <TabsTrigger value="token" className="flex items-center space-x-2">
                <QrCode className="h-4 w-4" />
                <span>Recovery Token</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="phone" className="space-y-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="token" className="space-y-4">
              <div>
                <Label htmlFor="token">Recovery Token</Label>
                <Input
                  id="token"
                  placeholder="Enter your recovery token"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <Button 
            onClick={handleSearch}
            disabled={loading || !searchValue.trim()}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Searching...' : 'Search Tickets'}
          </Button>
        </CardContent>
      </Card>

      {recoveredTickets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-blue-900">Recovered Tickets</h3>
          {recoveredTickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">{ticket.events?.title}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Ticket Code:</strong> {ticket.ticket_code}</p>
                      <p><strong>QR Code:</strong> {ticket.qr_code}</p>
                      <p><strong>Holder:</strong> {ticket.full_name}</p>
                      <p><strong>Date:</strong> {new Date(ticket.events?.event_date).toLocaleDateString()}</p>
                      <p><strong>Location:</strong> {ticket.events?.location}</p>
                      <p><strong>Recovery Token:</strong> {ticket.recovery_token}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          ticket.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => downloadTicket(ticket)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketRecovery;
