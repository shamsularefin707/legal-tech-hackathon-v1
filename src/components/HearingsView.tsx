/**
 * শুনানি ও মধ্যস্থতা ডেস্ক (Hearings & Mediation / ADR)
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, Scale, Search } from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

export const HearingsView: React.FC = () => {
  const { cases, setSelectedCaseId, setActiveView } = useLegalAid();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const allHearings = useMemo(() => {
    return cases.flatMap((c) =>
      c.hearings.map((h) => ({
        ...h,
        caseNumber: c.caseNumber,
        caseId: c.id,
        applicantName: c.applicant.name,
        assignedLawyer: c.assignedLawyerName || 'নিয়োগ অপেক্ষমাণ',
        district: c.district,
      }))
    );
  }, [cases]);

  const filteredHearings = useMemo(() => {
    return allHearings.filter(
      (h) =>
        h.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.courtName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.assignedLawyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.district.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allHearings, searchQuery]);

  const totalPages = Math.ceil(filteredHearings.length / itemsPerPage) || 1;
  const paginatedHearings = filteredHearings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-3 text-xs">
      <div className="bg-white border border-gray-300 p-3.5 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900">
              আদালতের শুনানি ও মধ্যস্থতা (ADR) দিনপঞ্জি
            </h2>
            <span className="bg-amber-100 text-blue-950 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-300">
              ডেমো পরিবেশ
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            বিজ্ঞ আদালতসমূহে শুনানির নির্ধারিত তারিখ ও জেলা কার্যালয়ে বিকল্প বিরোধ নিষ্পত্তি ক্যালেন্ডার
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded border border-gray-300">
          নির্ধারিত শুনানি: {filteredHearings.length}টি
        </span>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-gray-300 p-2.5 rounded-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="মামলা নং, আবেদনকারী, আদালত অথবা আইনজীবী দিয়ে অনুসন্ধান..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b font-bold">
                <th className="py-2.5 px-3 whitespace-nowrap">মামলা নম্বর</th>
                <th className="py-2.5 px-3 whitespace-nowrap">আবেদনকারী</th>
                <th className="py-2.5 px-3 whitespace-nowrap">বিজ্ঞ আদালত / বেঞ্চ</th>
                <th className="py-2.5 px-3 whitespace-nowrap">তারিখ ও সময়</th>
                <th className="py-2.5 px-3 whitespace-nowrap">শুনানির উদ্দেশ্য</th>
                <th className="py-2.5 px-3 whitespace-nowrap">দায়িত্বপ্রাপ্ত আইনজীবী</th>
                <th className="py-2.5 px-3 whitespace-nowrap">অবস্থা</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedHearings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-500 text-xs">
                    কোনো শুনানি পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                paginatedHearings.map((h) => (
                  <tr key={h.id} className="hover:bg-blue-50/40">
                    <td className="py-2.5 px-3 font-bold text-[#172554] whitespace-nowrap">
                      {h.caseNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-800">
                      {h.applicantName}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">
                      <div>{h.courtName}</div>
                      <div className="text-[10px] text-gray-500">{h.benchCourtNumber} ({h.district})</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-gray-900">
                      <div>{h.date}</div>
                      <div className="text-[10px] text-gray-500">{h.time}</div>
                    </td>
                    <td className="py-2.5 px-3 text-gray-700">{h.purpose}</td>
                    <td className="py-2.5 px-3 text-gray-800 whitespace-nowrap">{h.assignedLawyer}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-200">
                        {h.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedCaseId(h.caseId);
                          setActiveView('case-detail');
                        }}
                        className="px-2.5 py-1 bg-[#172554] text-white hover:bg-blue-900 rounded text-xs font-semibold cursor-pointer"
                      >
                        নথি দেখুন
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-2.5 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
          <div>
            পৃষ্ঠা {currentPage} এর {totalPages} (মোট {filteredHearings.length}টি শুনানি)
          </div>
          <div className="flex space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-2 py-0.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
            >
              পূর্ববর্তী
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-2 py-0.5 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
            >
              পরবর্তী
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
