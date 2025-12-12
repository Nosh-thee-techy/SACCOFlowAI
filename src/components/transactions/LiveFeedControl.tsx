import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveFeedControlProps {
  enabled: boolean;
  intervalMs: number;
  onToggle: () => void;
  onIntervalChange: (ms: number) => void;
}

export function LiveFeedControl({ 
  enabled, 
  intervalMs, 
  onToggle, 
  onIntervalChange 
}: LiveFeedControlProps) {
  const speedLabel = intervalMs <= 2000 ? 'Fast' : intervalMs <= 5000 ? 'Normal' : 'Slow';
  
  return (
    <Card variant="glass" className={cn(
      "border-2 transition-all duration-300",
      enabled && "border-primary/50 shadow-glow"
    )}>
      <CardContent className="py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
              enabled 
                ? "bg-primary/20 text-primary animate-pulse" 
                : "bg-muted text-muted-foreground"
            )}>
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Live Transaction Feed</h3>
                <Badge variant={enabled ? 'success' : 'secondary'} className="gap-1">
                  {enabled ? (
                    <>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                      </span>
                      Live
                    </>
                  ) : (
                    'Paused'
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {enabled 
                  ? `Streaming new transactions every ${(intervalMs / 1000).toFixed(1)}s`
                  : 'Simulated real-time transaction stream'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 min-w-[180px]">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <Slider
                value={[11000 - intervalMs]}
                onValueChange={([v]) => onIntervalChange(11000 - v)}
                min={1000}
                max={9000}
                step={500}
                disabled={!enabled}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12">{speedLabel}</span>
            </div>
            
            <Button 
              onClick={onToggle}
              variant={enabled ? 'destructive' : 'gradient'}
              className="gap-2 min-w-[100px]"
            >
              {enabled ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
