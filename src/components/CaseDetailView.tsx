/**
 * মামলার বিস্তারিত ও বিচারিক ব্যবস্থাপনা (Government Case Detail View)
 * Implements Section 7, 9, 10, 12, 13, 14, 17, 41
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  UserCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Download,
  Upload,
  History,
  Lock,
  Scale,
  Users,
  Info,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';
import { PriorityLevel, CaseStatus, CaseDocument } from '../types/legalAid';

export const CaseDetailView: React.FC = () => {
  const {
    cases,
    lawyers,
    selectedCaseId,
    setSelectedCaseId,
    setActiveView,
    currentUser,
    checkObjectAccess,
    assignLawyerToCase,
    overrideCasePriority,
    updateCaseStatus,
    addDocumentToCase,
    simulateDownloadDocument,
  } = useLegalAid();

  const [activeTab, setActiveTab] = useState<string>('lawyer-assignment'); // Default directly to assignment or summary for testing
  const [overridePriorityInput, setOverridePriorityInput] = useState<PriorityLevel>('VERY_HIGH');
  const [overrideReasonInput, setOverrideReasonInput] = useState('');
  const [showOverrideForm, setShowOverrideForm] = useState(false);

  // Lawyer Assignment State
  const [selectedLawyerId, setSelectedLawyerId] = useState<string>('');
  const [assignmentOverrideReason, setAssignmentOverrideReason] = useState<string>('');
  const [assignmentAlertMessage, setAssignmentAlertMessage] = useState<{
    type: 'SUCCESS' | 'ERROR' | 'WARNING';
    text: string;
  } | null>(null);

  // Document Upload Mock State
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<CaseDocument['category']>('COURT_ORDER');
  const [docFileName, setDocFileName] = useState('');
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);

  // Status Change State
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [targetStatus, setTargetStatus] = useState<CaseStatus>('HEARING_ONGOING');
  const [showStatusModal, setShowStatusModal] = useState(false);

  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const accessCheck = checkObjectAccess(currentCase);

  if (!accessCheck.allowed) {
    return (
      <div className="bg-white border border-red-300 p-6 rounded-sm text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-red-950">
          এই মামলাটি দেখার অনুমতি আপনার নেই
        </h3>
        <p className="text-xs text-red-700 max-w-md mx-auto">
          {accessCheck.reason ||
            'অবজেক্ট-লেভেল অ্যাক্সেস কন্ট্রোল (BOLA/IDOR) নীতি অনুযায়ী আপনার দায়িত্ববহির্ভূত মামলায় প্রবেশ নিষিদ্ধ।'}
        </p>
        <div className="text-[11px] text-gray-500">
          প্রয়াসটি নিরাপত্তা অডিট লগবুকে তাৎক্ষণিকভাবে লিপিবদ্ধ করা হয়েছে।
        </div>
        <button
          onClick={() => setActiveView('cases')}
          className="px-3 py-1.5 bg-[#172554] text-white rounded text-xs font-semibold cursor-pointer"
        >
          মামলার তালিকায় ফিরে যান
        </button>
      </div>
    );
  }

  // Recommendation engine logic (Section 12)
  const evaluatedLawyers = lawyers.map((lawyer) => {
    let score = 50;
    const reasons: string[] = [];

    // 1. Specialization match
    const hasSpec = lawyer.specialisations.includes(currentCase.category);
    if (hasSpec) {
      score += 30;
      reasons.push(
        `${
          currentCase.category === 'FAMILY'
            ? 'পারিবারিক আইনে'
            : currentCase.category === 'CRIMINAL'
            ? 'ফৌজদারি আইনে'
            : 'সংশ্লিষ্ট শাখায়'
        } বিশেষায়িত`
      );
    } else {
      reasons.push('অন্য শাখায় অভিজ্ঞ');
    }

    // 2. Workload check
    const isOverloaded = lawyer.currentActiveCases >= lawyer.maxCaseLimit;
    if (isOverloaded) {
      score -= 35;
      reasons.push(`বর্তমানে ${lawyer.currentActiveCases}টি মামলা (নির্ধারিত সীমা ${lawyer.maxCaseLimit} অতিক্রান্ত)`);
    } else {
      score += 15;
      reasons.push(`বর্তমানে ${lawyer.currentActiveCases}টি মামলা (কাজের চাপ সহনশীল)`);
    }

    // 3. District suitability
    if (lawyer.district === currentCase.district) {
      score += 10;
      reasons.push(`${currentCase.district} জেলার জন্য অনুমোদিত`);
    }

    // 4. Availability
    if (lawyer.availability === 'AVAILABLE') {
      reasons.push('আগামী ৭ দিনের মধ্যে প্রাপ্য');
    } else {
      score -= 10;
      reasons.push('অন্যান্য শুনানিতে ব্যস্ত');
    }

    // 5. Conflict of Interest Check (Section 13)
    const opposingName = currentCase.applicant.opposingPartyName;
    const conflictDetected = lawyer.knownConflicts.some(
      (c) =>
        c.toLowerCase().includes(opposingName.toLowerCase()) ||
        opposingName.toLowerCase().includes(c.toLowerCase())
    );

    if (conflictDetected) {
      score = 0;
      reasons.push(
        `সম্ভাব্য স্বার্থের সংঘাত: পূর্বে প্রতিপক্ষ '${opposingName}'-এর পক্ষে কার্যক্রমে ছিলেন`
      );
    } else {
      reasons.push('স্বার্থের সংঘাত পাওয়া যায়নি');
    }

    return {
      lawyer,
      score,
      reasons,
      conflictDetected,
      isOverloaded,
    };
  });

  // Sort: conflict free and highest score first
  evaluatedLawyers.sort((a, b) => b.score - a.score);

  const handleAssignSubmit = (lawyerId: string) => {
    const res = assignLawyerToCase(currentCase.id, lawyerId, assignmentOverrideReason);
    if (res.success) {
      setAssignmentAlertMessage({ type: 'SUCCESS', text: res.message });
      setAssignmentOverrideReason('');
    } else {
      setAssignmentAlertMessage({ type: 'ERROR', text: res.message });
    }
  };

  const handlePriorityOverrideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReasonInput.trim()) {
      alert('কর্মকর্তার লিখিত কারণ প্রদান বাধ্যতামূলক।');
      return;
    }
    overrideCasePriority(currentCase.id, overridePriorityInput, overrideReasonInput);
    setShowOverrideForm(false);
    setOverrideReasonInput('');
  };

  const handleDocUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docFileName) {
      alert('নথির শিরোনাম ও ফাইলের নাম পূরণ করুন।');
      return;
    }
    addDocumentToCase(currentCase.id, {
      title: docTitle,
      category: docCategory,
      fileName: docFileName,
      fileSizeBytes: 245000,
      mimeType: 'application/pdf',
    });
    setShowDocUploadModal(false);
    setDocTitle('');
    setDocFileName('');
  };

  return (
    <div className="space-y-3.5">
      {/* Case Header Banner */}
      <div className="bg-white border border-gray-300 p-4 rounded-sm shadow-2xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveView('cases')}
              className="p-1.5 border border-gray-300 hover:bg-gray-100 rounded text-gray-700 cursor-pointer"
              title="মামলা তালিকায় ফিরুন"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  আইনগত সহায়তা নথি নং:
                </span>
                <h2 className="text-lg font-bold text-[#172554]">
                  {currentCase.caseNumber}
                </h2>
                {currentCase.id === 'case-1284' && (
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    মূল্যায়ক মহড়া মামলা
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                আদালত: {currentCase.courtName} | উপজেলা: {currentCase.upazila}, জেলা: {currentCase.district}
              </div>
            </div>
          </div>

          {/* Status & Priority Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded font-bold border ${
                currentCase.priorityAssessment.calculatedPriority === 'VERY_HIGH'
                  ? 'bg-red-100 text-red-900 border-red-300'
                  : currentCase.priorityAssessment.calculatedPriority === 'HIGH'
                  ? 'bg-orange-100 text-orange-900 border-orange-300'
                  : 'bg-blue-100 text-blue-900 border-blue-300'
              }`}
            >
              অগ্রাধিকার: {currentCase.priorityAssessment.calculatedPriority === 'VERY_HIGH' ? 'অতি উচ্চ' : 'উচ্চ'}
            </span>

            <span className="text-xs px-2.5 py-1 rounded font-semibold bg-blue-50 text-blue-950 border border-blue-200">
              অবস্থা:{' '}
              {currentCase.status === 'PENDING_LAWYER_ASSIGNMENT'
                ? 'আইনজীবী নিয়োগ অপেক্ষমাণ'
                : currentCase.status === 'LAWYER_ASSIGNED'
                ? 'আইনজীবী নিয়োগ সম্পন্ন'
                : currentCase.status === 'IN_PROGRESS'
                ? 'চলমান'
                : currentCase.status}
            </span>

            <button
              onClick={() => setShowStatusModal(true)}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs font-semibold text-gray-800 cursor-pointer"
            >
              অবস্থা পরিবর্তন
            </button>
          </div>
        </div>

        {/* Compact Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
          <div>
            <span className="text-gray-500 block text-[11px]">আবেদনের তারিখ:</span>
            <span className="font-semibold text-gray-800">{currentCase.applicationDate}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">দায়িত্বপ্রাপ্ত কর্মকর্তা:</span>
            <span className="font-semibold text-gray-800">{currentCase.assignedOfficerName}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">দায়িত্বপ্রাপ্ত আইনজীবী:</span>
            <span className="font-semibold text-gray-800">
              {currentCase.assignedLawyerName ? (
                `${currentCase.assignedLawyerName} (${currentCase.assignedLawyerBarNo || ''})`
              ) : (
                <span className="text-amber-800 font-bold">অনিয়োগকৃত</span>
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-[11px]">পরবর্তী কার্যক্রম / শুনানি:</span>
            <span className="font-semibold text-gray-800">
              {currentCase.hearings && currentCase.hearings.length > 0
                ? currentCase.hearings[0].date
                : 'তারিখ নির্ধারিত নয়'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Section 9) */}
      <div className="bg-white border border-gray-300 rounded-sm">
        <div className="flex border-b border-gray-200 overflow-x-auto text-xs font-semibold bg-gray-50">
          {[
            { id: 'lawyer-assignment', label: 'আইনজীবী নিয়োগ (LADCS ইঞ্জিন)' },
            { id: 'priority-scoring', label: 'অগ্রাধিকার নির্ধারণ সহায়ক' },
            { id: 'timeline', label: 'কার্যক্রম ও সময়রেখা (টাইমলাইন)' },
            { id: 'applicant', label: 'আবেদনকারী ও সুরক্ষা' },
            { id: 'details', label: 'মামলার বিবরণ ও আরজি' },
            { id: 'hearings', label: 'শুনানি ও মধ্যস্থতা' },
            { id: 'documents', label: `নথিপত্র (${currentCase.documents.length})` },
            { id: 'audit-trail', label: 'কার্যক্রমের রেকর্ড (অডিট)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 whitespace-nowrap border-b-2 font-medium cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? 'border-[#172554] text-[#172554] bg-white font-bold'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: আইনজীবী নিয়োগ (Section 12, 13, 14 - Heart of Hackathon Demo) */}
        {activeTab === 'lawyer-assignment' && (
          <div className="p-4 space-y-4">
            {/* Context & Status Box */}
            <div className="bg-blue-50/70 border border-blue-200 p-3 rounded text-xs text-blue-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="font-bold">আইনজীবী নির্বাচন নির্দেশিকা (NALSA / LADCS মডেল):</span>
                <p className="text-[11px] text-blue-900 mt-0.5">
                  মামলার ধরন ({currentCase.category === 'FAMILY' ? 'পারিবারিক' : currentCase.category}),
                  আইনজীবীর বর্তমান কাজের চাপ, ভৌগোলিক অবস্থান, এবং স্বার্থের সংঘাত যাচাই করে স্বয়ংক্রিয় প্রস্তাব উপস্থাপন করা হয়েছে।
                </p>
              </div>
              <div className="bg-white px-2.5 py-1 border border-blue-300 rounded font-semibold shrink-0 text-blue-900">
                চূড়ান্ত নিয়োগ কর্মকর্তার অনুমোদনসাপেক্ষ
              </div>
            </div>

            {assignmentAlertMessage && (
              <div
                className={`p-3 rounded text-xs border flex items-center justify-between ${
                  assignmentAlertMessage.type === 'SUCCESS'
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                    : 'bg-red-50 text-red-950 border-red-300'
                }`}
              >
                <span>{assignmentAlertMessage.text}</span>
                <button
                  onClick={() => setAssignmentAlertMessage(null)}
                  className="font-bold text-gray-500 hover:text-gray-800 ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Current Assignment Status */}
            {currentCase.assignedLawyerName && (
              <div className="bg-emerald-50/70 border border-emerald-300 p-3 rounded text-xs text-emerald-950 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <div>
                    <span className="font-bold">বর্তমানে নিয়োগপ্রাপ্ত আইনজীবী: </span>
                    <span className="font-semibold text-gray-900">
                      {currentCase.assignedLawyerName} ({currentCase.assignedLawyerBarNo})
                    </span>
                    <span className="text-gray-600 block text-[11px]">
                      নিয়োগের তারিখ: {currentCase.assignedDate || '১১ সেপ্টেম্বর ২০২৬'}
                    </span>
                  </div>
                </div>
                <span className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-bold px-2 py-0.5 rounded">
                  অনুমোদিত
                </span>
              </div>
            )}

            {/* Ranked Lawyers Recommendation List */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 text-xs flex items-center justify-between">
                <span>প্রস্তাবিত প্যানেল আইনজীবী তালিকা:</span>
                <span className="text-gray-500 text-[11px]">উপযুক্ততার ক্রমানুসারে সর্টকৃত</span>
              </h4>

              <div className="space-y-2.5">
                {evaluatedLawyers.map(({ lawyer, reasons, conflictDetected, isOverloaded }, index) => {
                  const isCurrentCaseLawyer = currentCase.assignedLawyerId === lawyer.id;

                  return (
                    <div
                      key={lawyer.id}
                      className={`border p-3.5 rounded text-xs transition-colors ${
                        conflictDetected
                          ? 'border-red-300 bg-red-50/40'
                          : isOverloaded
                          ? 'border-amber-300 bg-amber-50/30'
                          : index === 0
                          ? 'border-blue-300 bg-blue-50/30'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 text-sm">
                              {index + 1}. {lawyer.name}
                            </span>
                            <span className="text-gray-500">|</span>
                            <span className="text-gray-600 font-medium">{lawyer.barRegNo}</span>

                            {conflictDetected && (
                              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1">
                                <ShieldAlert className="w-3 h-3" />
                                <span>সম্ভাব্য স্বার্থের সংঘাত শনাক্ত হয়েছে</span>
                              </span>
                            )}

                            {isOverloaded && !conflictDetected && (
                              <span className="bg-amber-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                অতিরিক্ত কাজের চাপ
                              </span>
                            )}

                            {index === 0 && !conflictDetected && !isOverloaded && (
                              <span className="bg-[#172554] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                ব্যবস্থার প্রথম সুপারিশ
                              </span>
                            )}

                            {isCurrentCaseLawyer && (
                              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                বর্তমানে দায়িত্বপ্রাপ্ত
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-gray-600 mt-1">
                            অভিজ্ঞতা: {lawyer.experienceYears} বছর | সক্রিয় মামলা: {lawyer.currentActiveCases}/{lawyer.maxCaseLimit}টি | নিষ্পত্তির হার: {lawyer.successRatePercentage}% | এক্তিয়ার: {lawyer.district}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 shrink-0">
                          {conflictDetected ? (
                            <div className="text-right">
                              <span className="text-red-700 text-[11px] font-bold block">
                                সরাসরি নিয়োগ নিষিদ্ধ
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedLawyerId(lawyer.id);
                                  setAssignmentOverrideReason(
                                    'প্রতিপক্ষের সাথে স্বার্থের সংঘাত খতিয়ে দেখা হয়েছে এবং বিশেষ নির্দেশে অনুমোদন দেওয়া হচ্ছে।'
                                  );
                                }}
                                className="text-[11px] text-red-900 hover:underline font-semibold"
                              >
                                বিশেষ লিখিত কারণসহ পর্যালোচনা
                              </button>
                            </div>
                          ) : (
                            <button
                              disabled={isCurrentCaseLawyer}
                              onClick={() => handleAssignSubmit(lawyer.id)}
                              className={`px-3 py-1.5 rounded font-bold text-xs cursor-pointer transition-colors ${
                                isCurrentCaseLawyer
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : index === 0
                                  ? 'bg-[#172554] text-white hover:bg-blue-900'
                                  : 'bg-gray-800 text-white hover:bg-gray-900'
                              }`}
                            >
                              {isCurrentCaseLawyer ? 'নিয়োগকৃত' : 'নিয়োগ অনুমোদন করুন'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Suitability Reasons Bullet List */}
                      <div className="mt-2.5 pt-2 border-t border-gray-200 text-[11px]">
                        <span className="font-semibold text-gray-700">উপযুক্ততার কারণসমূহ:</span>
                        <ul className="mt-1 space-y-0.5 text-gray-600 list-disc list-inside">
                          {reasons.map((r, i) => (
                            <li
                              key={i}
                              className={
                                r.includes('সংঘাত')
                                  ? 'text-red-700 font-bold'
                                  : r.includes('অতিক্রান্ত')
                                  ? 'text-amber-800 font-semibold'
                                  : 'text-gray-700'
                              }
                            >
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Explicit Override Input for Conflicted Lawyer */}
                      {selectedLawyerId === lawyer.id && conflictDetected && (
                        <div className="mt-3 p-3 bg-red-100/70 border border-red-300 rounded text-xs">
                          <div className="font-bold text-red-900 mb-1">
                            প্রশাসনিক স্বার্থের সংঘাত ব্যত্যয় অনুমোদন (Officer Override Form):
                          </div>
                          <p className="text-[11px] text-red-800 mb-2">
                            সতর্কতা: এই আইনজীবী পূর্বে প্রতিপক্ষের প্রতিনিধিত্ব করেছিলেন। বিধিমোতাবেক নিয়োগ করতে হলে কর্মকর্তার নামসহ গ্রহণযোগ্য আইনি যুক্তি বাধ্যতামূলকভাবে অডিট ট্রেইলে সংরক্ষণ করতে হবে।
                          </p>
                          <textarea
                            value={assignmentOverrideReason}
                            onChange={(e) => setAssignmentOverrideReason(e.target.value)}
                            rows={2}
                            placeholder="কর্মকর্তার সুস্পষ্ট কারণ ও আইনগত বৈধতার ব্যাখ্যা লিপিবদ্ধ করুন..."
                            className="w-full p-2 border border-red-300 rounded bg-white text-xs text-gray-900 mb-2"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setSelectedLawyerId('')}
                              className="px-2.5 py-1 border border-gray-300 bg-white rounded text-xs cursor-pointer"
                            >
                              বাতিল
                            </button>
                            <button
                              onClick={() => handleAssignSubmit(lawyer.id)}
                              className="px-3 py-1 bg-red-800 text-white hover:bg-red-900 rounded text-xs font-bold cursor-pointer"
                            >
                              ব্যত্যয় অনুমোদন নিশ্চিত করুন
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: অগ্রাধিকার নির্ধারণ সহায়ক (Section 7) */}
        {activeTab === 'priority-scoring' && (
          <div className="p-4 space-y-4 text-xs">
            <div className="border border-gray-300 p-3.5 rounded bg-gray-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    অগ্রাধিকার নির্ধারণ সহায়ক (নিয়মভিত্তিক স্বচ্ছ মূল্যায়ন)
                  </h4>
                  <p className="text-gray-600 text-[11px] mt-0.5">
                    আইনগত সময়সীমা, আবেদনকারীর দুর্বলতা এবং মামলার দীর্ঘসূত্রতার ওপর ভিত্তি করে স্কোর নির্ধারিত হয়েছে।
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-950">
                    {currentCase.priorityAssessment.score}/১০০
                  </div>
                  <span className="text-[10px] text-gray-500">স্বচ্ছ মূল্যায়ন স্কোর</span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentCase.priorityAssessment.factors.map((factor, idx) => (
                  <div key={idx} className="p-2.5 bg-white border border-gray-200 rounded">
                    <div className="font-bold text-gray-800 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 bg-blue-900 rounded-full inline-block"></span>
                      <span>{factor.title}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                      {factor.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Officer Override Info / Action */}
            {currentCase.priorityAssessment.officerOverride ? (
              <div className="bg-amber-50 border border-amber-300 p-3.5 rounded">
                <div className="font-bold text-amber-950 flex items-center justify-between">
                  <span>কর্মকর্তার সিদ্ধান্ত দ্বারা সংশোধিত অগ্রাধিকার:</span>
                  <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[11px]">
                    সংশোধিত: {currentCase.priorityAssessment.officerOverride.overriddenPriority}
                  </span>
                </div>
                <p className="text-gray-700 text-xs mt-1">
                  কারণ: {currentCase.priorityAssessment.officerOverride.reason}
                </p>
                <div className="text-[10px] text-gray-500 mt-1">
                  সংশোধনকারী: {currentCase.priorityAssessment.officerOverride.officerName} (
                  {currentCase.priorityAssessment.officerOverride.officerRole}) | সময়:{' '}
                  {currentCase.priorityAssessment.officerOverride.timestamp}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 p-3 rounded text-center">
                <p className="text-gray-600 mb-2">
                  কর্মকর্তা চাইলে যৌক্তিক কারণে প্রস্তাবিত অগ্রাধিকার পরিবর্তন (Override) করতে পারেন।
                </p>
                <button
                  onClick={() => setShowOverrideForm(!showOverrideForm)}
                  className="px-3 py-1.5 bg-gray-800 text-white rounded text-xs font-semibold hover:bg-gray-900 cursor-pointer"
                >
                  অগ্রাধিকার পুনর্নির্ধারণ করুন
                </button>
              </div>
            )}

            {showOverrideForm && (
              <form
                onSubmit={handlePriorityOverrideSubmit}
                className="border border-gray-300 bg-white p-3.5 rounded space-y-3"
              >
                <div className="font-bold text-gray-900">
                  কর্মকর্তার সিদ্ধান্ত ও কারণ নথিভুক্তি:
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">নতুন অগ্রাধিকার:</label>
                  <select
                    value={overridePriorityInput}
                    onChange={(e) => setOverridePriorityInput(e.target.value as PriorityLevel)}
                    className="w-full border border-gray-300 rounded p-1.5 text-xs bg-white"
                  >
                    <option value="VERY_HIGH">অতি উচ্চ</option>
                    <option value="HIGH">উচ্চ</option>
                    <option value="MEDIUM">মধ্যম</option>
                    <option value="LOW">সাধারণ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    পরিবর্তনের সুনির্দিষ্ট কারণ (অডিট ট্রেইলে সংরক্ষিত হবে):
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={overrideReasonInput}
                    onChange={(e) => setOverrideReasonInput(e.target.value)}
                    placeholder="আদালতের জরুরি সমন জারি অথবা বিশেষ আইনি জটিলতার বিবরণ..."
                    className="w-full border border-gray-300 rounded p-2 text-xs"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowOverrideForm(false)}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-[#172554] text-white rounded font-semibold hover:bg-blue-900 cursor-pointer"
                  >
                    সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: কার্যক্রম ও সময়রেখা (Section 10 - Immutable Timeline) */}
        {activeTab === 'timeline' && (
          <div className="p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">
                  মামলার ধারাবাহিক ও অপরিবর্তনীয় সময়রেখা (Timeline)
                </h4>
                <p className="text-gray-500 text-[11px]">
                  প্রতিটি বিচারিক ও প্রশাসনিক কার্যক্রম স্বয়ংক্রিয়ভাবে টাইমলাইনে নথিভুক্ত হয়।
                </p>
              </div>
              <span className="text-emerald-800 text-[11px] font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                ডিজিটাল রেকর্ড অপরিবর্তনীয়
              </span>
            </div>

            <div className="relative pl-6 border-l-2 border-blue-900 space-y-4 my-2">
              {currentCase.timeline.map((event) => (
                <div key={event.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-[#172554] border-2 border-white"></div>
                  <div className="bg-gray-50 border border-gray-200 p-2.5 rounded">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-900 text-xs">{event.action}</span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {event.date} | {event.time}
                      </span>
                    </div>
                    <p className="text-gray-700 text-[11px] mt-1">{event.description}</p>
                    <div className="text-[10px] text-gray-500 mt-1 flex items-center space-x-1">
                      <span>দায়িত্বপ্রাপ্ত: {event.user}</span>
                      <span>({event.role})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: আবেদনকারী ও সুরক্ষা (Privacy by Design - Section 26) */}
        {activeTab === 'applicant' && (
          <div className="p-4 space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-[11px] text-amber-950 flex items-center justify-between">
              <span>
                গোপনীয়তা ও তথ্য সুরক্ষা নীতি (Privacy by Design): জাতীয় পরিচয়পত্র ও ব্যক্তিগত ফোন নম্বর সুরক্ষিতভাবে মাস্ক করা হয়েছে।
              </span>
              <Lock className="w-4 h-4 text-amber-800 shrink-0" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-3.5 rounded space-y-2 bg-white">
                <h5 className="font-bold text-gray-900 border-b pb-1">আবেদনকারীর বিবরণ</h5>
                <div>
                  <span className="text-gray-500 block text-[11px]">নাম:</span>
                  <span className="font-bold text-gray-800">{currentCase.applicant.name}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">মাস্কড জাতীয় পরিচয়পত্র (NID):</span>
                  <span className="font-mono font-semibold text-gray-800">
                    {currentCase.applicant.nidMasked}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">যোগাযোগের নম্বর:</span>
                  <span className="font-mono font-semibold text-gray-800">
                    {currentCase.applicant.phoneMasked}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">লিঙ্গ ও বয়স:</span>
                  <span>{currentCase.applicant.gender}, {currentCase.applicant.age} বছর</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">পেশা ও মাসিক আয়:</span>
                  <span>{currentCase.applicant.occupation} (মাসিক আয়: ৳{currentCase.applicant.monthlyIncome})</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">ঠিকানা:</span>
                  <span>
                    {currentCase.applicant.villageWard}, {currentCase.applicant.upazila},{' '}
                    {currentCase.applicant.district}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">বিশেষ যোগ্যতা শ্রেণিবিন্যাস:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentCase.applicant.specialEligibility.map((tag, i) => (
                      <span key={i} className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[10px] font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 p-3.5 rounded space-y-2 bg-white">
                <h5 className="font-bold text-gray-900 border-b pb-1">প্রতিপক্ষ পক্ষের তথ্য</h5>
                <div>
                  <span className="text-gray-500 block text-[11px]">প্রতিপক্ষের নাম:</span>
                  <span className="font-bold text-red-950">
                    {currentCase.applicant.opposingPartyName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px]">প্রতিপক্ষের ঠিকানা:</span>
                  <span>{currentCase.applicant.opposingPartyAddress}</span>
                </div>
                <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-[11px] text-gray-600 mt-2">
                  প্যানেল আইনজীবীদের সাথে স্বার্থের সংঘাত (Conflict of Interest) খতিয়ে দেখার জন্য প্রতিপক্ষের নাম ডাটাবেজে সংরক্ষিত হয়।
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: মামলার বিবরণ ও আরজি */}
        {activeTab === 'details' && (
          <div className="p-4 space-y-3.5 text-xs">
            <div className="border border-gray-200 p-3.5 rounded space-y-2 bg-white">
              <h5 className="font-bold text-gray-900 border-b pb-1">মামলার মূল সারসংক্ষেপ</h5>
              <p className="text-gray-800 leading-relaxed">{currentCase.summary}</p>
            </div>

            <div className="border border-gray-200 p-3.5 rounded space-y-2 bg-white">
              <h5 className="font-bold text-gray-900 border-b pb-1">প্রার্থিত প্রতিকার (Relief Sought)</h5>
              <p className="text-gray-800 leading-relaxed">{currentCase.reliefSought}</p>
            </div>

            <div className="border border-gray-200 p-3.5 rounded space-y-2 bg-white">
              <h5 className="font-bold text-gray-900 border-b pb-1">আইনগত প্রশ্নাবলি ও প্রযোজ্য ধারা</h5>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {currentCase.legalIssues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 6: শুনানি ও মধ্যস্থতা */}
        {activeTab === 'hearings' && (
          <div className="p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-bold text-gray-900 text-sm">শুনানি ও বিকল্প বিরোধ নিষ্পত্তি (ADR)</h4>
              <span className="text-gray-500 text-[11px]">আদালত ও লিগ্যাল এইড অফিসের যৌথ রেকর্ড</span>
            </div>

            {currentCase.hearings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                এখনো কোনো শুনানির তারিখ নির্ধারিত হয়নি।
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentCase.hearings.map((h) => (
                  <div key={h.id} className="border border-gray-200 p-3 rounded bg-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-gray-900">{h.courtName}</span>
                        <div className="text-[11px] text-gray-500">{h.benchCourtNumber}</div>
                      </div>
                      <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded text-[11px] font-bold">
                        {h.status}
                      </span>
                    </div>
                    <div className="mt-2 text-gray-700">
                      তারিখ: <span className="font-semibold">{h.date}</span> ({h.time}) | উদ্দেশ্য: {h.purpose}
                    </div>
                    {h.courtOutcomeSummary && (
                      <div className="mt-1.5 p-2 bg-gray-50 border rounded text-[11px] text-gray-600">
                        ফলাফল/আদেশ: {h.courtOutcomeSummary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: নথিপত্র (Section 17 - Secure Document Management) */}
        {activeTab === 'documents' && (
          <div className="p-4 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">নিরাপদ বিচারিক নথি ব্যবস্থাপনা</h4>
                <p className="text-[11px] text-gray-500">
                  সকল নথি হ্যাশযুক্ত (SHA-256), নিরাপদ ক্লাউড এনক্রিপ্টেড এবং প্রবেশাধিকার অডিটযোগ্য।
                </p>
              </div>
              <button
                onClick={() => setShowDocUploadModal(true)}
                className="px-3 py-1.5 bg-[#172554] text-white rounded font-semibold text-xs flex items-center space-x-1.5 cursor-pointer hover:bg-blue-900"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>নতুন নথি সংযোজন</span>
              </button>
            </div>

            <div className="divide-y divide-gray-200 border border-gray-200 rounded">
              {currentCase.documents.map((doc) => (
                <div key={doc.id} className="p-3 bg-white flex justify-between items-center hover:bg-gray-50">
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-900 flex items-center space-x-2">
                      <span>{doc.title}</span>
                      <span className="bg-gray-100 border text-gray-700 text-[10px] px-1.5 py-0.2 rounded font-normal">
                        {doc.category === 'APPLICATION'
                          ? 'আবেদন'
                          : doc.category === 'IDENTITY'
                          ? 'পরিচয়'
                          : doc.category === 'CASE_RECORD'
                          ? 'মামলার নথি'
                          : 'আদালতের আদেশ'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 font-mono">
                      ফাইল: {doc.fileName} ({(doc.fileSizeBytes / 1024).toFixed(1)} KB) | আপলোডকারী: {doc.uploadedBy}
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      সুরক্ষা হ্যাশ: {doc.securityHash}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const res = simulateDownloadDocument(currentCase.id, doc.id);
                      alert(res.message);
                    }}
                    className="px-2.5 py-1.5 border border-gray-300 hover:bg-gray-100 rounded text-xs text-gray-800 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ডাউনলোড</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: অডিট ট্রেইল */}
        {activeTab === 'audit-trail' && (
          <div className="p-4 space-y-3 text-xs">
            <h4 className="font-bold text-gray-900 text-sm">মামলা সংশ্লিষ্ট অডিট রেকর্ড</h4>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-700 font-bold border-b">
                  <tr>
                    <th className="py-2 px-3">তারিখ ও সময়</th>
                    <th className="py-2 px-3">কার্যক্রম</th>
                    <th className="py-2 px-3">ব্যবহারকারী</th>
                    <th className="py-2 px-3">ফলাফল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-600">১১ সেপ্টেম্বর ২০২৬, ১০:১৫:২২</td>
                    <td className="py-2 px-3 font-semibold text-gray-800">প্যানেল আইনজীবী নিয়োগ নিরীক্ষা</td>
                    <td className="py-2 px-3 text-gray-700">{currentUser.name}</td>
                    <td className="py-2 px-3 text-emerald-800 font-bold">সফল</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-600">১০ সেপ্টেম্বর ২০২৬, ১৪:২০:১০</td>
                    <td className="py-2 px-3 font-semibold text-gray-800">যোগ্যতা অনুমোদন</td>
                    <td className="py-2 px-3 text-gray-700">মো. মাহবুবুর রহমান</td>
                    <td className="py-2 px-3 text-emerald-800 font-bold">সফল</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-3 text-gray-600">০৯ সেপ্টেম্বর ২০২৬, ১০:১৫:২২</td>
                    <td className="py-2 px-3 font-semibold text-gray-800">আবেদন গ্রহণ ও নথিভুক্তি</td>
                    <td className="py-2 px-3 text-gray-700">মো. সাইদুল ইসলাম</td>
                    <td className="py-2 px-3 text-emerald-800 font-bold">সফল</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Upload Document Modal */}
      {showDocUploadModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded-sm p-4 w-full max-w-md space-y-3 text-xs">
            <h4 className="font-bold text-gray-900 text-sm border-b pb-2">
              নতুন বিচারিক নথি আপলোড (নিরাপদ যাচাই সহ)
            </h4>
            <form onSubmit={handleDocUploadSubmit} className="space-y-2.5">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">নথির শিরোনাম:</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: আদালতের অন্তর্বর্তীকালীন আদেশ"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">নথির বিভাগ:</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded bg-white"
                >
                  <option value="COURT_ORDER">আদালতের আদেশ</option>
                  <option value="HEARING_RECORD">শুনানির নথি</option>
                  <option value="CASE_RECORD">মামলার আরজি/জবাব</option>
                  <option value="MEDIATION_RECORD">মধ্যস্থতার নথি</option>
                  <option value="IDENTITY">পরিচয়পত্র সংক্রান্ত</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">ফাইল নাম (পিডিএফ):</label>
                <input
                  type="text"
                  required
                  placeholder="Order_Order_2026_1284.pdf"
                  value={docFileName}
                  onChange={(e) => setDocFileName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded font-mono"
                />
              </div>
              <div className="p-2 bg-blue-50 text-[11px] text-blue-900 rounded border border-blue-200">
                আপলোডের সাথে সাথে স্বয়ংক্রিয়ভাবে ম্যালওয়্যার স্ক্যান ও SHA-256 চেকসাম তৈরি হবে।
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocUploadModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#172554] text-white rounded font-bold hover:bg-blue-900 cursor-pointer"
                >
                  আপলোড নিশ্চিত করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded-sm p-4 w-full max-w-md space-y-3 text-xs">
            <h4 className="font-bold text-gray-900 text-sm border-b pb-2">
              মামলার অবস্থা পরিবর্তন ও কারণ নথিভুক্তকরণ
            </h4>
            <div className="space-y-2.5">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">নতুন অবস্থা:</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as CaseStatus)}
                  className="w-full p-2 border border-gray-300 rounded bg-white"
                >
                  <option value="HEARING_ONGOING">শুনানি চলমান</option>
                  <option value="MEDIATION_ONGOING">মধ্যস্থতা চলমান</option>
                  <option value="IN_PROGRESS">চলমান</option>
                  <option value="DISPOSED">নিষ্পত্তি হয়েছে</option>
                  <option value="STAYED">স্থগিত</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  প্রশাসনিক আদেশ বা নোট (টাইমলাইনে যুক্ত হবে):
                </label>
                <textarea
                  rows={2}
                  value={statusChangeNote}
                  onChange={(e) => setStatusChangeNote(e.target.value)}
                  placeholder="যেমন: বিজ্ঞ পারিবারিক আদালতে প্রথম শুনানির আদেশক্রমে..."
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={() => {
                    updateCaseStatus(
                      currentCase.id,
                      targetStatus,
                      statusChangeNote || 'মামলার অবস্থা পরিবর্তিত হয়েছে'
                    );
                    setShowStatusModal(false);
                    setStatusChangeNote('');
                  }}
                  className="px-3 py-1.5 bg-[#172554] text-white rounded font-bold hover:bg-blue-900 cursor-pointer"
                >
                  হালনাগাদ সম্পন্ন করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
