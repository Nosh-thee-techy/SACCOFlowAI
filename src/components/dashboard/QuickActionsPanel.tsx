import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lock, 
  RefreshCw, 
  MessageSquare, 
  FileText, 
  Download,
  Settings,
  Shield,
  Eye,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost';
  highlight?: boolean;
}

export function QuickActionsPanel() {
  const actions: QuickAction[] = [
    {
      id: 'lock',
      icon: Lock,
      label: 'Lock System',
      description: 'Pause all transactions',
      onClick: () => toast.info('System lock initiated - confirm in settings'),
      variant: 'outline',
      highlight: true,
    },
    {
      id: 'refresh',
      icon: RefreshCw,
      label: 'Sync Data',
      description: 'Refresh transactions',
      onClick: () => toast.success('Data synced successfully'),
      variant: 'ghost',
    },
    {
      id: 'alerts',
      icon: Bell,
      label: 'Alert Settings',
      description: 'Configure notifications',
      href: '/settings',
      variant: 'ghost',
    },
    {
      id: 'rules',
      icon: Shield,
      label: 'Detection Rules',
      description: 'Manage fraud rules',
      href: '/settings',
      variant: 'ghost',
    },
    {
      id: 'report',
      icon: FileText,
      label: 'Generate Report',
      description: 'Export PDF summary',
      onClick: () => toast.info('Report generation started'),
      variant: 'ghost',
    },
    {
      id: 'support',
      icon: MessageSquare,
      label: 'Get Support',
      description: 'Contact fraud specialist',
      onClick: () => toast.info('Support chat coming soon'),
      variant: 'ghost',
    },
  ];

  const renderAction = (action: QuickAction) => {
    const Icon = action.icon;
    const content = (
      <Button
        variant={action.variant}
        className={cn(
          "h-auto flex-col gap-2 p-4 w-full transition-all duration-200",
          action.highlight && "border-2 border-dashed border-destructive/50 hover:border-destructive"
        )}
        onClick={action.onClick}
      >
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg",
          action.highlight ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-center">
          <p className="font-medium text-sm">{action.label}</p>
          <p className="text-xs text-muted-foreground">{action.description}</p>
        </div>
      </Button>
    );

    if (action.href) {
      return (
        <Link key={action.id} to={action.href} className="block">
          {content}
        </Link>
      );
    }

    return <div key={action.id}>{content}</div>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {actions.map(renderAction)}
        </div>
      </CardContent>
    </Card>
  );
}
