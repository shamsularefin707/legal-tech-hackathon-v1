/**
 * সরকারি প্রতিবেদন ও পরিসংখ্যান (Official Government Reports & Statistics)
 * Section 25
 */

import React from 'react';
import {
  Printer,
  FileSpreadsheet,
  Download,
  BarChart3,
  Calendar,
  Building2,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

export const ReportsView: React.FC = () => {
  const { currentUser, cases, lawyers } = useLegalAid();

  const handlePrint = () => {
    window.print();
  };

  const categoryStats = [
    { name: 'পারিবারিক', count: 48, percentage: 34 },
    { name: 'নারী ও শিশু', count: 32, percentage: 22 },
    { name: 'ফৌজদারি', count: 26, percentage: 18 },
    { name: 'জমি ও সম্পত্তি', count: 20, percentage: 14 },
    { name: 'শ্রম অধিকার', count: 11, percentage: 8 },
    { name: 'অন্যান্য', count: 5, percentage: 4 },
  ];

  const statusStats = [
    { status: 'চলমান বিচারিক কার্যক্রম', count: 89, rate: '৬২.৬%' },
    { status: 'নিষ্পত্তিকৃত মামলা', count: 35, rate: '২৪.৬%' },
    { status: 'আইনজীবী নিয়োগ অপেক্ষমাণ', count: 12, rate: '৮.৫%' },
    { status: 'বিকল্প বিরোধ নিষ্পত্তিতে সফল (ADR)', count: 6, rate: '৪.৩%' },
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner with Print Trigger */}
      <div className="bg-white border border-gray-300 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900">
              জেলা আইনগত সহায়তা সমন্বিত পরিসংখ্যান ও প্রতিবেদন
            </h2>
            <span className="bg-blue-100 text-blue-900 text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-300">
              সরকারি বিচারিক রিটার্ন
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            আইন ও বিচার বিভাগ এবং জাতীয় আইনগত সহায়তা প্রদান সংস্থার জন্য প্রস্তুতকৃত
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-1.5 bg-[#172554] text-white rounded font-bold flex items-center space-x-2 hover:bg-blue-900 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>প্রিন্ট / পিডিএফ সংস্করণ প্রস্তুত</span>
        </button>
      </div>

      {/* Printable Report Document Body */}
      <div className="bg-white border border-gray-300 p-6 rounded-sm shadow-xs space-y-5 print:border-0 print:p-0">
        {/* Official Header for Print (Section 25) */}
        <div className="text-center border-b-2 border-gray-800 pb-4 space-y-1">
          <div className="text-xs font-bold text-gray-600">
            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
          </div>
          <h3 className="text-base font-bold text-gray-900">
            জেলা আইনগত সহায়তা কার্যালয়, ঢাকা
          </h3>
          <div className="text-xs text-gray-700 font-medium">
            মাসিক বিচারিক অগ্রগতি, মামলা নিষ্পত্তি ও আইনজীবী কর্মভার প্রতিবেদন
          </div>
          <div className="flex justify-between items-center text-[11px] text-gray-600 pt-2 font-mono">
            <span>প্রতিবেদন প্রস্তুতের তারিখ: ০৯ সেপ্টেম্বর ২০২৬</span>
            <span>স্মারক নং: ডিএলএও/ঢাকা/২০২৬/৮১৪</span>
            <span>প্রতিবেদন প্রস্তুতকারী: {currentUser.name} ({currentUser.designation})</span>
          </div>
        </div>

        {/* Aggregate Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-b pb-4">
          <div className="border p-2.5 rounded bg-gray-50/50">
            <div className="text-[11px] text-gray-500">মোট নথিভুক্ত আবেদন</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">১৪২টি</div>
          </div>
          <div className="border p-2.5 rounded bg-gray-50/50">
            <div className="text-[11px] text-gray-500">নিষ্পত্তির হার (Disposal Rate)</div>
            <div className="text-lg font-bold text-emerald-800 mt-0.5">৭৪.২%</div>
          </div>
          <div className="border p-2.5 rounded bg-gray-50/50">
            <div className="text-[11px] text-gray-500">গড় নিষ্পত্তির সময়কাল</div>
            <div className="text-lg font-bold text-[#172554] mt-0.5">৫.৪ মাস</div>
          </div>
          <div className="border p-2.5 rounded bg-gray-50/50">
            <div className="text-[11px] text-gray-500">সময়সীমা পরিপালন হার</div>
            <div className="text-lg font-bold text-blue-900 mt-0.5">৮৯.০%</div>
          </div>
        </div>

        {/* Section 1: মামলার ধরন অনুযায়ী সংখ্যা (Restrained Bar Representation) */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b pb-1">
            ১. মামলার ধরন ও বিষয়ভিত্তিক পরিসংখ্যান
          </h4>
          <div className="space-y-2">
            {categoryStats.map((item, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-800">{item.name} মোকদ্দমা</span>
                  <span className="font-mono text-gray-700">
                    {item.count}টি ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-xs overflow-hidden border border-gray-200">
                  <div
                    className="bg-[#172554] h-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: মামলার বর্তমান অবস্থা */}
        <div className="space-y-2.5 pt-2">
          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b pb-1">
            ২. মামলার পর্যায়ক্রমিক বিচারিক অবস্থা
          </h4>
          <table className="w-full text-left text-xs border border-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b">
                <th className="py-2 px-3">অবস্থা</th>
                <th className="py-2 px-3 text-right">মামলা সংখ্যা</th>
                <th className="py-2 px-3 text-right">শতাংশ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {statusStats.map((s, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 text-gray-800 font-medium">{s.status}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">
                    {s.count}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-gray-600">
                    {s.rate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 3: প্যানেল আইনজীবীদের কর্মভার নিরীক্ষা */}
        <div className="space-y-2.5 pt-2">
          <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider border-b pb-1">
            ৩. প্যানেল আইনজীবীদের কার্যভার বণ্টন ও উপস্থিতি
          </h4>
          <table className="w-full text-left text-xs border border-gray-200 border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b">
                <th className="py-2 px-3">আইনজীবীর নাম</th>
                <th className="py-2 px-3">সনদ নং</th>
                <th className="py-2 px-3">সক্রিয় মামলা</th>
                <th className="py-2 px-3">সর্বোচ্চ সীমা</th>
                <th className="py-2 px-3">নিষ্পন্ন</th>
                <th className="py-2 px-3">কাজের চাপ স্থিতি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lawyers.map((l) => (
                <tr key={l.id}>
                  <td className="py-2 px-3 font-semibold text-gray-900">{l.name}</td>
                  <td className="py-2 px-3 font-mono text-gray-600">{l.barRegNo}</td>
                  <td className="py-2 px-3 font-mono font-bold">{l.currentActiveCases}</td>
                  <td className="py-2 px-3 font-mono text-gray-500">{l.maxCaseLimit}</td>
                  <td className="py-2 px-3 font-mono text-emerald-800">{l.disposedCasesCount}</td>
                  <td className="py-2 px-3">
                    {l.currentActiveCases >= l.maxCaseLimit ? (
                      <span className="text-red-700 font-bold">অতিরিক্ত কাজের চাপ</span>
                    ) : (
                      <span className="text-emerald-700 font-medium">ভারসাম্যপূর্ণ</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Footer (Section 25) */}
        <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-gray-400 pt-2 w-48 mx-auto font-medium text-gray-700">
              প্রস্তুতকারী কর্মকর্তা
              <div className="text-[10px] text-gray-500">
                জেলা আইনগত সহায়তা কার্যালয়, ঢাকা
              </div>
            </div>
          </div>
          <div>
            <div className="border-t border-gray-400 pt-2 w-48 mx-auto font-medium text-gray-700">
              অনুমোদনকারী জজ / কর্মকর্তা
              <div className="text-[10px] text-gray-500">
                চেয়ারম্যান, জেলা লিগ্যাল এইড কমিটি
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
