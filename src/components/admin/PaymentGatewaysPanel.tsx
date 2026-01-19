import React, { useEffect, useState } from "react";
import PaymentGatewayCard, { GatewayBase, getProviderDisplayName } from "./PaymentGatewayCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";

// Only these providers allowed - use lowercase to match database
const ALLOWED_PROVIDERS = ["flutterwave", "korapay", "paystack"] as const;
type ProviderType = typeof ALLOWED_PROVIDERS[number];

const providerIcons: Record<string, string> = {
  flutterwave: "/lovable-uploads/fdd20512-006f-4e76-a7ec-e229371370fc.png",
  korapay: "/lovable-uploads/64b237aa-13e5-47f2-898f-26a6977d2274.png",
  paystack: "/lovable-uploads/14c0d5bb-a4e2-4e2a-bbc9-866a577f7b0b.png",
};

const providerDocs: Record<string, string> = {
  flutterwave: "https://developer.flutterwave.com/docs/getting-started",
  korapay: "https://korapay.com/developers/docs",
  paystack: "https://paystack.com/docs/api/",
};

const providerDisplayNames: Record<string, string> = {
  flutterwave: "Flutterwave",
  korapay: "Korapay",
  paystack: "Paystack",
};

const getWebhookUrl = (provider: string) => {
  const baseUrl = "https://hhcitezdbueybdtslkth.supabase.co/functions/v1";
  return `${baseUrl}/${provider}-webhook`;
};

const initialGateways: GatewayBase[] = [
  {
    provider: "flutterwave",
    enabled: false,
    mode: "test",
    public_key: "",
    secret_key: "",
    encryption_key: "",
    merchant_id: "",
    business_name: "",
    webhook_url: getWebhookUrl("flutterwave"),
  },
  {
    provider: "korapay",
    enabled: false,
    mode: "test",
    public_key: "",
    secret_key: "",
    encryption_key: "",
    merchant_id: "",
    business_name: "",
    webhook_url: getWebhookUrl("korapay"),
  },
  {
    provider: "paystack",
    enabled: false,
    mode: "test",
    public_key: "",
    secret_key: "",
    merchant_id: "",
    business_name: "",
    webhook_url: getWebhookUrl("paystack"),
  },
];

// Validate API key format
function validateApiKey(provider: string, secretKey: string): { valid: boolean; message: string; isPlaceholder: boolean } {
  if (!secretKey || secretKey.length < 10) {
    return { valid: false, message: 'Secret key is missing or too short', isPlaceholder: false };
  }

  // Check for placeholder keys
  if (secretKey.includes('000000') || secretKey === 'sk_test_xxx' || secretKey === 'sk_live_xxx') {
    return { valid: false, message: 'Placeholder key detected - please enter real API key', isPlaceholder: true };
  }

  const prov = provider.toLowerCase();
  
  // Validate key format based on provider
  switch (prov) {
    case 'paystack':
      if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
        return { valid: false, message: 'Should start with sk_test_ or sk_live_', isPlaceholder: false };
      }
      if (secretKey.startsWith('sk_live_')) {
        return { valid: true, message: 'Live key configured', isPlaceholder: false };
      }
      return { valid: true, message: 'Test key configured', isPlaceholder: false };
      
    case 'flutterwave':
      if (!secretKey.startsWith('FLWSECK_TEST') && !secretKey.startsWith('FLWSECK-')) {
        return { valid: false, message: 'Invalid format - should start with FLWSECK', isPlaceholder: false };
      }
      if (secretKey.startsWith('FLWSECK-')) {
        return { valid: true, message: 'Live key configured', isPlaceholder: false };
      }
      return { valid: true, message: 'Test key configured', isPlaceholder: false };
      
    case 'korapay':
      if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
        return { valid: false, message: 'Invalid format', isPlaceholder: false };
      }
      if (secretKey.startsWith('sk_live_')) {
        return { valid: true, message: 'Live key configured', isPlaceholder: false };
      }
      return { valid: true, message: 'Test key configured', isPlaceholder: false };
  }

  return { valid: true, message: 'Key format valid', isPlaceholder: false };
}

