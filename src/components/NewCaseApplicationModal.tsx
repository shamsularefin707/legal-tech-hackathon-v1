/**
 * নতুন আইনি সহায়তা আবেদন কর্মপ্রবাহ (7-Step Legal Aid Application Workflow)
 * Implements realistic statutory application filing with separation of duties,
 * pilot district constraints, and clear distinction between Application ID and Official Case ID.
 */

import React, { useState } from 'react';
import {
  X,
  FileText,
  User,
  Scale,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';
import { PILOT_DISTRICTS, COURT_TYPES } from '../data/demoConfig';
import { CaseCategory, CaseStatus, LegalAidCase } from '../types/legalAid';
import { DEMO_SNAPSHOT_DATE, formatDateBn } from '../utils/dateUtils';
import { hasPermission } from '../services/rbacService';

interface NewCaseApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdCase: LegalAidCase) => void;
}

export const NewCaseApplicationModal: React.FC<NewCaseApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, cases, addNewCase, addAuditLog, setActiveView, setSelectedCaseId } =
    useLegalAid();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedCase, setSubmittedCase] = useState<LegalAidCase | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Applicant
    applicantName: '',
    nidNumber: '',
    phone: '',
    gender: 'নারী' as 'নারী' | 'পুরুষ' | 'অন্যান্য',
    age: '২৮',
    monthlyIncome: '৬,৫০০',
    occupation: 'গৃহিণী',
    villageWard: 'ওয়ার্ড নং ৩, গ্রাম: শান্তিপুর',
    // Step 2: Dispute
    category: 'WOMEN_CHILD' as CaseCategory,
    subcategory: 'দেনমোহর ও খোরপোষ আদায়',
    disputeSummary:
      'স্বামী কর্তৃক শারীরিক ও মানসিক নির্যাতন এবং বিগত ৮ মাস যাবত নাবালক সন্তানের কোনো প্রকার ভরণপোষণ ও খোরপোষ না দিয়ে অন্যায়ভাবে বিতাড়ন।',
    reliefSought:
      'আইনসঙ্গত দেনমোহর ও বকেয়া খোরপোষ আদায় এবং নাবালক সন্তানের ভরণপোষণ নিশ্চিতকরণ।',
    opposingPartyName: 'মো. রফিকুল ইসলাম',
    opposingPartyAddress: 'গ্রাম: রাধানগর, পোস্ট: রাজবাড়ী সদর',
    // Step 3: District & Court
    district: 'রাজবাড়ী',
    upazila: 'রাজবাড়ী সদর',
    courtType: 'পারিবারিক আদালত',
    // Step 4: Eligibility
    isLowIncome: true,
    isVulnerableWoman: true,
    hasDisability: false,
    isDomesticViolenceVictim: true,
    eligibilityNotes:
      'আবেদনকারী অতিদরিদ্র ও সহায়সম্বলহীন নারী। মাসিক আয় নির্ধারিত সরকারি সিলিং (১২,০০০ টাকা)-এর চেয়ে কম হওয়ায় সম্পূর্ণ বিনামূল্যে সরকারি আইনি সহায়তা পাওয়ার যোগ্য।',
    // Step 5: Documents
    nidDocUploaded: true,
    applicationDocUploaded: true,
    marriageDocUploaded: true,
  });

  if (!isOpen) return null;

  const canCreate = hasPermission(currentUser, 'CREATE_APPLICATION');

  const handleDistrictChange = (distBn: string) => {
    const matched = PILOT_DISTRICTS.find((p) => p.districtBn === distBn);
    const defaultUpazila = matched ? matched.upazilas[0] : 'সদর';
    setFormData((prev) => ({
      ...prev,
      district: distBn,
      upazila: defaultUpazila,
    }));
  };

  const selectedPilot = PILOT_DISTRICTS.find((p) => p.districtBn === formData.district);
  const availableUpazilas = selectedPilot ? selectedPilot.upazilas : [];

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      const nextSequence = cases.length + 1;
      const appId = `APP-2026-${String(nextSequence).padStart(4, '0')}`;
      const internalId = `CASE-APP-${nextSequence}`;

      const newCase: LegalAidCase = {
        id: internalId,
        isDemoData: true,
        caseNumber: appId, // Display as application ID before formal court registration
        applicationId: appId,
        officialCaseId: undefined, // NOT assigned yet! Generated only upon formal REGISTER_CASE
        status: 'SUBMITTED',
        deadlineStatus: 'NORMAL',
        activityStatus: 'ACTIVE',
        submittedBy: currentUser.id,
        assignedOfficerName: currentUser.name,
        district: formData.district,
        districtType: 'DIGITAL_LEGAL_AID_PILOT',
        upazila: formData.upazila,
        courtName: `${formData.district} ${formData.courtType}`,
        courtType: formData.courtType,
        category: formData.category,
        caseCategory: formData.category,
        caseSubcategory: formData.subcategory,
        filingDate: DEMO_SNAPSHOT_DATE,
        applicationDate: formatDateBn(DEMO_SNAPSHOT_DATE),
        lastActivityDate: DEMO_SNAPSHOT_DATE,
        daysWithoutActivity: 0,
        daysSinceLastActivity: 0,
        slaRemainingDays: 30,
        configuredSlaDays: 45,
        slaStatus: 'NORMAL',
        slaTargetDate: '2026-10-24',
        applicant: {
          id: `APP-APPL-${nextSequence}`,
          name: formData.applicantName || 'মোছা. রোকেয়া বেগম',
          displayName: formData.applicantName || 'মোছা. রোকেয়া বেগম',
          nidMasked: `****-****-${formData.nidNumber.slice(-4) || '৮৮৭৭'}`,
          phoneMasked: `০১৭**-***${formData.phone.slice(-3) || '৪৫৬'}`,
          gender: formData.gender,
          age: parseInt(formData.age, 10) || 28,
          ageBand: '২৬-৩৫',
          monthlyIncome: 6500,
          occupation: formData.occupation,
          villageWard: formData.villageWard,
          upazila: formData.upazila,
          district: formData.district,
          specialEligibility: ['আর্থিকভাবে অসচ্ছল নারী', 'পারিবারিক সহিংসতার শিকার'],
          opposingPartyName: formData.opposingPartyName,
          opposingPartyAddress: formData.opposingPartyAddress,
        },
        applicantName: formData.applicantName || 'মোছা. রোকেয়া বেগম',
        applicantDisplayName: formData.applicantName || 'মোছা. রোকেয়া বেগম',
        applicantGender: formData.gender,
        summary: formData.disputeSummary,
        reliefSought: formData.reliefSought,
        legalIssues: [
          'পারিবারিক আদালত অধ্যাদেশ ১৯৮৫ ও দেনমোহর আদায়',
          'নাবালক সন্তানের খোরপোষ ও নিরাপত্তা বিধান',
        ],
        priorityAssessment: {
          calculatedPriority: 'HIGH',
          score: 82,
          factors: [
            {
              title: 'অর্থনৈতিক অস্বচ্ছলতা ও পারিবারিক সহিংসতা',
              impact: 'POSITIVE',
              description: 'আবেদনকারী সহায়হীন নারী ও পারিবারিক বিরোধের শিকার',
            },
          ],
        },
        hearings: [],
        deadlines: [
          {
            id: `DL-${internalId}-1`,
            title: 'প্রাথমিক আবেদন যাচাই ও নথি পরীক্ষণ',
            dueDate: formatDateBn('2026-09-16'),
            daysRemaining: 7,
            category: 'WITHIN_7_DAYS',
            assignedOfficer: currentUser.name,
            status: 'PENDING',
            actionRequired: 'আবেদনপত্রের সত্যতা নিরূপণ ও নথি রেজিস্ট্রিভুক্তকরণ',
          },
        ],
        timeline: [
          {
            id: `TL-${internalId}-1`,
            date: formatDateBn(DEMO_SNAPSHOT_DATE),
            isoDate: DEMO_SNAPSHOT_DATE,
            time: '১০:৩০ পূর্বাহ্ণ',
            user: currentUser.name,
            role: currentUser.role,
            action: 'আইনি সহায়তা আবেদন দাখিল (SUBMITTED)',
            description: `আবেদনকারী সরাসরি উপস্থিত হয়ে প্রাথমিক খসড়া দাখিল করেন। সাময়িক ট্র্যাকিং নম্বর: ${appId}।`,
            isOfficialRecord: true,
          },
        ],
        documents: [
          {
            id: `DOC-${internalId}-01`,
            title: 'আইনি সহায়তা আবেদনপত্র (মূল ফরম)',
            category: 'APPLICATION',
            fileName: `Application_${appId}.pdf`,
            fileSizeBytes: 215000,
            uploadedAt: formatDateBn(DEMO_SNAPSHOT_DATE),
            uploadedBy: currentUser.name,
            mimeType: 'application/pdf',
            securityHash: `sha256-${internalId}-app`,
            isRestricted: false,
            accessCount: 1,
          },
        ],
        securityClassification: 'Official',
        createdBy: currentUser.id,
      };

      addNewCase(newCase);
      setSubmittedCase(newCase);
      setIsSubmitting(false);

      addAuditLog({
        action: 'আবেদন দাখিল সম্পন্ন (CASE_APPLICATION_SUBMITTED)',
        actor: currentUser.name,
        role: currentUser.role,
        caseId: newCase.id,
        caseNumber: appId,
        district: newCase.district,
        details: `নতুন আইনি সহায়তা আবেদন দাখিল করা হয়েছে। আবেদন আইডি: ${appId}। আবেদনকারী: ${newCase.applicant.displayName}। কর্মকর্তা: ${currentUser.name} (${currentUser.role})।`,
        resource: 'APPLICATION_WORKFLOW',
        result: 'SUCCESS',
        severity: 'INFO',
      });

      if (onSuccess) {
        onSuccess(newCase);
      }
    }, 400);
  };

  const stepsList = [
    { num: 1, label: 'আবেদনকারীর তথ্য' },
    { num: 2, label: 'বিরোধের বিবরণ' },
    { num: 3, label: 'জেলা ও আদালত' },
    { num: 4, label: 'যোগ্যতা যাচাই' },
    { num: 5, label: 'নথিপত্র' },
    { num: 6, label: 'পর্যালোচনা' },
    { num: 7, label: 'দাখিলকরণ' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-md border border-gray-300 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-[#172554] text-white px-5 py-3 flex justify-between items-center shrink-0 border-b border-blue-900">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-blue-900 border border-blue-700 flex items-center justify-center font-bold text-amber-300">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm sm:text-base">
                  নতুন আইনি সহায়তা আবেদন কর্মপ্রবাহ
                </h3>
                <span className="bg-amber-400 text-blue-950 font-bold px-2 py-0.5 rounded text-[10px]">
                  ৭-ধাপ বিশিষ্ট সরকারি প্রক্রিয়া
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5">
                আবেদনকারী: {currentUser.name} ({currentUser.designation})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white p-1 rounded hover:bg-blue-900 cursor-pointer"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Ribbon */}
        <div className="bg-slate-50 border-b border-gray-200 px-4 py-2 shrink-0 overflow-x-auto">
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
            {stepsList.map((step) => {
              const isActive = currentStep === step.num;
              const isPast = currentStep > step.num;
              return (
                <div key={step.num} className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      if (step.num < currentStep || submittedCase) setCurrentStep(step.num);
                    }}
                    disabled={isSubmitting || (step.num > currentStep && !submittedCase)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-sm text-[11px] font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-900 text-white font-bold shadow-xs'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 cursor-pointer'
                        : 'text-gray-500 hover:text-gray-700 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                        isActive
                          ? 'bg-amber-400 text-blue-950'
                          : isPast
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {isPast ? '✓' : step.num}
                    </span>
                    <span>{step.label}</span>
                  </button>
                  {step.num < 7 && <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Permission Guard Notice */}
          {!canCreate && (
            <div className="bg-red-50 border border-red-300 rounded p-3 text-red-950 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">অনুমতি নেই:</span> আপনার বর্তমান ভূমিকা (
                {currentUser.role}) নতুন আইনি সহায়তা আবেদন খসড়া তৈরির ক্ষমতা রাখে না।
              </div>
            </div>
          )}

          {/* Submission Success Screen */}
          {submittedCase ? (
            <div className="bg-emerald-50 border border-emerald-300 rounded-md p-5 space-y-4 text-emerald-950">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-900">
                    আবেদন সফলভাবে দাখিল হয়েছে!
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    আবেদনটি সেন্ট্রাল রেজিস্ট্রি ডাটাবেসে সফলভাবে সংরক্ষিত হয়েছে।
                  </p>
                </div>
              </div>

              {/* ID Differentiation Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded border border-emerald-200">
                <div className="bg-blue-50/70 p-3 rounded border border-blue-200">
                  <div className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">
                    আবেদন ট্র্যাকিং আইডি (Application ID)
                  </div>
                  <div className="text-lg font-bold text-blue-950 mt-1">
                    {submittedCase.applicationId}
                  </div>
                  <div className="text-[11px] text-blue-800 mt-0.5">
                    স্ট্যাটাস: <span className="font-bold">SUBMITTED (দাখিলকৃত)</span>
                  </div>
                </div>

                <div className="bg-amber-50/70 p-3 rounded border border-amber-200">
                  <div className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                    সরকারি মামলা নম্বর (Official Case ID)
                  </div>
                  <div className="text-sm font-bold text-amber-900 mt-2 flex items-center space-x-1">
                    <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded text-xs font-mono">
                      বরাদ্দ হয়নি (Pending Registration)
                    </span>
                  </div>
                  <div className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                    জেলা লিগ্যাল এইড অফিসার কর্তৃক যাচাই ও আনুষ্ঠানিক নিবন্ধনের পর এটি স্বয়ংক্রিয়ভাবে উৎপন্ন হবে।
                  </div>
                </div>
              </div>

              {/* Separation of duties reminder */}
              <div className="bg-white p-3 rounded border border-gray-200 flex items-start space-x-2 text-gray-700">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-[11px]">
                  <span className="font-bold text-gray-900">দায়িত্ব পৃথকীকরণ (Separation of Duties):</span> আবেদন দাখিলকারী হিসেবে আপনি ({currentUser.name}) নিজে এই আবেদনটি অনুমোদন বা নিবন্ধন করতে পারবেন না। জেলা লিগ্যাল এইড কমিটির অন্য কোনো বিজ্ঞ কর্মকর্তা এটি যাচাই ও আনুষ্ঠানিক নিবন্ধন করবেন।
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedCaseId(submittedCase.id);
                    setActiveView('cases');
                    onClose();
                  }}
                  className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-2 rounded text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <span>আবেদন বিবরণ দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Applicant Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                      <User className="w-4 h-4 text-blue-900" />
                      <span>ধাপ ১: আবেদনকারীর ব্যক্তিগত ও পারিবারিক তথ্য</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      বিনামূল্যে সরকারি আইনি সহায়তাপ্রার্থী নাগরিকের সঠিক পরিচয় ও পেশাগত তথ্য
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        আবেদনকারীর নাম <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.applicantName}
                        onChange={(e) =>
                          setFormData({ ...formData, applicantName: e.target.value })
                        }
                        placeholder="যেমন: মোছা. রোকেয়া বেগম"
                        className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-blue-700 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        জাতীয় পরিচয়পত্র (NID) নম্বর <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.nidNumber}
                        onChange={(e) => setFormData({ ...formData, nidNumber: e.target.value })}
                        placeholder="১০ বা ১৭ ডিজিটের এনআইডি"
                        className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-blue-700 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        মোবাইল নম্বর <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="০১৭xxxxxxxx"
                        className="w-full border border-gray-300 rounded px-3 py-1.5 focus:border-blue-700 outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">লিঙ্গ</label>
                        <select
                          value={formData.gender}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gender: e.target.value as 'নারী' | 'পুরুষ' | 'অন্যান্য',
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white"
                        >
                          <option value="নারী">নারী</option>
                          <option value="পুরুষ">পুরুষ</option>
                          <option value="অন্যান্য">অন্যান্য</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">বয়স</label>
                        <input
                          type="text"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2.5 py-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">পেশা</label>
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        মাসিক পারিবারিক গড় আয় (টাকা)
                      </label>
                      <input
                        type="text"
                        value={formData.monthlyIncome}
                        onChange={(e) =>
                          setFormData({ ...formData, monthlyIncome: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-1.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-gray-700 font-semibold mb-1">
                        বর্তমান ঠিকানা ও ওয়ার্ড
                      </label>
                      <input
                        type="text"
                        value={formData.villageWard}
                        onChange={(e) =>
                          setFormData({ ...formData, villageWard: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Dispute Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-blue-900" />
                      <span>ধাপ ২: বিরোধের প্রকৃতি ও প্রার্থিত আইনি প্রতিকার</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      মামলার মূল শাখা ও প্রার্থিত আদেশ সংক্রান্ত বিবরণ
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        মামলার মূল শাখা (Category)
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value as CaseCategory })
                        }
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white"
                      >
                        <option value="WOMEN_CHILD">নারী ও শিশু নির্যাতন দমন</option>
                        <option value="FAMILY">পারিবারিক বিরোধ ও খোরপোষ</option>
                        <option value="LAND_PROPERTY">জমি ও সম্পত্তি বিরোধ</option>
                        <option value="CRIMINAL">ফৌজদারি মামলা</option>
                        <option value="CIVIL">দেওয়ানি প্রতিকার</option>
                        <option value="LABOUR">শ্রম অধিকার ও মজুরি</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        উপ-শাখা / বিরোধের ধরন
                      </label>
                      <input
                        type="text"
                        value={formData.subcategory}
                        onChange={(e) =>
                          setFormData({ ...formData, subcategory: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-1.5"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-gray-700 font-semibold mb-1">
                        বিরোধের সংক্ষিপ্ত বিবরণ <span className="text-red-600">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formData.disputeSummary}
                        onChange={(e) =>
                          setFormData({ ...formData, disputeSummary: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-2 outline-hidden focus:border-blue-700"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-gray-700 font-semibold mb-1">
                        প্রার্থিত আইনি প্রতিকার (Relief Sought)
                      </label>
                      <input
                        type="text"
                        value={formData.reliefSought}
                        onChange={(e) =>
                          setFormData({ ...formData, reliefSought: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        বিবাদী পক্ষের নাম
                      </label>
                      <input
                        type="text"
                        value={formData.opposingPartyName}
                        onChange={(e) =>
                          setFormData({ ...formData, opposingPartyName: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-1.5"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        বিবাদী পক্ষের ঠিকানা
                      </label>
                      <input
                        type="text"
                        value={formData.opposingPartyAddress}
                        onChange={(e) =>
                          setFormData({ ...formData, opposingPartyAddress: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-3 py-1.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: District and Court */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-blue-900" />
                      <span>ধাপ ৩: জেলা ও আদালত এক্তিয়ার নির্ধারণ (Pilot Districts)</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      শুধুমাত্র ৮টি নির্ধারিত পাইলট জেলা ও সংশ্লিষ্ট এক্তিয়ারভুক্ত আদালত
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        পাইলট জেলা নির্বাচন <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.district}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white font-medium"
                      >
                        {PILOT_DISTRICTS.map((dist) => (
                          <option key={dist.districtBn} value={dist.districtBn}>
                            {dist.districtBn} ({dist.districtEn}) - পাইলট প্রকল্প
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-blue-700 mt-1">
                        ✓ নির্বাচিত জেলা ডিজিটাল লিগ্যাল এইড পাইলট আওতাভুক্ত
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        উপজেলা / থানা <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.upazila}
                        onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white"
                      >
                        {availableUpazilas.map((upz) => (
                          <option key={upz} value={upz}>
                            {upz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-gray-700 font-semibold mb-1">
                        সংশ্লিষ্ট আদালত বা ফোরাম <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={formData.courtType}
                        onChange={(e) => setFormData({ ...formData, courtType: e.target.value })}
                        className="w-full border border-gray-300 rounded px-2.5 py-1.5 bg-white"
                      >
                        {COURT_TYPES.map((court) => (
                          <option key={court} value={court}>
                            {court}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Legal-Aid Eligibility */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-900" />
                      <span>ধাপ ৪: সরকারি আইনি সহায়তা প্রাপ্তির আইনি যোগ্যতা যাচাই</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      আইনগত সহায়তা প্রদান আইন ২০০০ ও সংশ্লিষ্ট বিধিমালার শর্তাবলি পরীক্ষণ
                    </p>
                  </div>

                  <div className="space-y-2.5 bg-gray-50 p-3.5 rounded border border-gray-200">
                    <label className="flex items-center space-x-2 text-gray-800 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.isLowIncome}
                        onChange={(e) =>
                          setFormData({ ...formData, isLowIncome: e.target.checked })
                        }
                        className="rounded text-blue-900"
                      />
                      <span>মাসিক পারিবারিক আয় সরকারি নির্ধারিত সিলিংয়ের (১২,০০০ টাকা) কম</span>
                    </label>

                    <label className="flex items-center space-x-2 text-gray-800 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.isVulnerableWoman}
                        onChange={(e) =>
                          setFormData({ ...formData, isVulnerableWoman: e.target.checked })
                        }
                        className="rounded text-blue-900"
                      />
                      <span>সহায়হীন, দুস্থ ও তালাকপ্রাপ্তা অথবা স্বামী পরিত্যক্তা নারী</span>
                    </label>

                    <label className="flex items-center space-x-2 text-gray-800 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.isDomesticViolenceVictim}
                        onChange={(e) =>
                          setFormData({ ...formData, isDomesticViolenceVictim: e.target.checked })
                        }
                        className="rounded text-blue-900"
                      />
                      <span>পারিবারিক সহিংসতা বা যৌতুক নির্যাতনের শিকার</span>
                    </label>

                    <label className="flex items-center space-x-2 text-gray-800 font-medium">
                      <input
                        type="checkbox"
                        checked={formData.hasDisability}
                        onChange={(e) =>
                          setFormData({ ...formData, hasDisability: e.target.checked })
                        }
                        className="rounded text-blue-900"
                      />
                      <span>শারীরিক বা মানসিক প্রতিবন্ধী ব্যক্তি</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      যোগ্যতা যাচাই সংক্রান্ত প্রশাসনিক মন্তব্য
                    </label>
                    <textarea
                      rows={2}
                      value={formData.eligibilityNotes}
                      onChange={(e) =>
                        setFormData({ ...formData, eligibilityNotes: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded px-3 py-1.5"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Documents */}
              {currentStep === 5 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                      <UploadCloud className="w-4 h-4 text-blue-900" />
                      <span>ধাপ ৫: সংযুক্ত নথিপত্র ও প্রমাণাদি আপলোড</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      ডিজিটাল রেজিস্ট্রেশনের জন্য প্রয়োজনীয় স্ক্যানকৃত প্রমাণক
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="border border-dashed border-gray-300 rounded-md p-3 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-700" />
                        <div>
                          <div className="font-bold text-gray-900">
                            আবেদনকারীর জাতীয় পরিচয়পত্র (NID) স্ক্যান
                          </div>
                          <div className="text-[10px] text-gray-500">PDF, JPG (সর্বোচ্চ ৫ MB)</div>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded text-[11px] font-bold border border-emerald-300">
                        ✓ সংযুক্ত
                      </span>
                    </div>

                    <div className="border border-dashed border-gray-300 rounded-md p-3 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-700" />
                        <div>
                          <div className="font-bold text-gray-900">
                            আইনি সহায়তা আবেদন ফরম (স্বাক্ষরিত মূল কপি)
                          </div>
                          <div className="text-[10px] text-gray-500">PDF ফরম্যাট</div>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded text-[11px] font-bold border border-emerald-300">
                        ✓ সংযুক্ত
                      </span>
                    </div>

                    <div className="border border-dashed border-gray-300 rounded-md p-3 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-amber-700" />
                        <div>
                          <div className="font-bold text-gray-900">
                            নিকাহনামা / কাবিননামা / সংশ্লিষ্ট নথিপত্র
                          </div>
                          <div className="text-[10px] text-gray-500">ঐচ্ছিক সহায়ক প্রমাণাদি</div>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded text-[11px] font-bold border border-emerald-300">
                        ✓ সংযুক্ত
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Review */}
              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-900" />
                      <span>ধাপ ৬: দাখিল-পূর্ব তথ্যাবলীর চূড়ান্ত পর্যালোচনা</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      দাখিলের পূর্বে সমস্ত তথ্যের যথার্থতা নিশ্চিত করুন
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded border border-gray-300 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">আবেদনকারী:</span>{' '}
                        <span className="font-bold text-gray-900">
                          {formData.applicantName || 'মোছা. রোকেয়া বেগম'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">লিঙ্গ ও বয়স:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {formData.gender}, {formData.age} বছর
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">জেলা ও উপজেলা:</span>{' '}
                        <span className="font-bold text-blue-900">
                          {formData.district}, {formData.upazila}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">আদালত এক্তিয়ার:</span>{' '}
                        <span className="font-medium text-gray-900">{formData.courtType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">মামলার শাখা:</span>{' '}
                        <span className="font-medium text-gray-900">{formData.subcategory}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">বিবাদী পক্ষ:</span>{' '}
                        <span className="font-medium text-gray-900">
                          {formData.opposingPartyName}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-2 text-xs">
                      <div className="text-gray-500 font-medium">বিরোধের সারসংক্ষেপ:</div>
                      <p className="text-gray-800 mt-0.5">{formData.disputeSummary}</p>
                    </div>

                    <div className="border-t border-gray-200 pt-2 text-xs">
                      <div className="text-gray-500 font-medium">প্রার্থিত প্রতিকার:</div>
                      <p className="text-gray-800 mt-0.5">{formData.reliefSought}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-300 p-3 rounded text-amber-950 text-[11px] leading-relaxed">
                    <span className="font-bold">গুরুত্বপূর্ণ সতর্কতা:</span> দাখিল করার পর তাৎক্ষণিকভাবে একটি অস্থায়ী <strong>Application ID (APP-2026-XXXX)</strong> ইস্যু করা হবে। এটি কোনো আনুষ্ঠানিক আদালত রেজিস্ট্রি নম্বর (Official Case ID) নয়। জেলা লিগ্যাল এইড অফিসার কর্তৃক যাচাই সম্পন্ন হওয়ার পর মামলা আনুষ্ঠানিকভাবে নিবন্ধিত হবে।
                  </div>
                </div>
              )}

              {/* STEP 7: Submit Confirmation */}
              {currentStep === 7 && (
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-2">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-blue-900" />
                      <span>ধাপ ৭: আবেদন দাখিল ও ট্র্যাকিং নম্বর সৃষ্টি</span>
                    </h4>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      সরকারি ডেটাবেসে আবেদন রেকর্ড সংরক্ষণ
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-4 space-y-3 text-blue-950">
                    <div className="font-bold text-sm text-blue-900">
                      দাখিলকারী কর্মকর্তার প্রত্যয়নপত্র:
                    </div>
                    <p className="text-xs text-blue-900 leading-relaxed">
                      আমি, <strong>{currentUser.name}</strong> ({currentUser.designation}), এই মর্মে প্রত্যয়ন করছি যে আবেদনকারী কর্তৃক প্রদত্ত যাবতীয় তথ্য ও সংযুক্ত নথিপত্র যথাযথ প্রক্রিয়ায় গ্রহণ করা হয়েছে। প্রাথমিক যোগ্যতা পূরণ সাপেক্ষে আবেদনটি জেলা লিগ্যাল এইড কর্মকর্তার বিবেচনার্থে পেশ করা হচ্ছে।
                    </p>
                    <div className="text-[11px] text-blue-800">
                      দাখিলের তারিখ: {formatDateBn(DEMO_SNAPSHOT_DATE)} | সময়: সকাল ১০:৩০
                    </div>
                  </div>

                  <div className="flex items-center justify-center p-4">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !canCreate}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-sm text-sm shadow-md flex items-center space-x-2 cursor-pointer transition-colors"
                    >
                      {isSubmitting ? (
                        <span>দাখিল হচ্ছে...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>চূড়ান্তভাবে আবেদন দাখিল করুন (Submit Application)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation */}
        {!submittedCase && (
          <div className="bg-gray-100 border-t border-gray-300 px-5 py-3 flex justify-between items-center shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1 || isSubmitting}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded text-xs font-semibold ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>পূর্ববর্তী ধাপ</span>
            </button>

            <div className="text-xs text-gray-500 font-medium">
              ধাপ {currentStep} / ৭
            </div>

            {currentStep < 7 ? (
              <button
                onClick={handleNext}
                disabled={!canCreate}
                className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-4 py-1.5 rounded text-xs flex items-center space-x-1 cursor-pointer transition-colors"
              >
                <span>পরবর্তী ধাপ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-20"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
