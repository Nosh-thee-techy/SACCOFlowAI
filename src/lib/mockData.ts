import { Transaction, Alert, MemberProfile, DashboardStats, ChartDataPoint, HeatmapData } from './types';

const memberIds = ['M001', 'M002', 'M003', 'M004', 'M005', 'M006', 'M007', 'M008', 'M009', 'M010'];
const transactionTypes: Transaction['transaction_type'][] = ['deposit', 'withdrawal', 'transfer', 'loan_disbursement', 'loan_repayment'];

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomAmount(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export function generateTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < count; i++) {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const isSuspicious = Math.random() < 0.15; // 15% suspicious transactions
    
    let amount = randomAmount(100, 50000);
    if (isSuspicious) {
      amount = randomAmount(100000, 500000); // Unusually large
    }

    const timestamp = randomDate(thirtyDaysAgo, now);
    if (isSuspicious && Math.random() < 0.5) {
      // Set to outside business hours
      timestamp.setHours(Math.random() < 0.5 ? Math.floor(Math.random() * 6) : 22 + Math.floor(Math.random() * 2));
    }

    transactions.push({
      transaction_id: `TXN${String(i + 1).padStart(6, '0')}`,
      member_id: memberIds[Math.floor(Math.random() * memberIds.length)],
      amount,
      timestamp,
      transaction_type: type,
      account_balance: randomAmount(1000, 1000000),
    });
  }

  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateAlerts(transactions: Transaction[]): Alert[] {
  const alerts: Alert[] = [];
  const ruleTypes = [
    'Large Transaction',
    'Outside Business Hours',
    'Rapid Withdrawals',
    'Suspicious Balance',
    'Deposit-Withdrawal Pattern',
  ];

  transactions.forEach((txn, index) => {
    const shouldAlert = Math.random() < 0.2; // 20% of transactions generate alerts
    
    if (shouldAlert) {
      const isAnomaly = Math.random() < 0.4;
      const severity = (['low', 'medium', 'high', 'critical'] as const)[Math.floor(Math.random() * 4)];
      
      alerts.push({
        id: `ALT${String(index + 1).padStart(6, '0')}`,
        type: isAnomaly ? 'anomaly' : 'rule',
        member_id: txn.member_id,
        transaction_id: txn.transaction_id,
        reason: isAnomaly 
          ? `Statistical anomaly detected: Transaction amount deviates ${Math.floor(Math.random() * 3 + 2)}σ from member's average`
          : `${ruleTypes[Math.floor(Math.random() * ruleTypes.length)]}: ${txn.amount > 100000 ? 'Amount exceeds threshold' : 'Unusual pattern detected'}`,
        confidence: Math.round((0.6 + Math.random() * 0.4) * 100) / 100,
        severity,
        timestamp: txn.timestamp,
        reviewed: Math.random() < 0.3,
        rule_type: isAnomaly ? undefined : ruleTypes[Math.floor(Math.random() * ruleTypes.length)],
      });
    }
  });

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function generateMemberProfiles(): MemberProfile[] {
  return memberIds.map(id => ({
    member_id: id,
    avg_transaction_amount: randomAmount(5000, 50000),
    std_transaction_amount: randomAmount(1000, 10000),
    typical_transaction_hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    transaction_count: Math.floor(Math.random() * 100 + 20),
    risk_score: Math.round(Math.random() * 100) / 100,
  }));
}

export function calculateDashboardStats(transactions: Transaction[], alerts: Alert[]): DashboardStats {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const reviewedAlerts = alerts.filter(a => a.reviewed).length;
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    totalTransactions: transactions.length,
    totalAlerts: alerts.length,
    criticalAlerts,
    suspiciousRate: Math.round((alerts.length / transactions.length) * 100 * 100) / 100,
    totalVolume,
    reviewedAlerts,
  };
}

export function generateVolumeChartData(): ChartDataPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    name: day,
    transactions: Math.floor(Math.random() * 500 + 200),
    alerts: Math.floor(Math.random() * 50 + 10),
    value: Math.floor(Math.random() * 500 + 200),
  }));
}

export function generateHourlyData(): ChartDataPoint[] {
  return Array.from({ length: 24 }, (_, i) => ({
    name: `${i.toString().padStart(2, '0')}:00`,
    value: Math.floor(Math.random() * 100 + (i >= 9 && i <= 17 ? 50 : 10)),
    transactions: Math.floor(Math.random() * 100 + (i >= 9 && i <= 17 ? 50 : 10)),
  }));
}

export function generateHeatmapData(): HeatmapData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data: HeatmapData[] = [];
  
  days.forEach(day => {
    for (let hour = 0; hour < 24; hour++) {
      const isBusinessHour = hour >= 9 && hour <= 17 && day !== 'Sat' && day !== 'Sun';
      data.push({
        hour,
        day,
        value: Math.floor(Math.random() * (isBusinessHour ? 20 : 50) + (isBusinessHour ? 0 : 10)),
      });
    }
  });

  return data;
}

export function generateMonthlyTrend(): ChartDataPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    name: month,
    value: Math.floor(Math.random() * 1000000 + 500000),
    transactions: Math.floor(Math.random() * 2000 + 1000),
    alerts: Math.floor(Math.random() * 200 + 50),
  }));
}
