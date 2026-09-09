/**
 * প্যানেল আইনজীবী ব্যবস্থাপনা (Panel Lawyer Management - LADCS Model)
 * Section 11, 13, 14
 */

import React, { useState } from 'react';
import {
  UserCheck,
  AlertTriangle,
  Briefcase,
  Search,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';
import { PanelLawyer, CaseCategory } from '../types/legalAid';

export const LawyersView: React.FC = () => {
  const { lawyers, cases, setSelectedCaseId, setActiveView } = useLegalAid();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedSpecialisation, setSelectedSpecialisation] = useState('ALL');
  const [activeLawyerProfile, setActiveLawyerProfile] = useState<PanelLawyer | null>(null);

  const underCapacityCount = lawyers.filter((l) => l.currentActiveCases / l.maxCaseLimit < 0.6).length;
  const balancedCount = lawyers.filter((l) => {
    const ratio = l.currentActiveCases / l.maxCaseLimit;
    return ratio >= 0.6 && ratio < 0.85;
  }).length;
  const highCapacityCount = lawyers.filter((l) => {
    const ratio = l.currentActiveCases / l.maxCaseLimit;
    return ratio >= 0.85 && ratio < 1.0;
  }).length;
  const overCapacityCount = lawyers.filter((l) => l.currentActiveCases >= l.maxCaseLimit).length;

  const filteredLawyers = lawyers.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.barRegNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict =
      selectedDistrict === 'ALL' || l.district === selectedDistrict;
    const matchesSpec =
      selectedSpecialisation === 'ALL' ||
      l.specialisations.includes(selectedSpecialisation as CaseCategory);
    return matchesSearch && matchesDistrict && matchesSpec;
  });

  const getSpecBadge = (s: CaseCategory) => {
    const map: Record<CaseCategory, string> = {
      FAMILY: 'পারিবারিক',
      WOMEN_CHILD: 'নারী ও শিশু',
      CRIMINAL: 'ফৌজদারি',
      CIVIL: 'দেওয়ানি',
      LAND_PROPERTY: 'জমি ও সম্পত্তি',
      LABOUR: 'শ্রম',
      CONSUMER_RIGHTS: 'ভোক্তা অধিকার',
      INHERITANCE: 'উত্তরাধিকার',
      HUMAN_RIGHTS: 'মানবাধিকার',
      OTHER: 'অন্যান্য',
    };
    return map[s] || s;
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-gray-300 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900">
              প্যানেল আইনজীবী ব্যবস্থাপনা (LADCS মডেল)
            </h2>
            <span className="bg-blue-100 text-blue-900 text-[11px] font-semibold px-2 py-0.5 rounded border border-blue-200">
              লিগ্যাল এইড ডিফেন্স কাউন্সিল সিস্টেম
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            আইনজীবীদের কাজের ভারসাম্য, বিশেষায়ন ও স্বার্থের সংঘাত নজরদারি
          </p>
        </div>
        <div className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded border border-gray-300">
          মোট অনুমোদিত আইনজীবী: {lawyers.length} জন
        </div>
      </div>

      {/* Workload Capacity Distribution Summary (LADCS Section 11 & 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white border border-gray-300 p-2.5 rounded">
          <div className="text-gray-500 text-[10px]">স্বাভাবিক কর্মভার (&lt;৬০%)</div>
          <div className="text-base font-bold text-blue-950 mt-0.5">{underCapacityCount} জন</div>
          <div className="text-[10px] text-emerald-700">নুতন মামলা গ্রহণে সম্পূর্ণ প্রস্তুত</div>
        </div>

        <div className="bg-white border border-gray-300 p-2.5 rounded">
          <div className="text-gray-500 text-[10px]">ভারসাম্যপূর্ণ কর্মভার (৬০-৮৪%)</div>
          <div className="text-base font-bold text-gray-900 mt-0.5">{balancedCount} জন</div>
          <div className="text-[10px] text-blue-700">অনুকূল কার্যক্ষমতা বজায় আছে</div>
        </div>

        <div className="bg-white border border-amber-300 bg-amber-50/30 p-2.5 rounded">
          <div className="text-amber-800 text-[10px]">উচ্চ কর্মভার (৮৫-৯৯%)</div>
          <div className="text-base font-bold text-amber-950 mt-0.5">{highCapacityCount} জন</div>
          <div className="text-[10px] text-amber-700">সীমার কাছাকাছি সতর্ক সংকেত</div>
        </div>

        <div className="bg-white border border-red-300 bg-red-50/40 p-2.5 rounded">
          <div className="text-red-700 text-[10px]">সীমা অতিক্রান্ত (১০০%+)</div>
          <div className="text-base font-bold text-red-950 mt-0.5">{overCapacityCount} জন</div>
          <div className="text-[10px] text-red-700 font-bold">নতুন মামলা বরাদ্দ অবরুদ্ধ</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-gray-300 p-3 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="নাম অথবা বার কাউন্সিল নিবন্ধন নম্বর..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
          >
            <option value="ALL">সকল জেলা (৬টি পাইলট)</option>
            <option value="ঢাকা">ঢাকা</option>
            <option value="গাজীপুর">গাজীপুর</option>
            <option value="নারায়ণগঞ্জ">নারায়ণগঞ্জ</option>
            <option value="চট্টগ্রাম">চট্টগ্রাম</option>
            <option value="কুমিল্লা">কুমিল্লা</option>
            <option value="টাঙ্গাইল">টাঙ্গাইল</option>
          </select>
        </div>

        <div>
          <select
            value={selectedSpecialisation}
            onChange={(e) => setSelectedSpecialisation(e.target.value)}
            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
          >
            <option value="ALL">সকল বিশেষায়ন</option>
            <option value="FAMILY">পারিবারিক</option>
            <option value="WOMEN_CHILD">নারী ও শিশু</option>
            <option value="CRIMINAL">ফৌজদারি</option>
            <option value="CIVIL">দেওয়ানি</option>
            <option value="LAND_PROPERTY">জমি ও সম্পত্তি</option>
            <option value="LABOUR">শ্রম</option>
          </select>
        </div>
      </div>

      {/* Lawyer Table */}
      <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b border-gray-300 font-bold">
                <th className="py-2.5 px-3 whitespace-nowrap">আইনজীবীর নাম ও সনদ নং</th>
                <th className="py-2.5 px-3 whitespace-nowrap">জেলা এক্তিয়ার</th>
                <th className="py-2.5 px-3 whitespace-nowrap">বিশেষায়ন</th>
                <th className="py-2.5 px-3 whitespace-nowrap">অভিজ্ঞতা</th>
                <th className="py-2.5 px-3 whitespace-nowrap">কাজের চাপ (সক্রিয়/সীমা)</th>
                <th className="py-2.5 px-3 whitespace-nowrap">প্রাপ্যতা ও অবস্থা</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLawyers.map((lawyer) => {
                const isOverloaded = lawyer.currentActiveCases >= lawyer.maxCaseLimit;
                const percentage = Math.round(
                  (lawyer.currentActiveCases / lawyer.maxCaseLimit) * 100
                );

                return (
                  <tr key={lawyer.id} className="hover:bg-blue-50/40">
                    <td className="py-3 px-3 font-semibold text-gray-900">
                      <div className="text-gray-900 font-bold">{lawyer.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{lawyer.barRegNo}</div>
                    </td>
                    <td className="py-3 px-3 text-gray-700">{lawyer.district}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {lawyer.specialisations.map((s, i) => (
                          <span
                            key={i}
                            className="bg-gray-100 border border-gray-200 text-gray-800 px-1.5 py-0.2 rounded text-[10px]"
                          >
                            {getSpecBadge(s)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-gray-700">{lawyer.experienceYears} বছর</td>
                    <td className="py-3 px-3 min-w-[170px]">
                      <div className="flex justify-between items-center mb-1 text-[11px]">
                        <span
                          className={`font-bold ${
                            isOverloaded ? 'text-red-700' : 'text-gray-800'
                          }`}
                        >
                          {lawyer.currentActiveCases} / {lawyer.maxCaseLimit} মামলা
                        </span>
                        <span className="text-gray-400 font-mono">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-xs overflow-hidden">
                        <div
                          className={`h-full ${
                            isOverloaded ? 'bg-red-600' : 'bg-[#172554]'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      {isOverloaded && (
                        <div className="text-[10px] text-red-700 font-bold mt-0.5 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>সীমা অতিক্রান্ত</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {lawyer.availability === 'AVAILABLE' ? (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-semibold text-[11px]">
                          প্রাপ্য
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-semibold text-[11px]">
                          ব্যস্ত
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setActiveLawyerProfile(lawyer)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded border border-gray-300 cursor-pointer"
                      >
                        প্রোফাইল দেখুন
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lawyer Profile Drawer / Modal (Section 11) */}
      {activeLawyerProfile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded-sm p-5 w-full max-w-xl space-y-3.5 text-xs">
            <div className="flex justify-between items-start border-b pb-2.5">
              <div>
                <h3 className="text-base font-bold text-[#172554]">
                  {activeLawyerProfile.name}
                </h3>
                <div className="text-gray-500 font-mono mt-0.5">
                  সনদ নং: {activeLawyerProfile.barRegNo} | এক্তিয়ার: {activeLawyerProfile.district}
                </div>
              </div>
              <button
                onClick={() => setActiveLawyerProfile(null)}
                className="text-gray-400 hover:text-gray-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded border">
              <div>
                <span className="text-gray-500 block text-[11px]">ফোন:</span>
                <span className="font-semibold text-gray-800">{activeLawyerProfile.phone}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">ইমেইল:</span>
                <span className="font-semibold text-gray-800">{activeLawyerProfile.email}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 block text-[11px]">চেম্বার ঠিকানা:</span>
                <span className="text-gray-800">{activeLawyerProfile.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="border p-2 rounded">
                <div className="text-gray-500 text-[10px]">চলমান মামলা</div>
                <div className="text-base font-bold text-[#172554] mt-0.5">
                  {activeLawyerProfile.currentActiveCases}টি
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-gray-500 text-[10px]">সম্পন্ন মামলা</div>
                <div className="text-base font-bold text-emerald-800 mt-0.5">
                  {activeLawyerProfile.disposedCasesCount}টি
                </div>
              </div>
              <div className="border p-2 rounded">
                <div className="text-gray-500 text-[10px]">নিষ্পত্তির সাফল্য</div>
                <div className="text-base font-bold text-blue-900 mt-0.5">
                  {activeLawyerProfile.successRatePercentage}%
                </div>
              </div>
            </div>

            {/* Known Conflicts Section (Section 13) */}
            <div className="border border-red-200 bg-red-50/50 p-3 rounded">
              <div className="font-bold text-red-950 mb-1 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-red-700" />
                <span>স্বার্থের সংঘাত নজরদারি রেকর্ড (Conflict Registry):</span>
              </div>
              <p className="text-[11px] text-gray-600 mb-1.5">
                এই আইনজীবীর সাথে পূর্বে প্রতিনিধিত্ব করা বা ব্যবসায়িক স্বার্থ সংশ্লিষ্ট পক্ষসমূহ:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {activeLawyerProfile.knownConflicts.map((party, i) => (
                  <span
                    key={i}
                    className="bg-white border border-red-300 text-red-900 px-2 py-0.5 rounded text-[11px] font-medium"
                  >
                    {party}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveLawyerProfile(null)}
                className="px-4 py-1.5 bg-[#172554] text-white rounded font-bold hover:bg-blue-900 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
