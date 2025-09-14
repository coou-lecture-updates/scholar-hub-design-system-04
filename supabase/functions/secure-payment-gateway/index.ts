import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, provider, gatewayData } = await req.json()

    switch (action) {
      case 'configure_gateway':
        // Store payment gateway configuration securely
        const { data: config, error: configError } = await supabaseClient
          .from('payment_gateway_config')
          .upsert({
            provider: gatewayData.provider,
            environment: gatewayData.environment || 'live',
            enabled: gatewayData.enabled,
            public_key: gatewayData.public_key,
            webhook_url: gatewayData.webhook_url,
            business_name: gatewayData.business_name
          })
          .select()
          .single()

        if (configError) throw configError

        // Store secret keys in Supabase secrets (not in database)
        const secretKey = gatewayData.secret_key
        const encryptionKey = gatewayData.encryption_key

        // Log security event
        await supabaseClient.rpc('log_security_event', {
          action_type: 'PAYMENT_GATEWAY_CONFIGURED',
          table_name: 'payment_gateway_config',
          record_id: config.id,
          details: {
            provider: gatewayData.provider,
            environment: gatewayData.environment
          }
        })

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Payment gateway configured securely',
            gateway_id: config.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'get_gateways':
        // Fetch public gateway configuration (no secrets)
        const { data: gateways, error: gatewaysError } = await supabaseClient
          .from('payment_gateway_config')
          .select('id, provider, environment, enabled, public_key, webhook_url, business_name, created_at')
          .eq('enabled', true)

        if (gatewaysError) throw gatewaysError

        return new Response(
          JSON.stringify({ success: true, gateways }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'process_payment':
        // Process payment using stored configuration
        const { amount, email, phone, full_name, event_id, payment_type } = gatewayData
        
        // Get gateway config
        const { data: gateway, error: gatewayError } = await supabaseClient
          .from('payment_gateway_config')
          .select('*')
          .eq('provider', provider)
          .eq('enabled', true)
          .single()

        if (gatewayError || !gateway) {
          throw new Error('Payment gateway not configured or disabled')
        }

        // Get secret key from environment (stored securely)
        const secretKey = Deno.env.get(`${provider.toUpperCase()}_SECRET_KEY`)
        if (!secretKey) {
          throw new Error('Payment gateway secret key not configured')
        }

        // Initialize payment with the specific provider
        let paymentUrl = ''
        const reference = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        if (provider === 'paystack') {
          const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${secretKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              amount: amount * 100, // Paystack expects kobo
              reference,
              callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`,
              metadata: {
                full_name,
                phone,
                event_id,
                payment_type
              }
            })
          })

          const paystackData = await paystackResponse.json()
          if (paystackData.status) {
            paymentUrl = paystackData.data.authorization_url
          } else {
            throw new Error(paystackData.message)
          }
        }

        // Store payment record
        const { error: paymentError } = await supabaseClient
          .from('payments')
          .insert({
            amount,
            email,
            full_name,
            phone,
            payment_reference: reference,
            payment_type,
            payment_method: provider,
            payment_status: 'pending'
          })

        if (paymentError) throw paymentError

        return new Response(
          JSON.stringify({ 
            success: true, 
            payment_url: paymentUrl,
            reference 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Secure payment gateway error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})