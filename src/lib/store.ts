import { create } from 'zustand';
import { Transaction, Alert, MemberProfile, DashboardStats, LiveFeedConfig, DetectionSettings } from './types';
import { 
  generateTransactions, 
  generateAlerts, 
  generateMemberProfiles,
  calculateDashboardStats 
} from './mockData';
import { detectRuleBasedFraud, detectAnomalies, calculateRiskScore } from './fraudDetection';
import { detectBehavioralAnomaly, detectPeerAnomaly } from './behavioralAnalysis';

interface FraudStore {
  transactions: Transaction[];
  alerts: Alert[];
  memberProfiles: MemberProfile[];
  stats: DashboardStats;
  isLoading: boolean;
  theme: 'light' | 'dark';
  liveFeed: LiveFeedConfig;
  settings: DetectionSettings;
  
  // Actions
  initialize: () => void;
  addTransactions: (transactions: Transaction[]) => void;
  markAlertReviewed: (alertId: string) => void;
  runFraudDetection: (transactions: Transaction[]) => void;
  toggleTheme: () => void;
  clearAlerts: () => void;
  setLiveFeed: (config: Partial<LiveFeedConfig>) => void;
  updateSettings: (settings: Partial<DetectionSettings>) => void;
  addHistoricalData: (transactions: Transaction[]) => void;
}

const defaultSettings: DetectionSettings = {
  largeTransactionThreshold: 100000,
  businessHoursStart: 8,
  businessHoursEnd: 18,
  rapidWithdrawalCount: 3,
  zScoreThreshold: 2.5,
  minTransactionHistory: 5,
  volumeSpikeEnabled: true,
  behavioralAnalysisEnabled: true,
};

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
  liveFeed: {
    enabled: false,
    intervalMs: 5000,
  },
  settings: defaultSettings,

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
      
      // Behavioral analysis
      const memberTransactions = transactions.filter(t => t.member_id === txn.member_id);
      const behavioralAlert = detectBehavioralAnomaly(txn, profile, memberTransactions);
      if (behavioralAlert) newAlerts.push(behavioralAlert);
      
      // Peer comparison
      const peerAlert = detectPeerAnomaly(txn, memberProfiles, profile);
      if (peerAlert) newAlerts.push(peerAlert);
    });

    const allTransactions = [...newTransactions, ...transactions].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    const allAlerts = [...newAlerts, ...alerts].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    const stats = calculateDashboardStats(allTransactions, allAlerts);

    // Update member profiles
    const updatedProfiles = memberProfiles.map(profile => {
      const memberTxns = allTransactions.filter(t => t.member_id === profile.member_id);
      if (memberTxns.length > 0) {
        const amounts = memberTxns.map(t => t.amount);
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
        return {
          ...profile,
          avg_transaction_amount: mean,
          std_transaction_amount: Math.sqrt(variance),
          transaction_count: memberTxns.length,
          risk_score: calculateRiskScore(profile.member_id, allTransactions, allAlerts),
        };
      }
      return profile;
    });

    set({
      transactions: allTransactions,
      alerts: allAlerts,
      stats,
      memberProfiles: updatedProfiles,
    });
  },

  addHistoricalData: (historicalTransactions: Transaction[]) => {
    const { transactions, memberProfiles, alerts } = get();
    
    const allTransactions = [...transactions, ...historicalTransactions].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    // Rebuild member profiles with historical data
    const memberIds = [...new Set(allTransactions.map(t => t.member_id))];
    const updatedProfiles = memberIds.map(memberId => {
      const memberTxns = allTransactions.filter(t => t.member_id === memberId);
      const amounts = memberTxns.map(t => t.amount);
      const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
      const hours = memberTxns.map(t => t.timestamp.getHours());
      const typicalHours = [...new Set(hours)].sort((a, b) => 
        hours.filter(h => h === b).length - hours.filter(h => h === a).length
      ).slice(0, 9);
      
      return {
        member_id: memberId,
        avg_transaction_amount: mean,
        std_transaction_amount: Math.sqrt(variance),
        typical_transaction_hours: typicalHours,
        transaction_count: memberTxns.length,
        risk_score: calculateRiskScore(memberId, allTransactions, alerts),
      };
    });
    
    const stats = calculateDashboardStats(allTransactions, alerts);
    
    set({
      transactions: allTransactions,
      memberProfiles: updatedProfiles,
      stats,
    });
  },

  runFraudDetection: (transactionsToCheck: Transaction[]) => {
    const { transactions, memberProfiles, alerts, settings } = get();
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
      
      // Behavioral analysis if enabled
      if (settings.behavioralAnalysisEnabled) {
        const memberTransactions = transactions.filter(t => t.member_id === txn.member_id);
        const behavioralAlert = detectBehavioralAnomaly(txn, profile, memberTransactions);
        if (behavioralAlert) newAlerts.push(behavioralAlert);
      }
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
  
  setLiveFeed: (config: Partial<LiveFeedConfig>) => {
    const { liveFeed } = get();
    set({ liveFeed: { ...liveFeed, ...config } });
  },
  
  updateSettings: (newSettings: Partial<DetectionSettings>) => {
    const { settings } = get();
    set({ settings: { ...settings, ...newSettings } });
  },
}));
