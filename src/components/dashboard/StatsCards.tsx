import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { DashboardStats } from '@/lib/types';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Transactions',
      value: stats.totalTransactions.toLocaleString(),
      icon: Activity,
      change: '+12.5%',
      changeType: 'positive' as const,
      description: 'Last 30 days',
    },
    {
      title: 'Transaction Volume',
      value: `KES ${(stats.totalVolume / 1000000).toFixed(2)}M`,
      icon: DollarSign,
      change: '+8.2%',
      changeType: 'positive' as const,
      description: 'Total volume',
    },
    {
      title: 'Active Alerts',
      value: (stats.totalAlerts - stats.reviewedAlerts).toLocaleString(),
      icon: AlertTriangle,
      change: stats.criticalAlerts > 0 ? `${stats.criticalAlerts} critical` : 'None critical',
      changeType: stats.criticalAlerts > 0 ? 'negative' as const : 'neutral' as const,
      description: 'Pending review',
    },
    {
      title: 'Reviewed',
      value: `${Math.round((stats.reviewedAlerts / stats.totalAlerts) * 100) || 0}%`,
      icon: CheckCircle,
      change: `${stats.reviewedAlerts} of ${stats.totalAlerts}`,
      changeType: 'neutral' as const,
      description: 'Alerts processed',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Card
            key={card.title}
            variant="stat"
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-2xl font-bold tracking-tight">
                  {card.value}
                </p>
              </div>
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                card.changeType === 'negative' 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-primary/10 text-primary"
              )}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-2">
              {card.changeType === 'positive' && (
                <div className="flex items-center gap-1 text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-xs font-medium">{card.change}</span>
                </div>
              )}
              {card.changeType === 'negative' && (
                <div className="flex items-center gap-1 text-destructive">
                  <ArrowDownRight className="h-3 w-3" />
                  <span className="text-xs font-medium">{card.change}</span>
                </div>
              )}
              {card.changeType === 'neutral' && (
                <span className="text-xs font-medium text-muted-foreground">
                  {card.change}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {card.description}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
