import { Transaction, Alert, MemberProfile } from './types';

// Z-score based anomaly detection
export function calculateZScore(value: number, mean: number, std: number): number {
  if (std === 0) return 0;
  return (value - mean) / std;
}

// Rule-based detection
export function detectRuleBasedFraud(
  transaction: Transaction,
  memberProfile: MemberProfile,
  recentTransactions: Transaction[]
): Alert | null {
  const alerts: Partial<Alert>[] = [];

  // Rule 1: Unusually large transaction
  const zScore = calculateZScore(
    transaction.amount,
    memberProfile.avg_transaction_amount,
    memberProfile.std_transaction_amount
  );
  
  if (zScore > 2.5) {
    alerts.push({
      reason: `Large transaction detected: Amount ${transaction.amount.toLocaleString()} is ${zScore.toFixed(1)}σ above member's average`,
      confidence: Math.min(0.95, 0.6 + zScore * 0.1),
      severity: zScore > 4 ? 'critical' : zScore > 3 ? 'high' : 'medium',
      rule_type: 'Large Transaction',
    });
  }

  // Rule 2: Transaction outside business hours (before 8 AM or after 6 PM)
  const hour = transaction.timestamp.getHours();
  if (hour < 8 || hour > 18) {
    alerts.push({
      reason: `Transaction at unusual hour (${hour}:00): Outside normal business hours (8AM-6PM)`,
      confidence: 0.7,
      severity: hour < 5 || hour > 22 ? 'high' : 'medium',
      rule_type: 'Outside Business Hours',
    });
  }

  // Rule 3: Rapid repeated withdrawals (more than 3 withdrawals in last hour)
  const oneHourAgo = new Date(transaction.timestamp.getTime() - 60 * 60 * 1000);
  const recentWithdrawals = recentTransactions.filter(
    t => t.member_id === transaction.member_id &&
    t.transaction_type === 'withdrawal' &&
    t.timestamp >= oneHourAgo
  );
  
  if (recentWithdrawals.length >= 3 && transaction.transaction_type === 'withdrawal') {
    alerts.push({
      reason: `Rapid withdrawals: ${recentWithdrawals.length + 1} withdrawals in the last hour`,
      confidence: 0.8,
      severity: 'high',
      rule_type: 'Rapid Withdrawals',
    });
  }

  // Rule 4: Negative or suspicious balance
  if (transaction.account_balance < 0) {
    alerts.push({
      reason: `Negative balance detected: ${transaction.account_balance.toLocaleString()}`,
      confidence: 0.95,
      severity: 'critical',
      rule_type: 'Suspicious Balance',
    });
  }

  // Rule 5: Large deposit followed by immediate withdrawal
  const thirtyMinutesAgo = new Date(transaction.timestamp.getTime() - 30 * 60 * 1000);
  const recentDeposits = recentTransactions.filter(
    t => t.member_id === transaction.member_id &&
    t.transaction_type === 'deposit' &&
    t.timestamp >= thirtyMinutesAgo &&
    t.amount > 50000
  );

  if (recentDeposits.length > 0 && transaction.transaction_type === 'withdrawal' && transaction.amount > 40000) {
    alerts.push({
      reason: `Deposit-withdrawal pattern: Large deposit (${recentDeposits[0].amount.toLocaleString()}) followed by withdrawal (${transaction.amount.toLocaleString()}) within 30 minutes`,
      confidence: 0.85,
      severity: 'critical',
      rule_type: 'Deposit-Withdrawal Pattern',
    });
  }

  if (alerts.length === 0) return null;

  // Return the most severe alert
  const mostSevere = alerts.reduce((prev, curr) => {
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    return severityOrder[curr.severity!] > severityOrder[prev.severity!] ? curr : prev;
  });

  return {
    id: `ALT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'rule',
    member_id: transaction.member_id,
    transaction_id: transaction.transaction_id,
    reason: mostSevere.reason!,
    confidence: mostSevere.confidence!,
    severity: mostSevere.severity!,
    timestamp: new Date(),
    reviewed: false,
    rule_type: mostSevere.rule_type,
  } as Alert;
}

// Statistical anomaly detection using Z-score
export function detectAnomalies(
  transaction: Transaction,
  memberProfile: MemberProfile,
  allTransactions: Transaction[]
): Alert | null {
  // Calculate member's transaction statistics
  const memberTransactions = allTransactions.filter(t => t.member_id === transaction.member_id);
  
  if (memberTransactions.length < 5) return null; // Not enough history

  const amounts = memberTransactions.map(t => t.amount);
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
  const std = Math.sqrt(variance);

  const zScore = calculateZScore(transaction.amount, mean, std);

  // Detect anomaly if z-score is significant
  if (Math.abs(zScore) > 2) {
    const severity = Math.abs(zScore) > 4 ? 'critical' : Math.abs(zScore) > 3 ? 'high' : 'medium';
    
    return {
      id: `ANM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'anomaly',
      member_id: transaction.member_id,
      transaction_id: transaction.transaction_id,
      reason: `Statistical anomaly: Transaction amount (${transaction.amount.toLocaleString()}) deviates ${Math.abs(zScore).toFixed(1)}σ from member's average (${mean.toLocaleString()})`,
      confidence: Math.min(0.95, 0.5 + Math.abs(zScore) * 0.1),
      severity,
      timestamp: new Date(),
      reviewed: false,
    };
  }

  // Detect volume spike
  const last24Hours = allTransactions.filter(
    t => t.timestamp >= new Date(Date.now() - 24 * 60 * 60 * 1000)
  );
  const avgDailyVolume = allTransactions.length / 30; // Assuming 30 days of data
  
  if (last24Hours.length > avgDailyVolume * 2) {
    return {
      id: `ANM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'anomaly',
      member_id: 'SYSTEM',
      transaction_id: transaction.transaction_id,
      reason: `Volume spike detected: ${last24Hours.length} transactions in last 24 hours vs average of ${avgDailyVolume.toFixed(0)} daily`,
      confidence: 0.75,
      severity: 'medium',
      timestamp: new Date(),
      reviewed: false,
    };
  }

  return null;
}

// Calculate risk score for a member
export function calculateRiskScore(
  memberId: string,
  transactions: Transaction[],
  alerts: Alert[]
): number {
  const memberTransactions = transactions.filter(t => t.member_id === memberId);
  const memberAlerts = alerts.filter(a => a.member_id === memberId);

  if (memberTransactions.length === 0) return 0;

  const alertRate = memberAlerts.length / memberTransactions.length;
  const criticalAlerts = memberAlerts.filter(a => a.severity === 'critical').length;
  const highAlerts = memberAlerts.filter(a => a.severity === 'high').length;

  // Weighted score
  const score = (
    alertRate * 30 +
    (criticalAlerts / memberTransactions.length) * 40 +
    (highAlerts / memberTransactions.length) * 20 +
    (memberAlerts.filter(a => !a.reviewed).length / (memberAlerts.length || 1)) * 10
  );

  return Math.min(1, Math.max(0, score));
}

// Parse CSV data
export function parseCSV(csvText: string): Transaction[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });

    return {
      transaction_id: obj.transaction_id || `TXN${String(index + 1).padStart(6, '0')}`,
      member_id: obj.member_id || 'UNKNOWN',
      amount: parseFloat(obj.amount) || 0,
      timestamp: new Date(obj.timestamp) || new Date(),
      transaction_type: (obj.transaction_type as Transaction['transaction_type']) || 'transfer',
      account_balance: parseFloat(obj.account_balance) || 0,
    };
  });
}
