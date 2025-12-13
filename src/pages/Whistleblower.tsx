import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Shield, Send, CheckCircle2, AlertTriangle, Lock, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const reportSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  description: z.string().min(20, 'Please provide more details (at least 20 characters)').max(5000),
});

export default function Whistleblower() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate input
      reportSchema.parse({ subject, description });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/whistleblower`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          },
          body: JSON.stringify({ subject, description })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setReportId(data.report_id);
      setSubmitted(true);
      toast.success('Report submitted anonymously');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="rounded-full bg-green-500/10 p-4 w-fit mx-auto mb-6">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Report Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Your report has been submitted anonymously. Thank you for helping maintain integrity.
            </p>
            <div className="p-4 rounded-lg bg-muted mb-6">
              <p className="text-sm text-muted-foreground">Reference Number</p>
              <p className="font-mono text-lg">{reportId.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex items-start gap-2 text-left p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Lock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Your identity has not been recorded. Only authorized personnel can view this report.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center">
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Report a Concern</h1>
        </div>
        <p className="text-muted-foreground">
          Submit a confidential report about fraud or misconduct
        </p>
      </div>

      {/* Privacy Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 flex-shrink-0">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Your Privacy is Protected</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• No login required - your identity is not recorded</li>
                <li>• Reports are encrypted and stored securely</li>
                <li>• Only authorized investigators can view reports</li>
                <li>• Your IP address is not logged</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Report</CardTitle>
          <CardDescription>
            Provide as much detail as possible to help with the investigation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief summary of your concern"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {subject.length}/200
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Details</Label>
              <Textarea
                id="description"
                placeholder="Describe what happened, when, where, and who was involved. Include any evidence or documents you're aware of."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                maxLength={5000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/5000
              </p>
            </div>

            {/* Tips */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showDetails ? 'Hide tips' : 'Show tips for effective reporting'}
              </button>
              
              {showDetails && (
                <div className="p-4 rounded-lg bg-muted text-sm space-y-2">
                  <p className="font-medium">What to include:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• <strong>What:</strong> Describe the suspicious activity or misconduct</li>
                    <li>• <strong>When:</strong> Dates and times if known</li>
                    <li>• <strong>Who:</strong> People involved (names, roles, or descriptions)</li>
                    <li>• <strong>Where:</strong> Location or branch where it occurred</li>
                    <li>• <strong>Evidence:</strong> Any documents, transactions, or proof</li>
                    <li>• <strong>Impact:</strong> How this affects members or the organization</li>
                  </ul>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={submitting || !subject || !description}
              className="w-full gap-2"
            >
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Anonymous Report
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Warning */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          False reports made in bad faith may be subject to investigation. 
          Please only submit genuine concerns about fraud or misconduct.
        </p>
      </div>
    </div>
  );
}
