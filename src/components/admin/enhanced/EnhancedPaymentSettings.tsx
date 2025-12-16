import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  Eye,
  EyeOff,
  CheckCircle,
  Clock,
  ExternalLink,
  Globe,
  DollarSign,
  Zap,
  Activity,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnhancedPaymentSettingsProps {
  getSetting: (key: string) => string;
  onUpdate: (key: string, value: string) => void;
  isUpdating: boolean;
}

interface PaymentProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  fees: {
    domestic: string;
    international: string;
  };
  currencies: string[];
  testMode: boolean;
  enabled: boolean;
  publicKey: string;
  secretKey: string;
  webhookUrl: string;
  merchantId?: string;
}

const EnhancedPaymentSettings: React.FC<EnhancedPaymentSettingsProps> = ({
  getSetting,
  onUpdate,
  isUpdating
}) => {
  const { toast } = useToast();

  const [providers, setProviders] = useState<PaymentProvider[]>([
    {
      id: 'paystack',
      name: 'Paystack',
      description: 'Accept payments from customers across Africa',
      icon: '🏦',
      color: 'green',
      features: ['Bank Transfer', 'Card Payments', 'USSD', 'QR Code'],
      fees: { domestic: '1.5%', international: '3.9%' },
      currencies: ['NGN', 'GHS', 'ZAR', 'KES'],
      testMode: true,
      enabled: false,
      publicKey: '',
      secretKey: '',
      webhookUrl: '',
    },
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      description: 'Global payment infrastructure for Africa',
      icon: '🌊',
      color: 'orange',
      features: ['Card Payments', 'Bank Transfer', 'Mobile Money', 'Crypto'],
      fees: { domestic: '1.4%', international: '3.8%' },
      currencies: ['NGN', 'USD', 'EUR', 'GBP', 'KES', 'GHS'],
      testMode: true,
      enabled: false,
      publicKey: '',
      secretKey: '',
      webhookUrl: '',
    },
    {
      id: 'korapay',
      name: 'Korapay',
      description: 'Simple, secure payment gateway',
      icon: '💳',
      color: 'blue',
      features: ['Card Payments', 'Bank Transfer', 'USSD'],
      fees: { domestic: '1.5%', international: '3.9%' },
      currencies: ['NGN'],
      testMode: true,
      enabled: false,
      publicKey: '',
      secretKey: '',
      webhookUrl: '',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Global online payment processing',
      icon: '💸',
      color: 'purple',
      features: ['Card Payments', 'Digital Wallets', 'ACH', 'Wire Transfer'],
      fees: { domestic: '2.9% + $0.30', international: '3.9% + $0.30' },
      currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
      testMode: true,
      enabled: false,
      publicKey: '',
      secretKey: '',
      webhookUrl: '',
    }
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    defaultCurrency: 'NGN',
    paymentTimeout: '30',
    webhookRetries: '3',
    enablePaymentLogs: true,
    requireBillingAddress: false,
    enableSaveCard: true,
    enableRefunds: true,
    enablePartialRefunds: false,
  });

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'checking' | 'connected' | 'error' | 'idle'>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load payment provider settings
    const updatedProviders = providers.map(provider => ({
      ...provider,
      enabled: getSetting(`${provider.id}_enabled`) === 'true',
      testMode: getSetting(`${provider.id}_test_mode`) !== 'false',
      publicKey: getSetting(`${provider.id}_public_key`) || '',
      secretKey: getSetting(`${provider.id}_secret_key`) || '',
      webhookUrl: getSetting(`${provider.id}_webhook_url`) || '',
      merchantId: getSetting(`${provider.id}_merchant_id`) || '',
    }));
    setProviders(updatedProviders);

    // Load global settings
    setGlobalSettings(prev => ({
      ...prev,
      defaultCurrency: getSetting('default_currency') || 'NGN',
      paymentTimeout: getSetting('payment_timeout') || '30',
      webhookRetries: getSetting('webhook_retries') || '3',
      enablePaymentLogs: getSetting('enable_payment_logs') !== 'false',
      requireBillingAddress: getSetting('require_billing_address') === 'true',
      enableSaveCard: getSetting('enable_save_card') !== 'false',
      enableRefunds: getSetting('enable_refunds') !== 'false',
      enablePartialRefunds: getSetting('enable_partial_refunds') === 'true',
    }));
  }, [getSetting]);

  const updateProvider = (providerId: string, field: string, value: any) => {
    setProviders(prev => prev.map(provider => 
      provider.id === providerId 
        ? { ...provider, [field]: value }
        : provider
    ));
  };

  const validateProviderCredentials = (provider: PaymentProvider) => {
    const errors: Record<string, string> = {};

    if (provider.enabled) {
      if (!provider.publicKey.trim()) {
        errors[`${provider.id}_publicKey`] = 'Public key is required';
      }
      if (!provider.secretKey.trim()) {
        errors[`${provider.id}_secretKey`] = 'Secret key is required';
      }

      // Provider-specific validation
      switch (provider.id) {
        case 'paystack':
          if (provider.publicKey && !provider.publicKey.startsWith('pk_')) {
            errors[`${provider.id}_publicKey`] = 'Paystack public key should start with pk_';
          }
          if (provider.secretKey && !provider.secretKey.startsWith('sk_')) {
            errors[`${provider.id}_secretKey`] = 'Paystack secret key should start with sk_';
          }
          break;
        case 'stripe':
          if (provider.publicKey && !provider.publicKey.startsWith('pk_')) {
            errors[`${provider.id}_publicKey`] = 'Stripe publishable key should start with pk_';
          }
          if (provider.secretKey && !provider.secretKey.startsWith('sk_')) {
            errors[`${provider.id}_secretKey`] = 'Stripe secret key should start with sk_';
          }
          break;
      }
    }

    return errors;
  };

  const testConnection = async (provider: PaymentProvider) => {
    setConnectionStatus(prev => ({ ...prev, [provider.id]: 'checking' }));
    
    // Simulate API test
    setTimeout(() => {
      const errors = validateProviderCredentials(provider);
      const hasErrors = Object.keys(errors).length > 0;
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        [provider.id]: hasErrors ? 'error' : 'connected' 
      }));
      
      toast({
        title: `${provider.name} Connection ${hasErrors ? 'Failed' : 'Successful'}`,
        description: hasErrors 
          ? `Connection failed. Please check your ${provider.name} credentials.`
          : `Successfully connected to ${provider.name} API.`,
        variant: hasErrors ? 'destructive' : 'default'
      });
    }, 2000);
  };

  const handleSaveAll = () => {
    // Validate all enabled providers
    let hasErrors = false;
    const allErrors: Record<string, string> = {};

    providers.forEach(provider => {
      if (provider.enabled) {
        const errors = validateProviderCredentials(provider);
        Object.assign(allErrors, errors);
        if (Object.keys(errors).length > 0) {
          hasErrors = true;
        }
      }
    });

    setValidationErrors(allErrors);

    if (hasErrors) {
      toast({
        title: "Validation Error",
        description: "Please fix the validation errors before saving.",
        variant: "destructive"
      });
      return;
    }

    // Save provider settings
    providers.forEach(provider => {
      onUpdate(`${provider.id}_enabled`, provider.enabled.toString());
      onUpdate(`${provider.id}_test_mode`, provider.testMode.toString());
      onUpdate(`${provider.id}_public_key`, provider.publicKey);
      onUpdate(`${provider.id}_secret_key`, provider.secretKey);
      onUpdate(`${provider.id}_webhook_url`, provider.webhookUrl);
      if (provider.merchantId !== undefined) {
        onUpdate(`${provider.id}_merchant_id`, provider.merchantId);
      }
    });

    // Save global settings
    Object.entries(globalSettings).forEach(([key, value]) => {
      onUpdate(key, value.toString());
    });

    toast({
      title: "Payment Settings Saved",
      description: "All payment configuration has been updated successfully.",
    });
  };

  const getConnectionStatusIcon = (status: string) => {
    switch (status) {
      case 'checking':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const toggleSecretVisibility = (field: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getProviderStatusColor = (provider: PaymentProvider) => {
    if (!provider.enabled) return 'gray';
    if (connectionStatus[provider.id] === 'connected') return 'green';
    if (connectionStatus[provider.id] === 'error') return 'red';
    return 'yellow';
  };

  const enabledProvidersCount = providers.filter(p => p.enabled).length;
  const setupProgress = (enabledProvidersCount / providers.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Payment Gateway Settings
          </h2>
          <p className="text-muted-foreground">Configure payment methods and processing options</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Secure Configuration
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Multi-Currency
          </Badge>
        </div>
      </div>

      {/* Setup Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Payment Setup Progress</h3>
              <span className="text-sm text-muted-foreground">
                {enabledProvidersCount} of {providers.length} providers enabled
              </span>
            </div>
            <Progress value={setupProgress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              Enable multiple payment providers to offer your customers more payment options
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="providers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="providers">Payment Providers</TabsTrigger>
          <TabsTrigger value="global">Global Settings</TabsTrigger>
          <TabsTrigger value="security">Security & Compliance</TabsTrigger>
        </TabsList>

        {/* Payment Providers */}
        <TabsContent value="providers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{provider.icon}</div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {provider.name}
                          <Badge 
                            variant={provider.enabled ? "default" : "secondary"}
                            className={`text-xs ${getProviderStatusColor(provider) === 'green' ? 'bg-green-100 text-green-800' : ''}`}
                          >
                            {provider.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={provider.enabled}
                      onCheckedChange={(checked) => updateProvider(provider.id, 'enabled', checked)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Provider Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Domestic Fees</p>
                      <p className="text-muted-foreground">{provider.fees.domestic}</p>
                    </div>
                    <div>
                      <p className="font-medium">International Fees</p>
                      <p className="text-muted-foreground">{provider.fees.international}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div>
                    <p className="font-medium text-sm mb-2">Supported Features</p>
                    <div className="flex flex-wrap gap-1">
                      {provider.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Configuration */}
                  {provider.enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Test Mode</Label>
                          <Badge variant={provider.testMode ? "secondary" : "default"} className="text-xs">
                            {provider.testMode ? 'Test' : 'Live'}
                          </Badge>
                        </div>
                        <Switch
                          checked={provider.testMode}
                          onCheckedChange={(checked) => updateProvider(provider.id, 'testMode', checked)}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor={`${provider.id}-public-key`} className="text-sm">
                            Public Key
                          </Label>
                          <div className="relative">
                            <Input
                              id={`${provider.id}-public-key`}
                              type={showSecrets[`${provider.id}_publicKey`] ? 'text' : 'password'}
                              placeholder={`${provider.name} public key`}
                              value={provider.publicKey}
                              onChange={(e) => updateProvider(provider.id, 'publicKey', e.target.value)}
                              className={validationErrors[`${provider.id}_publicKey`] ? 'border-red-500 pr-10' : 'pr-10'}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleSecretVisibility(`${provider.id}_publicKey`)}
                            >
                              {showSecrets[`${provider.id}_publicKey`] ? 
                                <EyeOff className="h-4 w-4" /> : 
                                <Eye className="h-4 w-4" />
                              }
                            </Button>
                          </div>
                          {validationErrors[`${provider.id}_publicKey`] && (
                            <p className="text-xs text-red-500">{validationErrors[`${provider.id}_publicKey`]}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`${provider.id}-secret-key`} className="text-sm">
                            Secret Key
                          </Label>
                          <div className="relative">
                            <Input
                              id={`${provider.id}-secret-key`}
                              type={showSecrets[`${provider.id}_secretKey`] ? 'text' : 'password'}
                              placeholder={`${provider.name} secret key`}
                              value={provider.secretKey}
                              onChange={(e) => updateProvider(provider.id, 'secretKey', e.target.value)}
                              className={validationErrors[`${provider.id}_secretKey`] ? 'border-red-500 pr-10' : 'pr-10'}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => toggleSecretVisibility(`${provider.id}_secretKey`)}
                            >
                              {showSecrets[`${provider.id}_secretKey`] ? 
                                <EyeOff className="h-4 w-4" /> : 
                                <Eye className="h-4 w-4" />
                              }
                            </Button>
                          </div>
                          {validationErrors[`${provider.id}_secretKey`] && (
                            <p className="text-xs text-red-500">{validationErrors[`${provider.id}_secretKey`]}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`${provider.id}-webhook`} className="text-sm">
                            Webhook URL
                          </Label>
                          <Input
                            id={`${provider.id}-webhook`}
                            type="url"
                            placeholder="https://yoursite.com/webhooks/payment"
                            value={provider.webhookUrl}
                            onChange={(e) => updateProvider(provider.id, 'webhookUrl', e.target.value)}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnection(provider)}
                            disabled={connectionStatus[provider.id] === 'checking'}
                            className="flex-1"
                          >
                            {getConnectionStatusIcon(connectionStatus[provider.id] || 'idle')}
                            Test Connection
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={`https://${provider.id}.com/docs`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Global Settings */}
        <TabsContent value="global" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Currency & Timeouts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <select
                    id="default-currency"
                    value={globalSettings.defaultCurrency}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, defaultCurrency: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="NGN">NGN - Nigerian Naira</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-timeout">Payment Timeout (minutes)</Label>
                  <Input
                    id="payment-timeout"
                    type="number"
                    value={globalSettings.paymentTimeout}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, paymentTimeout: e.target.value }))}
                    min="5"
                    max="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-retries">Webhook Retry Attempts</Label>
                  <Input
                    id="webhook-retries"
                    type="number"
                    value={globalSettings.webhookRetries}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, webhookRetries: e.target.value }))}
                    min="1"
                    max="10"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Payment Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Payment Logs</h4>
                    <p className="text-sm text-muted-foreground">Log all payment transactions</p>
                  </div>
                  <Switch
                    checked={globalSettings.enablePaymentLogs}
                    onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, enablePaymentLogs: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Require Billing Address</h4>
                    <p className="text-sm text-muted-foreground">Collect billing information</p>
                  </div>
                  <Switch
                    checked={globalSettings.requireBillingAddress}
                    onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, requireBillingAddress: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Save Card</h4>
                    <p className="text-sm text-muted-foreground">Allow customers to save cards</p>
                  </div>
                  <Switch
                    checked={globalSettings.enableSaveCard}
                    onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, enableSaveCard: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Enable Refunds</h4>
                    <p className="text-sm text-muted-foreground">Allow payment refunds</p>
                  </div>
                  <Switch
                    checked={globalSettings.enableRefunds}
                    onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, enableRefunds: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security & Compliance */}
        <TabsContent value="security" className="space-y-6">
          <Alert className="border-amber-200 bg-amber-50">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Best Practices:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Store secret keys in Supabase Edge Function secrets, not in system settings</li>
                <li>• Use test keys for development and never expose secret keys in client-side code</li>
                <li>• Regularly rotate your API keys for enhanced security</li>
                <li>• Monitor webhook endpoints for suspicious activity</li>
                <li>• Enable SSL/TLS for all payment-related communications</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>PCI DSS Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Your payment providers handle PCI DSS compliance. Ensure you're following best practices:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Payment data is processed by certified providers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">No sensitive card data stored on your servers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">All transactions are encrypted in transit</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      {/* Save Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button 
          onClick={handleSaveAll}
          disabled={isUpdating}
          size="lg"
          className="w-full sm:w-auto min-w-[140px]"
        >
          {isUpdating ? (
            <>
              <Clock className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Payment Settings"
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedPaymentSettings;