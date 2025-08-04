
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentProviderSelectorProps {
  onProviderSelect: (provider: 'flutterwave' | 'korapay') => void;
  loading?: boolean;
}

const PaymentProviderSelector = ({ onProviderSelect, loading }: PaymentProviderSelectorProps) => {
  const [selectedProvider, setSelectedProvider] = useState<'flutterwave' | 'korapay'>('flutterwave');

  const handleProceed = () => {
    onProviderSelect(selectedProvider);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-blue-900">Choose Payment Method</CardTitle>
        <CardDescription>Select your preferred payment gateway</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup
          value={selectedProvider}
          onValueChange={(value) => setSelectedProvider(value as 'flutterwave' | 'korapay')}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 transition-colors">
            <RadioGroupItem value="flutterwave" id="flutterwave" />
            <Label htmlFor="flutterwave" className="flex items-center space-x-3 cursor-pointer flex-1">
              <CreditCard className="h-6 w-6 text-orange-500" />
              <div>
                <div className="font-medium">Flutterwave</div>
                <div className="text-sm text-gray-500">Cards, Bank Transfer, Mobile Money</div>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-blue-50 transition-colors">
            <RadioGroupItem value="korapay" id="korapay" />
            <Label htmlFor="korapay" className="flex items-center space-x-3 cursor-pointer flex-1">
              <Smartphone className="h-6 w-6 text-blue-500" />
              <div>
                <div className="font-medium">Korapay</div>
                <div className="text-sm text-gray-500">Bank Transfer, USSD, QR Code</div>
              </div>
            </Label>
          </div>
        </RadioGroup>
        
        <Button 
          onClick={handleProceed}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentProviderSelector;
