/**
 * এসএলএ পর্যবেক্ষণ ইঞ্জিন (Configurable Demo SLA Engine)
 * Strictly calculates SLA dates, consumed percentages, and statuses deterministically.
 * Label: "Demo SLA" (ডেমো এসএলএ) - not statutory deadlines.
 */

import { CaseCategory, PriorityLevel, SlaStatus } from '../types/legalAid';
import { DEMO_SNAPSHOT_DATE, addDays, daysBetween } from '../utils/dateUtils';

export interface CalculatedSlaResult {
  slaStartDate: string; // ISO YYYY-MM-DD
  configuredSlaDays: number;
  slaTargetDate: string; // ISO YYYY-MM-DD
  slaRemainingDays: number;
  slaConsumedPercentage: number;
  slaStatus: SlaStatus;
  slaStatusBn: string;
}

/**
 * Derives SLA policy days by priority and category
 */
export function getConfiguredSlaDays(
  priority: PriorityLevel = 'MEDIUM',
  category?: CaseCategory
): number {
  if (priority === 'VERY_HIGH' || category === 'WOMEN_CHILD') {
    return 15; // 15 demo days for sensitive/urgent cases
  }
  if (priority === 'HIGH' || category === 'CRIMINAL') {
    return 25;
  }
  if (priority === 'MEDIUM') {
    return 35;
  }
  return 45; // LOW priority
}

/**
 * Calculates complete SLA state for a case
 */
export function calculateCaseSla(
  registrationDate: string,
  priority: PriorityLevel = 'MEDIUM',
  category?: CaseCategory,
  caseStatus?: string,
  snapshotDate: string = DEMO_SNAPSHOT_DATE
): CalculatedSlaResult {
  const configuredSlaDays = getConfiguredSlaDays(priority, category);
  const slaStartDate = registrationDate.slice(0, 10);
  const slaTargetDate = addDays(slaStartDate, configuredSlaDays);

  const daysPassed = daysBetween(slaStartDate, snapshotDate);
  const slaRemainingDays = daysBetween(snapshotDate, slaTargetDate);
  const rawConsumed = Math.round((daysPassed / configuredSlaDays) * 100);
  const slaConsumedPercentage = Math.max(0, Math.min(100, rawConsumed));

  let slaStatus: SlaStatus = 'ON_TRACK';
  let slaStatusBn = 'সময়সীমা স্বাভাবিক (On Track)';

  if (caseStatus === 'DISPOSED' || caseStatus === 'CLOSED') {
    slaStatus = 'RESOLVED';
    slaStatusBn = 'নিষ্পত্তিকৃত (Resolved)';
  } else if (snapshotDate > slaTargetDate || slaRemainingDays < 0) {
    slaStatus = 'OVERDUE';
    slaStatusBn = 'বিলম্বিত / মেয়াদোত্তীর্ণ (Overdue)';
  } else if (slaRemainingDays <= 4 || slaConsumedPercentage >= 80) {
    slaStatus = 'AT_RISK';
    slaStatusBn = 'সময়সীমা ঝুঁকিতে (At Risk)';
  } else {
    slaStatus = 'ON_TRACK';
    slaStatusBn = 'সময়সীমা স্বাভাবিক (On Track)';
  }

  return {
    slaStartDate,
    configuredSlaDays,
    slaTargetDate,
    slaRemainingDays,
    slaConsumedPercentage,
    slaStatus,
    slaStatusBn,
  };
}
