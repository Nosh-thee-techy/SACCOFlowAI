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

    const url = new URL(req.url);

    // POST /whistleblower - Create anonymous report (no auth required)
    if (req.method === 'POST') {
      const body = await req.json();
      
      if (!body.subject || !body.description) {
        return new Response(JSON.stringify({ error: 'Subject and description are required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Creating anonymous whistleblower report');

      const { data: report, error } = await supabase
        .from('whistleblower_reports')
        .insert({
          subject: body.subject,
          description: body.description,
          evidence_urls: body.evidence_urls || []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating report:', error);
        throw error;
      }

      // Create alert for managers
      await supabase.from('alerts').insert({
        member_id: 'WHISTLEBLOWER',
        alert_type: 'behavioral',
        severity: 'high',
        reason: `Whistleblower report received: ${body.subject}`,
        confidence: 1.0,
        status: 'pending'
      });

      console.log('Whistleblower report created:', report.id);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Your report has been submitted anonymously. Thank you for helping maintain integrity.',
        report_id: report.id
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /whistleblower - List reports (auth required)
    if (req.method === 'GET') {
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

      // Check role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!['branch_manager', 'admin', 'auditor'].includes(roleData?.role || '')) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: reports, error } = await supabase
        .from('whistleblower_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ reports }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in whistleblower function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});