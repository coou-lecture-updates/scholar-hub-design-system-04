import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Smartphone, Zap, Shield, Check, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentGateway {
  id: string;
  provider: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  mode: 'test' | 'live';
  enabled: boolean;
}

interface PaymentGatewaySelectorProps {
  onGatewaySelect: (gateway: 'flutterwave' | 'korapay' | 'paystack') => void;
  loading?: boolean;
  amount?: number;
}

const getProviderIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case 'flutterwave':
      return <CreditCard className="h-6 w-6 text-orange-500" />;
    case 'korapay':
      return <Smartphone className="h-6 w-6 text-purple-500" />;
    case 'paystack':
      return <Zap className="h-6 w-6 text-green-500" />;
    default:
      return <CreditCard className="h-6 w-6 text-gray-500" />;
  }
};

const getProviderFeatures = (provider: string): string[] => {
  switch (provider.toLowerCase()) {
    case 'flutterwave':
      return ['Instant processing', 'Multiple payment methods', 'International cards'];
    case 'korapay':
      return ['Low fees', 'Fast settlements', 'Nigerian banks'];
    case 'paystack':
      return ['Reliable payments', 'Advanced security', 'Real-time updates'];
    default:
      return ['Secure payments'];
  }
};

const getProviderDescription = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case 'flutterwave':
      return 'Cards, Bank Transfer, Mobile Money, USSD';
    case 'korapay':
      return 'Bank Transfer, USSD, QR Code payments';
    case 'paystack':
      return 'Cards, Bank Transfer, Mobile Money';
    default:
      return 'Payment gateway';
  }
};

const PaymentGatewaySelector = ({ onGatewaySelect, loading, amount }: PaymentGatewaySelectorProps) => {
  const [selectedGateway, setSelectedGateway] = useState<'flutterwave' | 'korapay' | 'paystack' | null>(null);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnabledGateways();
  }, []);

  const fetchEnabledGateways = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('enabled', true)
        .order('provider');

      if (fetchError) throw fetchError;

      if (!data || data.length === 0) {
        setError('No payment gateways are configured. Please contact the administrator.');
        setGateways([]);
        return;
      }

      // Filter to only show one entry per provider (prefer live mode)
      const uniqueProviders = new Map<string, any>();
      data.forEach((gateway: any) => {
        const providerKey = gateway.provider.toLowerCase();
        const existing = uniqueProviders.get(providerKey);
        if (!existing || gateway.mode === 'live') {
          uniqueProviders.set(providerKey, gateway);
        }
      });

      const mappedGateways: PaymentGateway[] = Array.from(uniqueProviders.values()).map((gateway: any) => ({
        id: gateway.id,
        provider: gateway.provider.toLowerCase() as 'flutterwave' | 'korapay' | 'paystack',
        name: gateway.business_name || gateway.provider,
        description: getProviderDescription(gateway.provider),
        icon: getProviderIcon(gateway.provider),
        features: getProviderFeatures(gateway.provider),
        mode: gateway.mode || 'test',
        enabled: gateway.enabled
      }));

      // Validate that gateways have valid keys
      const validGateways = mappedGateways.filter(g => {
        const original = data.find((d: any) => d.id === g.id);
        return original?.secret_key && !original.secret_key.includes('000000');
      });

      if (validGateways.length === 0 && mappedGateways.length > 0) {
        setError('Payment gateways are enabled but API keys are not properly configured. Please contact the administrator.');
      }

      setGateways(validGateways.length > 0 ? validGateways : mappedGateways);
      
      if (validGateways.length > 0) {
        setSelectedGateway(validGateways[0].provider as 'flutterwave' | 'korapay' | 'paystack');
      } else if (mappedGateways.length > 0) {
        setSelectedGateway(mappedGateways[0].provider as 'flutterwave' | 'korapay' | 'paystack');
      }
    } catch (err: any) {
      console.error('Error fetching payment gateways:', err);
      setError('Failed to load payment methods. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (selectedGateway) {
      onGatewaySelect(selectedGateway);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading payment methods...</p>
      </div>
    );
  }

  if (error && gateways.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Choose Payment Method</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Select your preferred payment gateway to complete your transaction
        </p>
        {amount && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-base md:text-lg text-muted-foreground">Amount:</span>
            <span className="text-xl md:text-2xl font-bold text-primary">₦{amount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <RadioGroup
        value={selectedGateway || ''}
        onValueChange={(value) => setSelectedGateway(value as typeof selectedGateway)}
        className="space-y-3 md:space-y-4"
      >
        {gateways.map((gateway) => (
          <div key={gateway.id} className="relative">
            <div className={`flex items-start space-x-3 md:space-x-4 p-4 md:p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
              selectedGateway === gateway.provider 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:bg-accent/50'
            }`}>
              <RadioGroupItem value={gateway.provider} id={gateway.provider} className="mt-1" />
              
              <div className="flex-1 space-y-2 md:space-y-3 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <Label htmlFor={gateway.provider} className="flex items-center space-x-2 md:space-x-3 cursor-pointer">
                    {gateway.icon}
                    <div className="min-w-0">
                      <div className="font-semibold text-base md:text-lg flex items-center gap-2 flex-wrap">
                        <span className="truncate">{gateway.name}</span>
                        <Badge 
                          variant={gateway.mode === 'live' ? 'default' : 'secondary'} 
                          className={`text-xs ${gateway.mode === 'live' ? 'bg-green-600' : 'bg-yellow-500'}`}
                        >
                          {gateway.mode === 'live' ? 'Live' : 'Test Mode'}
                        </Badge>
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground truncate">{gateway.description}</div>
                    </div>
                  </Label>
                  
                  {selectedGateway === gateway.provider && (
                    <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full shrink-0">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {gateway.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>

      <div className="space-y-4">
        <Button 
          onClick={handleProceed}
          disabled={loading || !selectedGateway || gateways.length === 0}
          className="w-full h-11 md:h-12 text-base md:text-lg"
          size="lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          ) : gateways.length === 0 ? (
            'No Payment Methods Available'
          ) : (
            `Proceed with ${gateways.find(g => g.provider === selectedGateway)?.name || 'Payment'}`
          )}
        </Button>
        
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Your payment is secured with 256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentGatewaySelector;
