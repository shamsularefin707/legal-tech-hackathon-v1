/**
 * শুনানি ও মধ্যস্থতা ডেস্ক (Hearings & Mediation / ADR)
 */

import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle, Scale } from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';

export const HearingsView: React.FC = () => {
  const { cases, setSelectedCaseId, setActiveView } = useLegalAid();

  const allHearings = cases.flatMap((c) =>
    c.hearings.map((h) => ({
      ...h,
      caseNumber: c.caseNumber,
      caseId: c.id,
      applicantName: c.applicant.name,
      assignedLawyer: c.assignedLawyerName || 'নিয়োগ অপেক্ষমাণ',
      district: c.district,
    }))
  );

  return (
    <div className="space-y-4 text-xs">
      <div className="bg-white border border-gray-300 p-4 rounded-sm flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            আদালতের শুনানি ও মধ্যস্থতা (ADR) দিনপঞ্জি
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            বিজ্ঞ আদালতসমূহে শুনানির তারিখ ও জেলা কার্যালয়ে বিকল্প বিরোধ নিষ্পত্তি ক্যালেন্ডার
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded border border-gray-300">
          নির্ধারিত শুনানি: {allHearings.length}টি
        </span>
      </div>

      <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-800 border-b font-bold">
              <th className="py-2.5 px-3">মামলা নম্বর</th>
              <th className="py-2.5 px-3">আবেদনকারী</th>
              <th className="py-2.5 px-3">বিজ্ঞ আদালত / বেঞ্চ</th>
              <th className="py-2.5 px-3">তারিখ ও সময়</th>
              <th className="py-2.5 px-3">শুনানির উদ্দেশ্য</th>
              <th className="py-2.5 px-3">দায়িত্বপ্রাপ্ত আইনজীবী</th>
              <th className="py-2.5 px-3">অবস্থা</th>
              <th className="py-2.5 px-3 text-right">কার্যক্রম</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allHearings.map((h) => (
              <tr key={h.id} className="hover:bg-blue-50/40">
                <td className="py-2.5 px-3 font-bold text-[#172554]">
                  {h.caseNumber}
                </td>
                <td className="py-2.5 px-3 font-semibold text-gray-800">
                  {h.applicantName}
                </td>
                <td className="py-2.5 px-3 text-gray-700">
                  <div>{h.courtName}</div>
                  <div className="text-[10px] text-gray-500">{h.benchCourtNumber}</div>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap font-medium text-gray-900">
                  <div>{h.date}</div>
                  <div className="text-[10px] text-gray-500">{h.time}</div>
                </td>
                <td className="py-2.5 px-3 text-gray-700">{h.purpose}</td>
                <td className="py-2.5 px-3 text-gray-800">{h.assignedLawyer}</td>
                <td className="py-2.5 px-3">
                  <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-200">
                    {h.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => {
                      setSelectedCaseId(h.caseId);
                      setActiveView('case-detail');
                    }}
                    className="px-2.5 py-1 bg-[#172554] text-white rounded text-xs font-semibold cursor-pointer"
                  >
                    নথি দেখুন
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
