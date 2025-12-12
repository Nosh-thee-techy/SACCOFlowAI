import { create } from 'zustand';
import { Transaction, Alert, MemberProfile, DashboardStats } from './types';
import { 
  generateTransactions, 
  generateAlerts, 
  generateMemberProfiles,
  calculateDashboardStats 
} from './mockData';
import { detectRuleBasedFraud, detectAnomalies, calculateRiskScore } from './fraudDetection';

interface FraudStore {
  transactions: Transaction[];
  alerts: Alert[];
  memberProfiles: MemberProfile[];
  stats: DashboardStats;
  isLoading: boolean;
  theme: 'light' | 'dark';
  
  // Actions
  initialize: () => void;
  addTransactions: (transactions: Transaction[]) => void;
  markAlertReviewed: (alertId: string) => void;
  runFraudDetection: (transactions: Transaction[]) => void;
  toggleTheme: () => void;
  clearAlerts: () => void;
}

export const useFraudStore = create<FraudStore>((set, get) => ({
  transactions: [],
  alerts: [],
  memberProfiles: [],
  stats: {
    totalTransactions: 0,
    totalAlerts: 0,
    criticalAlerts: 0,
    suspiciousRate: 0,
    totalVolume: 0,
    reviewedAlerts: 0,
  },
  isLoading: true,
  theme: 'dark',

  initialize: () => {
    const transactions = generateTransactions(200);
    const alerts = generateAlerts(transactions);
    const memberProfiles = generateMemberProfiles();
    const stats = calculateDashboardStats(transactions, alerts);

    // Update member profiles with risk scores
    const updatedProfiles = memberProfiles.map(profile => ({
      ...profile,
      risk_score: calculateRiskScore(profile.member_id, transactions, alerts),
    }));

    set({
      transactions,
      alerts,
      memberProfiles: updatedProfiles,
      stats,
      isLoading: false,
    });
  },

  addTransactions: (newTransactions: Transaction[]) => {
    const { transactions, alerts, memberProfiles } = get();
    
    // Run fraud detection on new transactions
    const newAlerts: Alert[] = [];
    
    newTransactions.forEach(txn => {
      const profile = memberProfiles.find(p => p.member_id === txn.member_id) || {
        member_id: txn.member_id,
        avg_transaction_amount: 10000,
        std_transaction_amount: 5000,
        typical_transaction_hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
        transaction_count: 0,
        risk_score: 0,
      };

      const ruleAlert = detectRuleBasedFraud(txn, profile, transactions);
      const anomalyAlert = detectAnomalies(txn, profile, transactions);

      if (ruleAlert) newAlerts.push(ruleAlert);
      if (anomalyAlert) newAlerts.push(anomalyAlert);
    });

    const allTransactions = [...newTransactions, ...transactions].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    const allAlerts = [...newAlerts, ...alerts].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    const stats = calculateDashboardStats(allTransactions, allAlerts);

    set({
      transactions: allTransactions,
      alerts: allAlerts,
      stats,
    });
  },

  runFraudDetection: (transactionsToCheck: Transaction[]) => {
    const { transactions, memberProfiles, alerts } = get();
    const newAlerts: Alert[] = [];

    transactionsToCheck.forEach(txn => {
      const profile = memberProfiles.find(p => p.member_id === txn.member_id) || {
        member_id: txn.member_id,
        avg_transaction_amount: 10000,
        std_transaction_amount: 5000,
        typical_transaction_hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
        transaction_count: 0,
        risk_score: 0,
      };

      const ruleAlert = detectRuleBasedFraud(txn, profile, transactions);
      const anomalyAlert = detectAnomalies(txn, profile, transactions);

      if (ruleAlert) newAlerts.push(ruleAlert);
      if (anomalyAlert) newAlerts.push(anomalyAlert);
    });

    if (newAlerts.length > 0) {
      const allAlerts = [...newAlerts, ...alerts].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
      const stats = calculateDashboardStats(transactions, allAlerts);
      set({ alerts: allAlerts, stats });
    }
  },

  markAlertReviewed: (alertId: string) => {
    const { alerts, transactions } = get();
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, reviewed: true } : alert
    );
    const stats = calculateDashboardStats(transactions, updatedAlerts);
    set({ alerts: updatedAlerts, stats });
  },

  toggleTheme: () => {
    const { theme } = get();
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    set({ theme: newTheme });
  },

  clearAlerts: () => {
    const { transactions } = get();
    const stats = calculateDashboardStats(transactions, []);
    set({ alerts: [], stats });
  },
}));
