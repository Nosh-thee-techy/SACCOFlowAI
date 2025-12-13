import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, XCircle, AlertTriangle, Clock, 
  Shield, Eye, ChevronRight, User, FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PendingTransaction {
  id: string;
  transaction_id: string;
  member_id: string;
  amount: number;
  transaction_type: string;
  status: string;
  risk_score: number;
  flags: string[];
  created_at: string;
  created_by: string;
  ai_metadata: any;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export default function PendingApprovals() {
  const { user } = useAuth();
  const [pending, setPending] = useState<PendingTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<PendingTransaction | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approvals`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch approvals');
      
      const data = await response.json();
      setPending(data.pending_approvals || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Could not load pending items');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (txId: string, action: 'approve' | 'reject', reason?: string) => {
    setProcessingId(txId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/approvals/${txId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'SEGREGATION_VIOLATION') {
          toast.error('You cannot approve your own transaction - this is a security rule');
        } else {
          throw new Error(data.error || 'Action failed');
        }
        return;
      }

      toast.success(
        action === 'approve' 
          ? 'Transaction approved successfully' 
          : 'Transaction rejected'
      );
      
      setPending(prev => prev.filter(tx => tx.id !== txId));
      setSelectedTx(null);
    } catch (error) {
      console.error('Error processing approval:', error);
      toast.error('Could not process this request');
    } finally {
      setProcessingId(null);
    }
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) return <Badge variant="destructive">High Risk</Badge>;
    if (score >= 40) return <Badge className="bg-amber-500">Medium Risk</Badge>;
    return <Badge variant="secondary">Low Risk</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading pending items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Review & Approve</h1>
        </div>
        <p className="text-muted-foreground">
          Review transactions that need your approval before they can be processed
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-500/10 p-3">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pending.length}</p>
                <p className="text-sm text-muted-foreground">Waiting for Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {pending.filter(tx => tx.risk_score >= 70).length}
                </p>
                <p className="text-sm text-muted-foreground">High Risk Items</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(pending.reduce((sum, tx) => sum + tx.amount, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Total Value Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {pending.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold">All Caught Up!</h3>
          <p className="text-muted-foreground">No transactions need your approval right now.</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending List */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Items</CardTitle>
              <CardDescription>Click to review details before approving</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pending.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className={`w-full p-4 rounded-lg border text-left transition-all hover:bg-accent ${
                    selectedTx?.id === tx.id ? 'border-primary bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${
                        tx.risk_score >= 70 ? 'bg-destructive/10' : 
                        tx.risk_score >= 40 ? 'bg-amber-500/10' : 'bg-primary/10'
                      }`}>
                        <User className={`h-4 w-4 ${
                          tx.risk_score >= 70 ? 'text-destructive' : 
                          tx.risk_score >= 40 ? 'text-amber-500' : 'text-primary'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{tx.member_id}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {tx.transaction_type} • {formatCurrency(tx.amount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRiskBadge(tx.risk_score)}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Detail Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Details</CardTitle>
              <CardDescription>
                {selectedTx ? 'Review and decide' : 'Select a transaction to review'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTx ? (
                <div className="space-y-6">
                  {/* Transaction Info */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-mono text-sm">{selectedTx.transaction_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member</span>
                      <span className="font-medium">{selectedTx.member_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="capitalize">{selectedTx.transaction_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-bold">{formatCurrency(selectedTx.amount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Risk Score</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${
                              selectedTx.risk_score >= 70 ? 'bg-destructive' :
                              selectedTx.risk_score >= 40 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${selectedTx.risk_score}%` }}
                          />
                        </div>
                        <span className="font-medium">{selectedTx.risk_score}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Flags/Reasons */}
                  {selectedTx.flags && selectedTx.flags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Why This Needs Review:</p>
                      <div className="space-y-2">
                        {selectedTx.flags.map((flag, i) => (
                          <div 
                            key={i}
                            className="flex items-start gap-2 p-2 rounded bg-amber-500/10 text-sm"
                          >
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Explanation */}
                  {selectedTx.ai_metadata?.risk_reasons && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">AI Analysis:</p>
                      <div className="p-3 rounded-lg bg-muted text-sm space-y-1">
                        {selectedTx.ai_metadata.risk_reasons.map((reason: string, i: number) => (
                          <p key={i}>• {reason}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Segregation Warning */}
                  {selectedTx.created_by === user?.id && (
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <div className="flex items-center gap-2 text-destructive">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          You created this transaction - you cannot approve it
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApproval(selectedTx.id, 'approve')}
                      disabled={processingId === selectedTx.id || selectedTx.created_by === user?.id}
                      className="flex-1 gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleApproval(selectedTx.id, 'reject')}
                      disabled={processingId === selectedTx.id}
                      className="flex-1 gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Eye className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Select a transaction from the list to see details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
