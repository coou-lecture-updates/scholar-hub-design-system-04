import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { FileUploadField } from '@/components/ui/FileUploadField';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Wallet, CreditCard, Calendar, MapPin, Users, DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedEventCreationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editEvent?: any;
}

const EnhancedEventCreation: React.FC<EnhancedEventCreationProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editEvent
}) => {
  const { wallet, checkBalance, addTransaction } = useWallet();
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Check if user can edit this event (admin can edit all, moderators only their own)
  const canEditEvent = !editEvent || userProfile?.role === 'admin' || editEvent.created_by === userProfile?.id;

  // Form state
  const [formData, setFormData] = useState({
    title: editEvent?.title || '',
    description: editEvent?.description || '',
    location: editEvent?.location || '',
    eventDate: editEvent?.event_date ? new Date(editEvent.event_date) : undefined,
    eventType: editEvent?.event_type || '',
    imageUrl: editEvent?.image_url || '',
    published: editEvent?.published || false,
    requiresTickets: editEvent?.requires_tickets || false,
    price: editEvent?.price?.toString() || '',
    maxTickets: editEvent?.max_tickets?.toString() || ''
  });

  const isPaidEvent = formData.requiresTickets && parseFloat(formData.price) > 0;
  const needsWalletDeduction = isPaidEvent && !editEvent;
  const [eventCreationFee, setEventCreationFee] = useState<number>(2000);

  // Load event creation fee from system settings
  React.useEffect(() => {
    const loadFee = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'event_creation_fee')
        .maybeSingle();
      if (!error && data?.value) {
        const fee = parseFloat(data.value as any);
        if (!Number.isNaN(fee)) setEventCreationFee(fee);
      }
    };
    loadFee();
  }, []);

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title && formData.description && formData.eventType);
      case 2:
        return !!(formData.location && formData.eventDate);
      case 3:
        if (formData.requiresTickets) {
          return !!(formData.price && (!isPaidEvent || parseFloat(formData.price) >= 0));
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!validateStep(currentStep)) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Check wallet balance for paid events
      if (needsWalletDeduction && !checkBalance(eventCreationFee)) {
        toast({
          title: "Insufficient wallet balance",
          description: `You need at least ₦${eventCreationFee.toLocaleString()} to create a paid event.`,
          variant: "destructive",
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const eventData = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        event_date: formData.eventDate ? formData.eventDate.toISOString() : null,
        event_type: formData.eventType,
        image_url: formData.imageUrl || null,
        published: formData.published,
        price: formData.requiresTickets ? parseFloat(formData.price) || 0 : 0,
        ticket_price: formData.requiresTickets ? parseFloat(formData.price) || 0 : 0,
        max_tickets: formData.maxTickets ? parseInt(formData.maxTickets) : null,
        requires_tickets: formData.requiresTickets,
        created_by: user.id,
      };

      let eventResult;
      if (editEvent) {
        const { data, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editEvent.id)
          .select()
          .single();
        
        if (error) throw error;
        eventResult = data;
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([eventData])
          .select()
          .single();
        
        if (error) throw error;
        eventResult = data;
      }

      // Wallet deduction handled server-side via database trigger for paid events


      toast({
        title: editEvent ? "Event updated" : "Event created",
        description: "Event saved successfully.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error submitting event:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {editEvent ? 'Edit Event' : 'Create New Event'}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && <div className="w-8 h-0.5 bg-muted mx-1" />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[60vh] space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Basic Information
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Enter event title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe your event"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type *</Label>
                <Select value={formData.eventType} onValueChange={(value) => updateFormData('eventType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conference">Conference</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="Webinar">Webinar</SelectItem>
                    <SelectItem value="Party">Party</SelectItem>
                    <SelectItem value="Concert">Concert</SelectItem>
                    <SelectItem value="Exhibition">Exhibition</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 2: Location & Date */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location & Date
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="Event location"
                />
              </div>

              <div className="space-y-2">
                <Label>Event Date *</Label>
                <DatePicker
                  date={formData.eventDate}
                  onSelect={(date) => updateFormData('eventDate', date)}
                />
              </div>

              <div className="space-y-2">
                <Label>Event Image</Label>
                <FileUploadField
                  label=""
                  onFileUploaded={(url) => updateFormData('imageUrl', url)}
                  value={formData.imageUrl}
                  placeholder="Enter image URL or upload a file"
                  accept="image/*"
                  maxFileSize={5}
                  allowedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                  folder="event-images"
                />
              </div>
            </div>
          )}

          {/* Step 3: Ticketing */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Ticketing & Pricing
              </h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.requiresTickets}
                  onCheckedChange={(checked) => updateFormData('requiresTickets', checked)}
                />
                <Label>This event requires tickets</Label>
              </div>

              {formData.requiresTickets && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="space-y-2">
                    <Label htmlFor="price">Ticket Price (NGN)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateFormData('price', e.target.value)}
                      placeholder="Enter 0 for free tickets"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTickets">Maximum Tickets (Optional)</Label>
                    <Input
                      id="maxTickets"
                      type="number"
                      value={formData.maxTickets}
                      onChange={(e) => updateFormData('maxTickets', e.target.value)}
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>

                  {isPaidEvent && !editEvent && (
                    <Alert className="border-primary/20 bg-primary/5">
                      <DollarSign className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-medium">Event Creation Fee</p>
                        <p>Creating a paid event will deduct ₦{eventCreationFee.toLocaleString()} from your wallet.</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Wallet className="h-4 w-4" />
                          <span>Current Balance: ₦{wallet?.balance?.toLocaleString() || '0'}</span>
                        </div>
                        {!checkBalance(eventCreationFee) && (
                          <p className="text-destructive font-medium mt-1">
                            Insufficient balance! You need at least ₦{eventCreationFee.toLocaleString()}.
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Publish */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Review & Publish
              </h3>
              
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Title:</span>
                    <span>{formData.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <Badge variant="secondary">{formData.eventType}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Location:</span>
                    <span>{formData.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Date:</span>
                    <span>{formData.eventDate ? format(formData.eventDate, 'MMM dd, yyyy') : 'Not set'}</span>
                  </div>
                  {formData.requiresTickets && (
                    <div className="flex justify-between">
                      <span className="font-medium">Ticket Price:</span>
                      <span>₦{parseFloat(formData.price || '0').toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(checked) => updateFormData('published', checked)}
                />
                <Label>Publish event immediately</Label>
              </div>
            </div>
          )}
        </CardContent>

        <div className="flex justify-between p-6 border-t">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
            disabled={loading}
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          <Button
            onClick={currentStep === 4 ? handleSubmit : handleNext}
            disabled={loading || !validateStep(currentStep) || (needsWalletDeduction && !checkBalance(eventCreationFee))}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : currentStep === 4 ? (
              editEvent ? 'Update Event' : 'Create Event'
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EnhancedEventCreation;