import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Loader2, AlertCircle, User, Building2, Settings, FileSearch, AlertTriangle } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
});

// Get redirect path based on role
const getRedirectPath = (role: AppRole | null): string => {
  switch (role) {
    case 'teller': return '/teller';
    case 'branch_manager': return '/branch';
    case 'admin': return '/admin';
    case 'auditor': return '/audit';
    case 'risk_officer': return '/risk';
    default: return '/auth';
  }
};

// Role display info
const roleInfo = {
  teller: {
    icon: User,
    label: 'Teller',
    description: 'Process transactions and serve members',
    color: 'bg-trust/10 border-trust text-trust',
  },
  branch_manager: {
    icon: Building2,
    label: 'Branch Manager',
    description: 'Approve transactions and oversee operations',
    color: 'bg-intelligence/10 border-intelligence text-intelligence',
  },
  admin: {
    icon: Settings,
    label: 'Administrator',
    description: 'Manage users, rules, and system settings',
    color: 'bg-intelligence/10 border-intelligence text-intelligence',
  },
  auditor: {
    icon: FileSearch,
    label: 'Auditor',
    description: 'Review audit logs and compliance reports',
    color: 'bg-muted border-border text-muted-foreground',
  },
  risk_officer: {
    icon: AlertTriangle,
    label: 'Risk Officer',
    description: 'Monitor and analyze risk patterns',
    color: 'bg-human/10 border-human text-human',
  },
};

export default function Auth() {
  const { user, role, signIn, signUp, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Redirect authenticated users to their role-specific dashboard
  useEffect(() => {
    if (user && role) {
      const redirectPath = getRedirectPath(role);
      navigate(redirectPath, { replace: true });
    }
  }, [user, role, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please confirm your email before logging in.');
      } else {
        setError(error.message);
      }
    } else {
      toast.success('Welcome back!');
      // Role-based redirect will happen via useEffect
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = signupSchema.safeParse({ email, password, fullName });
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);

    if (error) {
      if (error.message.includes('User already registered')) {
        setError('An account with this email already exists. Please log in.');
      } else {
        setError(error.message);
      }
    } else {
      toast.success('Account created! You have been assigned the Auditor role by default.');
      // Role-based redirect will happen via useEffect
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-trust/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-intelligence/5 rounded-full blur-3xl" />
      </div>

      <Card className="relative w-full max-w-md border-border/50 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow animate-float">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">SACCO Flow AI</CardTitle>
          <CardDescription>Secure Financial Operations Platform</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive animate-slide-up">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@sacco.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
              
              <p className="text-xs text-center text-muted-foreground">
                You will be directed to your role-specific dashboard after signing in.
              </p>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@sacco.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> New accounts are assigned the <span className="text-foreground font-medium">Auditor</span> role by default (read-only access). 
                    Contact your administrator to request elevated access.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Role hierarchy info */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-xs text-center text-muted-foreground mb-3">
              Available Roles
            </p>
            <div className="grid grid-cols-5 gap-1">
              {Object.entries(roleInfo).map(([key, info]) => {
                const Icon = info.icon;
                return (
                  <div 
                    key={key}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                    title={info.description}
                  >
                    <div className={cn("p-1.5 rounded-md border", info.color)}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{info.label.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Whistleblower link */}
      <div className="fixed bottom-4 right-4">
        <a 
          href="/report" 
          className="text-xs text-muted-foreground hover:text-human transition-colors underline-offset-4 hover:underline"
        >
          Anonymous Report →
        </a>
      </div>
    </div>
  );
}
