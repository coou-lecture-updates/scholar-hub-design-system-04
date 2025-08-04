
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EventCard from './Events/EventCard';
import EventPaymentDialog from '@/components/payment/EventPaymentDialog';
import WalletBalance from '@/components/wallet/WalletBalance';
import EnhancedFundWallet from '@/components/wallet/EnhancedFundWallet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Tag, Ticket, Clock, Plus, Wallet } from 'lucide-react';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_type: string;
  image_url?: string;
  gallery?: string[];
  type: string;
  price?: number | null;
  slug?: string;
  has_tickets?: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'paid' | 'scheduled'>('paid');
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch events and check if they have associated tickets
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id,title,description,location,event_date,event_type,image_url,gallery,price,slug,published')
        .eq('published', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Check which events have tickets (ticket_id exists)
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('event_id')
        .not('event_id', 'is', null);

      if (ticketsError) console.warn('Error fetching tickets:', ticketsError);

      const eventIdsWithTickets = new Set(ticketsData?.map(t => t.event_id) || []);

      const mapped = (eventsData || []).map((ev: any) => ({
        ...ev,
        gallery: Array.isArray(ev.gallery) ? ev.gallery : [],
        slug: typeof ev.slug === "string" ? ev.slug : undefined,
        has_tickets: eventIdsWithTickets.has(ev.id),
        type: eventIdsWithTickets.has(ev.id) ? "paid" : "scheduled"
      })) as Event[];

      setEvents(mapped);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTickets = (event: Event) => {
    setSelectedEvent(event);
    setPaymentDialogOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </DashboardLayout>
    );
  }

  const paidEvents = events.filter(ev => ev.type === 'paid');
  const scheduledEvents = events.filter(ev => ev.type === 'scheduled');

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Campus Events</h1>
          <p className="text-blue-100 text-lg">Discover and join exciting events happening around campus</p>
        </div>

        {/* Wallet Section - Only on Events Page */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WalletBalance showActions={false} />
          <div className="flex gap-2">
            <EnhancedFundWallet>
              <Button className="flex-1 gap-2">
                <Plus className="h-4 w-4" />
                Add Funds to Wallet
              </Button>
            </EnhancedFundWallet>
            <Button variant="outline" asChild className="flex-1">
              <a href="/dashboard">
                <Wallet className="h-4 w-4 mr-2" />
                View Wallet History
              </a>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            className={`px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 ${
              activeTab === 'paid' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('paid')}
          >
            <Ticket className="h-4 w-4" />
            Ticketed Events
            <Badge variant="secondary" className="ml-1">
              {paidEvents.length}
            </Badge>
          </button>
          <button
            className={`px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 ${
              activeTab === 'scheduled' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('scheduled')}
          >
            <Calendar className="h-4 w-4" />
            Scheduled Events
            <Badge variant="secondary" className="ml-1">
              {scheduledEvents.length}
            </Badge>
          </button>
        </div>

        {/* Events Content */}
        <div className="space-y-6">
          {activeTab === 'paid' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticketed Events</h2>
                <p className="text-gray-600">Events that require tickets (both free and paid)</p>
              </div>
              
              {paidEvents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Ticketed Events</h3>
                  <p className="text-gray-600">There are no ticketed events available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paidEvents.map(event => (
                    <EventCard key={event.id} event={event} onBuyTickets={handleBuyTickets} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Scheduled Events</h2>
                <p className="text-gray-600">General events and announcements</p>
              </div>
              
              {scheduledEvents.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Events</h3>
                  <p className="text-gray-600">There are no scheduled events available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scheduledEvents.map(event => (
                    <div key={event.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                      {event.image_url && (
                        <div className="h-48 rounded-t-lg overflow-hidden">
                          <img 
                            src={event.image_url} 
                            alt={event.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <Badge variant="outline" className="text-blue-700 border-blue-200">
                            <Tag className="h-3 w-3 mr-1" />
                            {event.event_type}
                          </Badge>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <Clock className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                        
                        <div className="space-y-2 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.event_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {selectedEvent && (
          <EventPaymentDialog
            event={selectedEvent}
            open={paymentDialogOpen}
            onOpenChange={setPaymentDialogOpen}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Events;
