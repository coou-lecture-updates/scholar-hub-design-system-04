import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Ticket, 
  Plus, 
  Search, 
  QrCode, 
  Users, 
  DollarSign,
  Calendar,
  MapPin,
  Edit,
  Trash2
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EventTicket {
  id: string;
  event_id: string;
  ticket_type: string;
  price: number;
  quantity_total: number;
  quantity_sold: number;
  is_active: boolean;
  created_at: string;
  events?: {
    title: string;
    event_date: string;
    location: string;
  };
}

interface TicketForm {
  event_id: string;
  ticket_type: string;
  price: number;
  quantity_total: number;
}

const TicketManagement = () => {
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<EventTicket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [ticketForm, setTicketForm] = useState<TicketForm>({
    event_id: '',
    ticket_type: 'general',
    price: 0,
    quantity_total: 100,
  });

  useEffect(() => {
    fetchTickets();
    fetchEvents();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_tickets')
        .select(`
          *,
          events (
            title,
            event_date,
            location
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date, location')
        .eq('published', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTicketForm(prev => ({ 
      ...prev, 
      [name]: name === 'price' || name === 'quantity_total' ? Number(value) : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTicketForm(prev => ({ ...prev, [name]: value }));
  };

  const openDialog = (ticket?: EventTicket) => {
    if (ticket) {
      setEditingTicket(ticket);
      setTicketForm({
        event_id: ticket.event_id,
        ticket_type: ticket.ticket_type,
        price: ticket.price,
        quantity_total: ticket.quantity_total,
      });
    } else {
      setEditingTicket(null);
      setTicketForm({
        event_id: '',
        ticket_type: 'general',
        price: 0,
        quantity_total: 100,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketForm.event_id) {
      toast({
        title: "Error",
        description: "Please select an event",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      if (editingTicket) {
        // Update existing ticket
        const { error } = await supabase
          .from('event_tickets')
          .update({
            ticket_type: ticketForm.ticket_type,
            price: ticketForm.price,
            quantity_total: ticketForm.quantity_total,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTicket.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ticket updated successfully",
        });
      } else {
        // Create new ticket
        const { error } = await supabase
          .from('event_tickets')
          .insert([ticketForm]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Ticket created successfully",
        });
      }

      setDialogOpen(false);
      fetchTickets();
    } catch (error: any) {
      console.error('Error saving ticket:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save ticket",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('event_tickets')
        .delete()
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      });

      fetchTickets();
    } catch (error: any) {
      console.error('Error deleting ticket:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete ticket",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTicketStatus = async (ticket: EventTicket) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('event_tickets')
        .update({ 
          is_active: !ticket.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticket.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Ticket ${!ticket.is_active ? 'activated' : 'deactivated'} successfully`,
      });

      fetchTickets();
    } catch (error: any) {
      console.error('Error toggling ticket status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.events?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = tickets.reduce((sum, ticket) => 
    sum + (ticket.price * ticket.quantity_sold), 0
  );

  const totalTicketsSold = tickets.reduce((sum, ticket) => 
    sum + ticket.quantity_sold, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Ticket Management</h2>
          <p className="text-muted-foreground">Manage event tickets and track sales</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{editingTicket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
              <DialogDescription>
                {editingTicket ? 'Update ticket details' : 'Configure a new event ticket'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-1">
              <form onSubmit={handleSubmit} className="space-y-4 pb-4">
                <div>
                  <Label htmlFor="event_id">Event</Label>
                  <Select 
                    value={ticketForm.event_id} 
                    onValueChange={(value) => handleSelectChange('event_id', value)}
                    disabled={!!editingTicket}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {new Date(event.event_date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ticket_type">Ticket Type</Label>
                  <Select 
                    value={ticketForm.ticket_type} 
                    onValueChange={(value) => handleSelectChange('ticket_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Admission</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="early_bird">Early Bird</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={ticketForm.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="quantity_total">Total Quantity</Label>
                  <Input
                    id="quantity_total"
                    name="quantity_total"
                    type="number"
                    min="1"
                    value={ticketForm.quantity_total}
                    onChange={handleInputChange}
                    placeholder="100"
                  />
                </div>
              </form>
            </div>
            
            <DialogFooter className="flex-shrink-0 sticky bottom-0 bg-white border-t pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? 'Saving...' : editingTicket ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From ticket sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTicketsSold}</div>
            <p className="text-xs text-muted-foreground">Across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.is_active).length}</div>
            <p className="text-xs text-muted-foreground">With available tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search tickets by event or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Event Tickets</CardTitle>
          <CardDescription>Manage all event tickets and track their performance</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && tickets.length === 0 ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-10">
              <Ticket className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? `No tickets match "${searchTerm}"` : 'Create your first event ticket to get started.'}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Sold/Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{ticket.events?.title}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(ticket.events?.event_date || '').toLocaleDateString()}
                            <MapPin className="h-3 w-3 ml-2" />
                            {ticket.events?.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {ticket.ticket_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>₦{ticket.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {ticket.quantity_sold} / {ticket.quantity_total}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{
                                width: `${(ticket.quantity_sold / ticket.quantity_total) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={ticket.is_active ? "default" : "secondary"}
                          className={ticket.is_active ? "bg-green-100 text-green-800" : ""}
                        >
                          {ticket.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleTicketStatus(ticket)}
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDialog(ticket)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ticket.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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
  );
};

export default TicketManagement;