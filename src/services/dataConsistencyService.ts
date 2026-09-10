/**
/**
 * ডেটা সঙ্গতি ও কালানুক্রমিক পরীক্ষণ ইঞ্জিন (Data Consistency & Chronology Audit Service)
 * Audits all cases, dates, statuses, and workloads against statutory legal-aid rules.
 * Never silently modifies source values; flags conflicts with exact dates, explanations, and actions.
 */

import { LegalAidCase, PanelLawyer } from '../types/legalAid';
import { parseBanglaOrIsoTimestamp, isDateLte } from '../utils/dateUtils';
import { validateDistrictRelationship } from '../data/demoConfig';

export type ConsistencyCategory =
  | 'CHRONOLOGY_CONFLICT'    // কালানুক্রমিক অসংগতি
  | 'MISSING_DATA'           // তথ্য অনুপস্থিত
  | 'DUPLICATE_CASE'         // ডুপ্লিকেট মামলা আইডি
  | 'DUPLICATE_APPLICANT'    // ডুপ্লিকেট আবেদনকারী
  | 'INVALID_STATUS'         // অবৈধ অবস্থা
  | 'INVALID_DATE'           // ভুল তারিখ
  | 'INVALID_DISTRICT_COURT' // ভুল জেলা/আদালত
  | 'LAWYER_WORKLOAD';       // আইনজীবীর কাজের চাপে অসংগতি

export interface DateConflictDetail {
  filingDate?: string;
  hearingDate?: string;
  registrationDate?: string;
  lawyerAssignmentDate?: string;
  reviewDate?: string;
  lastActivityDate?: string;
  slaDueDate?: string;
  conflictingFields: string[];
}

export interface CaseConsistencyIssue {
  id: string;
  caseId: string;
  caseNumber: string;
  category: ConsistencyCategory;
  categoryBn: string;
  categoryLabel?: string;
  description?: string;
  details?: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  severityBn: string;
  title: string;
  explanation: string;
  recommendedAction: string; // e.g. "উৎস নথি যাচাই করুন"
  sourceDates?: DateConflictDetail;
  sourceUnchangedNotice: string;
  detectedAt: string;
}

export interface ConsistencyCategorySummary {
  category: ConsistencyCategory;
  categoryBn: string;
  categoryLabel?: string;
  problem: string;
  count: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  severityBn: string;
  recommendedAction: string;
  affectedCaseIds: string[];
}

export interface DatasetConsistencyAuditResult {
  totalIssuesCount: number;
  affectedCasesCount: number;
  chronologyConflictsCount: number;
  missingDataCount: number;
  duplicateCasesCount: number;
  duplicateApplicantsCount: number;
  invalidStatusCount: number;
  invalidDatesCount: number;
  invalidDistrictCourtCount: number;
  lawyerWorkloadCount: number;
  categorySummaries: ConsistencyCategorySummary[];
  issuesByCaseId: Record<string, CaseConsistencyIssue[]>;
  caseIssuesMap: Map<string, CaseConsistencyIssue[]>;
  allIssues: CaseConsistencyIssue[];
}

