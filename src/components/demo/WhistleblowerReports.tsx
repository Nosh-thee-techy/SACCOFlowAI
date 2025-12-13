import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, Shield, Eye, CheckCircle2, 
  Clock, AlertTriangle, FileText
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface WhistleblowerReport {
  id: string;
  subject: string;
  description: string;
  status: 'new' | 'investigating' | 'escalated' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
}

export function WhistleblowerReports() {
  const [reports, setReports] = useState<WhistleblowerReport[]>([
    {
      id: 'WB-001',
      subject: 'Suspicious cash handling',
      description: 'I noticed a teller frequently handling large cash amounts without proper documentation. This has happened multiple times over the past two weeks.',
      status: 'new',
      priority: 'high',
      created_at: new Date(Date.now() - 86400000)
    },
    {
      id: 'WB-002',
      subject: 'Possible collusion',
      description: 'Two staff members appear to be processing loans for the same group of applicants without proper vetting procedures.',
      status: 'investigating',
      priority: 'high',
      created_at: new Date(Date.now() - 172800000)
    },
    {
      id: 'WB-003',
      subject: 'After-hours access concern',
      description: 'Someone has been accessing the branch office after hours. Security logs show multiple entries between 11 PM and 2 AM.',
      status: 'escalated',
      priority: 'medium',
      created_at: new Date(Date.now() - 259200000)
    }
  ]);

  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const handleMarkReviewed = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'investigating' as const } : r
    ));
    toast.success('Report marked as under investigation');
  };

  const handleEscalate = (id: string) => {
    setReports(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'escalated' as const } : r
    ));
    toast.warning('Report escalated to senior management');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-human text-white';
      case 'investigating': return 'bg-amber-500 text-white';
      case 'escalated': return 'bg-destructive text-white';
      case 'resolved': return 'bg-emerald-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };

  const selected = reports.find(r => r.id === selectedReport);

  return (
    <Card className="hover-lift border-human/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-human" />
              Whistleblower Reports
            </CardTitle>
            <CardDescription>
              Confidential reports from anonymous sources
            </CardDescription>
          </div>
          <Badge className="bg-human/10 text-human border-human/20">
            <Shield className="h-3 w-3 mr-1" />
            {reports.filter(r => r.status === 'new').length} new
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Report List */}
          <ScrollArea className="h-[350px] pr-4">
            <div className="space-y-3">
              {reports.map((report, index) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all duration-300 hover:shadow-md animate-slide-up",
                    selectedReport === report.id 
                      ? 'border-human bg-human/5' 
                      : 'border-border/50 hover:border-human/30'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {report.id}
                        </span>
                        <Badge className={cn("text-xs", getStatusColor(report.status))}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="font-medium line-clamp-1">{report.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {report.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getPriorityColor(report.priority))}
                      >
                        {report.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(report.created_at, 'MMM d')}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Report Detail */}
          <div className="p-4 rounded-xl bg-human/5 border border-human/20">
            {selected ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-muted-foreground">{selected.id}</span>
                  <Badge className={getStatusColor(selected.status)}>
                    {selected.status}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-lg">{selected.subject}</h3>
                
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm leading-relaxed">{selected.description}</p>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(selected.created_at, 'PPp')}
                  </span>
                  <span className={cn("flex items-center gap-1", getPriorityColor(selected.priority))}>
                    <AlertTriangle className="h-3 w-3" />
                    {selected.priority} priority
                  </span>
                </div>
                
                {/* Anonymous Protection Notice */}
                <div className="p-3 rounded-lg bg-human/10 border border-human/20 flex items-start gap-2">
                  <Shield className="h-4 w-4 text-human mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-human">
                    Reporter identity is protected. No IP or identifying information was logged.
                  </p>
                </div>
                
                {/* Actions */}
                {selected.status === 'new' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleMarkReviewed(selected.id)}
                      className="flex-1 gap-2 bg-human hover:bg-human/90"
                    >
                      <Eye className="h-4 w-4" />
                      Mark Investigating
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleEscalate(selected.id)}
                      className="flex-1 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Escalate
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center py-12">
                <div>
                  <FileText className="mx-auto h-12 w-12 text-human/30 mb-3" />
                  <p className="text-muted-foreground">Select a report to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
