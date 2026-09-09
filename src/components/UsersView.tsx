/**
 * ব্যবহারকারী ও পদবি ব্যবস্থাপনা (User & Role Management)
 * Section 19
 */

import React from 'react';
import { Users, UserCheck, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

export const UsersView: React.FC = () => {
  const { users, currentUser, setCurrentUser } = useLegalAid();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'DISTRICT_OFFICER':
        return <span className="bg-blue-100 text-blue-950 px-2 py-0.5 rounded text-[11px] font-bold border border-blue-300">জেলা কর্মকর্তা (DLO)</span>;
      case 'NATIONAL_OFFICER':
        return <span className="bg-purple-100 text-purple-950 px-2 py-0.5 rounded text-[11px] font-bold border border-purple-300">জাতীয় পর্যায়ের কর্মকর্তা</span>;
      case 'PANEL_LAWYER':
        return <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-300">প্যানেল আইনজীবী</span>;
      case 'ASSISTANT_OFFICER':
        return <span className="bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-300">সহকারী কর্মকর্তা</span>;
      case 'SYSTEM_ADMIN':
        return <span className="bg-red-100 text-red-950 px-2 py-0.5 rounded text-[11px] font-bold border border-red-300">সিস্টেম প্রশাসক</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-medium">{role}</span>;
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white border border-gray-300 p-4 rounded-sm flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            ব্যবহারকারী ও ভূমিকা ব্যবস্থাপনা (RBAC Management)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            অনুমোদিত সরকারি কর্মকর্তা ও প্যানেল আইনজীবীদের কার্যপরিধি ও নিরাপত্তা অধিকার
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded border border-gray-300">
          মোট অনুমোদিত ব্যবহারকারী: {users.length} জন
        </span>
      </div>

      <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-800 border-b font-bold">
              <th className="py-2.5 px-3">নাম ও পদবি</th>
              <th className="py-2.5 px-3">ভূমিকা (Role)</th>
              <th className="py-2.5 px-3">জেলা এক্তিয়ার</th>
              <th className="py-2.5 px-3">অফিসিয়াল যোগাযোগ</th>
              <th className="py-2.5 px-3">অবস্থা</th>
              <th className="py-2.5 px-3 text-right">মহড়া সুইচ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-blue-50/40">
                <td className="py-2.5 px-3">
                  <div className="font-bold text-gray-900">{u.name}</div>
                  <div className="text-[11px] text-gray-500">{u.designation}</div>
                </td>
                <td className="py-2.5 px-3">{getRoleBadge(u.role)}</td>
                <td className="py-2.5 px-3 text-gray-700 font-medium">{u.district}</td>
                <td className="py-2.5 px-3 text-gray-600 font-mono text-[11px]">
                  <div>{u.email}</div>
                  <div>{u.phone}</div>
                </td>
                <td className="py-2.5 px-3">
                  <span className="text-emerald-700 font-bold flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                    সক্রিয়
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => setCurrentUser(u)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      currentUser.id === u.id
                        ? 'bg-blue-900 text-white font-bold'
                        : 'border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    {currentUser.id === u.id ? 'বর্তমান ব্যবহারকারী' : 'এই অ্যাকাউন্টে যান'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
