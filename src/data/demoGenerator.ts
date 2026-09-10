/**
 * সম্পূর্ণ সিন্থেটিক ডেটাসেট জেনারেটর ও বৈধকরণ (Complete Demo Dataset Generator & Validators)
 * Orchestrates 500 cases, 25 lawyers, security events, vulnerabilities, and relational audit logs.
 */

import {
  LegalAidCase,
  PanelLawyer,
  SecurityEvent,
  VulnerabilityItem,
  AuditLogEntry,
} from '../types/legalAid';
import {
  DEFAULT_DEMO_DATA_SEED,
  PILOT_DISTRICTS,
  SeededRandom,
  TOTAL_CASES_TARGET,
  TOTAL_LAWYERS_TARGET,
} from './demoConfig';

export { DEFAULT_DEMO_DATA_SEED };
import { generateSyntheticLawyers } from './demoLawyers';
import { generateSyntheticCases } from './demoCases';
import { generateSyntheticSecurityEvents } from './demoSecurityEvents';
import { generateSyntheticVulnerabilities } from './demoVulnerabilities';
import { validateCompleteDataset, DataQualityReport } from '../services/dataQualityService';
import {
  SYSTEM_DATE,
  SYSTEM_DATE_TIME,
  DEMO_SNAPSHOT_DATE,
  isTimestampLte,
  toEnglishDigits,
} from '../utils/dateUtils';

export interface CompleteDemoDataset {
  seed: number;
  cases: LegalAidCase[];
  lawyers: PanelLawyer[];
  securityEvents: SecurityEvent[];
  vulnerabilities: VulnerabilityItem[];
  auditLogs: AuditLogEntry[];
  generatedAt: string;
  dataQualityReport: DataQualityReport;
  validationReport: {
    isValid: boolean;
    totalCases: number;
    totalLawyers: number;
    casesByDistrict: Record<string, number>;
    lawyersByDistrict: Record<string, number>;
    categoryDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
    slaBreachedCount: number;
    slaApproachingRiskCount: number;
    stuckCasesCount: number;
    overcapacityLawyersCount: number;
    messages: string[];
  };
}

/**
 * Recalculate lawyer metrics dynamically from the cases array
 */
export function recalculateLawyerWorkloads(
  lawyers: PanelLawyer[],
  cases: LegalAidCase[]
): PanelLawyer[] {
  return lawyers.map((lawyer) => {
    const assignedCases = cases.filter((c) => c.assignedLawyerId === lawyer.id);
    const activeCases = assignedCases.filter((c) => c.status !== 'DISPOSED');
    const disposedCases = assignedCases.filter((c) => c.status === 'DISPOSED');

    const highPriorityCases = activeCases.filter(
      (c) =>
        c.priorityAssessment.calculatedPriority === 'VERY_HIGH' ||
        c.priorityAssessment.calculatedPriority === 'HIGH'
    ).length;

    const upcomingHearings = activeCases.filter((c) => Boolean(c.nextHearingDate)).length;
    const overdueTasks = activeCases.filter(
      (c) => c.slaStatus === 'BREACHED' || c.deadlines.some((d) => d.status === 'OVERDUE')
    ).length;

    const workloadPercentage = Math.round((activeCases.length / lawyer.maxCaseLimit) * 100);
    const isOver = workloadPercentage >= 100;

    let capacityStatus: 'UNDER_CAPACITY' | 'NORMAL' | 'NEAR_CAPACITY' | 'OVER_CAPACITY' = 'NORMAL';
    if (workloadPercentage >= 100) {
      capacityStatus = 'OVER_CAPACITY';
    } else if (workloadPercentage >= 85) {
      capacityStatus = 'NEAR_CAPACITY';
    } else if (workloadPercentage < 60) {
      capacityStatus = 'UNDER_CAPACITY';
    } else {
      capacityStatus = 'NORMAL';
    }

    return {
      ...lawyer,
      currentActiveCases: activeCases.length,
      disposedCasesCount: lawyer.disposedCasesCount + disposedCases.length,
      highPriorityCases,
      upcomingHearings,
      overdueTasks,
      workloadPercentage,
      capacity: lawyer.maxCaseLimit,
      capacityStatus,
      availability: isOver ? 'BUSY' : 'AVAILABLE',
      status: isOver ? 'BUSY' : 'ACTIVE',
    };
  });
}

/**
 * Generate synthetic Audit Trail entries linked to cases, lawyers, and security events
 */
