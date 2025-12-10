import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  amount: number;
  email: string;
  full_name?: string;
  name?: string;
  phone?: string;
  provider: 'paystack' | 'flutterwave' | 'korapay';
  payment_type?: string;
  user_id?: string;
  metadata?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const paymentRequest: PaymentRequest = await req.json();
    const customerName = paymentRequest.full_name || paymentRequest.name || 'Customer';
    
    console.log('Processing payment request:', {
      provider: paymentRequest.provider,
      amount: paymentRequest.amount,
      email: paymentRequest.email
    });

    // Generate unique reference
    const reference = `PAY_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Get payment gateway configuration from payment_gateways table
    const { data: gateway, error: gatewayError } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .ilike('provider', paymentRequest.provider)
      .eq('enabled', true)
      .maybeSingle();

    console.log('Gateway lookup result:', { gateway: gateway ? 'found' : 'not found', error: gatewayError });

    if (gatewayError) {
      console.error('Gateway error:', gatewayError);
      throw new Error(`Failed to fetch gateway configuration: ${gatewayError.message}`);
    }
    
    if (!gateway) {
      throw new Error(`${paymentRequest.provider} gateway not configured or disabled. Please enable it in admin settings.`);
    }

    if (!gateway.secret_key) {
      throw new Error(`${paymentRequest.provider} secret key not configured`);
    }

    // Build callback URL
    const siteUrl = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || '';
    const callbackUrl = `https://hhcitezdbueybdtslkth.supabase.co/functions/v1/payment-callback`;

    let paymentResponse;
    let redirectUrl = '';

    // Process payment based on provider
    switch (paymentRequest.provider.toLowerCase()) {
      case 'paystack':
        paymentResponse = await initializePaystack(gateway, {
          ...paymentRequest,
          reference,
          name: customerName
        }, callbackUrl);
        redirectUrl = paymentResponse.data?.authorization_url || '';
        console.log('Paystack response:', paymentResponse);
        break;
        
      case 'flutterwave':
        paymentResponse = await initializeFlutterwave(gateway, {
          ...paymentRequest,
          reference,
          name: customerName
        }, callbackUrl);
        redirectUrl = paymentResponse.data?.link || '';
        console.log('Flutterwave response:', paymentResponse);
        break;
        
      case 'korapay':
        paymentResponse = await initializeKorapay(gateway, {
          ...paymentRequest,
          reference,
          name: customerName
        }, callbackUrl);
        redirectUrl = paymentResponse.data?.checkout_url || '';
        console.log('Korapay response:', paymentResponse);
        break;
        
      default:
        throw new Error('Unsupported payment provider');
    }

    // Check if payment initialization was successful
    if (!redirectUrl) {
      console.error('Payment initialization failed:', paymentResponse);
      throw new Error(paymentResponse?.message || paymentResponse?.error || 'Failed to initialize payment with provider');
    }

    // Store payment record
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        payment_reference: reference,
        payment_type: paymentRequest.payment_type || 'wallet_funding',
        amount: paymentRequest.amount,
        email: paymentRequest.email,
        full_name: customerName,
        phone: paymentRequest.phone,
        payment_method: paymentRequest.provider,
        user_id: paymentRequest.user_id,
        metadata: {
          ...paymentRequest.metadata,
          gateway_provider: paymentRequest.provider
        },
        payment_status: 'pending'
      });

    if (paymentError) {
      console.error('Error storing payment:', paymentError);
      // Don't throw - payment was already initiated
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment initialized successfully',
      reference: reference,
      payment_url: redirectUrl
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

async function initializePaystack(gateway: any, request: any, callbackUrl: string) {
  console.log('Initializing Paystack payment...');
  
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${gateway.secret_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: request.email,
      amount: Math.round(request.amount * 100), // Convert to kobo
      reference: request.reference,
      callback_url: callbackUrl,
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", variable_name: "customer_name", value: request.name },
          { display_name: "Payment Type", variable_name: "payment_type", value: request.payment_type || 'wallet_funding' }
        ],
        ...request.metadata
      }
    }),
  });

  const data = await response.json();
  console.log('Paystack API response status:', response.status);
  return data;
}

async function initializeFlutterwave(gateway: any, request: any, callbackUrl: string) {
  console.log('Initializing Flutterwave payment...');
  
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
      redirect_url: callbackUrl,
      customer: {
        email: request.email,
        name: request.name,
        phonenumber: request.phone || ''
      },
      customizations: {
        title: gateway.business_name || 'COOU Payment',
        description: request.payment_type === 'wallet_funding' ? 'Wallet Funding' : 'Payment',
        logo: 'https://hhcitezdbueybdtslkth.supabase.co/storage/v1/object/public/branding/logo.png'
      },
      meta: {
        user_id: request.user_id,
        payment_type: request.payment_type,
        ...request.metadata
      }
    }),
  });

  const data = await response.json();
  console.log('Flutterwave API response status:', response.status);
  return data;
}

async function initializeKorapay(gateway: any, request: any, callbackUrl: string) {
  console.log('Initializing Korapay payment...');
  
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
        phone: request.phone || ''
      },
      merchant_bears_cost: true,
      redirect_url: callbackUrl,
      notification_url: `https://hhcitezdbueybdtslkth.supabase.co/functions/v1/korapay-webhook`,
      metadata: {
        user_id: request.user_id,
        payment_type: request.payment_type,
        ...request.metadata
      }
    }),
  });

  const data = await response.json();
  console.log('Korapay API response status:', response.status);
  return data;
}
