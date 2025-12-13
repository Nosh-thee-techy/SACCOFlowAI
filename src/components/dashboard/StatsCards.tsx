import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp
} from 'lucide-react';
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
      accent: 'primary' as const,
    },
    {
      title: 'Transaction Volume',
      value: `KES ${(stats.totalVolume / 1000000).toFixed(2)}M`,
      icon: DollarSign,
      change: '+8.2%',
      changeType: 'positive' as const,
      description: 'Total volume',
      accent: 'success' as const,
    },
    {
      title: 'Active Alerts',
      value: (stats.totalAlerts - stats.reviewedAlerts).toLocaleString(),
      icon: AlertTriangle,
      change: stats.criticalAlerts > 0 ? `${stats.criticalAlerts} critical` : 'None critical',
      changeType: stats.criticalAlerts > 0 ? 'negative' as const : 'neutral' as const,
      description: 'Pending review',
      accent: stats.criticalAlerts > 0 ? 'destructive' as const : 'intelligence' as const,
    },
    {
      title: 'Reviewed',
      value: `${Math.round((stats.reviewedAlerts / stats.totalAlerts) * 100) || 0}%`,
      icon: CheckCircle,
      change: `${stats.reviewedAlerts} of ${stats.totalAlerts}`,
      changeType: 'neutral' as const,
      description: 'Alerts processed',
      accent: 'human' as const,
    },
  ];

  const accentStyles = {
    primary: {
      icon: 'bg-primary/10 text-primary',
      glow: 'group-hover:shadow-glow-primary',
      gradient: 'from-primary/5 to-transparent',
    },
    success: {
      icon: 'bg-success/10 text-success',
      glow: 'group-hover:shadow-[0_0_24px_hsl(142_71%_45%/0.2)]',
      gradient: 'from-success/5 to-transparent',
    },
    destructive: {
      icon: 'bg-destructive/10 text-destructive',
      glow: 'group-hover:shadow-[0_0_24px_hsl(0_72%_51%/0.2)]',
      gradient: 'from-destructive/5 to-transparent',
    },
    intelligence: {
      icon: 'bg-intelligence/10 text-intelligence',
      glow: 'group-hover:shadow-glow-intelligence',
      gradient: 'from-intelligence/5 to-transparent',
    },
    human: {
      icon: 'bg-human/10 text-human',
      glow: 'group-hover:shadow-glow-human',
      gradient: 'from-human/5 to-transparent',
    },
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const style = accentStyles[card.accent];
        
        return (
          <div
            key={card.title}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-default",
              style.glow
            )}
            style={{ animationDelay: `${index * 75}ms` }}
          >
            {/* Background gradient on hover */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
              style.gradient
            )} />
            
            <div className="relative flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <p className="text-3xl font-bold tracking-tight">
                  {card.value}
                </p>
              </div>
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
                style.icon
              )}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            
            <div className="relative mt-4 flex items-center gap-2">
              {card.changeType === 'positive' && (
                <div className="flex items-center gap-1 text-success">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">{card.change}</span>
                </div>
              )}
              {card.changeType === 'negative' && (
                <div className="flex items-center gap-1 text-destructive animate-pulse-soft">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">{card.change}</span>
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

            {/* Animated progress bar for reviewed percentage */}
            {card.title === 'Reviewed' && (
              <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div 
                  className="absolute inset-y-0 left-0 rounded-full bg-human transition-all duration-1000 ease-out animate-risk-score"
                  style={{ width: `${Math.round((stats.reviewedAlerts / stats.totalAlerts) * 100) || 0}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
