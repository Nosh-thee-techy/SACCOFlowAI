import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { useFraudStore } from '@/lib/store';
import { parseCSV } from '@/lib/fraudDetection';
import { Transaction } from '@/lib/types';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Loader2,
  Download
} from 'lucide-react';

interface PreviewRow extends Transaction {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
}

export function CSVUpload() {
  const { addTransactions, memberProfiles, transactions } = useFraudStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [fileName, setFileName] = useState('');

  const analyzeTransaction = (txn: Transaction): PreviewRow => {
    const flags: string[] = [];
    
    // Find member profile
    const profile = memberProfiles.find(p => p.member_id === txn.member_id);
    
    // Check for large transaction
    if (profile && txn.amount > profile.avg_transaction_amount + 2 * profile.std_transaction_amount) {
      flags.push('Large amount');
    }
    
    // Check for off-hours
    const hour = txn.timestamp.getHours();
    if (hour < 8 || hour > 18) {
      flags.push('Off-hours');
    }
    
    // Check for negative balance
    if (txn.account_balance < 0) {
      flags.push('Negative balance');
    }
    
    // Determine risk level
    let riskLevel: PreviewRow['riskLevel'] = 'low';
    if (flags.length >= 2 || flags.includes('Negative balance')) {
      riskLevel = 'critical';
    } else if (flags.length === 1 && flags.includes('Large amount')) {
      riskLevel = 'high';
    } else if (flags.length === 1) {
      riskLevel = 'medium';
    }
    
    return { ...txn, riskLevel, flags };
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setFileName(file.name);
    
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      
      // Simulate processing with progress
      const analyzed: PreviewRow[] = [];
      for (let i = 0; i < parsed.length; i++) {
        analyzed.push(analyzeTransaction(parsed[i]));
        setProcessingProgress(Math.round(((i + 1) / parsed.length) * 100));
        // Small delay for visual feedback on large files
        if (i % 50 === 0) {
          await new Promise(r => setTimeout(r, 10));
        }
      }
      
      setPreviewData(analyzed);
      toast.success(`Parsed ${analyzed.length} transactions`);
    } catch (error) {
      console.error('Error processing CSV:', error);
      toast.error('Failed to parse CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      processFile(file);
    } else {
      toast.error('Please upload a CSV file');
    }
  }, [memberProfiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async () => {
    if (previewData.length === 0) return;
    
    setIsProcessing(true);
    try {
      const transactions: Transaction[] = previewData.map(({ riskLevel, flags, ...txn }) => txn);
      addTransactions(transactions);
      toast.success(`Submitted ${transactions.length} transactions for processing`);
      setPreviewData([]);
      setFileName('');
    } catch (error) {
      console.error('Error submitting transactions:', error);
      toast.error('Failed to submit transactions');
    } finally {
      setIsProcessing(false);
    }
  };

  const getRiskBadge = (level: PreviewRow['riskLevel']) => {
    const variants: Record<PreviewRow['riskLevel'], { color: string; icon: React.ReactNode }> = {
      low: { color: 'bg-green-500/10 text-green-500', icon: <CheckCircle className="h-3 w-3" /> },
      medium: { color: 'bg-yellow-500/10 text-yellow-500', icon: <AlertTriangle className="h-3 w-3" /> },
      high: { color: 'bg-orange-500/10 text-orange-500', icon: <AlertTriangle className="h-3 w-3" /> },
      critical: { color: 'bg-destructive/10 text-destructive', icon: <XCircle className="h-3 w-3" /> },
    };
    
    const { color, icon } = variants[level];
    return (
      <Badge variant="outline" className={`${color} flex items-center gap-1`}>
        {icon}
        {level}
      </Badge>
    );
  };

  const downloadTemplate = () => {
    const template = `transaction_id,member_id,amount,timestamp,transaction_type,account_balance
TXN000001,MEM001,5000,2024-01-15T09:30:00,deposit,25000
TXN000002,MEM002,15000,2024-01-15T10:15:00,withdrawal,10000`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: previewData.length,
    critical: previewData.filter(t => t.riskLevel === 'critical').length,
    high: previewData.filter(t => t.riskLevel === 'high').length,
    medium: previewData.filter(t => t.riskLevel === 'medium').length,
    low: previewData.filter(t => t.riskLevel === 'low').length,
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            CSV Upload
          </CardTitle>
          <CardDescription>
            Upload transaction data in CSV format for batch processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {isProcessing ? (
              <div className="space-y-4">
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-muted-foreground" />
                <p className="text-muted-foreground">Processing {fileName}...</p>
                <Progress value={processingProgress} className="max-w-xs mx-auto" />
                <p className="text-sm text-muted-foreground">{processingProgress}% complete</p>
              </div>
            ) : (
              <>
                <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Drag and drop a CSV file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    Select File
                  </label>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Required columns: transaction_id, member_id, amount, timestamp, transaction_type, account_balance</span>
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-1" />
              Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Table */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Preview ({previewData.length} transactions)</span>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-destructive/10 text-destructive">
                  {stats.critical} Critical
                </Badge>
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500">
                  {stats.high} High
                </Badge>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                  {stats.medium} Medium
                </Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-500">
                  {stats.low} Low
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Review transactions before submission. High-risk transactions will be flagged for review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 100).map((txn, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-xs">{txn.transaction_id}</TableCell>
                      <TableCell>{txn.member_id}</TableCell>
                      <TableCell className="capitalize">{txn.transaction_type}</TableCell>
                      <TableCell className="text-right">
                        KES {txn.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {txn.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell>{getRiskBadge(txn.riskLevel)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {txn.flags.map((flag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {previewData.length > 100 && (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Showing first 100 of {previewData.length} transactions
                </p>
              )}
            </ScrollArea>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => { setPreviewData([]); setFileName(''); }}
              >
                Clear
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Submit {previewData.length} Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
