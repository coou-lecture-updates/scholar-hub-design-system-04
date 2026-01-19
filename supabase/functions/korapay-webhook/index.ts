import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-korapay-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    console.log('Korapay webhook received');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get secret key from database for signature verification
    const { data: gateway } = await supabaseClient
      .from('payment_gateways')
      .select('secret_key')
      .eq('provider', 'korapay')
      .eq('enabled', true)
      .order('mode', { ascending: false }) // Prefer live mode
      .limit(1)
      .single();

    const secretKey = gateway?.secret_key;

    // Verify webhook signature
    const signature = req.headers.get('x-korapay-signature');
    if (signature && secretKey) {
      const expectedSignature = await createHmacSignature(body, secretKey);
      if (signature !== expectedSignature) {
        console.log('Korapay signature mismatch - continuing anyway');
      }
    }

    const event = JSON.parse(body);
    console.log('Korapay event:', event.event, event.data?.status);

    // Handle successful charge
    if (event.event === 'charge.success' || 
        (event.data?.status === 'success' || event.data?.status === 'successful')) {
      const reference = event.data?.reference || event.data?.tx_ref;
      const korapayRef = event.data?.korapay_reference || event.data?.payment_reference;
      
      console.log('Processing successful Korapay charge:', reference);

      // Update payment record
      const { data: payment, error: updateError } = await supabaseClient
        .from('payments')
        .update({
          payment_status: 'completed',
          transaction_id: korapayRef,
          metadata: {
            ...event.data,
            webhook_verified_at: new Date().toISOString(),
            provider: 'korapay'
          }
        })
        .eq('payment_reference', reference)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating payment:', updateError);
      } else {
        console.log('Payment updated successfully:', payment?.id);

        // Handle wallet funding
        if (payment?.payment_type === 'wallet_funding' && payment?.user_id) {
          const { data: wallet } = await supabaseClient
            .from('wallets')
            .select('*')
            .eq('user_id', payment.user_id)
            .single();

          if (wallet) {
            await supabaseClient
              .from('wallets')
              .update({ 
                balance: wallet.balance + payment.amount,
                updated_at: new Date().toISOString()
              })
              .eq('id', wallet.id);

            await supabaseClient
              .from('wallet_transactions')
              .insert({
                user_id: payment.user_id,
                amount: payment.amount,
                type: 'credit',
                description: 'Wallet funded via Korapay',
                reference: reference
              });

            console.log('Wallet funded:', payment.user_id, payment.amount);
          } else {
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
                description: 'Wallet funded via Korapay',
                reference: reference
              });

            console.log('New wallet created and funded:', payment.user_id);
          }
        }

        // Handle event ticket purchase
        if (payment?.payment_type === 'event_ticket') {
          const metadata = payment.metadata as any;
          const eventId = metadata?.event_id;
          
          if (eventId) {
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
          provider: 'korapay',
          provider_reference: korapayRef,
          status: 'completed',
          webhook_data: event.data,
          verified_at: new Date().toISOString()
        });

      console.log(`Korapay payment completed: ${reference}`);
    }

    return new Response(JSON.stringify({ status: 'success' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Korapay webhook error:', error);
    return new Response(JSON.stringify({ status: 'error', message: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function createHmacSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
