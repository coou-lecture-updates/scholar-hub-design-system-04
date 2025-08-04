import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Shield, AlertTriangle } from 'lucide-react';

interface PaymentGatewaySettingsProps {
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

const PaymentGatewaySettings: React.FC<PaymentGatewaySettingsProps> = ({
  getSetting,
  onUpdate,
  isUpdating
}) => {
  // Paystack Settings
  const [paystackEnabled, setPaystackEnabled] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  const [paystackSecretKey, setPaystackSecretKey] = useState('');
  
  // Flutterwave Settings
  const [flutterwaveEnabled, setFlutterwaveEnabled] = useState(false);
  const [flutterwavePublicKey, setFlutterwavePublicKey] = useState('');
  const [flutterwaveSecretKey, setFlutterwaveSecretKey] = useState('');
  
  // Korapay Settings
  const [korapayEnabled, setKorapayEnabled] = useState(false);
  const [korapayPublicKey, setKorapayPublicKey] = useState('');
  const [korapaySecretKey, setKorapaySecretKey] = useState('');
  
  // Stripe Settings
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripePublicKey, setStripePublicKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');

  useEffect(() => {
    // Load Paystack settings
    setPaystackEnabled(getSetting('paystack_enabled') === 'true');
    setPaystackPublicKey(getSetting('paystack_public_key'));
    setPaystackSecretKey(getSetting('paystack_secret_key'));
    
    // Load Flutterwave settings
    setFlutterwaveEnabled(getSetting('flutterwave_enabled') === 'true');
    setFlutterwavePublicKey(getSetting('flutterwave_public_key'));
    setFlutterwaveSecretKey(getSetting('flutterwave_secret_key'));
    
    // Load Korapay settings
    setKorapayEnabled(getSetting('korapay_enabled') === 'true');
    setKorapayPublicKey(getSetting('korapay_public_key'));
    setKorapaySecretKey(getSetting('korapay_secret_key'));
    
    // Load Stripe settings
    setStripeEnabled(getSetting('stripe_enabled') === 'true');
    setStripePublicKey(getSetting('stripe_public_key'));
    setStripeSecretKey(getSetting('stripe_secret_key'));
  }, [getSetting]);

  const handleSaveAll = () => {
    // Save Paystack settings
    onUpdate('paystack_enabled', paystackEnabled.toString());
    onUpdate('paystack_public_key', paystackPublicKey);
    onUpdate('paystack_secret_key', paystackSecretKey);
    
    // Save Flutterwave settings
    onUpdate('flutterwave_enabled', flutterwaveEnabled.toString());
    onUpdate('flutterwave_public_key', flutterwavePublicKey);
    onUpdate('flutterwave_secret_key', flutterwaveSecretKey);
    
    // Save Korapay settings
    onUpdate('korapay_enabled', korapayEnabled.toString());
    onUpdate('korapay_public_key', korapayPublicKey);
    onUpdate('korapay_secret_key', korapaySecretKey);
    
    // Save Stripe settings
    onUpdate('stripe_enabled', stripeEnabled.toString());
    onUpdate('stripe_public_key', stripePublicKey);
    onUpdate('stripe_secret_key', stripeSecretKey);
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Gateway Settings</h2>
          <p className="text-muted-foreground">Configure payment methods for your platform</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Secure Configuration
        </Badge>
      </div>

      {/* Paystack Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-green-600" />
              <CardTitle>Paystack</CardTitle>
              <Badge variant={paystackEnabled ? "default" : "secondary"}>
                {paystackEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Switch
              checked={paystackEnabled}
              onCheckedChange={setPaystackEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paystack-public">Public Key</Label>
              <Input
                id="paystack-public"
                type="text"
                placeholder="pk_test_..."
                value={paystackPublicKey}
                onChange={(e) => setPaystackPublicKey(e.target.value)}
                disabled={!paystackEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paystack-secret">Secret Key</Label>
              <Input
                id="paystack-secret"
                type="password"
                placeholder="sk_test_..."
                value={paystackSecretKey}
                onChange={(e) => setPaystackSecretKey(e.target.value)}
                disabled={!paystackEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flutterwave Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-orange-600" />
              <CardTitle>Flutterwave</CardTitle>
              <Badge variant={flutterwaveEnabled ? "default" : "secondary"}>
                {flutterwaveEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Switch
              checked={flutterwaveEnabled}
              onCheckedChange={setFlutterwaveEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flutterwave-public">Public Key</Label>
              <Input
                id="flutterwave-public"
                type="text"
                placeholder="FLWPUBK_TEST-..."
                value={flutterwavePublicKey}
                onChange={(e) => setFlutterwavePublicKey(e.target.value)}
                disabled={!flutterwaveEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flutterwave-secret">Secret Key</Label>
              <Input
                id="flutterwave-secret"
                type="password"
                placeholder="FLWSECK_TEST-..."
                value={flutterwaveSecretKey}
                onChange={(e) => setFlutterwaveSecretKey(e.target.value)}
                disabled={!flutterwaveEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Korapay Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <CardTitle>Korapay</CardTitle>
              <Badge variant={korapayEnabled ? "default" : "secondary"}>
                {korapayEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Switch
              checked={korapayEnabled}
              onCheckedChange={setKorapayEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="korapay-public">Public Key</Label>
              <Input
                id="korapay-public"
                type="text"
                placeholder="pk_test_..."
                value={korapayPublicKey}
                onChange={(e) => setKorapayPublicKey(e.target.value)}
                disabled={!korapayEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="korapay-secret">Secret Key</Label>
              <Input
                id="korapay-secret"
                type="password"
                placeholder="sk_test_..."
                value={korapaySecretKey}
                onChange={(e) => setKorapaySecretKey(e.target.value)}
                disabled={!korapayEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <CardTitle>Stripe</CardTitle>
              <Badge variant={stripeEnabled ? "default" : "secondary"}>
                {stripeEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Switch
              checked={stripeEnabled}
              onCheckedChange={setStripeEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stripe-public">Publishable Key</Label>
              <Input
                id="stripe-public"
                type="text"
                placeholder="pk_test_..."
                value={stripePublicKey}
                onChange={(e) => setStripePublicKey(e.target.value)}
                disabled={!stripeEnabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stripe-secret">Secret Key</Label>
              <Input
                id="stripe-secret"
                type="password"
                placeholder="sk_test_..."
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                disabled={!stripeEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Security Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Security Notice</h4>
              <p className="text-sm text-amber-700 mt-1">
                Secret keys should be stored securely in Supabase Edge Function secrets, not in system settings. 
                Only use test keys for development and never expose secret keys in client-side code.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSaveAll}
          disabled={isUpdating}
          size="lg"
        >
          {isUpdating ? "Saving..." : "Save Payment Settings"}
        </Button>
      </div>
    </div>
  );
};

export default PaymentGatewaySettings;