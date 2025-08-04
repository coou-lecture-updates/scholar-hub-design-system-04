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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    const { reference } = await req.json();

    if (!reference) {
      throw new Error('Payment reference is required');
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment record not found');
    }

    // If already verified, return status
    if (payment.payment_status === 'successful') {
      return new Response(JSON.stringify({
        success: true,
        status: 'successful',
        payment: payment
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify with payment gateway
    const gateway = payment.metadata?.gateway_provider || payment.payment_method;
    let verificationResult = { success: false, data: null };

    if (gateway?.toLowerCase() === 'flutterwave') {
      // Verify with Flutterwave
      const flwResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${reference}/verify`, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const flwData = await flwResponse.json();
      verificationResult = {
        success: flwData.status === 'success' && flwData.data?.status === 'successful',
        data: flwData.data
      };

    } else if (gateway?.toLowerCase() === 'korapay') {
      // Verify with Korapay
      const koraResponse = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${reference}`, {
        headers: {
          'Authorization': `Bearer ${Deno.env.get('KORAPAY_SECRET_KEY')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const koraData = await koraResponse.json();
      verificationResult = {
        success: koraData.status && koraData.data?.status === 'success',
        data: koraData.data
      };

    } else {
      // For demo payments, always verify as successful
      verificationResult = {
        success: true,
        data: {
          reference: reference,
          amount: payment.amount,
          status: 'successful'
        }
      };
    }

    // Update payment status
    let newStatus = verificationResult.success ? 'successful' : 'failed';
    
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
      throw new Error('Failed to update payment status');
    }

    // If successful, process the payment
    if (verificationResult.success) {
      if (payment.payment_type === 'wallet_funding' && payment.user_id) {
        // Add funds to user wallet
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
        }

      } else if (payment.payment_type === 'event_ticket' && payment.metadata?.event_id) {
        // Create event ticket
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