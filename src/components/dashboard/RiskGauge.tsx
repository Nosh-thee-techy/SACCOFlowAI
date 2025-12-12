import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFraudStore } from '@/lib/store';
import { cn } from '@/lib/utils';

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
  const maxExpectedScore = 50; // Adjust based on typical alert volumes
  const riskIndex = Math.min(100, Math.round((weightedScore / maxExpectedScore) * 100));
  
  const getRiskLevel = (index: number) => {
    if (index >= 75) return { label: 'Critical', color: 'text-destructive' };
    if (index >= 50) return { label: 'High', color: 'text-warning' };
    if (index >= 25) return { label: 'Moderate', color: 'text-chart-5' };
    return { label: 'Low', color: 'text-success' };
  };
  
  const risk = getRiskLevel(riskIndex);
  
  // SVG gauge path
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * Math.PI; // Half circle
  const strokeDashoffset = circumference - (riskIndex / 100) * circumference;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Overall Fraud Risk</CardTitle>
        <CardDescription>Real-time risk assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative">
            <svg height={radius + 10} width={radius * 2 + 20} className="transform -rotate-180">
              {/* Background arc */}
              <circle
                stroke="hsl(var(--muted))"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius + 10}
                cy={radius}
                strokeDasharray={`${circumference} ${circumference}`}
              />
              {/* Foreground arc */}
              <circle
                stroke={riskIndex >= 75 ? 'hsl(var(--destructive))' : 
                        riskIndex >= 50 ? 'hsl(var(--warning))' : 
                        riskIndex >= 25 ? 'hsl(var(--chart-5))' : 
                        'hsl(var(--success))'}
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius + 10}
                cy={radius}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <div className="text-center">
                <span className={cn("text-4xl font-bold", risk.color)}>{riskIndex}</span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
          </div>
          <div className={cn("mt-2 text-lg font-semibold", risk.color)}>
            {risk.label} Risk
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 w-full text-center text-sm">
            <div>
              <div className="text-destructive font-bold">{criticalCount}</div>
              <div className="text-muted-foreground text-xs">Critical</div>
            </div>
            <div>
              <div className="text-warning font-bold">{highCount}</div>
              <div className="text-muted-foreground text-xs">High</div>
            </div>
            <div>
              <div className="text-chart-5 font-bold">{mediumCount}</div>
              <div className="text-muted-foreground text-xs">Medium</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
