import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, recoveryCode } = await req.json();

    if (!userId || !recoveryCode) {
      throw new Error('User ID and recovery code are required');
    }

    console.log(`Processing recovery code for user: ${userId}`);

    // Get user's recovery codes
    const { data: recoveryCodes, error: fetchError } = await supabase
      .from('user_mfa_recovery_codes')
      .select('*')
      .eq('user_id', userId)
      .is('used_at', null);

    if (fetchError) {
      console.error('Error fetching recovery codes:', fetchError);
      throw fetchError;
    }

    if (!recoveryCodes || recoveryCodes.length === 0) {
      throw new Error('No unused recovery codes found');
    }

    // Try to match the recovery code
    let matchedCode = null;
    for (const dbCode of recoveryCodes) {
      const isMatch = await compare(recoveryCode.toUpperCase(), dbCode.code_hash);
      if (isMatch) {
        matchedCode = dbCode;
        break;
      }
    }

    if (!matchedCode) {
      console.log('Invalid recovery code provided');
      throw new Error('Invalid recovery code');
    }

    // Mark recovery code as used
    const { error: updateError } = await supabase
      .from('user_mfa_recovery_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', matchedCode.id);

    if (updateError) {
      console.error('Error marking recovery code as used:', updateError);
      throw updateError;
    }

    // Disable MFA temporarily
    const { error: mfaError } = await supabase
      .from('user_mfa')
      .delete()
      .eq('user_id', userId);

    if (mfaError) {
      console.error('Error disabling MFA:', mfaError);
      throw mfaError;
    }

    // Log security event
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'MFA_RECOVERY_CODE_USED',
        table_name: 'user_mfa',
        new_values: { recovery_code_id: matchedCode.id }
      });

    // Count remaining codes
    const remainingCodes = recoveryCodes.length - 1;

    console.log(`Recovery code used successfully. ${remainingCodes} codes remaining`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'MFA has been disabled. Please set up new MFA.',
        remainingCodes 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in use-recovery-code:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});