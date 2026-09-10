/**
 * ডেটা গুণগত মান ও সততা যাচাই ইঞ্জিন (Data Quality & Integrity Engine)
 * Runs strict automated structural invariant checks across 500 cases, 30 lawyers,
 * security incidents, vulnerabilities, and audit trail records.
 * Target: 100% structural validity.
 */

import {
  LegalAidCase,
  PanelLawyer,
  SecurityIncident,
  VulnerabilityItem,
  AuditLogEntry,
} from '../types/legalAid';
import {
  PILOT_DISTRICTS,
  TOTAL_CASES_TARGET,
  TOTAL_LAWYERS_TARGET,
  validateDistrictRelationship,
} from '../data/demoConfig';
import {
  DEMO_SNAPSHOT_DATE,
  SYSTEM_DATE,
  SYSTEM_DATE_TIME,
  isDateLte,
  isTimestampLte,
  parseBanglaOrIsoTimestamp,
} from '../utils/dateUtils';

export interface ChronologyValidationResult {
  isValid: boolean;
  maxCompletedTimestamp: string;
  maxCompletedTimestampFormatted: string;
  violationsCount: number;
  errors: string[];
  systemDateTime: string;
  systemDate: string;
}

export interface DataQualityReport {
  dataQualityScore: number; // 0 - 100
  totalCases: number;
  totalLawyers: number;
  totalHearings: number;
  totalIncidents: number;
  totalVulnerabilities: number;
  totalAuditEvents: number;

  checks: {
    chronology: 'PASS' | 'FAIL';
    districtConsistency: 'PASS' | 'FAIL';
    referenceIntegrity: 'PASS' | 'FAIL';
    futureEventCheck: 'PASS' | 'FAIL';
    statusConsistency: 'PASS' | 'FAIL';
    slaConsistency: 'PASS' | 'FAIL';
    riskScoreBounds: 'PASS' | 'FAIL';
    categoryQuotas: 'PASS' | 'FAIL';
  };

  chronologyReport?: ChronologyValidationResult;
  validationErrors: string[];
  validationWarnings: string[];
  districtBreakdown: Record<string, { cases: number; lawyers: number; status: 'PASS' | 'FAIL' }>;
}

/**
 * Validates chronology across cases and audit log events against canonical SYSTEM_DATE_TIME.
 * Acceptance criterion: MAX(all_completed_event_timestamps) <= SYSTEM_DATE_TIME
 */
