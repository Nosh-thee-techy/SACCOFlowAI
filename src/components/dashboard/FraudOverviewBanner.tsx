import { useFraudStore } from '@/lib/store';
import { Alert } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Unlock,
  Eye,
  HelpCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

interface FraudOverviewBannerProps {
  alerts: Alert[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export function FraudOverviewBanner({ alerts, riskLevel }: FraudOverviewBannerProps) {
  const [isLocked, setIsLocked] = useState(false);
  
  const pendingAlerts = alerts.filter(a => !a.reviewed);
  const criticalCount = pendingAlerts.filter(a => a.severity === 'critical').length;
  const highCount = pendingAlerts.filter(a => a.severity === 'high').length;
  
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'critical':
        return {
          icon: ShieldAlert,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/30',
          gradientClass: 'from-destructive/20 via-destructive/5 to-transparent',
          label: 'Critical Risk',
          message: 'Immediate attention required',
        };
      case 'high':
        return {
          icon: AlertTriangle,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/30',
          gradientClass: 'from-warning/20 via-warning/5 to-transparent',
          label: 'High Risk',
          message: 'Review recommended',
        };
      case 'medium':
        return {
          icon: Shield,
          color: 'text-chart-5',
          bgColor: 'bg-chart-5/10',
          borderColor: 'border-chart-5/30',
          gradientClass: 'from-chart-5/20 via-chart-5/5 to-transparent',
          label: 'Medium Risk',
          message: 'Monitor closely',
        };
      default:
        return {
          icon: ShieldCheck,
          color: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/30',
          gradientClass: 'from-success/20 via-success/5 to-transparent',
          label: 'Low Risk',
          message: 'All systems normal',
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
    toast.success(isLocked ? 'System unlocked' : 'System locked - All transactions paused');
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-2 transition-all duration-500",
      config.borderColor
    )}>
      {/* Animated gradient background */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r opacity-50",
        config.gradientClass
      )} />
      
      {/* Pulse effect for critical */}
      {riskLevel === 'critical' && (
        <div className="absolute inset-0 animate-pulse bg-destructive/5" />
      )}

      <CardContent className="relative p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Risk Status */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
              config.bgColor
            )}>
              <Icon className={cn("h-8 w-8", config.color)} />
              {pendingAlerts.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground animate-bounce">
                  {pendingAlerts.length}
                </span>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className={cn("text-2xl font-bold", config.color)}>
                  {config.label}
                </h2>
                {riskLevel === 'critical' && (
                  <Badge variant="destructive" className="animate-pulse">
                    ACTION NEEDED
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{config.message}</p>
              
              {/* Quick stats */}
              <div className="mt-2 flex items-center gap-4 text-sm">
                {criticalCount > 0 && (
                  <span className="flex items-center gap-1 text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {criticalCount} critical
                  </span>
                )}
                {highCount > 0 && (
                  <span className="flex items-center gap-1 text-warning">
                    <TrendingUp className="h-3 w-3" />
                    {highCount} high priority
                  </span>
                )}
                {pendingAlerts.length === 0 && (
                  <span className="flex items-center gap-1 text-success">
                    <ShieldCheck className="h-3 w-3" />
                    No pending alerts
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant={isLocked ? "destructive" : "outline"}
              size="lg"
              onClick={handleLockToggle}
              className="gap-2 font-semibold"
            >
              {isLocked ? (
                <>
                  <Lock className="h-4 w-4" />
                  Unlock System
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Emergency Lock
                </>
              )}
            </Button>
            
            <Link to="/alerts">
              <Button variant="default" size="lg" className="gap-2">
                <Eye className="h-4 w-4" />
                Review Alerts
              </Button>
            </Link>
            
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
