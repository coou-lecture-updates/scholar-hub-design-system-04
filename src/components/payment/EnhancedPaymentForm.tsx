import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, Shield, Check } from 'lucide-react';
import { toast } from 'sonner';
import { EnhancedPaymentService, PaymentRequest, paymentService } from '@/services/paymentService';
import { useAuth } from '@/contexts/auth/useAuth';

interface EnhancedPaymentFormProps {
  amount?: number;
  type: 'wallet_funding' | 'event_ticket' | 'general';
  eventId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EnhancedPaymentForm: React.FC<EnhancedPaymentFormProps> = ({
  amount: initialAmount,
  type,
  eventId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gateways, setGateways] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    amount: initialAmount || 0,
    email: user?.email || '',
    name: user?.user_metadata?.full_name || '',
    phone: user?.user_metadata?.phone || '',
    provider: '' as 'paystack' | 'flutterwave' | 'korapay' | ''
  });

  useEffect(() => {
    loadPaymentGateways();
  }, []);

  const loadPaymentGateways = async () => {
    try {
      const gateways = await paymentService.getPaymentGateways();
      setGateways(gateways);
      
      if (gateways.length > 0) {
        setFormData(prev => ({ ...prev, provider: gateways[0].provider }));
      }
    } catch (error) {
      console.error('Failed to load payment gateways:', error);
      toast.error('Failed to load payment options');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.provider) {
      toast.error('Please select a payment method');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      const request: PaymentRequest = {
        amount: formData.amount,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        provider: formData.provider,
        type,
        metadata: {
          user_id: user?.id,
          event_id: eventId,
          timestamp: new Date().toISOString()
        }
      };

      const response = await paymentService.initializePayment(request);

      if (response.success && response.data?.payment_url) {
        // Redirect to payment gateway
        window.location.href = response.data.payment_url;
      } else {
        throw new Error(response.error || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'paystack':
        return '💳';
      case 'flutterwave':
        return '🦋';
      case 'korapay':
        return '🔵';
      default:
        return '💳';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {type === 'wallet_funding' ? 'Fund Wallet' : 
           type === 'event_ticket' ? 'Buy Ticket' : 'Make Payment'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter amount"
              min="1"
              required
              disabled={!!initialAmount}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="08012345678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">Payment Method</Label>
            <Select value={formData.provider} onValueChange={(value: any) => setFormData(prev => ({ ...prev, provider: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {gateways.map((gateway) => (
                  <SelectItem key={gateway.id} value={gateway.provider}>
                    <div className="flex items-center gap-2">
                      <span>{getProviderIcon(gateway.provider)}</span>
                      <span className="capitalize">{gateway.provider}</span>
                      {gateway.mode === 'live' && (
                        <span className="text-xs bg-green-100 text-green-700 px-1 rounded">Live</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your payment is secured with 256-bit SSL encryption</span>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay ₦{formData.amount.toLocaleString()}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};