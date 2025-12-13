import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionEntryForm } from '@/components/teller/TransactionEntryForm';
import { CSVUpload } from '@/components/teller/CSVUpload';
import { FileText, Upload, Activity } from 'lucide-react';
import { useFraudStore } from '@/lib/store';

const TellerDashboard = () => {
  const { transactions, alerts } = useFraudStore();
  const [activeTab, setActiveTab] = useState('manual');

  const todayTransactions = transactions.filter(
    t => t.timestamp.toDateString() === new Date().toDateString()
  );
  const pendingAlerts = alerts.filter(a => !a.reviewed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teller Dashboard</h1>
        <p className="text-muted-foreground">
          Create transactions, upload CSV files, and monitor risk assessments
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Total volume: KES {todayTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Alerts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingAlerts.filter(a => a.severity === 'critical' || a.severity === 'high').length} high priority
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Submissions</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Transactions submitted today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Upload
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
  );
};

export default TellerDashboard;
