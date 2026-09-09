/**
 * ডেমো কনফিগারেশন ও নির্ধারক পিআরএনজি (Deterministic Demo PRNG & Configuration)
 * 8 Digital Legal-Aid Pilot Districts, Quotas, and Temporal Rules
 * Fictional synthetic dataset strictly for hackathon demonstration.
 */

export const DEFAULT_DEMO_DATA_SEED = 20260909;
export const DEMO_SNAPSHOT_DATE = '2026-09-09';

export type DistrictType = 'DIGITAL_LEGAL_AID_PILOT' | 'REFERENCE_GEOGRAPHY';

export interface PilotDistrictConfig {
  districtBn: string;
  districtEn: string;
  type: DistrictType;
  targetCases: number;
  targetLawyers: number;
  upazilas: string[];
}

/**
 * Eight (8) designated Digital Legal Aid Pilot Districts:
 * Rajbari, Habiganj, Barguna, Netrokona, Joypurhat, Thakurgaon, Jhenaidah, Khagrachhari
 */
export const PILOT_DISTRICTS: PilotDistrictConfig[] = [
  {
    districtBn: 'রাজবাড়ী',
    districtEn: 'Rajbari',
    type: 'DIGITAL_LEGAL_AID_PILOT',
    targetCases: 65,
    targetLawyers: 4,
    upazilas: ['রাজবাড়ী সদর', 'গোয়ালন্দ', 'পাংশা', 'বালিয়াকান্দি', 'কালুখালী'],
  },
  {
    districtBn: 'হবিগঞ্জ',
    districtEn: 'Habiganj',
    type: 'DIGITAL_LEGAL_AID_PILOT',
    targetCases: 65,
    targetLawyers: 4,
    upazilas: [
      'হবিগঞ্জ সদর',
      'নবীগঞ্জ',
      'বাহুবল',
      'মাধবপুর',
      'চুনারুঘাট',
      'লাখাই',
      'বানিয়াচং',
      'আজমিরীগঞ্জ',
      'শায়েস্তাগঞ্জ',
    ],
  },
  {
    districtBn: 'বরগুনা',
    districtEn: 'Barguna',
    type: 'DIGITAL_LEGAL_AID_PILOT',
    targetCases: 65,
    targetLawyers: 4,
    upazilas: ['বরগুনা সদর', 'আমতলী', 'পাথরঘাটা', 'বেতাগী', 'বামনা', 'তালতলী'],
  },
  {
    districtBn: 'নেত্রকোণা',
    districtEn: 'Netrokona',
    type: 'DIGITAL_LEGAL_AID_PILOT',
    targetCases: 65,
    targetLawyers: 4,
    upazilas: [
      'নেত্রকোণা সদর',
      'কেন্দুয়া',
      'মোহনগঞ্জ',
      'দুর্গাপুর',
      'কলমাকান্দা',
      'পূর্বধলা',
      'বারহাট্টা',
      'আটপাড়া',
      'মদন',
      'খালিয়াজুরী',
    ],
  },
  {
    districtBn: 'জয়পুরহাট',
    districtEn: 'Joypurhat',
    type: 'DIGITAL_LEGAL_AID_PILOT',
    targetCases: 60,
    targetLawyers: 3,
    upazilas: ['জয়পুরহাট সদর', 'পাঁচবিবি', 'কালাই', 'ক্ষেতলাল', 'আক্কেলপুর'],
  },
  {
    districtBn: 'ঠাকুরগাঁও',
    districtEn: 'Thakurgaon',
    type: 'DIGITAL_LEGAL_AID_PILOT',
    targetCases: 60,
    targetLawyers: 4,
    upazilas: ['ঠাকুরগাঁও সদর', 'পীরগঞ্জ', 'রাণীশংকৈল', 'বালিয়াডাঙ্গী', 'হরিপুর'],
  },
  {
    districtBn: 'ঝিনাইদহ',
    districtEn: 'Jhenaidah',
    type: 'DIGITAL_LEGAL_AID_PILOT',
    targetCases: 60,
    targetLawyers: 4,
    upazilas: ['ঝিনাইদহ সদর', 'কালীগঞ্জ', 'কোটচাঁদপুর', 'মহেশপুর', 'শৈলকুপা', 'হরিণাকুণ্ডু'],
  },
  {
    districtBn: 'খাগড়াছড়ি',
    districtEn: 'Khagrachhari',
    type: 'DIGITAL_LEGAL_AID_PILOT',
    targetCases: 60,
    targetLawyers: 3,
    upazilas: [
      'খাগড়াছড়ি সদর',
      'দিঘীনালা',
      'পানছড়ি',
      'মহালছড়ি',
      'মাটিরাঙ্গা',
      'মানিকছড়ি',
      'রামগড়',
      'গুইমারা',
      'লক্ষ্মীছড়ি',
    ],
  },
];

/**
 * Optional Reference / Non-Pilot Geography (explicitly labeled for benchmark comparisons)
 */
export const REFERENCE_DISTRICTS: PilotDistrictConfig[] = [
  {
    districtBn: 'ঢাকা',
    districtEn: 'Dhaka',
    type: 'REFERENCE_GEOGRAPHY',
    targetCases: 0,
    targetLawyers: 0,
    upazilas: ['সাভার', 'কেরানীগঞ্জ', 'ধামরাই', 'দোহার', 'নবাবগঞ্জ', 'ঢাকা সদর'],
  },
];

export const TOTAL_CASES_TARGET = 500;
export const TOTAL_LAWYERS_TARGET = 30;

export const COURT_TYPES = [
  'নারী ও শিশু নির্যাতন দমন ট্রাইব্যুনাল',
  'পারিবারিক আদালত',
  'জেলা ও দায়রা জজ আদালত',
  'চিফ জুডিসিয়াল ম্যাজিস্ট্রেট আদালত',
  'সিনিয়র সহকারী জজ আদালত',
  'সহকারী জজ আদালত',
  'আমলি আদালত / ম্যাজিস্ট্রেট কোর্ট',
  'বিকল্প বিরোধ নিষ্পত্তি / এডিআর ফোরাম',
];

/**
 * Validates that an upazila strictly belongs to the given pilot district
 */
export function validateDistrictRelationship(district: string, upazila: string): boolean {
  const found = PILOT_DISTRICTS.find(
    (d) => d.districtBn === district || d.districtEn.toLowerCase() === district.toLowerCase()
  );
  if (!found) {
    const refFound = REFERENCE_DISTRICTS.find(
      (d) => d.districtBn === district || d.districtEn.toLowerCase() === district.toLowerCase()
    );
    return refFound ? refFound.upazilas.includes(upazila) : false;
  }
  return found.upazilas.includes(upazila);
}

/**
 * Deterministic pseudo-random number generator (Mulberry32)
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number = DEFAULT_DEMO_DATA_SEED) {
    this.state = seed ? Math.abs(seed) % 2147483647 : 20260909;
    if (this.state === 0) this.state = 1;
  }

  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick<T>(array: readonly T[] | T[]): T {
    const idx = Math.floor(this.next() * array.length);
    return array[idx];
  }

  pickWeighted<T>(items: { item: T; weight: number }[]): T {
    const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
    let r = this.next() * totalWeight;
    for (const entry of items) {
      if (r < entry.weight) return entry.item;
      r -= entry.weight;
    }
    return items[items.length - 1].item;
  }

  sample<T>(array: readonly T[] | T[], count: number): T[] {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone.slice(0, Math.min(count, clone.length));
  }
}
