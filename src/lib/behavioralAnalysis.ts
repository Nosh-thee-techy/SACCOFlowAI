import { Transaction, Alert, MemberProfile } from './types';

// Behavioral analytics - pattern recognition
export function detectBehavioralAnomaly(
  transaction: Transaction,
  memberProfile: MemberProfile,
  memberTransactions: Transaction[]
): Alert | null {
  if (memberTransactions.length < 10) return null; // Need enough history

  const alerts: Partial<Alert>[] = [];

  // 1. Weekly activity pattern analysis
  const weeklyPattern = analyzeWeeklyPattern(memberTransactions);
  const currentDayOfWeek = transaction.timestamp.getDay();
  if (weeklyPattern[currentDayOfWeek] < 0.1 && memberTransactions.length > 20) {
    alerts.push({
      reason: `Unusual day activity: Transaction on ${getDayName(currentDayOfWeek)} when member rarely transacts on this day`,
      confidence: 0.75,
      severity: 'medium',
    });
  }

  // 2. Transaction range pattern
  const amountRange = getTypicalAmountRange(memberTransactions);
  if (transaction.amount < amountRange.min * 0.1 || transaction.amount > amountRange.max * 3) {
    alerts.push({
      reason: `Amount outside typical range: ${transaction.amount.toLocaleString()} vs typical range ${amountRange.min.toLocaleString()}-${amountRange.max.toLocaleString()}`,
      confidence: 0.8,
      severity: transaction.amount > amountRange.max * 5 ? 'high' : 'medium',
    });
  }

  // 3. Balance behavior analysis
  const avgBalance = memberTransactions.reduce((sum, t) => sum + t.account_balance, 0) / memberTransactions.length;
  if (transaction.account_balance < avgBalance * 0.2) {
    alerts.push({
      reason: `Unusual balance depletion: Current balance (${transaction.account_balance.toLocaleString()}) is ${Math.round((1 - transaction.account_balance / avgBalance) * 100)}% below average`,
      confidence: 0.7,
      severity: transaction.account_balance < avgBalance * 0.1 ? 'high' : 'medium',
    });
  }

  // 4. Transaction velocity change
  const recentVelocity = calculateVelocity(memberTransactions.slice(0, 10));
  const historicalVelocity = calculateVelocity(memberTransactions);
  if (recentVelocity > historicalVelocity * 2) {
    alerts.push({
      reason: `Sudden activity increase: Recent transaction rate is ${(recentVelocity / historicalVelocity).toFixed(1)}x higher than normal`,
      confidence: 0.75,
      severity: 'high',
    });
  }

  // 5. Transaction type pattern deviation
  const typePattern = analyzeTypePattern(memberTransactions);
  const currentTypeRatio = typePattern[transaction.transaction_type] || 0;
  if (currentTypeRatio < 0.05 && memberTransactions.length > 15) {
    alerts.push({
      reason: `Rare transaction type: ${transaction.transaction_type.replace('_', ' ')} is unusual for this member (only ${Math.round(currentTypeRatio * 100)}% of history)`,
      confidence: 0.65,
      severity: 'low',
    });
  }

  if (alerts.length === 0) return null;

  // Return the most severe behavioral alert
  const mostSevere = alerts.reduce((prev, curr) => {
    const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
    return severityOrder[curr.severity!] > severityOrder[prev.severity!] ? curr : prev;
  });

  return {
    id: `BHV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'behavioral',
    member_id: transaction.member_id,
    transaction_id: transaction.transaction_id,
    reason: mostSevere.reason!,
    confidence: mostSevere.confidence!,
    severity: mostSevere.severity!,
    timestamp: new Date(),
    reviewed: false,
  } as Alert;
}

// Peer comparison - compare against members with similar profiles
export function detectPeerAnomaly(
  transaction: Transaction,
  allMemberProfiles: MemberProfile[],
  currentProfile: MemberProfile
): Alert | null {
  // Find similar members by average transaction amount
  const similarMembers = allMemberProfiles.filter(p => 
    p.member_id !== currentProfile.member_id &&
    Math.abs(p.avg_transaction_amount - currentProfile.avg_transaction_amount) < currentProfile.avg_transaction_amount * 0.5
  );

  if (similarMembers.length < 3) return null;

  const peerAvgRisk = similarMembers.reduce((sum, p) => sum + p.risk_score, 0) / similarMembers.length;
  
  if (currentProfile.risk_score > peerAvgRisk * 2 && currentProfile.risk_score > 0.5) {
    return {
      id: `PEER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'behavioral',
      member_id: transaction.member_id,
      transaction_id: transaction.transaction_id,
      reason: `Elevated peer risk: Member's risk score (${(currentProfile.risk_score * 100).toFixed(0)}%) is ${(currentProfile.risk_score / peerAvgRisk).toFixed(1)}x higher than similar members`,
      confidence: 0.7,
      severity: currentProfile.risk_score > 0.75 ? 'high' : 'medium',
      timestamp: new Date(),
      reviewed: false,
    };
  }

  return null;
}

// Helper functions
function analyzeWeeklyPattern(transactions: Transaction[]): number[] {
  const dayCounts = new Array(7).fill(0);
  transactions.forEach(t => {
    dayCounts[t.timestamp.getDay()]++;
  });
  const total = transactions.length;
  return dayCounts.map(count => count / total);
}

function getDayName(day: number): string {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day];
}

function getTypicalAmountRange(transactions: Transaction[]): { min: number; max: number } {
  const amounts = transactions.map(t => t.amount).sort((a, b) => a - b);
  const p10 = amounts[Math.floor(amounts.length * 0.1)];
  const p90 = amounts[Math.floor(amounts.length * 0.9)];
  return { min: p10, max: p90 };
}

function calculateVelocity(transactions: Transaction[]): number {
  if (transactions.length < 2) return 0;
  const sortedTxns = [...transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const timeSpan = sortedTxns[0].timestamp.getTime() - sortedTxns[sortedTxns.length - 1].timestamp.getTime();
  const days = Math.max(1, timeSpan / (1000 * 60 * 60 * 24));
  return transactions.length / days;
}

function analyzeTypePattern(transactions: Transaction[]): Record<string, number> {
  const typeCounts: Record<string, number> = {};
  transactions.forEach(t => {
    typeCounts[t.transaction_type] = (typeCounts[t.transaction_type] || 0) + 1;
  });
  const total = transactions.length;
  const pattern: Record<string, number> = {};
  Object.keys(typeCounts).forEach(type => {
    pattern[type] = typeCounts[type] / total;
  });
  return pattern;
}
