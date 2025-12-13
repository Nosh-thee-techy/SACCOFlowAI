import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SimSwapCheckRequest {
  member_id: string;
  device_fingerprint: string;
  geo_location: string;
  country_code?: string;
}

interface SimSwapRiskResult {
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reasons: string[];
  action: 'allow' | 'verify' | 'block';
  requires_verification: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: SimSwapCheckRequest = await req.json();
    
    if (!body.member_id || !body.device_fingerprint) {
      return new Response(JSON.stringify({ error: 'member_id and device_fingerprint are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('SIM-swap check for member:', body.member_id);

    // Get member's recent transaction history for device/location patterns
    const { data: recentTxs } = await supabase
      .from('transactions')
      .select('device_fingerprint, geo_location, created_at')
      .eq('member_id', body.member_id)
      .order('created_at', { ascending: false })
      .limit(20);

    const reasons: string[] = [];
    let riskScore = 0;

    // Check 1: New device fingerprint
    const knownDevices = new Set(recentTxs?.map(t => t.device_fingerprint).filter(Boolean) || []);
    const isNewDevice = !knownDevices.has(body.device_fingerprint) && knownDevices.size > 0;
    
    if (isNewDevice) {
      reasons.push('New device detected - not previously used by this member');
      riskScore += 30;
    }

    // Check 2: Geographic mismatch
    const knownLocations = new Set(recentTxs?.map(t => t.geo_location).filter(Boolean) || []);
    const isNewLocation = !knownLocations.has(body.geo_location) && knownLocations.size > 0;
    
    if (isNewLocation) {
      reasons.push('Unusual location - different from member\'s typical transaction locations');
      riskScore += 25;
    }

    // Check 3: Country code mismatch (if provided)
    if (body.country_code) {
      const knownCountries = new Set(
        recentTxs?.map(t => t.geo_location?.split(',').pop()?.trim()).filter(Boolean) || []
      );
      const isNewCountry = knownCountries.size > 0 && !Array.from(knownCountries).some(c => 
        body.country_code?.toLowerCase().includes(c?.toLowerCase() || '') ||
        c?.toLowerCase().includes(body.country_code?.toLowerCase() || '')
      );
      
      if (isNewCountry) {
        reasons.push('Country mismatch detected - transaction from different country');
        riskScore += 35;
      }
    }

    // Check 4: Device change + location change combination (high risk)
    if (isNewDevice && isNewLocation) {
      reasons.push('Combined risk: Both device AND location are new - possible SIM swap attack');
      riskScore += 20;
    }

    // Check 5: Rapid device changes (multiple devices in short period)
    if (recentTxs && recentTxs.length >= 5) {
      const last24hTxs = recentTxs.filter(t => 
        new Date(t.created_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      const uniqueDevicesLast24h = new Set(last24hTxs.map(t => t.device_fingerprint).filter(Boolean));
      
      if (uniqueDevicesLast24h.size >= 3) {
        reasons.push('Rapid device switching detected - 3+ devices used in last 24 hours');
        riskScore += 25;
      }
    }

    // Determine risk level and action
    let risk_level: SimSwapRiskResult['risk_level'];
    let action: SimSwapRiskResult['action'];
    let requires_verification = false;

    if (riskScore >= 70) {
      risk_level = 'critical';
      action = 'block';
      requires_verification = true;
    } else if (riskScore >= 50) {
      risk_level = 'high';
      action = 'verify';
      requires_verification = true;
    } else if (riskScore >= 25) {
      risk_level = 'medium';
      action = 'verify';
      requires_verification = true;
    } else {
      risk_level = 'low';
      action = 'allow';
    }

    const confidence = Math.min(0.99, 0.6 + (riskScore / 200));

    // Create alert if high risk
    if (risk_level === 'high' || risk_level === 'critical') {
      await supabase.from('alerts').insert({
        member_id: body.member_id,
        alert_type: 'behavioral',
        severity: risk_level,
        reason: `SIM-swap risk detected: ${reasons.join('; ')}`,
        confidence,
        status: 'pending'
      });
      console.log('SIM-swap alert created for member:', body.member_id);
    }

    const result: SimSwapRiskResult = {
      risk_level,
      confidence,
      reasons: reasons.length > 0 ? reasons : ['No suspicious activity detected'],
      action,
      requires_verification
    };

    console.log('SIM-swap check result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sim-swap-check function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
