import { useState } from 'react';
import { Transaction } from '@/lib/types';
import { useFraudStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

const transactionSchema = z.object({
  member_id: z.string().min(1, 'Member ID is required').max(20),
  amount: z.number().positive('Amount must be positive').max(10000000, 'Amount too large'),
  transaction_type: z.enum(['deposit', 'withdrawal', 'transfer', 'loan_disbursement', 'loan_repayment']),
  account_balance: z.number().min(0, 'Balance cannot be negative'),
});

interface ManualEntryFormProps {
  onSuccess?: () => void;
}

export function ManualEntryForm({ onSuccess }: ManualEntryFormProps) {
  const { addTransactions, runFraudDetection } = useFraudStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    member_id: '',
    amount: '',
    transaction_type: 'deposit' as Transaction['transaction_type'],
    account_balance: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const parsed = transactionSchema.parse({
        member_id: formData.member_id.trim(),
        amount: parseFloat(formData.amount),
        transaction_type: formData.transaction_type,
        account_balance: parseFloat(formData.account_balance),
      });

      const transaction: Transaction = {
        transaction_id: `TXN${Date.now()}`,
        member_id: parsed.member_id,
        amount: parsed.amount,
        timestamp: new Date(),
        transaction_type: parsed.transaction_type,
        account_balance: parsed.account_balance,
      };

      addTransactions([transaction]);
      runFraudDetection([transaction]);

      toast.success('Transaction added successfully', {
        description: `Transaction ${transaction.transaction_id} has been processed`,
      });

      // Reset form
      setFormData({
        member_id: '',
        amount: '',
        transaction_type: 'deposit',
        account_balance: '',
      });

      onSuccess?.();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error('Validation error', {
          description: error.errors[0].message,
        });
      } else {
        toast.error('Failed to add transaction');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PlusCircle className="h-5 w-5 text-primary" />
          Manual Entry
        </CardTitle>
        <CardDescription>Add a single transaction for immediate analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member_id">Member ID</Label>
              <Input
                id="member_id"
                placeholder="e.g., M001"
                value={formData.member_id}
                onChange={(e) => setFormData(prev => ({ ...prev, member_id: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 50000"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Transaction Type</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, transaction_type: value as Transaction['transaction_type'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="loan_disbursement">Loan Disbursement</SelectItem>
                  <SelectItem value="loan_repayment">Loan Repayment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Account Balance (KES)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 100000"
                value={formData.account_balance}
                onChange={(e) => setFormData(prev => ({ ...prev, account_balance: e.target.value }))}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <PlusCircle className="h-4 w-4 mr-2" />
            )}
            Add Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
