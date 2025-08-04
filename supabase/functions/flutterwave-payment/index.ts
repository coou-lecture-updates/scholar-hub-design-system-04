
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

    if (req.method === 'POST' && req.url.includes('/initiate')) {
      const { amount, currency, email, phone, name, tx_ref, redirect_url, event_id, ticket_count } = await req.json();

      // Get Flutterwave configuration
      const { data: config } = await supabaseClient
        .from('payment_providers')
        .select('config')
        .eq('type', 'flutterwave')
        .eq('is_active', true)
        .single();

      if (!config) {
        throw new Error('Flutterwave not configured');
      }

      const flutterwaveResponse = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.config.secret_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref,
          amount,
          currency,
          redirect_url,
          customer: {
            email,
            phonenumber: phone,
            name,
          },
          customizations: {
            title: 'COOU Event Tickets',
            description: 'Event ticket payment',
            logo: 'https://your-logo-url.com/logo.png',
          },
          meta: {
            event_id,
            ticket_count,
          },
        }),
      });

      const result = await flutterwaveResponse.json();

      // Store payment record
      if (result.status === 'success') {
        await supabaseClient
          .from('payments')
          .insert({
            payment_reference: tx_ref,
            payment_type: 'event_ticket',
            amount,
            email,
            full_name: name,
            phone,
            payment_method: 'flutterwave',
            metadata: { event_id, ticket_count },
          });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && req.url.includes('/verify/')) {
      const transactionId = req.url.split('/verify/')[1];

      const { data: config } = await supabaseClient
        .from('payment_providers')
        .select('config')
        .eq('type', 'flutterwave')
        .eq('is_active', true)
        .single();

      const flutterwaveResponse = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: {
            'Authorization': `Bearer ${config.config.secret_key}`,
          },
        }
      );

      const result = await flutterwaveResponse.json();

      // Update payment status
      if (result.status === 'success' && result.data.status === 'successful') {
        const { data: payment } = await supabaseClient
          .from('payments')
          .update({ payment_status: 'completed' })
          .eq('payment_reference', result.data.tx_ref)
          .select()
          .single();

        // Generate tickets
        if (payment && payment.metadata?.ticket_count) {
          const tickets = [];
          for (let i = 0; i < payment.metadata.ticket_count; i++) {
            tickets.push({
              full_name: payment.full_name,
              email: payment.email,
              phone: payment.phone,
              event_id: payment.metadata.event_id,
              order_id: payment.id,
            });
          }

          await supabaseClient
            .from('tickets')
            .insert(tickets);
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
