/**
 * সময়সীমা ও SLA পর্যবেক্ষণ (Deadline & SLA Monitoring)
 * Section 15 & 16
 */

import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

export const DeadlinesView: React.FC = () => {
  const { cases, setSelectedCaseId, setActiveView, stuckCases } = useLegalAid();
  const [activeFilter, setActiveFilter] = useState<
    'ALL' | 'OVERDUE' | 'URGENT' | 'WITHIN_7_DAYS' | 'STUCK'
  >('ALL');

  // Flatten all deadlines
  const allDeadlines = cases.flatMap((c) =>
    c.deadlines.map((d) => ({
      ...d,
      caseNumber: c.caseNumber,
      caseId: c.id,
      applicantName: c.applicant.name,
      district: c.district,
      courtName: c.courtName,
    }))
  );

  const overdueDeadlines = allDeadlines.filter((d) => d.status === 'OVERDUE');
  const urgentDeadlines = allDeadlines.filter(
    (d) => d.category === 'URGENT' && d.status !== 'OVERDUE'
  );
  const within7Days = allDeadlines.filter((d) => d.category === 'WITHIN_7_DAYS');

  const filteredDeadlines = allDeadlines.filter((d) => {
    if (activeFilter === 'OVERDUE') return d.status === 'OVERDUE';
    if (activeFilter === 'URGENT') return d.category === 'URGENT';
    if (activeFilter === 'WITHIN_7_DAYS') return d.category === 'WITHIN_7_DAYS';
    return true;
  });

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-white border border-gray-300 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-gray-900">
              আইনগত সময়সীমা ও SLA পর্যবেক্ষণ (সময়সীমা ডেস্ক)
            </h2>
            <span className="bg-red-100 text-red-900 text-[11px] font-semibold px-2 py-0.5 rounded border border-red-300">
              জরুরি সতর্কতা ব্যবস্থা
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            বিচারিক কার্যক্রমে বিলম্ব রোধে সংবিধিবদ্ধ সময়সীমা ও জবাবদিহিতা পরিবীক্ষণ
          </p>
        </div>
        <div className="text-xs text-gray-700 bg-gray-100 px-3 py-1.5 rounded border border-gray-300 font-semibold">
          মোট সময়সীমা ট্র্যাক হচ্ছে: {allDeadlines.length}টি
        </div>
      </div>

      {/* 4 SLA Category Status Cards (Section 15) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <button
          onClick={() => setActiveFilter('OVERDUE')}
          className={`p-3 rounded border text-left cursor-pointer transition-colors ${
            activeFilter === 'OVERDUE'
              ? 'bg-red-100 border-red-400'
              : 'bg-white border-red-300 hover:bg-red-50/50'
          }`}
        >
          <div className="flex justify-between items-center text-red-800 font-semibold">
            <span>সময়সীমা অতিক্রান্ত</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-bold text-red-950 mt-1">
            {overdueDeadlines.length}টি
          </div>
          <div className="text-[10px] text-red-700 mt-0.5">ঊর্ধ্বতন কর্মকর্তাকে অবহিত</div>
        </button>

        <button
          onClick={() => setActiveFilter('URGENT')}
          className={`p-3 rounded border text-left cursor-pointer transition-colors ${
            activeFilter === 'URGENT'
              ? 'bg-orange-100 border-orange-400'
              : 'bg-white border-orange-300 hover:bg-orange-50/50'
          }`}
        >
          <div className="flex justify-between items-center text-orange-800 font-semibold">
            <span>জরুরি (১-৩ দিন)</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl font-bold text-orange-950 mt-1">
            {urgentDeadlines.length}টি
          </div>
          <div className="text-[10px] text-orange-700 mt-0.5">জরুরি সতর্কতা জারি</div>
        </button>

        <button
          onClick={() => setActiveFilter('WITHIN_7_DAYS')}
          className={`p-3 rounded border text-left cursor-pointer transition-colors ${
            activeFilter === 'WITHIN_7_DAYS'
              ? 'bg-amber-100 border-amber-400'
              : 'bg-white border-amber-300 hover:bg-amber-50/50'
          }`}
        >
          <div className="flex justify-between items-center text-amber-800 font-semibold">
            <span>৭ দিনের মধ্যে</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-950 mt-1">
            {within7Days.length}টি
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">নিয়মিত প্রস্তুতি তাগিদ</div>
        </button>

        <button
          onClick={() => setActiveFilter('STUCK')}
          className={`p-3 rounded border text-left cursor-pointer transition-colors ${
            activeFilter === 'STUCK'
              ? 'bg-blue-100 border-blue-400'
              : 'bg-white border-gray-300 hover:bg-blue-50/50'
          }`}
        >
          <div className="flex justify-between items-center text-gray-800 font-semibold">
            <span>অচল মামলা (&gt;৭ দিন স্থবির)</span>
            <AlertOctagon className="w-4 h-4 text-blue-900" />
          </div>
          <div className="text-xl font-bold text-blue-950 mt-1">
            {stuckCases.length}টি
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5">প্রশাসনিক পর্যালোচনা আবশ্যক</div>
        </button>
      </div>

      {/* Main Content Area */}
      {activeFilter === 'STUCK' ? (
        /* Section 16: Stuck Case Detection */
        <div className="bg-white border border-gray-300 rounded-sm p-4 space-y-3">
          <div className="border-b pb-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>অচল / দীর্ঘদিন কার্যক্রমবিহীন মামলা শনাক্তকরণ (সেকশন ১৬)</span>
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5">
              যেসব মামলায় টানা ৭ দিনের বেশি কোনো কার্যকর অগ্রগতি বা কার্যক্রম নথিভুক্ত হয়নি।
            </p>
          </div>

          <div className="space-y-3">
            {stuckCases.map((sc) => (
              <div
                key={sc.id}
                className="border border-amber-300 bg-amber-50/30 p-3.5 rounded space-y-2"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="font-bold text-base text-[#172554]">{sc.caseNumber}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="font-semibold text-gray-800">{sc.applicant.name}</span>
                    <span className="text-gray-400 mx-2">|</span>
                    <span className="text-gray-600">{sc.courtName}</span>
                  </div>
                  <span className="bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 rounded font-bold">
                    গত {sc.daysWithoutActivity} দিন কার্যক্রমহীন
                  </span>
                </div>

                <div className="text-gray-700 bg-white p-2.5 rounded border border-gray-200">
                  <div className="font-bold text-gray-900 mb-1">
                    সুপারিশকৃত প্রশাসনিক পদক্ষেপসমূহ (Administrative Decision Support):
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-gray-700 text-[11px]">
                    <li>দায়িত্বপ্রাপ্ত প্যানেল আইনজীবীর ({sc.assignedLawyerName || 'অনির্ধারিত'}) সাথে সরাসরি যোগাযোগ ও অগ্রগতি তলব</li>
                    <li>জেলা আইনগত সহায়তা কর্মকর্তা কর্তৃক নথির সার্বিক পর্যালোচনা</li>
                    <li>আদালতের সর্বশেষ আদেশের অনুলিপি ও শুনানির তারিখ নিরীক্ষা</li>
                    <li>মামলার কোনো সংযুক্তি বা নথি অসম্পূর্ণ রয়েছে কিনা যাচাই</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedCaseId(sc.id);
                      setActiveView('case-detail');
                    }}
                    className="px-3 py-1 bg-[#172554] text-white rounded font-semibold hover:bg-blue-900 cursor-pointer"
                  >
                    মামলার নথিতে যান →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Section 15: Deadlines Administrative Table */
        <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-800 border-b border-gray-300 font-bold">
                  <th className="py-2.5 px-3 whitespace-nowrap">মামলা নম্বর</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">সময়সীমার বিবরণ</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">নির্ধারিত তারিখ</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">অবশিষ্ট দিন</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">দায়িত্বপ্রাপ্ত কর্মকর্তা</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">দায়িত্বপ্রাপ্ত আইনজীবী</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">প্রয়োজনীয় পদক্ষেপ</th>
                  <th className="py-2.5 px-3 whitespace-nowrap text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeadlines.map((dl) => (
                  <tr
                    key={dl.id}
                    className={`hover:bg-blue-50/40 ${
                      dl.status === 'OVERDUE' ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-[#172554] whitespace-nowrap">
                      {dl.caseNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-gray-800">
                      {dl.title}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                      {dl.dueDate}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {dl.status === 'OVERDUE' ? (
                        <span className="text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded border border-red-300">
                          {Math.abs(dl.daysRemaining)} দিন বিলম্বিত
                        </span>
                      ) : dl.daysRemaining <= 2 ? (
                        <span className="text-orange-900 font-bold bg-orange-100 px-2 py-0.5 rounded border border-orange-300">
                          বাকি {dl.daysRemaining} দিন
                        </span>
                      ) : (
                        <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          বাকি {dl.daysRemaining} দিন
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                      {dl.assignedOfficer}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                      {dl.assignedLawyer || (
                        <span className="text-amber-800 italic">নিয়োগ অপেক্ষমাণ</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 max-w-[200px]">
                      {dl.actionRequired}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedCaseId(dl.caseId);
                          setActiveView('case-detail');
                        }}
                        className="px-2.5 py-1 bg-[#172554] text-white hover:bg-blue-900 rounded font-semibold cursor-pointer"
                      >
                        মামলা খুলুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
