import { Transaction } from './types';

const memberIds = ['M001', 'M002', 'M003', 'M004', 'M005', 'M006', 'M007', 'M008', 'M009', 'M010', 'M011', 'M012'];
const transactionTypes: Transaction['transaction_type'][] = ['deposit', 'withdrawal', 'transfer', 'loan_disbursement', 'loan_repayment'];

let transactionCounter = Date.now();

// Generate a single realistic transaction
export function generateSingleTransaction(): Transaction {
  transactionCounter++;
  
  const isSuspicious = Math.random() < 0.2; // 20% chance of suspicious activity
  const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
  
  let amount = Math.round((Math.random() * 45000 + 5000) * 100) / 100;
  
  // Make some transactions suspicious
  if (isSuspicious) {
    const suspiciousType = Math.random();
    if (suspiciousType < 0.33) {
      // Large transaction
      amount = Math.round((Math.random() * 400000 + 150000) * 100) / 100;
    } else if (suspiciousType < 0.66) {
      // Very small probing transaction
      amount = Math.round((Math.random() * 100 + 10) * 100) / 100;
    }
  }
  
  const timestamp = new Date();
  
  // Sometimes set to off-hours
  if (isSuspicious && Math.random() < 0.4) {
    timestamp.setHours(Math.random() < 0.5 ? 
      Math.floor(Math.random() * 5) : // Early morning
      22 + Math.floor(Math.random() * 2) // Late night
    );
  }

  return {
    transaction_id: `TXN${transactionCounter}`,
    member_id: memberIds[Math.floor(Math.random() * memberIds.length)],
    amount,
    timestamp,
    transaction_type: type,
    account_balance: Math.round((Math.random() * 900000 + 10000) * 100) / 100,
  };
}

// Generate batch of transactions for history upload
export function generateHistoricalTransactions(count: number, memberId?: string): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 180); // 6 months of history
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Set random hour during business hours for most transactions
    timestamp.setHours(Math.floor(Math.random() * 10) + 8); // 8am-6pm
    timestamp.setMinutes(Math.floor(Math.random() * 60));
    
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    
    transactions.push({
      transaction_id: `HIST${Date.now()}-${i}`,
      member_id: memberId || memberIds[Math.floor(Math.random() * memberIds.length)],
      amount: Math.round((Math.random() * 50000 + 1000) * 100) / 100,
      timestamp,
      transaction_type: type,
      account_balance: Math.round((Math.random() * 500000 + 20000) * 100) / 100,
    });
  }
  
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}
