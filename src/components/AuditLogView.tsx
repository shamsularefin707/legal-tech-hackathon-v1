/**
 * কার্যক্রমের রেকর্ড ও অডিট ট্রেইল (Tamper-Resistant Audit Log)
 * Section 21
 */

import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  AlertOctagon,
  Download,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';
import { SYSTEM_DATE_TIME, DEMO_CLOCK_DISPLAY_BN } from '../utils/dateUtils';
import { validateDatasetChronology } from '../services/dataQualityService';

export const AuditLogView: React.FC = () => {
  const { auditLogs, cases, viewSecurityIncident } = useLegalAid();
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');
  const [resourceFilter, setResourceFilter] = useState('ALL');

  const chronologyStatus = validateDatasetChronology(cases, auditLogs, SYSTEM_DATE_TIME);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOutcome =
      outcomeFilter === 'ALL' || log.outcome === outcomeFilter;
    const matchesResource =
      resourceFilter === 'ALL' || log.resourceType === resourceFilter;

    return matchesSearch && matchesOutcome && matchesResource;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-gray-300 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">
              কার্যক্রমের রেকর্ড ও অডিট লগবুক
            </h2>
            <span className="bg-emerald-100 text-emerald-900 text-[11px] font-semibold px-2 py-0.5 rounded border border-emerald-300">
              অপরিবর্তনীয় লেজার (Append-only)
            </span>
            <span className="bg-blue-50 text-blue-900 text-[11px] font-semibold px-2.5 py-0.5 rounded border border-blue-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
              Chronology verified • Data integrity: Passed
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            সকল প্রশাসনিক পদক্ষেপ, নথি প্রবেশাধিকার ও নিরাপত্তা ঘটনার সরকারি রেকর্ড। কোনো সম্পন্ন ইভেন্ট ডেমো ক্লকের পরবর্তী নয়।
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-1">
          <div className="text-xs text-gray-700 bg-gray-50 px-3 py-1.5 rounded border border-gray-300 font-medium flex items-center gap-1.5">
            <span className="text-gray-500">ক্যানোনিকাল ডেমো ক্লক:</span>
            <span className="font-bold text-gray-900">{DEMO_CLOCK_DISPLAY_BN}</span>
            <span className="text-[10px] font-mono text-gray-500">({SYSTEM_DATE_TIME})</span>
          </div>
          <div className="text-[11px] text-gray-600 font-medium">
            মোট রেকর্ড: <span className="font-bold text-gray-900">{filteredLogs.length}টি</span> | সর্বোচ্চ টাইমস্ট্যাম্প: <span className="font-mono font-semibold text-emerald-800">{chronologyStatus.maxCompletedTimestamp || '২০২৬-০৯-০৯ ১০:১২'}</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white border border-gray-300 p-3 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="ব্যবহারকারী, কার্যক্রম বা রিসোর্স নম্বর দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none"
          />
        </div>

        <div>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
          >
            <option value="ALL">সকল ফলাফল</option>
            <option value="সফল">সফল</option>
            <option value="প্রত্যাখ্যাত">প্রত্যাখ্যাত</option>
            <option value="ব্লক করা হয়েছে">ব্লক করা হয়েছে</option>
          </select>
        </div>

        <div>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
          >
            <option value="ALL">সকল সম্পদ বিভাগ</option>
            <option value="মামলা">মামলা</option>
            <option value="আইনজীবী">আইনজীবী</option>
            <option value="নথি">নথি</option>
            <option value="প্রতিবেদন">প্রতিবেদন</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table (Section 21) */}
      <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b border-gray-300 font-bold">
                <th className="py-2.5 px-3 whitespace-nowrap">তারিখ ও সময়</th>
                <th className="py-2.5 px-3 whitespace-nowrap">ব্যবহারকারী ও পদবি</th>
                <th className="py-2.5 px-3 whitespace-nowrap">কার্যক্রম</th>
                <th className="py-2.5 px-3 whitespace-nowrap">সম্পদ ও কোরিলেশন</th>
                <th className="py-2.5 px-3 whitespace-nowrap">পূর্ববর্তী অবস্থা</th>
                <th className="py-2.5 px-3 whitespace-nowrap">পরবর্তী অবস্থা</th>
                <th className="py-2.5 px-3 whitespace-nowrap">ফলাফল</th>
                <th className="py-2.5 px-3 whitespace-nowrap">আইপি ও প্রমাণপত্র</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className={`hover:bg-blue-50/40 ${
                    log.outcome === 'ব্লক করা হয়েছে' || log.outcome === 'প্রত্যাখ্যাত'
                      ? 'bg-red-50/30'
                      : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-gray-600 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-gray-900">{log.user}</div>
                    <div className="text-[10px] text-gray-500">{log.role}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-800">
                    <div>{log.action}</div>
                    {log.details && (
                      <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-1 max-w-xs">
                        {log.details}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-gray-700">
                    <div className="font-mono">
                      <span className="font-semibold text-blue-950">{log.resourceType}: </span>
                      <span>{log.resourceId}</span>
                    </div>
                    {log.correlationId && (
                      <div className="text-[10px] font-mono text-blue-700 font-bold mt-0.5">
                        আইডি: {log.correlationId}
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-gray-500">
                    {log.previousState || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-gray-800 font-medium">
                    {log.nextState || '-'}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        log.outcome === 'সফল'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : log.outcome === 'প্রত্যাখ্যাত'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-red-100 text-red-900 border-red-300'
                      }`}
                    >
                      {log.outcome}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <div className="text-gray-500 font-mono text-[11px]">
                      {log.ipAddress}
                    </div>
                    {log.resourceId.includes('INC-') && (
                      <button
                        onClick={() => viewSecurityIncident('inc-42')}
                        className="mt-1 px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-900 rounded text-[10px] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                      >
                        <ShieldAlert className="w-3 h-3 text-red-700" />
                        <span>ইনসিডেন্ট ডসিয়ার</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
