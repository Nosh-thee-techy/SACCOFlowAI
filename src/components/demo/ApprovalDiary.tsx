import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, Clock, AlertTriangle, Brain, 
  FileText, ChevronRight, Bell, Sparkles
} from 'lucide-react';
import { useDemoMode } from './DemoModeProvider';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

export function ApprovalDiary() {
  const { deferredTransactions, approveTransaction, rejectTransaction } = useDemoMode();
  const [selectedDeferred, setSelectedDeferred] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const selected = deferredTransactions.find(d => d.id === selectedDeferred);

  const groupedByDate = deferredTransactions.reduce((acc, dt) => {
    const dateKey = format(dt.reminder_time, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(dt);
    return acc;
  }, {} as Record<string, typeof deferredTransactions>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return '📅 Today';
    if (isTomorrow(date)) return '📆 Tomorrow';
    return format(date, 'EEEE, MMM d');
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-destructive';
    if (score >= 40) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenDetail = (id: string) => {
    setSelectedDeferred(id);
    setShowDetailModal(true);
  };

  return (
    <>
      <Card className="hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                Approval Diary
              </CardTitle>
              <CardDescription>
                {deferredTransactions.length} deferred items awaiting follow-up
              </CardDescription>
            </div>
            {deferredTransactions.length > 0 && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                <Bell className="h-3 w-3 mr-1" />
                {deferredTransactions.filter(d => isPast(d.reminder_time)).length} overdue
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {deferredTransactions.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="font-medium text-muted-foreground">No deferred items</p>
              <p className="text-sm text-muted-foreground">
                Defer a transaction to add it to your diary
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-6">
                {Object.entries(groupedByDate)
                  .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                  .map(([dateKey, items]) => (
                    <div key={dateKey} className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background py-1">
                        {formatDateHeader(dateKey)}
                      </h3>
                      
                      {items.map((dt, index) => (
                        <button
                          key={dt.id}
                          onClick={() => handleOpenDetail(dt.id)}
                          className={cn(
                            "w-full p-4 rounded-xl border text-left transition-all duration-300 hover:shadow-md group animate-slide-up",
                            isPast(dt.reminder_time) 
                              ? 'border-amber-500/50 bg-amber-500/5' 
                              : 'border-border/50 hover:border-primary/30'
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{dt.member_id}</span>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {dt.transaction_type}
                                </Badge>
                                {isPast(dt.reminder_time) && (
                                  <Badge className="bg-amber-500 text-white text-xs">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm font-semibold">{formatCurrency(dt.amount)}</p>
                              
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                📝 {dt.note}
                              </p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(dt.reminder_time, 'h:mm a')}
                              </div>
                              
                              <Progress 
                                value={dt.risk_score} 
                                className={cn(
                                  "w-12 h-1.5",
                                  dt.risk_score >= 70 ? '[&>div]:bg-destructive' : 
                                  dt.risk_score >= 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'
                                )}
                              />
                              
                              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Deferred Transaction
            </DialogTitle>
            <DialogDescription>
              Review and take action on this deferred item
            </DialogDescription>
          </DialogHeader>
          
          {selected && (
            <div className="space-y-6 py-4">
              {/* Transaction Info */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-sm">{selected.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member</span>
                  <span className="font-medium">{selected.member_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold">{formatCurrency(selected.amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Risk Score</span>
                  <span className={cn("font-medium", getRiskColor(selected.risk_score))}>
                    {selected.risk_score}%
                  </span>
                </div>
              </div>

              {/* Your Note */}
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <p className="text-sm font-medium text-amber-600 mb-1">📝 Your Note</p>
                <p className="text-sm">{selected.note}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Deferred on {format(selected.deferred_at, 'PPp')}
                </p>
              </div>

              {/* AI Context */}
              {selected.ai_explanation && (
                <div className="p-4 rounded-xl bg-intelligence/5 border border-intelligence/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-intelligence" />
                    <p className="text-sm font-medium text-intelligence">AI Context</p>
                  </div>
                  <p className="text-sm">{selected.ai_explanation}</p>
                </div>
              )}

              {/* Flags */}
              {selected.flags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.flags.map((flag, i) => (
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

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    approveTransaction(selected.id);
                    setShowDetailModal(false);
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  Approve Now
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    rejectTransaction(selected.id, 'Rejected after review');
                    setShowDetailModal(false);
                  }}
                  className="flex-1"
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
