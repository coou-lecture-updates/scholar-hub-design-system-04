import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  email: string;
  full_name: string;
  phone?: string;
  provider: string;
  payment_type: 'wallet_funding' | 'event_ticket';
  event_id?: string;
  user_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const paymentData: PaymentRequest = await req.json();
    
    // Generate payment reference
    const reference = `${paymentData.payment_type.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get payment gateway configuration
    const { data: gateway, error: gatewayError } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .eq('provider', paymentData.provider)
      .eq('enabled', true)
      .maybeSingle();

    if (gatewayError || !gateway) {
      throw new Error(`Payment gateway ${paymentData.provider} not configured or disabled`);
    }

    // Store payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        payment_reference: reference,
        amount: paymentData.amount,
        email: paymentData.email,
        full_name: paymentData.full_name,
        phone: paymentData.phone,
        payment_type: paymentData.payment_type,
        payment_method: paymentData.provider,
        payment_status: 'pending',
        user_id: paymentData.user_id,
        metadata: {
          event_id: paymentData.event_id,
          gateway_provider: paymentData.provider
        }
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error('Failed to create payment record');
    }

    // Initialize payment with provider
    let paymentUrl = '';
    
    if (paymentData.provider.toLowerCase() === 'flutterwave') {
      // Call Flutterwave payment initialization
      const { data: flwData, error: flwError } = await supabaseClient.functions
        .invoke('flutterwave-payment', {
          body: {
            amount: paymentData.amount,
            currency: 'NGN',
            email: paymentData.email,
            phone: paymentData.phone || '',
            name: paymentData.full_name,
            tx_ref: reference,
            redirect_url: `${req.headers.get('origin')}/payment-status?ref=${reference}`,
            event_id: paymentData.event_id
          }
        });

      if (flwError) throw new Error('Flutterwave initialization failed');
      paymentUrl = flwData.data?.link || '';
      
    } else if (paymentData.provider.toLowerCase() === 'korapay') {
      // Call Korapay payment initialization
      const { data: koraData, error: koraError } = await supabaseClient.functions
        .invoke('korapay-payment', {
          body: {
            amount: paymentData.amount,
            currency: 'NGN',
            customer: {
              email: paymentData.email,
              name: paymentData.full_name,
              phone: paymentData.phone || ''
            },
            merchant_bears_cost: true,
            reference: reference,
            narration: `Payment for ${paymentData.payment_type}`,
            redirect_url: `${req.headers.get('origin')}/payment-status?ref=${reference}`,
            metadata: {
              event_id: paymentData.event_id,
              user_id: paymentData.user_id
            }
          }
        });

      if (koraError) throw new Error('Korapay initialization failed');
      paymentUrl = koraData.data?.checkout_url || '';
    
    } else if (paymentData.provider.toLowerCase() === 'paystack') {
      // Call Paystack payment initialization
      const { data: paystackData, error: paystackError } = await supabaseClient.functions
        .invoke('paystack-payment', {
          body: {
            amount: paymentData.amount,
            currency: 'NGN',
            customer: {
              email: paymentData.email,
              name: paymentData.full_name,
              phone: paymentData.phone || ''
            },
            reference: reference,
            callback_url: `${req.headers.get('origin')}/payment-status?ref=${reference}`,
            metadata: {
              event_id: paymentData.event_id,
              user_id: paymentData.user_id
            }
          }
        });

      if (paystackError) throw new Error('Paystack initialization failed');
      paymentUrl = paystackData.data?.checkout_url || '';
    
    } else {
      // For demo/other providers, return a mock URL
      paymentUrl = `${req.headers.get('origin')}/payment-status?ref=${reference}&status=success&provider=${paymentData.provider}`;
    }

    // Update payment with gateway reference
    await supabaseClient
      .from('payments')
      .update({
        transaction_id: reference,
        metadata: {
          ...payment.metadata,
          payment_url: paymentUrl,
          gateway_reference: reference
        }
      })
      .eq('id', payment.id);

    return new Response(JSON.stringify({
      success: true,
      payment_url: paymentUrl,
      reference: reference,
      payment_id: payment.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});