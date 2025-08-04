import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaystackPaymentData {
  amount: number;
  currency: string;
  customer: {
    email: string;
    name: string;
    phone: string;
  };
  reference: string;
  callback_url: string;
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

    const paymentData: PaystackPaymentData = await req.json();
    
    // Get Paystack configuration
    const { data: gateway, error: gatewayError } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .eq('provider', 'paystack')
      .eq('enabled', true)
      .maybeSingle();

    if (gatewayError || !gateway) {
      throw new Error('Paystack gateway not configured or disabled');
    }

    // Initialize payment with Paystack
    const paystackPayload = {
      email: paymentData.customer.email,
      amount: paymentData.amount * 100, // Convert to kobo
      currency: paymentData.currency || 'NGN',
      reference: paymentData.reference,
      callback_url: paymentData.callback_url,
      metadata: paymentData.metadata || {},
      customer: paymentData.customer
    };

    console.log('Initializing Paystack payment:', paystackPayload);

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gateway.secret_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackPayload),
    });

    const responseData = await paystackResponse.json();
    console.log('Paystack response:', responseData);

    if (!paystackResponse.ok || !responseData.status) {
      throw new Error(responseData.message || 'Failed to initialize payment');
    }

    return new Response(JSON.stringify({
      status: 'success',
      message: 'Payment initialized successfully',
      data: {
        checkout_url: responseData.data.authorization_url,
        reference: responseData.data.reference,
        access_code: responseData.data.access_code
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Paystack payment error:', error);
    return new Response(JSON.stringify({
      status: 'error',
      message: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});