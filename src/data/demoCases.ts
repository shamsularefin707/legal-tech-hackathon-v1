/**
 * ৫০০টি বাস্তবসম্মত সিন্থেটিক মামলার নির্ধারক জেনারেটর (500 Synthetic Cases Generator)
 * Pilot Geography: 8 Digital Legal-Aid Pilot Districts
 * Quotas: Women/Family (57%), Land (20%), Criminal (10%), Cybercrime (5%), Bribery Allegations (3%), Other/Labour (5%)
 * Invariants: filingDate <= registrationDate <= eligibilityDecisionDate <= lawyerRecommendationDate <= lawyerAssignmentDate <= hearingDate <= lastActivityDate <= DEMO_SNAPSHOT_DATE
 */

import {
  LegalAidCase,
  PanelLawyer,
  CaseCategory,
  CaseStatus,
  HearingRecord,
  TimelineEvent,
  CaseDeadline,
  CaseDocument,
} from '../types/legalAid';
import {
  PILOT_DISTRICTS,
  COURT_TYPES,
  SeededRandom,
  TOTAL_CASES_TARGET,
  DEMO_SNAPSHOT_DATE,
} from './demoConfig';
import { addDays, daysBetween, formatDateBn } from '../utils/dateUtils';
import { calculateRisk } from '../services/riskEngine';
import { calculateCaseSla } from '../services/slaEngine';
import { deriveHearingStatus } from '../services/hearingEngine';

const FEMALE_FIRST_NAMES = [
  'মোছা. রহিমা', 'ফাতেমা', 'রোকেয়া', 'নাসরিন', 'মরিয়ম', 'সালমা', 'আছিয়া', 'খাদিজা',
  'রশিদা', 'সুলতানা', 'আলেয়া', 'শাহানাজ', 'হাসনা', 'মনোয়ারা', 'কুলসুম', 'পারভীন',
  'আমেনা', 'ফিরোজা', 'সবিতা', 'ঝর্ণা', 'রেহানা', 'তাসলিমা', 'নার্গিস', 'শিউলি', 'হালিমা'
];

const MALE_FIRST_NAMES = [
  'মো. রফিকুল', 'আব্দুল', 'শফিকুল', 'নুরুল', 'আনিসুর', 'মো. মোস্তফা', 'খায়রুল', 'মোঃ জাহাঙ্গীর',
  'মিজানুর', 'সাইফুল', 'হারুনুর', 'মো. আমিনুল', 'আব্দুর', 'মো. কামাল', 'মো. সেলিম', 'জহিরুল',
  'আশরাফুল', 'বিল্লাল', 'মো. জিয়াউল', 'মোকাররম', 'এনামুল', 'মো. মহিউদ্দিন', 'শওকত', 'গোলাম'
];

const LAST_NAMES = [
  'বেগম', 'খাতুন', 'আক্তার', 'বানু', 'চৌধুরী', 'ইসলাম', 'মোল্লা', 'ভূঁইয়া', 'মিয়া',
  'শিকদার', 'হাওলাদার', 'শেখ', 'সরকার', 'খান', 'আহমেদ', 'মজুমদার', 'দেওয়ান', 'তালুকদার',
  'দাস', 'রায়', 'বর্মন', 'চাকমা', 'মারমা'
];

const OCCUPATIONS_LOW_INCOME = [
  'গৃহিণী', 'গৃহকর্মী', 'দিনমজুর', 'কৃষি শ্রমিক', 'ক্ষুদ্র কৃষক', 'রিকশাচালক', 'দোকান কর্মচারী',
  'তাঁতি', 'মৎস্যজীবী', 'গার্মেন্টস কর্মী', 'হস্তশিল্পী', 'ভ্যানচালক', 'চা শ্রমিক'
];

