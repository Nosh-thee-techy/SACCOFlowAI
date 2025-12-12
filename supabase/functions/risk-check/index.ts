import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SimCheckRequest {
  member_id: string;
  device_fingerprint: string;
  geo_location?: string;
  phone_number?: string;
}

interface DeepfakeRequest {
  image_name?: string;
  force_result?: 'match' | 'no_match';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const path = url.pathname.split('/').filter(Boolean);

    // POST /risk-check/score - Calculate risk score
    if (req.method === 'POST' && path.includes('score')) {
      const body = await req.json();
      const { member_id, amount, transaction_type } = body;

      // Get member's transaction history
      const { data: history } = await supabase
        .from('transactions')
        .select('amount, transaction_type, created_at')
        .eq('member_id', member_id)
        .order('created_at', { ascending: false })
        .limit(100);

      const reasons: string[] = [];
      const flags: string[] = [];
      let score = 0;

      if (!history || history.length === 0) {
        reasons.push('New member with no transaction history');
        flags.push('new_member');
        score += 20;
      } else {
        // Calculate statistical deviation
        const amounts = history.map(t => Number(t.amount));
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const std = Math.sqrt(amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length);
        
        if (std > 0 && amount) {
          const zScore = Math.abs((amount - mean) / std);
          if (zScore > 2) {
            reasons.push(`Amount deviates ${zScore.toFixed(1)} std from average`);
            flags.push('statistical_anomaly');
            score += Math.min(40, zScore * 10);
          }
        }

        // Check frequency
        const recentTxs = history.filter(t => 
          new Date(t.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
        if (recentTxs.length > 10) {
          reasons.push(`High transaction frequency: ${recentTxs.length} in 24h`);
          flags.push('high_frequency');
          score += 15;
        }
      }

      // Check time
      const hour = new Date().getHours();
      if (hour < 6 || hour > 22) {
        reasons.push('Transaction during unusual hours');
        flags.push('off_hours');
        score += 10;
      }

      score = Math.min(100, score);

      return new Response(JSON.stringify({ 
        score, 
        reasons, 
        flags,
        risk_level: score >= 70 ? 'critical' : score >= 50 ? 'high' : score >= 30 ? 'medium' : 'low'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /risk-check/sim-check - SIM swap heuristics
    if (req.method === 'POST' && path.includes('sim-check')) {
      const body: SimCheckRequest = await req.json();
      
      console.log('Running SIM swap check for:', body.member_id);

      // Get last known device for this member
      const { data: lastTx } = await supabase
        .from('transactions')
        .select('device_fingerprint, geo_location')
        .eq('member_id', body.member_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let riskAction: 'none' | 'notify' | 'lock_account' = 'none';
      const details: string[] = [];

      if (lastTx) {
        // Check device fingerprint change
        if (lastTx.device_fingerprint && lastTx.device_fingerprint !== body.device_fingerprint) {
          details.push('Device fingerprint changed since last transaction');
          riskAction = 'notify';
        }

        // Check geo location change
        if (lastTx.geo_location && body.geo_location && lastTx.geo_location !== body.geo_location) {
          details.push(`Location changed from ${lastTx.geo_location} to ${body.geo_location}`);
          if (riskAction === 'notify') {
            riskAction = 'lock_account'; // Multiple red flags
          } else {
            riskAction = 'notify';
          }
        }
      }

      // Demo: Force SIM swap detection if fingerprint contains 'SIMSWAP'
      if (body.device_fingerprint?.includes('SIMSWAP')) {
        riskAction = 'lock_account';
        details.push('DEMO: Forced SIM swap detection triggered');
      }

      console.log('SIM check result:', { riskAction, details });

      return new Response(JSON.stringify({ 
        risk_action: riskAction,
        details,
        recommendation: riskAction === 'lock_account' 
          ? 'Account should be locked pending verification'
          : riskAction === 'notify'
          ? 'Send notification to member about suspicious activity'
          : 'No action required'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // POST /risk-check/deepfake - Deepfake verification stub
    if (req.method === 'POST' && path.includes('deepfake')) {
      const body: DeepfakeRequest = await req.json();
      
      console.log('Running deepfake verification');

      // Demo stub - deterministic responses based on input
      let match = true;
      let confidence = 0.95;
      const reasons: string[] = [];

      if (body.force_result === 'no_match') {
        match = false;
        confidence = 0.15;
        reasons.push('DEMO: Forced no-match result');
      } else if (body.image_name?.includes('fake')) {
        match = false;
        confidence = 0.25;
        reasons.push('Facial landmarks inconsistency detected');
        reasons.push('Lighting analysis suggests manipulation');
      } else {
        reasons.push('Facial features match stored profile');
        reasons.push('Liveness check passed');
      }

      return new Response(JSON.stringify({ 
        match,
        confidence,
        reasons,
        recommendation: match 
          ? 'Identity verified successfully'
          : 'Identity verification failed - request manual review'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid endpoint. Use /score, /sim-check, or /deepfake' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in risk-check function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});