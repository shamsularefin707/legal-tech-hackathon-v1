/**
 * সরকারি অ্যাপ্লিকেশন হেডার (Government Application Shell Header)
 */

import React, { useState } from 'react';
import {
  Bell,
  UserCheck,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Lock,
  Database,
  PlusCircle,
  Menu,
  X,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

interface HeaderProps {
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    notifications,
    cases,
    setActiveView,
    setSelectedCaseId,
    triggerUnauthorizedCaseAccessDemo,
    triggerBulkDownloadAbuseDemo,
    setIsDemoDataPanelOpen,
    setIsNewCaseModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useLegalAid();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoTools, setShowDemoTools] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-300 sticky top-0 z-40">
      {/* Topmost Government Identity Strip */}
      <div className="bg-[#172554] text-white px-4 py-1.5 text-xs flex justify-between items-center border-b border-blue-950">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-medium tracking-wide">
            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার | আইন ও বিচার বিভাগ (ডেমো প্রোটোটাইপ)
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-200">জাতীয় আইনগত সহায়তা কার্যক্রম</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="bg-amber-400 text-blue-950 px-2.5 py-0.5 rounded text-[11px] font-bold shadow-xs">
            ডেমো পরিবেশ • সম্পূর্ণ কাল্পনিক তথ্য
          </span>
          <span className="text-gray-300 text-[11px] hidden md:inline">
            সার্ভার সময়: ০৯ সেপ্টেম্বর ২০২৬, সকাল ১০:১৫
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Left: Emblem Placeholder & Institution Title */}
        <div className="flex items-center space-x-2 sm:space-x-3.5">
          {/* Mobile drawer toggle */}
          <button
            id="btn-header-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 -ml-1 text-[#172554] hover:bg-slate-100 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
            aria-label="মেনু খুলুন বা বন্ধ করুন"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Institutional Scales Placeholder */}
          <div className="w-10 h-10 rounded-sm border border-gray-400 bg-slate-100 flex items-center justify-center p-1.5 shadow-xs shrink-0 text-[#172554]">
            <svg
              viewBox="0 0 24 24"
              className="w-full h-full stroke-current fill-none stroke-2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-label="আইন ও বিচার বিভাগ প্রতীক"
            >
              <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
              <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
              <path d="M7 21h10" />
              <path d="M12 3v18" />
              <path d="M3 7h18" />
            </svg>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-700 tracking-wider">
              গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
            </div>
            <h1 className="text-base sm:text-lg font-bold text-[#172554] leading-tight">
              জাতীয় আইনগত সহায়তা কার্যক্রম ব্যবস্থাপনা
            </h1>
            <div className="text-[11px] text-gray-600 font-medium">
              আইন ও বিচার বিভাগ | জেলা আইনগত সহায়তা কার্যালয়, ঢাকা
            </div>
          </div>
        </div>

        {/* Right: Synthetic Dataset Controls, Security Sandbox Tools, Notifications, User Info */}
        <div className="flex items-center space-x-2.5">
          {/* New Application Workflow Trigger */}
          <button
            id="btn-header-new-application"
            onClick={() => setIsNewCaseModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded cursor-pointer transition-colors shadow-xs"
            title="নতুন আইনি সহায়তা আবেদন ফরম (৭-ধাপ বিশিষ্ট প্রক্রিয়া)"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-100" />
            <span className="hidden sm:inline">নতুন আবেদন</span>
          </button>

          {/* Synthetic Dataset Controls Trigger */}
          <button
            id="btn-demo-dataset"
            onClick={() => setIsDemoDataPanelOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-bold text-[#172554] bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded cursor-pointer transition-colors shadow-xs"
            title="সিন্থেটিক ডেটাসেট নিয়ন্ত্রণ ও পুনর্জেনারেট প্যানেল (৫০০ কেস, ২৫ আইনজীবী)"
          >
            <Database className="w-3.5 h-3.5 text-blue-800" />
            <span className="hidden sm:inline">সিন্থেটিক ডেটা ({cases.length})</span>
          </button>

          {/* Quick Demo Scenario Switcher (Crucial for Section 41 & 42 judging) */}
          <div className="relative">
            <button
              id="btn-security-sandbox"
              onClick={() => setShowDemoTools(!showDemoTools)}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded cursor-pointer"
              title="বিচারিক মূল্যায়ন ও নিরাপত্তা দৃশ্যপট পরীক্ষা"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden md:inline">নিরাপত্তা মহড়া পরীক্ষা</span>
              <ChevronDown className="w-3 h-3 text-amber-700" />
            </button>

            {showDemoTools && (
              <div className="absolute right-0 mt-1 w-80 bg-white border border-gray-300 shadow-md rounded-md p-3 z-50 text-xs">
                <div className="font-bold text-gray-800 border-b pb-1.5 mb-2 flex items-center justify-between">
                  <span>হ্যাকথন নিরাপত্তা দৃশ্যপট মহড়া</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                    সেকশন ৪১ ও ৪২
                  </span>
                </div>
                <p className="text-gray-600 mb-2.5 text-[11px]">
                  নিচের বোতামগুলো ক্লিক করে অবজেক্ট-লেভেল পারমিশন ও অসঙ্গতি পর্যবেক্ষণ পরীক্ষা করুন:
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      triggerUnauthorizedCaseAccessDemo();
                      setShowDemoTools(false);
                      setActiveView('security');
                    }}
                    className="w-full text-left p-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-900 rounded font-medium transition-colors"
                  >
                    ১. এক্তিয়ারবহির্ভূত মামলায় প্রবেশ চেষ্টা (BOLA / IDOR)
                    <span className="block text-[10px] text-red-700 font-normal mt-0.5">
                      অননুমোদিত জেলার মামলায় প্রবেশ ব্লক ও লগ সংরক্ষণ
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      triggerBulkDownloadAbuseDemo();
                      setShowDemoTools(false);
                      setActiveView('security');
                    }}
                    className="w-full text-left p-2 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded font-medium transition-colors"
                  >
                    ২. অস্বাভাবিক সংখ্যক নথি ডাউনলোডের অপচেষ্টা
                    <span className="block text-[10px] text-amber-700 font-normal mt-0.5">
                      স্বল্প সময়ে গণডাউনলোড থ্রোটলিং ও নিরাপত্তা সতর্কতা
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notifications Center */}
          <div className="relative">
            <button
              id="btn-notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded border border-gray-300 cursor-pointer"
              aria-label="বিজ্ঞপ্তি"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white border border-gray-300 shadow-lg rounded-md p-3 z-50 text-xs">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-2">
                  <span className="font-bold text-gray-800">অফিসিয়াল নোটিফিকেশন সেন্টার</span>
                  <span className="text-[11px] text-gray-500">
                    {unreadCount}টি অপঠিত বার্তা
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (n.linkCaseId) {
                          setSelectedCaseId(n.linkCaseId);
                          setActiveView('case-detail');
                        }
                        setShowNotifications(false);
                      }}
                      className={`p-2.5 rounded border text-left cursor-pointer transition-colors ${
                        n.type === 'URGENT'
                          ? 'bg-red-50/70 border-red-200 text-red-950 hover:bg-red-100/70'
                          : n.type === 'WARNING'
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950 hover:bg-amber-100/70'
                          : 'bg-blue-50/70 border-blue-200 text-blue-950 hover:bg-blue-100/70'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold">{n.title}</span>
                      </div>
                      <div className="text-[10px] text-gray-600 mt-1 flex justify-between items-center">
                        <span>{n.time}</span>
                        {n.linkCaseId && (
                          <span className="underline text-blue-800 font-medium">মামলাটি দেখুন →</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Switcher */}
          <div className="relative">
            <button
              id="btn-user-profile"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded text-xs text-left cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-blue-950 text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.charAt(0) || 'ক'}
              </div>
              <div className="hidden lg:block">
                <div className="font-semibold text-gray-800 truncate max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-gray-500 truncate max-w-[130px]">
                  {currentUser.designation}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white border border-gray-300 shadow-lg rounded-md p-3 z-50 text-xs">
                <div className="border-b border-gray-200 pb-2 mb-2">
                  <div className="font-bold text-gray-900">{currentUser.name}</div>
                  <div className="text-[11px] text-gray-600">{currentUser.designation}</div>
                  <div className="text-[10px] text-blue-800 mt-0.5">
                    এক্তিয়ার: {currentUser.district} | {currentUser.email}
                  </div>
                </div>

                {/* Role Switcher for Evaluation */}
                <div className="mb-2">
                  <div className="font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
                    <span>ভূমিকা পরিবর্তন (RBAC মহড়া):</span>
                    <span className="text-[10px] text-gray-500">মডেল পরীক্ষা</span>
                  </div>
                  <div className="space-y-1 max-h-44 overflow-y-auto">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center justify-between transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-blue-100 text-blue-950 font-bold border border-blue-300'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div>
                          <div className="truncate">{u.name}</div>
                          <div className="text-[10px] text-gray-500 truncate">{u.designation}</div>
                        </div>
                        {u.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-blue-800" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenLogin();
                    }}
                    className="flex items-center space-x-1.5 text-gray-700 hover:text-red-700 py-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>নিরাপদ প্রস্থান (লগআউট)</span>
                  </button>
                  <span className="text-[10px] text-gray-400 flex items-center">
                    <Lock className="w-3 h-3 mr-1" />
                    SSLv3
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
