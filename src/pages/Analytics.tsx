import { useFraudStore } from '@/lib/store';
import { VolumeChart, HourlyChart, TrendChart } from '@/components/dashboard/Charts';
import { MemberRiskTable } from '@/components/dashboard/MemberRiskTable';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { generateVolumeChartData, generateHourlyData, generateMonthlyTrend, generateHeatmapData } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

export default function Analytics() {
  const { stats, alerts, memberProfiles, transactions } = useFraudStore();
  
  const volumeData = generateVolumeChartData();
  const hourlyData = generateHourlyData();
  const trendData = generateMonthlyTrend();
  const heatmapData = generateHeatmapData();
  
  // Alert type distribution
  const alertTypeData = [
    { name: 'Rule-Based', value: alerts.filter(a => a.type === 'rule').length, color: 'hsl(var(--chart-1))' },
    { name: 'Anomaly', value: alerts.filter(a => a.type === 'anomaly').length, color: 'hsl(var(--chart-2))' },
    { name: 'Behavioral', value: alerts.filter(a => a.type === 'behavioral').length, color: 'hsl(var(--chart-3))' },
  ];
  
  // Severity distribution
  const severityData = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length, color: 'hsl(var(--destructive))' },
    { name: 'High', value: alerts.filter(a => a.severity === 'high').length, color: 'hsl(var(--warning))' },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'medium').length, color: 'hsl(var(--chart-5))' },
    { name: 'Low', value: alerts.filter(a => a.severity === 'low').length, color: 'hsl(var(--muted-foreground))' },
  ];
  
  // Member behavior analysis
  const memberBehaviorData = memberProfiles.map(p => ({
    member: p.member_id,
    transactions: p.transaction_count,
    riskScore: Math.round(p.risk_score * 100),
    avgAmount: Math.round(p.avg_transaction_amount / 1000),
  })).sort((a, b) => b.riskScore - a.riskScore).slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Deep dive into transaction patterns and behavioral analytics
        </p>
      </div>

      {/* Alert Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alert Type Distribution</CardTitle>
            <CardDescription>Breakdown by detection method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {alertTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Severity Distribution</CardTitle>
            <CardDescription>Alerts by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Heatmap */}
      <ActivityHeatmap data={heatmapData} />
      
      {/* Member Behavior Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Member Behavior Analysis</CardTitle>
          <CardDescription>Top 10 members by risk score with transaction patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberBehaviorData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="member" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="riskScore" name="Risk Score %" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="transactions" name="Transactions" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="avgAmount" name="Avg Amount (K)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Volume and Trends */}
      <div className="grid gap-6 lg:grid-cols-3">
        <VolumeChart data={volumeData} />
        <HourlyChart data={hourlyData} />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart data={trendData} />
        <MemberRiskTable profiles={memberProfiles} />
      </div>
    </div>
  );
}
