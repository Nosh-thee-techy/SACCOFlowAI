import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Brain, Users, Clock, ChevronRight, 
  Activity, Lock, Eye, Sparkles, CheckCircle2,
  TrendingUp, AlertTriangle, Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Detection',
    description: 'Advanced machine learning algorithms identify suspicious patterns and anomalies in real-time.',
    color: 'intelligence'
  },
  {
    icon: Shield,
    title: 'Multi-Layer Security',
    description: 'Rule-based, anomaly, and behavioral analysis provide comprehensive fraud protection.',
    color: 'primary'
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Segregation of duties ensures no single person can process and approve transactions.',
    color: 'primary'
  },
  {
    icon: Clock,
    title: 'Real-Time Alerts',
    description: 'Instant notifications when suspicious activity is detected, with AI explanations.',
    color: 'intelligence'
  },
  {
    icon: Lock,
    title: 'Immutable Audit Trail',
    description: 'Cryptographically chained logs that cannot be tampered with for complete transparency.',
    color: 'primary'
  },
  {
    icon: Mic,
    title: 'Voice AI Assistant',
    description: 'Speak naturally to get fraud insights, explanations, and guidance on flagged transactions.',
    color: 'intelligence'
  }
];

const stats = [
  { value: '99.7%', label: 'Detection Accuracy' },
  { value: '<2s', label: 'Alert Response Time' },
  { value: '24/7', label: 'Continuous Monitoring' },
  { value: '5', label: 'User Roles Supported' }
];

const roles = [
  { name: 'Teller', description: 'Process transactions with AI risk preview', color: 'bg-primary/10 text-primary' },
  { name: 'Branch Manager', description: 'Approve and defer with diary reminders', color: 'bg-intelligence/10 text-intelligence' },
  { name: 'Risk Officer', description: 'Monitor patterns and analyze threats', color: 'bg-amber-500/10 text-amber-600' },
  { name: 'Admin', description: 'Configure rules and manage users', color: 'bg-intelligence/10 text-intelligence' },
  { name: 'Auditor', description: 'Read-only access to immutable logs', color: 'bg-muted text-muted-foreground' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-intelligence/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-human/5 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary shadow-glow">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-intelligence bg-clip-text text-transparent">
              SACCO Flow AI
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/report">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-human">
                Anonymous Report
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="gap-2 bg-gradient-to-r from-primary to-intelligence hover:opacity-90 transition-opacity">
                Sign In
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-intelligence/10 text-intelligence border-intelligence/20 px-4 py-2">
            <Brain className="h-4 w-4 mr-2" />
            AI-Powered Fraud Prevention
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Protect Your SACCO
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-intelligence to-human bg-clip-text text-transparent">
              With Intelligent Oversight
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Advanced fraud detection platform that combines AI intelligence, 
            human judgment, and immutable audit trails to safeguard your members' finances.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="gap-2 px-8 h-14 text-lg bg-gradient-to-r from-primary to-intelligence hover:opacity-90 shadow-glow">
                <Sparkles className="h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2 px-8 h-14 text-lg border-2">
              <Eye className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-intelligence bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Activity className="h-3 w-3 mr-1" />
              Features
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Comprehensive Fraud Protection
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every layer of defense working together to protect your SACCO
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="group card-interactive border-border/50 hover:border-primary/30 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110",
                      feature.color === 'intelligence' 
                        ? 'bg-intelligence/10 text-intelligence' 
                        : 'bg-primary/10 text-primary'
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section className="py-24 px-6 bg-muted/30 border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-intelligence/10 text-intelligence border-intelligence/20">
                <Users className="h-3 w-3 mr-1" />
                Role-Based Security
              </Badge>
              <h2 className="text-4xl font-bold mb-6">
                Segregation of Duties,{' '}
                <span className="text-intelligence">Built In</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Each role has precisely defined permissions. No single person can create and approve their own transactions. 
                Every action is logged immutably for complete accountability.
              </p>
              
              <div className="space-y-4">
                {roles.map((role, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background/50 hover:border-primary/30 transition-all animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={cn("px-3 py-1.5 rounded-lg text-sm font-medium", role.color)}>
                      {role.name}
                    </div>
                    <span className="text-sm text-muted-foreground">{role.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-intelligence/20 to-human/20 p-1">
                <div className="w-full h-full rounded-[22px] bg-background flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto rounded-2xl gradient-intelligence shadow-glow-intelligence flex items-center justify-center mb-6">
                      <Shield className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Zero Trust Architecture</h3>
                    <p className="text-muted-foreground">
                      Every action verified. Every access logged. Every decision auditable.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-medium animate-float">
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                Verified
              </div>
              <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-full bg-intelligence/10 text-intelligence border border-intelligence/20 text-sm font-medium animate-float" style={{ animationDelay: '1s' }}>
                <Brain className="h-4 w-4 inline mr-1" />
                AI Monitored
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-intelligence/10 to-human/10 border border-border/50">
            <Badge className="mb-6 bg-human/10 text-human border-human/20">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Protect Your Members
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Ready to Secure Your SACCO?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join SACCOs that trust AI-powered fraud detection to protect their members and maintain regulatory compliance.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2 px-8 h-14 text-lg bg-gradient-to-r from-primary to-intelligence hover:opacity-90 shadow-glow">
                <TrendingUp className="h-5 w-5" />
                Start Protecting Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold">SACCO Flow AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SACCO Flow AI. Intelligent Fraud Prevention.
          </p>
          <Link to="/report" className="text-sm text-muted-foreground hover:text-human transition-colors">
            Anonymous Whistleblower Report →
          </Link>
        </div>
      </footer>
    </div>
  );
}
