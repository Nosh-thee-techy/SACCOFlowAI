import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Alerts from "./pages/Alerts";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import TellerDashboard from "./pages/TellerDashboard";
import PendingApprovals from "./pages/PendingApprovals";
import BranchManagerDashboard from "./pages/BranchManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AuditPanel from "./pages/AuditPanel";
import Whistleblower from "./pages/Whistleblower";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeInitializer />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/report" element={<Whistleblower />} />
            
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/teller" element={
                <ProtectedRoute allowedRoles={['teller', 'branch_manager', 'admin']}>
                  <TellerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/pending-approvals" element={
                <ProtectedRoute allowedRoles={['branch_manager', 'admin']}>
                  <PendingApprovals />
                </ProtectedRoute>
              } />
              <Route path="/branch" element={
                <ProtectedRoute allowedRoles={['branch_manager', 'admin']}>
                  <BranchManagerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/audit" element={
                <ProtectedRoute allowedRoles={['auditor', 'admin', 'risk_officer', 'branch_manager']}>
                  <AuditPanel />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['admin', 'risk_officer']}>
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
