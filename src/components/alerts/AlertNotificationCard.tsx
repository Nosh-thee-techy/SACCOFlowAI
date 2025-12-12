import { Alert } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Zap,
  ChevronDown,
  ChevronUp,
  Info,
  Shield,
  Brain,
  MapPin,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useFraudStore } from '@/lib/store';
import { toast } from 'sonner';

interface AlertNotificationCardProps {
  alert: Alert;
  showDetails?: boolean;
}

export function AlertNotificationCard({ alert, showDetails = false }: AlertNotificationCardProps) {
  const [expanded, setExpanded] = useState(showDetails);
  const { markAlertReviewed } = useFraudStore();

  const getSeverityConfig = () => {
    switch (alert.severity) {
      case 'critical':
        return {
          icon: AlertTriangle,
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-l-destructive',
          pulseClass: 'animate-pulse',
        };
      case 'high':
        return {
          icon: Zap,
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-l-warning',
          pulseClass: '',
        };
      case 'medium':
        return {
          icon: Info,
          color: 'text-chart-5',
          bgColor: 'bg-chart-5/10',
          borderColor: 'border-l-chart-5',
          pulseClass: '',
        };
      default:
        return {
          icon: Clock,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          borderColor: 'border-l-muted-foreground',
          pulseClass: '',
        };
    }
  };

  const config = getSeverityConfig();
  const Icon = config.icon;

  const handleConfirm = () => {
    markAlertReviewed(alert.id);
    toast.success("Alert marked as reviewed - It's OK");
  };

  const handleFreeze = () => {
    markAlertReviewed(alert.id);
    toast.error('Account flagged for investigation', {
      description: `Member ${alert.member_id} has been flagged`,
    });
  };

  const getWhyMessage = () => {
    if (alert.type === 'rule') {
      return "This transaction triggered a predefined fraud detection rule based on known suspicious patterns.";
    }
    if (alert.type === 'anomaly') {
      return "Our AI detected unusual patterns that deviate from normal member behavior.";
    }
    return "Long-term behavioral analysis indicates this activity doesn't match the member's typical patterns.";
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg",
        config.borderColor,
        alert.reviewed && "opacity-60",
        alert.severity === 'critical' && !alert.reviewed && "ring-2 ring-destructive/20"
      )}
    >
      {/* Critical pulse overlay */}
      {alert.severity === 'critical' && !alert.reviewed && (
        <div className="absolute inset-0 bg-destructive/5 animate-pulse pointer-events-none" />
      )}

      <CardContent className="relative p-4">
        <div className="flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex items-start gap-4">
            <div className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              config.bgColor,
              config.pulseClass
            )}>
              <Icon className={cn("h-6 w-6", config.color)} />
            </div>

            <div className="flex-1 min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant={alert.severity} className="uppercase text-xs font-bold">
                  {alert.severity}
                </Badge>
                <Badge 
                  variant={alert.type === 'rule' ? 'info' : alert.type === 'anomaly' ? 'secondary' : 'warning'} 
                  className="gap-1"
                >
                  {alert.type === 'rule' ? (
                    <><Shield className="h-3 w-3" /> Rule</>
                  ) : alert.type === 'anomaly' ? (
                    <><Brain className="h-3 w-3" /> AI</>
                  ) : (
                    <><Zap className="h-3 w-3" /> Behavioral</>
                  )}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(alert.confidence * 100)}% confidence
                </span>
              </div>

              {/* Main Message - Bank-style concise format */}
              <p className="text-sm font-semibold text-foreground">
                {alert.reason}
              </p>
              
              {/* Transaction Info */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  {alert.transaction_id}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {alert.timestamp.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action Buttons - Bank-style immediate actions */}
            {!alert.reviewed ? (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConfirm}
                  className="gap-1 text-success border-success/30 hover:bg-success/10 hover:text-success"
                >
                  <CheckCircle className="h-4 w-4" />
                  It's OK
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleFreeze}
                  className="gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Flag
                </Button>
              </div>
            ) : (
              <Badge variant="success" className="gap-1 shrink-0">
                <CheckCircle className="h-3 w-3" />
                Reviewed
              </Badge>
            )}
          </div>

          {/* Expandable Details */}
          <div className="border-t border-border/50 pt-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <Info className="h-3 w-3" />
              Why was this flagged?
              {expanded ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
            </button>

            {expanded && (
              <div className="mt-3 p-3 rounded-lg bg-muted/50 animate-fade-in">
                <p className="text-sm text-muted-foreground mb-3">
                  {getWhyMessage()}
                </p>
                
                <div className="grid gap-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Member ID</span>
                    <span className="font-mono font-medium">{alert.member_id}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono font-medium">{alert.transaction_id}</span>
                  </div>
                  {alert.rule_type && (
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Rule Type</span>
                      <Badge variant="outline" className="text-xs">{alert.rule_type}</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-muted-foreground">Detection Time</span>
                    <span className="font-medium">{alert.timestamp.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs gap-1">
                    <Info className="h-3 w-3" />
                    View Full Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
