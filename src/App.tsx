/**
 * জাতীয় আইনগত সহায়তা কার্যক্রম ব্যবস্থাপনা
 * প্রধান অ্যাপ্লিকেশন কনটেইনার (Main Justice Operations Application)
 */

import React, { useState } from 'react';
import { LegalAidProvider, useLegalAid } from './context/LegalAidContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CasesListView } from './components/CasesListView';
import { CaseDetailView } from './components/CaseDetailView';
import { LawyersView } from './components/LawyersView';
import { DeadlinesView } from './components/DeadlinesView';
import { SecurityView } from './components/SecurityView';
import { AuditLogView } from './components/AuditLogView';
import { ReportsView } from './components/ReportsView';
import { HearingsView } from './components/HearingsView';
import { UsersView } from './components/UsersView';
import { LoginModal } from './components/LoginModal';

const AppContent: React.FC = () => {
  const { activeView, setActiveView } = useLegalAid();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-900 flex flex-col font-['Noto_Sans_Bengali',sans-serif]">
      {/* Top Government Application Header */}
      <Header onOpenLogin={() => setIsLoginOpen(true)} />

      {/* Main Workspace: Sidebar + Operational Canvas */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-5 max-w-7xl mx-auto w-full">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'cases' && <CasesListView />}
          {activeView === 'case-detail' && <CaseDetailView />}
          {activeView === 'lawyers' && <LawyersView />}
          {activeView === 'deadlines' && <DeadlinesView />}
          {activeView === 'stuck-cases' && <DeadlinesView />}
          {activeView === 'hearings' && <HearingsView />}
          {activeView === 'reports' && <ReportsView />}
          {activeView === 'security' && <SecurityView />}
          {activeView === 'audit-log' && <AuditLogView />}
          {activeView === 'users' && <UsersView />}
        </main>
      </div>

      {/* Government Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <LegalAidProvider>
      <AppContent />
    </LegalAidProvider>
  );
}
