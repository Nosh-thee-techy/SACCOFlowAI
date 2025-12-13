import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle2, XCircle, Clock, AlertTriangle, 
  Shield, Brain, ChevronRight, Heart, MessageSquare,
  Calendar, Sparkles, Info
} from 'lucide-react';
import { useDemoMode } from './DemoModeProvider';
import { format, addHours } from 'date-fns';
import { cn } from '@/lib/utils';

export function TransactionQueue() {
  const { transactions, approveTransaction, rejectTransaction, deferTransaction } = useDemoMode();
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [showDeferModal, setShowDeferModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [deferNote, setDeferNote] = useState('');
  const [deferHours, setDeferHours] = useState(2);
  const [rejectReason, setRejectReason] = useState('');
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const selectedTransaction = transactions.find(t => t.id === selectedTx);

  const handleApprove = (id: string) => {
    approveTransaction(id);
    setSelectedTx(null);
  };

  const handleDefer = () => {
    if (selectedTx && deferNote) {
      deferTransaction(selectedTx, deferNote, addHours(new Date(), deferHours));
      setShowDeferModal(false);
      setDeferNote('');
      setSelectedTx(null);
    }
  };

  const handleReject = () => {
    if (selectedTx && rejectReason) {
      rejectTransaction(selectedTx, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedTx(null);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 40) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getRiskBg = (score: number) => {
    if (score >= 70) return 'bg-destructive/10';
    if (score >= 40) return 'bg-amber-500/10';
    return 'bg-emerald-500/10';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'transfer': return '↔️';
      case 'loan': return '🏦';
      default: return '📄';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Transactions
            </h2>
            <p className="text-sm text-muted-foreground">
              {pendingTransactions.length} items awaiting your review
            </p>
          </div>
          <Badge variant="outline" className="bg-intelligence/10 text-intelligence border-intelligence/20">
            <Brain className="h-3 w-3 mr-1" />
            AI Pre-analyzed
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Transaction List */}
          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Transaction Queue</CardTitle>
              <CardDescription>Click to review details</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {pendingTransactions.map((tx, index) => (
                    <button
                      key={tx.id}
                      onClick={() => setSelectedTx(tx.id)}
                      className={cn(
                        "w-full p-4 rounded-xl border text-left transition-all duration-300 hover:shadow-md group animate-slide-up",
                        selectedTx === tx.id 
                          ? 'border-primary bg-primary/5 shadow-md' 
                          : 'border-border/50 hover:border-primary/30 hover:bg-accent/30'
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("text-2xl p-2 rounded-lg", getRiskBg(tx.risk_score))}>
                            {getTypeIcon(tx.transaction_type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">{tx.transaction_type}</span>
                              {tx.human_impact === 'high' && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="p-1 rounded-full bg-human/10">
                                      <Heart className="h-3 w-3 text-human" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>High member impact</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {tx.member_id} • {formatCurrency(tx.amount)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {/* Risk Indicator */}
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={tx.risk_score} 
                                className={cn(
                                  "w-12 h-1.5",
                                  tx.risk_score >= 70 ? '[&>div]:bg-destructive' : 
                                  tx.risk_score >= 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
                                )}
                              />
                              <span className={cn("text-xs font-medium", getRiskColor(tx.risk_score))}>
                                {tx.risk_score}%
                              </span>
                            </div>
                            {tx.flags.length > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-3 w-3 text-amber-500" />
                                <span className="text-xs text-amber-500">{tx.flags.length} flags</span>
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </button>
                  ))}
                  
                  {pendingTransactions.length === 0 && (
                    <div className="py-12 text-center">
                      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500 mb-3" />
                      <p className="font-medium">All caught up!</p>
                      <p className="text-sm text-muted-foreground">No pending transactions</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Transaction Detail Panel */}
          <Card className="hover-lift">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-intelligence" />
                AI Analysis
              </CardTitle>
              <CardDescription>
                {selectedTransaction ? 'Review AI insights before deciding' : 'Select a transaction'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTransaction ? (
                <div className="space-y-6 animate-fade-in">
                  {/* Transaction Summary */}
                  <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">Transaction ID</p>
                        <p className="font-mono text-sm">{selectedTransaction.transaction_id}</p>
                      </div>
                      <Badge className={cn(
                        selectedTransaction.risk_score >= 70 ? 'bg-destructive' :
                        selectedTransaction.risk_score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}>
                        {selectedTransaction.risk_score >= 70 ? 'High Risk' :
                         selectedTransaction.risk_score >= 40 ? 'Medium Risk' : 'Low Risk'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Member</p>
                        <p className="font-medium">{selectedTransaction.member_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Amount</p>
                        <p className="font-bold text-lg">{formatCurrency(selectedTransaction.amount)}</p>
                      </div>
                    </div>

                    {/* Animated Risk Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Risk Score</span>
                        <span className={cn("font-medium", getRiskColor(selectedTransaction.risk_score))}>
                          {selectedTransaction.risk_score}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 animate-risk-score",
                            selectedTransaction.risk_score >= 70 ? 'bg-gradient-to-r from-destructive to-destructive/80' :
                            selectedTransaction.risk_score >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
                            'bg-gradient-to-r from-emerald-500 to-emerald-400'
                          )}
                          style={{ width: `${selectedTransaction.risk_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation - Expandable */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowExplanation(showExplanation === selectedTransaction.id ? null : selectedTransaction.id)}
                      className="flex items-center gap-2 text-sm font-medium text-intelligence hover:text-intelligence/80 transition-colors"
                    >
                      <Brain className="h-4 w-4" />
                      {showExplanation === selectedTransaction.id ? 'Hide' : 'Show'} AI Explanation
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform",
                        showExplanation === selectedTransaction.id && "rotate-90"
                      )} />
                    </button>
                    
                    {showExplanation === selectedTransaction.id && (
                      <div className="p-4 rounded-xl bg-intelligence/5 border border-intelligence/20 space-y-3 animate-scale-in">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-intelligence mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-intelligence">Why this was flagged:</p>
                            <ul className="mt-2 space-y-2">
                              {selectedTransaction.ai_metadata.risk_reasons.map((reason, i) => (
                                <li key={i} className="text-sm flex items-start gap-2">
                                  <span className="text-intelligence">•</span>
                                  <span>{reason}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-intelligence/10">
                          <p className="text-sm">
                            <span className="font-medium text-intelligence">Suggested action:</span>{' '}
                            {selectedTransaction.ai_metadata.suggested_action}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Flags */}
                  {selectedTransaction.flags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedTransaction.flags.map((flag, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="bg-amber-500/10 text-amber-600 border-amber-500/20"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Human Impact Indicator */}
                  {selectedTransaction.human_impact === 'high' && (
                    <div className="p-3 rounded-xl bg-human/5 border border-human/20 flex items-start gap-3">
                      <Heart className="h-5 w-5 text-human flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-human">High Member Impact</p>
                        <p className="text-xs text-muted-foreground">
                          This decision will significantly affect the member. Consider reaching out before rejecting.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(selectedTransaction.id)}
                      className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-600"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeferModal(true)}
                      className="flex-1 gap-2 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                    >
                      <Calendar className="h-4 w-4" />
                      Defer
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setShowRejectModal(true)}
                      className="flex-1 gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Info className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Select a transaction to view AI analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Defer Modal */}
        <Dialog open={showDeferModal} onOpenChange={setShowDeferModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                Defer Transaction
              </DialogTitle>
              <DialogDescription>
                Add a note and set a reminder to review this later
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Reason for deferring</Label>
                <Textarea
                  placeholder="e.g., Waiting for additional documentation..."
                  value={deferNote}
                  onChange={(e) => setDeferNote(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Remind me in (hours)</Label>
                <Input
                  type="number"
                  min={1}
                  max={72}
                  value={deferHours}
                  onChange={(e) => setDeferHours(parseInt(e.target.value) || 2)}
                />
                <p className="text-xs text-muted-foreground">
                  You'll be reminded at {format(addHours(new Date(), deferHours), 'PPp')}
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeferModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleDefer} disabled={!deferNote}>
                <Calendar className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Modal */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Reject Transaction
              </DialogTitle>
              <DialogDescription>
                Please provide a reason for rejection
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Textarea
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectReason}>
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