const OPPOSING_NAMES = [
  'মো. খলিলুর রহমান', 'জালাল উদ্দিন', 'বজলুর রশীদ', 'মো. সিরাজ মিয়া', 'আশরাফ আলী',
  'মনিরুল ইসলাম', 'আব্দুল কাদের', 'মেসার্স ডেল্টা ব্রিকস', 'জমির উদ্দিন সর্দার', 'মো. মোবারক হোসেন'
];

export function generateSyntheticCases(
  rng: SeededRandom,
  lawyers: PanelLawyer[]
): LegalAidCase[] {
  const cases: LegalAidCase[] = [];

  // Group lawyers by district for fast, referentially sound assignment
  const lawyersByDistrict: Record<string, PanelLawyer[]> = {};
  for (const lawyer of lawyers) {
    if (!lawyersByDistrict[lawyer.district]) {
      lawyersByDistrict[lawyer.district] = [];
    }
    lawyersByDistrict[lawyer.district].push(lawyer);
  }

  // Define Category Quotas for exactly 500 cases:
  // Women / Family: 285 (57%)
  // Land / Property: 100 (20%)
  // Criminal / Violence: 50 (10%)
  // Cybercrime: 25 (5%)
  // Alleged Bribery: 15 (3%)
  // Other / Labour / Consumer: 25 (5%)
  // Sum: 285 + 100 + 50 + 25 + 15 + 25 = 500
  const categoryPool: { category: CaseCategory; subcat: string; sensitive: boolean }[] = [];

  for (let i = 0; i < 285; i++) {
    const isWc = i % 2 === 0;
    categoryPool.push({
      category: isWc ? 'WOMEN_CHILD' : 'FAMILY',
      subcat: isWc ? 'যৌতুক দাবি ও শারীরিক নির্যাতন' : 'দেনমোহর ও খোরপোষ আদায়',
      sensitive: true,
    });
  }
  for (let i = 0; i < 100; i++) {
    categoryPool.push({
      category: 'LAND_PROPERTY',
      subcat: 'বসতভিটা বেদখল ও সীমানা বিরোধ',
      sensitive: false,
    });
  }
  for (let i = 0; i < 50; i++) {
    categoryPool.push({
      category: 'CRIMINAL',
      subcat: 'মিথ্যা চাঁদাবাজি ও মারধরের অভিযোগ',
      sensitive: false,
    });
  }
  for (let i = 0; i < 25; i++) {
    categoryPool.push({
      category: 'HUMAN_RIGHTS',
      subcat: 'সাইবার হয়রানি ও সামাজিক যোগাযোগ মাধ্যমে মানহানি',
      sensitive: true,
    });
  }
  for (let i = 0; i < 15; i++) {
    categoryPool.push({
      category: 'OTHER',
      subcat: 'ঘুষ দাবির অভিযোগ (Alleged Bribery & Extortion)',
      sensitive: false,
    });
  }
  for (let i = 0; i < 25; i++) {
    categoryPool.push({
      category: i % 2 === 0 ? 'LABOUR' : 'CONSUMER_RIGHTS',
      subcat: i % 2 === 0 ? 'বকেয়া মজুরি আদায়' : 'প্রতারণামূলক চুক্তি ভঙ্গ',
      sensitive: false,
    });
  }

  // Shuffle category pool deterministically
  const shuffledCategories = rng.sample(categoryPool, categoryPool.length);

  // Canonical Status Distribution Targets (Mutually Exclusive Primary Status, Sum = 500):
  // SUBMITTED: 15
  // UNDER_REVIEW: 20
  // REGISTERED: 25
  // ONGOING: 320
  // AWAITING_RESOLUTION: 45
  // RESOLVED: 55
  // CLOSED: 20
  // Sum = 15 + 20 + 25 + 320 + 45 + 55 + 20 = 500
  const statusPool: CaseStatus[] = [];
  for (let i = 0; i < 15; i++) statusPool.push('SUBMITTED');
  for (let i = 0; i < 20; i++) statusPool.push('UNDER_REVIEW');
  for (let i = 0; i < 25; i++) statusPool.push('REGISTERED');
  for (let i = 0; i < 320; i++) statusPool.push('ONGOING');
  for (let i = 0; i < 45; i++) statusPool.push('AWAITING_RESOLUTION');
  for (let i = 0; i < 55; i++) statusPool.push('RESOLVED');
  for (let i = 0; i < 20; i++) statusPool.push('CLOSED');

  const shuffledStatuses = rng.sample(statusPool, statusPool.length);

  // Distribute exactly across the 8 pilot districts:
  // Rajbari: 65, Habiganj: 65, Barguna: 65, Netrokona: 65
  // Joypurhat: 60, Thakurgaon: 60, Jhenaidah: 60, Khagrachhari: 60
  // Total: 500 cases!
  const districtDistribution: { districtBn: string; districtEn: string; upazilas: string[] }[] = [];
  for (const pilot of PILOT_DISTRICTS) {
    for (let count = 0; count < pilot.targetCases; count++) {
      districtDistribution.push({
        districtBn: pilot.districtBn,
        districtEn: pilot.districtEn,
        upazilas: pilot.upazilas,
      });
    }
  }

  // We want approximately 15–35 hearings on DEMO_SNAPSHOT_DATE ('2026-09-09')
  // We track how many today's hearings have been created.
  let todaysHearingsCreated = 0;
  const targetTodaysHearings = 24;

  let globalIndex = 0;

  for (const distInfo of districtDistribution) {
    globalIndex++;
    const id = `CASE-PILOT-${String(globalIndex).padStart(4, '0')}`;
    const year = 2026;
    const caseNumber = `NLAS-${distInfo.districtEn.substring(0, 3).toUpperCase()}-${year}-${String(globalIndex).padStart(4, '0')}`;

    const catInfo = shuffledCategories[globalIndex - 1];
    const status = shuffledStatuses[globalIndex - 1];

    // Pick an upazila belonging strictly to this district
    const upazila = rng.pick(distInfo.upazilas);

    // Gender assignment aligned with category
    const isFemaleApplicant =
      catInfo.category === 'WOMEN_CHILD' ||
      catInfo.category === 'FAMILY' ||
      rng.next() < 0.35;

    const firstName = isFemaleApplicant ? rng.pick(FEMALE_FIRST_NAMES) : rng.pick(MALE_FIRST_NAMES);
    const lastName = rng.pick(LAST_NAMES);
    const applicantName = `${firstName} ${lastName}`;
    const opposingName = rng.pick(OPPOSING_NAMES);

    // Chronology Dates:
    // Filing date: between 15 and 150 days before DEMO_SNAPSHOT_DATE
    const filingOffsetDays = rng.nextInt(15, 150);
    const filingDate = addDays(DEMO_SNAPSHOT_DATE, -filingOffsetDays);

    // Registration date: filingDate + 0 to 4 days
    const regOffset = rng.nextInt(0, 4);
    const registrationDate = addDays(filingDate, regOffset);

    // Eligibility decision: registrationDate + 0 to 3 days
    const eligOffset = rng.nextInt(0, 3);
    const eligibilityDecisionDate = addDays(registrationDate, eligOffset);

    // Lawyer recommendation: eligibilityDecisionDate + 0 to 3 days
    const recOffset = rng.nextInt(0, 3);
    const lawyerRecommendationDate = addDays(eligibilityDecisionDate, recOffset);

    // Separation of Duties & IDs:
    const appId = `APP-2026-${String(globalIndex).padStart(4, '0')}`;
    const isRegisteredOrLater = status !== 'SUBMITTED' && status !== 'DRAFT';
    const officialCaseId = isRegisteredOrLater ? caseNumber : undefined;
    const isDisposed = status === 'RESOLVED' || status === 'CLOSED';

    // Lawyer assignment:
    let lawyerAssignmentDate: string | undefined = undefined;
    let assignedLawyer: PanelLawyer | undefined = undefined;

    const districtLawyers = lawyersByDistrict[distInfo.districtBn] || [];

    if (status !== 'SUBMITTED' && status !== 'UNDER_REVIEW' && status !== 'REGISTERED') {
      const assignOffset = rng.nextInt(1, 4);
      lawyerAssignmentDate = addDays(lawyerRecommendationDate, assignOffset);

      // Match lawyer by specialization preference if available
      const matchingSpecLawyer = districtLawyers.find((l) =>
        l.specialisations.includes(catInfo.category)
      );
      assignedLawyer = matchingSpecLawyer || rng.pick(districtLawyers);
    }

    // Hearings:
    const hearings: HearingRecord[] = [];
    let firstHearingDate: string | undefined = undefined;
    let latestHearingDate: string | undefined = undefined;
    let nextHearingDate: string | undefined = undefined;

    const courtName = rng.pick(COURT_TYPES);
    const benchNumber = `কক্ষ-${rng.nextInt(101, 305)}`;

    if (
      lawyerAssignmentDate &&
      status !== 'SUBMITTED' &&
      status !== 'UNDER_REVIEW' &&
      status !== 'REGISTERED'
    ) {
      // Create 1 to 3 hearings
      const hearingCount = isDisposed ? rng.nextInt(2, 4) : rng.nextInt(1, 3);
      let currentHearingDate = addDays(lawyerAssignmentDate, rng.nextInt(5, 20));

      for (let hIdx = 0; hIdx < hearingCount; hIdx++) {
        if (hIdx === 0) {
          firstHearingDate = currentHearingDate;
        }

        // Check if we should place this hearing on today's snapshot date
        let hearingIso = currentHearingDate;
        if (
          todaysHearingsCreated < targetTodaysHearings &&
          hIdx === hearingCount - 1 &&
          !isDisposed &&
          (!latestHearingDate || latestHearingDate < DEMO_SNAPSHOT_DATE) &&
          rng.next() < 0.35
        ) {
          hearingIso = DEMO_SNAPSHOT_DATE;
          todaysHearingsCreated++;
        }

        // Strict chronological invariant: hearingIso must be strictly after latestHearingDate
        if (latestHearingDate && hearingIso <= latestHearingDate) {
          hearingIso = addDays(latestHearingDate, rng.nextInt(7, 30));
        }

        const hStatusObj = deriveHearingStatus(hearingIso, DEMO_SNAPSHOT_DATE);

        hearings.push({
          id: `HR-${id}-${hIdx + 1}`,
          hearingId: `HR-${id}-${hIdx + 1}`,
          caseId: id,
          caseNumber,
          court: `${distInfo.districtBn} ${courtName}`,
          courtName: `${distInfo.districtBn} ${courtName}`,
          benchCourtNumber: benchNumber,
          district: distInfo.districtBn,
          hearingDate: hearingIso,
          hearingTime: `${rng.nextInt(10, 12)}:${rng.pick(['০০', '১৫', '৩০', '৪৫'])} পূর্বাহ্ণ`,
          presidingOfficer: 'বিজ্ঞ জেলা ও দায়রা জজ',
          judgeName: 'বিজ্ঞ বিচারক',
          lawyerId: assignedLawyer?.id,
          lawyerName: assignedLawyer?.name,
          date: formatDateBn(hearingIso),
          isoDate: hearingIso,
          time: `${rng.nextInt(10, 12)}:${rng.pick(['০০', '১৫', '৩০', '৪৫'])} পূর্বাহ্ণ`,
          purpose:
            hIdx === 0
              ? 'প্রাথমিক অভিযোগ ও নথি উপস্থাপন'
              : hIdx === 1
              ? 'সাক্ষ্য গ্রহণ ও জেরা'
              : 'চূড়ান্ত যুক্তিতর্ক ও আদেশ',
          notes: 'বিজ্ঞ বিচারকের উপস্থিতিতে ধার্যকৃত আইনি কার্যক্রম সম্পন্নকরণ।',
          status: hStatusObj.status,
          statusBn: hStatusObj.statusBn,
          courtOutcomeSummary:
            hearingIso < DEMO_SNAPSHOT_DATE
              ? 'উভয় পক্ষের বিজ্ঞ আইনজীবীর বক্তব্য শ্রবণপূর্বক নথিভুক্ত হলো।'
              : undefined,
          isPlanned: hearingIso > DEMO_SNAPSHOT_DATE,
        });

        latestHearingDate = hearingIso;

        // Advance to next hearing date
        currentHearingDate = addDays(hearingIso, rng.nextInt(14, 45));
      }

      // Next hearing date for ongoing cases
      const upcomingHearings = hearings.filter((h) => (h.isoDate || '') >= DEMO_SNAPSHOT_DATE);
      if (upcomingHearings.length > 0) {
        nextHearingDate = upcomingHearings[0].isoDate;
      }
    }

    // Disposed case date
    let disposalDate: string | undefined = undefined;
    let disposalReason: string | undefined = undefined;

    if (isDisposed) {
      const baseDispDate = latestHearingDate || lawyerAssignmentDate || registrationDate;
      const dispOffset = rng.nextInt(2, 15);
      const computedDispDate = addDays(baseDispDate, dispOffset);
      // Ensure disposalDate is strictly prior to DEMO_SNAPSHOT_DATE (completed in past)
      disposalDate = computedDispDate < DEMO_SNAPSHOT_DATE ? computedDispDate : addDays(DEMO_SNAPSHOT_DATE, -1);
      disposalReason = rng.pick([
        'আদালতের মাধ্যমে আপস-মীমাংসা ও দেনমোহর আদায় সম্পন্ন',
        'উভয় পক্ষের সম্মতিতে বিকল্প বিরোধ নিষ্পত্তি (এডিআর) চুক্তি স্বাক্ষরিত',
        'বিজ্ঞ আদালতের চূড়ান্ত রায়ে বাদীর অনুকূলে ডিক্রি জারি',
        'দাবির অর্থ সম্পূর্ণ পরিশোধিত হওয়ায় নথি নিষ্পত্তি',
      ]);
    }

    // Calculate Last Activity Date (must be <= DEMO_SNAPSHOT_DATE)
    let lastActivityDate = registrationDate;
    if (lawyerAssignmentDate && lawyerAssignmentDate <= DEMO_SNAPSHOT_DATE) {
      lastActivityDate = lawyerAssignmentDate;
    }
    if (latestHearingDate && latestHearingDate <= DEMO_SNAPSHOT_DATE) {
      lastActivityDate = latestHearingDate;
    }
    if (disposalDate && disposalDate <= DEMO_SNAPSHOT_DATE) {
      lastActivityDate = disposalDate;
    }

    // Inactivity Metric (Part 15):
    // Inactive if >= 14 days without activity
    const isIntentionallyStuck = rng.next() < 0.16 && status !== 'DISPOSED';
    let daysWithoutActivity = daysBetween(lastActivityDate, DEMO_SNAPSHOT_DATE);

    if (isIntentionallyStuck) {
      daysWithoutActivity = rng.nextInt(15, 42);
      lastActivityDate = addDays(DEMO_SNAPSHOT_DATE, -daysWithoutActivity);
    } else {
      daysWithoutActivity = Math.max(0, Math.min(daysWithoutActivity, 40));
    }

    // SLA Calculation (Part 8)
    const priorityGuess = catInfo.sensitive ? 'VERY_HIGH' : 'MEDIUM';
    const sla = calculateCaseSla(
      registrationDate,
      priorityGuess,
      catInfo.category,
      status,
      DEMO_SNAPSHOT_DATE
    );

    // Deadlines
    const deadlines: CaseDeadline[] = [
      {
        id: `DL-${id}-1`,
        title: 'বিজ্ঞ আদালতে প্রয়োজনীয় নথি দাখিল ও হাজিরা',
        dueDate: formatDateBn(sla.slaTargetDate),
        daysRemaining: sla.slaRemainingDays,
        category: sla.slaRemainingDays < 0 ? 'OVERDUE' : sla.slaRemainingDays <= 7 ? 'AT_RISK' : 'URGENT',
        assignedOfficer: 'সহকারী লিগ্যাল এইড অফিসার',
        assignedLawyer: assignedLawyer?.name,
        status: status === 'DISPOSED' ? 'MET' : sla.slaRemainingDays < 0 ? 'OVERDUE' : 'PENDING',
        actionRequired: 'নথি প্রস্তুত ও বিজ্ঞ আদালতে উপস্থাপন',
      },
    ];

    // Documents
    const documents: CaseDocument[] = [
      {
        id: `DOC-${id}-01`,
        title: 'আইনগত সহায়তা আবেদনপত্র (মূল কপি)',
        category: 'APPLICATION',
        fileName: `Application_${caseNumber}.pdf`,
        fileSizeBytes: 245000,
        uploadedAt: formatDateBn(filingDate),
        uploadedBy: 'জেলা লিগ্যাল এইড সহকারী',
        mimeType: 'application/pdf',
        securityHash: `sha256-${id}-app-01`,
        isRestricted: false,
        accessCount: rng.nextInt(2, 8),
      },
      {
        id: `DOC-${id}-02`,
        title: 'জাতীয় পরিচয়পত্র ও নাগরিক সনদপত্র',
        category: 'IDENTITY',
        fileName: `NID_Applicant_${id}.pdf`,
        fileSizeBytes: 180000,
        uploadedAt: formatDateBn(registrationDate),
        uploadedBy: 'ফ্রন্ট ডেস্ক অফিসার',
        mimeType: 'application/pdf',
        securityHash: `sha256-${id}-nid-02`,
        isRestricted: catInfo.sensitive,
        accessCount: rng.nextInt(1, 5),
      },
    ];

    if (assignedLawyer) {
      documents.push({
        id: `DOC-${id}-03`,
        title: 'বিজ্ঞ প্যানেল আইনজীবী নিয়োগ পত্র (অফিসিয়াল)',
        category: 'COURT_ORDER',
        fileName: `Lawyer_Assignment_${id}.pdf`,
        fileSizeBytes: 310000,
        uploadedAt: formatDateBn(lawyerAssignmentDate!),
        uploadedBy: 'জেলা লিগ্যাল এইড অফিসার',
        mimeType: 'application/pdf',
        securityHash: `sha256-${id}-ord-03`,
        isRestricted: false,
        accessCount: rng.nextInt(3, 11),
      });
    }

    // Timeline Events strictly chronological
    const timeline: TimelineEvent[] = [
      {
        id: `TL-${id}-1`,
        date: formatDateBn(filingDate),
        isoDate: filingDate,
        time: '১০:৩০ পূর্বাহ্ণ',
        user: 'নাগরিক সেবা ডেস্ক',
        role: 'ASSISTANT_OFFICER',
        action: 'আবেদন দাখিল',
        description: 'নাগরিক সরাসরি উপস্থিত হয়ে বিনামূল্যে সরকারি আইনি সহায়তার আবেদন দাখিল করেন।',
        isOfficialRecord: true,
      },
      {
        id: `TL-${id}-2`,
        date: formatDateBn(registrationDate),
        isoDate: registrationDate,
        time: '১১:১৫ পূর্বাহ্ণ',
        user: 'জেলা লিগ্যাল এইড অফিসার',
        role: 'DISTRICT_OFFICER',
        action: 'মামলা নিবন্ধন ও প্রাথমিক যাচাই',
        description: 'আবেদনকারীর আর্থিক অসচ্ছলতা ও অভিযোগের প্রাথমিক সত্যতা যাচাইপূর্বক মামলাটি ডিজিটাল রেজিস্ট্রারে নিবন্ধিত হয়।',
        isOfficialRecord: true,
      },
    ];

    if (lawyerAssignmentDate) {
      timeline.push({
        id: `TL-${id}-3`,
        date: formatDateBn(lawyerAssignmentDate),
        isoDate: lawyerAssignmentDate,
        time: '০২:০০ অপরাহ্ণ',
        user: 'জেলা লিগ্যাল এইড অফিসার',
        role: 'DISTRICT_OFFICER',
        action: 'প্যানেল আইনজীবী নিয়োগ',
        description: `মামলার শাখা ও অভিজ্ঞতার ভিত্তিতে বিজ্ঞ প্যানেল আইনজীবী ${assignedLawyer?.name}-কে নিয়োগ প্রদান করা হয়।`,
        isOfficialRecord: true,
      });
    }

    for (const h of hearings) {
      if (h.isoDate && h.isoDate < DEMO_SNAPSHOT_DATE) {
        timeline.push({
          id: `TL-${h.id}`,
          date: h.date,
          isoDate: h.isoDate,
          time: h.time,
          user: assignedLawyer?.name || 'বিজ্ঞ প্যানেল আইনজীবী',
          role: 'PANEL_LAWYER',
          action: 'আদালতে শুনানি অনুষ্ঠিত',
          description: `${h.courtName}-এ শুনানি সম্পন্ন। উদ্দেশ্য: ${h.purpose}`,
          isOfficialRecord: true,
        });
      }
    }

    if (disposalDate) {
      timeline.push({
        id: `TL-${id}-DISP`,
        date: formatDateBn(disposalDate),
        isoDate: disposalDate,
        time: '০৩:৩০ অপরাহ্ণ',
        user: 'জেলা লিগ্যাল এইড অফিসার',
        role: 'DISTRICT_OFFICER',
        action: 'মামলা নিষ্পত্তি ও সমাপ্তি',
        description: `${disposalReason}`,
        isOfficialRecord: true,
      });
    }

    const partialCase: Partial<LegalAidCase> = {
      id,
      caseNumber,
      applicant: {
        id: `APP-${id}`,
        name: applicantName,
        displayName: applicantName,
        nidMasked: `****-****-${rng.nextInt(1000, 9999)}`,
        phoneMasked: `০১৭**-***${rng.nextInt(100, 999)}`,
        gender: isFemaleApplicant ? 'নারী' : 'পুরুষ',
        age: rng.nextInt(20, 58),
        ageBand: isFemaleApplicant ? '২৬-৩৫' : '৩৬-৫০',
        monthlyIncome: rng.nextInt(3500, 9500),
        occupation: rng.pick(OCCUPATIONS_LOW_INCOME),
        villageWard: `ওয়ার্ড নং ${rng.nextInt(1, 9)}`,
        upazila,
        district: distInfo.districtBn,
        specialEligibility: isFemaleApplicant
          ? ['আর্থিকভাবে অসচ্ছল নারী', 'পারিবারিক সহিংসতার শিকার']
          : ['হতদরিদ্র ও অস্বচ্ছল কৃষক'],
        opposingPartyName: opposingName,
        opposingPartyAddress: `${upazila}, ${distInfo.districtBn}`,
      },
      category: catInfo.category,
      summary: `${applicantName} বনাম ${opposingName}। বিষয়: ${catInfo.subcat} সংক্রান্ত সরকারি আইনি সহায়তা প্রার্থনা।`,
      securityClassification: catInfo.sensitive ? 'Highly Sensitive' : 'Official',
      nextHearingDate,
      daysWithoutActivity,
      slaStatus: sla.slaStatus,
      assignedLawyerId: assignedLawyer?.id || null,
      status,
    };

    // Calculate Risk deterministically
    const riskResult = calculateRisk(partialCase, DEMO_SNAPSHOT_DATE);

    const legalCase: LegalAidCase = {
      id,
      applicationId: appId,
      officialCaseId,
      submittedBy: 'user-staff-1',
      registeredBy: isRegisteredOrLater ? 'user-admin-1' : undefined,
      createdBy: 'user-staff-1',
      isDemoData: true,
      caseNumber,
      applicant: partialCase.applicant!,
      category: catInfo.category,
      courtName: `${distInfo.districtBn} ${courtName}`,
      courtType: courtName,
      district: distInfo.districtBn,
      districtType: 'DIGITAL_LEGAL_AID_PILOT',
      upazila,
      status,
      deadlineStatus: isDisposed
        ? 'NORMAL'
        : sla.slaRemainingDays < 0
        ? 'EXPIRED'
        : sla.slaRemainingDays <= 7
        ? 'AT_RISK'
        : sla.slaRemainingDays <= 20
        ? 'APPROACHING'
        : 'NORMAL',
      activityStatus: daysWithoutActivity >= 30 && !isDisposed ? 'INACTIVE' : 'ACTIVE',
      filingDate,
      registrationDate,
      eligibilityDecisionDate,
      lawyerRecommendationDate,
      lawyerAssignmentDate,
      firstHearingDate,
      latestHearingDate,
      lastActivityDate,
      disposalDate,
      disposalReason,
      applicationDate: formatDateBn(filingDate),
      assignedDate: lawyerAssignmentDate ? formatDateBn(lawyerAssignmentDate) : undefined,
      nextHearingDate,
      daysWithoutActivity,
      daysSinceLastActivity: daysWithoutActivity,

      // SLA fields
      slaStartDate: sla.slaStartDate,
      configuredSlaDays: sla.configuredSlaDays,
      slaTargetDate: sla.slaTargetDate,
      slaRemainingDays: sla.slaRemainingDays,
      slaConsumedPercentage: sla.slaConsumedPercentage,
      slaStatus: sla.slaStatus,

      // Risk fields
      riskScore: riskResult.score,
      riskLevel: riskResult.level,
      riskFactorsList: riskResult.factors,
      priorityAssessment: {
        calculatedPriority: riskResult.calculatedPriority,
        score: riskResult.score,
        factors: riskResult.factors.map((f) => ({
          title: f.title,
          impact: 'POSITIVE',
          description: f.description,
        })),
      },

      assignedOfficerName: 'মো. সাজ্জাদ হোসেন (সিনিয়র সহকারী জজ)',
      assignedLawyerId: assignedLawyer?.id || null,
      assignedLawyerName: assignedLawyer?.name,
      assignedLawyerBarNo: assignedLawyer?.barRegNo,

      hearings,
      deadlines,
      timeline,
      documents,
      summary: partialCase.summary!,
      legalIssues: [
        `${catInfo.subcat} সংশ্লিষ্ট প্রমাণাদি উপস্থাপন`,
        'পক্ষদ্বয়ের বক্তব্য ও আপস সমঝোতার সুযোগ অন্বেষণ',
      ],
      reliefSought:
        catInfo.category === 'WOMEN_CHILD' || catInfo.category === 'FAMILY'
          ? 'আইনানুগ দেনমোহর, খোরপোষ ও শিশু সন্তানদের ভরণপোষণ উদ্ধার এবং সুরক্ষা নিশ্চিতকরণ।'
          : 'দখল পুনরুদ্ধার, ক্ষতিপূরণ আদায় ও ন্যায়বিচার প্রাপ্তি।',

      // Synthetic compatibility
      caseCategory: catInfo.category,
      caseSubcategory: catInfo.subcat,
      applicantName,
      applicantDisplayName: applicantName,
      applicantGender: isFemaleApplicant ? 'নারী' : 'পুরুষ',
      priorityLevel: riskResult.calculatedPriority,
      securityClassification: catInfo.sensitive ? 'Highly Sensitive' : 'Official',
      documentCount: documents.length,
      sensitiveDocumentCount: catInfo.sensitive ? 2 : 0,
    };

    cases.push(legalCase);
  }

  return cases;
}
