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

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    
    console.log('Academic system action:', action);

    switch (action) {
      case 'timetable':
        return await handleTimetable(req, supabaseClient);
      case 'exams':
        return await handleExams(req, supabaseClient);
      case 'results':
        return await handleResults(req, supabaseClient);
      case 'courses':
        return await handleCourses(req, supabaseClient);
      case 'analytics':
        return await handleAnalytics(req, supabaseClient);
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Academic system error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleTimetable(req: Request, supabase: any) {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const faculty = url.searchParams.get('faculty');
    const department = url.searchParams.get('department');
    const level = url.searchParams.get('level');

    let query = supabase.from('lectures').select('*');
    
    if (faculty) query = query.eq('faculty', faculty);
    if (department) query = query.eq('department', department);
    if (level) query = query.eq('level', parseInt(level));

    const { data, error } = await query.order('day').order('time');

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (req.method === 'POST') {
    const lectureData = await req.json();
    
    const { data, error } = await supabase
      .from('lectures')
      .insert(lectureData)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Method not allowed');
}

async function handleExams(req: Request, supabase: any) {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const department = url.searchParams.get('department');
    const level = url.searchParams.get('level');

    let query = supabase.from('exams').select('*');
    
    if (department) query = query.eq('department', department);
    if (level) query = query.eq('level', parseInt(level));

    const { data, error } = await query
      .gte('exam_date', new Date().toISOString().split('T')[0])
      .order('exam_date');

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Method not allowed');
}

async function handleResults(req: Request, supabase: any) {
  // Placeholder for results handling
  return new Response(JSON.stringify({ 
    message: 'Results feature coming soon' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleCourses(req: Request, supabase: any) {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const department = url.searchParams.get('department');
    const level = url.searchParams.get('level');
    const semester = url.searchParams.get('semester');

    let query = supabase.from('courses').select('*');
    
    if (department) query = query.eq('department_id', department);
    if (level) query = query.eq('level', parseInt(level));
    if (semester) query = query.eq('semester', semester);

    const { data, error } = await query.order('code');

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Method not allowed');
}

async function handleAnalytics(req: Request, supabase: any) {
  if (req.method === 'GET') {
    // Get comprehensive analytics data
    const [
      { data: userStats },
      { data: eventStats },
      { data: paymentStats },
      { data: recentActivity }
    ] = await Promise.all([
      supabase.from('users').select('role, created_at'),
      supabase.from('events').select('published, created_at, price'),
      supabase.from('payments').select('payment_status, amount, created_at'),
      supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10)
    ]);

    const analytics = {
      users: {
        total: userStats?.length || 0,
        admins: userStats?.filter((u: any) => u.role === 'admin').length || 0,
        moderators: userStats?.filter((u: any) => u.role === 'moderator').length || 0,
        students: userStats?.filter((u: any) => u.role === 'user').length || 0
      },
      events: {
        total: eventStats?.length || 0,
        published: eventStats?.filter((e: any) => e.published).length || 0,
        paid: eventStats?.filter((e: any) => e.price > 0).length || 0
      },
      payments: {
        total: paymentStats?.length || 0,
        completed: paymentStats?.filter((p: any) => p.payment_status === 'completed').length || 0,
        revenue: paymentStats?.filter((p: any) => p.payment_status === 'completed').reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
      },
      recentActivity: recentActivity || []
    };

    return new Response(JSON.stringify({ data: analytics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  throw new Error('Method not allowed');
}