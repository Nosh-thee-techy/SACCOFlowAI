import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeatmapData } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ActivityHeatmapProps {
  data: HeatmapData[];
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 24 }, (_, i) => i);

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  const getColor = (value: number) => {
    const intensity = value / maxValue;
    if (intensity === 0) return 'bg-muted/30';
    if (intensity < 0.2) return 'bg-chart-1/20';
    if (intensity < 0.4) return 'bg-chart-1/40';
    if (intensity < 0.6) return 'bg-chart-1/60';
    if (intensity < 0.8) return 'bg-warning/60';
    return 'bg-destructive/70';
  };

  const getValue = (day: string, hour: number) => {
    return data.find(d => d.day === day && d.hour === hour)?.value || 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Alert Activity Heatmap</CardTitle>
        <CardDescription>Suspicious activity by day and hour</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hour labels */}
            <div className="flex mb-1 ml-12">
              {hours.filter((_, i) => i % 3 === 0).map(hour => (
                <div key={hour} className="flex-1 text-[10px] text-muted-foreground text-center">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
            
            {/* Grid */}
            <div className="space-y-1">
              {days.map(day => (
                <div key={day} className="flex items-center gap-2">
                  <span className="w-10 text-xs text-muted-foreground">{day}</span>
                  <div className="flex flex-1 gap-px">
                    {hours.map(hour => {
                      const value = getValue(day, hour);
                      return (
                        <Tooltip key={`${day}-${hour}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "flex-1 h-6 rounded-sm transition-colors cursor-pointer hover:ring-1 hover:ring-foreground/20",
                                getColor(value)
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-semibold">{day} {hour.toString().padStart(2, '0')}:00</p>
                            <p className="text-muted-foreground">{value} suspicious activities</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4">
              <span className="text-xs text-muted-foreground">Less</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded-sm bg-muted/30" />
                <div className="w-4 h-4 rounded-sm bg-chart-1/20" />
                <div className="w-4 h-4 rounded-sm bg-chart-1/40" />
                <div className="w-4 h-4 rounded-sm bg-chart-1/60" />
                <div className="w-4 h-4 rounded-sm bg-warning/60" />
                <div className="w-4 h-4 rounded-sm bg-destructive/70" />
              </div>
              <span className="text-xs text-muted-foreground">More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
