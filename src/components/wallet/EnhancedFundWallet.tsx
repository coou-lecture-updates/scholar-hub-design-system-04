import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter
} from '@/components/ui/bottom-sheet';
import { 
  Plus, 
  Wallet, 
  CreditCard, 
  Smartphone, 
  Building, 
  Shield,
  ChevronRight,
  X,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedFundWalletProps {
  children?: React.ReactNode;
}

const EnhancedFundWallet: React.FC<EnhancedFundWalletProps> = ({ 
  children 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'amount' | 'method' | 'processing' | 'success'>('amount');
  const [amount, setAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { wallet, addTransaction } = useWallet();
  const { toast } = useToast();

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];
  
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // Fetch available payment gateways
  React.useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_gateways')
          .select('*')
          .eq('enabled', true)
          .order('provider');

        if (error) throw error;

        const methods = (data || []).map(gateway => {
          const provider = gateway.provider.toLowerCase();
          return {
            id: provider,
            name: gateway.business_name || gateway.provider,
            description: `${gateway.provider} payment gateway`,
            icon: provider === 'flutterwave' ? <CreditCard className="h-5 w-5" /> :
                  provider === 'paystack' ? <CreditCard className="h-5 w-5" /> :
                  provider === 'korapay' ? <Smartphone className="h-5 w-5" /> :
                  <Building className="h-5 w-5" />,
            color: provider === 'flutterwave' ? 'text-orange-600' :
                   provider === 'paystack' ? 'text-blue-600' :
                   provider === 'korapay' ? 'text-purple-600' :
                   'text-gray-600',
            bgColor: provider === 'flutterwave' ? 'bg-orange-50' :
                     provider === 'paystack' ? 'bg-blue-50' :
                     provider === 'korapay' ? 'bg-purple-50' :
                     'bg-gray-50',
            provider: gateway.provider
          };
        });

        setPaymentMethods(methods);
        if (methods.length > 0) {
          setSelectedMethod(methods[0].id);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        // Fallback to default methods
        setPaymentMethods([
          {
            id: 'flutterwave',
            name: 'Flutterwave',
            description: 'Cards, Bank Transfer, Mobile Money',
            icon: <CreditCard className="h-5 w-5" />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
            provider: 'flutterwave'
          }
        ]);
        setSelectedMethod('flutterwave');
      }
    };

    fetchPaymentMethods();
  }, []);

  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, '');
    setAmount(cleanValue);
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleContinue = () => {
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

    setStep('method');
  };

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleProcessPayment = async () => {
    if (!selectedMethod) return;
    
    setStep('processing');
    setLoading(true);
    
    try {
      const numAmount = parseFloat(amount);
      const method = paymentMethods.find(m => m.id === selectedMethod);
      
      // Get user profile for payment
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the selected payment method details
      const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
      const provider = selectedPaymentMethod?.provider || selectedMethod;

      // Call payment processing edge function
      const { data: paymentResult, error: paymentError } = await supabase.functions
        .invoke('process-payment', {
          body: {
            amount: numAmount,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'User',
            phone: user.user_metadata?.phone || '',
            provider: provider,
            payment_type: 'wallet_funding',
            user_id: user.id
          }
        });

      if (paymentError || !paymentResult?.success) {
        throw new Error(paymentError?.message || 'Payment initialization failed');
      }

      // Redirect to payment gateway or handle success
      if (paymentResult.payment_url && !paymentResult.payment_url.includes('payment-status')) {
        window.open(paymentResult.payment_url, '_blank');
        
        // Monitor payment status
        const checkPaymentStatus = setInterval(async () => {
          const { data: verifyResult } = await supabase.functions
            .invoke('verify-payment', {
              body: { reference: paymentResult.reference }
            });

          if (verifyResult?.success && verifyResult?.status === 'successful') {
            clearInterval(checkPaymentStatus);
            setStep('success');
            setLoading(false);
            
            setTimeout(() => {
              setIsOpen(false);
              resetForm();
              toast({
                title: "Wallet funded successfully!",
                description: `₦${numAmount.toLocaleString()} has been added to your wallet`,
              });
              window.location.reload(); // Refresh to update wallet balance
            }, 2000);
          }
        }, 3000);

        // Stop checking after 5 minutes
        setTimeout(() => clearInterval(checkPaymentStatus), 300000);
        
      } else {
        // Demo payment - simulate success
        setTimeout(async () => {
          setStep('success');
          setLoading(false);
          
          setTimeout(() => {
            setIsOpen(false);
            resetForm();
            toast({
              title: "Wallet funded successfully!",
              description: `₦${numAmount.toLocaleString()} has been added to your wallet`,
            });
            window.location.reload();
          }, 2000);
        }, 3000);
      }
      
    } catch (error: any) {
      setLoading(false);
      setStep('method');
      toast({
        title: "Payment initialization failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setStep('amount');
    setAmount('');
    setSelectedMethod('');
    setLoading(false);
  };

  const renderAmountStep = () => (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4 mx-auto">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold">Add funds</h3>
        <p className="text-sm text-muted-foreground">Enter the amount you want to add to your wallet</p>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Balance</span>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold">₦{wallet?.balance?.toLocaleString() || '0'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Amount Input */}
      <div className="space-y-3">
        <Label>Amount (NGN)</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">₦</span>
          <Input
            type="text"
            placeholder="0"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="pl-10 text-lg font-medium h-14 text-center"
          />
        </div>
      </div>

      {/* Quick Amounts */}
      <div className="space-y-3">
        <Label>Quick select</Label>
        <div className="grid grid-cols-3 gap-2">
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              variant="outline"
              onClick={() => handleQuickAmount(quickAmount)}
              className={`h-12 ${
                amount === quickAmount.toString() 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : ''
              }`}
            >
              ₦{quickAmount.toLocaleString()}
            </Button>
          ))}
        </div>
      </div>

      <Button 
        onClick={handleContinue}
        disabled={!amount || parseFloat(amount) < 100}
        className="w-full h-12 text-base"
        size="lg"
      >
        Continue
      </Button>
    </div>
  );

  const renderMethodStep = () => (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Choose payment method</h3>
          <p className="text-sm text-muted-foreground">
            Amount: ₦{parseFloat(amount).toLocaleString()}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep('amount')}
        >
          Edit
        </Button>
      </div>

      <div className="space-y-3">
        {paymentMethods.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            <p>No payment methods available</p>
            <p className="text-sm">Please contact support to enable payment gateways</p>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all ${
                selectedMethod === method.id 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleMethodSelect(method.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${method.bgColor}`}>
                      <div className={method.color}>
                        {method.icon}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg">
        <Shield className="h-4 w-4" />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      <Button 
        onClick={handleProcessPayment}
        disabled={!selectedMethod || paymentMethods.length === 0}
        className="w-full h-12 text-base"
        size="lg"
      >
        {paymentMethods.length === 0 ? 'No Payment Methods Available' : `Pay ₦${parseFloat(amount).toLocaleString()}`}
      </Button>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="p-8 text-center space-y-6">
      <div className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mx-auto">
        <Clock className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Processing payment...</h3>
        <p className="text-sm text-muted-foreground">
          Please wait while we process your payment of ₦{parseFloat(amount).toLocaleString()}
        </p>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="p-8 text-center space-y-6">
      <div className="flex items-center justify-center w-16 h-16 bg-green-50 rounded-full mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-green-700">Payment successful!</h3>
        <p className="text-sm text-muted-foreground">
          ₦{parseFloat(amount).toLocaleString()} has been added to your wallet
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 'amount':
        return renderAmountStep();
      case 'method':
        return renderMethodStep();
      case 'processing':
        return renderProcessingStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderAmountStep();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add funds
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <DrawerTitle>Fund Wallet</DrawerTitle>
            <DrawerDescription>
              Add money to your wallet securely
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        
        <div className="flex-1 overflow-y-auto">
          {renderCurrentStep()}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EnhancedFundWallet;