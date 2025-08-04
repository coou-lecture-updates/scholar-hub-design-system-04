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
    const { email, ipAddress, userAgent, success } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Check recent failed attempts for this email/IP
    const { data: recentAttempts, error: attemptsError } = await supabaseAdmin
      .from('login_attempts')
      .select('*')
      .eq('email', email)
      .eq('success', false)
      .gte('attempt_time', new Date(Date.now() - 15 * 60 * 1000).toISOString()) // Last 15 minutes
      .order('attempt_time', { ascending: false });

    if (attemptsError) {
      console.error('Error checking attempts:', attemptsError);
    }

    const failedAttempts = recentAttempts?.length || 0;
    const maxAttempts = 5;
    const blockDuration = 30; // minutes

    // Check if currently blocked
    if (failedAttempts >= maxAttempts && !success) {
      const lastAttempt = recentAttempts?.[0];
      if (lastAttempt?.blocked_until && new Date(lastAttempt.blocked_until) > new Date()) {
        return new Response(
          JSON.stringify({ 
            blocked: true, 
            blockedUntil: lastAttempt.blocked_until,
            message: `Too many failed attempts. Account blocked until ${new Date(lastAttempt.blocked_until).toLocaleString()}`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Log this attempt
    const blockedUntil = (!success && failedAttempts >= maxAttempts - 1) 
      ? new Date(Date.now() + blockDuration * 60 * 1000).toISOString()
      : null;

    await supabaseAdmin
      .from('login_attempts')
      .insert({
        email,
        ip_address: ipAddress,
        user_agent: userAgent,
        success,
        blocked_until: blockedUntil
      });

    // Log to audit logs
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: success ? 'login_success' : 'login_failed',
        table_name: 'auth',
        ip_address: ipAddress,
        user_agent: userAgent,
        new_values: { 
          email, 
          attempts_count: failedAttempts + 1,
          blocked: !!blockedUntil
        },
        severity: success ? 'info' : (failedAttempts >= maxAttempts - 1 ? 'warning' : 'info'),
        category: 'authentication'
      });

    if (!success && failedAttempts >= maxAttempts - 1) {
      return new Response(
        JSON.stringify({ 
          blocked: true, 
          blockedUntil,
          message: `Too many failed attempts. Account blocked for ${blockDuration} minutes.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        blocked: false, 
        remainingAttempts: maxAttempts - failedAttempts - 1
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Rate limiting error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});