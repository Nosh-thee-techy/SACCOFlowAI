import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { AIAssistant } from '@/components/ai-assistant/AIAssistant';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <AIAssistant />
    </div>
  );
}
