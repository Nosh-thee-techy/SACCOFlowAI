import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowRightLeft, 
  AlertTriangle, 
  Settings, 
  Shield,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  BarChart3,
  UserCog,
  CheckSquare,
  FileSearch,
  MessageSquareWarning
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFraudStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const getRoleLabel = (role: string | null) => {
  switch (role) {
    case 'admin': return 'Admin';
    case 'branch_manager': return 'Manager';
    case 'teller': return 'Teller';
    case 'risk_officer': return 'Risk Officer';
    case 'auditor': return 'Auditor';
    default: return 'User';
  }
};

const getRoleBadgeVariant = (role: string | null) => {
  switch (role) {
    case 'admin': return 'critical' as const;
    case 'branch_manager': return 'warning' as const;
    case 'teller': return 'success' as const;
    case 'risk_officer': return 'warning' as const;
    case 'auditor': return 'info' as const;
    default: return 'secondary' as const;
  }
};

export function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme, stats } = useFraudStore();
  const { user, role, signOut, hasRole, canAccess } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreviewed = stats.totalAlerts - stats.reviewedAlerts;

  // Filter nav items based on role
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: null },
    { path: '/teller', label: 'Enter', icon: UserCog, roles: ['teller', 'branch_manager', 'admin'] as const },
    { path: '/branch', label: 'Branch', icon: CheckSquare, roles: ['branch_manager', 'admin'] as const },
    { path: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] as const },
    { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft, roles: null },
    { path: '/alerts', label: 'Alerts', icon: AlertTriangle, roles: null },
    { path: '/audit', label: 'Audit', icon: FileSearch, roles: ['auditor', 'admin', 'risk_officer', 'branch_manager'] as const },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: null },
  ].filter(item => {
    if (!item.roles) return true;
    return canAccess(item.roles as any);
  });

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover-lift">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold tracking-tight">SACCO Flow AI</h1>
            <p className="text-xs text-muted-foreground">Trust • Intelligence • Safety</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            const showBadge = item.path === '/alerts' && unreviewed > 0;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {showBadge && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {unreviewed > 99 ? '99+' : unreviewed}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-lg"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.email}</p>
                  <Badge variant={getRoleBadgeVariant(role)} className="w-fit">
                    {getRoleLabel(role)}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border/50 bg-background p-4 animate-slide-up">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              const showBadge = item.path === '/alerts' && unreviewed > 0;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                  {showBadge && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                      {unreviewed}
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Mobile logout */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
