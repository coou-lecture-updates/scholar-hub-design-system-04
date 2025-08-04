import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get admin credentials from environment variables
    const adminEmail = Deno.env.get('ADMIN_EMAIL')
    const adminPassword = Deno.env.get('ADMIN_PASSWORD')

    if (!adminEmail || !adminPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Admin credentials not configured. Please set ADMIN_EMAIL and ADMIN_PASSWORD in Supabase secrets.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('user_roles')
      .select('user_id, users(email)')
      .eq('role', 'admin')
      .single()

    if (existingAdmin) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Admin user already exists',
          email: existingAdmin.users?.email
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { 
        full_name: 'System Administrator',
        role: 'admin'
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to create admin user: ${authError.message}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create admin user'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Add to users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        full_name: 'System Administrator',
        role: 'admin'
      })

    if (userError) {
      console.error('User table error:', userError)
    }

    // Add admin role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'admin'
      })

    if (roleError) {
      console.error('Role error:', roleError)
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to assign admin role: ${roleError.message}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Log security event
    await supabaseAdmin.rpc('log_security_event', {
      p_action: 'admin_created',
      p_resource: 'user_roles',
      p_details: { email: adminEmail },
      p_user_id: authData.user.id
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        email: adminEmail
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Setup admin error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})