import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeepfakeResult {
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  action: 'allow' | 'manual_verification' | 'reject';
  analysis: {
    face_detected: boolean;
    manipulation_score: number;
    artifacts_found: string[];
    recommendation: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse multipart form data or JSON
    let filename = '';
    let fileType = '';
    
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      filename = file.name.toLowerCase();
      fileType = file.type;
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      filename = (body.filename || body.file_name || '').toLowerCase();
      fileType = body.file_type || body.mime_type || '';
    } else {
      return new Response(JSON.stringify({ error: 'Invalid content type. Use multipart/form-data or application/json' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Deepfake verification for file:', filename);

    // Stubbed deepfake detection logic
    // In production, this would call a real ML model (FaceForensics++, etc.)
    
    let result: DeepfakeResult;
    
    // Demo behavior: Certain filenames trigger specific results
    // This allows testing different scenarios
    if (filename.includes('fake') || filename.includes('manipulated') || filename.includes('deepfake')) {
      result = {
        risk: 'high',
        confidence: 0.92,
        action: 'manual_verification',
        analysis: {
          face_detected: true,
          manipulation_score: 0.87,
          artifacts_found: [
            'Inconsistent lighting on facial features',
            'Blending artifacts around jawline',
            'Unnatural eye movement patterns',
            'Skin texture anomalies detected'
          ],
          recommendation: 'Document appears to be manipulated. Require in-person verification or alternative documents.'
        }
      };
    } else if (filename.includes('blur') || filename.includes('low')) {
      result = {
        risk: 'medium',
        confidence: 0.65,
        action: 'manual_verification',
        analysis: {
          face_detected: true,
          manipulation_score: 0.45,
          artifacts_found: [
            'Low image quality - unable to perform full analysis',
            'Possible compression artifacts'
          ],
          recommendation: 'Image quality insufficient for definitive analysis. Request higher quality document.'
        }
      };
    } else if (filename.includes('no_face') || filename.includes('document_only')) {
      result = {
        risk: 'medium',
        confidence: 0.50,
        action: 'manual_verification',
        analysis: {
          face_detected: false,
          manipulation_score: 0.30,
          artifacts_found: [
            'No face detected in document',
            'Unable to perform facial analysis'
          ],
          recommendation: 'No face found in uploaded image. Ensure ID photo is visible and properly positioned.'
        }
      };
    } else {
      // Default: appears legitimate
      result = {
        risk: 'low',
        confidence: 0.08,
        action: 'allow',
        analysis: {
          face_detected: true,
          manipulation_score: 0.05,
          artifacts_found: [],
          recommendation: 'Document appears authentic. No signs of manipulation detected.'
        }
      };
    }

    // Add file metadata to response
    const response = {
      ...result,
      file_info: {
        filename,
        file_type: fileType || 'unknown',
        analyzed_at: new Date().toISOString()
      }
    };

    console.log('Deepfake verification result:', result.risk, result.action);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in deepfake-verify function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
