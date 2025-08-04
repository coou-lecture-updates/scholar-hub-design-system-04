import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, MapPin, Users, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import PaymentGatewaySelector from './PaymentGatewaySelector';
import PaymentForm from './PaymentForm';
import { Event } from '@/pages/Events';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EventPaymentDialogProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EventPaymentDialog = ({ event, open, onOpenChange }: EventPaymentDialogProps) => {
  const [step, setStep] = useState<'overview' | 'gateway' | 'payment' | 'wallet'>('overview');
  const [selectedGateway, setSelectedGateway] = useState<'flutterwave' | 'korapay' | 'paystack' | null>(null);
  const [processing, setProcessing] = useState(false);
  const { wallet, addTransaction, checkBalance } = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleGatewaySelect = (gateway: 'flutterwave' | 'korapay' | 'paystack') => {
    setSelectedGateway(gateway);
    setStep('payment');
  };

  const handleWalletPayment = async () => {
    if (!user || !event.price) return;

    if (!checkBalance(event.price)) {
      toast({
        title: "Insufficient Balance",
        description: `You need ₦${event.price.toLocaleString()} to purchase this ticket. Please fund your wallet first.`,
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      // Create ticket record
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .insert([{
          event_id: event.id,
          full_name: user.user_metadata?.full_name || user.email,
          email: user.email,
          phone: user.user_metadata?.phone || null,
          status: 'active',
          ticket_code: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        }])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Deduct from wallet
      await addTransaction(
        event.price,
        'debit',
        `Ticket purchase for ${event.title}`,
        `ticket-${ticketData.id}`,
        event.id,
        { ticket_id: ticketData.id, event_title: event.title }
      );

      toast({
        title: "Ticket Purchased!",
        description: `Your ticket for ${event.title} has been purchased successfully using your wallet.`,
      });

      onOpenChange(false);
      setStep('overview');

    } catch (error: any) {
      console.error('Error purchasing ticket:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetDialog = () => {
    setStep('overview');
    setSelectedGateway(null);
    setProcessing(false);
  };

  const canPayWithWallet = wallet && event.price && checkBalance(event.price);
  const walletBalance = wallet?.balance || 0;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetDialog();
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {step === 'overview' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Event Ticket Purchase</DialogTitle>
              <DialogDescription>
                Complete your ticket purchase for this exciting event
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Event Details Card */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{event.event_type}</span>
                  </div>
                  {event.has_tickets && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Ticketed Event</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Description */}
              <div>
                <h4 className="font-medium mb-2">About This Event</h4>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>

              {/* Pricing */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-primary">
                  ₦{event.price?.toLocaleString() || '0'}
                </span>
              </div>

              {/* Wallet Balance Display */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Wallet Balance:</span>
                  <span className="font-semibold">₦{walletBalance.toLocaleString()}</span>
                </div>
                {!canPayWithWallet && event.price && (
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient wallet balance. You need ₦{(event.price - walletBalance).toLocaleString()} more.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                {canPayWithWallet ? (
                  <Button
                    onClick={handleWalletPayment}
                    disabled={processing}
                    className="flex-1"
                    size="lg"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {processing ? 'Processing...' : 'Pay with Wallet'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setStep('gateway')}
                    className="flex-1"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Fund Wallet & Pay
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {step === 'gateway' && (
          <>
            <DialogHeader>
              <DialogTitle>Choose Payment Method</DialogTitle>
              <DialogDescription>
                Select your preferred payment gateway to fund your wallet
              </DialogDescription>
            </DialogHeader>
            <PaymentGatewaySelector 
              onGatewaySelect={handleGatewaySelect}
              amount={event.price}
              loading={processing}
            />
          </>
        )}

        {step === 'payment' && selectedGateway && (
          <>
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                Enter your payment details to fund your wallet and purchase the ticket
              </DialogDescription>
            </DialogHeader>
            <PaymentForm 
              gateway={selectedGateway}
              amount={event.price || 0}
              description={`Wallet funding for ${event.title} ticket`}
              onSuccess={() => {
                toast({
                  title: "Payment Successful!",
                  description: "Your wallet has been funded and ticket purchased.",
                });
                onOpenChange(false);
              }}
              onError={(error) => {
                toast({
                  title: "Payment Failed",
                  description: error,
                  variant: "destructive",
                });
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventPaymentDialog;