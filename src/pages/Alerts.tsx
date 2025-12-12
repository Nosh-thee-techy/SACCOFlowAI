import { useState, useMemo } from 'react';
import { useFraudStore } from '@/lib/store';
import { Alert } from '@/lib/types';
import { exportAlertsToCSV, exportAlertsToPDF } from '@/lib/exportUtils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertNotificationCard } from '@/components/alerts/AlertNotificationCard';
import { 
  CheckCircle, 
  Search, 
  AlertTriangle, 
  Zap, 
  Clock,
  Filter,
  Shield,
  ShieldAlert,
  Brain,
  FileDown,
  FileText,
  Bell,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Alerts() {
  const { alerts, markAlertReviewed, stats } = useFraudStore();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredAlerts = useMemo(() => {
    let result = [...alerts];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.member_id.toLowerCase().includes(searchLower) ||
          a.transaction_id.toLowerCase().includes(searchLower) ||
          a.reason.toLowerCase().includes(searchLower)
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      result = result.filter((a) => a.severity === severityFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((a) => a.type === typeFilter);
    }

    return result;
  }, [alerts, search, severityFilter, typeFilter]);

  const pendingAlerts = filteredAlerts.filter((a) => !a.reviewed);
  const reviewedAlerts = filteredAlerts.filter((a) => a.reviewed);

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <Zap className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Calculate risk level for overview
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.reviewed).length;
  const highCount = alerts.filter(a => a.severity === 'high' && !a.reviewed).length;

  const riskLevel = criticalCount > 0 
    ? 'critical' 
    : highCount > 2 
      ? 'high' 
      : highCount > 0 
        ? 'medium' 
        : 'low';

  return (
    <div className="space-y-6">
      {/* Header with security branding */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Alert Centre
            </h1>
          </div>
          <p className="text-muted-foreground">
            Review and manage fraud detection alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { exportAlertsToCSV(alerts); toast.success('Exported to CSV'); }}>
            <FileDown className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => { exportAlertsToPDF(alerts); toast.success('Exported to PDF'); }}>
            <FileText className="h-4 w-4 mr-1" /> PDF
          </Button>
        </div>
      </div>

      {/* Risk Overview Banner */}
      <Card className={cn(
        "relative overflow-hidden border-2 transition-all duration-300",
        riskLevel === 'critical' && "border-destructive/50 bg-destructive/5",
        riskLevel === 'high' && "border-warning/50 bg-warning/5",
        riskLevel === 'medium' && "border-chart-5/50 bg-chart-5/5",
        riskLevel === 'low' && "border-success/50 bg-success/5"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                riskLevel === 'critical' && "bg-destructive/10 text-destructive",
                riskLevel === 'high' && "bg-warning/10 text-warning",
                riskLevel === 'medium' && "bg-chart-5/10 text-chart-5",
                riskLevel === 'low' && "bg-success/10 text-success"
              )}>
                {riskLevel === 'critical' ? <ShieldAlert className="h-6 w-6" /> :
                 riskLevel === 'high' ? <AlertTriangle className="h-6 w-6" /> :
                 riskLevel === 'low' ? <Shield className="h-6 w-6" /> :
                 <Bell className="h-6 w-6" />}
              </div>
              <div>
                <p className={cn(
                  "text-lg font-semibold capitalize",
                  riskLevel === 'critical' && "text-destructive",
                  riskLevel === 'high' && "text-warning",
                  riskLevel === 'medium' && "text-chart-5",
                  riskLevel === 'low' && "text-success"
                )}>
                  {riskLevel === 'low' ? 'All Clear' : `${riskLevel} Risk Level`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {pendingAlerts.length === 0 
                    ? 'No pending alerts - all transactions normal'
                    : `${pendingAlerts.length} alert${pendingAlerts.length > 1 ? 's' : ''} requiring attention`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {criticalCount > 0 && (
                <div className="flex items-center gap-1 text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-semibold">{criticalCount}</span> critical
                </div>
              )}
              {highCount > 0 && (
                <div className="flex items-center gap-1 text-warning">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-semibold">{highCount}</span> high
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats - Compact summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card variant="stat" className="border-l-4 border-l-destructive">
          <CardContent className="py-4">
            <div className="text-2xl font-bold text-destructive">
              {criticalCount}
            </div>
            <p className="text-sm text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        <Card variant="stat" className="border-l-4 border-l-warning">
          <CardContent className="py-4">
            <div className="text-2xl font-bold text-warning">
              {highCount}
            </div>
            <p className="text-sm text-muted-foreground">High Priority</p>
          </CardContent>
        </Card>
        <Card variant="stat" className="border-l-4 border-l-primary">
          <CardContent className="py-4">
            <div className="text-2xl font-bold">{stats.totalAlerts - stats.reviewedAlerts}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card variant="stat" className="border-l-4 border-l-success">
          <CardContent className="py-4">
            <div className="text-2xl font-bold text-success">{stats.reviewedAlerts}</div>
            <p className="text-sm text-muted-foreground">Reviewed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2 rounded-lg border p-1">
                <Filter className="h-4 w-4 ml-2 text-muted-foreground" />
                {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                  <Button
                    key={sev}
                    variant={severityFilter === sev ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSeverityFilter(sev)}
                    className="capitalize"
                  >
                    {sev}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-1 rounded-lg border p-1">
                {(['all', 'rule', 'anomaly', 'behavioral'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={typeFilter === type ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTypeFilter(type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending ({pendingAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Reviewed ({reviewedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-success mb-4" />
                <h3 className="text-lg font-medium">All Clear</h3>
                <p className="text-muted-foreground">No pending alerts to review</p>
              </CardContent>
            </Card>
          ) : (
            pendingAlerts.map((alert) => (
              <AlertNotificationCard key={alert.id} alert={alert} />
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedAlerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Reviewed Alerts</h3>
                <p className="text-muted-foreground">Reviewed alerts will appear here</p>
              </CardContent>
            </Card>
          ) : (
            reviewedAlerts.map((alert) => (
              <AlertNotificationCard key={alert.id} alert={alert} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
