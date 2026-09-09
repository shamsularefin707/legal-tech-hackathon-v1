/**
 * ড্যাশবোর্ড (Operational Government Justice Dashboard)
 */

import React from 'react';
import {
  AlertTriangle,
  Briefcase,
  Clock,
  UserCheck,
  Calendar,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  TrendingUp,
  Play,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useLegalAid } from '../context/LegalAidContext';
import { calculateDashboardMetrics } from '../services/dashboardMetrics';

export const DashboardView: React.FC = () => {
  const {
    cases,
    lawyers,
    auditLogs,
    vulnerabilities,
    securityIncidents,
    setSelectedCaseId,
    setActiveView,
    atRiskDeadlinesCount,
    stuckCases,
    runSecuritySimulation,
  } = useLegalAid();

  // Dynamic Metrics derived using the service engine
  const metrics = React.useMemo(
    () => calculateDashboardMetrics(cases, lawyers, securityIncidents, vulnerabilities),
    [cases, lawyers, securityIncidents, vulnerabilities]
  );

  const totalCases = metrics.totalCases;
  const activeCases = cases.filter((c) => c.status !== 'DISPOSED').length;
  const pendingDisposal = cases.filter(
    (c) => c.status === 'HEARING_ONGOING' || c.status === 'MEDIATION_ONGOING'
  ).length;
  const overdueCount = metrics.overdueCases;
  const todayHearings = metrics.todaysHearingsCount;
  const pendingLawyerAssignmentCount = metrics.lawyerAssignmentPendingCount;

  // High Priority Cases (Sorted by score descending)
  const priorityCases = cases
    .filter(
      (c) =>
        c.priorityAssessment.calculatedPriority === 'VERY_HIGH' ||
        c.priorityAssessment.calculatedPriority === 'HIGH'
    )
    .sort((a, b) => b.priorityAssessment.score - a.priorityAssessment.score);

  return (
    <div className="space-y-4">
      {/* Dashboard Top Header */}
      <div className="bg-white border border-gray-300 p-4 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-900">ড্যাশবোর্ড</h2>
            <span className="bg-amber-100 text-blue-950 text-[11px] font-bold px-2 py-0.5 rounded border border-amber-300">
              ডেমো পরিবেশ • ৫০০ সিন্থেটিক মামলা
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            জেলা আইনগত সহায়তা কার্যক্রমের বর্তমান অবস্থা ও বিচারিক তদারকি
          </p>
        </div>

        {/* Section 41 Trigger Highlight */}
        <div className="flex items-center space-x-2 bg-red-50 border border-red-300 px-3 py-2 rounded text-xs text-red-950">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <div>
            <span className="font-bold">{atRiskDeadlinesCount}টি মামলা</span> সময়সীমা অতিক্রমের ঝুঁকিতে রয়েছে
          </div>
          <button
            onClick={() => setActiveView('deadlines')}
            className="ml-2 font-bold text-red-800 hover:text-red-900 underline text-xs"
          >
            পর্যবেক্ষণ করুন →
          </button>
        </div>
      </div>

      {/* 6 Compact Statistical Summaries (Section 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-white border border-gray-300 p-3 rounded-sm">
          <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
            <span>মোট মামলা</span>
            <Briefcase className="w-3.5 h-3.5 text-gray-400" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">{totalCases}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">জেলায় নিবন্ধিত</div>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-sm">
          <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
            <span>চলমান মামলা</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-950 mt-1">{activeCases}</div>
          <div className="text-[10px] text-blue-700 mt-0.5">বিচার প্রক্রিয়ায়</div>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-sm">
          <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
            <span>নিষ্পত্তির অপেক্ষায়</span>
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-950 mt-1">{pendingDisposal}</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">রায় বা আপস পর্ব</div>
        </div>

        <div className="bg-white border border-red-300 bg-red-50/40 p-3 rounded-sm">
          <div className="text-[11px] text-red-700 font-medium flex items-center justify-between">
            <span>সময়সীমা অতিক্রান্ত</span>
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          </div>
          <div className="text-xl font-bold text-red-900 mt-1">{overdueCount}</div>
          <div className="text-[10px] text-red-700 mt-0.5">জরুরি পদক্ষেপ প্রযোজ্য</div>
        </div>

        <div className="bg-white border border-gray-300 p-3 rounded-sm">
          <div className="text-[11px] text-gray-500 font-medium flex items-center justify-between">
            <span>আজকের শুনানি</span>
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 mt-1">{todayHearings}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">বিজ্ঞ আদালতে ধার্য</div>
        </div>

        <div className="bg-white border border-amber-300 bg-amber-50/40 p-3 rounded-sm">
          <div className="text-[11px] text-amber-800 font-medium flex items-center justify-between">
            <span>আইনজীবী অপেক্ষমাণ</span>
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-950 mt-1">{pendingLawyerAssignmentCount}</div>
          <div className="text-[10px] text-amber-800 mt-0.5">নিয়োগ প্রক্রিয়াধীন</div>
        </div>
      </div>

      {/* Demo Security-Control Maturity Score & Posture Banner */}
      <div className="bg-white border border-gray-300 rounded p-4 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-gray-200 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-blue-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-gray-900">
                  নিরাপত্তা নিয়ন্ত্রণ পরিপক্বতা স্কোর (Demo Security-Control Maturity Score)
                </h3>
                <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded">
                  ৮২ / ১০০ • ভালো মান
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                কাল্পনিক হ্যাকাথন অডিট ও বিএসটিআই/আইসিটি সাইবার গাইডলাইন ভিত্তিক নিয়ন্ত্রণ পর্যবেক্ষণ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={runSecuritySimulation}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>নিরাপত্তা মহড়া চালান</span>
            </button>
            <button
              onClick={() => setActiveView('vulnerabilities')}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>ভালনারেবিলিটি রেজিস্টার ({vulnerabilities.filter(v => v.severity === 'CRITICAL').length}টি ক্রিটিক্যাল)</span>
            </button>
          </div>
        </div>

        {/* 4 Control Metric Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-1">
          <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-gray-700">ভূমিকা ও এক্সেস নিয়ন্ত্রণ (RBAC/BOLA)</span>
              <span className="font-bold text-emerald-700">৯২%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full" style={{ width: '92%' }}></div>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">অবজেক্ট-লেভেল কঠোর যাচাই সক্রিয়</div>
          </div>

          <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-gray-700">অপরিবর্তনীয় অডিট ট্রেইল</span>
              <span className="font-bold text-blue-800">৯০%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-700 h-full" style={{ width: '90%' }}></div>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">কোরিলেশন আইডি ও ক্রিপ্টো হ্যাশ</div>
          </div>

          <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-gray-700">সংবেদনশীল নথি সুরক্ষা (DLP)</span>
              <span className="font-bold text-blue-800">৮৫%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: '85%' }}></div>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">ডিজিটাল ওয়াটারমার্ক ও সুরক্ষিত ভল্ট</div>
          </div>

          <div className="bg-gray-50 p-2.5 rounded border border-gray-200">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-gray-700">ভালনারেবিলিটি ব্যবস্থাপনা ও SLA</span>
              <span className="font-bold text-amber-700">৭২%</span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: '72%' }}></div>
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-1">১টি ক্রিটিক্যাল ত্রুটি প্যাচাধীন</div>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 spans): Priority Cases & Stuck Cases */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section 1: অগ্রাধিকারপ্রাপ্ত মামলা */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="p-3.5 border-b border-gray-200 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-3.5 bg-blue-900 inline-block"></span>
                <h3 className="font-bold text-gray-900 text-sm">
                  অগ্রাধিকারপ্রাপ্ত মামলা (জরুরি পর্যালোচনা তালিকা)
                </h3>
              </div>
              <button
                onClick={() => setActiveView('cases')}
                className="text-xs text-blue-900 hover:underline font-semibold flex items-center space-x-1"
              >
                <span>সকল মামলা</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 border-b border-gray-200">
                    <th className="py-2.5 px-3 font-semibold">মামলা নম্বর</th>
                    <th className="py-2.5 px-3 font-semibold">আবেদনকারী</th>
                    <th className="py-2.5 px-3 font-semibold">মামলার ধরন</th>
                    <th className="py-2.5 px-3 font-semibold">অগ্রাধিকার</th>
                    <th className="py-2.5 px-3 font-semibold">বর্তমান অবস্থা</th>
                    <th className="py-2.5 px-3 font-semibold text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {priorityCases.slice(0, 6).map((c) => (
                    <tr
                      key={c.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        c.id === 'case-1284' ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        <div className="font-bold text-[#172554] flex items-center space-x-1">
                          <span>{c.caseNumber}</span>
                          {c.id === 'case-1284' && (
                            <span className="bg-amber-100 text-amber-900 text-[10px] px-1 rounded font-bold">
                              মহড়া কেস
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">{c.courtName}</div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-800">
                        <div className="font-semibold">{c.applicant.name}</div>
                        <div className="text-[10px] text-gray-500">
                          {c.applicant.upazila}, {c.applicant.district}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700">
                        <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-[11px]">
                          {c.category === 'FAMILY'
                            ? 'পারিবারিক'
                            : c.category === 'WOMEN_CHILD'
                            ? 'নারী ও শিশু'
                            : c.category === 'CRIMINAL'
                            ? 'ফৌজদারি'
                            : c.category === 'LAND_PROPERTY'
                            ? 'জমি ও সম্পত্তি'
                            : c.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            c.priorityAssessment.calculatedPriority === 'VERY_HIGH'
                              ? 'bg-red-100 text-red-900 border-red-300'
                              : 'bg-orange-100 text-orange-900 border-orange-300'
                          }`}
                        >
                          {c.priorityAssessment.calculatedPriority === 'VERY_HIGH'
                            ? 'অতি উচ্চ'
                            : 'উচ্চ'}
                        </span>
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          স্কোর: {c.priorityAssessment.score}/১০০
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded text-[11px] font-medium whitespace-nowrap">
                          {c.status === 'PENDING_LAWYER_ASSIGNMENT'
                            ? 'আইনজীবী নিয়োগ অপেক্ষমাণ'
                            : c.status === 'IN_PROGRESS'
                            ? 'চলমান'
                            : c.status === 'HEARING_ONGOING'
                            ? 'শুনানি চলমান'
                            : c.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedCaseId(c.id);
                            setActiveView('case-detail');
                          }}
                          className="px-2.5 py-1 bg-[#172554] text-white hover:bg-blue-900 rounded text-xs font-semibold cursor-pointer whitespace-nowrap"
                        >
                          পর্যালোচনা করুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: অচল / দীর্ঘদিন কার্যক্রমবিহীন মামলা (Stuck Case Detection - Section 16) */}
          <div className="bg-white border border-amber-300 rounded-sm">
            <div className="p-3 border-b border-amber-200 bg-amber-50/60 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <h3 className="font-bold text-amber-950 text-xs sm:text-sm">
                  অচল / দীর্ঘদিন কার্যক্রমবিহীন মামলা শনাক্তকরণ (সেকশন ১৬)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-amber-900">
                {stuckCases.length}টি মামলা সতর্কতাপ্রাপ্ত
              </span>
            </div>
            <div className="p-3 space-y-2">
              {stuckCases.slice(0, 5).map((sc) => (
                <div
                  key={sc.id}
                  className="border border-amber-200 bg-amber-50/20 p-2.5 rounded text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">{sc.caseNumber}</span>
                      <span className="text-gray-500">|</span>
                      <span className="text-gray-700">{sc.applicant.name}</span>
                      <span className="text-[11px] bg-red-100 text-red-900 px-1.5 py-0.5 rounded font-bold">
                        গত {sc.daysWithoutActivity} দিন কার্যক্রম নেই
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600 mt-1">
                      দায়িত্বপ্রাপ্ত আইনজীবী: {sc.assignedLawyerName || 'অনির্ধারিত'} | সুপারিশকৃত পদক্ষেপ: আইনজীবীর সাথে জরুরি যোগাযোগ ও নথি পর্যালোচনা
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCaseId(sc.id);
                      setActiveView('case-detail');
                    }}
                    className="px-2.5 py-1 bg-amber-800 text-white hover:bg-amber-900 rounded text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    নথি খুলুন
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Lawyer Workload & Recent Activity */}
        <div className="space-y-4">
          {/* Section 3: প্যানেল আইনজীবীর কাজের চাপ (LADCS Model - Section 11 & 14) */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="p-3.5 border-b border-gray-200 flex justify-between items-center bg-gray-50/80">
              <h3 className="font-bold text-gray-900 text-sm">
                আইনজীবীর কাজের চাপ পর্যবেক্ষণ (LADCS)
              </h3>
              <button
                onClick={() => setActiveView('lawyers')}
                className="text-xs text-blue-900 hover:underline font-semibold"
              >
                বিস্তারিত তালিকা
              </button>
            </div>
            <div className="p-3 space-y-3">
              {lawyers.slice(0, 4).map((l) => {
                const percentage = Math.round((l.currentActiveCases / l.maxCaseLimit) * 100);
                const isOverloaded = l.currentActiveCases >= l.maxCaseLimit;

                return (
                  <div key={l.id} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-semibold text-gray-800">{l.name}</div>
                      <div className="text-[11px]">
                        <span
                          className={`font-bold ${
                            isOverloaded ? 'text-red-700' : 'text-gray-700'
                          }`}
                        >
                          {l.currentActiveCases}
                        </span>
                        <span className="text-gray-400"> / {l.maxCaseLimit} মামলা</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 h-2 rounded-xs overflow-hidden">
                      <div
                        className={`h-full ${
                          isOverloaded
                            ? 'bg-red-600'
                            : percentage > 75
                            ? 'bg-amber-500'
                            : 'bg-[#172554]'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>

                    {isOverloaded && (
                      <div className="text-[10px] text-red-700 font-bold mt-0.5">
                        অতিরিক্ত কাজের চাপ (সীমা অতিক্রান্ত)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: সাম্প্রতিক প্রশাসনিক ও অডিট কার্যক্রম (Section 21) */}
          <div className="bg-white border border-gray-300 rounded-sm">
            <div className="p-3.5 border-b border-gray-200 flex justify-between items-center bg-gray-50/80">
              <h3 className="font-bold text-gray-900 text-sm">সাম্প্রতিক কার্যক্রমের রেকর্ড</h3>
              <button
                onClick={() => setActiveView('audit-log')}
                className="text-xs text-blue-900 hover:underline font-semibold"
              >
                অডিট ট্রেইল
              </button>
            </div>
            <div className="divide-y divide-gray-100 text-xs">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-2.5">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-gray-800">{log.action}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        log.outcome === 'সফল'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-red-100 text-red-900'
                      }`}
                    >
                      {log.outcome}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-600 mt-0.5">
                    সম্পদ: {log.resourceId} | ব্যবহারকারী: {log.user}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{log.timestamp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* District Status Card */}
          <div className="bg-blue-950 text-white p-3.5 rounded-sm text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">ঢাকা জেলা আইনি সহায়তা সেল</span>
              <ShieldCheck className="w-4 h-4 text-blue-300" />
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              নিয়োগ কমিটি ও জেলা লিগ্যাল এইড কমিটির নীতিমালার শতভাগ পরিপালন নিশ্চিত রয়েছে। প্যানেল আইনজীবীদের তথ্য হালনাগাদকৃত।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