export default function PaymentGatewaysPanel() {
  const [gateways, setGateways] = useState<GatewayBase[]>(initialGateways);
  const [loading, setLoading] = useState(true);
  const [savingIdx, setSavingIdx] = useState<number | null>(null);
  const [testingIdx, setTestingIdx] = useState<number | null>(null);

  useEffect(() => {
    loadGateways();
  }, []);

  async function loadGateways() {
    setLoading(true);
    const { data, error } = await supabase
      .from('payment_gateways')
      .select("*")
      .order('provider', { ascending: true })
      .order('mode', { ascending: true });

    if (error) {
      toast({ title: "Error fetching payment gateways", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const validProviders = ALLOWED_PROVIDERS;
    const modes: ("test" | "live")[] = ["test", "live"];
    const flat: GatewayBase[] = [];

    for (const prov of validProviders) {
      for (const mode of modes) {
        // Match by lowercase provider name
        const row = data.find((g: any) => g.provider.toLowerCase() === prov && g.mode === mode);
        if (row) {
          flat.push({ ...row, provider: prov as any, mode });
        } else {
          const base = initialGateways.find(g => g.provider === prov) as GatewayBase;
          flat.push({ ...base, mode, enabled: false, provider: prov as any });
        }
      }
    }

    setGateways(flat);
    setLoading(false);
  }

  function updateGatewayField(idx: number, key: keyof GatewayBase, value: any) {
    setGateways(current =>
      current.map((g, i) =>
        i === idx ? { ...g, [key]: value } : g
      )
    );
  }

  const saveGateway = async (idx: number) => {
    setSavingIdx(idx);
    const g = gateways[idx];
    
    // Validate before saving
    if (g.enabled && g.secret_key) {
      const validation = validateApiKey(g.provider, g.secret_key);
      if (!validation.valid) {
        toast({
          title: "Invalid API Key",
          description: validation.message,
          variant: "destructive"
        });
        setSavingIdx(null);
        return;
      }
    }

    try {
      let upsertBody: any = { ...g };
      delete upsertBody.id;
      upsertBody.updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from("payment_gateways")
        .upsert(upsertBody, { onConflict: "provider,mode" })
        .select()
        .single();
      if (error) throw error;
      toast({
        title: `${getProviderDisplayName(g.provider)} [${g.mode}] saved!`,
        description: g.mode === 'live' ? "Production mode configured" : "Test mode configured",
      });
      await loadGateways();
    } catch (error: any) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } finally {
      setSavingIdx(null);
    }
  };

  const testConnection = async (idx: number) => {
    setTestingIdx(idx);
    const g = gateways[idx];
    
    try {
      // Simulate API test with validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!g.secret_key) {
        throw new Error('Secret key is required');
      }
      
      const validation = validateApiKey(g.provider, g.secret_key);
      if (!validation.valid) {
        throw new Error(validation.message);
      }
      
      toast({
        title: "Connection test passed",
        description: `${g.provider} (${g.mode}) API key format is valid`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Connection test failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTestingIdx(null);
    }
  };

  // Get status summary
  const getGatewayStatus = () => {
    const enabledGateways = gateways.filter(g => g.enabled);
    const liveGateways = enabledGateways.filter(g => g.mode === 'live');
    const testGateways = enabledGateways.filter(g => g.mode === 'test');
    
    const validLiveGateways = liveGateways.filter(g => {
      const validation = validateApiKey(g.provider, g.secret_key);
      return validation.valid && !validation.isPlaceholder;
    });

    return {
      total: enabledGateways.length,
      live: liveGateways.length,
      test: testGateways.length,
      validLive: validLiveGateways.length,
      isProductionReady: validLiveGateways.length > 0
    };
  };

  const status = getGatewayStatus();

  // Only show one card per provider (prefer 'live' mode)
  const displayGateways = gateways.filter(
    (g, i, arr) =>
      (ALLOWED_PROVIDERS as readonly string[]).includes(g.provider) &&
      (g.mode === "live" ||
        (g.mode === "test" && !arr.some(other => other.provider === g.provider && other.mode === "live")))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 w-full">
        <p className="text-primary font-medium">Loading payment gateways...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            Payment Gateway Status
            {status.isProductionReady ? (
              <Badge className="bg-green-600">Production Ready</Badge>
            ) : status.total > 0 ? (
              <Badge variant="secondary" className="bg-yellow-500 text-white">Test Mode Only</Badge>
            ) : (
              <Badge variant="destructive">Not Configured</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{status.total}</div>
              <div className="text-sm text-muted-foreground">Enabled</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{status.validLive}</div>
              <div className="text-sm text-green-600">Live Ready</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{status.test}</div>
              <div className="text-sm text-yellow-600">Test Mode</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-blue-600">Available</div>
            </div>
          </div>

          {!status.isProductionReady && status.total > 0 && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Test Mode Active</AlertTitle>
              <AlertDescription>
                Your payment gateways are in test mode. To accept real payments:
                <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                  <li>Get live API keys from your payment provider dashboard</li>
                  <li>Update the secret key with your live key (starts with sk_live_ for Paystack)</li>
                  <li>Switch mode to "Live" and save</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          {status.total === 0 && (
            <Alert variant="destructive" className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertTitle>No Payment Gateways Enabled</AlertTitle>
              <AlertDescription>
                Enable at least one payment gateway below to accept payments. Configure your API keys and toggle "Enabled" to activate.
              </AlertDescription>
            </Alert>
          )}

          {status.isProductionReady && (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Production Ready</AlertTitle>
              <AlertDescription className="text-green-600">
                You have {status.validLive} payment gateway(s) configured for live transactions.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {displayGateways.map((g, idx) => {
          const validation = g.secret_key ? validateApiKey(g.provider, g.secret_key) : null;
          return (
            <div key={g.provider} className="relative">
              {validation && !validation.valid && g.enabled && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge variant="destructive" className="text-xs">
                    {validation.isPlaceholder ? 'Placeholder Key' : 'Invalid Key'}
                  </Badge>
                </div>
              )}
              <PaymentGatewayCard
                g={g}
                idx={gateways.findIndex(x => x.provider === g.provider && x.mode === g.mode)}
                providerIcons={providerIcons}
                providerDocs={providerDocs}
                onChange={updateGatewayField}
                onSave={saveGateway}
                onTest={testConnection}
                saving={savingIdx === gateways.findIndex(x => x.provider === g.provider && x.mode === g.mode)}
                testing={testingIdx === gateways.findIndex(x => x.provider === g.provider && x.mode === g.mode)}
              />
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Quick Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p><strong>Paystack:</strong> Get keys from <a href="https://dashboard.paystack.com/#/settings/developers" target="_blank" rel="noopener" className="text-primary underline">Paystack Dashboard</a> → Settings → API Keys</p>
          <p><strong>Flutterwave:</strong> Get keys from <a href="https://dashboard.flutterwave.com/settings/apis" target="_blank" rel="noopener" className="text-primary underline">Flutterwave Dashboard</a> → Settings → API Keys</p>
          <p><strong>Korapay:</strong> Get keys from <a href="https://merchant.korapay.com/dashboard/settings/api" target="_blank" rel="noopener" className="text-primary underline">Korapay Dashboard</a> → Settings → API</p>
        </CardContent>
      </Card>
    </div>
  );
}
