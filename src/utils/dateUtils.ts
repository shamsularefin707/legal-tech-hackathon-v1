/**
 * তারিখ ও সময় ব্যবস্থাপনা ইউটিলিটি (Date & Time Engine for Demo Snapshot 2026-09-09)
 * All timeline logic strictly enforces invariant checks relative to DEMO_SNAPSHOT_DATE.
 */

export const SYSTEM_DATE = '2026-09-09';
export const SYSTEM_DATE_TIME = '2026-09-09T10:15:00';
export const DEMO_SNAPSHOT_DATE = SYSTEM_DATE;
export const DEMO_DATA_SEED = 20260909;

export const DEMO_CLOCK_DISPLAY_BN = '০৯ সেপ্টেম্বর ২০২৬, ১০:১৫ পূর্বাহ্ণ';
export const DEMO_CLOCK_DISPLAY_EN = '09 September 2026, 10:15 AM';

const BN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBanglaDigits(num: number | string): string {
  return String(num).replace(/[0-9]/g, (d) => BN_DIGITS[parseInt(d, 10)]);
}

export function toEnglishDigits(str: string): string {
  const map: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return str.replace(/[০-৯]/g, (d) => map[d] || d);
}

/**
 * Parses YYYY-MM-DD to Date object at UTC midnight to avoid timezone shifts
 */
export function parseIsoDate(isoDate: string): Date {
  const parts = isoDate.split('-').map((p) => parseInt(p, 10));
  if (parts.length === 3) {
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  }
  return new Date(isoDate);
}

/**
 * Formats Date to YYYY-MM-DD
 */
export function formatToIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Add or subtract days from an ISO date string
 */
export function addDays(isoDate: string, days: number): string {
  const d = parseIsoDate(isoDate);
  d.setUTCDate(d.getUTCDate() + days);
  return formatToIsoDate(d);
}

/**
 * Calculates number of calendar days between two ISO dates (later - earlier)
 */
export function daysBetween(earlierIso: string, laterIso: string): number {
  const d1 = parseIsoDate(earlierIso);
  const d2 = parseIsoDate(laterIso);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats ISO date (e.g. 2026-08-14) to Bangla readable string (১৪ আগস্ট ২০২৬)
 */
export function formatDateBn(isoDate?: string | null): string {
  if (!isoDate) return 'অনির্ধারিত';
  // If already in Bengali format (contains Bengali month), return as is
  if (BN_MONTHS.some((m) => isoDate.includes(m))) {
    return isoDate;
  }
  try {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const monthBn = BN_MONTHS[m - 1] || '';
      return `${toBanglaDigits(String(d).padStart(2, '0'))} ${monthBn} ${toBanglaDigits(y)}`;
    }
  } catch {
    // fallback
  }
  return isoDate;
}

/**
 * Check if dateA is less than or equal to dateB (YYYY-MM-DD comparison)
 */
export function isDateLte(dateA?: string, dateB?: string): boolean {
  if (!dateA || !dateB) return true;
  return dateA.slice(0, 10) <= dateB.slice(0, 10);
}

/**
 * Check if dateA is strictly less than dateB (YYYY-MM-DD comparison)
 */
export function isDateLt(dateA?: string, dateB?: string): boolean {
  if (!dateA || !dateB) return true;
  return dateA.slice(0, 10) < dateB.slice(0, 10);
}

/**
 * Verifies that a sequence of defined dates is strictly non-decreasing
 */
export function verifyChronologySequence(dates: (string | undefined | null)[]): boolean {
  const filtered = dates.filter(Boolean) as string[];
  for (let i = 0; i < filtered.length - 1; i++) {
    if (!isDateLte(filtered[i], filtered[i + 1])) {
      return false;
    }
  }
  return true;
}

export function getDemoTimestampString(): string {
  return '১০:১৫:০০';
}

/**
 * Normalizes any timestamp (Bangla readable or ISO or partial) to standard ISO string "YYYY-MM-DDTHH:mm:ss"
 */
export function parseBanglaOrIsoTimestamp(ts: string): string {
  if (!ts) return '';
  const eng = toEnglishDigits(ts.trim());

  // Format 1: "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ss" or "YYYY-MM-DD HH:mm"
  const isoMatch = eng.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}(?::\d{2})?)/);
  if (isoMatch) {
    const datePart = isoMatch[1];
    let timePart = isoMatch[2];
    if (timePart.length === 5) timePart += ':00';
    return `${datePart}T${timePart}`;
  }

  // Format 2: "DD Month YYYY, HH:mm:ss" or "DD Month YYYY" e.g. "০৯ সেপ্টেম্বর ২০২৬, ০৯:৫০:১২"
  for (let mIdx = 0; mIdx < BN_MONTHS.length; mIdx++) {
    const mName = BN_MONTHS[mIdx];
    if (ts.includes(mName)) {
      const matchWithTime = eng.match(/(\d{1,2})\s+[^,0-9]+\s+(\d{4}),?\s+(\d{2}:\d{2}(?::\d{2})?)/);
      if (matchWithTime) {
        const day = matchWithTime[1].padStart(2, '0');
        const year = matchWithTime[2];
        const month = String(mIdx + 1).padStart(2, '0');
        let timePart = matchWithTime[3];
        if (timePart.length === 5) timePart += ':00';
        return `${year}-${month}-${day}T${timePart}`;
      }
      const matchDateOnly = eng.match(/(\d{1,2})\s+[^,0-9]+\s+(\d{4})/);
      if (matchDateOnly) {
        const day = matchDateOnly[1].padStart(2, '0');
        const year = matchDateOnly[2];
        const month = String(mIdx + 1).padStart(2, '0');
        return `${year}-${month}-${day}T00:00:00`;
      }
    }
  }

  // Format 3: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(eng)) {
    return `${eng}T00:00:00`;
  }

  return eng;
}

/**
 * Verifies if timestamp1 is less than or equal to timestamp2 (defaulting to SYSTEM_DATE_TIME)
 */
export function isTimestampLte(ts1?: string, maxTs: string = SYSTEM_DATE_TIME): boolean {
  if (!ts1) return true;
  const norm1 = parseBanglaOrIsoTimestamp(ts1);
  const norm2 = parseBanglaOrIsoTimestamp(maxTs);
  if (!norm1 || !norm2) return true;
  return norm1 <= norm2;
}


