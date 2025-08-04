
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const url = new URL(req.url);
    // Accept POST or GET, allow params or JSON body
    let provider = url.searchParams.get("provider") || "";
    let mode = url.searchParams.get("mode") || "test";
    if (req.method === "POST") {
      const data = await req.json().catch(() => ({}));
      provider = data.provider ?? provider;
      mode = data.mode ?? mode;
    }

    if (!provider) {
      return new Response(JSON.stringify({ error: "provider is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Query for the webhook URL
    const { data: row, error } = await supabaseClient
      .from('payment_gateways')
      .select("webhook_url, mode")
      .eq("provider", provider)
      .eq("mode", mode)
      .eq("enabled", true)
      .single();

    if (error || !row) {
      return new Response(JSON.stringify({ error: "No active gateway config for this provider/mode" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ webhook_url: row.webhook_url, mode: row.mode }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
