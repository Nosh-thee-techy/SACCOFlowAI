import { useFraudStore } from '@/lib/store';
import { VolumeChart, HourlyChart, TrendChart } from '@/components/dashboard/Charts';
import { MemberRiskTable } from '@/components/dashboard/MemberRiskTable';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { InteractiveMemberChart } from '@/components/charts/InteractiveMemberChart';
import { generateVolumeChartData, generateHourlyData, generateMonthlyTrend, generateHeatmapData } from '@/lib/mockData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
} from 'recharts';

export default function Analytics() {
  const { alerts, memberProfiles } = useFraudStore();
  
  const volumeData = generateVolumeChartData();
  const hourlyData = generateHourlyData();
  const trendData = generateMonthlyTrend();
  const heatmapData = generateHeatmapData();
  
  // Alert type distribution with friendly names
  const alertTypeData = [
    { 
      name: 'Policy Checks', 
      description: 'Transactions that broke our safety rules',
      value: alerts.filter(a => a.type === 'rule').length, 
      color: 'hsl(var(--chart-1))' 
    },
    { 
      name: 'Unusual Patterns', 
      description: 'Activity that looks different from normal',
      value: alerts.filter(a => a.type === 'anomaly').length, 
      color: 'hsl(var(--chart-2))' 
    },
    { 
      name: 'Behavior Changes', 
      description: 'Members acting differently than usual',
      value: alerts.filter(a => a.type === 'behavioral').length, 
      color: 'hsl(var(--chart-3))' 
    },
  ];
  
  // Severity distribution with friendly names
  const severityData = [
    { 
      name: 'Urgent', 
      description: 'Needs immediate attention',
      value: alerts.filter(a => a.severity === 'critical').length, 
      color: 'hsl(var(--destructive))' 
    },
    { 
      name: 'Important', 
      description: 'Review within 24 hours',
      value: alerts.filter(a => a.severity === 'high').length, 
      color: 'hsl(var(--warning))' 
    },
    { 
      name: 'Moderate', 
      description: 'Check when you have time',
      value: alerts.filter(a => a.severity === 'medium').length, 
      color: 'hsl(var(--chart-5))' 
    },
    { 
      name: 'Low Priority', 
      description: 'For your information',
      value: alerts.filter(a => a.severity === 'low').length, 
      color: 'hsl(var(--muted-foreground))' 
    },
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
          Activity Insights
        </h1>
        <p className="text-muted-foreground">
          See how your members are using their accounts and spot any concerns
        </p>
      </div>

      {/* Alert Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How We Found Issues</CardTitle>
            <CardDescription>
              The different ways our system detected potential problems
            </CardDescription>
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
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
                          <p className="font-semibold">{d.name}</p>
                          <p className="text-sm text-muted-foreground">{d.description}</p>
                          <p className="text-lg font-bold mt-1">{d.value} issues found</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {alertTypeData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}:</span>
                  <span className="text-muted-foreground">{item.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Levels</CardTitle>
            <CardDescription>
              How urgent are the issues we've found?
            </CardDescription>
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
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg max-w-xs">
                          <p className="font-semibold">{d.name}</p>
                          <p className="text-sm text-muted-foreground">{d.description}</p>
                          <p className="text-lg font-bold mt-1">{d.value} issues</p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {severityData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}:</span>
                  <span className="text-muted-foreground">{item.description}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Heatmap */}
      <ActivityHeatmap data={heatmapData} />
      
      {/* Interactive Member Chart */}
      <InteractiveMemberChart data={memberBehaviorData} />

      {/* Volume and Trends with simplified titles */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Weekly Activity</CardTitle>
            <CardDescription>
              How many transactions and issues we saw each day this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VolumeChart data={volumeData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Busiest Hours</CardTitle>
            <CardDescription>
              When members are most active during the day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HourlyChart data={hourlyData} />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Trends</CardTitle>
            <CardDescription>
              How activity and issues have changed over the past months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={trendData} />
          </CardContent>
        </Card>
        <MemberRiskTable profiles={memberProfiles} />
      </div>
    </div>
  );
}
