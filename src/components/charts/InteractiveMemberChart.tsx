import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle } from 'lucide-react';

interface MemberData {
  member: string;
  transactions: number;
  riskScore: number;
  avgAmount: number;
}

interface InteractiveMemberChartProps {
  data: MemberData[];
}

export function InteractiveMemberChart({ data }: InteractiveMemberChartProps) {
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);

  const handleBarClick = (data: MemberData) => {
    setSelectedMember(data);
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'hsl(var(--destructive))';
    if (score >= 40) return 'hsl(var(--warning))';
    return 'hsl(var(--success))';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 70) return { text: 'High Risk', variant: 'destructive' as const };
    if (score >= 40) return { text: 'Medium Risk', variant: 'warning' as const };
    return { text: 'Low Risk', variant: 'success' as const };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Member Activity Overview</CardTitle>
          <CardDescription>
            Click on any member to see detailed information about their activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                onClick={(e) => e?.activePayload && handleBarClick(e.activePayload[0].payload)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="member"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as MemberData;
                    return (
                      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold mb-2">Member: {d.member}</p>
                        <p className="text-sm text-muted-foreground">Click to view details</p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="riskScore"
                  name="Safety Score"
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getRiskColor(entry.riskScore)}
                      className="transition-all duration-200 hover:opacity-80"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            🟢 Low Risk &nbsp;&nbsp; 🟡 Medium Risk &nbsp;&nbsp; 🔴 High Risk
          </p>
        </CardContent>
      </Card>

      {/* Member Details Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">
                  {selectedMember?.member.charAt(0)}
                </span>
              </div>
              Member {selectedMember?.member}
            </DialogTitle>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-4 mt-4">
              {/* Risk Badge */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Safety Status</span>
                <Badge variant={getRiskLabel(selectedMember.riskScore).variant}>
                  {getRiskLabel(selectedMember.riskScore).text}
                </Badge>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs">Total Activity</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedMember.transactions}</p>
                  <p className="text-xs text-muted-foreground">transactions</p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs">Average Amount</span>
                  </div>
                  <p className="text-2xl font-bold">KES {selectedMember.avgAmount}K</p>
                  <p className="text-xs text-muted-foreground">per transaction</p>
                </div>

                <div className="col-span-2 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">Safety Score</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${selectedMember.riskScore}%`,
                          backgroundColor: getRiskColor(selectedMember.riskScore),
                        }}
                      />
                    </div>
                    <span className="font-bold">{selectedMember.riskScore}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedMember.riskScore >= 70
                      ? "This member's activity needs immediate review."
                      : selectedMember.riskScore >= 40
                      ? "This member shows some unusual patterns."
                      : "This member's activity looks normal."}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  View Full History
                </button>
                <button className="flex-1 py-2 px-4 rounded-lg bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
                  Create Alert
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
