/**
 * সিকিউরিটি ইনসিডেন্ট বিস্তারিত মডাল (Dedicated Security Incident Inspection View)
 * পূর্ণাঙ্গ ইনসিডেন্ট লাইফসাইকেল, কন্ট্রোল রেসপন্স পাইপলাইন ও ডিজিটাল প্রমাণপত্র
 */

import React from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  FileText,
  Activity,
  Server,
  ArrowRight,
  ExternalLink,
  History,
  CheckCircle2,
  Eye,
  Terminal,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

export const SecurityIncidentDetailModal: React.FC = () => {
  const {
    isIncidentModalOpen,
    setIsIncidentModalOpen,
    selectedIncidentId,
    securityIncidents,
    openNikahnamaPreview,
    setActiveView,
  } = useLegalAid();

  if (!isIncidentModalOpen) return null;

  const incident =
    securityIncidents.find((inc) => inc.id === selectedIncidentId) ||
    securityIncidents[0];

  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <div className="bg-white rounded border border-gray-400 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-3.5 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-red-400 font-bold">
                  {incident.id}
                </span>
                <span className="text-gray-400">•</span>
                <h3 className="font-bold text-sm text-gray-100">
                  {incident.title}
                </h3>
              </div>
              <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-gray-400">
                <span>শনাক্তকরণ সময়: {incident.detectedAt}</span>
                <span>•</span>
                <span>কোরিলেশন আইডি: {incident.correlationId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="bg-red-950 text-red-300 font-bold px-2 py-0.5 rounded text-[10px] border border-red-800">
              {incident.severity}
            </span>
            <span className="bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-800">
              {incident.status === 'CONTAINED' ? 'নিয়ন্ত্রিত (CONTAINED)' : incident.status}
            </span>
            <button
              onClick={() => setIsIncidentModalOpen(false)}
              className="text-gray-400 hover:text-white p-1 rounded transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>
              নিরাপত্তা পর্যবেক্ষণ: আক্রমণ তাৎক্ষণিকভাবে ব্লক ও কোয়ারেন্টিন করা হয়েছে। কোনো সংবেদনশীল তথ্য ফাঁস হয়নি।
            </span>
          </div>
          <span className="bg-amber-200/80 text-amber-900 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold">
            কাল্পনিক হ্যাকাথন নমুনা / DEMO
          </span>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 bg-gray-50/50">
          {/* Visual Control Response Pipeline */}
          <div className="bg-white p-4 rounded border border-gray-300 shadow-xs">
            <div className="text-[11px] font-bold text-gray-700 mb-3 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-blue-700" />
                <span>স্বয়ংক্রিয় নিরাপত্তা নিয়ন্ত্রণ প্রতিক্রিয়া (Control Response Workflow):</span>
              </span>
              <span className="text-[10px] text-gray-500 font-normal">
                প্রতিক্রিয়া সময়: &lt; ১৫ মিলিসেকেন্ড
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <div className="bg-red-50 border border-red-200 p-2 rounded text-center">
                <div className="text-[10px] text-gray-500">১. টোকেন যাচাই</div>
                <div className="font-bold text-red-700 mt-0.5 text-[11px]">FAILED ✗</div>
                <div className="text-[9px] text-gray-500 mt-0.5">বিয়ারার টোকেন অনুপস্থিত</div>
              </div>
              <div className="bg-red-50 border border-red-200 p-2 rounded text-center">
                <div className="text-[10px] text-gray-500">২. RBAC / BOLA</div>
                <div className="font-bold text-red-700 mt-0.5 text-[11px]">DENIED ✗</div>
                <div className="text-[9px] text-gray-500 mt-0.5">অবজেক্ট এক্সেস নিষিদ্ধ</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-2 rounded text-center">
                <div className="text-[10px] text-gray-500">৩. ট্রাফিক অ্যাকশন</div>
                <div className="font-bold text-emerald-700 mt-0.5 text-[11px]">BLOCKED ✓</div>
                <div className="text-[9px] text-gray-500 mt-0.5">HTTP 403 Forbidden</div>
              </div>
              <div className="bg-amber-50 border border-amber-200 p-2 rounded text-center">
                <div className="text-[10px] text-gray-500">৪. কোয়ারেন্টিন</div>
                <div className="font-bold text-amber-700 mt-0.5 text-[11px]">QUARANTINED ✓</div>
                <div className="text-[9px] text-gray-500 mt-0.5">আইপি সাময়িক ব্লকলিস্ট</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-2 rounded text-center">
                <div className="text-[10px] text-gray-500">৫. অডিট ট্রেইল</div>
                <div className="font-bold text-blue-700 mt-0.5 text-[11px]">RECORDED ✓</div>
                <div className="text-[9px] text-gray-500 mt-0.5">অপরিবর্তনীয় লেজার এন্ট্রি</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-2 rounded text-center">
                <div className="text-[10px] text-gray-500">৬. ইনসিডেন্ট টিকিট</div>
                <div className="font-bold text-purple-700 mt-0.5 text-[11px]">CREATED ✓</div>
                <div className="text-[9px] text-gray-500 mt-0.5">তদন্ত ও প্রতিকার ট্র্যাকিং</div>
              </div>
            </div>
          </div>

          {/* Key Metadata Grid */}
          <div className="bg-white p-4 rounded border border-gray-300 shadow-xs">
            <h4 className="font-bold text-xs text-gray-800 mb-3 border-b border-gray-200 pb-1.5">
              ইনসিডেন্ট মেটাউপাত্ত বিবরণী (Incident Attributes)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <span className="text-gray-500 text-[10px] block">আক্রমণের উৎস / অভিনেতা:</span>
                <span className="font-bold text-gray-900">{incident.actor}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">উৎসের আইপি ঠিকানা:</span>
                <span className="font-mono font-bold text-gray-800">{incident.ipAddress}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">আক্রান্ত রিসোর্স / নথি:</span>
                <span className="font-bold text-blue-900">{incident.resourceName}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">রিসোর্সের ধরন:</span>
                <span className="font-semibold text-gray-800">{incident.resourceType}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">সম্পর্কিত মামলা নম্বর:</span>
                <span className="font-bold text-gray-900">{incident.caseNumber}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">শনাক্তকরণের কারণ:</span>
                <span className="font-semibold text-red-800">{incident.detectionReason}</span>
              </div>
            </div>
          </div>

          {/* Threat Summary & Root Cause */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border border-gray-300 shadow-xs">
              <h4 className="font-bold text-xs text-gray-800 mb-2 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>কেন ঘটনাটি ফ্ল্যাগ করা হয়েছে? (Why Flagged)</span>
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {incident.whyFlagged}
              </p>
              <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200 text-[10px] text-gray-500">
                নীতিমালা লঙ্ঘন: <strong className="text-gray-800">SEC-BOLA-01</strong> (অবজেক্ট লেভেলে যথাযথ অধিকার বিহীন রিসোর্স এক্সেস নিষিদ্ধ)।
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-gray-300 shadow-xs">
              <h4 className="font-bold text-xs text-gray-800 mb-2 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>কী প্রতিহত হয়েছে ও বর্তমান স্থিতি (What was Blocked)</span>
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {incident.whatWasBlocked}
              </p>
              <div className="mt-3 p-2 bg-emerald-50 rounded border border-emerald-200 text-[10px] text-emerald-900 font-semibold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>নথির অখণ্ডতা অক্ষত আছে এবং কোনো ডেটা লিক সংঘটিত হয়নি।</span>
              </div>
            </div>
          </div>

          {/* Preserved Evidence Dossier */}
          <div className="bg-white p-4 rounded border border-gray-300 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-2">
              <h4 className="font-bold text-xs text-gray-800 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>সংরক্ষিত ডিজিটাল প্রমাণপত্র ডসিয়ার (Preserved Evidence Dossier)</span>
              </h4>

              {incident.evidenceDocumentId && (
                <button
                  onClick={openNikahnamaPreview}
                  className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 rounded font-semibold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-800" />
                  <span>নথির নমুনা প্রাকদর্শন (Watermarked Preview)</span>
                </button>
              )}
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="bg-gray-900 text-gray-200 p-3 rounded overflow-x-auto">
                <div className="text-gray-400 text-[10px] mb-1 font-sans font-bold flex items-center space-x-1">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  <span>কাঁচা নেটওয়ার্ক রিকোয়েস্ট লগ (HTTP Raw Trace Payload):</span>
                </div>
                <div className="text-emerald-400">
                  GET /api/v1/cases/LA-2026-001284/documents/doc-4/download HTTP/1.1
                </div>
                <div className="text-gray-400">Host: legalaid.gov.bd.internal</div>
                <div className="text-gray-400">User-Agent: curl/7.88.1 (Simulated external script)</div>
                <div className="text-gray-400">X-Forwarded-For: 203.112.55.19</div>
                <div className="text-gray-400">Authorization: [MISSING_BEARER_TOKEN]</div>
                <div className="text-amber-400 mt-1">
                  HTTP/1.1 403 Forbidden
                </div>
                <div className="text-gray-400">Content-Type: application/problem+json</div>
                <div className="text-red-400">
                  {`{"error":"UNAUTHORIZED_RESOURCE_ACCESS","code":403,"incidentId":"${incident.id}","correlationId":"${incident.correlationId}"}`}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-200">
                <div>
                  <span className="font-bold text-gray-700">টার্গেট রিসোর্স হ্যাশ (SHA-256):</span>
                  <code className="text-gray-800 break-all block mt-0.5 font-mono">
                    sha256:4f8a9e23c7b165d49a02ef42cbb9301da287efbc19385718a73694019d21e8
                  </code>
                </div>
                <div>
                  <span className="font-bold text-gray-700">স্বয়ংক্রিয় প্রশমন ব্যবস্থা:</span>
                  <div className="text-gray-800 mt-0.5">
                    {incident.remediationTaken}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-5 py-3 border-t border-gray-300 flex justify-between items-center">
          <div className="text-[11px] text-gray-500">
            স্ট্যাটাস: <span className="font-bold text-emerald-800">{incident.status}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsIncidentModalOpen(false);
                setActiveView('audit-log');
              }}
              className="px-3 py-1.5 bg-blue-50 text-blue-900 border border-blue-300 hover:bg-blue-100 rounded font-semibold text-xs flex items-center space-x-1 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-blue-700" />
              <span>অডিট ট্রেইলে প্রমাণপত্র দেখুন</span>
            </button>

            <button
              onClick={() => setIsIncidentModalOpen(false)}
              className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded font-semibold text-xs cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
