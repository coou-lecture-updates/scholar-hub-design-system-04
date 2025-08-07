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
    const url = new URL(req.url);
    const reference = url.searchParams.get('reference') || url.searchParams.get('tx_ref') || url.searchParams.get('trxref');
    
    if (!reference) {
      throw new Error('Payment reference not found');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Payment callback received for reference:', reference);

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('payment_reference', reference)
      .maybeSingle();

    if (paymentError || !payment) {
      console.error('Payment not found:', reference);
      return redirectToStatus('failed', 'Payment record not found');
    }

    // Verify payment with provider
    let verificationResult = { success: false, data: null };
    
    try {
      const response = await supabaseClient.functions.invoke('verify-payment', {
        body: { reference: reference }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      verificationResult = response.data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return redirectToStatus('failed', 'Payment verification failed');
    }

    // Process successful payment
    if (verificationResult.success) {
      // Handle different payment types
      if (payment.payment_type === 'wallet_funding' && payment.user_id) {
        // Fund wallet
        const { error: walletError } = await supabaseClient
          .from('wallet_transactions')
          .insert({
            user_id: payment.user_id,
            amount: payment.amount,
            type: 'credit',
            description: `Wallet funding via ${payment.payment_method}`,
            reference: reference
          });

        if (walletError) {
          console.error('Wallet funding failed:', walletError);
        }
      } else if (payment.payment_type === 'event_ticket' && payment.metadata?.event_id) {
        // Create ticket
        const { error: ticketError } = await supabaseClient
          .from('tickets')
          .insert({
            event_id: payment.metadata.event_id,
            full_name: payment.full_name,
            email: payment.email,
            phone: payment.phone,
            ticket_code: `TKT_${reference}`,
            order_id: payment.id
          });

        if (ticketError) {
          console.error('Ticket creation failed:', ticketError);
        }
      }

      return redirectToStatus('success', 'Payment completed successfully');
    } else {
      return redirectToStatus('failed', 'Payment was not successful');
    }

  } catch (error) {
    console.error('Payment callback error:', error);
    return redirectToStatus('failed', error.message);
  }
});

function redirectToStatus(status: string, message: string) {
  const redirectUrl = `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/payment-status?status=${status}&message=${encodeURIComponent(message)}`;
  
  return new Response(null, {
    status: 302,
    headers: {
      'Location': redirectUrl,
      ...corsHeaders
    }
  });
}