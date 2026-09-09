/**
 * মামলা তালিকা (Serious Government Administrative Case List Table)
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';
import { LegalAidCase, CaseCategory, CaseStatus, PriorityLevel } from '../types/legalAid';

export const CasesListView: React.FC = () => {
  const { cases, setSelectedCaseId, setActiveView, checkObjectAccess } = useLegalAid();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedSLA, setSelectedSLA] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filtered List
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.assignedLawyerName &&
          c.assignedLawyerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.upazila.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'ALL' || c.category === selectedCategory;
      const matchesStatus =
        selectedStatus === 'ALL' || c.status === selectedStatus;
      const matchesPriority =
        selectedPriority === 'ALL' ||
        c.priorityAssessment.calculatedPriority === selectedPriority;
      const matchesDistrict =
        selectedDistrict === 'ALL' || c.district === selectedDistrict;
      const matchesSLA =
        selectedSLA === 'ALL' ||
        (selectedSLA === 'BREACHED' && c.slaStatus === 'BREACHED') ||
        (selectedSLA === 'APPROACHING_RISK' && c.slaStatus === 'APPROACHING_RISK') ||
        (selectedSLA === 'NORMAL' && c.slaStatus === 'NORMAL');

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesDistrict && matchesSLA;
    });
  }, [cases, searchQuery, selectedCategory, selectedStatus, selectedPriority, selectedDistrict, selectedSLA]);

  const totalPages = Math.ceil(filteredCases.length / itemsPerPage) || 1;
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'PENDING_LAWYER_ASSIGNMENT':
        return <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-300">আইনজীবী নিয়োগ অপেক্ষমাণ</span>;
      case 'LAWYER_ASSIGNED':
        return <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-300">আইনজীবী নিয়োগ সম্পন্ন</span>;
      case 'IN_PROGRESS':
        return <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded text-[11px] font-semibold border border-indigo-300">চলমান</span>;
      case 'HEARING_ONGOING':
        return <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded text-[11px] font-semibold border border-purple-300">শুনানি চলমান</span>;
      case 'MEDIATION_ONGOING':
        return <span className="bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded text-[11px] font-semibold border border-cyan-300">মধ্যস্থতা চলমান</span>;
      case 'DISPOSED':
        return <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-semibold border border-emerald-300">নিষ্পত্তি হয়েছে</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-medium border border-gray-300">{status}</span>;
    }
  };

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'VERY_HIGH':
        return <span className="text-red-900 bg-red-100 px-2 py-0.5 rounded text-[11px] font-bold border border-red-300">অতি উচ্চ</span>;
      case 'HIGH':
        return <span className="text-orange-900 bg-orange-100 px-2 py-0.5 rounded text-[11px] font-bold border border-orange-300">উচ্চ</span>;
      case 'MEDIUM':
        return <span className="text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[11px] font-semibold border border-blue-300">মধ্যম</span>;
      case 'LOW':
        return <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium border border-gray-300">সাধারণ</span>;
    }
  };

  const getCategoryName = (cat: CaseCategory) => {
    const map: Record<CaseCategory, string> = {
      CRIMINAL: 'ফৌজদারি',
      CIVIL: 'দেওয়ানি',
      FAMILY: 'পারিবারিক',
      WOMEN_CHILD: 'নারী ও শিশু',
      LAND_PROPERTY: 'জমি ও সম্পত্তি',
      LABOUR: 'শ্রম',
      CONSUMER_RIGHTS: 'ভোক্তা অধিকার',
      INHERITANCE: 'উত্তরাধিকার',
      HUMAN_RIGHTS: 'মানবাধিকার',
      OTHER: 'অন্যান্য',
    };
    return map[cat] || cat;
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="bg-white border border-gray-300 p-3.5 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">মামলা ও বিচারিক কার্যক্রম ব্যবস্থাপনা</h2>
          <p className="text-xs text-gray-500">
            জেলায় নিবন্ধিত সকল আইনগত সহায়তা আবেদনের তালিকা ও হালনাগাদ তথ্য
          </p>
        </div>
        <div className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded border border-gray-300">
          মোট ফলাফল: {filteredCases.length}টি মামলা
        </div>
      </div>

      {/* Filter / Search Bar & Quick Chips */}
      <div className="bg-white border border-gray-300 p-3 rounded-sm space-y-2.5 text-xs">
        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-gray-100">
          <span className="text-gray-500 font-semibold mr-1">দ্রুত ফিল্টার:</span>
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
              setSelectedDistrict('ALL');
              setSelectedSLA('ALL');
              setCurrentPage(1);
            }}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              selectedCategory === 'ALL' && selectedStatus === 'ALL' && selectedDistrict === 'ALL' && selectedSLA === 'ALL'
                ? 'bg-[#172554] text-white font-bold'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            সকল ({cases.length})
          </button>
          <button
            onClick={() => {
              setSelectedStatus('PENDING_LAWYER_ASSIGNMENT');
              setCurrentPage(1);
            }}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              selectedStatus === 'PENDING_LAWYER_ASSIGNMENT'
                ? 'bg-amber-800 text-white font-bold'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            আইনজীবী অপেক্ষমাণ ({cases.filter(c => c.status === 'PENDING_LAWYER_ASSIGNMENT').length})
          </button>
          <button
            onClick={() => {
              setSelectedSLA('BREACHED');
              setCurrentPage(1);
            }}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              selectedSLA === 'BREACHED'
                ? 'bg-red-800 text-white font-bold'
                : 'bg-red-50 text-red-900 border border-red-200 hover:bg-red-100'
            }`}
          >
            এসএলএ বিলম্বিত ({cases.filter(c => c.slaStatus === 'BREACHED').length})
          </button>
          <button
            onClick={() => {
              setSelectedCategory('WOMEN_CHILD');
              setCurrentPage(1);
            }}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              selectedCategory === 'WOMEN_CHILD'
                ? 'bg-purple-800 text-white font-bold'
                : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            নারী ও শিশু ({cases.filter(c => c.category === 'WOMEN_CHILD').length})
          </button>
          <button
            onClick={() => {
              setSelectedCategory('LAND_PROPERTY');
              setCurrentPage(1);
            }}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              selectedCategory === 'LAND_PROPERTY'
                ? 'bg-emerald-800 text-white font-bold'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            জমি ও সম্পত্তি ({cases.filter(c => c.category === 'LAND_PROPERTY').length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="মামলা নং, আবেদনকারী, আইনজীবী, জেলা..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-900 focus:outline-none"
            />
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-2 border border-gray-300 rounded text-xs bg-white focus:outline-none"
            >
              <option value="ALL">সকল জেলা (৬টি পাইলট)</option>
              <option value="ঢাকা">ঢাকা (১৫০)</option>
              <option value="গাজীপুর">গাজীপুর (৮০)</option>
              <option value="নারায়ণগঞ্জ">নারায়ণগঞ্জ (৭৫)</option>
              <option value="চট্টগ্রাম">চট্টগ্রাম (৭৫)</option>
              <option value="কুমিল্লা">কুমিল্লা (৬৫)</option>
              <option value="টাঙ্গাইল">টাঙ্গাইল (৫৫)</option>
            </select>
          </div>

          {/* Case Type Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-2 border border-gray-300 rounded text-xs bg-white focus:outline-none"
            >
              <option value="ALL">সকল মামলার ধরন</option>
              <option value="FAMILY">পারিবারিক</option>
              <option value="WOMEN_CHILD">নারী ও শিশু</option>
              <option value="CRIMINAL">ফৌজদারি</option>
              <option value="CIVIL">দেওয়ানি</option>
              <option value="LAND_PROPERTY">জমি ও সম্পত্তি</option>
              <option value="LABOUR">শ্রম</option>
              <option value="OTHER">অন্যান্য / সাইবার</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-2 border border-gray-300 rounded text-xs bg-white focus:outline-none"
            >
              <option value="ALL">সকল মামলার অবস্থা</option>
              <option value="PENDING_LAWYER_ASSIGNMENT">আইনজীবী নিয়োগ অপেক্ষমাণ</option>
              <option value="LAWYER_ASSIGNED">আইনজীবী নিয়োগ সম্পন্ন</option>
              <option value="IN_PROGRESS">চলমান</option>
              <option value="HEARING_ONGOING">শুনানি চলমান</option>
              <option value="MEDIATION_ONGOING">মধ্যস্থতা চলমান</option>
              <option value="DISPOSED">নিষ্পত্তি হয়েছে</option>
            </select>
          </div>

          {/* SLA Filter */}
          <div>
            <select
              value={selectedSLA}
              onChange={(e) => {
                setSelectedSLA(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-2 border border-gray-300 rounded text-xs bg-white focus:outline-none"
            >
              <option value="ALL">সকল এসএলএ অবস্থা</option>
              <option value="NORMAL">স্বাভাবিক (সময়সীমার মধ্যে)</option>
              <option value="APPROACHING_RISK">ঝুঁকিপূর্ণ (৩ দিন বা কম)</option>
              <option value="BREACHED">সময়সীমা অতিক্রান্ত (বিলম্বিত)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Administrative Table (Section 8) */}
      <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 border-b border-gray-300 font-bold">
                <th className="py-2.5 px-3 whitespace-nowrap">মামলা নম্বর</th>
                <th className="py-2.5 px-3 whitespace-nowrap">আবেদনকারীর নাম</th>
                <th className="py-2.5 px-3 whitespace-nowrap">মামলার ধরন</th>
                <th className="py-2.5 px-3 whitespace-nowrap">উপজেলা / জেলা</th>
                <th className="py-2.5 px-3 whitespace-nowrap">অগ্রাধিকার</th>
                <th className="py-2.5 px-3 whitespace-nowrap">দায়িত্বপ্রাপ্ত আইনজীবী</th>
                <th className="py-2.5 px-3 whitespace-nowrap">বর্তমান অবস্থা</th>
                <th className="py-2.5 px-3 whitespace-nowrap">পরবর্তী তারিখ</th>
                <th className="py-2.5 px-3 whitespace-nowrap">সময়সীমা</th>
                <th className="py-2.5 px-3 whitespace-nowrap text-right">কার্যক্রম</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-500 text-xs">
                    কোনো মামলা খুঁজে পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                paginatedCases.map((c) => {
                  const accessCheck = checkObjectAccess(c);
                  const nearestDeadline = c.deadlines[0];

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        c.id === 'case-1284' ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                        <div className="text-[#172554] font-bold">{c.caseNumber}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[120px]">
                          {c.courtName}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-800">
                        <div className="font-semibold">{c.applicant.name}</div>
                        <div className="text-[10px] text-gray-400">NID: {c.applicant.nidMasked}</div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-[11px]">
                          {getCategoryName(c.category)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                        {c.upazila}, {c.district}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getPriorityBadge(c.priorityAssessment.calculatedPriority)}
                      </td>
                      <td className="py-2.5 px-3 text-gray-800 whitespace-nowrap">
                        {c.assignedLawyerName ? (
                          <div>
                            <div className="font-medium">{c.assignedLawyerName}</div>
                            <div className="text-[10px] text-gray-500">{c.assignedLawyerBarNo}</div>
                          </div>
                        ) : (
                          <span className="text-amber-800 text-[11px] italic font-semibold">
                            নিয়োগ অপেক্ষমাণ
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                        {c.hearings && c.hearings.length > 0 ? (
                          <div>
                            <div>{c.hearings[0].date}</div>
                            <div className="text-[10px] text-gray-500">{c.hearings[0].purpose}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">নির্ধারিত নয়</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {nearestDeadline ? (
                          <div>
                            <span
                              className={`font-bold ${
                                nearestDeadline.status === 'OVERDUE'
                                  ? 'text-red-700'
                                  : nearestDeadline.daysRemaining <= 2
                                  ? 'text-amber-700'
                                  : 'text-gray-700'
                              }`}
                            >
                              {nearestDeadline.dueDate}
                            </span>
                            <div className="text-[10px] text-gray-500 truncate max-w-[130px]">
                              {nearestDeadline.title}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedCaseId(c.id);
                            setActiveView('case-detail');
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                            accessCheck.allowed
                              ? 'bg-[#172554] text-white hover:bg-blue-900'
                              : 'bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-900'
                          }`}
                          title={accessCheck.allowed ? 'মামলার বিস্তারিত' : accessCheck.reason}
                        >
                          {accessCheck.allowed ? 'নথি দেখুন' : 'অনুমতি নেই'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-600">
          <div className="flex items-center space-x-3">
            <span>
              পৃষ্ঠা {currentPage} এর {totalPages} (মোট {filteredCases.length} রেকর্ড)
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-gray-500">প্রতি পৃষ্ঠায়:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded bg-white px-1.5 py-0.5 text-xs"
              >
                <option value={10}>১০</option>
                <option value={12}>১২</option>
                <option value={25}>২৫</option>
                <option value={50}>৫০</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
            >
              পূর্ববর্তী
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-2.5 py-1 border border-gray-300 rounded bg-white hover:bg-gray-100 disabled:opacity-40 cursor-pointer"
            >
              পরবর্তী
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
