import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useFraudStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Loader2,
  MapPin,
  Smartphone,
  Clock
} from 'lucide-react';
import { RiskPreview } from './RiskPreview';
import { Transaction } from '@/lib/types';

interface FormData {
  memberId: string;
  amount: string;
  transactionType: string;
  accountBalance: string;
  description: string;
}

const initialFormData: FormData = {
  memberId: '',
  amount: '',
  transactionType: '',
  accountBalance: '',
  description: '',
};

export function TransactionEntryForm() {
  const { addTransactions, memberProfiles, transactions } = useFraudStore();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ fingerprint: string; location: string }>({
    fingerprint: '',
    location: '',
  });

  // Auto-capture device metadata
  useEffect(() => {
    const captureDeviceInfo = async () => {
      // Simple device fingerprint (would be more sophisticated in production)
      const fingerprint = `${navigator.userAgent}-${navigator.language}-${screen.width}x${screen.height}`;
      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fingerprint));
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);

      // Try to get location
      let location = 'Unknown';
      try {
        if ('geolocation' in navigator) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        }
      } catch {
        location = 'Location unavailable';
      }

      setDeviceInfo({ fingerprint: hashHex, location });
    };

    captureDeviceInfo();
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setShowPreview(false);
  };

  const isFormValid = () => {
    return (
      formData.memberId.trim() !== '' &&
      formData.amount !== '' &&
      parseFloat(formData.amount) > 0 &&
      formData.transactionType !== '' &&
      formData.accountBalance !== ''
    );
  };

  const generatePreview = () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionId = `TXN${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create transaction for local store
      const newTransaction: Transaction = {
        transaction_id: transactionId,
        member_id: formData.memberId,
        amount: parseFloat(formData.amount),
        timestamp: new Date(),
        transaction_type: formData.transactionType as Transaction['transaction_type'],
        account_balance: parseFloat(formData.accountBalance),
      };

      // Add to local store (triggers fraud detection)
      addTransactions([newTransaction]);

      // Submit to backend
      const { error } = await supabase.functions.invoke('transactions', {
        body: {
          action: 'create',
          transaction: {
            transaction_id: transactionId,
            member_id: formData.memberId,
            amount: parseFloat(formData.amount),
            transaction_type: formData.transactionType,
            account_balance: parseFloat(formData.accountBalance),
            description: formData.description,
            device_fingerprint: deviceInfo.fingerprint,
            geo_location: deviceInfo.location,
          },
        },
      });

      if (error) {
        console.error('Backend error:', error);
        toast.warning('Transaction added locally but backend sync failed');
      } else {
        toast.success('Transaction submitted successfully');
      }

      // Reset form
      setFormData(initialFormData);
      setShowPreview(false);
    } catch (error) {
      console.error('Error submitting transaction:', error);
      toast.error('Failed to submit transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build preview transaction for risk analysis
  const previewTransaction: Transaction | null = isFormValid() ? {
    transaction_id: 'PREVIEW',
    member_id: formData.memberId,
    amount: parseFloat(formData.amount),
    timestamp: new Date(),
    transaction_type: formData.transactionType as Transaction['transaction_type'],
    account_balance: parseFloat(formData.accountBalance),
  } : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Transaction Entry
          </CardTitle>
          <CardDescription>
            Enter transaction details. AI will analyze risk before submission.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="memberId">Member ID *</Label>
              <Input
                id="memberId"
                placeholder="e.g., MEM001"
                value={formData.memberId}
                onChange={(e) => handleChange('memberId', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Select
                value={formData.transactionType}
                onValueChange={(value) => handleChange('transactionType', value)}
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
              <Label htmlFor="accountBalance">Account Balance (KES) *</Label>
              <Input
                id="accountBalance"
                type="number"
                placeholder="0.00"
                value={formData.accountBalance}
                onChange={(e) => handleChange('accountBalance', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Transaction notes..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>

          <Separator />

          {/* Device Metadata */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">Auto-captured Metadata</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                <Smartphone className="h-3 w-3 mr-1" />
                Device: {deviceInfo.fingerprint || 'Capturing...'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />
                {deviceInfo.location || 'Getting location...'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={generatePreview}
              disabled={!isFormValid()}
              className="flex-1"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Analyze Risk
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
              className="flex-1"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Submit Transaction
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Preview Panel */}
      <RiskPreview 
        transaction={previewTransaction}
        showPreview={showPreview}
        memberProfiles={memberProfiles}
        transactions={transactions}
      />
    </div>
  );
}
