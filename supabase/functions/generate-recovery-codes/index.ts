import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

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

    const { userId } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log(`Generating recovery codes for user: ${userId}`);

    // Generate 10 recovery codes (16 characters each)
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Array.from({ length: 16 }, () => 
        'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
      ).join('');
      codes.push(code);
    }

    // Hash and store codes
    const codeHashes = await Promise.all(
      codes.map(async (code) => ({
        user_id: userId,
        code_hash: await hash(code),
        created_at: new Date().toISOString(),
      }))
    );

    // Delete old recovery codes
    await supabase
      .from('user_mfa_recovery_codes')
      .delete()
      .eq('user_id', userId);

    // Insert new recovery codes
    const { error: insertError } = await supabase
      .from('user_mfa_recovery_codes')
      .insert(codeHashes);

    if (insertError) {
      console.error('Error storing recovery codes:', insertError);
      throw insertError;
    }

    // Log security event
    await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'MFA_RECOVERY_CODES_GENERATED',
        table_name: 'user_mfa_recovery_codes',
        new_values: { count: codes.length }
      });

    console.log(`Successfully generated ${codes.length} recovery codes`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        codes, // Return plain codes to user (ONLY TIME they see them)
        message: 'Recovery codes generated successfully. Save these codes in a secure location.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-recovery-codes:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});