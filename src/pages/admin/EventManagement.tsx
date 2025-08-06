import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import WalletBalance from '@/components/wallet/WalletBalance';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar,
  Clock,
  MapPin,
  Tag,
  Eye, 
  Trash2, 
  Edit, 
  Plus, 
  Search,
  ImageIcon,
  TicketIcon,
  Wallet,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EventManagement = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const { toast } = useToast();
  const { wallet, checkBalance } = useWallet();

  const PAID_EVENT_CREATION_FEE = 2000;
  
  const [eventForm, setEventForm] = useState({
    id: '',
    title: '',
    description: '',
    location: '',
    event_date: '',
    event_time: '',
    event_type: 'academic',
    image_url: '',
    published: false,
    requires_tickets: false,
    price: '',
    max_tickets: '',
  });
  
  const eventTypes = [
    { value: 'academic', label: 'Academic' },
    { value: 'social', label: 'Social' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'sports', label: 'Sports' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'other', label: 'Other' },
  ];
  
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error.message);
      toast({
        title: "Error fetching events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: checked }));
  };
  
  const handleOpenDialog = (event?: any) => {
    if (event) {
      // Edit mode
      setEditingEvent(event);
      
      // Process datetime into date and time
      let eventDateTime = new Date(event.event_date);
      let formattedDate = eventDateTime.toISOString().split('T')[0];
      let formattedTime = eventDateTime.toTimeString().split(' ')[0].substring(0, 5);
      
      // Handle invalid dates
      if (isNaN(eventDateTime.getTime())) {
        console.warn('Invalid event date detected:', event.event_date);
        formattedDate = new Date().toISOString().split('T')[0];
        formattedTime = '09:00';
      }
      
      setEventForm({
        id: event.id || '',
        title: event.title || '',
        description: event.description || '',
        location: event.location || '',
        event_date: formattedDate,
        event_time: formattedTime,
        event_type: event.event_type || 'academic',
        image_url: event.image_url || '',
        published: event.published || false,
        requires_tickets: event.requires_tickets || false,
        price: event.price?.toString() || '',
        max_tickets: event.max_tickets?.toString() || '',
      });
    } else {
      // Create mode
      setEditingEvent(null);
      const today = new Date();
      setEventForm({
        id: '',
        title: '',
        description: '',
        location: '',
        event_date: today.toISOString().split('T')[0],
        event_time: '09:00',
        event_type: 'academic',
        image_url: '',
        published: false,
        requires_tickets: false,
        price: '',
        max_tickets: '',
      });
    }
    
    setDialogOpen(true);
  };
  
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Ensure we have valid date and time
      if (!eventForm.event_date || !eventForm.event_time) {
        throw new Error("Event date and time are required");
      }
      
      // Validate inputs
      if (!eventForm.title.trim()) {
        throw new Error("Event title is required");
      }
      
      if (!eventForm.description.trim()) {
        throw new Error("Event description is required");
      }
      
      if (!eventForm.location.trim()) {
        throw new Error("Event location is required");
      }
      
      // Create a valid ISO date string
      const eventDateTime = new Date(`${eventForm.event_date}T${eventForm.event_time}:00`);
      
      // Check if it's a valid date
      if (isNaN(eventDateTime.getTime())) {
        throw new Error("Invalid date or time format");
      }
      
      // Check wallet balance for paid events if creating new event
      const isPaidEvent = eventForm.requires_tickets && parseFloat(eventForm.price) > 0;
      const isNewEvent = !editingEvent;
      
      if (isPaidEvent && isNewEvent && !checkBalance(PAID_EVENT_CREATION_FEE)) {
        throw new Error(`Insufficient wallet balance. You need at least ₦${PAID_EVENT_CREATION_FEE.toLocaleString()} to create a paid event.`);
      }

      // Prepare the event data
      const eventData = {
        title: eventForm.title.trim(),
        description: eventForm.description.trim(),
        location: eventForm.location.trim(),
        event_date: eventDateTime.toISOString(),
        event_type: eventForm.event_type,
        image_url: eventForm.image_url?.trim() || null, // Handle empty strings
        published: eventForm.published,
        requires_tickets: eventForm.requires_tickets,
        price: eventForm.requires_tickets ? parseFloat(eventForm.price) || 0 : 0,
        ticket_price: eventForm.requires_tickets ? parseFloat(eventForm.price) || 0 : 0,
        max_tickets: eventForm.max_tickets ? parseInt(eventForm.max_tickets) : null,
      };
      
      console.log("Saving event with data:", eventData);
      
      if (editingEvent) {
        // Update existing event
        const { data, error } = await supabase
          .from('events')
          .update({
            ...eventData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', eventForm.id)
          .select();
        
        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }
        
        toast({
          title: "Event updated",
          description: "The event has been updated successfully.",
        });
      } else {
      // Create new event
        const { data, error } = await supabase
          .from('events')
          .insert([eventData])
          .select();
        
        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }
        
        toast({
          title: "Event created",
          description: "The event has been created successfully.",
        });
      }
      
      setDialogOpen(false);
      fetchEvents();
    } catch (error: any) {
      console.error('Error saving event:', error.message);
      toast({
        title: "Error saving event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully.",
      });
      
      fetchEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error.message);
      toast({
        title: "Error deleting event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTogglePublish = async (event: any) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('events')
        .update({ published: !event.published })
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast({
        title: event.published ? "Event unpublished" : "Event published",
        description: `The event has been ${event.published ? 'unpublished' : 'published'}.`,
      });
      
      fetchEvents();
    } catch (error: any) {
      console.error('Error toggling publish status:', error.message);
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Filter events based on search term
  const filteredEvents = events.filter(event => 
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.event_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group events by upcoming, past
  const now = new Date();
  const upcomingEvents = filteredEvents.filter(event => new Date(event.event_date) >= now);
  const pastEvents = filteredEvents.filter(event => new Date(event.event_date) < now);
  
  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto px-4 py-6">
        {/* Wallet Balance for Moderators */}
        <div className="mb-6">
          <WalletBalance showActions={true} className="max-w-md" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Event Management</h1>
            <p className="text-gray-600">Create and manage campus events</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="mt-4 md:mt-0 bg-blue-700 hover:bg-blue-800 flex items-center"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                <DialogDescription>
                  {editingEvent 
                    ? 'Update the details for this event.' 
                    : 'Fill in the information for the new event.'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSaveEvent} className="space-y-4">
                <div>
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={eventForm.title}
                    onChange={handleInputChange}
                    placeholder="Enter event title"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event_date">Event Date</Label>
                    <Input
                      id="event_date"
                      name="event_date"
                      type="date"
                      value={eventForm.event_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="event_time">Event Time</Label>
                    <Input
                      id="event_time"
                      name="event_time"
                      type="time"
                      value={eventForm.event_time}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={eventForm.location}
                      onChange={handleInputChange}
                      placeholder="Event location"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="event_type">Event Type</Label>
                    <Select 
                      value={eventForm.event_type} 
                      onValueChange={(value) => handleSelectChange('event_type', value)}
                    >
                      <SelectTrigger id="event_type">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    name="image_url"
                    value={eventForm.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={eventForm.description}
                    onChange={handleInputChange}
                    placeholder="Describe the event details..."
                    rows={6}
                    required
                  />
                </div>

                {/* Ticketing Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={eventForm.requires_tickets}
                      onCheckedChange={(checked) => setEventForm(prev => ({ ...prev, requires_tickets: checked }))}
                    />
                    <Label className="font-medium">This event requires tickets</Label>
                  </div>

                  {eventForm.requires_tickets && (
                    <div className="space-y-4 ml-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="price">Ticket Price (₦)</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            value={eventForm.price}
                            onChange={handleInputChange}
                            placeholder="0 for free tickets"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="max_tickets">Max Tickets (Optional)</Label>
                          <Input
                            id="max_tickets"
                            name="max_tickets"
                            type="number"
                            value={eventForm.max_tickets}
                            onChange={handleInputChange}
                            placeholder="Leave empty for unlimited"
                            min="1"
                          />
                        </div>
                      </div>

                      {parseFloat(eventForm.price) > 0 && !editingEvent && (
                        <Alert className="border-primary/20 bg-primary/5">
                          <DollarSign className="h-4 w-4" />
                          <AlertDescription>
                            <p className="font-medium">Paid Event Creation Fee</p>
                            <p>Creating a paid event will deduct ₦{PAID_EVENT_CREATION_FEE.toLocaleString()} from your wallet.</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Wallet className="h-4 w-4" />
                              <span>Current Balance: ₦{wallet?.balance?.toLocaleString() || '0'}</span>
                            </div>
                            {!checkBalance(PAID_EVENT_CREATION_FEE) && (
                              <div className="flex items-center gap-2 mt-2 text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span className="font-medium">
                                  Insufficient balance! You need at least ₦{PAID_EVENT_CREATION_FEE.toLocaleString()}.
                                </span>
                              </div>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={eventForm.published}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="published" className="ml-2">
                    Publish immediately
                  </Label>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-700" disabled={loading}>
                    {loading ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events by title, description, location or type"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Events scheduled for the future</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {loading && !events.length ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading events...</p>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Upcoming Events</h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? `No upcoming events match "${searchTerm}"` 
                      : "No upcoming events are scheduled."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                                {event.image_url ? (
                                  <img 
                                    src={event.image_url} 
                                    alt={event.title} 
                                    className="h-full w-full object-cover rounded" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                                    }}
                                  />
                                ) : (
                                  <Calendar className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div className="truncate max-w-xs">
                                <div className="font-medium">{event.title}</div>
                                <div className="text-xs text-gray-500 truncate">{event.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                {new Date(event.event_date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                {new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              {event.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Tag className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="capitalize text-sm">{event.event_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              event.published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {event.published ? 'Published' : 'Draft'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => window.open(`/events`, '_blank')}
                                title="View event"
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleOpenDialog(event)}
                                title="Edit event"
                              >
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleTogglePublish(event)}
                                title={event.published ? "Unpublish" : "Publish"}
                              >
                                {event.published ? (
                                  <Eye className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <Calendar className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteEvent(event.id)}
                                title="Delete event"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Past events section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                Past Events
              </CardTitle>
              <CardDescription>Events that have already taken place</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {loading && !events.length ? (
                <div className="text-center py-10">
                  <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading events...</p>
                </div>
              ) : pastEvents.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-1">No Past Events</h3>
                  <p className="text-gray-600">
                    {searchTerm 
                      ? `No past events match "${searchTerm}"` 
                      : "No past events were found."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastEvents.map((event) => (
                        <TableRow key={event.id} className="opacity-80">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                                {event.image_url ? (
                                  <img 
                                    src={event.image_url} 
                                    alt={event.title} 
                                    className="h-full w-full object-cover rounded" 
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                                    }}
                                  />
                                ) : (
                                  <Calendar className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div className="truncate max-w-xs">
                                <div className="font-medium">{event.title}</div>
                                <div className="text-xs text-gray-500 truncate">{event.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm">
                                <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                                {new Date(event.event_date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                {new Date(event.event_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                              {event.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Tag className="h-3 w-3 mr-1 text-gray-400" />
                              <span className="capitalize text-sm">{event.event_type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              event.published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {event.published ? 'Published' : 'Draft'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => window.open(`/events`, '_blank')}
                                title="View event"
                              >
                                <Eye className="h-4 w-4 text-gray-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleOpenDialog(event)}
                                title="Edit event"
                              >
                                <Edit className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteEvent(event.id)}
                                title="Delete event"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventManagement;
