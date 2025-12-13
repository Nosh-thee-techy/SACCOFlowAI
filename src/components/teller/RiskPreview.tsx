import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Clock,
  DollarSign,
  User
} from 'lucide-react';
import { Transaction, MemberProfile } from '@/lib/types';
import { detectRuleBasedFraud, detectAnomalies, calculateZScore } from '@/lib/fraudDetection';

interface RiskPreviewProps {
  transaction: Transaction | null;
  showPreview: boolean;
  memberProfiles: MemberProfile[];
  transactions: Transaction[];
}

interface RiskFlag {
  type: 'rule' | 'anomaly' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  confidence: number;
}

export function RiskPreview({ transaction, showPreview, memberProfiles, transactions }: RiskPreviewProps) {
  if (!showPreview || !transaction) {
    return (
      <Card className="flex items-center justify-center min-h-[400px]">
        <CardContent className="text-center text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Enter transaction details and click "Analyze Risk" to see AI-powered risk assessment</p>
        </CardContent>
      </Card>
    );
  }

  // Find member profile
  const memberProfile = memberProfiles.find(p => p.member_id === transaction.member_id) || {
    member_id: transaction.member_id,
    avg_transaction_amount: 10000,
    std_transaction_amount: 5000,
    typical_transaction_hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
    transaction_count: 0,
    risk_score: 0,
  };

  // Collect all risk flags
  const flags: RiskFlag[] = [];
  
  // Rule-based checks
  const ruleAlert = detectRuleBasedFraud(transaction, memberProfile, transactions);
  if (ruleAlert) {
    flags.push({
      type: 'rule',
      severity: ruleAlert.severity,
      message: ruleAlert.reason,
      confidence: ruleAlert.confidence,
    });
  }

  // Anomaly detection
  const anomalyAlert = detectAnomalies(transaction, memberProfile, transactions);
  if (anomalyAlert) {
    flags.push({
      type: 'anomaly',
      severity: anomalyAlert.severity,
      message: anomalyAlert.reason,
      confidence: anomalyAlert.confidence,
    });
  }

  // Calculate z-score
  const zScore = calculateZScore(
    transaction.amount,
    memberProfile.avg_transaction_amount,
    memberProfile.std_transaction_amount
  );

  // Additional checks
  const hour = transaction.timestamp.getHours();
  const isOffHours = hour < 8 || hour > 18;
  
  if (isOffHours && !flags.some(f => f.message.includes('unusual hour'))) {
    flags.push({
      type: 'info',
      severity: 'medium',
      message: `Transaction at ${hour}:00 - outside typical business hours`,
      confidence: 0.6,
    });
  }

  // Check for new member
  if (memberProfile.transaction_count === 0) {
    flags.push({
      type: 'info',
      severity: 'low',
      message: 'New member - no transaction history available for comparison',
      confidence: 0.5,
    });
  }

  // Calculate overall risk score
  const riskScore = flags.length === 0 ? 0 : 
    Math.min(100, flags.reduce((sum, f) => {
      const severityWeight = { low: 10, medium: 25, high: 50, critical: 80 };
      return sum + severityWeight[f.severity] * f.confidence;
    }, 0));

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/10' };
    if (score >= 50) return { level: 'High', color: 'text-orange-500', bgColor: 'bg-orange-500/10' };
    if (score >= 25) return { level: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' };
    return { level: 'Low', color: 'text-green-500', bgColor: 'bg-green-500/10' };
  };

  const risk = getRiskLevel(riskScore);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Assessment
          </span>
          <Badge variant="outline" className={`${risk.color} ${risk.bgColor}`}>
            {risk.level} Risk
          </Badge>
        </CardTitle>
        <CardDescription>
          AI-powered analysis of transaction risk factors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Risk Score</span>
            <span className={risk.color}>{riskScore.toFixed(0)}%</span>
          </div>
          <Progress value={riskScore} className="h-2" />
        </div>

        <Separator />

        {/* Transaction Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              Member
            </div>
            <p className="font-medium">{transaction.member_id}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Amount
            </div>
            <p className="font-medium">KES {transaction.amount.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              Z-Score
            </div>
            <p className="font-medium">{zScore.toFixed(2)}σ</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Time
            </div>
            <p className="font-medium">{transaction.timestamp.toLocaleTimeString()}</p>
          </div>
        </div>

        <Separator />

        {/* Member Context */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Member Context</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground text-xs">Avg. Transaction</p>
              <p className="font-medium">KES {memberProfile.avg_transaction_amount.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground text-xs">Std. Deviation</p>
              <p className="font-medium">KES {memberProfile.std_transaction_amount.toLocaleString()}</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground text-xs">Transaction History</p>
              <p className="font-medium">{memberProfile.transaction_count} transactions</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <p className="text-muted-foreground text-xs">Risk Profile</p>
              <p className="font-medium">{(memberProfile.risk_score * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Risk Flags */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            Detected Flags ({flags.length})
          </h4>
          {flags.length === 0 ? (
            <div className="flex items-center gap-2 text-green-500 text-sm">
              <CheckCircle className="h-4 w-4" />
              No risk flags detected
            </div>
          ) : (
            <div className="space-y-2">
              {flags.map((flag, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-2 p-2 rounded bg-muted/50"
                >
                  {getSeverityIcon(flag.severity)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{flag.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {flag.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {(flag.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommendation */}
        {riskScore >= 50 && (
          <div className="p-3 rounded bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              ⚠️ This transaction may require manager approval due to elevated risk factors.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
