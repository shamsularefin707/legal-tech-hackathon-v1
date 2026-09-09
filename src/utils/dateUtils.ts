/**
 * তারিখ ও সময় ব্যবস্থাপনা ইউটিলিটি (Date & Time Engine for Demo Snapshot 2026-09-09)
 * All timeline logic strictly enforces invariant checks relative to DEMO_SNAPSHOT_DATE.
 */

export const DEMO_SNAPSHOT_DATE = '2026-09-09';
export const DEMO_DATA_SEED = 20260909;

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
  const now = new Date();
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');
  return `${toBanglaDigits(hh)}:${toBanglaDigits(mm)}:${toBanglaDigits(ss)}`;
}

