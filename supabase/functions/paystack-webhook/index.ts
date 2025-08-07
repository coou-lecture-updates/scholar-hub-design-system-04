import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    console.log('Paystack webhook received');

    // Verify webhook signature
    const expectedSignature = await verifyPaystackSignature(body, Deno.env.get('PAYSTACK_SECRET_KEY') || '');
    
    if (signature !== expectedSignature) {
      console.log('Invalid Paystack signature');
      return new Response('Invalid signature', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const event = JSON.parse(body);
    console.log('Paystack event:', event.event);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (event.event === 'charge.success') {
      const { reference, amount, status, customer } = event.data;
      
      console.log('Processing successful charge:', reference);

      // Update payment record
      const { error: updateError } = await supabaseClient
        .from('payments')
        .update({
          payment_status: 'completed',
          metadata: {
            ...event.data,
            webhook_verified_at: new Date().toISOString()
          }
        })
        .eq('payment_reference', reference);

      if (updateError) {
        console.error('Error updating payment:', updateError);
        return new Response('Error updating payment', { 
          status: 500,
          headers: corsHeaders 
        });
      }

      // Store transaction record
      const { error: transactionError } = await supabaseClient
        .from('payment_transactions')
        .insert({
          payment_id: null, // Will be updated by trigger
          provider: 'paystack',
          provider_reference: reference,
          status: 'completed',
          webhook_data: event.data,
          verified_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('Error storing transaction:', transactionError);
      }

      console.log(`Paystack payment completed: ${reference}`);
    }

    return new Response('Webhook processed', { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Paystack webhook error:', error);
    return new Response('Webhook error', { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function verifyPaystackSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(secret + body);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('');
}