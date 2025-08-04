import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as OTPAuth from "https://deno.land/x/otpauth@v9.2.3/dist/otpauth.esm.js"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, userId } = await req.json()

    if (!token || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token and userId are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user's TOTP secret
    const { data: totpData, error: totpError } = await supabase
      .from('user_totp_secrets')
      .select('secret_encrypted, is_verified')
      .eq('user_id', userId)
      .single()

    if (totpError || !totpData) {
      return new Response(
        JSON.stringify({ success: false, error: 'TOTP not configured for this user' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!totpData.is_verified) {
      return new Response(
        JSON.stringify({ success: false, error: 'TOTP not verified for this user' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Decrypt secret (in production, implement proper encryption/decryption)
    const secret = totpData.secret_encrypted

    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer: "COOU School Updates",
      label: "Admin Access",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret
    })

    // Verify token
    const delta = totp.validate({ token, window: 1 })
    
    if (delta === null) {
      // Log failed attempt
      await supabase.rpc('log_security_event', {
        p_action: 'totp_failed',
        p_resource: 'authentication',
        p_details: { user_id: userId },
        p_user_id: userId
      })

      return new Response(
        JSON.stringify({ success: false, error: 'Invalid TOTP code' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update last used timestamp
    await supabase
      .from('user_totp_secrets')
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', userId)

    // Log successful verification
    await supabase.rpc('log_security_event', {
      p_action: 'totp_verified',
      p_resource: 'authentication',
      p_details: { user_id: userId },
      p_user_id: userId
    })

    return new Response(
      JSON.stringify({ success: true, message: 'TOTP verified successfully' }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('TOTP verification error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})