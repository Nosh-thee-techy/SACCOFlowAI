import { Alert } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertTriangle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFraudStore } from '@/lib/store';
import { Link } from 'react-router-dom';

interface RecentAlertsProps {
  alerts: Alert[];
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  const { markAlertReviewed } = useFraudStore();
  const recentAlerts = alerts.slice(0, 5);

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <Zap className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Recent Alerts</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Latest fraud detection alerts requiring attention
          </p>
        </div>
        <Link to="/alerts">
          <Button variant="outline" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mb-3 text-success" />
              <p className="font-medium">No active alerts</p>
              <p className="text-sm">All transactions are looking normal</p>
            </div>
          ) : (
            recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-all duration-200 hover:bg-accent/50",
                  alert.reviewed && "opacity-60"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  alert.severity === 'critical' && "bg-destructive/10 text-destructive",
                  alert.severity === 'high' && "bg-warning/10 text-warning",
                  alert.severity === 'medium' && "bg-chart-5/10 text-chart-5",
                  alert.severity === 'low' && "bg-muted text-muted-foreground",
                )}>
                  {getSeverityIcon(alert.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={alert.severity}>{alert.severity}</Badge>
                    <Badge variant={alert.type === 'rule' ? 'info' : 'secondary'}>
                      {alert.type === 'rule' ? 'Rule' : 'Anomaly'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Member: {alert.member_id}
                    </span>
                  </div>
                  <p className="mt-1 text-sm line-clamp-2">{alert.reason}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Confidence: {Math.round(alert.confidence * 100)}%</span>
                    <span>{alert.timestamp.toLocaleString()}</span>
                  </div>
                </div>

                {!alert.reviewed && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAlertReviewed(alert.id)}
                    className="shrink-0"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
