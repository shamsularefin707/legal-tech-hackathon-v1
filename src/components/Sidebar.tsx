/**
 * প্রশাসনিক সাইডবার (Government Sidebar Navigation)
 */

import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  History,
  Users,
  FileSpreadsheet,
  AlertOctagon,
  Scale,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    atRiskDeadlinesCount,
    stuckCases,
    cases,
  } = useLegalAid();

  const pendingLawyerCasesCount = cases.filter(
    (c) => c.status === 'PENDING_LAWYER_ASSIGNMENT'
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    {
      id: 'cases',
      label: 'মামলা ও কার্যক্রম',
      icon: Briefcase,
      badge: `${cases.length}`,
    },
    {
      id: 'case-1284',
      label: 'মূল্যায়িত মামলা (LA-1284)',
      icon: Scale,
      specialDemo: true,
      badge: 'মহড়া',
    },
    {
      id: 'lawyers',
      label: 'প্যানেল আইনজীবী (LADCS)',
      icon: UserCheck,
      badge: pendingLawyerCasesCount > 0 ? `${pendingLawyerCasesCount} অপেক্ষমাণ` : undefined,
      badgeColor: 'amber',
    },
    {
      id: 'deadlines',
      label: 'সময়সীমা ও SLA পর্যবেক্ষণ',
      icon: Clock,
      badge: atRiskDeadlinesCount > 0 ? `${atRiskDeadlinesCount} ঝুঁকি` : undefined,
      badgeColor: 'red',
    },
    {
      id: 'stuck-cases',
      label: 'অচল / দীর্ঘসূত্র মামলা',
      icon: AlertOctagon,
      badge: stuckCases.length > 0 ? `${stuckCases.length}` : undefined,
      badgeColor: 'amber',
    },
    { id: 'hearings', label: 'শুনানি ও মধ্যস্থতা', icon: Calendar },
    { id: 'reports', label: 'সরকারি প্রতিবেদন ও পরিসংখ্যান', icon: FileSpreadsheet },
    { id: 'security', label: 'নিরাপত্তা ও এক্সেস নিয়ন্ত্রণ', icon: ShieldCheck },
    { id: 'audit-log', label: 'কার্যক্রমের রেকর্ড (অডিট ট্রেইল)', icon: History },
    { id: 'users', label: 'ব্যবহারকারী ও পদবি', icon: Users },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-300 flex flex-col shrink-0 min-h-[calc(100vh-80px)] no-print">
      {/* Office Header */}
      <div className="p-3 border-b border-gray-200 bg-gray-50/70">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          কার্যক্রম উইন্ডো
        </div>
        <div className="text-xs font-semibold text-gray-800 mt-0.5">
          আইনগত সহায়তা ডেস্ক
        </div>
      </div>

      {/* Nav List */}
      <nav className="p-2 space-y-0.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeView === item.id ||
            (item.id === 'case-1284' && activeView === 'case-detail');

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => {
                if (item.id === 'case-1284') {
                  setActiveView('case-detail');
                } else {
                  setActiveView(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded transition-colors text-left font-medium cursor-pointer ${
                isActive
                  ? 'bg-[#172554] text-white font-semibold shadow-xs'
                  : item.specialDemo
                  ? 'bg-blue-50/80 text-blue-900 hover:bg-blue-100/80 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold whitespace-nowrap ml-1.5 ${
                    isActive
                      ? 'bg-blue-800 text-white'
                      : item.badgeColor === 'red'
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : item.badgeColor === 'amber'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-600">
        <div className="flex items-center justify-between font-medium">
          <span>নিরাপত্তা নীতি:</span>
          <span className="text-emerald-700 font-bold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
            সক্রিয় ও সুরক্ষিত
          </span>
        </div>
        <div className="text-[10px] text-gray-400 mt-1">
          লগইন সেশন আইডি: BD-LA-90214
        </div>
      </div>
    </aside>
  );
};
