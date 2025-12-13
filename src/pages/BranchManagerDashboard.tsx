import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, TrendingUp, AlertTriangle, Clock, CheckCircle2,
  Shield, Eye, ChevronRight, Activity, BarChart3, 
  UserCheck, XCircle, Calendar
} from 'lucide-react';
import { useFraudStore } from '@/lib/store';
import { format, startOfWeek, eachDayOfInterval, getHours, subDays } from 'date-fns';
import { Link } from 'react-router-dom';

interface TellerActivity {
  name: string;
  transactions: number;
  approved: number;
  flagged: number;
  lastActive: Date;
}

export default function BranchManagerDashboard() {
  const { transactions, alerts } = useFraudStore();

  // Calculate KPIs
  const today = new Date();
  const todayTransactions = transactions.filter(
    t => t.timestamp.toDateString() === today.toDateString()
  );
  
  const weekStart = startOfWeek(today);
  const weekTransactions = transactions.filter(
    t => t.timestamp >= weekStart
  );

  const pendingCount = transactions.filter(t => (t as any).status === 'pending').length;
  const highRiskCount = alerts.filter(a => 
    (a.severity === 'critical' || a.severity === 'high') && !a.reviewed
  ).length;

  const totalVolume = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
  const avgRiskScore = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + ((t as any).risk_score || 0), 0) / transactions.length
    : 0;

  // Off-hours activity calculation
  const offHoursTransactions = todayTransactions.filter(t => {
    const hour = t.timestamp.getHours();
    return hour < 8 || hour > 18;
  });

  // Simulated teller activity data
  const tellerActivity: TellerActivity[] = [
    { name: 'John Kamau', transactions: 24, approved: 22, flagged: 2, lastActive: new Date() },
    { name: 'Mary Wanjiku', transactions: 18, approved: 17, flagged: 1, lastActive: subDays(new Date(), 0) },
    { name: 'Peter Ochieng', transactions: 31, approved: 28, flagged: 3, lastActive: new Date() },
    { name: 'Sarah Mwangi', transactions: 15, approved: 15, flagged: 0, lastActive: subDays(new Date(), 1) },
  ];

  // Hourly distribution for heatmap
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: todayTransactions.filter(t => t.timestamp.getHours() === hour).length
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Branch Overview</h1>
          <p className="text-muted-foreground">
            Monitor your team's activity and approve transactions
          </p>
        </div>
        <Button asChild>
          <Link to="/pending-approvals" className="gap-2">
            <Clock className="h-4 w-4" />
            Review Pending ({pendingCount})
          </Link>
        </Button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVolume)}</div>
            <p className="text-xs text-muted-foreground">
              {todayTransactions.length} transactions processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting for You</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Transactions need your approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{highRiskCount}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Off-Hours Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offHoursTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Transactions outside 8am-6pm
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teller Activity Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Team's Activity
            </CardTitle>
            <CardDescription>Monitor teller performance today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tellerActivity.map((teller, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{teller.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {teller.transactions} entries today
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="h-3 w-3" />
                        {teller.approved}
                      </div>
                      {teller.flagged > 0 && (
                        <div className="flex items-center gap-1 text-amber-500">
                          <AlertTriangle className="h-3 w-3" />
                          {teller.flagged}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Activity Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Today's Activity by Hour
            </CardTitle>
            <CardDescription>See when transactions happen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-12 gap-1">
              {hourlyData.slice(6, 22).map((data) => {
                const intensity = data.count > 0 
                  ? Math.min(1, data.count / 10) 
                  : 0;
                const bgColor = intensity === 0 
                  ? 'bg-muted' 
                  : `bg-primary`;
                
                return (
                  <div
                    key={data.hour}
                    className={`aspect-square rounded ${bgColor} flex items-center justify-center text-xs transition-colors hover:ring-2 hover:ring-primary cursor-default`}
                    style={{ opacity: intensity === 0 ? 0.3 : 0.3 + intensity * 0.7 }}
                    title={`${data.hour}:00 - ${data.count} transactions`}
                  >
                    {data.count > 0 && (
                      <span className="text-primary-foreground font-medium">{data.count}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>6am</span>
              <span>12pm</span>
              <span>9pm</span>
            </div>
            
            {/* Off-hours warning */}
            {offHoursTransactions.length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {offHoursTransactions.length} transactions outside business hours
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Recent Alerts
              </CardTitle>
              <CardDescription>Security concerns that need attention</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link to="/alerts">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {alerts.filter(a => !a.reviewed).length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <p>All clear! No pending alerts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.filter(a => !a.reviewed).slice(0, 5).map((alert, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-full p-2 ${
                        alert.severity === 'critical' ? 'bg-destructive/10' :
                        alert.severity === 'high' ? 'bg-amber-500/10' : 'bg-muted'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'critical' ? 'text-destructive' :
                          alert.severity === 'high' ? 'text-amber-500' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{alert.reason}</p>
                        <p className="text-sm text-muted-foreground">{alert.reason}</p>
                      </div>
                    </div>
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'high' ? 'default' : 'secondary'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Manager Notes */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold">Your Responsibilities</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You cannot approve transactions you created (security rule)</li>
                <li>• Bulk approvals in short time are monitored</li>
                <li>• Your approval actions are logged permanently</li>
                <li>• Whistleblower reports may need your review</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
