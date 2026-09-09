/**
 * ডেমো কনফিগারেশন ও নির্ধারক পিআরএনজি (Deterministic Demo PRNG & Configuration)
 * All data generated is strictly fictional for hackathon demonstration purposes.
 */

export const DEFAULT_DEMO_DATA_SEED = 20260909;

export interface PilotDistrictConfig {
  districtBn: string;
  districtEn: string;
  targetCases: number;
  targetLawyers: number;
  upazilas: string[];
}

export const PILOT_DISTRICTS: PilotDistrictConfig[] = [
  {
    districtBn: 'ঢাকা',
    districtEn: 'Dhaka',
    targetCases: 150,
    targetLawyers: 7,
    upazilas: ['সাভার', 'কেরানীগঞ্জ', 'ধামরাই', 'দোহার', 'নবাবগঞ্জ', 'ঢাকা সদর'],
  },
  {
    districtBn: 'গাজীপুর',
    districtEn: 'Gazipur',
    targetCases: 80,
    targetLawyers: 4,
    upazilas: ['গাজীপুর সদর', 'কালিয়াকৈর', 'কাপাসিয়া', 'শ্রীপুর', 'কালীগঞ্জ'],
  },
  {
    districtBn: 'নারায়ণগঞ্জ',
    districtEn: 'Narayanganj',
    targetCases: 75,
    targetLawyers: 4,
    upazilas: ['নারায়ণগঞ্জ সদর', 'সোনারগাঁ', 'রূপগঞ্জ', 'আড়াইহাজার', 'বন্দর'],
  },
  {
    districtBn: 'চট্টগ্রাম',
    districtEn: 'Chattogram',
    targetCases: 75,
    targetLawyers: 4,
    upazilas: ['চট্টগ্রাম সদর', 'পটিয়া', 'সীতাকুণ্ড', 'হাটহাজারী', 'বোয়ালখালী', 'আনোয়ারা'],
  },
  {
    districtBn: 'কুমিল্লা',
    districtEn: 'Cumilla',
    targetCases: 65,
    targetLawyers: 3,
    upazilas: ['কুমিল্লা সদর', 'দাউদকান্দি', 'দেবিদ্বার', 'চান্দিনা', 'বুড়িচং', 'মুরাদনগর'],
  },
  {
    districtBn: 'টাঙ্গাইল',
    districtEn: 'Tangail',
    targetCases: 55,
    targetLawyers: 3,
    upazilas: ['টাঙ্গাইল সদর', 'মির্জাপুর', 'সখীপুর', 'ঘাটাইল', 'মধুপুর', 'কালিহাতী'],
  },
];

export const TOTAL_CASES_TARGET = 500;
export const TOTAL_LAWYERS_TARGET = 25;

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
