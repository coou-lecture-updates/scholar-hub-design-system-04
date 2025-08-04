import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, DollarSign, Shield, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import PaymentGatewaySelector from '@/components/payment/PaymentGatewaySelector';
import { supabase } from '@/integrations/supabase/client';

const FundWallet: React.FC = () => {
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showGatewaySelector, setShowGatewaySelector] = useState(false);
  const { wallet, addTransaction } = useWallet();
  const { toast } = useToast();

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleAmountChange = (value: string) => {
    // Only allow numbers
    const cleanValue = value.replace(/[^\d]/g, '');
    setAmount(cleanValue);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleProceedToPayment = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount < 100) {
      toast({
        title: "Invalid amount",
        description: "Minimum funding amount is ₦100",
        variant: "destructive",
      });
      return;
    }

    if (numAmount > 1000000) {
      toast({
        title: "Amount too large",
        description: "Maximum funding amount is ₦1,000,000",
        variant: "destructive",
      });
      return;
    }

    setShowGatewaySelector(true);
  };

  const handlePaymentGatewaySelect = async (gateway: 'flutterwave' | 'korapay' | 'paystack') => {
    setLoading(true);
    
    try {
      const numAmount = parseFloat(amount);
      
      // Get user data from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please log in to continue');
      }

      // Call the process-payment edge function
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          amount: numAmount,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email,
          phone: user.user_metadata?.phone || '',
          provider: gateway,
          payment_type: 'wallet_funding',
          user_id: user.id
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success && data.payment_url) {
        // Redirect to payment gateway
        window.location.href = data.payment_url;
      } else {
        throw new Error('Failed to initialize payment');
      }
      
    } catch (error) {
      setLoading(false);
      toast({
        title: "Payment initialization failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  if (showGatewaySelector) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Fund Wallet - ₦{parseFloat(amount).toLocaleString()}
            </CardTitle>
            <CardDescription>
              Choose your preferred payment method to complete the transaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentGatewaySelector
              onGatewaySelect={handlePaymentGatewaySelect}
              loading={loading}
              amount={parseFloat(amount)}
            />
            
            <div className="mt-6 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setShowGatewaySelector(false)}
                className="w-full"
              >
                Back to Amount Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Fund Your Wallet
          </CardTitle>
          <CardDescription>
            Add money to your wallet to create paid events and purchase tickets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Balance */}
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Balance</span>
              <span className="text-lg font-semibold text-foreground">
                ₦{wallet?.balance?.toLocaleString() || '0'}
              </span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount">Enter Amount (NGN)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
              <Input
                id="amount"
                type="text"
                placeholder="0"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-8 text-lg font-medium h-12"
              />
            </div>
            {amount && parseFloat(amount) >= 100 && (
              <div className="text-sm text-muted-foreground">
                You will fund: <span className="font-medium text-foreground">₦{parseFloat(amount).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="space-y-3">
            <Label>Quick Select</Label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  onClick={() => handleQuickAmount(quickAmount)}
                  className={`h-12 ${
                    amount === quickAmount.toString() 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  ₦{quickAmount.toLocaleString()}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Transaction Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secure payment processing with 256-bit SSL encryption</span>
            </div>
            
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium">Note:</p>
                  <p>Creating paid events requires ₦2,000 which will be deducted from your wallet balance.</p>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleProceedToPayment}
            disabled={!amount || parseFloat(amount) < 100 || loading}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </div>
            ) : (
              `Proceed to Payment - ₦${amount ? parseFloat(amount).toLocaleString() : '0'}`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundWallet;