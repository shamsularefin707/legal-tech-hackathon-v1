/**
 * নির্দেশমূলক ও ব্যাখ্যামূলক ঝুঁকি নিরুপণ ইঞ্জিন (Deterministic & Explainable Risk Engine)
 * Pure, deterministic mathematical evaluation of case risk scores (20 - 99)
 * NO Math.random() allowed - same case snapshot always produces the identical score.
 */

import { LegalAidCase, PriorityLevel, RiskLevel } from '../types/legalAid';
import { DEMO_SNAPSHOT_DATE, daysBetween } from '../utils/dateUtils';

export interface CalculatedRiskResult {
  score: number; // 20 - 99
  level: RiskLevel;
  levelBn: string;
  calculatedPriority: PriorityLevel;
  factors: {
    title: string;
    impact: number;
    description: string;
  }[];
}

export function calculateRisk(
  c: Partial<LegalAidCase>,
  snapshotDate: string = DEMO_SNAPSHOT_DATE
): CalculatedRiskResult {
  let score = 25; // Base baseline score
  const factors: { title: string; impact: number; description: string }[] = [];

  // 1. Applicant vulnerability factors (+8 to +18)
  const isFemale = c.applicant?.gender === 'নারী';
  const isMinorOrElderly =
    c.applicant?.ageBand === 'নাবালক/কিশোর' ||
    (c.applicant?.age !== undefined && (c.applicant.age < 18 || c.applicant.age > 60));
  const isDestitute = (c.applicant?.monthlyIncome || 0) < 6000;

  if (isFemale && isDestitute) {
    score += 18;
    factors.push({
      title: 'আবেদনকারীর আর্থ-সামাজিক উচ্চ দুর্বলতা (নারী ও হতদরিদ্র)',
      impact: 18,
      description: 'আবেদনকারী নারী ও নিয়মিত আয়ের সংস্থানহীন, আইনি ব্যয় বহনে সম্পূর্ণ অসমর্থ।',
    });
  } else if (isFemale) {
    score += 12;
    factors.push({
      title: 'প্রান্তিক নারী অধিকার সুরক্ষা অগ্রাধিকার',
      impact: 12,
      description: 'নারী আবেদনকারীর দ্রুত সামাজিক ও পারিবারিক আইনি নিরাপত্তা প্রদান প্রয়োজন।',
    });
  } else if (isMinorOrElderly) {
    score += 14;
    factors.push({
      title: 'বয়োবৃদ্ধ / নাবালক আবেদনকারী সুরক্ষা',
      impact: 14,
      description: 'আবেদনকারী বিশেষ সুরক্ষা প্রাপ্য বয়সসীমার অন্তর্ভুক্ত।',
    });
  } else if (isDestitute) {
    score += 10;
    factors.push({
      title: 'দরিদ্র জনগোষ্ঠীর আইনি সহায়তা প্রাপ্যতা',
      impact: 10,
      description: 'অতিদরিদ্র নাগরিকের সংবিধানস্বীকৃত আইনি অধিকার নিশ্চিতকরণ।',
    });
  }

  // 2. Case Category & Physical / Liberty Hazard (+10 to +18)
  const isSensitive =
    c.securityClassification === 'Highly Sensitive' ||
    c.category === 'WOMEN_CHILD' ||
    (c.summary && (c.summary.includes('নির্যাতন') || c.summary.includes('যৌতুক') || c.summary.includes('আহত')));

  if (isSensitive) {
    score += 16;
    factors.push({
      title: 'শারীরিক নিরাপত্তা ও জরুরি সুরক্ষা আদেশ প্রয়োজন',
      impact: 16,
      description: 'শারীরিক নির্যাতন ও পারিবারিক সহিংসতার সম্ভাব্য ঝুঁকি বিদ্যমান।',
    });
  } else if (c.category === 'CRIMINAL') {
    score += 14;
    factors.push({
      title: 'ব্যক্তিগত স্বাধীনতা ও কারাবাস ঝুঁকি (Criminal Liberty)',
      impact: 14,
      description: 'প্রাক-বিচারিক আটক বা জামিনহীন কারাদণ্ডের সম্ভাব্য ঝুঁকি বিদ্যমান।',
    });
  } else if (c.category === 'LAND_PROPERTY') {
    score += 10;
    factors.push({
      title: 'ভিটেমাটি ও জীবিকা বাস্তুচ্যুতি ঝুঁকি (Land Eviction)',
      impact: 10,
      description: 'বসতবাড়ি বা কৃষি জমি থেকে বেআইনি বেদখলের উপক্রম।',
    });
  } else if (c.category === 'HUMAN_RIGHTS' || (c.cybercrimeType && c.cybercrimeType.length > 0)) {
    score += 12;
    factors.push({
      title: 'সাইবার হয়রানি ও মৌলিক অধিকার হরণ',
      impact: 12,
      description: 'ডিজিটাল মাধ্যমে ব্ল্যাকমেইল বা গোপনীয়তা লঙ্ঘনের আশঙ্কা।',
    });
  }

  // 3. Hearing Proximity (+10 to +16)
  if (c.nextHearingDate) {
    const daysToHearing = daysBetween(snapshotDate, c.nextHearingDate);
    if (daysToHearing >= 0 && daysToHearing <= 3) {
      score += 16;
      factors.push({
        title: 'আসন্ন শুনানি নৈকট্য (আগামী ৩ দিনের মধ্যে)',
        impact: 16,
        description: `বিজ্ঞ আদালতে শুনানি মাত্র ${daysToHearing === 0 ? 'আজ' : daysToHearing + ' দিনের মধ্যে'} নির্ধারিত।`,
      });
    } else if (daysToHearing > 3 && daysToHearing <= 7) {
      score += 10;
      factors.push({
        title: 'শুনানির সময়সীমা আসন্ন (৭ দিনের মধ্যে)',
        impact: 10,
        description: `বিজ্ঞ আদালতে শুনানির দিন বাকি ${daysToHearing} দিন। প্রস্তুতি গ্রহণ আবশ্যক।`,
      });
    }
  }

  // 4. SLA Risk / Overdue (+8 to +15)
  if (c.slaStatus === 'BREACHED' || c.slaStatus === 'OVERDUE') {
    score += 15;
    factors.push({
      title: 'এসএলএ সময়সীমা অতিক্রান্ত (SLA Breached)',
      impact: 15,
      description: 'নির্ধারিত কার্যদিবসের মধ্যে প্রশাসনিক নিষ্পত্তির লক্ষ্যমাত্রা লঙ্ঘন হয়েছে।',
    });
  } else if (c.slaStatus === 'APPROACHING_RISK' || c.slaStatus === 'AT_RISK') {
    score += 10;
    factors.push({
      title: 'এসএলএ সময়সীমা ঝুঁকিপূর্ণ অবস্থায় (SLA at Risk)',
      impact: 10,
      description: 'নিষ্পত্তির নির্ধারিত সময়সীমার ৮০% বা তার বেশি অতিবাহিত হয়েছে।',
    });
  }

  // 5. Inactivity / Stale Case (+6 to +12)
  const inactiveDays = c.daysWithoutActivity || 0;
  if (inactiveDays >= 14) {
    score += 12;
    factors.push({
      title: `দীর্ঘস্থায়ী কার্যক্রমহীনতা (${inactiveDays} দিন অচল)`,
      impact: 12,
      description: '১৪ দিন বা তার বেশি সময় ধরে কোনো প্রশাসনিক বা বিচারিক অগ্রগতি হয়নি।',
    });
  } else if (inactiveDays >= 8) {
    score += 6;
    factors.push({
      title: `কার্যক্রম মন্থর (${inactiveDays} দিন)`,
      impact: 6,
      description: 'সাম্প্রতিক কার্যদিবসে নথিটিতে কোনো নতুন আদেশ বা অগ্রগতি নথিভুক্ত হয়নি।',
    });
  }

  // 6. Lawyer Assignment Gap (+8)
  if (!c.assignedLawyerId && (c.status === 'LAWYER_PENDING' || c.status === 'PENDING_LAWYER_ASSIGNMENT')) {
    score += 8;
    factors.push({
      title: 'আইনজীবী নিয়োগ অপেক্ষমাণ',
      impact: 8,
      description: 'আবেদনটি অনুমোদিত হলেও বিজ্ঞ প্যানেল আইনজীবী নিয়োগ সম্পন্ন হয়নি।',
    });
  }

  // Clamp deterministic score between 20 and 99 (Part 13)
  const finalScore = Math.max(20, Math.min(99, score));

  let level: RiskLevel = 'LOW';
  let levelBn = 'স্বাভাবিক (নিম্ন ঝুঁকি)';
  let calculatedPriority: PriorityLevel = 'LOW';

  if (finalScore >= 80) {
    level = 'CRITICAL';
    levelBn = 'অতীব জরুরি (ক্রিটিক্যাল)';
    calculatedPriority = 'VERY_HIGH';
  } else if (finalScore >= 65) {
    level = 'HIGH';
    levelBn = 'উচ্চ অগ্রাধিকার (হাই)';
    calculatedPriority = 'HIGH';
  } else if (finalScore >= 45) {
    level = 'MEDIUM';
    levelBn = 'মধ্যম ঝুঁকি (মিডিয়াম)';
    calculatedPriority = 'MEDIUM';
  } else {
    level = 'LOW';
    levelBn = 'স্বাভাবিক (লো)';
    calculatedPriority = 'LOW';
  }

  return {
    score: finalScore,
    level,
    levelBn,
    calculatedPriority,
    factors,
  };
}
