export interface Transaction {
  transaction_id: string;
  member_id: string;
  amount: number;
  timestamp: Date;
  transaction_type: 'deposit' | 'withdrawal' | 'transfer' | 'loan_disbursement' | 'loan_repayment';
  account_balance: number;
}

export interface Alert {
  id: string;
  type: 'rule' | 'anomaly';
  member_id: string;
  transaction_id: string;
  reason: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  reviewed: boolean;
  rule_type?: string;
}

export interface MemberProfile {
  member_id: string;
  avg_transaction_amount: number;
  std_transaction_amount: number;
  typical_transaction_hours: number[];
  transaction_count: number;
  risk_score: number;
}

export interface DashboardStats {
  totalTransactions: number;
  totalAlerts: number;
  criticalAlerts: number;
  suspiciousRate: number;
  totalVolume: number;
  reviewedAlerts: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  transactions?: number;
  alerts?: number;
}

export interface HeatmapData {
  hour: number;
  day: string;
  value: number;
}
