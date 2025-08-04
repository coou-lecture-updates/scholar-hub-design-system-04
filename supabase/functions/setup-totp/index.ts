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
    const { userId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'User ID is required' }),
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

    // Generate a new secret
    const secret = new OTPAuth.Secret({ size: 32 })
    const secretBase32 = secret.base32

    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer: "COOU School Updates",
      label: "Admin Access",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secretBase32
    })

    // Generate QR code URL
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totp.toString())}`

    // Check if user already has TOTP setup
    const { data: existingTotp } = await supabase
      .from('user_totp_secrets')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingTotp) {
      // Update existing
      const { error: updateError } = await supabase
        .from('user_totp_secrets')
        .update({
          secret_encrypted: secretBase32,
          is_verified: false,
          created_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) throw updateError
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('user_totp_secrets')
        .insert({
          user_id: userId,
          secret_encrypted: secretBase32,
          is_verified: false
        })

      if (insertError) throw insertError
    }

    // Log security event
    await supabase.rpc('log_security_event', {
      p_action: 'totp_setup_initiated',
      p_resource: 'authentication',
      p_details: { user_id: userId },
      p_user_id: userId
    })

    return new Response(
      JSON.stringify({
        success: true,
        qrCodeUrl,
        secret: secretBase32,
        message: 'TOTP setup initiated successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('TOTP setup error:', error)
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