// Map english category to institutional Bengali
export const CATEGORY_LABELS: Record<ConsistencyCategory, { bn: string; problem: string; defaultAction: string; defaultSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' }> = {
  CHRONOLOGY_CONFLICT: {
    bn: 'কালানুক্রমিক অসংগতি',
    problem: 'তারিখের ধারাবাহিকতায় অসংগতি (যেমন: শুনানির তারিখ ফাইলিংয়ের পূর্বে)',
    defaultAction: 'উৎস নথি যাচাই করুন',
    defaultSeverity: 'CRITICAL',
  },
  MISSING_DATA: {
    bn: 'তথ্য অনুপস্থিত',
    problem: 'আবেদনকারী বা মামলার আবশ্যকীয় তথ্য অসম্পূর্ণ',
    defaultAction: 'আবেদনপত্রের তথ্য হালনাগাদ করুন',
    defaultSeverity: 'HIGH',
  },
  DUPLICATE_CASE: {
    bn: 'ডুপ্লিকেট মামলা আইডি',
    problem: 'একই মামলা নম্বর বা শনাক্তকারী একাধিকবার লিপিবদ্ধ',
    defaultAction: 'রেজিস্টার খতিয়ান সমন্বয় করুন',
    defaultSeverity: 'CRITICAL',
  },
  DUPLICATE_APPLICANT: {
    bn: 'ডুপ্লিকেট আবেদনকারী',
    problem: 'একই জাতীয় পরিচয়পত্র/ব্যক্তির একাধিক সমান্তরাল মামলা',
    defaultAction: 'জাতীয় পরিচয়পত্র ও মামলার ফাইল যাচাই করুন',
    defaultSeverity: 'MEDIUM',
  },
  INVALID_STATUS: {
    bn: 'অবৈধ অবস্থা',
    problem: 'মামলার পর্যায় ও বর্তমান স্থিতির মধ্যে অসঙ্গতি',
    defaultAction: 'মামলার প্রকৃত বিচারিক পর্যায় নির্ধারণ করুন',
    defaultSeverity: 'HIGH',
  },
  INVALID_DATE: {
    bn: 'ভুল তারিখ ফরম্যাট',
    problem: 'তারিখের বিন্যাস বা মান ক্যালেন্ডার নিয়মের পরিপন্থী',
    defaultAction: 'আদালতের নথি দেখে তারিখ সংশোধন করুন',
    defaultSeverity: 'MEDIUM',
  },
  INVALID_DISTRICT_COURT: {
    bn: 'ভুল জেলা/আদালত এক্তিয়ার',
    problem: 'জেলা ও উপজেলার ভৌগোলিক বা আদালতের বিচারিক এখতিয়ারে অসঙ্গতি',
    defaultAction: 'আদালতের ভৌগোলিক এক্তিয়ার নিশ্চিত করুন',
    defaultSeverity: 'HIGH',
  },
  LAWYER_WORKLOAD: {
    bn: 'আইনজীবীর কাজের চাপে অসংগতি',
    problem: 'অনুমোদিত সর্বোচ্চ ধারণক্ষমতার অতিরিক্ত মামলা বরাদ্দ',
    defaultAction: 'মামলা পুনর্নিয়োগের সুপারিশ বিবেচনা করুন',
    defaultSeverity: 'MEDIUM',
  },
};

const SOURCE_UNCHANGED_NOTICE = 'সতর্কতা: সিস্টেমের মূল ডেটাসেটে সংরক্ষিত উৎস মান অপরিবর্তিত রাখা হয়েছে।';

/**
 * Standardizes a date string into YYYY-MM-DD for reliable comparison
 */
function normalizeDateStr(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const parsed = parseBanglaOrIsoTimestamp(trimmed);
  if (parsed) {
    return parsed.slice(0, 10);
  }
  return '';
}

/**
 * Audit a single case record for all consistency, chronological, and structural invariants.
 */
