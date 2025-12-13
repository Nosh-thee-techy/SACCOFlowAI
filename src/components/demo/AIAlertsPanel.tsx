import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Brain, AlertTriangle, TrendingUp, Eye, 
  Filter, Sparkles, ChevronRight, Shield,
  Zap, Clock, Users, Activity
} from 'lucide-react';
import { useFraudStore } from '@/lib/store';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function AIAlertsPanel() {
  const { alerts, markAlertReviewed } = useFraudStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [showExplanation, setShowExplanation] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(alert => {
    if (filterType === 'all') return true;
    return alert.type.toLowerCase() === filterType;
  });

  const alertTypes = [
    { value: 'all', label: 'All', count: alerts.length },
    { value: 'rule', label: 'Rule', count: alerts.filter(a => a.type === 'rule').length },
    { value: 'anomaly', label: 'Anomaly', count: alerts.filter(a => a.type === 'anomaly').length },
    { value: 'behavioral', label: 'Behavioral', count: alerts.filter(a => a.type === 'behavioral').length },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-destructive bg-destructive/10';
      case 'high': return 'text-amber-600 bg-amber-500/10';
      case 'medium': return 'text-intelligence bg-intelligence/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'rule': return <Shield className="h-4 w-4" />;
      case 'anomaly': return <Zap className="h-4 w-4" />;
      case 'behavioral': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <TooltipProvider>
      <Card className="hover-lift">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-intelligence" />
                AI-Powered Alerts
              </CardTitle>
              <CardDescription>
                Real-time fraud detection with explainable AI
              </CardDescription>
            </div>
            <Badge className="bg-intelligence/10 text-intelligence border-intelligence/20">
              <Sparkles className="h-3 w-3 mr-1" />
              {alerts.filter(a => !a.reviewed).length} unreviewed
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {alertTypes.map(type => (
              <Button
                key={type.value}
                variant={filterType === type.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type.value)}
                className={cn(
                  "gap-2 whitespace-nowrap",
                  filterType === type.value && "bg-intelligence hover:bg-intelligence/90"
                )}
              >
                {type.label}
                <Badge variant="secondary" className="text-xs">
                  {type.count}
                </Badge>
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className="py-12 text-center">
                  <Brain className="mx-auto h-12 w-12 text-intelligence/30 mb-3" />
                  <p className="font-medium text-muted-foreground">No alerts</p>
                  <p className="text-sm text-muted-foreground">
                    AI is monitoring all transactions
                  </p>
                </div>
              ) : (
                filteredAlerts.slice(0, 20).map((alert, index) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all animate-slide-up",
                      alert.reviewed 
                        ? 'opacity-60 border-border/30' 
                        : 'border-border/50 hover:border-intelligence/30'
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Type Icon */}
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={cn(
                              "p-2 rounded-lg",
                              getSeverityColor(alert.severity)
                            )}>
                              {getTypeIcon(alert.type)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{alert.type} Alert</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium">{alert.member_id}</span>
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs", getSeverityColor(alert.severity))}
                            >
                              {alert.severity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {alert.type}
                            </Badge>
                            {alert.reviewed && (
                              <Badge variant="secondary" className="text-xs">
                                Reviewed
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {alert.reason}
                          </p>
                          
                          {/* Confidence Score */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <Progress 
                              value={alert.confidence * 100} 
                              className="w-20 h-1.5 [&>div]:bg-intelligence"
                            />
                            <span className="text-xs font-medium text-intelligence">
                              {Math.round(alert.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-muted-foreground">
                          {format(alert.timestamp, 'h:mm a')}
                        </span>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowExplanation(
                            showExplanation === alert.id ? null : alert.id
                          )}
                          className="gap-1 text-intelligence hover:text-intelligence"
                        >
                          <Eye className="h-3 w-3" />
                          Explain
                        </Button>
                      </div>
                    </div>
                    
                    {/* Expandable Explanation */}
                    {showExplanation === alert.id && (
                      <div className="mt-4 p-4 rounded-lg bg-intelligence/5 border border-intelligence/20 animate-scale-in">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="h-4 w-4 text-intelligence" />
                          <span className="font-medium text-intelligence">AI Explanation</span>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p className="text-muted-foreground">
                            This transaction was flagged because:
                          </p>
                          <ul className="space-y-1">
                            <li className="flex items-start gap-2">
                              <span className="text-intelligence">•</span>
                              <span>{alert.reason}</span>
                            </li>
                            {alert.type === 'behavioral' && (
                              <li className="flex items-start gap-2">
                                <span className="text-intelligence">•</span>
                                <span>Pattern deviation detected from member's historical behavior</span>
                              </li>
                            )}
                            {alert.type === 'anomaly' && (
                              <li className="flex items-start gap-2">
                                <span className="text-intelligence">•</span>
                                <span>Statistical outlier compared to similar member profiles</span>
                              </li>
                            )}
                          </ul>
                          
                          <div className="pt-3 mt-3 border-t border-intelligence/20 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              Detected at {format(alert.timestamp, 'PPp')}
                            </span>
                            {!alert.reviewed && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAlertReviewed(alert.id)}
                                className="gap-1"
                              >
                                Mark as Reviewed
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
