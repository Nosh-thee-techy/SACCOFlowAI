import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AIAssistant } from '@/components/ai-assistant/AIAssistant';

export function Layout() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      
      {/* Ambient gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-80 h-80 bg-intelligence/5 rounded-full blur-3xl pointer-events-none" />
      
      <Navbar />
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <AIAssistant />
    </div>
  );
}
