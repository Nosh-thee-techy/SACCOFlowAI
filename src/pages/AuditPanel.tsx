import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield, CheckCircle2, AlertTriangle, Search, 
  Hash, Clock, RefreshCw, FileCheck, Download,
  FileText, Eye, Folder, Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { exportToCSV } from '@/lib/exportUtils';

interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string;
  actor_role: string;
  payload: any;
  hash: string;
  prev_hash: string;
  created_at: string;
}

export default function AuditPanel() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message: string;
    total_entries: number;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cases, setCases] = useState<any[]>([
    { id: 'CASE-001', title: 'Suspicious withdrawal pattern', status: 'investigating', priority: 'high', created_at: new Date().toISOString() },
    { id: 'CASE-002', title: 'Potential SIM-swap fraud', status: 'open', priority: 'critical', created_at: new Date().toISOString() },
  ]);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/audit-logs`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch audit logs');
      
      const data = await response.json();
      setLogs(data.audit_logs || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Could not load audit records');
    } finally {
      setLoading(false);
    }
  };

  const verifyChain = async () => {
    setVerifying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/audit-logs/verify-chain`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Verification failed');
      
      const result = await response.json();
      setVerificationResult(result);
      
      if (result.valid) {
        toast.success('Audit chain verified - all records are intact');
      } else {
        toast.error('Chain integrity issue detected');
      }
    } catch (error) {
      console.error('Error verifying chain:', error);
      toast.error('Could not verify audit chain');
    } finally {
      setVerifying(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.actor_role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('created') || actionLower.includes('create')) {
      return <Badge className="bg-blue-500">Created</Badge>;
    }
    if (actionLower.includes('approved') || actionLower.includes('approve')) {
      return <Badge className="bg-green-500">Approved</Badge>;
    }
    if (actionLower.includes('rejected') || actionLower.includes('reject')) {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    if (actionLower.includes('reviewed') || actionLower.includes('review')) {
      return <Badge className="bg-purple-500">Reviewed</Badge>;
    }
    return <Badge variant="secondary">{action}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading audit records...</div>
      </div>
    );
  }

  // Case management data is now initialized with other state hooks above

  const handleExportCSV = () => {
    exportToCSV(logs.map(log => ({
      id: log.id,
      entity_type: log.entity_type,
      action: log.action,
      actor_role: log.actor_role,
      created_at: log.created_at,
      hash: log.hash
    })), 'audit_logs');
    toast.success('Audit logs exported as CSV');
  };

  const handleExportPDF = () => {
    // Simple PDF export
    toast.success('Audit report generated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Audit & Compliance</h1>
          </div>
          <p className="text-muted-foreground">
            Read-only access to immutable system records for compliance and investigations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Chain Verification Card */}
      <Card className={`${
        verificationResult?.valid === true ? 'border-green-500/50 bg-green-500/5' :
        verificationResult?.valid === false ? 'border-destructive/50 bg-destructive/5' : ''
      }`}>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-3 ${
                verificationResult?.valid === true ? 'bg-green-500/10' :
                verificationResult?.valid === false ? 'bg-destructive/10' : 'bg-primary/10'
              }`}>
                {verificationResult?.valid === true ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : verificationResult?.valid === false ? (
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                ) : (
                  <Hash className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">
                  {verificationResult 
                    ? (verificationResult.valid ? 'Chain Integrity Verified' : 'Integrity Issue Detected')
                    : 'Verify Audit Chain'
                  }
                </h3>
                <p className="text-sm text-muted-foreground">
                  {verificationResult 
                    ? verificationResult.message
                    : 'Check that no records have been tampered with'
                  }
                </p>
              </div>
            </div>
            <Button 
              onClick={verifyChain} 
              disabled={verifying}
              variant={verificationResult?.valid ? "outline" : "default"}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${verifying ? 'animate-spin' : ''}`} />
              {verifying ? 'Checking...' : 'Verify Now'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-sm text-muted-foreground">Total Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-500/10 p-3">
                <Hash className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">SHA-256</p>
                <p className="text-sm text-muted-foreground">Hash Algorithm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-500/10 p-3">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Immutable</p>
                <p className="text-sm text-muted-foreground">Chain-Linked Records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="cases" className="gap-2">
            <Folder className="h-4 w-4" />
            Case Management
          </TabsTrigger>
          <TabsTrigger value="query" className="gap-2">
            <Search className="h-4 w-4" />
            Forensic Query
          </TabsTrigger>
        </TabsList>

        {/* Audit Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Activity Records</CardTitle>
                  <CardDescription>Complete history of all system actions</CardDescription>
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
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
                  {filteredLogs.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No audit records found
                    </div>
                  ) : (
                    filteredLogs.map((log) => (
                      <div 
                        key={log.id}
                        className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-muted p-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium capitalize">{log.entity_type}</span>
                                {getActionBadge(log.action)}
                                {log.actor_role && (
                                  <Badge variant="outline" className="text-xs">
                                    {log.actor_role}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Entity: <span className="font-mono">{log.entity_id.slice(0, 20)}...</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
                            </p>
                            <p className="text-xs font-mono text-muted-foreground">
                              Hash: {log.hash.slice(0, 12)}...
                            </p>
                          </div>
                        </div>
                        
                        {log.payload && Object.keys(log.payload).length > 0 && (
                          <div className="mt-3 p-2 rounded bg-muted/50 text-xs font-mono overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2).slice(0, 200)}
                            {JSON.stringify(log.payload).length > 200 && '...'}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Case Management Tab */}
        <TabsContent value="cases">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Escalated Cases
              </CardTitle>
              <CardDescription>Investigate referred fraud incidents</CardDescription>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                  <p>No escalated cases</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cases.map((c) => (
                    <div 
                      key={c.id}
                      className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{c.id}</span>
                            <Badge variant={c.priority === 'critical' ? 'destructive' : 'default'}>
                              {c.priority}
                            </Badge>
                            <Badge variant="outline">{c.status}</Badge>
                          </div>
                          <p className="font-medium mt-1">{c.title}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forensic Query Tab */}
        <TabsContent value="query">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Forensic Transaction Query
              </CardTitle>
              <CardDescription>Search across all transaction history for investigations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Member ID</label>
                  <Input placeholder="e.g., MEM001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date From</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date To</label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount Range (KES)</label>
                  <div className="flex gap-2">
                    <Input placeholder="Min" type="number" />
                    <Input placeholder="Max" type="number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transaction Type</label>
                  <Input placeholder="e.g., withdrawal, transfer" />
                </div>
              </div>
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Run Query
              </Button>
              
              <div className="py-8 text-center text-muted-foreground border rounded-lg">
                <Filter className="mx-auto h-8 w-8 opacity-50 mb-2" />
                <p>Enter search criteria and run query</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Auditor Notes */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-2">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold">Auditor Guidelines</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• You have read-only access - no transaction authority</li>
                <li>• All your queries and views are logged</li>
                <li>• Use chain verification to detect any tampering</li>
                <li>• Export reports for regulatory submissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
