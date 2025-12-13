import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

interface DeferredTransaction {
  id: string;
  transaction_id: string;
  member_id: string;
  amount: number;
  transaction_type: string;
  risk_score: number;
  note: string;
  reminder_time: Date;
  deferred_at: Date;
  flags: string[];
  ai_explanation?: string;
}

interface SimulatedNotification {
  id: string;
  type: 'sms' | 'email' | 'letter' | 'voice';
  subject: string;
  message: string;
  recipient: string;
  triggered_by: string;
  timestamp: Date;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

interface DemoTransaction {
  id: string;
  transaction_id: string;
  member_id: string;
  amount: number;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'loan';
  status: 'pending' | 'approved' | 'rejected' | 'deferred';
  risk_score: number;
  flags: string[];
  human_impact: 'low' | 'medium' | 'high';
  created_at: Date;
  ai_metadata: {
    category: string;
    risk_reasons: string[];
    behavioral_pattern: string;
    suggested_action: string;
  };
}

interface DemoModeContextType {
  isDemo: boolean;
  setIsDemo: (value: boolean) => void;
  transactions: DemoTransaction[];
  deferredTransactions: DeferredTransaction[];
  notifications: SimulatedNotification[];
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string, reason: string) => void;
  deferTransaction: (id: string, note: string, reminderTime: Date) => void;
  triggerHighRiskTransaction: () => void;
  clearNotifications: () => void;
  getDiaryReminders: () => DeferredTransaction[];
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

const generateMockTransactions = (): DemoTransaction[] => {
  const types: Array<'deposit' | 'withdrawal' | 'transfer' | 'loan'> = ['deposit', 'withdrawal', 'transfer', 'loan'];
  const members = ['MEM001', 'MEM002', 'MEM003', 'MEM004', 'MEM005'];
  
  return [
    {
      id: 'txn-1',
      transaction_id: 'TXN-2024-001',
      member_id: 'MEM001',
      amount: 150000,
      transaction_type: 'withdrawal',
      status: 'pending',
      risk_score: 75,
      flags: ['Large withdrawal', 'Off-hours activity'],
      human_impact: 'high',
      created_at: new Date(),
      ai_metadata: {
        category: 'High-value withdrawal',
        risk_reasons: [
          'Amount exceeds member average by 3.2x',
          'Transaction initiated outside business hours (7:45 AM)',
          'This member typically transacts between 10 AM - 4 PM'
        ],
        behavioral_pattern: 'burst',
        suggested_action: 'Request additional verification before approval'
      }
    },
    {
      id: 'txn-2',
      transaction_id: 'TXN-2024-002',
      member_id: 'MEM002',
      amount: 25000,
      transaction_type: 'deposit',
      status: 'pending',
      risk_score: 15,
      flags: [],
      human_impact: 'low',
      created_at: new Date(Date.now() - 3600000),
      ai_metadata: {
        category: 'Regular deposit',
        risk_reasons: [],
        behavioral_pattern: 'normal',
        suggested_action: 'Safe to approve'
      }
    },
    {
      id: 'txn-3',
      transaction_id: 'TXN-2024-003',
      member_id: 'MEM003',
      amount: 500000,
      transaction_type: 'loan',
      status: 'pending',
      risk_score: 45,
      flags: ['Large loan request', 'New account'],
      human_impact: 'medium',
      created_at: new Date(Date.now() - 7200000),
      ai_metadata: {
        category: 'Loan disbursement',
        risk_reasons: [
          'Account opened within last 6 months',
          'Limited transaction history for credit assessment'
        ],
        behavioral_pattern: 'normal',
        suggested_action: 'Review credit history and collateral documentation'
      }
    },
    {
      id: 'txn-4',
      transaction_id: 'TXN-2024-004',
      member_id: 'MEM004',
      amount: 80000,
      transaction_type: 'transfer',
      status: 'pending',
      risk_score: 85,
      flags: ['Rapid transfer sequence', 'Unusual recipient', 'Device mismatch'],
      human_impact: 'high',
      created_at: new Date(Date.now() - 1800000),
      ai_metadata: {
        category: 'Suspicious transfer',
        risk_reasons: [
          'Third transfer in 24 hours to different recipients',
          'New device detected (possible SIM-swap)',
          'Geographic location differs from usual pattern'
        ],
        behavioral_pattern: 'burst',
        suggested_action: 'Hold transaction and contact member directly'
      }
    },
    {
      id: 'txn-5',
      transaction_id: 'TXN-2024-005',
      member_id: 'MEM005',
      amount: 12000,
      transaction_type: 'withdrawal',
      status: 'pending',
      risk_score: 20,
      flags: [],
      human_impact: 'low',
      created_at: new Date(Date.now() - 900000),
      ai_metadata: {
        category: 'Standard withdrawal',
        risk_reasons: [],
        behavioral_pattern: 'normal',
        suggested_action: 'Safe to approve'
      }
    }
  ];
};

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(true);
  const [transactions, setTransactions] = useState<DemoTransaction[]>(generateMockTransactions);
  const [deferredTransactions, setDeferredTransactions] = useState<DeferredTransaction[]>([]);
  const [notifications, setNotifications] = useState<SimulatedNotification[]>([]);

