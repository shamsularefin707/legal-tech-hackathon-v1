/**
 * সরকারি লগইন উইন্ডো (Government Login Screen)
 * Section 28
 */

import React, { useState } from 'react';
import { Lock, ShieldCheck, UserCheck } from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { users, setCurrentUser } = useLegalAid();
  const [username, setUsername] = useState('dlo.dhaka');
  const [password, setPassword] = useState('••••••••••••');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In demo environment, match with username or allow direct role selection
    const matched = users.find(
      (u) =>
        u.email.toLowerCase().includes(username.toLowerCase()) ||
        u.name.toLowerCase().includes(username.toLowerCase())
    );
    if (matched) {
      setCurrentUser(matched);
      onClose();
    } else {
      setCurrentUser(users[0]);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-2 border-[#172554] rounded-sm max-w-md w-full p-6 text-xs space-y-4 shadow-xl">
        {/* Government Header */}
        <div className="text-center border-b border-gray-300 pb-3.5 space-y-1">
          <div className="w-12 h-12 rounded-full border border-gray-300 bg-gray-50 flex items-center justify-center mx-auto mb-2">
            <ShieldCheck className="w-7 h-7 text-[#172554]" />
          </div>
          <div className="text-xs font-semibold text-gray-700">
            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
          </div>
          <div className="text-sm font-bold text-[#172554]">
            জাতীয় আইনগত সহায়তা কার্যক্রম
          </div>
          <div className="text-base font-bold text-gray-900 pt-1">
            নিরাপদ প্রবেশ
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-300 text-red-900 p-2 rounded text-[11px]">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block font-bold text-gray-800 mb-1">ব্যবহারকারী নাম:</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="কর্মকর্তা আইডি বা অফিসিয়াল ইমেইল"
              className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">পাসওয়ার্ড:</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#172554] text-white font-bold rounded hover:bg-blue-950 cursor-pointer transition-colors text-xs"
          >
            প্রবেশ করুন
          </button>
        </form>

        {/* Official Disclaimer */}
        <div className="text-center text-[11px] text-gray-500 border-t pt-3">
          "এই ব্যবস্থা শুধুমাত্র অনুমোদিত ব্যবহারকারীদের জন্য।"
        </div>

        {/* Demo Fast Account Switcher for Judges */}
        <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
          <div className="text-[10px] font-bold text-gray-600 mb-1.5 uppercase">
            ডেমো ও মূল্যায়ন একাউন্ট নির্বাচন:
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <button
              type="button"
              onClick={() => {
                setCurrentUser(users[0]);
                onClose();
              }}
              className="p-1 border bg-white rounded text-left hover:bg-blue-50 font-semibold truncate"
            >
              জেলা কর্মকর্তা (ঢাকা)
            </button>
            <button
              type="button"
              onClick={() => {
                const law = users.find((u) => u.id === 'usr-law-1') || users[2];
                setCurrentUser(law);
                onClose();
              }}
              className="p-1 border bg-white rounded text-left hover:bg-blue-50 font-semibold truncate"
            >
              প্যানেল আইনজীবী (নাজমা)
            </button>
            <button
              type="button"
              onClick={() => {
                const adm = users.find((u) => u.role === 'SYSTEM_ADMIN') || users[0];
                setCurrentUser(adm);
                onClose();
              }}
              className="p-1 border bg-white rounded text-left hover:bg-blue-50 font-semibold truncate"
            >
              সিস্টেম প্রশাসক
            </button>
            <button
              type="button"
              onClick={() => {
                const nat = users.find((u) => u.role === 'NATIONAL_OFFICER') || users[1];
                setCurrentUser(nat);
                onClose();
              }}
              className="p-1 border bg-white rounded text-left hover:bg-blue-50 font-semibold truncate"
            >
              জাতীয় কর্মকর্তা
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
