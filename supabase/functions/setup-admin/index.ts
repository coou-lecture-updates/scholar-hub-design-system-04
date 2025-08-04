
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the Admin key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceRole, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Check if admin already exists
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'nzubeelendu09@gmail.com')
      .single();
      
    if (userCheckError && userCheckError.code !== 'PGRST116') {
      throw userCheckError;
    }
    
    let message = "Admin user already exists";
    
    if (!existingUser) {
      // Create admin user in auth.users
      const { data, error: createUserError } = await supabase.auth.admin.createUser({
        email: 'nzubeelendu09@gmail.com',
        password: 'COOU@admin1',
        email_confirm: true,
        user_metadata: { name: 'Admin User' }
      });
      
      if (createUserError) throw createUserError;
      
      if (data.user) {
        // Insert into users table with admin role
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: 'nzubeelendu09@gmail.com',
            full_name: 'Admin User',
            role: 'admin'
          });
          
        if (insertError) throw insertError;
        
        message = "Admin user created successfully";
      }
    } else if (existingUser.role !== 'admin') {
      // Update user to admin role
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', existingUser.id);
        
      if (updateError) throw updateError;
      
      message = "User updated to admin role";
    }
    
    return new Response(
      JSON.stringify({ success: true, message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