  // Check for due reminders
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      deferredTransactions.forEach(dt => {
        if (dt.reminder_time <= now) {
          toast.info(`Reminder: Review deferred transaction for ${dt.member_id}`, {
            description: dt.note,
            duration: 10000,
          });
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [deferredTransactions]);

  const approveTransaction = (id: string) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, status: 'approved' as const } : t)
    );
    
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      // Generate approval notification
      const notification: SimulatedNotification = {
        id: `notif-${Date.now()}`,
        type: 'sms',
        subject: 'Transaction Approved',
        message: `Your ${tx.transaction_type} of KES ${tx.amount.toLocaleString()} has been approved.`,
        recipient: tx.member_id,
        triggered_by: 'Transaction approval',
        timestamp: new Date(),
        urgency: 'low'
      };
      setNotifications(prev => [notification, ...prev]);
      toast.success('Transaction approved successfully');
    }
  };

  const rejectTransaction = (id: string, reason: string) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, status: 'rejected' as const } : t)
    );
    
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      const notification: SimulatedNotification = {
        id: `notif-${Date.now()}`,
        type: 'sms',
        subject: 'Transaction Declined',
        message: `Your ${tx.transaction_type} request has been declined. Please contact your branch for more information.`,
        recipient: tx.member_id,
        triggered_by: 'Transaction rejection',
        timestamp: new Date(),
        urgency: 'medium'
      };
      setNotifications(prev => [notification, ...prev]);
      toast.error('Transaction rejected');
    }
  };

  const deferTransaction = (id: string, note: string, reminderTime: Date) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setTransactions(prev => 
        prev.map(t => t.id === id ? { ...t, status: 'deferred' as const } : t)
      );
      
      const deferred: DeferredTransaction = {
        id: tx.id,
        transaction_id: tx.transaction_id,
        member_id: tx.member_id,
        amount: tx.amount,
        transaction_type: tx.transaction_type,
        risk_score: tx.risk_score,
        note,
        reminder_time: reminderTime,
        deferred_at: new Date(),
        flags: tx.flags,
        ai_explanation: tx.ai_metadata.risk_reasons.join('; ')
      };
      
      setDeferredTransactions(prev => [...prev, deferred]);
      toast.info('Transaction deferred - reminder set', {
        description: `You'll be reminded at ${reminderTime.toLocaleTimeString()}`
      });
    }
  };

  const triggerHighRiskTransaction = () => {
    const highRiskTx: DemoTransaction = {
      id: `txn-${Date.now()}`,
      transaction_id: `TXN-2024-${Date.now().toString().slice(-3)}`,
      member_id: 'MEM001',
      amount: 750000,
      transaction_type: 'withdrawal',
      status: 'pending',
      risk_score: 95,
      flags: ['SIM-swap detected', 'New device', 'Large amount', 'Dormant account reactivation'],
      human_impact: 'high',
      created_at: new Date(),
      ai_metadata: {
        category: 'Potential fraud attempt',
        risk_reasons: [
          'CRITICAL: SIM-swap detected in last 48 hours',
          'Account dormant for 8 months, now requesting large withdrawal',
          'Device fingerprint does not match any previous transactions',
          'Geographic location: Different country detected'
        ],
        behavioral_pattern: 'dormant reactivation',
        suggested_action: 'HOLD IMMEDIATELY - Contact member via verified alternative channel'
      }
    };

    setTransactions(prev => [highRiskTx, ...prev]);

    // Generate multiple notifications
    const smsNotif: SimulatedNotification = {
      id: `notif-sms-${Date.now()}`,
      type: 'sms',
      subject: 'Security Alert',
      message: 'Unusual activity detected on your account. If you did not initiate this, please contact us immediately at 0800-XXX-XXX.',
      recipient: highRiskTx.member_id,
      triggered_by: 'High-risk transaction detection',
      timestamp: new Date(),
      urgency: 'critical'
    };

    const emailNotif: SimulatedNotification = {
      id: `notif-email-${Date.now()}`,
      type: 'email',
      subject: 'Urgent: Unusual Account Activity Detected',
      message: 'Dear Member, we have detected unusual activity on your SACCO account. A withdrawal request of KES 750,000 has been placed on hold for your protection. Please contact your branch immediately to verify this transaction.',
      recipient: highRiskTx.member_id,
      triggered_by: 'High-risk transaction detection',
      timestamp: new Date(),
      urgency: 'critical'
    };

    setNotifications(prev => [smsNotif, emailNotif, ...prev]);

    toast.warning('⚠️ High-risk transaction detected!', {
      description: 'AI has flagged a potentially fraudulent transaction',
      duration: 10000,
    });
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getDiaryReminders = () => {
    return deferredTransactions.sort((a, b) => 
      a.reminder_time.getTime() - b.reminder_time.getTime()
    );
  };

  return (
    <DemoModeContext.Provider value={{
      isDemo,
      setIsDemo,
      transactions,
      deferredTransactions,
      notifications,
      approveTransaction,
      rejectTransaction,
      deferTransaction,
      triggerHighRiskTransaction,
      clearNotifications,
      getDiaryReminders
    }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (!context) {
    throw new Error('useDemoMode must be used within DemoModeProvider');
  }
  return context;
}
