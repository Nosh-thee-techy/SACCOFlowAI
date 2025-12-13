import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, text, voiceId } = await req.json();
    
    if (action === 'tts') {
      // Text to Speech using ElevenLabs
      const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
      
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ElevenLabs API key not configured');
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'onwK4e9ZLuTAKqWW03F9'}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.3,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ElevenLabs error:', errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBuffer = await response.arrayBuffer();
      
      return new Response(audioBuffer, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
        },
      });
    }

    if (action === 'chat') {
      // AI Chat using Lovable AI Gateway
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      
      if (!LOVABLE_API_KEY) {
        throw new Error('Lovable API key not configured');
      }

      const { messages } = await req.json();

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are Kofi, a friendly AI assistant for SACCO Flow AI - a financial monitoring platform for savings and credit cooperatives. 
              
Your personality:
- Warm, professional, and helpful
- You explain financial and security concepts in simple, everyday language
- You're dressed in a smart suit and take your role seriously but with a friendly demeanor
- You help users understand their dashboard, alerts, transactions, and security features

Key areas you help with:
- Understanding what alerts mean and what actions to take
- Explaining risk scores and member activity patterns
- Guiding users through the dashboard and features
- Answering questions about transactions and financial safety
- Helping with system navigation

Always respond in clear, simple language - avoid jargon. If you must use a technical term, explain it.
Keep responses concise but friendly.`,
            },
            ...messages,
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', errorText);
        throw new Error('AI service unavailable');
      }

      const data = await response.json();
      
      return new Response(JSON.stringify({
        message: data.choices[0].message.content,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Assistant error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
