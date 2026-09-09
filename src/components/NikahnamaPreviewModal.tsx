/**
 * সংরক্ষিত নথি প্রাকদর্শন মডাল (Watermarked Demo Evidence Preview)
 * কাল্পনিক বিচারিক নমুনা - সংবেদনশীল পারিবারিক নথি (Nikahnama)
 */

import React from 'react';
import { X, ShieldAlert, FileText, Lock, CheckCircle2, Download, AlertTriangle } from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

export const NikahnamaPreviewModal: React.FC = () => {
  const { isNikahnamaPreviewOpen, setIsNikahnamaPreviewOpen } = useLegalAid();

  if (!isNikahnamaPreviewOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded border border-gray-400 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm">
              সংরক্ষিত নথি নমুনা প্রাকদর্শন (Evidence Sandbox Dossier)
            </h3>
          </div>
          <button
            onClick={() => setIsNikahnamaPreviewOpen(false)}
            className="text-gray-300 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-900 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>
              নিরাপত্তা নীতি: নথিটি ক্রিপ্টোগ্রাফিক ভল্টে সংরক্ষিত। অননুমোদিত বাহ্যিক ডাউনলোড ব্লক করা হয়েছে।
            </span>
          </div>
          <span className="bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
            নমুনা ডেটা / DEMO ONLY
          </span>
        </div>

        {/* Modal Body: The Watermarked Document Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 flex flex-col items-center">
          <div className="relative bg-white border-2 border-dashed border-gray-300 rounded p-6 max-w-lg w-full shadow-sm">
            {/* Watermark Diagonal Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 opacity-20 rotate-[-25deg]">
              <div className="text-center font-black text-3xl sm:text-4xl text-red-600 uppercase tracking-widest leading-relaxed">
                কাল্পনিক ডেমো নমুনা<br />
                DEMO PREVIEW ONLY<br />
                NOT AN OFFICIAL RECORD
              </div>
            </div>

            {/* Document Content */}
            <div className="relative z-0 space-y-4 text-gray-800">
              <div className="text-center border-b border-gray-300 pb-3">
                <div className="text-[11px] font-semibold text-gray-500">
                  গণপ্রজাতন্ত্রী বাংলাদেশ • জেলা আইনি সহায়তা কর্তৃপক্ষ, ঢাকা
                </div>
                <div className="text-base font-bold text-gray-900 mt-0.5">
                  নিকাহনামা ও দেনমোহর বিবরণী (নমুনা কপি)
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  মামলা ট্র্যাকিং নম্বর: LA-2026-001284 | নথি আইডি: doc-4
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded border border-gray-200 text-[11px]">
                <div>
                  <span className="text-gray-500">কনের নাম:</span>
                  <div className="font-bold">মোছা. শারমিন আক্তার (আবেদনকারী)</div>
                </div>
                <div>
                  <span className="text-gray-500">বরের নাম:</span>
                  <div className="font-bold">আনোয়ার হোসেন (বিপক্ষ দল)</div>
                </div>
                <div>
                  <span className="text-gray-500">নিবন্ধন কাজী অফিস:</span>
                  <div className="font-semibold">সাভার পৌর কাজী কার্যালয়</div>
                </div>
                <div>
                  <span className="text-gray-500">ধার্যকৃত দেনমোহর:</span>
                  <div className="font-bold text-blue-900">৳ ৫,০০,০০০ (পাঁচ লক্ষ টাকা)</div>
                </div>
                <div>
                  <span className="text-gray-500">উসুলকৃত দেনমোহর:</span>
                  <div className="font-semibold">৳ ৫০,০০০ (অদ্যাবধি বাকী ৳ ৪,৫০,০০০)</div>
                </div>
                <div>
                  <span className="text-gray-500">নাবালক সন্তান:</span>
                  <div className="font-semibold">১ জন (বয়স ৩ বছর)</div>
                </div>
              </div>

              <div className="bg-blue-50/60 border border-blue-200 p-2.5 rounded text-[11px] text-blue-950">
                <div className="font-bold flex items-center space-x-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>নথির অখণ্ডতা হ্যাশ (Cryptographic SHA-256 Digest):</span>
                </div>
                <code className="text-[10px] text-blue-800 break-all font-mono block bg-white p-1 rounded border border-blue-200">
                  sha256:4f8a9e23c7b165d49a02ef42cbb9301da287efbc19385718a73694019d21e8
                </code>
              </div>

              <div className="text-[10px] text-gray-500 italic bg-amber-50/50 p-2 rounded border border-amber-200">
                ঘোষণা: এই প্রদর্শনীতে প্রদর্শিত ব্যক্তি, কাজী অফিস ও আর্থিক পরিমাণ সম্পূর্ণ কাল্পনিক এবং শুধুমাত্র বিচারিক নিরাপত্তা নিয়ন্ত্রণের কার্যকারিতা প্রমাণের উদ্দেশ্যে সংরক্ষিত।
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-100 px-4 py-2.5 border-t border-gray-300 flex justify-between items-center">
          <div className="text-[11px] text-gray-600">
            অ্যাক্সেস নিরাপত্তা: <span className="font-bold text-emerald-800">TLS 1.3 সুরক্ষিত অভ্যন্তরীণ প্রিভিউ</span>
          </div>
          <button
            onClick={() => setIsNikahnamaPreviewOpen(false)}
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded text-xs font-semibold cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
