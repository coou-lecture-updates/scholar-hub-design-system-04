
import React, { useEffect, useState } from "react";
import PaymentGatewayCard, { GatewayBase } from "./PaymentGatewayCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Only these providers allowed
const ALLOWED_PROVIDERS = ["Flutterwave", "Korapay", "Paystack"] as const;

const providerIcons: Record<string, string> = {
  Flutterwave: "/public/lovable-uploads/fdd20512-006f-4e76-a7ec-e229371370fc.png",
  Korapay: "/public/lovable-uploads/64b237aa-13e5-47f2-898f-26a6977d2274.png",
  Paystack: "/public/lovable-uploads/14c0d5bb-a4e2-4e2a-bbc9-866a577f7b0b.png",
};
const providerDocs: Record<string, string> = {
  Flutterwave: "https://developer.flutterwave.com/docs/getting-started",
  Korapay: "https://korapay.com/developers/docs",
  Paystack: "https://paystack.com/docs/api/",
};
const initialGateways: GatewayBase[] = [
  {
    provider: "Flutterwave",
    enabled: false,
    mode: "test",
    public_key: "",
    secret_key: "",
    encryption_key: "",
    merchant_id: "",
    business_name: "",
    webhook_url: "",
  },
  {
    provider: "Korapay",
    enabled: false,
    mode: "test",
    public_key: "",
    secret_key: "",
    encryption_key: "",
    merchant_id: "",
    business_name: "",
    webhook_url: "",
  },
  {
    provider: "Paystack",
    enabled: false,
    mode: "test",
    public_key: "",
    secret_key: "",
    merchant_id: "",
    business_name: "",
    webhook_url: "",
  },
];

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

    // Only accept as provider type, not string
    const validProviders: Array<"Flutterwave" | "Korapay" | "Paystack"> = ["Flutterwave", "Korapay", "Paystack"];
    const modes: ("test" | "live")[] = ["test", "live"];
    const flat: GatewayBase[] = [];

    for (const prov of validProviders) {
      for (const mode of modes) {
        const row = data.find((g: any) => g.provider === prov && g.mode === mode);
        if (row) {
          flat.push({ ...row, provider: prov, mode });
        } else {
          // Ensure both modes always present; fill in defaults from initialGateways
          const base = initialGateways.find(g => g.provider === prov) as GatewayBase;
          flat.push({ ...base, mode, enabled: false, provider: prov });
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
        title: `${g.provider} [${g.mode}] saved!`,
        description: "Payment gateway credentials saved to backend.",
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
    setTimeout(() => {
      setTestingIdx(null);
      toast({
        title: "Test connection succeeded",
        description: `Successfully (simulated) API call for ${gateways[idx].provider} - ${gateways[idx].mode}`,
        variant: "default",
      });
    }, 1000);
  };

  // --- UPDATED: Only show one card per provider (not both modes). Show only allowed providers ---
  const displayGateways = gateways.filter(
    (g, i, arr) =>
      ALLOWED_PROVIDERS.includes(g.provider) &&
      // Only one card per provider (prefer 'live', fallbacks to 'test' if no 'live')
      (g.mode === "live" ||
        (g.mode === "test" && !arr.some(other => other.provider === g.provider && other.mode === "live")))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 w-full">
        <p className="text-blue-700 font-medium">Loading payment gateways...</p>
      </div>
    );
  }

  // --- UPDATED: Fully responsive grid: 1 col (mobile, < 640), 2 col (tablet, >=640 <1024), 3 col (desktop, >= 1024) ---
  return (
    <div className="
      w-full grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      gap-4 md:gap-6
      max-w-screen-lg mx-auto
    ">
      {displayGateways.map((g, idx) => (
        <PaymentGatewayCard
          key={g.provider}
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
      ))}
    </div>
  );
}
