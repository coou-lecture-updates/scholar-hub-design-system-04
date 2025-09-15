import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  email: string;
  name: string;
  phone?: string;
  provider: 'paystack' | 'flutterwave' | 'korapay';
  reference: string;
  metadata?: any;
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

    const paymentRequest: PaymentRequest = await req.json();
    
    console.log('Processing payment request:', paymentRequest);

    // Get payment gateway configuration
    const { data: gateway, error: gatewayError } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .eq('provider', paymentRequest.provider)
      .eq('enabled', true)
      .maybeSingle();

    if (gatewayError || !gateway) {
      throw new Error(`${paymentRequest.provider} gateway not configured or disabled`);
    }

    let paymentResponse;
    let redirectUrl = '';

    // Process payment based on provider
    switch (paymentRequest.provider) {
      case 'paystack':
        paymentResponse = await initializePaystack(gateway, paymentRequest);
        redirectUrl = paymentResponse.data?.authorization_url || '';
        break;
      case 'flutterwave':
        paymentResponse = await initializeFlutterwave(gateway, paymentRequest);
        redirectUrl = paymentResponse.data?.link || '';
        break;
      case 'korapay':
        paymentResponse = await initializeKorapay(gateway, paymentRequest);
        redirectUrl = paymentResponse.data?.checkout_url || '';
        break;
      default:
        throw new Error('Unsupported payment provider');
    }

    // Store payment record
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        payment_reference: paymentRequest.reference,
        payment_type: paymentRequest.metadata?.type || 'general',
        amount: paymentRequest.amount,
        email: paymentRequest.email,
        full_name: paymentRequest.name,
        phone: paymentRequest.phone,
        payment_method: paymentRequest.provider,
        metadata: paymentRequest.metadata,
        payment_status: 'pending'
      });

    if (paymentError) {
      console.error('Error storing payment:', paymentError);
      throw new Error('Failed to store payment record');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        payment_url: redirectUrl,
        reference: paymentRequest.reference
      }
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

async function initializePaystack(gateway: any, request: PaymentRequest) {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${gateway.secret_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: request.email,
      amount: request.amount * 100, // Convert to kobo
      reference: request.reference,
      callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`,
      metadata: request.metadata || {}
    }),
  });

  return response.json();
}

async function initializeFlutterwave(gateway: any, request: PaymentRequest) {
  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${gateway.secret_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: request.reference,
      amount: request.amount,
      currency: 'NGN',
      redirect_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`,
      customer: {
        email: request.email,
        name: request.name,
        phonenumber: request.phone
      },
      customizations: {
        title: gateway.business_name || 'COOU Payment',
        description: 'Payment processing'
      },
      meta: request.metadata || {}
    }),
  });

  return response.json();
}

async function initializeKorapay(gateway: any, request: PaymentRequest) {
  const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${gateway.secret_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reference: request.reference,
      amount: request.amount,
      currency: 'NGN',
      customer: {
        name: request.name,
        email: request.email,
        phone: request.phone
      },
      merchant_bears_cost: true,
      redirect_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-callback`,
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/korapay-webhook`,
      metadata: request.metadata || {}
    }),
  });

  return response.json();
}