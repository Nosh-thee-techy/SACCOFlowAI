import { useEffect } from 'react';
import { useFraudStore } from '@/lib/store';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { VolumeChart, HourlyChart, TrendChart } from '@/components/dashboard/Charts';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { MemberRiskTable } from '@/components/dashboard/MemberRiskTable';
import { FraudOverviewBanner } from '@/components/dashboard/FraudOverviewBanner';
import { QuickActionsPanel } from '@/components/dashboard/QuickActionsPanel';
import { RiskGauge } from '@/components/dashboard/RiskGauge';
import { generateVolumeChartData, generateHourlyData, generateMonthlyTrend } from '@/lib/mockData';
import { exportDashboardReportPDF } from '@/lib/exportUtils';
import { Loader2, FileDown, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Dashboard() {
  const { stats, alerts, memberProfiles, transactions, isLoading, initialize } = useFraudStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <Loader2 className="h-10 w-10 animate-spin text-primary relative" />
          </div>
          <p className="text-muted-foreground font-medium">
            Preparing your fraud detection dashboard...
          </p>
        </div>
      </div>
    );
  }

  const volumeData = generateVolumeChartData();
  const hourlyData = generateHourlyData();
  const trendData = generateMonthlyTrend();

  const handleExportReport = () => {
    exportDashboardReportPDF(stats, alerts, transactions);
    toast.success('Dashboard report exported to PDF');
  };

  // Calculate risk level based on alerts
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
    <div className="space-y-8">
      {/* Header with gradient accent */}
      <div className="relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 animate-fade-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 via-intelligence/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-human/5 to-transparent rounded-full blur-2xl" />
        
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Fraud Detection Dashboard
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-intelligence" />
                  Real-time AI-powered monitoring for your SACCO
                </p>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleExportReport} 
            variant="outline" 
            className="gap-2 w-fit btn-scale hover:shadow-soft"
          >
            <FileDown className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Fraud Overview Banner - Banking style alert */}
      <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
        <FraudOverviewBanner alerts={alerts} riskLevel={riskLevel} />
      </div>

      {/* Stats Cards */}
      <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
        <StatsCards stats={stats} />
      </div>

      {/* Quick Actions & Risk Gauge */}
      <div className="grid gap-6 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="lg:col-span-2">
          <QuickActionsPanel />
        </div>
        <RiskGauge />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: '250ms' }}>
        <VolumeChart data={volumeData} />
        <HourlyChart data={hourlyData} />
      </div>

      {/* Trend and Risk */}
      <div className="grid gap-6 lg:grid-cols-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <TrendChart data={trendData} />
        <MemberRiskTable profiles={memberProfiles} />
      </div>

      {/* Recent Alerts */}
      <div className="animate-slide-up" style={{ animationDelay: '350ms' }}>
        <RecentAlerts alerts={alerts} />
      </div>
    </div>
  );
}
