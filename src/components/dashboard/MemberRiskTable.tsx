import { MemberProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MemberRiskTableProps {
  profiles: MemberProfile[];
}

export function MemberRiskTable({ profiles }: MemberRiskTableProps) {
  const sortedProfiles = [...profiles].sort((a, b) => b.risk_score - a.risk_score);

  const getRiskLevel = (score: number) => {
    if (score >= 0.7) return { label: 'High', variant: 'critical' as const, icon: TrendingUp };
    if (score >= 0.4) return { label: 'Medium', variant: 'warning' as const, icon: Minus };
    return { label: 'Low', variant: 'success' as const, icon: TrendingDown };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Member Risk Rankings</CardTitle>
        <p className="text-sm text-muted-foreground">
          Members ranked by calculated risk score
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedProfiles.slice(0, 6).map((profile, index) => {
            const risk = getRiskLevel(profile.risk_score);
            const Icon = risk.icon;
            
            return (
              <div
                key={profile.member_id}
                className="flex items-center gap-4 rounded-lg border p-3 transition-all hover:bg-accent/50"
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                  index < 3 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{profile.member_id}</span>
                    <Badge variant={risk.variant} className="gap-1">
                      <Icon className="h-3 w-3" />
                      {risk.label}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{profile.transaction_count} transactions</span>
                    <span>Avg: KES {profile.avg_transaction_amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={cn(
                    "text-lg font-bold",
                    profile.risk_score >= 0.7 && "text-destructive",
                    profile.risk_score >= 0.4 && profile.risk_score < 0.7 && "text-warning",
                    profile.risk_score < 0.4 && "text-success",
                  )}>
                    {Math.round(profile.risk_score * 100)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Risk Score</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
