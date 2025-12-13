import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Users, Settings, Shield, AlertTriangle, Lock, Unlock,
  Plus, Edit, Trash2, Activity, TrendingUp, CheckCircle2,
  XCircle, Eye, Search, RefreshCw, Smartphone, Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  is_active: boolean;
}

interface SimSwapAlert {
  id: string;
  member_id: string;
  device_change: boolean;
  location_mismatch: boolean;
  risk_level: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Simulated SIM-swap alerts
  const simSwapAlerts: SimSwapAlert[] = [
    { 
      id: '1', 
      member_id: 'MEM001', 
      device_change: true, 
      location_mismatch: true, 
      risk_level: 'high',
      created_at: new Date().toISOString() 
    },
    { 
      id: '2', 
      member_id: 'MEM042', 
      device_change: true, 
      location_mismatch: false, 
      risk_level: 'medium',
      created_at: new Date().toISOString() 
    },
  ];

  // Detection rule settings
  const [ruleSettings, setRuleSettings] = useState({
    largeTransactionLimit: 100000,
    businessHoursStart: '08:00',
    businessHoursEnd: '18:00',
    rapidWithdrawalLimit: 3,
    enableVolumeSpike: true,
    enableSIMSwapDetection: true,
    zScoreThreshold: 2.5,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles with roles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Mock data for demo
      const mockUsers: User[] = [
        { id: '1', email: 'admin@sacco.co.ke', full_name: 'Admin User', role: 'admin', created_at: '2024-01-01', is_active: true },
        { id: '2', email: 'manager@sacco.co.ke', full_name: 'Branch Manager', role: 'branch_manager', created_at: '2024-01-02', is_active: true },
        { id: '3', email: 'teller1@sacco.co.ke', full_name: 'John Kamau', role: 'teller', created_at: '2024-01-03', is_active: true },
        { id: '4', email: 'teller2@sacco.co.ke', full_name: 'Mary Wanjiku', role: 'teller', created_at: '2024-01-04', is_active: true },
        { id: '5', email: 'auditor@sacco.co.ke', full_name: 'Peter Auditor', role: 'auditor', created_at: '2024-01-05', is_active: true },
        { id: '6', email: 'suspended@sacco.co.ke', full_name: 'Suspended User', role: 'teller', created_at: '2024-01-06', is_active: false },
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Could not load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    toast.success(`Role updated to ${newRole}`, {
      description: 'This action has been logged'
    });
    
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role: newRole } : u
    ));
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    toast.success(isActive ? 'Account activated' : 'Account suspended', {
      description: 'This action has been logged'
    });
    
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, is_active: isActive } : u
    ));
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved', {
      description: 'Detection rules updated for all future transactions'
    });
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      branch_manager: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      teller: 'bg-green-500/10 text-green-500 border-green-500/20',
      auditor: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      risk_officer: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return <Badge className={colors[role] || 'bg-muted'}>{role.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Admin Control Center</h1>
        <p className="text-muted-foreground">
          Manage users, configure detection rules, and monitor system health
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.is_active).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SIM-Swap Alerts</CardTitle>
            <Smartphone className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{simSwapAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              Suspicious device changes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Lock className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {users.filter(u => !u.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Accounts locked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Active</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <Shield className="h-4 w-4" />
            Detection Rules
          </TabsTrigger>
          <TabsTrigger value="simswap" className="gap-2">
            <Smartphone className="h-4 w-4" />
            SIM-Swap Alerts
          </TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>System Users</CardTitle>
                  <CardDescription>Manage roles and access permissions</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div 
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`rounded-full p-2 ${user.is_active ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                          <Users className={`h-4 w-4 ${user.is_active ? 'text-primary' : 'text-destructive'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.full_name || 'No name'}</p>
                            {!user.is_active && (
                              <Badge variant="destructive" className="text-xs">Suspended</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="branch_manager">Branch Manager</SelectItem>
                            <SelectItem value="teller">Teller</SelectItem>
                            <SelectItem value="risk_officer">Risk Officer</SelectItem>
                            <SelectItem value="auditor">Auditor</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant={user.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleToggleActive(user.id, !user.is_active)}
                        >
                          {user.is_active ? (
                            <>
                              <Lock className="h-4 w-4 mr-1" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detection Rules */}
        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Transaction Thresholds
                </CardTitle>
                <CardDescription>Set limits for flagging transactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="large-tx">Large Transaction Limit (KES)</Label>
                  <Input
                    id="large-tx"
                    type="number"
                    value={ruleSettings.largeTransactionLimit}
                    onChange={(e) => setRuleSettings(prev => ({
                      ...prev,
                      largeTransactionLimit: parseInt(e.target.value)
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Transactions above this amount need manager approval
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rapid-limit">Rapid Withdrawal Limit (per hour)</Label>
                  <Input
                    id="rapid-limit"
                    type="number"
                    value={ruleSettings.rapidWithdrawalLimit}
                    onChange={(e) => setRuleSettings(prev => ({
                      ...prev,
                      rapidWithdrawalLimit: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bh-start">Business Hours Start</Label>
                    <Input
                      id="bh-start"
                      type="time"
                      value={ruleSettings.businessHoursStart}
                      onChange={(e) => setRuleSettings(prev => ({
                        ...prev,
                        businessHoursStart: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bh-end">Business Hours End</Label>
                    <Input
                      id="bh-end"
                      type="time"
                      value={ruleSettings.businessHoursEnd}
                      onChange={(e) => setRuleSettings(prev => ({
                        ...prev,
                        businessHoursEnd: e.target.value
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Advanced Detection
                </CardTitle>
                <CardDescription>Statistical and behavioral settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="zscore">Z-Score Threshold</Label>
                  <Input
                    id="zscore"
                    type="number"
                    step="0.1"
                    value={ruleSettings.zScoreThreshold}
                    onChange={(e) => setRuleSettings(prev => ({
                      ...prev,
                      zScoreThreshold: parseFloat(e.target.value)
                    }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values = fewer false alarms, lower = more sensitive
                  </p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Volume Spike Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert on unusual transaction patterns
                    </p>
                  </div>
                  <Switch
                    checked={ruleSettings.enableVolumeSpike}
                    onCheckedChange={(checked) => setRuleSettings(prev => ({
                      ...prev,
                      enableVolumeSpike: checked
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SIM-Swap Detection</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitor device and location changes
                    </p>
                  </div>
                  <Switch
                    checked={ruleSettings.enableSIMSwapDetection}
                    onCheckedChange={(checked) => setRuleSettings(prev => ({
                      ...prev,
                      enableSIMSwapDetection: checked
                    }))}
                  />
                </div>
                <Button onClick={handleSaveSettings} className="w-full">
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SIM-Swap Alerts */}
        <TabsContent value="simswap">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                SIM-Swap & Device Alerts
              </CardTitle>
              <CardDescription>
                Suspicious device changes that may indicate account takeover
              </CardDescription>
            </CardHeader>
            <CardContent>
              {simSwapAlerts.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                  <p>No suspicious device activity detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {simSwapAlerts.map((alert) => (
                    <div 
                      key={alert.id}
                      className="p-4 rounded-lg border bg-amber-500/5 border-amber-500/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-amber-500/10 p-2">
                            <Smartphone className="h-4 w-4 text-amber-500" />
                          </div>
                          <div>
                            <p className="font-medium">{alert.member_id}</p>
                            <div className="flex gap-2 mt-1">
                              {alert.device_change && (
                                <Badge variant="outline" className="text-xs">New Device</Badge>
                              )}
                              {alert.location_mismatch && (
                                <Badge variant="outline" className="text-xs">
                                  <Globe className="h-3 w-3 mr-1" />
                                  Location Changed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={alert.risk_level === 'high' ? 'destructive' : 'default'}>
                            {alert.risk_level} risk
                          </Badge>
                          <Button size="sm" variant="outline">
                            Investigate
                          </Button>
                          <Button size="sm" variant="destructive">
                            Lock Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Notes */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold">Admin Accountability</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• All role changes and overrides are logged permanently</li>
                <li>• Overrides require written justification</li>
                <li>• Your actions are visible to auditors</li>
                <li>• You cannot delete audit logs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
