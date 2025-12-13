import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Shield, Send, CheckCircle2, AlertTriangle, Lock, Eye, EyeOff, Heart, Users
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
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-human/20 overflow-hidden animate-scale-in">
          {/* Success header with gradient */}
          <div className="gradient-empathy p-8">
            <div className="rounded-full bg-white/20 p-4 w-fit mx-auto mb-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Thank You</h2>
            <p className="text-white/80">Your voice matters</p>
          </div>
          
          <CardContent className="pt-6 pb-8">
            <p className="text-muted-foreground mb-6">
              Your report has been submitted anonymously. Thank you for helping protect our community.
            </p>
            <div className="p-4 rounded-xl bg-human/5 border border-human/10 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Your Reference Number</p>
              <p className="font-mono text-xl font-semibold text-human">{reportId.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-muted-foreground mt-2">Save this if you need to follow up</p>
            </div>
            <div className="flex items-start gap-3 text-left p-4 rounded-xl bg-muted">
              <Lock className="h-5 w-5 text-human mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Your identity is protected</p>
                <p className="text-xs text-muted-foreground">
                  We have not recorded your name, IP address, or any identifying information. 
                  Only authorized investigators can view this report.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Hero header with empathy gradient */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-human/10 text-human text-sm font-medium mb-2">
            <Heart className="h-4 w-4" />
            Safe & Confidential
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Your Voice <span className="text-gradient-human">Matters</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">
            Report fraud or misconduct safely. We're here to listen and protect.
          </p>
        </div>

        {/* Privacy assurance card */}
        <Card className="safe-zone overflow-hidden animate-fade-in">
          <div className="safe-zone-header">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">You Are Protected</h3>
                <p className="text-white/80 text-sm">Your safety is our priority</p>
              </div>
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-human/10 p-2 flex-shrink-0">
                  <Lock className="h-4 w-4 text-human" />
                </div>
                <div>
                  <p className="font-medium text-sm">No Login Required</p>
                  <p className="text-xs text-muted-foreground">Your identity stays hidden</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-human/10 p-2 flex-shrink-0">
                  <Shield className="h-4 w-4 text-human" />
                </div>
                <div>
                  <p className="font-medium text-sm">Encrypted & Secure</p>
                  <p className="text-xs text-muted-foreground">End-to-end protection</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-human/10 p-2 flex-shrink-0">
                  <Eye className="h-4 w-4 text-human" />
                </div>
                <div>
                  <p className="font-medium text-sm">Restricted Access</p>
                  <p className="text-xs text-muted-foreground">Only investigators can view</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-human/10 p-2 flex-shrink-0">
                  <Users className="h-4 w-4 text-human" />
                </div>
                <div>
                  <p className="font-medium text-sm">No IP Logging</p>
                  <p className="text-xs text-muted-foreground">Complete anonymity</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Form */}
        <Card className="card-interactive animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-human" />
              Share Your Concern
            </CardTitle>
            <CardDescription>
              Tell us what you've observed. Every detail helps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">What happened?</Label>
                <Input
                  id="subject"
                  placeholder="Brief summary of your concern"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  className="transition-all focus:ring-2 focus:ring-human/20"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {subject.length}/200
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Tell us more</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you saw, when it happened, and who was involved. The more details, the better we can help."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  maxLength={5000}
                  className="transition-all focus:ring-2 focus:ring-human/20"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {description.length}/5000
                </p>
              </div>

              {/* Tips section */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-2 text-sm text-human hover:underline transition-colors"
                >
                  {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showDetails ? 'Hide guidance' : 'Need help? See what to include'}
                </button>
                
                {showDetails && (
                  <div className="p-4 rounded-xl bg-human/5 border border-human/10 text-sm space-y-3 animate-fade-in">
                    <p className="font-medium text-human">Helpful things to mention:</p>
                    <ul className="text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-human">•</span>
                        <span><strong>What:</strong> What did you observe or experience?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-human">•</span>
                        <span><strong>When:</strong> When did this happen?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-human">•</span>
                        <span><strong>Who:</strong> Who was involved?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-human">•</span>
                        <span><strong>Where:</strong> Which location or branch?</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-human">•</span>
                        <span><strong>Impact:</strong> How does this affect members?</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={submitting || !subject || !description}
                className="w-full gap-2 btn-scale bg-human hover:bg-human/90 text-human-foreground h-12 text-base"
              >
                {submitting ? (
                  <>Submitting securely...</>
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

        {/* Reassuring footer */}
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground py-4">
          <Heart className="h-4 w-4 text-human" />
          <p>
            Thank you for caring about our community's safety.
          </p>
        </div>

        {/* Legal note */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground p-4 rounded-xl bg-muted/50">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p>
            Please only submit genuine concerns about fraud or misconduct. 
            False reports made intentionally may be subject to review.
          </p>
        </div>
      </div>
    </div>
  );
}
