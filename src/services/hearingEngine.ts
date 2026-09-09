/**
 * শুনানি দিনপঞ্জি ও ব্যবস্থাপনা ইঞ্জিন (Hearing Engine & Lifecycle)
 * Enforces temporal invariants, derives hearing statuses, and provides reschedule verification.
 */

import { HearingRecord, HearingStatus } from '../types/legalAid';
import { DEMO_SNAPSHOT_DATE, formatDateBn, isDateLte } from '../utils/dateUtils';

export function deriveHearingStatus(
  isoDate: string,
  snapshotDate: string = DEMO_SNAPSHOT_DATE
): { status: HearingStatus; statusBn: string } {
  const cleanDate = isoDate.slice(0, 10);
  if (cleanDate === snapshotDate) {
    return {
      status: 'TODAY',
      statusBn: 'আজকের শুনানি',
    };
  }
  if (cleanDate < snapshotDate) {
    return {
      status: 'COMPLETED',
      statusBn: 'সম্পন্ন শুনানি',
    };
  }
  return {
    status: 'UPCOMING',
    statusBn: 'পরবর্তী নির্ধারিত শুনানি',
  };
}

export interface RescheduleHearingInput {
  hearingId: string;
  newIsoDate: string;
  reason: string;
  courtName: string;
  benchCourtNumber: string;
  officerName: string;
}

export function validateHearingReschedule(
  existingHearing: HearingRecord,
  newIsoDate: string,
  registrationDate?: string,
  previousHearingDate?: string
): { isValid: boolean; errorMessage?: string } {
  const cleanNew = newIsoDate.slice(0, 10);

  if (registrationDate && cleanNew < registrationDate.slice(0, 10)) {
    return {
      isValid: false,
      errorMessage: `শুনানির নতুন তারিখ (${formatDateBn(cleanNew)}) মামলার নিবন্ধন তারিখের (${formatDateBn(registrationDate)}) পূর্বে হতে পারে না।`,
    };
  }

  if (previousHearingDate && cleanNew <= previousHearingDate.slice(0, 10)) {
    return {
      isValid: false,
      errorMessage: `শুনানির নতুন তারিখ (${formatDateBn(cleanNew)}) পূর্ববর্তী শুনানির তারিখের (${formatDateBn(previousHearingDate)}) পরে হতে হবে।`,
    };
  }

  return { isValid: true };
}
