/**
 * আইনজীবী সুপারিশ ও কর্মভার বণ্টন ইঞ্জিন (Lawyer Recommendation & Workload Allocation Engine)
 * Human-in-the-loop decision support engine with explainable criteria.
 * "এআই-সহায়তাকৃত সুপারিশ • মানবীয় অনুমোদন বাধ্যতামূলক"
 */

import { LegalAidCase, PanelLawyer } from '../types/legalAid';

export interface LawyerRecommendation {
  lawyer: PanelLawyer;
  matchScore: number;
  isRecommended: boolean;
  reasons: string[];
  conflictWarning?: string;
  capacityStatus: 'UNDER_CAPACITY' | 'NORMAL' | 'NEAR_CAPACITY' | 'OVER_CAPACITY';
  capacityStatusBn: string;
}

export function evaluateLawyersForCase(
  c: LegalAidCase,
  lawyers: PanelLawyer[]
): LawyerRecommendation[] {
  return lawyers.map((lawyer) => {
    let matchScore = 50;
    const reasons: string[] = [];
    let conflictWarning: string | undefined = undefined;

    // 1. District match (+30 or -40)
    const isSameDistrict = lawyer.district === c.district;
    if (isSameDistrict) {
      matchScore += 30;
      reasons.push(`একই বিচারিক জেলা (${c.district}) ও সংশ্লিষ্ট বার সমিতিতে তালিকাভুক্ত`);
    } else {
      matchScore -= 40;
      reasons.push(`ভিন্ন জেলা (${lawyer.district})`);
    }

    // 2. Specialization match (+25 or -10)
    const hasSpec = lawyer.specialisations.includes(c.category);
    if (hasSpec) {
      matchScore += 25;
      const catBn =
        c.category === 'WOMEN_CHILD'
          ? 'নারী ও শিশু নির্যাতন দমন'
          : c.category === 'FAMILY'
          ? 'পারিবারিক আদালত'
          : c.category === 'CRIMINAL'
          ? 'ফৌজদারি মামলা'
          : c.category === 'LAND_PROPERTY'
          ? 'জমিজমা ও দেওয়ানি বিরোধ'
          : 'সংশ্লিষ্ট বিষয়';
      reasons.push(`${catBn} শাখায় অভিজ্ঞ প্যানেল আইনজীবী`);
    } else {
      matchScore -= 10;
      reasons.push('অন্য শাখায় মূল অভিজ্ঞতা');
    }

    // 3. Workload & Capacity (+15 to -30)
    const workload = lawyer.workloadPercentage || 0;
    let capacityStatus: 'UNDER_CAPACITY' | 'NORMAL' | 'NEAR_CAPACITY' | 'OVER_CAPACITY' = 'NORMAL';
    let capacityStatusBn = 'স্বাভাবিক কর্মভার (Normal)';

    if (workload >= 100) {
      capacityStatus = 'OVER_CAPACITY';
      capacityStatusBn = 'সর্বোচ্চ সীমা অতিক্রান্ত (Over Capacity)';
      matchScore -= 30;
      reasons.push(`কর্মভার সর্বোচ্চ কোটার সমপরিমাণ বা বেশি (${lawyer.currentActiveCases}/${lawyer.maxCaseLimit})`);
    } else if (workload >= 85) {
      capacityStatus = 'NEAR_CAPACITY';
      capacityStatusBn = 'কোটা সীমার নিকটে (Near Capacity)';
      matchScore -= 10;
      reasons.push(`কর্মভার কোটার কাছাকাছি (${workload}%)`);
    } else if (workload <= 60) {
      capacityStatus = 'UNDER_CAPACITY';
      capacityStatusBn = 'পর্যাপ্ত সময় বিদ্যমান (Available Capacity)';
      matchScore += 15;
      reasons.push(`পর্যাপ্ত সময় ও নতুন মামলা গ্রহণের সক্ষমতা রয়েছে (${workload}%)`);
    } else {
      capacityStatus = 'NORMAL';
      capacityStatusBn = 'ভারসাম্যপূর্ণ কর্মভার (Balanced)';
      matchScore += 5;
      reasons.push(`সুষম কর্মভার (${workload}%)`);
    }

    // 4. Opposing Party Conflict Check (-50)
    if (c.applicant?.opposingPartyName) {
      const opposing = c.applicant.opposingPartyName.toLowerCase();
      const hasConflict = lawyer.knownConflicts?.some((conf) =>
        opposing.includes(conf.toLowerCase()) || conf.toLowerCase().includes(opposing)
      );
      if (hasConflict) {
        matchScore -= 50;
        conflictWarning = `স্বার্থের সংঘাত সতর্কতা: এই আইনজীবী অতীতে বিবাদী '${c.applicant.opposingPartyName}'-এর পক্ষে কার্য পরিচালনা করেছিলেন।`;
      }
    }

    // 5. Success rate bonus (+5 to +10)
    if (lawyer.successRatePercentage >= 85) {
      matchScore += 10;
      reasons.push(`উচ্চ নিষ্পত্তি সাফল্য হার (${lawyer.successRatePercentage}%)`);
    }

    const finalScore = Math.max(0, Math.min(100, matchScore));

    return {
      lawyer,
      matchScore: finalScore,
      isRecommended: isSameDistrict && hasSpec && workload < 85 && !conflictWarning,
      reasons,
      conflictWarning,
      capacityStatus,
      capacityStatusBn,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