export function generateSyntheticAuditLogs(
  rng: SeededRandom,
  cases: LegalAidCase[],
  lawyers: PanelLawyer[],
  securityEvents: SecurityEvent[]
): AuditLogEntry[] {
  const auditLogs: AuditLogEntry[] = [];

  // Seed events from security events
  securityEvents.slice(0, 25).forEach((sec, idx) => {
    auditLogs.push({
      id: `AUDIT-DEMO-SEC-${String(idx + 1).padStart(4, '0')}`,
      timestamp: sec.timestamp,
      user: sec.user,
      role: sec.role,
      action: sec.title,
      eventType: sec.blocked ? 'ACCESS_DENIED' : 'DOCUMENT_VIEWED',
      resourceType: 'নিরাপত্তা',
      resourceId: sec.caseId || sec.id,
      outcome: sec.blocked ? 'ব্লক করা হয়েছে' : 'সফল',
      reason: sec.reason,
      correlationId: sec.correlationId,
      ipAddress: `192.168.10.${rng.nextInt(15, 250)}`,
      districtScope: 'জাতীয় নিরাপত্তা অপারেশন সেল',
      details: sec.description,
    });
  });

  // Helper to generate a valid chronological timestamp string strictly <= SYSTEM_DATE_TIME
  const makeValidTimestamp = (isoDate: string, minHour: number = 9, maxHour: number = 16): string => {
    const cleanDate = isoDate.slice(0, 10);
    let hour = rng.nextInt(minHour, maxHour);
    let minute = rng.nextInt(10, 50);

    // If on SYSTEM_DATE, time must be strictly before 10:15:00
    if (cleanDate === SYSTEM_DATE) {
      hour = rng.nextInt(8, 9); // 08:xx or 09:xx
      minute = rng.nextInt(10, 55);
    } else if (cleanDate > SYSTEM_DATE) {
      // Historical event cannot be in future! Clamp to past
      return `২০২৬-০৯-০৮ ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    const [y, m, d] = cleanDate.split('-');
    return `${y}-${m}-${d} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // Sample case workflow audits strictly following case milestones
  cases.slice(0, 45).forEach((c, idx) => {
    // Milestone 1: Application Filing
    if (c.filingDate && c.filingDate <= SYSTEM_DATE) {
      auditLogs.push({
        id: `AUDIT-DEMO-FILE-${String(idx + 1).padStart(4, '0')}`,
        timestamp: makeValidTimestamp(c.filingDate, 9, 11),
        user: 'নাগরিক সেবা ডেস্ক',
        role: 'ASSISTANT_OFFICER',
        action: 'আবেদন দাখিল ও প্রাথমিক তথ্য গ্রহণ',
        eventType: 'CASE_CREATED',
        resourceType: 'মামলা',
        resourceId: c.id,
        outcome: 'সফল',
        reason: 'নাগরিকের আবেদনপত্র ও প্রাথমিক আর্থিক বিবরণী অন্তর্ভুক্ত',
        correlationId: `corr-file-${rng.nextInt(100000, 999999)}`,
        ipAddress: `10.0.4.${rng.nextInt(10, 90)}`,
        districtScope: c.district,
        details: `মামলা নং: ${c.caseNumber} - আবেদনকারী: ${c.applicantName}`,
      });
    }

    // Milestone 2: Case Registration
    if (c.registrationDate && c.registrationDate <= SYSTEM_DATE) {
      auditLogs.push({
        id: `AUDIT-DEMO-REG-${String(idx + 1).padStart(4, '0')}`,
        timestamp: makeValidTimestamp(c.registrationDate, 11, 13),
        user: c.assignedOfficerName,
        role: 'DISTRICT_OFFICER',
        action: 'মামলা নিবন্ধন ও যোগ্যতা যাচাই সম্পন্ন',
        eventType: 'CASE_UPDATED',
        resourceType: 'মামলা',
        resourceId: c.id,
        outcome: 'সফল',
        reason: 'আইনি সহায়তা বিধিমালা মোতাবেক প্রাপ্যতা যাচাই ও নিবন্ধন',
        correlationId: `corr-reg-${rng.nextInt(100000, 999999)}`,
        ipAddress: `10.0.4.${rng.nextInt(10, 90)}`,
        districtScope: c.district,
        details: `মামলা নং: ${c.caseNumber} - ক্যাটাগরি: ${c.category}`,
      });
    }

    // Milestone 3: Lawyer Assignment (if assigned)
    if (c.lawyerAssignmentDate && c.lawyerAssignmentDate <= SYSTEM_DATE && c.assignedLawyerName) {
      auditLogs.push({
        id: `AUDIT-DEMO-LAW-${String(idx + 1).padStart(4, '0')}`,
        timestamp: makeValidTimestamp(c.lawyerAssignmentDate, 14, 16),
        user: c.assignedOfficerName,
        role: 'DISTRICT_OFFICER',
        action: `প্যানেল আইনজীবী নিয়োগ অনুমোদন (${c.assignedLawyerName})`,
        eventType: 'LAWYER_ASSIGNED',
        resourceType: 'মামলা',
        resourceId: c.id,
        outcome: 'সফল',
        reason: 'বিশেষায়িত অভিজ্ঞতা ও কার্যভার সক্ষমতার ভিত্তিতে নিয়োগ',
        correlationId: `corr-law-${rng.nextInt(100000, 999999)}`,
        ipAddress: `10.0.4.${rng.nextInt(10, 90)}`,
        districtScope: c.district,
        details: `আইনজীবী: ${c.assignedLawyerName} - মামলা নং: ${c.caseNumber}`,
      });
    }

    // Milestone 4: Completed Hearings
    c.hearings.forEach((h, hIdx) => {
      if (h.status === 'COMPLETED' && h.isoDate && h.isoDate <= SYSTEM_DATE) {
        auditLogs.push({
          id: `AUDIT-DEMO-HR-${String(idx + 1).padStart(3, '0')}-${hIdx + 1}`,
          timestamp: makeValidTimestamp(h.isoDate, 10, 15),
          user: c.assignedLawyerName || 'বিজ্ঞ প্যানেল আইনজীবী',
          role: 'PANEL_LAWYER',
          action: `আদালতে শুনানি সম্পন্নকরণ (${h.courtName})`,
          eventType: 'CASE_UPDATED',
          resourceType: 'মামলা',
          resourceId: h.id,
          outcome: 'সফল',
          reason: h.purpose,
          correlationId: `corr-hr-${rng.nextInt(100000, 999999)}`,
          ipAddress: `10.0.4.${rng.nextInt(10, 90)}`,
          districtScope: c.district,
          details: `আদালত: ${h.courtName} - উদ্দেশ্য: ${h.purpose}`,
        });
      }
    });

    // Milestone 5: Case Disposal (if disposed)
    if (c.disposalDate && c.disposalDate <= SYSTEM_DATE) {
      auditLogs.push({
        id: `AUDIT-DEMO-DISP-${String(idx + 1).padStart(4, '0')}`,
        timestamp: makeValidTimestamp(c.disposalDate, 14, 16),
        user: c.assignedOfficerName,
        role: 'DISTRICT_OFFICER',
        action: 'মামলা নিষ্পত্তি ও নথি সমাপ্তি',
        eventType: 'CASE_UPDATED',
        resourceType: 'মামলা',
        resourceId: c.id,
        outcome: 'সফল',
        reason: c.disposalReason || 'আদালতের মাধ্যমে চূড়ান্ত নিষ্পত্তি',
        correlationId: `corr-disp-${rng.nextInt(100000, 999999)}`,
        ipAddress: `10.0.4.${rng.nextInt(10, 90)}`,
        districtScope: c.district,
        details: `মামলা নং: ${c.caseNumber} - সমাপ্তির কারণ: ${c.disposalReason || 'নিষ্পত্তি'}`,
      });
    }
  });

  // Strict acceptance filter: ensure every audit event timestamp is <= SYSTEM_DATE_TIME
  const filtered = auditLogs.filter((log) => isTimestampLte(log.timestamp, SYSTEM_DATE_TIME));

  return filtered.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

/**
 * Validates the case dataset strictly against rules
 */
export function validateCaseDataset(cases: LegalAidCase[]): { isValid: boolean; messages: string[] } {
  const messages: string[] = [];

  if (cases.length !== TOTAL_CASES_TARGET) {
    messages.push(`Expected exactly ${TOTAL_CASES_TARGET} cases, found ${cases.length}.`);
  }

  // Check pilot districts
  for (const pilot of PILOT_DISTRICTS) {
    const count = cases.filter((c) => c.district === pilot.districtBn).length;
    if (count !== pilot.targetCases) {
      messages.push(
        `District ${pilot.districtBn} has ${count} cases (target: ${pilot.targetCases}).`
      );
    }
  }

  // Check category bounds
  const womenCases = cases.filter(
    (c) => c.category === 'WOMEN_CHILD' || c.category === 'FAMILY'
  ).length;
  const womenRatio = (womenCases / cases.length) * 100;
  if (womenRatio < 50 || womenRatio > 65) {
    messages.push(`Women/family cases ratio is ${womenRatio.toFixed(1)}% (target: 55-60%).`);
  }

  // Check demo data tag
  const missingDemoTag = cases.filter((c) => !c.isDemoData).length;
  if (missingDemoTag > 0) {
    messages.push(`${missingDemoTag} cases are missing isDemoData: true.`);
  }

  // Check risk score range
  const invalidRisk = cases.filter(
    (c) => c.riskScore !== undefined && (c.riskScore < 0 || c.riskScore > 100)
  ).length;
  if (invalidRisk > 0) {
    messages.push(`${invalidRisk} cases have invalid risk score.`);
  }

  return {
    isValid: messages.length === 0,
    messages,
  };
}

/**
 * Validates the lawyer dataset
 */
export function validateLawyerDataset(
  lawyers: PanelLawyer[]
): { isValid: boolean; messages: string[] } {
  const messages: string[] = [];

  if (lawyers.length !== TOTAL_LAWYERS_TARGET) {
    messages.push(`Expected exactly ${TOTAL_LAWYERS_TARGET} lawyers, found ${lawyers.length}.`);
  }

  for (const pilot of PILOT_DISTRICTS) {
    const count = lawyers.filter((l) => l.district === pilot.districtBn).length;
    if (count !== pilot.targetLawyers) {
      messages.push(
        `District ${pilot.districtBn} has ${count} lawyers (target: ${pilot.targetLawyers}).`
      );
    }
  }

  return {
    isValid: messages.length === 0,
    messages,
  };
}

/**
 * Validates relational consistency
 */
export function validateRelationships(
  cases: LegalAidCase[],
  lawyers: PanelLawyer[]
): { isValid: boolean; messages: string[] } {
  const messages: string[] = [];
  const lawyerIdSet = new Set(lawyers.map((l) => l.id));

  for (const c of cases) {
    if (c.assignedLawyerId && !lawyerIdSet.has(c.assignedLawyerId)) {
      messages.push(`Case ${c.id} references non-existent lawyerId ${c.assignedLawyerId}.`);
    }
  }

  return {
    isValid: messages.length === 0,
    messages,
  };
}

/**
 * Complete Generator Entry Point
 */
export function generateCompleteDemoDataset(
  seed: number = DEFAULT_DEMO_DATA_SEED
): CompleteDemoDataset {
  const rng = new SeededRandom(seed);

  // 1. Generate base 25 lawyers across 6 pilot districts
  const initialLawyers = generateSyntheticLawyers(rng);

  // 2. Generate 500 cases adhering to exact quotas
  const cases = generateSyntheticCases(rng, initialLawyers);

  // 3. Dynamically compute lawyer workload from the generated cases
  const lawyers = recalculateLawyerWorkloads(initialLawyers, cases);

  // 4. Generate security events
  const securityEvents = generateSyntheticSecurityEvents(rng, cases, lawyers);

  // 5. Generate vulnerabilities
  const vulnerabilities = generateSyntheticVulnerabilities(rng);

  // 6. Generate audit logs
  const auditLogs = generateSyntheticAuditLogs(rng, cases, lawyers, securityEvents);

  // 7. Validate
  const caseVal = validateCaseDataset(cases);
  const lawyerVal = validateLawyerDataset(lawyers);
  const relVal = validateRelationships(cases, lawyers);

  const casesByDistrict: Record<string, number> = {};
  cases.forEach((c) => {
    casesByDistrict[c.district] = (casesByDistrict[c.district] || 0) + 1;
  });

  const lawyersByDistrict: Record<string, number> = {};
  lawyers.forEach((l) => {
    lawyersByDistrict[l.district] = (lawyersByDistrict[l.district] || 0) + 1;
  });

  const categoryDistribution: Record<string, number> = {};
  cases.forEach((c) => {
    const key = c.caseCategory || c.category;
    categoryDistribution[key] = (categoryDistribution[key] || 0) + 1;
  });

  const priorityDistribution: Record<string, number> = {};
  cases.forEach((c) => {
    const p = c.priorityAssessment.calculatedPriority;
    priorityDistribution[p] = (priorityDistribution[p] || 0) + 1;
  });

  const slaBreachedCount = cases.filter((c) => c.slaStatus === 'BREACHED').length;
  const slaApproachingRiskCount = cases.filter(
    (c) => c.slaStatus === 'APPROACHING_RISK'
  ).length;
  const stuckCasesCount = cases.filter((c) => c.daysWithoutActivity >= 14).length;
  const overcapacityLawyersCount = lawyers.filter(
    (l) => l.currentActiveCases >= l.maxCaseLimit
  ).length;

  const messages = [...caseVal.messages, ...lawyerVal.messages, ...relVal.messages];
  const dataQualityReport = validateCompleteDataset(
    cases,
    lawyers,
    securityEvents as any,
    vulnerabilities,
    auditLogs
  );

  return {
    seed,
    cases,
    lawyers,
    securityEvents,
    vulnerabilities,
    auditLogs,
    generatedAt: `${DEMO_SNAPSHOT_DATE} ০৯:০৯:০৯`,
    dataQualityReport,
    validationReport: {
      isValid: messages.length === 0,
      totalCases: cases.length,
      totalLawyers: lawyers.length,
      casesByDistrict,
      lawyersByDistrict,
      categoryDistribution,
      priorityDistribution,
      slaBreachedCount,
      slaApproachingRiskCount,
      stuckCasesCount,
      overcapacityLawyersCount,
      messages,
    },
  };
}
