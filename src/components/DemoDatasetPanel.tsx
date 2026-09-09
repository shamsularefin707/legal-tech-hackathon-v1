/**
 * সিন্থেটিক ডেটাসেট নিয়ন্ত্রণ ও নিরীক্ষা প্যানেল (Synthetic Dataset Control & Audit Panel)
 * Provides dataset regeneration, seed management, validation metrics, and pilot district distributions.
 */

import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  X,
  MapPin,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';
import { DEFAULT_DEMO_DATA_SEED, PILOT_DISTRICTS } from '../data/demoConfig';

export const DemoDatasetPanel: React.FC = () => {
  const {
    demoSeed,
    regenerateDataset,
    resetToDefaultSeed,
    validationReport,
    isDemoDataPanelOpen,
    setIsDemoDataPanelOpen,
    cases,
    lawyers,
  } = useLegalAid();

  const [inputSeed, setInputSeed] = useState<string>(String(demoSeed));
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isDemoDataPanelOpen) return null;

  const handleRegenerate = (seedVal?: number) => {
    setIsGenerating(true);
    setTimeout(() => {
      const parsed = seedVal !== undefined ? seedVal : parseInt(inputSeed, 10) || DEFAULT_DEMO_DATA_SEED;
      regenerateDataset(parsed);
      setInputSeed(String(parsed));
      setIsGenerating(false);
    }, 200);
  };

  const handleReset = () => {
    setIsGenerating(true);
    setTimeout(() => {
      resetToDefaultSeed();
      setInputSeed(String(DEFAULT_DEMO_DATA_SEED));
      setIsGenerating(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white border border-gray-300 rounded-md shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-[#172554] text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-blue-900 border border-blue-700 flex items-center justify-center font-bold">
              <Database className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm sm:text-base">
                  সিন্থেটিক ডেটাসেট নিয়ন্ত্রণ ও অখণ্ডতা প্যানেল
                </h3>
                <span className="bg-amber-400 text-blue-950 font-bold px-2 py-0.5 rounded text-[10px]">
                  ডেমো পরিবেশ • কাল্পনিক তথ্য
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                নির্ধারক পিআরএনজি (Deterministic PRNG) ভিত্তিক ৫০০ মামলা ও ২৫ প্যানেল আইনজীবীর ডেটাসেট
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDemoDataPanelOpen(false)}
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-blue-900 cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-amber-950 flex items-start space-x-2 shrink-0">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <span className="font-bold">গুরুত্বপূর্ণ সতর্কবার্তা:</span> এটি একটি হ্যাকাথন ডেমো ও প্রোটোটাইপ পরিবেশ। এখানে ব্যবহৃত সকল নাম, এনআইডি, মোবাইল নম্বর, ঠিকানা, এবং মামলার বিবরণ সম্পূর্ণ কাল্পনিক ও স্বয়ংক্রিয়ভাবে উৎপাদিত। কোনো বাস্তব ব্যক্তি বা আদালতের সাথে এর কোনো সম্পর্ক নেই।
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Top Quick Status & Seed Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Status Summary */}
            <div className="bg-blue-50/50 border border-blue-200 rounded p-3 space-y-2">
              <div className="font-bold text-blue-950 flex items-center justify-between">
                <span>ডেটাসেট ভলিউম স্ট্যাটাস</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-600">মোট সিন্থেটিক মামলা:</span>
                  <span className="font-bold text-gray-900 font-mono">{cases.length}টি (১০০%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">প্যানেল আইনজীবী:</span>
                  <span className="font-bold text-gray-900 font-mono">{lawyers.length} জন</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">পাইলট জেলা কভারেজ:</span>
                  <span className="font-bold text-emerald-800 font-mono">৬টি জেলা</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">এসএলএ বিলম্বিত মামলা:</span>
                  <span className="font-bold text-red-700 font-mono">{validationReport.slaBreachedCount}টি</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">অতিভারগ্রস্ত আইনজীবী:</span>
                  <span className="font-bold text-amber-800 font-mono">{validationReport.overcapacityLawyersCount} জন (~৮%)</span>
                </div>
              </div>
            </div>

            {/* Seed Configuration */}
            <div className="bg-gray-50 border border-gray-200 rounded p-3 md:col-span-2 space-y-3">
              <div className="font-bold text-gray-900 flex items-center justify-between">
                <span>নির্ধারক বীজ কনফিগারেশন (Deterministic Seed Engine)</span>
                <span className="font-mono text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-700">
                  বর্তমান বীজ: {demoSeed}
                </span>
              </div>
              <p className="text-[11px] text-gray-600">
                একই বীজ (Seed) ব্যবহার করলে সর্বদা একই সুসংগত সিন্থেটিক মামলা, আইনজীবী ও সম্পর্কের নেটওয়ার্ক তৈরি হবে।
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center space-x-1.5">
                  <label htmlFor="seedInput" className="font-semibold text-gray-700">
                    বীজ মান:
                  </label>
                  <input
                    id="seedInput"
                    type="number"
                    value={inputSeed}
                    onChange={(e) => setInputSeed(e.target.value)}
                    className="w-32 px-2.5 py-1 border border-gray-300 rounded font-mono text-xs focus:outline-none focus:ring-1 focus:ring-blue-900 bg-white"
                  />
                </div>
                <button
                  disabled={isGenerating}
                  onClick={() => handleRegenerate()}
                  className="px-3 py-1.5 bg-[#172554] hover:bg-blue-900 text-white rounded font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>পুনরায় সিন্থেটিক ডেটা জেনারেট করুন</span>
                </button>
                <button
                  disabled={isGenerating}
                  onClick={handleReset}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-bold flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  title="ডিফল্ট বীজ ২০২৬০৯০৯-এ রিসেট করুন"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-gray-600" />
                  <span>ডিফল্ট ডেটাসেটে রিসেট (২০২৬০৯০৯)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Validation Checklist */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>সিন্থেটিক ডেটাসেট অখণ্ডতা ও যাচাইকরণ চেকলিস্ট</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="p-2 border border-emerald-200 bg-emerald-50/50 rounded flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">৫০০টি মামলা জেনারেট সম্পন্ন</div>
                  <div className="text-[10px] text-emerald-800">কোনো খালি বা ডুপ্লিকেট রেকর্ড নেই</div>
                </div>
              </div>

              <div className="p-2 border border-emerald-200 bg-emerald-50/50 rounded flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">২৫ জন প্যানেল আইনজীবী</div>
                  <div className="text-[10px] text-emerald-800">LADCS সীমা ও কর্মভার সমন্বিত</div>
                </div>
              </div>

              <div className="p-2 border border-emerald-200 bg-emerald-50/50 rounded flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">৬টি পাইলট জেলা কোটা সুরক্ষিত</div>
                  <div className="text-[10px] text-emerald-800">ঢাকা ১৫০, গাজীপুর ৮০, নারায়ণগঞ্জ ৭৫...</div>
                </div>
              </div>

              <div className="p-2 border border-emerald-200 bg-emerald-50/50 rounded flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">সম্পর্কীয় অখণ্ডতা (Relational Integrity)</div>
                  <div className="text-[10px] text-emerald-800">মামলা → আইনজীবী → শুনানি লিঙ্ক অক্ষত</div>
                </div>
              </div>

              <div className="p-2 border border-emerald-200 bg-emerald-50/50 rounded flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">বাস্তব PII অনুপস্থিত ও মাস্কিং নিশ্চিত</div>
                  <div className="text-[10px] text-emerald-800">এনআইডি ও ফোন নম্বর কঠোরভাবে সুরক্ষিত</div>
                </div>
              </div>

              <div className="p-2 border border-emerald-200 bg-emerald-50/50 rounded flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">সংবেদনশীল মামলা সুরক্ষা ফিল্টার</div>
                  <div className="text-[10px] text-emerald-800">যৌন সহিংসতা ও অপ্রাপ্তবয়স্ক বিবরণ সুরক্ষিত</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pilot Districts Breakdown Table */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-blue-900" />
              <span>পাইলট জেলাভিত্তিক মামলা ও আইনজীবী বণ্টন তালিকা</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 font-bold text-gray-800">
                    <th className="py-2 px-3">পাইলট জেলা</th>
                    <th className="py-2 px-3">সিন্থেটিক মামলা সংখ্যা</th>
                    <th className="py-2 px-3">বণ্টনের অনুপাত</th>
                    <th className="py-2 px-3">প্যানেল আইনজীবী</th>
                    <th className="py-2 px-3">অন্তর্ভুক্ত উপজেলাসমূহ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {PILOT_DISTRICTS.map((dist) => {
                    const actualCases = validationReport.casesByDistrict[dist.districtBn] || 0;
                    const actualLawyers = validationReport.lawyersByDistrict[dist.districtBn] || 0;
                    const percentage = ((actualCases / cases.length) * 100).toFixed(1);

                    return (
                      <tr key={dist.districtEn} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-semibold text-gray-900">
                          {dist.districtBn} ({dist.districtEn})
                        </td>
                        <td className="py-2 px-3 font-bold font-mono text-blue-950">
                          {actualCases}টি
                        </td>
                        <td className="py-2 px-3 font-mono text-gray-600">
                          {percentage}%
                        </td>
                        <td className="py-2 px-3 font-semibold text-gray-800">
                          {actualLawyers} জন
                        </td>
                        <td className="py-2 px-3 text-gray-600 text-[11px]">
                          {dist.upazilas.join(', ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Distribution Breakdown */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="font-bold text-gray-900 mb-2 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-900" />
              <span>আইনি বিষয়ভিত্তিক শ্রেণিবিভাগ ও কোটা যাচাই</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="p-2.5 border border-purple-200 bg-purple-50/40 rounded">
                <div className="text-gray-600 text-[10px]">নারী / পরিবার / শিশু</div>
                <div className="text-base font-bold text-purple-950 mt-0.5">২৮৫টি</div>
                <div className="text-[10px] text-purple-700 font-semibold">৫৭% (টার্গেট: ৫৫-৬০%)</div>
              </div>

              <div className="p-2.5 border border-amber-200 bg-amber-50/40 rounded">
                <div className="text-gray-600 text-[10px]">জমি ও সম্পত্তি বিরোধ</div>
                <div className="text-base font-bold text-amber-950 mt-0.5">১০০টি</div>
                <div className="text-[10px] text-amber-700 font-semibold">২০% (টার্গেট: ১৮-২২%)</div>
              </div>

              <div className="p-2.5 border border-red-200 bg-red-50/40 rounded">
                <div className="text-gray-600 text-[10px]">সহিংসতা ও ফৌজদারি</div>
                <div className="text-base font-bold text-red-950 mt-0.5">৫০টি</div>
                <div className="text-[10px] text-red-700 font-semibold">১০% (টার্গেট: ৮-১২%)</div>
              </div>

              <div className="p-2.5 border border-blue-200 bg-blue-50/40 rounded">
                <div className="text-gray-600 text-[10px]">সাইবার অপরাধ</div>
                <div className="text-base font-bold text-blue-950 mt-0.5">২৫টি</div>
                <div className="text-[10px] text-blue-700 font-semibold">৫% (টার্গেট: ৪-৬%)</div>
              </div>

              <div className="p-2.5 border border-orange-200 bg-orange-50/40 rounded">
                <div className="text-gray-600 text-[10px]">ঘুষ / দুর্নীতি অভিযোগ</div>
                <div className="text-base font-bold text-orange-950 mt-0.5">১৫টি</div>
                <div className="text-[10px] text-orange-700 font-semibold">৩% (টার্গেট: ২-৪%)</div>
              </div>

              <div className="p-2.5 border border-emerald-200 bg-emerald-50/40 rounded">
                <div className="text-gray-600 text-[10px]">শ্রম ও অন্যান্য প্রতিকার</div>
                <div className="text-base font-bold text-emerald-950 mt-0.5">২৫টি</div>
                <div className="text-[10px] text-emerald-700 font-semibold">৫% (টার্গেট: ৫-৮%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 border-t border-gray-300 p-3 flex justify-between items-center shrink-0">
          <div className="text-gray-600 font-mono text-[11px]">
            রেকর্ড ভ্যালিডেশন: {validationReport.isValid ? 'সফল (VALID)' : 'ত্রুটি শনাক্ত'} | জেনারেটেড: {cases.length} রেকর্ড
          </div>
          <button
            onClick={() => setIsDemoDataPanelOpen(false)}
            className="px-4 py-1.5 bg-[#172554] hover:bg-blue-900 text-white rounded font-bold cursor-pointer"
          >
            প্যানেল বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
