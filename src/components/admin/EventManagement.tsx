
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Calendar, MapPin, Users, Wallet, Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedEventCreation from './EnhancedEventCreation';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_type: string;
  image_url?: string;
  published: boolean;
  price?: number;
  requires_tickets?: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const { toast } = useToast();
  const { wallet } = useWallet();
  const { userProfile } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.event_type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'published') {
        filtered = filtered.filter(event => event.published);
      } else if (filterStatus === 'draft') {
        filtered = filtered.filter(event => !event.published);
      } else if (filterStatus === 'paid') {
        filtered = filtered.filter(event => event.requires_tickets && (event.price || 0) > 0);
      } else if (filterStatus === 'free') {
        filtered = filtered.filter(event => !event.requires_tickets || (event.price || 0) === 0);
      }
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterType, filterStatus]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error fetching events",
          description: error.message,
          variant: "destructive",
        });
      }

      setEvents(data || []);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setSelectedEvent(null);
    setIsCreationDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsCreationDialogOpen(true);
  };

  const closeCreationDialog = () => {
    setIsCreationDialogOpen(false);
    setSelectedEvent(null);
  };


  const handleDelete = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);

        if (error) {
          console.error('Error deleting event:', error);
          toast({
            title: "Error deleting event",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        fetchEvents();
        toast({
          title: "Event deleted",
          description: "Event deleted successfully.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Event Management</h1>
            <p className="text-muted-foreground">Manage campus events and activities</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 p-3 rounded-lg border border-primary/20">
              <Wallet className="h-4 w-4 text-primary" />
              <div className="text-sm">
                <span className="font-medium">₦{wallet?.balance?.toLocaleString() || '0'}</span>
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
              </div>
            </div>
            <Button onClick={openCreateDialog} className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Event</span>
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Types</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Party">Party</option>
                <option value="Concert">Concert</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="paid">Paid Events</option>
                <option value="free">Free Events</option>
              </select>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>{filteredEvents.length} of {events.length} events</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-muted-foreground">Loading events...</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                  ? 'Try adjusting your filters to see more events.' 
                  : 'Create your first event to get started.'}
              </p>
              {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Event
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-l-4 border-l-primary/20">
                <div className="relative">
                  {event.image_url ? (
                    <img 
                      src={event.image_url} 
                      alt={event.title} 
                      className="w-full h-48 object-cover rounded-t-lg" 
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-muted via-muted/80 to-muted/60 rounded-t-lg flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
                    {!event.published && (
                      <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                        Draft
                      </Badge>
                    )}
                    {event.requires_tickets ? (
                      (event.price || 0) > 0 ? (
                        <Badge className="text-xs bg-green-100 text-green-800 border-green-300">
                          Paid - ₦{(event.price || 0).toLocaleString()}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                          Free Event
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800">
                        Announcement
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {event.event_type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{format(new Date(event.event_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {event.requires_tickets && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>
                          {(event.price || 0) > 0 
                            ? `₦${(event.price || 0).toLocaleString()} per ticket`
                            : 'Free admission'}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="p-4 pt-0">
                  <div className="flex gap-2">
                    {/* Only show edit button if user can edit this event */}
                    {(userProfile?.role === 'admin' || event.created_by === userProfile?.id) && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(event)}
                        className="flex-1 gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                    {/* Only admins can delete events */}
                    {userProfile?.role === 'admin' && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDelete(event.id)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                    {/* Show view-only for moderators who can't edit */}
                    {userProfile?.role === 'moderator' && event.created_by !== userProfile?.id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 gap-2"
                        disabled
                      >
                        <Eye className="h-4 w-4" />
                        View Only
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Enhanced Event Creation Dialog */}
        <EnhancedEventCreation
          isOpen={isCreationDialogOpen}
          onClose={closeCreationDialog}
          onSuccess={fetchEvents}
          editEvent={selectedEvent}
        />
      </div>
    </DashboardLayout>
  );
};

export default EventManagement;