export function validateDatasetChronology(
  cases: LegalAidCase[],
  auditLogs: AuditLogEntry[],
  systemDateTime: string = SYSTEM_DATE_TIME
): ChronologyValidationResult {
  const errors: string[] = [];
  let maxTs = '';
  const systemDate = systemDateTime.slice(0, 10);

  // 1. Audit trail completed events
  for (const log of auditLogs) {
    const rawTs = log.isoTimestamp || log.timestamp;
    const normTs = parseBanglaOrIsoTimestamp(rawTs);

    if (normTs) {
      if (!maxTs || normTs > maxTs) {
        maxTs = normTs;
      }
      if (normTs > systemDateTime) {
        errors.push(
          `অডিট ট্রেইল কালানুক্রম লঙ্ঘন: ইভেন্ট [${log.id}] এর টাইমস্ট্যাম্প (${rawTs} -> ${normTs}) সিস্টেম ক্লক (${systemDateTime})-এর পরে।`
        );
      }
    }
  }

  // 2. Case completed events and timeline records
  for (const c of cases) {
    // Milestones
    if (c.filingDate && c.filingDate > systemDate) {
      errors.push(`কেস ফাইলিং তারিখ লঙ্ঘন: মামলা ${c.caseNumber} এর ফাইলিং তারিখ (${c.filingDate}) সিস্টেম তারিখের (${systemDate}) পরে।`);
    }
    if (c.registrationDate && c.registrationDate > systemDate) {
      errors.push(`কেস নিবন্ধন তারিখ লঙ্ঘন: মামলা ${c.caseNumber} এর নিবন্ধন তারিখ (${c.registrationDate}) সিস্টেম তারিখের (${systemDate}) পরে।`);
    }
    if (c.lawyerAssignmentDate && c.lawyerAssignmentDate > systemDate) {
      errors.push(`আইনজীবী নিয়োগ তারিখ লঙ্ঘন: মামলা ${c.caseNumber} এর নিয়োগ তারিখ (${c.lawyerAssignmentDate}) সিস্টেম তারিখের (${systemDate}) পরে।`);
    }
    if (c.status === 'DISPOSED' && c.disposalDate && c.disposalDate > systemDate) {
      errors.push(`কেস নিষ্পত্তি তারিখ লঙ্ঘন: মামলা ${c.caseNumber} এর নিষ্পত্তি তারিখ (${c.disposalDate}) সিস্টেম তারিখের (${systemDate}) পরে।`);
    }

    // Milestone progression: filingDate <= registrationDate <= lawyerAssignmentDate
    if (c.filingDate && c.registrationDate && c.filingDate > c.registrationDate) {
      errors.push(`কেস অগ্রগতি অসঙ্গতি: মামলা ${c.caseNumber}-এ দাখিলের তারিখ (${c.filingDate}) নিবন্ধনের (${c.registrationDate}) পরে।`);
    }
    if (c.registrationDate && c.lawyerAssignmentDate && c.registrationDate > c.lawyerAssignmentDate) {
      errors.push(`কেস অগ্রগতি অসঙ্গতি: মামলা ${c.caseNumber}-এ নিবন্ধনের তারিখ (${c.registrationDate}) আইনজীবী নিয়োগের (${c.lawyerAssignmentDate}) পরে।`);
    }

    // Completed hearings
    for (const h of c.hearings) {
      const hDate = (h.isoDate || h.date).slice(0, 10);
      if (h.status === 'COMPLETED' && hDate > systemDate) {
        errors.push(`শুনানি সমাপ্তি লঙ্ঘন: মামলা ${c.caseNumber} এর সম্পন্ন শুনানি (${hDate}) সিস্টেম তারিখের (${systemDate}) পরে।`);
      }
    }

    // Official timeline events
    if (c.timeline) {
      for (const tl of c.timeline) {
        let tlDate = tl.isoDate ? tl.isoDate.slice(0, 10) : '';
        if (!tlDate && tl.date) {
          const parsed = parseBanglaOrIsoTimestamp(tl.date);
          if (parsed) tlDate = parsed.slice(0, 10);
        }
        if (tl.isOfficialRecord && tlDate && tlDate > systemDate) {
          errors.push(`টাইমলাইন ইভেন্ট লঙ্ঘন: মামলা ${c.caseNumber} এর ইভেন্ট (${tlDate}) সিস্টেম তারিখের (${systemDate}) পরে।`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    maxCompletedTimestamp: maxTs,
    maxCompletedTimestampFormatted: maxTs,
    violationsCount: errors.length,
    errors,
    systemDateTime,
    systemDate,
  };
}

export function validateCompleteDataset(
  cases: LegalAidCase[],
  lawyers: PanelLawyer[],
  incidents: SecurityIncident[] = [],
  vulnerabilities: VulnerabilityItem[] = [],
  auditLogs: AuditLogEntry[] = [],
  snapshotDate: string = DEMO_SNAPSHOT_DATE
): DataQualityReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  const checks = {
    chronology: 'PASS' as 'PASS' | 'FAIL',
    districtConsistency: 'PASS' as 'PASS' | 'FAIL',
    referenceIntegrity: 'PASS' as 'PASS' | 'FAIL',
    futureEventCheck: 'PASS' as 'PASS' | 'FAIL',
    statusConsistency: 'PASS' as 'PASS' | 'FAIL',
    slaConsistency: 'PASS' as 'PASS' | 'FAIL',
    riskScoreBounds: 'PASS' as 'PASS' | 'FAIL',
    categoryQuotas: 'PASS' as 'PASS' | 'FAIL',
  };

  // 1. Case Count & Lawyer Count
  if (cases.length !== TOTAL_CASES_TARGET) {
    errors.push(`মামলার সংখ্যা ত্রুটি: প্রত্যাশিত ${TOTAL_CASES_TARGET}, প্রাপ্ত ${cases.length}।`);
  }
  if (lawyers.length !== TOTAL_LAWYERS_TARGET) {
    errors.push(`আইনজীবীর সংখ্যা ত্রুটি: প্রত্যাশিত ${TOTAL_LAWYERS_TARGET}, প্রাপ্ত ${lawyers.length}।`);
  }

  // 2. Uniqueness of IDs
  const caseIdSet = new Set<string>();
  for (const c of cases) {
    if (caseIdSet.has(c.id)) {
      errors.push(`ডুপ্লিকেট মামলা আইডি: ${c.id}`);
      checks.referenceIntegrity = 'FAIL';
    }
    caseIdSet.add(c.id);
  }

  const lawyerIdSet = new Set<string>();
  for (const l of lawyers) {
    if (lawyerIdSet.has(l.id)) {
      errors.push(`ডুপ্লিকেট আইনজীবী আইডি: ${l.id}`);
      checks.referenceIntegrity = 'FAIL';
    }
    lawyerIdSet.add(l.id);
  }

  // 3. District and Upazila Consistency
  const districtBreakdown: Record<string, { cases: number; lawyers: number; status: 'PASS' | 'FAIL' }> = {};
  for (const pilot of PILOT_DISTRICTS) {
    districtBreakdown[pilot.districtBn] = { cases: 0, lawyers: 0, status: 'PASS' };
  }

  for (const c of cases) {
    if (!validateDistrictRelationship(c.district, c.upazila)) {
      errors.push(`ভুল জেলা/উপজেলা সম্পর্ক: মামলা ${c.caseNumber} (জেলা: ${c.district}, উপজেলা: ${c.upazila})`);
      checks.districtConsistency = 'FAIL';
    }
    if (districtBreakdown[c.district]) {
      districtBreakdown[c.district].cases++;
    }
  }

  for (const l of lawyers) {
    if (districtBreakdown[l.district]) {
      districtBreakdown[l.district].lawyers++;
    }
  }

  // 4. Chronology & Future Event Invariants
  let totalHearings = 0;
  for (const c of cases) {
    totalHearings += c.hearings.length;

    // filingDate <= registrationDate
    if (c.filingDate && c.registrationDate && !isDateLte(c.filingDate, c.registrationDate)) {
      errors.push(`কালানুক্রম ত্রুটি: মামলা ${c.caseNumber}-এ দাখিলের তারিখ (${c.filingDate}) নিবন্ধনের (${c.registrationDate}) পরে।`);
      checks.chronology = 'FAIL';
    }

    // registrationDate <= lawyerAssignmentDate
    if (c.registrationDate && c.lawyerAssignmentDate && !isDateLte(c.registrationDate, c.lawyerAssignmentDate)) {
      errors.push(`কালানুক্রম ত্রুটি: মামলা ${c.caseNumber}-এ নিবন্ধনের তারিখ (${c.registrationDate}) আইনজীবী নিয়োগের (${c.lawyerAssignmentDate}) পরে।`);
      checks.chronology = 'FAIL';
    }

    // Historical events cannot be in the future relative to snapshot
    if (c.filingDate && !isDateLte(c.filingDate, snapshotDate)) {
      errors.push(`ভবিষ্যত তারিখ ত্রুটি: মামলা ${c.caseNumber}-এর দাখিলের তারিখ (${c.filingDate}) স্ন্যাপশট তারিখের (${snapshotDate}) পরে।`);
      checks.futureEventCheck = 'FAIL';
    }
    if (c.registrationDate && !isDateLte(c.registrationDate, snapshotDate)) {
      errors.push(`ভবিষ্যত তারিখ ত্রুটি: মামলা ${c.caseNumber}-এর নিবন্ধনের তারিখ (${c.registrationDate}) স্ন্যাপশট তারিখের (${snapshotDate}) পরে।`);
      checks.futureEventCheck = 'FAIL';
    }
    if (c.lastActivityDate && !isDateLte(c.lastActivityDate, snapshotDate)) {
      errors.push(`ভবিষ্যত তারিখ ত্রুটি: মামলা ${c.caseNumber}-এর সর্বশেষ কার্যক্রম (${c.lastActivityDate}) স্ন্যাপশটের পরে।`);
      checks.futureEventCheck = 'FAIL';
    }

    // Hearings chronology
    let prevHearingDate = '';
    for (const h of c.hearings) {
      const hDate = h.isoDate || (h.date.length === 10 ? h.date : '');
      if (hDate) {
        // Hearing before registration
        if (c.registrationDate && hDate < c.registrationDate.slice(0, 10)) {
          errors.push(`শুনানি ত্রুটি: মামলা ${c.caseNumber}-এ শুনানির তারিখ (${hDate}) নিবন্ধনের (${c.registrationDate}) পূর্বে।`);
          checks.chronology = 'FAIL';
        }

        // Sequential hearing check
        if (prevHearingDate && hDate <= prevHearingDate) {
          errors.push(`শুনানি কালানুক্রম ত্রুটি: মামলা ${c.caseNumber}-এ পরবর্তী শুনানি (${hDate}) পূর্ববর্তী শুনানির (${prevHearingDate}) সমান বা পূর্বে।`);
          checks.chronology = 'FAIL';
        }
        prevHearingDate = hDate;

        // Completed hearing must not be in future
        if (h.status === 'COMPLETED' && hDate > snapshotDate) {
          errors.push(`শুনানি অবস্থা ত্রুটি: মামলা ${c.caseNumber}-এ সমাপ্ত শুনানি (${hDate}) স্ন্যাপশটের পরে।`);
          checks.statusConsistency = 'FAIL';
        }
      }
    }

    // Disposed case checks
    if (c.status === 'DISPOSED') {
      if (!c.disposalDate) {
        errors.push(`নিষ্পত্তি ত্রুটি: মামলা ${c.caseNumber} নিষ্পত্তিকৃত কিন্তু disposalDate নেই।`);
        checks.statusConsistency = 'FAIL';
      } else if (!isDateLte(c.disposalDate, snapshotDate)) {
        errors.push(`ভবিষ্যত নিষ্পত্তি ত্রুটি: মামলা ${c.caseNumber}-এর নিষ্পত্তি তারিখ (${c.disposalDate}) স্ন্যাপশটের পরে।`);
        checks.futureEventCheck = 'FAIL';
      }
    }

    // SLA bounds
    if (c.slaRemainingDays === undefined || isNaN(c.slaRemainingDays)) {
      errors.push(`এসএলএ ত্রুটি: মামলা ${c.caseNumber}-এ slaRemainingDays অনুপস্থিত।`);
      checks.slaConsistency = 'FAIL';
    }

    // Risk bounds (20 - 99)
    if (c.riskScore < 20 || c.riskScore > 99) {
      errors.push(`ঝুঁকি স্কোর সীমা লঙ্ঘন: মামলা ${c.caseNumber}-এর স্কোর ${c.riskScore} (অনুমোদিত ২০-৯৯)।`);
      checks.riskScoreBounds = 'FAIL';
    }

    // Lawyer Reference integrity
    if (c.assignedLawyerId && !lawyerIdSet.has(c.assignedLawyerId)) {
      errors.push(`আইনজীবী রেফারেন্স ত্রুটি: মামলা ${c.caseNumber} অস্তিত্বহীন আইনজীবী (${c.assignedLawyerId}) নির্দেশ করছে।`);
      checks.referenceIntegrity = 'FAIL';
    }
  }

  // 5. Incident & Vulnerability Reference Integrity
  const vulnIdSet = new Set(vulnerabilities.map((v) => v.id));
  for (const inc of incidents) {
    if (inc.vulnerabilityId && !vulnIdSet.has(inc.vulnerabilityId)) {
      warnings.push(`নিরাপত্তা ঘটনা ${inc.incidentNumber} অনথিভুক্ত দুর্বলতা আইডি (${inc.vulnerabilityId}) নির্দেশ করছে।`);
    }
  }

  // 6. Category distribution target (55-60% women/family)
  const womenFamilyCount = cases.filter(
    (c) => c.category === 'WOMEN_CHILD' || c.category === 'FAMILY'
  ).length;
  const womenRatio = (womenFamilyCount / cases.length) * 100;
  if (womenRatio < 52 || womenRatio > 65) {
    warnings.push(`নারী ও পরিবার ক্যাটাগরি কোটা ${womenRatio.toFixed(1)}% (লক্ষ্যমাত্রা: ৫৫-৬০%)।`);
  }

  // 7. Chronology verification & acceptance check: MAX(all_completed_event_timestamps) <= SYSTEM_DATE_TIME
  const chronologyReport = validateDatasetChronology(cases, auditLogs, SYSTEM_DATE_TIME);
  if (!chronologyReport.isValid) {
    checks.chronology = 'FAIL';
    errors.push(...chronologyReport.errors);
  }

  const dataQualityScore = errors.length === 0 ? 100 : Math.max(0, 100 - errors.length * 5);

  return {
    dataQualityScore,
    totalCases: cases.length,
    totalLawyers: lawyers.length,
    totalHearings,
    totalIncidents: incidents.length,
    totalVulnerabilities: vulnerabilities.length,
    totalAuditEvents: auditLogs.length,
    checks,
    chronologyReport,
    validationErrors: errors,
    validationWarnings: warnings,
    districtBreakdown,
  };
}
