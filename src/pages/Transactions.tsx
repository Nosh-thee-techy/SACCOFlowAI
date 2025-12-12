import { useState, useMemo, useCallback } from 'react';
import { useFraudStore } from '@/lib/store';
import { parseCSV } from '@/lib/fraudDetection';
import { Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Upload, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  FileSpreadsheet,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type SortField = 'timestamp' | 'amount' | 'member_id';
type SortDirection = 'asc' | 'desc';

export default function Transactions() {
  const { transactions, addTransactions, runFraudDetection } = useFraudStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      
      if (parsed.length === 0) {
        toast.error('No valid transactions found in the file');
        return;
      }

      addTransactions(parsed);
      runFraudDetection(parsed);
      
      toast.success(`Successfully imported ${parsed.length} transactions`, {
        description: 'Fraud detection analysis complete',
      });
    } catch (error) {
      toast.error('Failed to parse CSV file', {
        description: 'Please ensure the file is properly formatted',
      });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }, [addTransactions, runFraudDetection]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.transaction_id.toLowerCase().includes(searchLower) ||
          t.member_id.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.transaction_type === typeFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'timestamp':
          comparison = a.timestamp.getTime() - b.timestamp.getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'member_id':
          comparison = a.member_id.localeCompare(b.member_id);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [transactions, search, typeFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const getTypeColor = (type: Transaction['transaction_type']) => {
    switch (type) {
      case 'deposit':
        return 'success';
      case 'withdrawal':
        return 'warning';
      case 'transfer':
        return 'info';
      case 'loan_disbursement':
        return 'secondary';
      case 'loan_repayment':
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Transaction Feed
          </h1>
          <p className="text-muted-foreground">
            View and upload SACCO transactions for fraud analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="gradient" disabled={isUploading} asChild>
              <span>
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload CSV
              </span>
            </Button>
          </label>
        </div>
      </div>

      {/* CSV Format Info */}
      <Card variant="glass" className="border-dashed">
        <CardContent className="flex items-center gap-4 py-4">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium">CSV Format</p>
            <p className="text-sm text-muted-foreground">
              Required columns: transaction_id, member_id, amount, timestamp, transaction_type, account_balance
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID or member ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="loan_disbursement">Loan Disbursement</SelectItem>
                <SelectItem value="loan_repayment">Loan Repayment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transactions</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Transaction ID</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('member_id')}
                      className="flex items-center gap-2 hover:text-foreground"
                    >
                      Member ID
                      {getSortIcon('member_id')}
                    </button>
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-2 ml-auto hover:text-foreground"
                    >
                      Amount
                      {getSortIcon('amount')}
                    </button>
                  </TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>
                    <button
                      onClick={() => handleSort('timestamp')}
                      className="flex items-center gap-2 hover:text-foreground"
                    >
                      Timestamp
                      {getSortIcon('timestamp')}
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-8 w-8" />
                        <p>No transactions found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.slice(0, 50).map((txn) => (
                    <TableRow key={txn.transaction_id} className="group">
                      <TableCell className="font-mono text-sm">
                        {txn.transaction_id}
                      </TableCell>
                      <TableCell className="font-medium">{txn.member_id}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeColor(txn.transaction_type)}>
                          {txn.transaction_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-mono",
                        txn.transaction_type === 'withdrawal' && "text-warning",
                        txn.transaction_type === 'deposit' && "text-success",
                      )}>
                        {txn.transaction_type === 'withdrawal' ? '-' : '+'}
                        KES {txn.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        KES {txn.account_balance.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {txn.timestamp.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredTransactions.length > 50 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Showing 50 of {filteredTransactions.length} transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
