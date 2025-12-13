import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, Mail, Phone, FileText, 
  Bell, Trash2, AlertTriangle, Sparkles
} from 'lucide-react';
import { useDemoMode } from './DemoModeProvider';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationPanel() {
  const { notifications, clearNotifications, triggerHighRiskTransaction } = useDemoMode();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'voice': return <Phone className="h-4 w-4" />;
      case 'letter': return <FileText className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-amber-500 text-white';
      case 'medium': return 'bg-intelligence text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-intelligence" />
              AI Communications
            </CardTitle>
            <CardDescription>
              Automated notifications triggered by AI
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={triggerHighRiskTransaction}
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <AlertTriangle className="h-4 w-4" />
              Simulate High Risk
            </Button>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearNotifications}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Sparkles className="mx-auto h-12 w-12 text-intelligence/30 mb-3" />
            <p className="font-medium text-muted-foreground">No notifications yet</p>
            <p className="text-sm text-muted-foreground">
              Try simulating a high-risk transaction
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {notifications.map((notif, index) => (
                <div
                  key={notif.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all animate-slide-up",
                    notif.urgency === 'critical' 
                      ? 'border-destructive/30 bg-destructive/5' 
                      : 'border-border/50'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn(
                        "p-2 rounded-lg",
                        notif.urgency === 'critical' 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-intelligence/10 text-intelligence'
                      )}>
                        {getTypeIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{notif.subject}</span>
                          <Badge className={cn("text-xs", getUrgencyColor(notif.urgency))}>
                            {notif.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>To: {notif.recipient}</span>
                          <span>•</span>
                          <span>{format(notif.timestamp, 'h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      <span className="text-intelligence">🤖 Triggered by:</span> {notif.triggered_by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
