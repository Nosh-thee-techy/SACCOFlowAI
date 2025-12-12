import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate hash for audit log
async function generateHash(payload: string, prevHash: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload + prevHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

    // Get user role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    const userRole = roleData?.role || 'auditor';

    // Check if user can approve transactions
    if (!['branch_manager', 'admin'].includes(userRole)) {
      return new Response(JSON.stringify({ error: 'Only branch managers and admins can approve transactions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);

    // GET /approvals - List pending transactions
    if (req.method === 'GET') {
      const { data: pending, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:created_by(full_name, email)
        `)
        .in('status', ['pending', 'on_hold'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ pending_approvals: pending }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /approvals/:id/approve or /approvals/:id/reject
    if (req.method === 'POST' && path.length === 3) {
      const txId = path[1];
      const action = path[2]; // 'approve' or 'reject'

      if (!['approve', 'reject'].includes(action)) {
        return new Response(JSON.stringify({ error: 'Invalid action. Use approve or reject' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get the transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', txId)
        .single();

      if (txError || !transaction) {
        return new Response(JSON.stringify({ error: 'Transaction not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // SEGREGATION OF DUTIES: Cannot approve own transaction
      if (transaction.created_by === user.id) {
        console.log('Segregation violation attempt:', { txId, userId: user.id });
        return new Response(JSON.stringify({ 
          error: 'Segregation of duties violation: You cannot approve your own transaction',
          code: 'SEGREGATION_VIOLATION'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const body = await req.json().catch(() => ({}));
      const reason = body.reason || '';

      // Update transaction status
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const { data: updated, error: updateError } = await supabase
        .from('transactions')
        .update({
          status: newStatus,
          approved_by: user.id,
          ai_metadata: {
            ...transaction.ai_metadata,
            approval_reason: reason,
            approved_at: new Date().toISOString()
          }
        })
        .eq('id', txId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Create audit log
      const { data: lastLog } = await supabase
        .from('audit_logs')
        .select('hash')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      const prevHash = lastLog?.hash || '0'.repeat(64);
      const payload = JSON.stringify({
        action: `transaction_${action}d`,
        entity_type: 'transaction',
        entity_id: txId,
        data: { 
          previous_status: transaction.status, 
          new_status: newStatus,
          reason,
          segregation_check: 'passed'
        }
      });
      const hash = await generateHash(payload, prevHash);

      await supabase.from('audit_logs').insert({
        entity_type: 'transaction',
        entity_id: txId,
        action: `${action}d`,
        actor_id: user.id,
        actor_role: userRole,
        payload: { 
          previous_status: transaction.status, 
          new_status: newStatus,
          reason,
          created_by: transaction.created_by,
          approved_by: user.id
        },
        prev_hash: prevHash,
        hash
      });

      console.log(`Transaction ${txId} ${action}d by ${user.id}`);

      return new Response(JSON.stringify({ 
        transaction: updated,
        message: `Transaction ${action}d successfully`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in approvals function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});