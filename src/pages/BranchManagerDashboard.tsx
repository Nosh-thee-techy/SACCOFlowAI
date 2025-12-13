import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, TrendingUp, AlertTriangle, Clock, CheckCircle2,
  Shield, Eye, ChevronRight, Activity, BarChart3, 
  UserCheck, XCircle, Calendar, Brain, Sparkles,
  ArrowUpRight, ArrowDownRight, Lightbulb, MessageSquare
} from 'lucide-react';
import { useFraudStore } from '@/lib/store';
import { format, startOfWeek, subDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

interface TellerActivity {
  name: string;
  transactions: number;
  approved: number;
  flagged: number;
  lastActive: Date;
  riskScore: number;
}

export default function BranchManagerDashboard() {
  const { transactions, alerts } = useFraudStore();
  const [animatedValues, setAnimatedValues] = useState({
    volume: 0,
    pending: 0,
    highRisk: 0,
    offHours: 0,
    avgRisk: 0
  });

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
    ? Math.round((transactions.reduce((sum, t) => sum + ((t as any).risk_score || 0), 0) / transactions.length) * 100)
    : 0;

  // Off-hours activity calculation
  const offHoursTransactions = todayTransactions.filter(t => {
    const hour = t.timestamp.getHours();
    return hour < 8 || hour > 18;
  });

  // Animate values on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        volume: totalVolume,
        pending: pendingCount,
        highRisk: highRiskCount,
        offHours: offHoursTransactions.length,
        avgRisk: avgRiskScore
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [totalVolume, pendingCount, highRiskCount, offHoursTransactions.length, avgRiskScore]);

  // Simulated teller activity data with risk scores
  const tellerActivity: TellerActivity[] = [
    { name: 'John Kamau', transactions: 24, approved: 22, flagged: 2, lastActive: new Date(), riskScore: 15 },
    { name: 'Mary Wanjiku', transactions: 18, approved: 17, flagged: 1, lastActive: subDays(new Date(), 0), riskScore: 8 },
    { name: 'Peter Ochieng', transactions: 31, approved: 28, flagged: 3, lastActive: new Date(), riskScore: 28 },
    { name: 'Sarah Mwangi', transactions: 15, approved: 15, flagged: 0, lastActive: subDays(new Date(), 1), riskScore: 3 },
  ];

  // Hourly distribution for heatmap
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: todayTransactions.filter(t => t.timestamp.getHours() === hour).length,
    name: `${hour}:00`
  }));

  // Weekly trend data
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dayTransactions = transactions.filter(
      t => t.timestamp.toDateString() === date.toDateString()
    );
    return {
      day: format(date, 'EEE'),
      transactions: dayTransactions.length,
      alerts: alerts.filter(a => 
        new Date(a.timestamp).toDateString() === date.toDateString()
      ).length,
      volume: dayTransactions.reduce((sum, t) => sum + t.amount, 0) / 1000
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getRiskColor = (score: number) => {
    if (score < 20) return 'text-emerald-500';
    if (score < 50) return 'text-amber-500';
    return 'text-destructive';
  };

  const getRiskBg = (score: number) => {
    if (score < 20) return 'bg-emerald-500/10';
    if (score < 50) return 'bg-amber-500/10';
    return 'bg-destructive/10';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-intelligence/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header with Intelligence Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl bg-gradient-to-r from-primary via-intelligence to-primary bg-clip-text text-transparent">
              Branch Overview
            </h1>
            <Badge className="bg-intelligence/10 text-intelligence border-intelligence/20 hover-lift">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Monitor your team's activity and make informed approval decisions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 hover-lift border-intelligence/20 text-intelligence hover:bg-intelligence/5">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </Button>
          <Button asChild className="gap-2 hover-lift bg-primary hover:bg-primary/90">
            <Link to="/pending-approvals">
              <Clock className="h-4 w-4" />
              Review Pending ({pendingCount})
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators - Animated Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Today's Volume */}
        <Card variant="stat" className="hover-lift overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Volume</CardTitle>
            <div className="rounded-full bg-primary/10 p-2">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary transition-all duration-1000">
              {formatCurrency(animatedValues.volume)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-500">{todayTransactions.length} transactions</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card variant="stat" className="hover-lift overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Waiting for You</CardTitle>
            <div className="rounded-full bg-amber-500/10 p-2 animate-pulse">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500 transition-all duration-1000">
              {animatedValues.pending}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Transactions need your approval
            </p>
          </CardContent>
        </Card>

        {/* High Risk Items */}
        <Card variant="stat" className="hover-lift overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-intelligence/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">AI Risk Flags</CardTitle>
            <div className="rounded-full bg-intelligence/10 p-2">
              <Brain className="h-4 w-4 text-intelligence" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-intelligence transition-all duration-1000">
              {animatedValues.highRisk}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Patterns detected by AI
            </p>
          </CardContent>
        </Card>

        {/* Average Risk Score */}
        <Card variant="stat" className="hover-lift overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Branch Health</CardTitle>
            <div className="rounded-full bg-emerald-500/10 p-2">
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-emerald-500">{100 - animatedValues.avgRisk}%</div>
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                Healthy
              </Badge>
            </div>
            <Progress 
              value={100 - avgRiskScore} 
              className="h-1.5 mt-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-primary [&>div]:transition-all [&>div]:duration-1000" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend Chart */}
      <Card variant="glass" className="hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Weekly Activity Pattern
              </CardTitle>
              <CardDescription>AI-analyzed transaction trends and alert correlations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-intelligence gap-1">
              <Lightbulb className="h-4 w-4" />
              View AI Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="colorTransactions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--intelligence))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--intelligence))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="transactions" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorTransactions)" 
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="alerts" 
                stroke="hsl(var(--intelligence))" 
                fillOpacity={1} 
                fill="url(#colorAlerts)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-intelligence" />
              <span className="text-sm text-muted-foreground">AI Alerts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teller Activity Table with Risk Indicators */}
        <Card variant="interactive" className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Your Team's Activity
            </CardTitle>
            <CardDescription>AI monitors each teller's behavior patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tellerActivity.map((teller, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-accent/30 hover:border-primary/20 transition-all duration-300 cursor-pointer group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2.5 ${getRiskBg(teller.riskScore)} transition-colors`}>
                      <UserCheck className={`h-4 w-4 ${getRiskColor(teller.riskScore)}`} />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">{teller.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {teller.transactions} entries today
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Risk Score Indicator */}
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={teller.riskScore} 
                          className={`w-16 h-1.5 bg-muted ${teller.riskScore < 20 ? '[&>div]:bg-emerald-500' : teller.riskScore < 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-destructive'}`}
                        />
                        <span className={`text-xs font-medium ${getRiskColor(teller.riskScore)}`}>
                          {teller.riskScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <span className="flex items-center gap-0.5 text-emerald-500">
                          <CheckCircle2 className="h-3 w-3" />
                          {teller.approved}
                        </span>
                        {teller.flagged > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <AlertTriangle className="h-3 w-3" />
                            {teller.flagged}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hourly Activity Chart */}
        <Card variant="interactive" className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-intelligence" />
              Today's Activity by Hour
            </CardTitle>
            <CardDescription>AI detects unusual timing patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={hourlyData.slice(6, 22)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="hour" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  tickFormatter={(h) => `${h}h`}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} transactions`, 'Count']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {hourlyData.slice(6, 22).map((entry, index) => {
                    const isOffHours = entry.hour < 8 || entry.hour > 18;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isOffHours ? 'hsl(var(--intelligence))' : 'hsl(var(--primary))'} 
                        opacity={entry.count === 0 ? 0.2 : 0.8}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            
            {/* Off-hours warning with AI explanation */}
            {offHoursTransactions.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-intelligence/5 border border-intelligence/20">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-intelligence/10 p-2 mt-0.5">
                    <Brain className="h-4 w-4 text-intelligence" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-intelligence">
                      AI detected {offHoursTransactions.length} off-hours transactions
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      These transactions occurred outside normal business hours (8am-6pm). 
                      This could be legitimate overtime or worth investigating.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts with AI Explanations */}
      <Card variant="glass" className="hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-intelligence" />
                AI-Detected Patterns
              </CardTitle>
              <CardDescription>Intelligent alerts with clear explanations</CardDescription>
            </div>
            <Button variant="outline" asChild className="hover-lift">
              <Link to="/alerts" className="gap-2">
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            {alerts.filter(a => !a.reviewed).length === 0 ? (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="font-semibold text-lg mb-1">All Clear!</h3>
                <p className="text-muted-foreground">
                  No pending alerts. Your branch is running smoothly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.filter(a => !a.reviewed).slice(0, 5).map((alert, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-accent/30 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-full p-2.5 shrink-0 ${
                          alert.severity === 'critical' ? 'bg-destructive/10' :
                          alert.severity === 'high' ? 'bg-intelligence/10' : 'bg-amber-500/10'
                        }`}>
                          <AlertTriangle className={`h-4 w-4 ${
                            alert.severity === 'critical' ? 'text-destructive' :
                            alert.severity === 'high' ? 'text-intelligence' : 'text-amber-500'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs bg-intelligence/5 text-intelligence border-intelligence/20">
                              {alert.type}
                            </Badge>
                            <Badge variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'default' : 'secondary'
                            } className="text-xs">
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{alert.reason}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Member: {alert.member_id} • {format(alert.timestamp, 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-intelligence"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Explain
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Manager Responsibilities Card */}
      <Card className="bg-gradient-to-br from-primary/5 via-background to-intelligence/5 border-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-gradient-to-br from-primary to-intelligence p-3 shadow-glow-sm">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Your Responsibilities as Branch Manager</h4>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    You cannot approve transactions you created (security rule)
                  </span>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                  <Brain className="h-4 w-4 text-intelligence mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    AI monitors bulk approvals and unusual patterns
                  </span>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                  <Eye className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    All your actions are logged for audit compliance
                  </span>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border/50">
                  <MessageSquare className="h-4 w-4 text-human mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    Anonymous reports may need your review
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
