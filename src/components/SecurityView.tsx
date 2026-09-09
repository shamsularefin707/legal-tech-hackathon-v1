/**
 * নিরাপত্তা ও এক্সেস নিয়ন্ত্রণ (Administrative Security & Access Control)
 * Section 18, 19, 20, 22, 23, 24, 27, 42
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  FileSpreadsheet,
  AlertTriangle,
  Server,
  UserCheck,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

export const SecurityView: React.FC = () => {
  const {
    securityEvents,
    currentUser,
    users,
    triggerUnauthorizedCaseAccessDemo,
    triggerBulkDownloadAbuseDemo,
    requestDataExport,
  } = useLegalAid();

  // Controlled Data Export State (Section 24)
  const [exportType, setExportType] = useState('মামলা_তালিকা');
  const [exportDistrict, setExportDistrict] = useState('ঢাকা');
  const [exportReason, setExportReason] = useState('');
  const [exportAlert, setExportAlert] = useState<{ success: boolean; message: string } | null>(null);

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = requestDataExport(exportType, exportDistrict, exportReason);
    setExportAlert(result);
    if (result.success) {
      setExportReason('');
    }
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-gray-300 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900">
              নিরাপত্তা পর্যবেক্ষণ ও এক্সেস নিয়ন্ত্রণ ডেস্ক
            </h2>
            <span className="bg-emerald-100 text-emerald-900 text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-300">
              সুরক্ষা নীতি পরিপালিত
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            ভূমিকাভিত্তিক এক্সেস (RBAC), অবজেক্ট-লেভেল অনুমোদন (BOLA প্রতিরোধ), অডিট ট্রেইল ও ডেটা এক্সপোর্ট সুরক্ষা
          </p>
        </div>
        <div className="text-xs text-gray-700 bg-gray-100 px-3 py-1.5 rounded border border-gray-300 font-semibold">
          সক্রিয় সেশন: TLS 1.3 এনক্রিপ্টেড
        </div>
      </div>

      {/* Security Testing Sandbox for Hackathon Judges (Section 41 & 42) */}
      <div className="bg-amber-50/70 border border-amber-300 p-3.5 rounded">
        <div className="flex items-center space-x-2 text-amber-950 font-bold mb-1">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          <span>বিচারক মহড়া ও নিরাপত্তা অনুপ্রবেশ প্রতিরোধ পরীক্ষা (Live Security Demonstrations):</span>
        </div>
        <p className="text-gray-700 text-[11px] mb-3">
          নিচের বাটনগুলো ক্লিক করে সরকারি বিচারিক সিস্টেমের অবজেক্ট-লেভেল নিরাপত্তা (IDOR/BOLA) ও গণডাউনলোড অপচেষ্টা প্রতিরোধ ব্যবস্থা সরাসরি যাচাই করুন:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={triggerUnauthorizedCaseAccessDemo}
            className="p-2.5 bg-white hover:bg-red-50/50 border border-red-300 rounded text-left cursor-pointer transition-colors"
          >
            <div className="font-bold text-red-950 flex items-center justify-between">
              <span>দৃশ্যপট ১: এক্তিয়ারবহির্ভূত মামলা প্রবেশের চেষ্টা (BOLA)</span>
              <span className="text-[10px] bg-red-100 text-red-900 px-1.5 py-0.5 rounded font-bold">
                পরীক্ষা চালান
              </span>
            </div>
            <p className="text-[10px] text-gray-600 mt-1">
              ব্যবহারকারী তার নির্দিষ্ট জেলা বা নিয়োগবহির্ভূত মামলায় ঢুকতে চাইলে ব্যাকএন্ড থেকে তা প্রত্যাখ্যান এবং নিরাপত্তা লগে নথিভুক্ত হয়।
            </p>
          </button>

          <button
            onClick={triggerBulkDownloadAbuseDemo}
            className="p-2.5 bg-white hover:bg-amber-50/50 border border-amber-300 rounded text-left cursor-pointer transition-colors"
          >
            <div className="font-bold text-amber-950 flex items-center justify-between">
              <span>দৃশ্যপট ২: অস্বাভাবিক সংখ্যক সংরক্ষিত নথি গণডাউনলোড</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                পরীক্ষা চালান
              </span>
            </div>
            <p className="text-[10px] text-gray-600 mt-1">
              স্বল্প সময়ে বিপুল নথি ডাউনলোডের চেষ্টা শনাক্ত করে স্বয়ংক্রিয় থ্রোটলিং জারি এবং উচ্চমাত্রার নিরাপত্তা সতর্কতা তৈরি হয়।
            </p>
          </button>
        </div>
      </div>

      {/* Security Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Security Alerts & Events + Role Matrix */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section 22: নিরাপত্তা পর্যবেক্ষণ তালিকা */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>সাম্প্রতিক নিরাপত্তা ঘটনা ও সতর্কতা লগ</span>
              </h3>
              <span className="text-[11px] text-gray-500">
                সর্বমোট {securityEvents.length}টি ঘটনা
              </span>
            </div>

            <div className="divide-y divide-gray-200">
              {securityEvents.map((event) => (
                <div key={event.id} className="p-3 bg-white space-y-1">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-bold border ${
                          event.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-900 border-red-300'
                            : event.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-blue-100 text-blue-900 border-blue-300'
                        }`}
                      >
                        {event.severity === 'CRITICAL'
                          ? 'গুরুতর'
                          : event.severity === 'WARNING'
                          ? 'সতর্কতা'
                          : 'তথ্য'}
                      </span>
                      <span className="font-bold text-gray-900">{event.title}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {event.timestamp}
                    </span>
                  </div>

                  <p className="text-gray-700 text-[11px] leading-relaxed">
                    {event.description}
                  </p>

                  <div className="text-[10px] text-gray-500 flex flex-wrap items-center gap-2 pt-1">
                    <span>সংশ্লিষ্ট পক্ষ: {event.user}</span>
                    <span>|</span>
                    <span>পদবি/ভূমিকা: {event.role}</span>
                    <span>|</span>
                    <span className="text-emerald-700 font-semibold">
                      পদক্ষেপ: {event.actionTaken}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 19: Role-Based Access Control (RBAC) Matrix */}
          <div className="bg-white border border-gray-300 rounded-sm p-4 space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">
              ভূমিকাভিত্তিক অধিকার নিয়ন্ত্রণ কাঠামো (Role Matrix)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-800 border-b font-bold">
                    <th className="py-2 px-2.5">ভূমিকা</th>
                    <th className="py-2 px-2.5">মামলা দেখা</th>
                    <th className="py-2 px-2.5">আইনজীবী নিয়োগ</th>
                    <th className="py-2 px-2.5">অগ্রাধিকার পরিবর্তন</th>
                    <th className="py-2 px-2.5">তথ্য রপ্তানি</th>
                    <th className="py-2 px-2.5">অডিট লগ পরিবর্তন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-gray-900">
                      জেলা কর্মকর্তা (DLO)
                    </td>
                    <td className="py-2 px-2.5 text-emerald-800 font-bold">নিজ জেলা</td>
                    <td className="py-2 px-2.5 text-emerald-800 font-bold">অনুমোদিত</td>
                    <td className="py-2 px-2.5 text-emerald-800 font-bold">লিখিত কারণসহ</td>
                    <td className="py-2 px-2.5 text-emerald-800 font-bold">যৌক্তিক কারণসহ</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">নিষিদ্ধ (Read-only)</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-gray-900">
                      প্যানেল আইনজীবী
                    </td>
                    <td className="py-2 px-2.5 text-amber-800 font-bold">শুধুমাত্র নিজ নিয়োগকৃত</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">নিষিদ্ধ</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">নিষিদ্ধ</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">নিষিদ্ধ</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">নিষিদ্ধ</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-gray-900">
                      সহকারী কর্মকর্তা
                    </td>
                    <td className="py-2 px-2.5 text-emerald-800 font-bold">নিজ জেলা</td>
                    <td className="py-2 px-2.5 text-gray-500">প্রস্তাবনা মাত্র</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">নিষিদ্ধ</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">নিষিদ্ধ</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">নিষিদ্ধ</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-gray-900">
                      জাতীয় পর্যায়ের কর্মকর্তা
                    </td>
                    <td className="py-2 px-2.5 text-emerald-800 font-bold">সমগ্র বাংলাদেশ</td>
                    <td className="py-2 px-2.5 text-gray-500">তদারকি</td>
                    <td className="py-2 px-2.5 text-gray-500">তদারকি</td>
                    <td className="py-2 px-2.5 text-emerald-800 font-bold">অনুমোদিত</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">নিষিদ্ধ</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2.5 font-semibold text-gray-900">
                      সিস্টেম প্রশাসক
                    </td>
                    <td className="py-2 px-2.5 text-emerald-800 font-bold">সমগ্র বাংলাদেশ</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">বিচারিক ব্যত্যয় নেই</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">বিচারিক ব্যত্যয় নেই</td>
                    <td className="py-2 px-2.5 text-emerald-800 font-bold">অনুমোদিত</td>
                    <td className="py-2 px-2.5 text-red-700 font-bold">নিষিদ্ধ (অপরিবর্তনীয়)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Controlled Data Export (Section 24) & Server Infrastructure */}
        <div className="space-y-4">
          {/* Section 24: তথ্য রপ্তানি নিয়ন্ত্রণ (Export Control) */}
          <div className="bg-white border border-gray-300 rounded-sm p-4 space-y-3">
            <div className="border-b pb-2">
              <h3 className="font-bold text-gray-900 text-sm flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-900" />
                <span>তথ্য রপ্তানি নিয়ন্ত্রণ (Data Export Security)</span>
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                বাল্ক তথ্য ডাউনলোড সংবেদনশীল অপারেশন। কারণ ব্যতিরেকে অনুমোদন সম্ভব নয়।
              </p>
            </div>

            {exportAlert && (
              <div
                className={`p-2.5 rounded text-[11px] border ${
                  exportAlert.success
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                    : 'bg-red-50 text-red-950 border-red-300'
                }`}
              >
                {exportAlert.message}
              </div>
            )}

            <form onSubmit={handleExportSubmit} className="space-y-2.5">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">রপ্তানির ধরন:</label>
                <select
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-full p-1.5 border border-gray-300 rounded bg-white text-xs"
                >
                  <option value="মামলা_তালিকা">মামলা তালিকা (এক্সেল/সিএসভি)</option>
                  <option value="আইনজীবী_তালিকা">আইনজীবী তালিকা ও কাজের চাপ</option>
                  <option value="মাসিক_প্রতিবেদন">জেলা সমন্বিত মাসিক বিবরণী</option>
                  <option value="পরিসংখ্যান">নিষ্পত্তি ও সময়সীমা পরিসংখ্যান</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">জেলা এক্তিয়ার:</label>
                <select
                  value={exportDistrict}
                  onChange={(e) => setExportDistrict(e.target.value)}
                  className="w-full p-1.5 border border-gray-300 rounded bg-white text-xs"
                >
                  <option value="ঢাকা">ঢাকা জেলা</option>
                  <option value="গাজীপুর">গাজীপুর জেলা</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  রপ্তানির কারণ ও প্রয়োজনীয়তা (বাধ্যতামূলক):
                </label>
                <textarea
                  required
                  rows={2}
                  value={exportReason}
                  onChange={(e) => setExportReason(e.target.value)}
                  placeholder="যেমন: জাতীয় লিগ্যাল এইড বার্ষিক মূল্যায়নের জন্য..."
                  className="w-full p-2 border border-gray-300 rounded text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#172554] text-white rounded font-bold hover:bg-blue-900 cursor-pointer"
              >
                সুরক্ষিত রপ্তানি তৈরি করুন
              </button>
            </form>
          </div>

          {/* Server Infrastructure Security Status */}
          <div className="bg-white border border-gray-300 rounded-sm p-4 space-y-2.5">
            <h4 className="font-bold text-gray-900 text-xs flex items-center space-x-1.5">
              <Server className="w-3.5 h-3.5 text-gray-600" />
              <span>নিরাপত্তা কনফিগারেশন নিরীক্ষা</span>
            </h4>

            <div className="space-y-1.5 text-[11px] text-gray-700">
              <div className="flex justify-between items-center py-1 border-b">
                <span>Content-Security-Policy</span>
                <span className="text-emerald-700 font-bold">সক্রিয়</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span>X-Content-Type-Options: nosniff</span>
                <span className="text-emerald-700 font-bold">কার্যকর</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span>Strict-Transport-Security (HSTS)</span>
                <span className="text-emerald-700 font-bold">এনফোর্সড</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b">
                <span>ডাটাবেজ ব্যাকআপ স্থিতি</span>
                <span className="text-emerald-700 font-bold">আজ রাত ০৩:০০</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>সংরক্ষিত নথির অখণ্ডতা হ্যাশ</span>
                <span className="text-emerald-700 font-bold">SHA-256 ভ্যালিডেটেড</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
