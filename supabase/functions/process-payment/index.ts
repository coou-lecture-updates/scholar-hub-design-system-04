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

// Validate API key format
function validateApiKey(provider: string, secretKey: string): { valid: boolean; message: string } {
  if (!secretKey || secretKey.length < 20) {
    return { valid: false, message: `${provider} secret key is too short or missing` };
  }

  // Check for placeholder keys
  if (secretKey.includes('000000') || secretKey === 'sk_test_xxx' || secretKey === 'sk_live_xxx') {
    return { valid: false, message: `${provider} has placeholder API keys. Please configure real API keys in admin settings.` };
  }

  // Validate key format based on provider
  switch (provider.toLowerCase()) {
    case 'paystack':
      if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
        return { valid: false, message: 'Paystack secret key should start with sk_test_ or sk_live_' };
      }
      break;
    case 'flutterwave':
      if (!secretKey.startsWith('FLWSECK_TEST') && !secretKey.startsWith('FLWSECK-')) {
        return { valid: false, message: 'Flutterwave secret key format appears invalid' };
      }
      break;
    case 'korapay':
      if (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_')) {
        return { valid: false, message: 'Korapay secret key format appears invalid' };
      }
      break;
  }

  return { valid: true, message: 'Key format valid' };
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
    
    console.log('=== PAYMENT PROCESSING START ===');
    console.log('Provider:', paymentRequest.provider);
    console.log('Amount:', paymentRequest.amount);
    console.log('Email:', paymentRequest.email);
    console.log('Payment Type:', paymentRequest.payment_type);

    // Validate required fields
    if (!paymentRequest.amount || paymentRequest.amount < 100) {
      throw new Error('Minimum payment amount is ₦100');
    }

    if (!paymentRequest.email) {
      throw new Error('Email is required for payment');
    }

    // Generate unique reference
    const reference = `PAY_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Get payment gateway configuration
    const { data: gateway, error: gatewayError } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .ilike('provider', paymentRequest.provider)
      .eq('enabled', true)
      .maybeSingle();

    if (gatewayError) {
      console.error('Gateway lookup error:', gatewayError);
      throw new Error(`Failed to fetch gateway configuration: ${gatewayError.message}`);
    }
    
    if (!gateway) {
      console.error('Gateway not found or disabled:', paymentRequest.provider);
      throw new Error(`${paymentRequest.provider} gateway is not configured or enabled. Please enable it in Admin Settings → Payment Gateways.`);
    }

    console.log('Gateway found:', gateway.provider, 'Mode:', gateway.mode);

    // Validate secret key
    if (!gateway.secret_key) {
      throw new Error(`${paymentRequest.provider} secret key is not configured. Please add your API keys in Admin Settings.`);
    }

    const keyValidation = validateApiKey(paymentRequest.provider, gateway.secret_key);
    if (!keyValidation.valid) {
      console.error('API key validation failed:', keyValidation.message);
      throw new Error(keyValidation.message);
    }

    console.log('API key validated. Mode:', gateway.mode);

    // Build callback URL
    const callbackUrl = `https://hhcitezdbueybdtslkth.supabase.co/functions/v1/payment-callback`;

    let paymentResponse;
    let redirectUrl = '';

    // Process payment based on provider
    switch (paymentRequest.provider.toLowerCase()) {
      case 'paystack':
        console.log('Initializing Paystack payment...');
        paymentResponse = await initializePaystack(gateway, {
          ...paymentRequest,
          reference,
          name: customerName
        }, callbackUrl);
        
        if (paymentResponse.status === true && paymentResponse.data?.authorization_url) {
          redirectUrl = paymentResponse.data.authorization_url;
        } else {
          console.error('Paystack error response:', paymentResponse);
          throw new Error(paymentResponse.message || 'Paystack initialization failed');
        }
        break;
        
      case 'flutterwave':
        console.log('Initializing Flutterwave payment...');
        paymentResponse = await initializeFlutterwave(gateway, {
          ...paymentRequest,
          reference,
          name: customerName
        }, callbackUrl);
        
        if (paymentResponse.status === 'success' && paymentResponse.data?.link) {
          redirectUrl = paymentResponse.data.link;
        } else {
          console.error('Flutterwave error response:', paymentResponse);
          throw new Error(paymentResponse.message || 'Flutterwave initialization failed');
        }
        break;
        
      case 'korapay':
        console.log('Initializing Korapay payment...');
        paymentResponse = await initializeKorapay(gateway, {
          ...paymentRequest,
          reference,
          name: customerName
        }, callbackUrl);
        
        if (paymentResponse.status === true && paymentResponse.data?.checkout_url) {
          redirectUrl = paymentResponse.data.checkout_url;
        } else {
          console.error('Korapay error response:', paymentResponse);
          throw new Error(paymentResponse.message || 'Korapay initialization failed');
        }
        break;
        
      default:
        throw new Error(`Unsupported payment provider: ${paymentRequest.provider}`);
    }

    if (!redirectUrl) {
      console.error('No redirect URL obtained. Full response:', JSON.stringify(paymentResponse));
      throw new Error('Failed to get payment URL from provider. Please check API credentials.');
    }

    console.log('Payment initialized successfully. Redirect URL obtained.');

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
          gateway_provider: paymentRequest.provider,
          gateway_mode: gateway.mode
        },
        payment_status: 'pending'
      });

    if (paymentError) {
      console.error('Error storing payment record:', paymentError);
      // Don't throw - payment was already initiated with provider
    }

    console.log('=== PAYMENT PROCESSING COMPLETE ===');

    return new Response(JSON.stringify({
      success: true,
      message: 'Payment initialized successfully',
      reference: reference,
      payment_url: redirectUrl,
      mode: gateway.mode
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('=== PAYMENT ERROR ===');
    console.error('Error:', error.message);
    
    // Provide user-friendly error messages
    let userMessage = error.message;
    let hint = 'Please try again or contact support.';
    
    if (error.message.includes('not configured') || error.message.includes('not enabled')) {
      userMessage = 'Payment gateway is not properly configured';
      hint = 'Administrator needs to enable and configure the payment gateway in Admin Settings → Payment Gateways';
    } else if (error.message.includes('placeholder') || error.message.includes('API key')) {
      userMessage = 'Payment gateway has invalid API credentials';
      hint = 'Administrator needs to enter valid API keys from the payment provider dashboard';
    } else if (error.message.includes('secret key')) {
      userMessage = 'Payment gateway authentication failed';
      hint = 'The API keys may be expired or incorrect. Please check the payment provider dashboard.';
    } else if (error.message.includes('Minimum')) {
      hint = 'Please enter an amount of at least ₦100';
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: userMessage,
      hint: hint,
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function initializePaystack(gateway: any, request: any, callbackUrl: string) {
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
        user_id: request.user_id,
        payment_type: request.payment_type,
        ...request.metadata
      }
    }),
  });

  const data = await response.json();
  console.log('Paystack API status:', response.status, response.statusText);
  return data;
}

async function initializeFlutterwave(gateway: any, request: any, callbackUrl: string) {
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
  console.log('Flutterwave API status:', response.status, response.statusText);
  return data;
}

async function initializeKorapay(gateway: any, request: any, callbackUrl: string) {
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
        email: request.email
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
  console.log('Korapay API status:', response.status, response.statusText);
  return data;
}
