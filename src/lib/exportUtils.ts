import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Alert } from './types';
import { format } from 'date-fns';

// CSV Export utilities
export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers.map((header) => {
        const value = row[header];
        // Handle dates and complex values
        if (value instanceof Date) {
          return format(value, 'yyyy-MM-dd HH:mm:ss');
        }
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value ?? '');
      }).join(',')
    ),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

export function exportTransactionsToCSV(transactions: Transaction[]): void {
  const data = transactions.map((txn) => ({
    transaction_id: txn.transaction_id,
    member_id: txn.member_id,
    transaction_type: txn.transaction_type,
    amount: txn.amount,
    timestamp: txn.timestamp,
    account_balance: txn.account_balance,
  }));
  exportToCSV(data, `transactions_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
}

export function exportAlertsToCSV(alerts: Alert[]): void {
  const data = alerts.map((alert) => ({
    id: alert.id,
    type: alert.type,
    severity: alert.severity,
    member_id: alert.member_id,
    transaction_id: alert.transaction_id,
    reason: alert.reason,
    confidence: Math.round(alert.confidence * 100) + '%',
    timestamp: alert.timestamp,
    reviewed: alert.reviewed ? 'Yes' : 'No',
    rule_type: alert.rule_type || '',
  }));
  exportToCSV(data, `alerts_${format(new Date(), 'yyyyMMdd_HHmmss')}`);
}

// PDF Export utilities
export function exportAlertsToPDF(alerts: Alert[]): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('FraudGuard Alert Report', 14, 18);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 28);
  doc.text(`Total Alerts: ${alerts.length}`, 14, 34);

  // Stats summary
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text('Summary', 14, 50);

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const highCount = alerts.filter((a) => a.severity === 'high').length;
  const reviewedCount = alerts.filter((a) => a.reviewed).length;

  doc.setFontSize(10);
  doc.text(`Critical: ${criticalCount}  |  High: ${highCount}  |  Pending: ${alerts.length - reviewedCount}  |  Reviewed: ${reviewedCount}`, 14, 58);

  // Alerts table
  autoTable(doc, {
    startY: 65,
    head: [['Type', 'Severity', 'Member ID', 'Reason', 'Confidence', 'Timestamp', 'Status']],
    body: alerts.map((alert) => [
      alert.type,
      alert.severity,
      alert.member_id,
      alert.reason.length > 40 ? alert.reason.substring(0, 40) + '...' : alert.reason,
      Math.round(alert.confidence * 100) + '%',
      format(alert.timestamp, 'MM/dd HH:mm'),
      alert.reviewed ? 'Reviewed' : 'Pending',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`fraud_alerts_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
}

export function exportTransactionsToPDF(transactions: Transaction[]): void {
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('FraudGuard Transaction Report', 14, 16);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 14, 24);
  doc.text(`Total Transactions: ${transactions.length}`, 14, 30);

  // Stats
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Total Volume: KES ${totalVolume.toLocaleString()}`, 14, 45);

  // Table
  autoTable(doc, {
    startY: 52,
    head: [['Transaction ID', 'Member ID', 'Type', 'Amount (KES)', 'Balance', 'Timestamp']],
    body: transactions.map((txn) => [
      txn.transaction_id,
      txn.member_id,
      txn.transaction_type,
      txn.amount.toLocaleString(),
      txn.account_balance.toLocaleString(),
      format(txn.timestamp, 'MM/dd HH:mm'),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`transactions_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
}

export function exportDashboardReportPDF(
  stats: { totalTransactions: number; totalAlerts: number; criticalAlerts: number; suspiciousRate: number; totalVolume: number; reviewedAlerts: number },
  alerts: Alert[],
  transactions: Transaction[]
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text('FraudGuard', 14, 18);
  doc.setFontSize(14);
  doc.text('SACCO Fraud Detection Dashboard Report', 14, 28);
  
  doc.setFontSize(10);
  doc.text(`Report Date: ${format(new Date(), 'PPpp')}`, 14, 38);

  // Key Metrics
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Key Metrics', 14, 58);

  doc.setFontSize(10);
  doc.text(`Total Transactions: ${stats.totalTransactions.toLocaleString()}`, 14, 68);
  doc.text(`Total Volume: KES ${stats.totalVolume.toLocaleString()}`, 14, 76);
  doc.text(`Total Alerts: ${stats.totalAlerts}`, 14, 84);
  doc.text(`Critical Alerts: ${stats.criticalAlerts}`, 14, 92);
  doc.text(`Suspicious Rate: ${stats.suspiciousRate.toFixed(2)}%`, 14, 100);
  doc.text(`Reviewed Alerts: ${stats.reviewedAlerts}`, 14, 108);

  // Recent Critical Alerts
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').slice(0, 10);
  
  doc.setFontSize(14);
  doc.text('Critical Alerts (Top 10)', 14, 125);

  if (criticalAlerts.length > 0) {
    autoTable(doc, {
      startY: 130,
      head: [['Type', 'Member', 'Reason', 'Time', 'Status']],
      body: criticalAlerts.map((alert) => [
        alert.type,
        alert.member_id,
        alert.reason.length > 35 ? alert.reason.substring(0, 35) + '...' : alert.reason,
        format(alert.timestamp, 'MM/dd HH:mm'),
        alert.reviewed ? 'Reviewed' : 'Pending',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] },
    });
  } else {
    doc.setFontSize(10);
    doc.text('No critical alerts at this time.', 14, 138);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} - Generated by FraudGuard SACCO Protection`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  doc.save(`dashboard_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