export function auditCaseConsistency(
  c: LegalAidCase,
  allCases: LegalAidCase[],
  lawyers: PanelLawyer[] = []
): CaseConsistencyIssue[] {
  const issues: CaseConsistencyIssue[] = [];

  const filingDateNorm = normalizeDateStr(c.filingDate || c.applicationDate);
  const regDateNorm = normalizeDateStr(c.registrationDate);
  const lawyerDateNorm = normalizeDateStr(c.lawyerAssignmentDate || c.assignedDate);
  const lastActDateNorm = normalizeDateStr(c.lastActivityDate);
  const slaTargetNorm = normalizeDateStr(c.slaTargetDate);
  const disposalDateNorm = normalizeDateStr(c.disposalDate);

  // 1. CHRONOLOGY CHECKS

  // 1.1 Hearing before filing date
  if (c.hearings && c.hearings.length > 0) {
    for (const h of c.hearings) {
      const hearingDateNorm = normalizeDateStr(h.isoDate || h.date);
      if (filingDateNorm && hearingDateNorm && hearingDateNorm < filingDateNorm) {
        issues.push({
          id: `chron-h-before-f-${c.id}-${h.id}`,
          caseId: c.id,
          caseNumber: c.caseNumber,
          category: 'CHRONOLOGY_CONFLICT',
          categoryBn: CATEGORY_LABELS.CHRONOLOGY_CONFLICT.bn,
          severity: 'CRITICAL',
          severityBn: 'জরুরি',
          title: 'শুনানির তারিখ দাখিলের পূর্ববর্তী',
          explanation: `মামলার দাখিলের তারিখ (${c.filingDate || c.applicationDate}) শুনানির তারিখ (${h.date || h.isoDate})-এর পরে লিপিবদ্ধ রয়েছে, যা বিচারিক নিয়মে কালানুক্রমিকভাবে অসম্ভব।`,
          recommendedAction: 'উৎস নথি যাচাই করুন',
          sourceDates: {
            filingDate: c.filingDate || c.applicationDate,
            hearingDate: h.date || h.isoDate,
            registrationDate: c.registrationDate,
            lawyerAssignmentDate: c.lawyerAssignmentDate,
            lastActivityDate: c.lastActivityDate,
            conflictingFields: ['filingDate', 'hearingDate'],
          },
          sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
          detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
        });
      }
    }
  }

  // 1.2 Registration before filing date
  if (filingDateNorm && regDateNorm && regDateNorm < filingDateNorm) {
    issues.push({
      id: `chron-reg-before-f-${c.id}`,
      caseId: c.id,
      caseNumber: c.caseNumber,
      category: 'CHRONOLOGY_CONFLICT',
      categoryBn: CATEGORY_LABELS.CHRONOLOGY_CONFLICT.bn,
      severity: 'CRITICAL',
      severityBn: 'জরুরি',
      title: 'নিবন্ধনের তারিখ দাখিলের পূর্ববর্তী',
      explanation: `মামলার নিবন্ধনের তারিখ (${c.registrationDate}) আবেদন দাখিলের তারিখের (${c.filingDate || c.applicationDate}) পূর্বে লিপিবদ্ধ রয়েছে।`,
      recommendedAction: 'উৎস নথি যাচাই করুন',
      sourceDates: {
        filingDate: c.filingDate || c.applicationDate,
        registrationDate: c.registrationDate,
        conflictingFields: ['filingDate', 'registrationDate'],
      },
      sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
      detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
    });
  }

  // 1.3 Lawyer assignment before registration date
  if (regDateNorm && lawyerDateNorm && lawyerDateNorm < regDateNorm) {
    issues.push({
      id: `chron-lawyer-before-reg-${c.id}`,
      caseId: c.id,
      caseNumber: c.caseNumber,
      category: 'CHRONOLOGY_CONFLICT',
      categoryBn: CATEGORY_LABELS.CHRONOLOGY_CONFLICT.bn,
      severity: 'HIGH',
      severityBn: 'উচ্চ',
      title: 'নিবন্ধনের পূর্বে আইনজীবী নিয়োগ',
      explanation: `মামলা আনুষ্ঠানিক নিবন্ধনের (${c.registrationDate}) পূর্বে আইনজীবী নিয়োগের তারিখ (${c.lawyerAssignmentDate || c.assignedDate}) দেখানো হয়েছে।`,
      recommendedAction: 'উৎস নথি যাচাই করুন',
      sourceDates: {
        registrationDate: c.registrationDate,
        lawyerAssignmentDate: c.lawyerAssignmentDate || c.assignedDate,
        conflictingFields: ['registrationDate', 'lawyerAssignmentDate'],
      },
      sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
      detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
    });
  }

  // 1.4 Last activity before filing date
  if (filingDateNorm && lastActDateNorm && lastActDateNorm < filingDateNorm) {
    issues.push({
      id: `chron-lastact-before-f-${c.id}`,
      caseId: c.id,
      caseNumber: c.caseNumber,
      category: 'CHRONOLOGY_CONFLICT',
      categoryBn: CATEGORY_LABELS.CHRONOLOGY_CONFLICT.bn,
      severity: 'HIGH',
      severityBn: 'উচ্চ',
      title: 'দাখিলের পূর্বে সর্বশেষ কার্যক্রম',
      explanation: `মামলার সর্বশেষ কার্যক্রমের তারিখ (${c.lastActivityDate}) দাখিলের তারিখের (${c.filingDate || c.applicationDate}) পূর্বে লিপিবদ্ধ রয়েছে।`,
      recommendedAction: 'উৎস নথি যাচাই করুন',
      sourceDates: {
        filingDate: c.filingDate || c.applicationDate,
        lastActivityDate: c.lastActivityDate,
        conflictingFields: ['filingDate', 'lastActivityDate'],
      },
      sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
      detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
    });
  }

  // 1.5 SLA Target date before filing date
  if (filingDateNorm && slaTargetNorm && slaTargetNorm < filingDateNorm) {
    issues.push({
      id: `chron-sla-before-f-${c.id}`,
      caseId: c.id,
      caseNumber: c.caseNumber,
      category: 'CHRONOLOGY_CONFLICT',
      categoryBn: CATEGORY_LABELS.CHRONOLOGY_CONFLICT.bn,
      severity: 'HIGH',
      severityBn: 'উচ্চ',
      title: 'এসএলএ নিষ্পত্তির লক্ষ্যমাত্রা দাখিলের পূর্ববর্তী',
      explanation: `এসএলএ সময়সীমার লক্ষ্যমাত্রা (${c.slaTargetDate}) মামলা দাখিলের (${c.filingDate || c.applicationDate}) পূর্ববর্তী তারিখে নির্ধারিত।`,
      recommendedAction: 'উৎস নথি যাচাই করুন',
      sourceDates: {
        filingDate: c.filingDate || c.applicationDate,
        slaDueDate: c.slaTargetDate,
        conflictingFields: ['filingDate', 'slaTargetDate'],
      },
      sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
      detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
    });
  }

  // 1.6 Sequential hearings inconsistency
  if (c.hearings && c.hearings.length > 1) {
    for (let i = 1; i < c.hearings.length; i++) {
      const prevH = c.hearings[i - 1];
      const currH = c.hearings[i];
      const prevNorm = normalizeDateStr(prevH.isoDate || prevH.date);
      const currNorm = normalizeDateStr(currH.isoDate || currH.date);
      if (prevNorm && currNorm && currNorm <= prevNorm) {
        issues.push({
          id: `chron-seq-hearing-${c.id}-${currH.id}`,
          caseId: c.id,
          caseNumber: c.caseNumber,
          category: 'CHRONOLOGY_CONFLICT',
          categoryBn: CATEGORY_LABELS.CHRONOLOGY_CONFLICT.bn,
          severity: 'HIGH',
          severityBn: 'উচ্চ',
          title: 'শুনানির ধারাবাহিকতায় অসঙ্গতি',
          explanation: `পরবর্তী শুনানির তারিখ (${currH.date}) পূর্ববর্তী শুনানির তারিখের (${prevH.date}) সমান বা পূর্বে লিপিবদ্ধ।`,
          recommendedAction: 'উৎস নথি যাচাই করুন',
          sourceDates: {
            hearingDate: currH.date,
            conflictingFields: ['hearingSequence'],
          },
          sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
          detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
        });
      }
    }
  }

  // 2. MISSING DATA CHECKS
  if (!c.applicant || !c.applicant.name || c.applicant.name.trim() === '') {
    issues.push({
      id: `miss-app-name-${c.id}`,
      caseId: c.id,
      caseNumber: c.caseNumber,
      category: 'MISSING_DATA',
      categoryBn: CATEGORY_LABELS.MISSING_DATA.bn,
      severity: 'CRITICAL',
      severityBn: 'জরুরি',
      title: 'আবেদনকারীর নাম অনুপস্থিত',
      explanation: 'মামলার ফাইলে আবেদনকারীর পূর্ণ নাম পাওয়া যায়নি।',
      recommendedAction: 'আবেদনপত্রের তথ্য হালনাগাদ করুন',
      sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
      detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
    });
  }

  if (c.status === 'DISPOSED' && (!c.disposalDate || !c.disposalReason)) {
    issues.push({
      id: `miss-disposal-info-${c.id}`,
      caseId: c.id,
      caseNumber: c.caseNumber,
      category: 'MISSING_DATA',
      categoryBn: CATEGORY_LABELS.MISSING_DATA.bn,
      severity: 'HIGH',
      severityBn: 'উচ্চ',
      title: 'নিষ্পত্তির তারিখ বা কারণ অনুপস্থিত',
      explanation: 'মামলাটি নিষ্পত্তিকৃত হিসেবে চিহ্নিত কিন্তু নিষ্পত্তির তারিখ বা আইনি কারণ উল্লেখিত নেই।',
      recommendedAction: 'উৎস নথি যাচাই করুন',
      sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
      detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
    });
  }

  // 3. INVALID STATUS / IMPOSSIBLE LIFECYCLE PROGRESSION
  if ((c.status === 'IN_PROGRESS' || c.status === 'HEARING_ONGOING') && !c.assignedLawyerId && !c.assignedLawyerName) {
    issues.push({
      id: `inv-status-no-lawyer-${c.id}`,
      caseId: c.id,
      caseNumber: c.caseNumber,
      category: 'INVALID_STATUS',
      categoryBn: CATEGORY_LABELS.INVALID_STATUS.bn,
      severity: 'HIGH',
      severityBn: 'উচ্চ',
      title: 'আইনজীবী ব্যতিরেকে চলমান বা শুনানি অবস্থা',
      explanation: `মামলার অবস্থা '${c.status}' নির্দেশিত, কিন্তু কোনো প্যানেল আইনজীবী নিয়োগ সম্পন্ন হয়নি।`,
      recommendedAction: 'আইনজীবী নিয়োগ নিশ্চিত করুন অথবা অবস্থা হালনাগাদ করুন',
      sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
      detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
    });
  }

  // 4. INVALID DISTRICT / COURT RELATIONSHIP
  if (c.district && c.upazila) {
    const isValidDistrictRel = validateDistrictRelationship(c.district, c.upazila);
    if (!isValidDistrictRel) {
      issues.push({
        id: `inv-district-rel-${c.id}`,
        caseId: c.id,
        caseNumber: c.caseNumber,
        category: 'INVALID_DISTRICT_COURT',
        categoryBn: CATEGORY_LABELS.INVALID_DISTRICT_COURT.bn,
        severity: 'HIGH',
        severityBn: 'উচ্চ',
        title: 'ভৌগোলিক এখতিয়ারে অসংগতি',
        explanation: `জেলা (${c.district}) এবং উপজেলার (${c.upazila}) মধ্যে ভৌগোলিক বা প্রশাসনিক মিল নেই।`,
        recommendedAction: 'আদালতের ভৌগোলিক এক্তিয়ার নিশ্চিত করুন',
        sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
        detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
      });
    }
  }

  return issues;
}

