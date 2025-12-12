import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rule-based fraud detection thresholds
const LARGE_TX_THRESHOLD = 100000;
const BUSINESS_HOURS_START = 8;
const BUSINESS_HOURS_END = 18;
const RAPID_WITHDRAWAL_COUNT = 3;
const RAPID_WITHDRAWAL_WINDOW_HOURS = 2;

interface Transaction {
  member_id: string;
  amount: number;
  transaction_type: string;
  account_balance: number;
  description?: string;
  device_fingerprint?: string;
  geo_location?: string;
}

interface Alert {
  transaction_id: string;
  member_id: string;
  alert_type: string;
  severity: string;
  reason: string;
  confidence: number;
}

// Generate hash for audit log
async function generateHash(payload: string, prevHash: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(payload + prevHash);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Rule-based fraud detection
function detectRuleBasedFraud(tx: Transaction, recentTxs: any[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  const hour = now.getHours();

  // Large transaction check
  if (tx.amount > LARGE_TX_THRESHOLD) {
    alerts.push({
      transaction_id: '',
      member_id: tx.member_id,
      alert_type: 'rule',
      severity: tx.amount > LARGE_TX_THRESHOLD * 2 ? 'critical' : 'high',
      reason: `Large transaction detected: KES ${tx.amount.toLocaleString()} exceeds threshold of KES ${LARGE_TX_THRESHOLD.toLocaleString()}`,
      confidence: 0.95
    });
  }

  // Off-hours transaction check
  if (hour < BUSINESS_HOURS_START || hour >= BUSINESS_HOURS_END) {
    alerts.push({
      transaction_id: '',
      member_id: tx.member_id,
      alert_type: 'rule',
      severity: 'medium',
      reason: `Transaction outside business hours (${hour}:00). Normal hours: ${BUSINESS_HOURS_START}:00 - ${BUSINESS_HOURS_END}:00`,
      confidence: 0.7
    });
  }

  // Rapid withdrawal detection
  if (tx.transaction_type === 'withdrawal') {
    const windowStart = new Date(now.getTime() - RAPID_WITHDRAWAL_WINDOW_HOURS * 60 * 60 * 1000);
    const recentWithdrawals = recentTxs.filter(t => 
      t.transaction_type === 'withdrawal' && 
      new Date(t.created_at) >= windowStart
    );
    
    if (recentWithdrawals.length >= RAPID_WITHDRAWAL_COUNT - 1) {
      alerts.push({
        transaction_id: '',
        member_id: tx.member_id,
        alert_type: 'rule',
        severity: 'high',
        reason: `Rapid withdrawals detected: ${recentWithdrawals.length + 1} withdrawals in ${RAPID_WITHDRAWAL_WINDOW_HOURS} hours`,
        confidence: 0.85
      });
    }
  }

  // Suspicious balance check
  if (tx.account_balance < 0) {
    alerts.push({
      transaction_id: '',
      member_id: tx.member_id,
      alert_type: 'rule',
      severity: 'critical',
      reason: 'Negative account balance detected after transaction',
      confidence: 1.0
    });
  }

  // Large deposit followed by withdrawal pattern
  if (tx.transaction_type === 'withdrawal') {
    const recentLargeDeposit = recentTxs.find(t => 
      t.transaction_type === 'deposit' && 
      t.amount > LARGE_TX_THRESHOLD * 0.5 &&
      new Date(t.created_at) >= new Date(now.getTime() - 24 * 60 * 60 * 1000)
    );
    
    if (recentLargeDeposit && tx.amount > recentLargeDeposit.amount * 0.8) {
      alerts.push({
        transaction_id: '',
        member_id: tx.member_id,
        alert_type: 'rule',
        severity: 'high',
        reason: 'Large withdrawal following recent large deposit - possible layering pattern',
        confidence: 0.8
      });
    }
  }

  return alerts;
}

// Anomaly detection using z-score
function detectAnomalies(tx: Transaction, memberTxs: any[]): Alert[] {
  const alerts: Alert[] = [];
  
  if (memberTxs.length < 5) return alerts; // Need history for anomaly detection

  const amounts = memberTxs.map(t => Number(t.amount));
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const std = Math.sqrt(amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length);
  
  if (std > 0) {
    const zScore = Math.abs((tx.amount - mean) / std);
    
    if (zScore > 3) {
      alerts.push({
        transaction_id: '',
        member_id: tx.member_id,
        alert_type: 'anomaly',
        severity: zScore > 4 ? 'critical' : 'high',
        reason: `Statistical anomaly: Transaction amount deviates ${zScore.toFixed(1)} standard deviations from member's average (KES ${mean.toFixed(0)})`,
        confidence: Math.min(0.99, 0.7 + (zScore - 3) * 0.1)
      });
    }
  }

  return alerts;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header for user context
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user from token
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

    // GET /transactions - List transactions
    if (req.method === 'GET' && path.length <= 1) {
      const memberId = url.searchParams.get('member_id');
      const status = url.searchParams.get('status');
      const limit = parseInt(url.searchParams.get('limit') || '100');
      
      let query = supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(limit);
      
      if (memberId) query = query.eq('member_id', memberId);
      if (status) query = query.eq('status', status);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ transactions: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /transactions/:id - Get single transaction
    if (req.method === 'GET' && path.length === 2) {
      const txId = path[1];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', txId)
        .single();
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ transaction: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /transactions - Create new transaction
    if (req.method === 'POST') {
      const body: Transaction = await req.json();
      
      console.log('Creating transaction:', body);

      // Get user role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const userRole = roleData?.role || 'auditor';

      // Check if user can create transactions
      if (!['teller', 'branch_manager', 'admin'].includes(userRole)) {
        return new Response(JSON.stringify({ error: 'Insufficient permissions to create transactions' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate transaction ID
      const txId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Get recent transactions for this member
      const { data: recentTxs } = await supabase
        .from('transactions')
        .select('*')
        .eq('member_id', body.member_id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Run fraud detection
      const ruleAlerts = detectRuleBasedFraud(body, recentTxs || []);
      const anomalyAlerts = detectAnomalies(body, recentTxs || []);
      const allAlerts = [...ruleAlerts, ...anomalyAlerts];

      // Calculate risk score
      let riskScore = 0;
      allAlerts.forEach(alert => {
        if (alert.severity === 'critical') riskScore += 30;
        else if (alert.severity === 'high') riskScore += 20;
        else if (alert.severity === 'medium') riskScore += 10;
        else riskScore += 5;
      });
      riskScore = Math.min(100, riskScore);

      // Determine status based on risk
      const status = riskScore >= 50 ? 'on_hold' : 'pending';
      const flags = allAlerts.map(a => a.reason.split(':')[0]);

      // Create transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          transaction_id: txId,
          member_id: body.member_id,
          amount: body.amount,
          transaction_type: body.transaction_type,
          account_balance: body.account_balance,
          description: body.description || '',
          device_fingerprint: body.device_fingerprint || 'web-client',
          geo_location: body.geo_location || 'unknown',
          status,
          risk_score: riskScore,
          flags,
          ai_metadata: {
            cleaned_description: body.description || '',
            category: body.transaction_type,
            risk_reasons: allAlerts.map(a => a.reason)
          },
          created_by: user.id
        })
        .select()
        .single();

      if (txError) {
        console.error('Transaction insert error:', txError);
        throw txError;
      }

      // Create alerts if any
      if (allAlerts.length > 0) {
        const alertsToInsert = allAlerts.map(alert => ({
          ...alert,
          transaction_id: transaction.id
        }));

        const { error: alertError } = await supabase
          .from('alerts')
          .insert(alertsToInsert);

        if (alertError) {
          console.error('Alert insert error:', alertError);
        }
      }

      // Create audit log
      const { data: lastLog } = await supabase
        .from('audit_logs')
        .select('hash')
        .order('id', { ascending: false })
        .limit(1)
        .single();

      const prevHash = lastLog?.hash || '0'.repeat(64);
      const payload = JSON.stringify({
        action: 'transaction_created',
        entity_type: 'transaction',
        entity_id: transaction.id,
        data: { transaction_id: txId, amount: body.amount, member_id: body.member_id }
      });
      const hash = await generateHash(payload, prevHash);

      await supabase.from('audit_logs').insert({
        entity_type: 'transaction',
        entity_id: transaction.id,
        action: 'created',
        actor_id: user.id,
        actor_role: userRole,
        payload: { transaction_id: txId, amount: body.amount, member_id: body.member_id, status },
        prev_hash: prevHash,
        hash
      });

      console.log('Transaction created successfully:', transaction.id);

      return new Response(JSON.stringify({ 
        transaction, 
        alerts: allAlerts,
        risk_score: riskScore
      }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in transactions function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});