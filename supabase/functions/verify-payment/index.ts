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

    console.log('Verifying payment:', reference);

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

    // If already verified as successful, return status
    if (payment.payment_status === 'successful' || payment.payment_status === 'completed') {
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
    
    const { data: gatewayConfig } = await supabaseClient
      .from('payment_gateways')
      .select('*')
      .ilike('provider', gateway || '')
      .eq('enabled', true)
      .maybeSingle();

    let verificationResult = { success: false, data: null as any };

    if (gateway?.toLowerCase() === 'flutterwave' && gatewayConfig?.secret_key) {
      console.log('Verifying with Flutterwave...');
      
      // First try by reference
      const flwResponse = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`, {
        headers: {
          'Authorization': `Bearer ${gatewayConfig.secret_key}`,
          'Content-Type': 'application/json'
        }
      });
      
      const flwData = await flwResponse.json();
      console.log('Flutterwave verification response:', flwData);
      
      verificationResult = {
        success: flwData.status === 'success' && flwData.data?.status === 'successful',
        data: flwData.data
      };

    } else if (gateway?.toLowerCase() === 'paystack' && gatewayConfig?.secret_key) {
      console.log('Verifying with Paystack...');
      
      const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${gatewayConfig.secret_key}`,
          'Content-Type': 'application/json'
        }
      });
      
      const paystackData = await paystackResponse.json();
      console.log('Paystack verification response:', paystackData);
      
      verificationResult = {
        success: paystackData.status === true && paystackData.data?.status === 'success',
        data: paystackData.data
      };

    } else if (gateway?.toLowerCase() === 'korapay' && gatewayConfig?.secret_key) {
      console.log('Verifying with Korapay...');
      
      const koraResponse = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
        headers: {
          'Authorization': `Bearer ${gatewayConfig.secret_key}`,
          'Content-Type': 'application/json'
        }
      });
      
      const koraData = await koraResponse.json();
      console.log('Korapay verification response:', koraData);
      
      verificationResult = {
        success: koraData.status && koraData.data?.status === 'success',
        data: koraData.data
      };

    } else {
      console.log('No gateway config found or unsupported gateway:', gateway);
      // Return pending status
      return new Response(JSON.stringify({
        success: false,
        status: 'pending',
        message: 'Payment verification pending'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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
      }

      // Process successful payment
      if (payment.payment_type === 'wallet_funding' && payment.user_id) {
        console.log('Processing wallet funding for user:', payment.user_id);
        
        // Check if already credited
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
              description: `Wallet funding via ${gateway}`,
              reference: reference,
              metadata: {
                payment_id: payment.id,
                gateway: gateway
              }
            });

          if (walletError) {
            console.error('Wallet funding error:', walletError);
          } else {
            console.log('Wallet credited successfully');
          }
        }

      } else if (payment.payment_type === 'event_ticket' && payment.metadata?.event_id) {
        // Create event ticket
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
              order_id: payment.id
            });

          if (ticketError) {
            console.error('Ticket creation error:', ticketError);
          }
        }
      }
    }

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
    console.error('Payment verification error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
