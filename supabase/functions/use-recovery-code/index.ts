import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, recoveryCode } = await req.json();

    if (!userId || !recoveryCode) {
      throw new Error("Missing required parameters");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get recovery codes for user
    const { data: recoveryData, error: recoveryError } = await supabaseAdmin
      .from('user_recovery_codes')
      .select('codes, used_codes')
      .eq('user_id', userId)
      .single();

    if (recoveryError || !recoveryData) {
      throw new Error("No recovery codes found");
    }

    const codes = JSON.parse(recoveryData.codes || '[]');
    const usedCodes = JSON.parse(recoveryData.used_codes || '[]');

    // Check if code exists and hasn't been used
    if (!codes.includes(recoveryCode) || usedCodes.includes(recoveryCode)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or already used recovery code" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark code as used
    const newUsedCodes = [...usedCodes, recoveryCode];
    
    await supabaseAdmin
      .from('user_recovery_codes')
      .update({ used_codes: JSON.stringify(newUsedCodes) })
      .eq('user_id', userId);

    // Disable MFA temporarily
    await supabaseAdmin
      .from('user_totp_secrets')
      .delete()
      .eq('user_id', userId);

    // Log the recovery event
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'mfa_recovery_used',
        table_name: 'user_totp_secrets',
        new_values: { recovery_code_used: recoveryCode }
      });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Recovery code error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});