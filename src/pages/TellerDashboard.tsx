import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TransactionEntryForm } from '@/components/teller/TransactionEntryForm';
import { CSVUpload } from '@/components/teller/CSVUpload';
import { 
  FileText, Upload, Activity, Clock, CheckCircle2, 
  AlertTriangle, TrendingUp, Shield, Sparkles
} from 'lucide-react';
import { useFraudStore } from '@/lib/store';
import { format } from 'date-fns';

const TellerDashboard = () => {
  const { transactions, alerts } = useFraudStore();
  const [activeTab, setActiveTab] = useState('manual');

  const todayTransactions = transactions.filter(
    t => t.timestamp.toDateString() === new Date().toDateString()
  );
  
  const pendingTransactions = transactions.filter(t => 
    (t as any).status === 'pending'
  );
  
  const approvedTransactions = transactions.filter(t => 
    (t as any).status === 'approved'
  );

  const myAlerts = alerts.filter(a => 
    todayTransactions.some(t => t.member_id === a.member_id)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 font-medium">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-medium">Waiting</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalAmount = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  const reviewedPercent = todayTransactions.length > 0 
    ? Math.round((approvedTransactions.length / todayTransactions.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/3 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header with Welcome Message */}
      <div className="relative animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
              Transaction Entry
            </h1>
            <p className="text-muted-foreground">
              Create transactions safely. Every entry is protected and monitored.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Calm Blue Theme */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Today's Entries */}
        <Card variant="stat" className="animate-slide-up border-primary/10 hover:border-primary/20 transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Entries</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Activity className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary animate-scale-in">{todayTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {formatCurrency(totalAmount)}
            </p>
            {/* Progress indicator */}
            <div className="mt-3 h-1.5 bg-primary/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(reviewedPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{reviewedPercent}% reviewed</p>
          </CardContent>
        </Card>

        {/* Waiting for Review */}
        <Card variant="stat" className="animate-slide-up border-amber-500/10 hover:border-amber-500/20 transition-all duration-300 group" style={{ animationDelay: '100ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Waiting for Review</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500 animate-scale-in">{pendingTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sent to manager for approval
            </p>
            {pendingTransactions.length > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Being reviewed
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved */}
        <Card variant="stat" className="animate-slide-up border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 group" style={{ animationDelay: '200ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500 animate-scale-in">{approvedTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully processed
            </p>
            {approvedTransactions.length > 0 && (
              <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Great work!
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flagged Items */}
        <Card variant="stat" className="animate-slide-up border-human/10 hover:border-human/20 transition-all duration-300 group" style={{ animationDelay: '300ms' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Flagged Items</CardTitle>
            <div className="p-2 rounded-lg bg-human/10 text-human group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-human animate-scale-in">{myAlerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Members may need extra attention
            </p>
            {myAlerts.length > 0 && (
              <div className="mt-2 text-xs text-human/80">
                Review carefully before proceeding
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Entry Forms - Takes 2 columns */}
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-card border border-border/50 p-1">
              <TabsTrigger 
                value="manual" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <FileText className="h-4 w-4" />
                Single Entry
              </TabsTrigger>
              <TabsTrigger 
                value="csv" 
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <Upload className="h-4 w-4" />
                Upload File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="animate-fade-in">
              <TransactionEntryForm />
            </TabsContent>

            <TabsContent value="csv" className="animate-fade-in">
              <CSVUpload />
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Submissions - Side panel */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '500ms' }}>
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-primary">
              <TrendingUp className="h-5 w-5" />
              Your Recent Submissions
            </CardTitle>
            <CardDescription>Track what you've entered today</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ScrollArea className="h-[500px] pr-4">
              {todayTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-primary/50" />
                  </div>
                  <p className="font-medium text-foreground">No entries yet today</p>
                  <p className="text-sm text-muted-foreground mt-1">Start by creating a transaction</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTransactions.slice(0, 15).map((tx, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-xl border border-border/50 bg-card hover:bg-accent/30 hover:border-primary/20 transition-all duration-300 cursor-pointer group animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {tx.member_id}
                        </span>
                        {getStatusBadge((tx as any).status || 'pending')}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{tx.transaction_type}</span>
                        <span className="font-bold text-foreground">{formatCurrency(tx.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {format(tx.timestamp, 'h:mm a')}
                        </p>
                        {(tx as any).risk_score && (
                          <div className="flex items-center gap-1">
                            <div 
                              className={`h-2 w-2 rounded-full ${
                                (tx as any).risk_score > 0.7 ? 'bg-destructive' : 
                                (tx as any).risk_score > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            />
                            <span className="text-xs text-muted-foreground">
                              Risk: {Math.round((tx as any).risk_score * 100)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Important Notes for Tellers - Calm, Reassuring */}
      <Card variant="glass" className="bg-primary/5 border-primary/10 animate-slide-up" style={{ animationDelay: '600ms' }}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-primary/10 p-3 flex-shrink-0">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">You're Protected</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Our AI monitors every transaction to help you work safely. Here's what to keep in mind:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Large transactions (over KES 100,000) will need manager approval
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Transactions outside business hours (8am-6pm) get extra review
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Always verify member ID before processing
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Your device location is recorded for your security
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TellerDashboard;