/**
 * Complete audit across the entire active dataset
 */
export function auditDatasetConsistency(
  cases: LegalAidCase[],
  lawyers: PanelLawyer[] = []
): DatasetConsistencyAuditResult {
  const issuesByCaseId: Record<string, CaseConsistencyIssue[]> = {};
  const allIssues: CaseConsistencyIssue[] = [];

  // Track case numbers for duplicate checks
  const caseNumberCounts = new Map<string, string[]>();
  const applicantNidCounts = new Map<string, string[]>();

  // Audit individual cases
  for (const c of cases) {
    // Audit single case
    const caseIssues = auditCaseConsistency(c, cases, lawyers);
    if (caseIssues.length > 0) {
      issuesByCaseId[c.id] = caseIssues;
      allIssues.push(...caseIssues);
    }

    // Tally case numbers
    if (c.caseNumber) {
      const existing = caseNumberCounts.get(c.caseNumber) || [];
      existing.push(c.id);
      caseNumberCounts.set(c.caseNumber, existing);
    }

    // Tally applicant NID (if not masked or if identical masked ID across distinct applicants)
    if (c.applicant?.nidMasked && c.applicant.nidMasked !== '*********0000') {
      const existing = applicantNidCounts.get(c.applicant.nidMasked) || [];
      existing.push(c.id);
      applicantNidCounts.set(c.applicant.nidMasked, existing);
    }
  }

  // Audit Duplicate Case Numbers
  for (const [caseNum, caseIds] of caseNumberCounts.entries()) {
    if (caseIds.length > 1) {
      for (const caseId of caseIds) {
        const c = cases.find((item) => item.id === caseId);
        if (c) {
          const issue: CaseConsistencyIssue = {
            id: `dup-case-${caseNum}-${caseId}`,
            caseId: c.id,
            caseNumber: c.caseNumber,
            category: 'DUPLICATE_CASE',
            categoryBn: CATEGORY_LABELS.DUPLICATE_CASE.bn,
            severity: 'CRITICAL',
            severityBn: 'জরুরি',
            title: 'ডুপ্লিকেট মামলা নম্বর',
            explanation: `মামলা নম্বর '${caseNum}' একাধিক ফাইলে (${caseIds.length} বার) ব্যবহৃত হয়েছে।`,
            recommendedAction: 'রেজিস্টার খতিয়ান সমন্বয় করুন',
            sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
            detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
          };
          if (!issuesByCaseId[c.id]) issuesByCaseId[c.id] = [];
          issuesByCaseId[c.id].push(issue);
          allIssues.push(issue);
        }
      }
    }
  }

  // Audit Duplicate Applicants across parallel active cases
  for (const [nid, caseIds] of applicantNidCounts.entries()) {
    if (caseIds.length > 2) {
      // Flag if same applicant has more than 2 parallel legal aid cases
      for (const caseId of caseIds) {
        const c = cases.find((item) => item.id === caseId);
        if (c) {
          const issue: CaseConsistencyIssue = {
            id: `dup-app-${nid}-${caseId}`,
            caseId: c.id,
            caseNumber: c.caseNumber,
            category: 'DUPLICATE_APPLICANT',
            categoryBn: CATEGORY_LABELS.DUPLICATE_APPLICANT.bn,
            severity: 'MEDIUM',
            severityBn: 'মাঝারি',
            title: 'একই আবেদনকারীর একাধিক মামলা',
            explanation: `আবেদনকারীর পরিচয়পত্রের বিপরীতে ${caseIds.length}টি সমান্তরাল মামলা রেকর্ডভুক্ত আছে।`,
            recommendedAction: 'জাতীয় পরিচয়পত্র ও মামলার ফাইল যাচাই করুন',
            sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
            detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
          };
          if (!issuesByCaseId[c.id]) issuesByCaseId[c.id] = [];
          issuesByCaseId[c.id].push(issue);
          allIssues.push(issue);
        }
      }
    }
  }

  // Audit Lawyer Workload Inconsistencies
  const overCapacityLawyerIds = new Set<string>();
  for (const l of lawyers) {
    if (l.currentActiveCases > l.maxCaseLimit) {
      overCapacityLawyerIds.add(l.id);
    }
  }

  const lawyerWorkloadAffectedCases: string[] = [];
  if (overCapacityLawyerIds.size > 0) {
    for (const c of cases) {
      if (c.assignedLawyerId && overCapacityLawyerIds.has(c.assignedLawyerId)) {
        lawyerWorkloadAffectedCases.push(c.id);
        const l = lawyers.find((item) => item.id === c.assignedLawyerId);
        const issue: CaseConsistencyIssue = {
          id: `lawyer-overload-${c.id}`,
          caseId: c.id,
          caseNumber: c.caseNumber,
          category: 'LAWYER_WORKLOAD',
          categoryBn: CATEGORY_LABELS.LAWYER_WORKLOAD.bn,
          severity: 'MEDIUM',
          severityBn: 'মাঝারি',
          title: 'আইনজীবীর কর্মভার ধারণক্ষমতা অতিক্রান্ত',
          explanation: `নিয়োগপ্রাপ্ত আইনজীবী ${l?.name || 'বিজ্ঞ প্যানেল আইনজীবী'} ধারণক্ষমতার (${l?.maxCaseLimit}টি) অতিরিক্ত (${l?.currentActiveCases}টি) মামলা পরিচালনা করছেন।`,
          recommendedAction: 'মামলা পুনর্নিয়োগের সুপারিশ বিবেচনা করুন',
          sourceUnchangedNotice: SOURCE_UNCHANGED_NOTICE,
          detectedAt: '০৯ সেপ্টেম্বর ২০২৬',
        };
        if (!issuesByCaseId[c.id]) issuesByCaseId[c.id] = [];
        issuesByCaseId[c.id].push(issue);
        allIssues.push(issue);
      }
    }
  }

  // Compile Category Summaries
  const categoriesList: ConsistencyCategory[] = [
    'CHRONOLOGY_CONFLICT',
    'MISSING_DATA',
    'DUPLICATE_CASE',
    'DUPLICATE_APPLICANT',
    'INVALID_STATUS',
    'INVALID_DATE',
    'INVALID_DISTRICT_COURT',
    'LAWYER_WORKLOAD',
  ];

  const categorySummaries: ConsistencyCategorySummary[] = categoriesList.map((cat) => {
    const matchingIssues = allIssues.filter((i) => i.category === cat);
    const affectedCaseIdSet = new Set<string>();
    matchingIssues.forEach((i) => affectedCaseIdSet.add(i.caseId));
    const info = CATEGORY_LABELS[cat];

    return {
      category: cat,
      categoryBn: info.bn,
      categoryLabel: info.bn,
      problem: info.problem,
      count: affectedCaseIdSet.size,
      severity: info.defaultSeverity,
      severityBn: info.defaultSeverity === 'CRITICAL' ? 'জরুরি' : info.defaultSeverity === 'HIGH' ? 'উচ্চ' : 'মাঝারি',
      recommendedAction: info.defaultAction,
      affectedCaseIds: Array.from(affectedCaseIdSet),
    };
  });

  // Ensure helper fields on all issues
  allIssues.forEach((issue) => {
    issue.categoryLabel = issue.categoryBn;
    if (!issue.description) issue.description = issue.title;
    if (!issue.details) issue.details = issue.explanation;
  });

  const caseIssuesMap = new Map<string, CaseConsistencyIssue[]>();
  for (const [caseId, issues] of Object.entries(issuesByCaseId)) {
    caseIssuesMap.set(caseId, issues);
  }
  const affectedCasesCount = Object.keys(issuesByCaseId).length;

  const chronologyConflictsCount = categorySummaries.find((s) => s.category === 'CHRONOLOGY_CONFLICT')?.count || 0;
  const missingDataCount = categorySummaries.find((s) => s.category === 'MISSING_DATA')?.count || 0;
  const duplicateCasesCount = categorySummaries.find((s) => s.category === 'DUPLICATE_CASE')?.count || 0;
  const duplicateApplicantsCount = categorySummaries.find((s) => s.category === 'DUPLICATE_APPLICANT')?.count || 0;
  const invalidStatusCount = categorySummaries.find((s) => s.category === 'INVALID_STATUS')?.count || 0;
  const invalidDatesCount = categorySummaries.find((s) => s.category === 'INVALID_DATE')?.count || 0;
  const invalidDistrictCourtCount = categorySummaries.find((s) => s.category === 'INVALID_DISTRICT_COURT')?.count || 0;
  const lawyerWorkloadCount = categorySummaries.find((s) => s.category === 'LAWYER_WORKLOAD')?.count || 0;

  return {
    totalIssuesCount: allIssues.length,
    affectedCasesCount,
    chronologyConflictsCount,
    missingDataCount,
    duplicateCasesCount,
    duplicateApplicantsCount,
    invalidStatusCount,
    invalidDatesCount,
    invalidDistrictCourtCount,
    lawyerWorkloadCount,
    categorySummaries,
    issuesByCaseId,
    caseIssuesMap,
    allIssues,
  };
}
