import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);

    // GET /alerts - List alerts
    if (req.method === 'GET' && path.length <= 1) {
      const status = url.searchParams.get('status');
      const severity = url.searchParams.get('severity');
      const alertType = url.searchParams.get('type');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      
      let query = supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (status) query = query.eq('status', status);
      if (severity) query = query.eq('severity', severity);
      if (alertType) query = query.eq('alert_type', alertType);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ alerts: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /alerts/:id/review - Review an alert
    if (req.method === 'POST' && path.length === 3 && path[2] === 'review') {
      const alertId = path[1];
      const body = await req.json();

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const userRole = roleData?.role || 'auditor';

      if (!['risk_officer', 'branch_manager', 'admin'].includes(userRole)) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions to review alerts' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const newStatus = body.status || 'reviewed';
      
      const { data: updated, error } = await supabase
        .from('alerts')
        .update({
          status: newStatus,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          assigned_to: body.assigned_to || null
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;

      console.log(`Alert ${alertId} reviewed by ${user.id}`);

      return new Response(JSON.stringify({ alert: updated }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in alerts function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});