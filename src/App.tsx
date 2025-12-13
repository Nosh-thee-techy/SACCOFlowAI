import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import TellerDashboard from "./pages/TellerDashboard";
import PendingApprovals from "./pages/PendingApprovals";
import BranchManagerDashboard from "./pages/BranchManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AuditPanel from "./pages/AuditPanel";
import Whistleblower from "./pages/Whistleblower";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import { useEffect } from "react";
import { useFraudStore } from "./lib/store";

const queryClient = new QueryClient();

function ThemeInitializer() {
  const { theme } = useFraudStore();
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return null;
}

// Component to redirect users to their role-specific dashboard
function RoleBasedRedirect() {
  const { role, loading } = useAuth();
  
  if (loading) {
    return null;
  }
  
  // Redirect based on role
  switch (role) {
    case 'teller':
      return <Navigate to="/teller" replace />;
    case 'branch_manager':
      return <Navigate to="/branch" replace />;
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'auditor':
      return <Navigate to="/audit" replace />;
    case 'risk_officer':
      return <Navigate to="/risk" replace />;
    default:
      return <Navigate to="/auth" replace />;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeInitializer />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/report" element={<Whistleblower />} />
            
            {/* Protected routes with Layout */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Role-specific dashboards - each role has ONE primary dashboard */}
              
              {/* Teller Dashboard - for tellers only */}
              <Route path="/teller" element={
                <ProtectedRoute allowedRoles={['teller']}>
                  <TellerDashboard />
                </ProtectedRoute>
              } />
              
              {/* Branch Manager Dashboard */}
              <Route path="/branch" element={
                <ProtectedRoute allowedRoles={['branch_manager']}>
                  <BranchManagerDashboard />
                </ProtectedRoute>
              } />
              
              {/* Branch Manager - Pending Approvals */}
              <Route path="/pending-approvals" element={
                <ProtectedRoute allowedRoles={['branch_manager']}>
                  <PendingApprovals />
                </ProtectedRoute>
              } />
              
              {/* Admin Dashboard */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin Settings */}
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              } />
              
              {/* Auditor Panel - read-only access */}
              <Route path="/audit" element={
                <ProtectedRoute allowedRoles={['auditor']}>
                  <AuditPanel />
                </ProtectedRoute>
              } />
              
              {/* Risk Officer - can view audit logs */}
              <Route path="/risk" element={
                <ProtectedRoute allowedRoles={['risk_officer']}>
                  <AuditPanel />
                </ProtectedRoute>
              } />

              {/* Default redirect based on role */}
              <Route path="/" element={<RoleBasedRedirect />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
