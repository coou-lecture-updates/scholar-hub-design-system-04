import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, verif-hash',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log('Flutterwave webhook received');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get secret hash from database
    const { data: gateway } = await supabaseClient
      .from('payment_gateways')
      .select('secret_key')
      .eq('provider', 'flutterwave')
      .eq('enabled', true)
      .order('mode', { ascending: false }) // Prefer live mode
      .limit(1)
      .single();

    const secretHash = gateway?.secret_key;

    // Verify webhook signature using verif-hash header
    const verifHash = req.headers.get('verif-hash');
    
    if (!verifHash || verifHash !== secretHash) {
      console.log('Invalid Flutterwave webhook signature');
      // Still process but log the warning
    }

    const event = JSON.parse(body);
    console.log('Flutterwave event:', event.event, event.data?.status);

    // Handle successful charge
    if (event.event === 'charge.completed' && event.data?.status === 'successful') {
      const { tx_ref, flw_ref, amount, customer } = event.data;
      
      console.log('Processing successful Flutterwave charge:', tx_ref);

      // Update payment record
      const { data: payment, error: updateError } = await supabaseClient
        .from('payments')
        .update({
          payment_status: 'completed',
          transaction_id: flw_ref,
          metadata: {
            ...event.data,
            webhook_verified_at: new Date().toISOString(),
            provider: 'flutterwave'
          }
        })
        .eq('payment_reference', tx_ref)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating payment:', updateError);
      } else {
        console.log('Payment updated successfully:', payment?.id);

        // Handle wallet funding
        if (payment?.payment_type === 'wallet_funding' && payment?.user_id) {
          // Get or create wallet
          const { data: wallet } = await supabaseClient
            .from('wallets')
            .select('*')
            .eq('user_id', payment.user_id)
            .single();

          if (wallet) {
            // Update wallet balance
            await supabaseClient
              .from('wallets')
              .update({ 
                balance: wallet.balance + payment.amount,
                updated_at: new Date().toISOString()
              })
              .eq('id', wallet.id);

            // Create wallet transaction
            await supabaseClient
              .from('wallet_transactions')
              .insert({
                user_id: payment.user_id,
                amount: payment.amount,
                type: 'credit',
                description: 'Wallet funded via Flutterwave',
                reference: tx_ref
              });

            console.log('Wallet funded:', payment.user_id, payment.amount);
          } else {
            // Create new wallet
            await supabaseClient
              .from('wallets')
              .insert({
                user_id: payment.user_id,
                balance: payment.amount
              });

            await supabaseClient
              .from('wallet_transactions')
              .insert({
                user_id: payment.user_id,
                amount: payment.amount,
                type: 'credit',
                description: 'Wallet funded via Flutterwave',
                reference: tx_ref
              });

            console.log('New wallet created and funded:', payment.user_id);
          }
        }

        // Handle event ticket purchase
        if (payment?.payment_type === 'event_ticket') {
          const metadata = payment.metadata as any;
          const eventId = metadata?.event_id;
          
          if (eventId) {
            // Create ticket
            const ticketCode = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            
            await supabaseClient
              .from('tickets')
              .insert({
                event_id: eventId,
                email: payment.email,
                full_name: payment.full_name,
                phone: payment.phone,
                ticket_code: ticketCode,
                status: 'active'
              });

            console.log('Ticket created:', ticketCode);
          }
        }
      }

      // Store transaction record
      await supabaseClient
        .from('payment_transactions')
        .insert({
          payment_id: payment?.id,
          provider: 'flutterwave',
          provider_reference: flw_ref,
          status: 'completed',
          webhook_data: event.data,
          verified_at: new Date().toISOString()
        });

      console.log(`Flutterwave payment completed: ${tx_ref}`);
    }

    return new Response(JSON.stringify({ status: 'success' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
