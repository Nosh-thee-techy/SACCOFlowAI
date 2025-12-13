import { useFraudStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ShieldAlert, TrendingDown, TrendingUp, Minus } from 'lucide-react';

export function RiskGauge() {
  const { stats, alerts } = useFraudStore();
  
  // Calculate overall fraud risk index (0-100)
  const criticalWeight = 4;
  const highWeight = 2;
  const mediumWeight = 1;
  
  const criticalCount = alerts.filter(a => a.severity === 'critical' && !a.reviewed).length;
  const highCount = alerts.filter(a => a.severity === 'high' && !a.reviewed).length;
  const mediumCount = alerts.filter(a => a.severity === 'medium' && !a.reviewed).length;
  
  const weightedScore = (criticalCount * criticalWeight + highCount * highWeight + mediumCount * mediumWeight);
  const maxExpectedScore = 50;
  const riskIndex = Math.min(100, Math.round((weightedScore / maxExpectedScore) * 100));
  
  const getRiskLevel = (index: number) => {
    if (index >= 75) return { 
      label: 'Critical', 
      color: 'text-destructive', 
      bg: 'bg-destructive',
      glow: 'shadow-[0_0_30px_hsl(0_72%_51%/0.3)]',
      icon: TrendingUp,
      message: 'Immediate attention required'
    };
    if (index >= 50) return { 
      label: 'High', 
      color: 'text-warning', 
      bg: 'bg-warning',
      glow: 'shadow-[0_0_30px_hsl(38_92%_50%/0.3)]',
      icon: TrendingUp,
      message: 'Review pending alerts soon'
    };
    if (index >= 25) return { 
      label: 'Moderate', 
      color: 'text-intelligence', 
      bg: 'bg-intelligence',
      glow: 'shadow-glow-intelligence',
      icon: Minus,
      message: 'Monitoring in progress'
    };
    return { 
      label: 'Low', 
      color: 'text-success', 
      bg: 'bg-success',
      glow: 'shadow-[0_0_30px_hsl(142_71%_45%/0.3)]',
      icon: TrendingDown,
      message: 'All systems normal'
    };
  };
  
  const risk = getRiskLevel(riskIndex);
  const RiskIcon = risk.icon;
  
  // SVG gauge path
  const radius = 85;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * Math.PI;
  const strokeDashoffset = circumference - (riskIndex / 100) * circumference;
  
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-lifted">
      {/* Background glow effect */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
        riskIndex >= 75 ? "bg-gradient-to-br from-destructive/5 to-transparent" :
        riskIndex >= 50 ? "bg-gradient-to-br from-warning/5 to-transparent" :
        riskIndex >= 25 ? "bg-gradient-to-br from-intelligence/5 to-transparent" :
        "bg-gradient-to-br from-success/5 to-transparent"
      )} />
      
      <div className="relative">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-lg font-semibold">Overall Fraud Risk</h3>
            <p className="text-sm text-muted-foreground">Real-time AI assessment</p>
          </div>
          <div className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            riskIndex >= 50 ? "bg-destructive/10 text-destructive" : "bg-intelligence/10 text-intelligence"
          )}>
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg height={radius + 20} width={radius * 2 + 20} className="transform -rotate-180">
              {/* Background arc */}
              <circle
                stroke="hsl(var(--muted))"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius + 10}
                cy={radius + 5}
                strokeDasharray={`${circumference} ${circumference}`}
              />
              {/* Animated foreground arc */}
              <circle
                stroke={riskIndex >= 75 ? 'hsl(var(--destructive))' : 
                        riskIndex >= 50 ? 'hsl(var(--warning))' : 
                        riskIndex >= 25 ? 'hsl(var(--intelligence))' : 
                        'hsl(var(--success))'}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius + 10}
                cy={radius + 5}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: riskIndex >= 50 ? `drop-shadow(0 0 8px ${riskIndex >= 75 ? 'hsl(0 72% 51% / 0.5)' : 'hsl(38 92% 50% / 0.5)'})` : undefined
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-4">
              <div className="text-center">
                <span className={cn("text-5xl font-bold tabular-nums transition-colors duration-500", risk.color)}>
                  {riskIndex}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
          </div>
          
          <div className={cn("mt-1 flex items-center gap-2 text-lg font-semibold", risk.color)}>
            <RiskIcon className="h-5 w-5" />
            {risk.label} Risk
          </div>
          
          <p className="mt-1 text-sm text-muted-foreground text-center">
            {risk.message}
          </p>
          
          {/* Alert breakdown */}
          <div className="mt-6 grid grid-cols-3 gap-4 w-full">
            <div className="text-center p-3 rounded-lg bg-destructive/5 border border-destructive/10 transition-all duration-200 hover:bg-destructive/10">
              <div className="text-xl font-bold text-destructive">{criticalCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Critical</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-warning/5 border border-warning/10 transition-all duration-200 hover:bg-warning/10">
              <div className="text-xl font-bold text-warning">{highCount}</div>
              <div className="text-xs text-muted-foreground font-medium">High</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-intelligence/5 border border-intelligence/10 transition-all duration-200 hover:bg-intelligence/10">
              <div className="text-xl font-bold text-intelligence">{mediumCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Medium</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
