
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
      const { amount, currency, customer, reference, narration, redirect_url, metadata } = await req.json();

      // Get Korapay configuration
      const { data: config } = await supabaseClient
        .from('payment_providers')
        .select('config')
        .eq('type', 'korapay')
        .eq('is_active', true)
        .single();

      if (!config) {
        throw new Error('Korapay not configured');
      }

      const korapayResponse = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.config.secret_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference,
          amount,
          currency,
          customer,
          merchant_bears_cost: true,
          narration,
          redirect_url,
          notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/korapay-webhook`,
          metadata,
        }),
      });

      const result = await korapayResponse.json();

      // Store payment record
      if (result.status) {
        await supabaseClient
          .from('payments')
          .insert({
            payment_reference: reference,
            payment_type: 'event_ticket',
            amount,
            email: customer.email,
            full_name: customer.name,
            phone: customer.phone,
            payment_method: 'korapay',
            metadata,
          });
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && req.url.includes('/verify/')) {
      const reference = req.url.split('/verify/')[1];

      const { data: config } = await supabaseClient
        .from('payment_providers')
        .select('config')
        .eq('type', 'korapay')
        .eq('is_active', true)
        .single();

      const korapayResponse = await fetch(
        `https://api.korapay.com/merchant/api/v1/charges/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${config.config.secret_key}`,
          },
        }
      );

      const result = await korapayResponse.json();

      // Update payment status
      if (result.status && result.data.status === 'success') {
        const { data: payment } = await supabaseClient
          .from('payments')
          .update({ payment_status: 'completed' })
          .eq('payment_reference', reference)
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
