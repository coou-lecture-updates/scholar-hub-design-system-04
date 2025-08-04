import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Eye,
  Download,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_type: string;
  price: number;
  created_at: string;
  ticket_sales?: number;
  revenue?: number;
  attendees?: number;
}

interface TicketSale {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  status: string;
}

const ModeratorDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [ticketSales, setTicketSales] = useState<TicketSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
    activeEvents: 0
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchModeratorEvents();
    }
  }, [user]);

  const fetchModeratorEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch events created by this moderator
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Fetch ticket sales for each event
      const eventsWithStats = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { data: tickets, error: ticketsError } = await supabase
            .from('tickets')
            .select('*')
            .eq('event_id', event.id);

          if (ticketsError) {
            console.error('Error fetching tickets:', ticketsError);
            return { ...event, ticket_sales: 0, revenue: 0, attendees: 0 };
          }

          const ticketSales = tickets?.length || 0;
          const revenue = ticketSales * (event.price || 0);
          
          return {
            ...event,
            ticket_sales: ticketSales,
            revenue: revenue,
            attendees: ticketSales
          };
        })
      );

      setEvents(eventsWithStats);

      // Calculate stats
      const totalEvents = eventsWithStats.length;
      const totalRevenue = eventsWithStats.reduce((sum, event) => sum + (event.revenue || 0), 0);
      const totalTicketsSold = eventsWithStats.reduce((sum, event) => sum + (event.ticket_sales || 0), 0);
      const activeEvents = eventsWithStats.filter(event => new Date(event.event_date) > new Date()).length;

      setStats({
        totalEvents,
        totalRevenue,
        totalTicketsSold,
        activeEvents
      });

    } catch (error: any) {
      console.error('Error fetching moderator events:', error);
      toast({
        title: "Error loading events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTickets = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTicketSales(data || []);
    } catch (error: any) {
      console.error('Error fetching event tickets:', error);
      toast({
        title: "Error loading tickets",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    fetchEventTickets(event.id);
  };

  const exportTickets = () => {
    if (!selectedEvent || !ticketSales.length) return;

    const csvContent = [
      ['Name', 'Email', 'Phone', 'Purchase Date', 'Status'].join(','),
      ...ticketSales.map(ticket => [
        ticket.full_name,
        ticket.email,
        ticket.phone || 'N/A',
        new Date(ticket.created_at).toLocaleDateString(),
        ticket.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent.title}-tickets.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Moderator Dashboard</h1>
        <p className="text-muted-foreground">Manage your events and track performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEvents}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">My Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Events List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Events</CardTitle>
                <CardDescription>Events you've created</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-muted-foreground">No events created yet.</p>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedEvent?.id === event.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleEventSelect(event)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{event.title}</h3>
                        <Badge variant="outline">
                          {event.price > 0 ? `₦${event.price}` : 'Free'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>🎫 {event.ticket_sales || 0} sold</span>
                        <span>💰 ₦{(event.revenue || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Event Details */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Event Details</CardTitle>
                  <CardDescription>
                    {selectedEvent ? 'Attendee information' : 'Select an event to view details'}
                  </CardDescription>
                </div>
                {selectedEvent && ticketSales.length > 0 && (
                  <Button onClick={exportTickets} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {selectedEvent ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                      <p className="text-muted-foreground">{selectedEvent.description}</p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Date:</strong> {new Date(selectedEvent.event_date).toLocaleDateString()}</p>
                        <p><strong>Location:</strong> {selectedEvent.location}</p>
                        <p><strong>Type:</strong> {selectedEvent.event_type}</p>
                      </div>
                    </div>

                    {ticketSales.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium">Attendees ({ticketSales.length})</h4>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                          {ticketSales.map((ticket) => (
                            <div key={ticket.id} className="p-3 bg-muted/30 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{ticket.full_name}</p>
                                  <p className="text-sm text-muted-foreground">{ticket.email}</p>
                                  {ticket.phone && (
                                    <p className="text-sm text-muted-foreground">{ticket.phone}</p>
                                  )}
                                </div>
                                <Badge variant={ticket.status === 'active' ? 'default' : 'secondary'}>
                                  {ticket.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Purchased: {new Date(ticket.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No tickets sold yet.</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select an event to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Event Performance
              </CardTitle>
              <CardDescription>Overview of your event metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₦{(event.revenue || 0).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.ticket_sales || 0} tickets
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModeratorDashboard;