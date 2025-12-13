import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Shield, CheckCircle2, AlertTriangle, Search, 
  Hash, Clock, RefreshCw, FileCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Audit Trail</h1>
        </div>
        <p className="text-muted-foreground">
          Tamper-proof record of all system activities with cryptographic verification
        </p>
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

      {/* Search and Logs */}
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
                  
                  {/* Payload Preview */}
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
        </CardContent>
      </Card>
    </div>
  );
}
