import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Zap, Shield, Check } from 'lucide-react';

interface PaymentGateway {
  id: 'flutterwave' | 'korapay' | 'paystack';
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
}

interface PaymentGatewaySelectorProps {
  onGatewaySelect: (gateway: 'flutterwave' | 'korapay' | 'paystack') => void;
  loading?: boolean;
  amount?: number;
}

const paymentGateways: PaymentGateway[] = [
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    description: 'Cards, Bank Transfer, Mobile Money, USSD',
    icon: <CreditCard className="h-6 w-6 text-orange-500" />,
    features: ['Instant processing', 'Multiple payment methods', 'International cards'],
    recommended: true
  },
  {
    id: 'korapay',
    name: 'Korapay',
    description: 'Bank Transfer, USSD, QR Code payments',
    icon: <Smartphone className="h-6 w-6 text-blue-500" />,
    features: ['Low fees', 'Fast settlements', 'Nigerian banks']
  },
  {
    id: 'paystack',
    name: 'Paystack',
    description: 'Cards, Bank Transfer, Mobile Money',
    icon: <Zap className="h-6 w-6 text-green-500" />,
    features: ['Reliable payments', 'Advanced security', 'Real-time updates']
  }
];

const PaymentGatewaySelector = ({ onGatewaySelect, loading, amount }: PaymentGatewaySelectorProps) => {
  const [selectedGateway, setSelectedGateway] = useState<'flutterwave' | 'korapay' | 'paystack'>('flutterwave');

  const handleProceed = () => {
    onGatewaySelect(selectedGateway);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Choose Payment Method</h2>
        <p className="text-muted-foreground">
          Select your preferred payment gateway to complete your transaction
        </p>
        {amount && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-lg text-muted-foreground">Amount:</span>
            <span className="text-2xl font-bold text-primary">₦{amount.toLocaleString()}</span>
          </div>
        )}
      </div>

      <RadioGroup
        value={selectedGateway}
        onValueChange={(value) => setSelectedGateway(value as typeof selectedGateway)}
        className="space-y-4"
      >
        {paymentGateways.map((gateway) => (
          <div key={gateway.id} className="relative">
            <div className={`flex items-start space-x-4 p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50 ${
              selectedGateway === gateway.id 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:bg-accent/50'
            }`}>
              <RadioGroupItem value={gateway.id} id={gateway.id} className="mt-1" />
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={gateway.id} className="flex items-center space-x-3 cursor-pointer">
                    {gateway.icon}
                    <div>
                      <div className="font-semibold text-lg flex items-center gap-2">
                        {gateway.name}
                        {gateway.recommended && (
                          <Badge variant="secondary" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{gateway.description}</div>
                    </div>
                  </Label>
                  
                  {selectedGateway === gateway.id && (
                    <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {gateway.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
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
          disabled={loading}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            `Proceed with ${paymentGateways.find(g => g.id === selectedGateway)?.name}`
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