import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone, Building, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentGateway {
  id: string;
  provider: string;
  enabled: boolean;
  business_name: string;
  mode: string;
  public_key: string;
  secret_key: string;
  display_name?: string;
  description?: string;
  icon?: string;
}

interface PaymentGatewayIntegrationProps {
  onProviderSelect: (provider: string, gateway: PaymentGateway) => void;
  loading?: boolean;
  amount?: number;
}

const PaymentGatewayIntegration: React.FC<PaymentGatewayIntegrationProps> = ({ 
  onProviderSelect, 
  loading, 
  amount 
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [availableGateways, setAvailableGateways] = useState<PaymentGateway[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableGateways();
  }, []);

  const fetchAvailableGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('enabled', true)
        .order('display_order');

      if (error) throw error;

      const mappedGateways = (data || []).map(gateway => ({
        ...gateway,
        display_name: gateway.business_name || gateway.provider,
        description: `${gateway.provider} payment gateway`,
        icon: gateway.provider
      }));
      
      setAvailableGateways(mappedGateways);
      if (mappedGateways.length > 0) {
        setSelectedProvider(mappedGateways[0].provider);
      }
    } catch (error: any) {
      console.error('Error fetching payment gateways:', error);
      toast({
        title: "Error loading payment methods",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'flutterwave':
        return <CreditCard className="h-6 w-6 text-orange-500" />;
      case 'paystack':
        return <CreditCard className="h-6 w-6 text-blue-500" />;
      case 'korapay':
        return <Smartphone className="h-6 w-6 text-purple-500" />;
      default:
        return <Building className="h-6 w-6 text-gray-500" />;
    }
  };

  const handleProceed = () => {
    const selectedGateway = availableGateways.find(g => g.provider === selectedProvider);
    if (selectedGateway) {
      onProviderSelect(selectedProvider, selectedGateway);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading payment methods...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availableGateways.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-destructive">No Payment Methods Available</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Please contact support to enable payment methods.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-primary">Choose Payment Method</CardTitle>
        {amount && (
          <div className="text-lg font-semibold text-center">
            Amount: <span className="text-primary">₦{amount.toLocaleString()}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedProvider}
          onValueChange={setSelectedProvider}
          className="space-y-4"
        >
          {availableGateways.map((gateway) => (
            <div 
              key={gateway.id}
              className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedProvider(gateway.provider)}
            >
              <RadioGroupItem value={gateway.provider} id={gateway.provider} />
              <Label 
                htmlFor={gateway.provider} 
                className="flex items-center space-x-3 cursor-pointer flex-1"
              >
                {getProviderIcon(gateway.provider)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{gateway.display_name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {gateway.provider.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {gateway.description}
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
        
        <Button 
          onClick={handleProceed}
          disabled={loading || !selectedProvider}
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Proceed to Payment'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentGatewayIntegration;