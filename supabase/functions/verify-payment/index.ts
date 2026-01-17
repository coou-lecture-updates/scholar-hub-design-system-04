import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { reference } = await req.json();

    if (!reference) {
      throw new Error('Payment reference is required');
    }

    console.log('=== PAYMENT VERIFICATION START ===');
    console.log('Reference:', reference);

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      throw new Error('Payment record not found');
    }

    console.log('Payment found:', payment.id, 'Status:', payment.payment_status);

    // If already verified as successful, return status
    if (payment.payment_status === 'successful' || payment.payment_status === 'completed') {
      console.log('Payment already verified as successful');
      return new Response(JSON.stringify({
        success: true,
        status: 'successful',
        payment: payment
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get the gateway configuration
    const gateway = payment.metadata?.gateway_provider || payment.payment_method;
    const gatewayMode = payment.metadata?.gateway_mode || 'live';
    
    console.log('Gateway:', gateway, 'Mode:', gatewayMode);

    const { data: gatewayConfig, error: gatewayError } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .ilike('provider', gateway || '')
      .eq('enabled', true)
      .maybeSingle();

    if (gatewayError) {
      console.error('Gateway config error:', gatewayError);
    }

    if (!gatewayConfig?.secret_key) {
      console.error('No gateway config found for:', gateway);
      return new Response(JSON.stringify({
        success: false,
        status: 'pending',
        message: 'Payment verification pending - gateway configuration not found'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let verificationResult = { success: false, data: null as any };

    // Verify with appropriate provider
    if (gateway?.toLowerCase() === 'flutterwave') {
      console.log('Verifying with Flutterwave...');
      
      const flwResponse = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`, {
        headers: {
          'Authorization': `Bearer ${gatewayConfig.secret_key}`,
          'Content-Type': 'application/json'
        }
      });
      
      const flwData = await flwResponse.json();
      console.log('Flutterwave verification status:', flwResponse.status);
      
      verificationResult = {
        success: flwData.status === 'success' && flwData.data?.status === 'successful',
        data: flwData.data
      };

    } else if (gateway?.toLowerCase() === 'paystack') {
      console.log('Verifying with Paystack...');
      
      const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${gatewayConfig.secret_key}`,
          'Content-Type': 'application/json'
        }
      });
      
      const paystackData = await paystackResponse.json();
      console.log('Paystack verification status:', paystackResponse.status);
      
      verificationResult = {
        success: paystackData.status === true && paystackData.data?.status === 'success',
        data: paystackData.data
      };

    } else if (gateway?.toLowerCase() === 'korapay') {
      console.log('Verifying with Korapay...');
      
      const koraResponse = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
        headers: {
          'Authorization': `Bearer ${gatewayConfig.secret_key}`,
          'Content-Type': 'application/json'
        }
      });
      
      const koraData = await koraResponse.json();
      console.log('Korapay verification status:', koraResponse.status);
      
      verificationResult = {
        success: koraData.status && koraData.data?.status === 'success',
        data: koraData.data
      };

    } else {
      console.log('Unsupported gateway:', gateway);
      return new Response(JSON.stringify({
        success: false,
        status: 'pending',
        message: 'Payment verification pending - unsupported gateway'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Verification result:', verificationResult.success);

    // Update payment status
    const newStatus = verificationResult.success ? 'successful' : payment.payment_status;
    
    if (verificationResult.success) {
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          payment_status: newStatus,
          metadata: {
            ...payment.metadata,
            verification_data: verificationResult.data,
            verified_at: new Date().toISOString()
          }
        })
        .eq('id', payment.id);

      if (updateError) {
        console.error('Failed to update payment status:', updateError);
      } else {
        console.log('Payment status updated to:', newStatus);
      }

      // Process successful payment based on type
      if (payment.payment_type === 'wallet_funding' && payment.user_id) {
        console.log('Processing wallet funding for user:', payment.user_id);
        
        // Check if already credited (prevent double crediting)
        const { data: existingTx } = await supabaseClient
          .from('wallet_transactions')
          .select('id')
          .eq('reference', reference)
          .maybeSingle();

        if (!existingTx) {
          const { error: walletError } = await supabaseClient
            .from('wallet_transactions')
            .insert({
              user_id: payment.user_id,
              amount: payment.amount,
              type: 'credit',
              description: `Wallet funding via ${gateway} (${gatewayMode} mode)`,
              reference: reference,
              metadata: {
                payment_id: payment.id,
                gateway: gateway,
                mode: gatewayMode
              }
            });

          if (walletError) {
            console.error('Wallet funding error:', walletError);
          } else {
            console.log('Wallet credited successfully with ₦', payment.amount);
          }
        } else {
          console.log('Wallet already credited for this reference');
        }

      } else if (payment.payment_type === 'event_ticket' && payment.metadata?.event_id) {
        console.log('Processing event ticket creation...');
        
        // Check if ticket already exists
        const { data: existingTicket } = await supabaseClient
          .from('tickets')
          .select('id')
          .eq('ticket_code', `TICKET_${reference}`)
          .maybeSingle();

        if (!existingTicket) {
          const { error: ticketError } = await supabaseClient
            .from('tickets')
            .insert({
              event_id: payment.metadata.event_id,
              full_name: payment.full_name,
              email: payment.email,
              phone: payment.phone,
              ticket_code: `TICKET_${reference}`,
              order_id: payment.id,
              status: 'active'
            });

          if (ticketError) {
            console.error('Ticket creation error:', ticketError);
          } else {
            console.log('Event ticket created successfully');
          }
        } else {
          console.log('Ticket already exists for this reference');
        }
      }
    }

    console.log('=== PAYMENT VERIFICATION COMPLETE ===');

    return new Response(JSON.stringify({
      success: verificationResult.success,
      status: newStatus,
      payment: {
        ...payment,
        payment_status: newStatus
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('=== VERIFICATION ERROR ===');
    console.error('Error:', error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
