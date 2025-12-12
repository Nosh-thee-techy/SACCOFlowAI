import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useFraudStore } from '@/lib/store';
import { 
  Bell, 
  Shield, 
  Sliders, 
  Database, 
  RefreshCw,
  Trash2,
  Moon,
  Sun
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { theme, toggleTheme, clearAlerts, initialize } = useFraudStore();

  const handleResetData = () => {
    initialize();
    toast.success('Data reset successfully', {
      description: 'Demo data has been regenerated',
    });
  };

  const handleClearAlerts = () => {
    clearAlerts();
    toast.success('Alerts cleared', {
      description: 'All alerts have been removed',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Configure fraud detection rules and system preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for better visibility
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alert notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Critical Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified for critical fraud alerts
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Daily Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily fraud activity summary
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send alerts via email
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Detection Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Detection Rules
            </CardTitle>
            <CardDescription>Configure fraud detection thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="large-txn">Large Transaction Threshold (KES)</Label>
              <Input id="large-txn" type="number" defaultValue={100000} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-start">Business Hours Start</Label>
              <Input id="business-start" type="time" defaultValue="08:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-end">Business Hours End</Label>
              <Input id="business-end" type="time" defaultValue="18:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rapid-count">Rapid Withdrawal Count (per hour)</Label>
              <Input id="rapid-count" type="number" defaultValue={3} />
            </div>
          </CardContent>
        </Card>

        {/* Anomaly Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              Anomaly Detection
            </CardTitle>
            <CardDescription>Statistical detection parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="z-threshold">Z-Score Threshold</Label>
              <Input id="z-threshold" type="number" step="0.1" defaultValue={2.5} />
              <p className="text-xs text-muted-foreground">
                Transactions with z-score above this will be flagged
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-history">Minimum Transaction History</Label>
              <Input id="min-history" type="number" defaultValue={5} />
              <p className="text-xs text-muted-foreground">
                Minimum transactions required for statistical analysis
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Volume Spike Detection</Label>
                <p className="text-sm text-muted-foreground">
                  Detect unusual transaction volume patterns
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage demo data and system state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button variant="outline" onClick={handleResetData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Demo Data
              </Button>
              <Button variant="destructive" onClick={handleClearAlerts}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Alerts
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              This is a demo application. In production, this section would include
              database backup, export, and data retention settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
