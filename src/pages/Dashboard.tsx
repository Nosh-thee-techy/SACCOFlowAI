import { useEffect } from 'react';
import { useFraudStore } from '@/lib/store';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { VolumeChart, HourlyChart, TrendChart } from '@/components/dashboard/Charts';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { MemberRiskTable } from '@/components/dashboard/MemberRiskTable';
import { generateVolumeChartData, generateHourlyData, generateMonthlyTrend } from '@/lib/mockData';
import { exportDashboardReportPDF } from '@/lib/exportUtils';
import { Loader2, FileDown } from 'lucide-react';
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
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading fraud detection engine...</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Fraud Detection Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring and analysis of SACCO transactions
          </p>
        </div>
        <Button onClick={handleExportReport} variant="outline" className="gap-2 w-fit">
          <FileDown className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <VolumeChart data={volumeData} />
        <HourlyChart data={hourlyData} />
      </div>

      {/* Trend and Risk */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart data={trendData} />
        <MemberRiskTable profiles={memberProfiles} />
      </div>

      {/* Recent Alerts */}
      <RecentAlerts alerts={alerts} />
    </div>
  );
}
