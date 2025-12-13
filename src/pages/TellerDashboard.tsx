import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TransactionEntryForm } from '@/components/teller/TransactionEntryForm';
import { CSVUpload } from '@/components/teller/CSVUpload';
import { 
  FileText, Upload, Activity, Clock, CheckCircle2, 
  XCircle, AlertTriangle, Eye, TrendingUp
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
  
  const rejectedTransactions = transactions.filter(t => 
    (t as any).status === 'rejected'
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
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Waiting</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Transaction Entry</h1>
        <p className="text-muted-foreground">
          Create transactions, upload files, and track your submissions
        </p>
      </div>

      {/* Quick Stats - Simplified Language */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Entries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(todayTransactions.reduce((sum, t) => sum + t.amount, 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting for Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pendingTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Sent to manager for approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{approvedTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{myAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Need extra attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Entry Forms - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Single Entry
              </TabsTrigger>
              <TabsTrigger value="csv" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <TransactionEntryForm />
            </TabsContent>

            <TabsContent value="csv">
              <CSVUpload />
            </TabsContent>
          </Tabs>
        </div>

        {/* Recent Submissions - Side panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Recent Submissions
            </CardTitle>
            <CardDescription>Track what you've entered today</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              {todayTransactions.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 opacity-50 mb-2" />
                  <p>No entries yet today</p>
                  <p className="text-sm">Start by creating a transaction</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTransactions.slice(0, 15).map((tx, index) => (
                    <div 
                      key={index}
                      className="p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{tx.member_id}</span>
                        {getStatusBadge((tx as any).status || 'pending')}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{tx.transaction_type}</span>
                        <span className="font-semibold">{formatCurrency(tx.amount)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(tx.timestamp, 'h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Important Notes for Tellers */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold">Important Reminders</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Large transactions (over KES 100,000) will need manager approval</li>
                <li>• Transactions outside business hours (8am-6pm) get extra review</li>
                <li>• Always verify member ID before processing</li>
                <li>• Your device location is recorded for security</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TellerDashboard;
