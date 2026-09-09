/**
 * সিন্থেটিক দুর্বলতা ডেটাসেট ও লাইফসাইকেল (Synthetic Vulnerabilities Dataset & 7-Stage Lifecycle)
 * 10-15 vulnerabilities covering Broken Access Control, Excessive Privilege, Session Timeout, etc.
 * All records include `isDemoData: true`.
 */

import { VulnerabilityItem, VulnerabilityLifecycleStage, LifecycleStageKey } from '../types/legalAid';
import { SeededRandom } from './demoConfig';

export function generateSyntheticVulnerabilities(rng: SeededRandom): VulnerabilityItem[] {
  const vulnTemplates = [
    {
      id: 'VULN-DEMO-001',
      titleBn: 'অবজেক্ট-লেভেল অ্যাক্সেস কন্ট্রোল দুর্বলতা (BOLA / IDOR ঝুঁকি)',
      titleEn: 'Broken Object-Level Authorization in Case Details API',
      severity: 'CRITICAL' as const,
      asset: 'মামলা তথ্য ও বিচারিক রেকর্ড এপিআই (/api/v1/cases/:id)',
      owner: 'সিস্টেম আর্কিটেক্ট ও এপিআই সিকিউরিটি টিম',
      slaHours: 24,
      slaRemainingHours: 6,
      isSlaAtRisk: false,
      status: 'CONTAINED' as const,
      riskScore: 92,
      lifecycleStage: 'CONTAIN' as LifecycleStageKey,
      description:
        'মামলার আইডি সরাসরি প্যারামিটারে পরিবর্তনের মাধ্যমে জেলা এক্তিয়ার উপেক্ষা করে অন্য জেলার মামলা দেখার তাত্ত্বিক ঝুঁকি শনাক্ত হয়।',
      remediationPlan:
        'সার্ভার সাইডে জেলা এক্তিয়ার ও ব্যবহারকারী রোলের দ্বৈত যাচাইকরণ ফিল্টার প্রয়োগ এবং ব্যর্থ অনুরোধে তাৎক্ষণিক ব্লক।',
    },
    {
      id: 'VULN-DEMO-002',
      titleBn: 'সংবেদনশীল পরিচয় ও কাবিননামা নথির অপর্যাপ্ত মাস্কিং ঝুঁকি',
      titleEn: 'Insufficient Masking of Sensitive Marital & Identity Documents',
      severity: 'HIGH' as const,
      asset: 'ডকুমেন্ট ভিউয়ার ও প্রিভিউ সাবসিস্টেম',
      owner: 'ফ্রন্টএন্ড সিকিউরিটি ও ডেটা প্রাইভেসি অফিসার',
      slaHours: 48,
      slaRemainingHours: 14,
      isSlaAtRisk: false,
      status: 'UNDER_REVIEW' as const,
      riskScore: 78,
      lifecycleStage: 'INVESTIGATE' as LifecycleStageKey,
      description:
        'পারিবারিক সহিংসতা ও দেনমোহর সংক্রান্ত নথির থাম্বনেইল ক্যাশিংয়ে এনআইডি বা মোবাইল নম্বর উন্মোচিত হওয়ার সম্ভাব্য ঝুঁকি।',
      remediationPlan:
        'ক্লায়েন্ট ও সার্ভার উভয় স্তরে বাধ্যতামূলক ডায়নামিক মাস্কিং এবং প্রিভিউ অ্যাক্সেসে ভূমিকাভিত্তিক সম্মতি নিশ্চিতকরণ।',
    },
    {
      id: 'VULN-DEMO-003',
      titleBn: 'গণহারে মামলা তালিকা এক্সপোর্ট এন্ডপয়েন্টে রেট লিমিটের অপ্রতুলতা',
      titleEn: 'Missing Rate Limiting on Bulk Case Data Export Endpoint',
      severity: 'HIGH' as const,
      asset: 'প্রতিবেদন ও ডেটা এক্সপোর্ট সেবা (/api/v1/reports/export)',
      owner: 'ইনফ্রাস্ট্রাকচার ও গেটওয়ে অ্যাডমিনিস্ট্রেটর',
      slaHours: 48,
      slaRemainingHours: 4,
      isSlaAtRisk: true,
      status: 'MITIGATING' as const,
      riskScore: 84,
      lifecycleStage: 'REMEDIATE' as LifecycleStageKey,
      description:
        'স্বল্প সময়ের মধ্যে একাধিকবার পূর্ণ জেলা পর্যায়ের মামলা তালিকা ডাউনলোড করার সুযোগ থাকায় স্ক্র্যাপিংয়ের তাত্ত্বিক ঝুঁকি।',
      remediationPlan:
        'টোকেন বাকেট অ্যালগরিদম ভিত্তিক হার নিয়ন্ত্রণ (প্রতি ১৫ মিনিটে সর্বোচ্চ ২টি এক্সপোর্ট) এবং এসআইইএম সতর্কতা সংযোজন।',
    },
    {
      id: 'VULN-DEMO-004',
      titleBn: 'আইনজীবীদের অসম কর্মভার ও অতিভারগ্রস্ততা নজরদারি ঘাটতি',
      titleEn: 'Lack of Real-time Alerting for Lawyer Overcapacity and Backlog',
      severity: 'MEDIUM' as const,
      asset: 'লিগ্যাল এইড ডিফেন্স কাউন্সিল সিস্টেম (LADCS) ইঞ্জিন',
      owner: 'জেলা লিগ্যাল এইড অফিসার সমন্বয় সেল',
      slaHours: 72,
      slaRemainingHours: 36,
      isSlaAtRisk: false,
      status: 'OPEN' as const,
      riskScore: 58,
      lifecycleStage: 'CLASSIFY' as LifecycleStageKey,
      description:
        'আইনজীবীদের বর্তমান মামলার সংখ্যা অনুমোদিত সীমার শতভাগ স্পর্শ করার পরও সিস্টেম স্বয়ংক্রিয়ভাবে নতুন মামলা নিয়োগ প্রতিরোধ করেনি।',
      remediationPlan:
        'মামলা নিয়োগ ফর্মে স্বয়ংক্রিয় ক্যাপ চেকার ও ওভারক্যাপাসিটি ব্লকার সক্রিয় করা।',
    },
    {
      id: 'VULN-DEMO-005',
      titleBn: 'অপরিবর্তনীয় অডিট লগে ডিজিটাল সাইনিং বা হ্যাশ চেইনের অনুপস্থিতি',
      titleEn: 'Absence of Cryptographic Hash Chaining on Sensitive Audit Trails',
      severity: 'HIGH' as const,
      asset: 'নিরাপত্তা অডিট ও কমপ্লায়েন্স লগ স্টোর',
      owner: 'ইনফরমেশন সিকিউরিটি অফিসার',
      slaHours: 48,
      slaRemainingHours: 28,
      isSlaAtRisk: false,
      status: 'RESOLVED' as const,
      riskScore: 74,
      lifecycleStage: 'AUDIT' as LifecycleStageKey,
      description:
        'ডাটাবেজ প্রশাসকের পক্ষে সরাসরি অডিট লগে পরিবর্তন আনার তাত্ত্বিক সুযোগ বিদ্যমান ছিল।',
      remediationPlan:
        'প্রত্যেকটি অডিট রেকর্ডের সাথে পূর্ববর্তী রেকর্ডের SHA-256 হ্যাশ লিঙ্ক এবং পরিবর্তন-অযোগ্য WORM পলিসি প্রয়োগ।',
    },
    {
      id: 'VULN-DEMO-006',
      titleBn: 'দীর্ঘ নিষ্ক্রিয় সেশন স্বয়ংক্রিয় সমাপ্তি (Timeout) বিলম্ব',
      titleEn: 'Excessive Inactive Session Timeout Configuration',
      severity: 'MEDIUM' as const,
      asset: 'আইডেন্টিটি অ্যান্ড এক্সেস ম্যানেজমেন্ট (IAM)',
      owner: 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
      slaHours: 72,
      slaRemainingHours: 52,
      isSlaAtRisk: false,
      status: 'RESOLVED' as const,
      riskScore: 48,
      lifecycleStage: 'VERIFY' as LifecycleStageKey,
      description:
        'পাবলিক আদালতের কম্পিউটারে খোলা থাকা সেশন দীর্ঘ সময় সক্রিয় থাকায় অননুমোদিত ব্যক্তি প্রবেশের ঝুঁকি ছিল।',
      remediationPlan:
        'সেশন নিষ্ক্রিয়তার সময়সীমা ১৫ মিনিটে নামিয়ে আনা এবং স্ক্রিন লক কার্যকর করা।',
    },
    {
      id: 'VULN-DEMO-007',
      titleBn: 'স্টেল কেস ও এসএলএ ঝুঁকিপূর্ণ মামলায় নোটিফিকেশন বিলম্ব',
      titleEn: 'Stale Case SLA Warning Delay in District Dashboard',
      severity: 'MEDIUM' as const,
      asset: 'এসএলএ ট্র্যাকার ব্যাকগ্রাউন্ড শিডিউলার',
      owner: 'অ্যাপ্লিকেশন সাপোর্ট টিম',
      slaHours: 72,
      slaRemainingHours: 12,
      isSlaAtRisk: false,
      status: 'OPEN' as const,
      riskScore: 62,
      lifecycleStage: 'DETECT' as LifecycleStageKey,
      description:
        '১৪ দিনের অধিক কার্যক্রমহীন মামলাগুলোর জন্য জেলা কর্মকর্তার ড্যাশবোর্ডে তাৎক্ষণিক পুশ নোটিফিকেশন না আসা।',
      remediationPlan:
        'প্রতিদিন সকালে স্বয়ংক্রিয় এসএলএ ডাইজেস্ট ও অ্যালার্ট ব্যানার তৈরি করা।',
    },
    {
      id: 'VULN-DEMO-008',
      titleBn: 'মাল্টি-ফ্যাক্টর প্রমাণীকরণ (MFA) বাধ্যবাধকতা ঘাটতি',
      titleEn: 'Missing Mandatory MFA for National Administrative Officers',
      severity: 'HIGH' as const,
      asset: 'প্রশাসনিক লগইন পোর্টাল',
      owner: 'জাতীয় নিরাপত্তা অপারেশন সেল',
      slaHours: 48,
      slaRemainingHours: 32,
      isSlaAtRisk: false,
      status: 'UNDER_REVIEW' as const,
      riskScore: 76,
      lifecycleStage: 'INVESTIGATE' as LifecycleStageKey,
      description:
        'জেলা ও জাতীয় পর্যায়ের শীর্ষ কর্মকর্তাদের অ্যাকাউন্টে শুধুমাত্র ইউজারনেম ও পাসওয়ার্ড ব্যবহার করা হচ্ছিল।',
      remediationPlan:
        'সময়ভিত্তিক ওটিপি বা হার্ডওয়্যার কি (FIDO2) ভিত্তিক দ্বি-স্তরীয় প্রমাণীকরণ বাধ্যতামূলক করা।',
    },
    {
      id: 'VULN-DEMO-009',
      titleBn: 'সাইবার অপরাধের ডিজিটাল আলামত চেইন-অফ-কাস্টডি ঘাটতি',
      titleEn: 'Weak Digital Chain of Custody in Cybercrime Evidence Uploads',
      severity: 'MEDIUM' as const,
      asset: 'ডিজিটাল এভিডেন্স ভল্ট',
      owner: 'সাইবার ফরেনসিক লিয়াজোঁ টিম',
      slaHours: 72,
      slaRemainingHours: 44,
      isSlaAtRisk: false,
      status: 'OPEN' as const,
      riskScore: 54,
      lifecycleStage: 'CLASSIFY' as LifecycleStageKey,
      description:
        'সোশ্যাল মিডিয়া স্ক্রিনশট ও চ্যাট হিস্ট্রি আপলোডের সময় অরিজিনাল মেটাডাটা ও আপলোডারের বায়োমেট্রিক সাইনিং সংরক্ষিত হচ্ছিল না।',
      remediationPlan:
        'আপলোডের মুহূর্তে স্বয়ংক্রিয় SHA-256 ফাইলে সাইন ও সার্ভার টাইমস্ট্যাম্প স্ট্যাম্পিং কার্যকর করা।',
    },
    {
      id: 'VULN-DEMO-010',
      titleBn: 'পুরাতন কর্মকর্তা বদলি পরবর্তী অ্যাকাউন্ট নিষ্ক্রিয়করণে কালক্ষেপণ',
      titleEn: 'Delayed Deprovisioning for Transferred Judicial Officers',
      severity: 'LOW' as const,
      asset: 'রোল অ্যান্ড এক্সেস ডিরেক্টরি',
      owner: 'এইচআর ও জেলা নথিপত্র সেল',
      slaHours: 120,
      slaRemainingHours: 85,
      isSlaAtRisk: false,
      status: 'RESOLVED' as const,
      riskScore: 35,
      lifecycleStage: 'AUDIT' as LifecycleStageKey,
      description:
        'বদলিপ্রাপ্ত বিচারিক কর্মকর্তাদের অ্যাকাউন্ট ম্যানুয়ালি নিষ্ক্রিয় করতে ৩-৫ দিন সময় লাগার দৃষ্টান্ত।',
      remediationPlan:
        'আইন মন্ত্রণালয়ের প্রজ্ঞাপন ট্র্যাকিংয়ের সাথে স্বয়ংক্রিয় অ্যাকাউন্ট এক্তিয়ার আপডেট সংযোগ।',
    },
    {
      id: 'VULN-DEMO-011',
      titleBn: 'ক্লিয়ারটেক্সট ইরর মেসেজে ইন্টারনাল ডেটাবেজ স্কিমা উন্মোচন',
      titleEn: 'Internal Database Schema Leakage via Verbose Error Responses',
      severity: 'LOW' as const,
      asset: 'ফ্রন্টএন্ড এপিআই ক্লায়েন্ট এক্সেপশন হ্যান্ডলার',
      owner: 'সফটওয়্যার ডেভেলপমেন্ট ইউনিট',
      slaHours: 120,
      slaRemainingHours: 104,
      isSlaAtRisk: false,
      status: 'RESOLVED' as const,
      riskScore: 28,
      lifecycleStage: 'AUDIT' as LifecycleStageKey,
      description:
        'ব্যর্থ কোয়েরি অনুরোধে সার্ভারের ইন্টারনাল টেবিল নাম ব্রাউজার কনসোলে প্রদর্শিত হওয়ার ঝুঁকি।',
      remediationPlan:
        'জেনেরিক ব্যবহারকারী-বান্ধব ত্রুটি বার্তা প্রদান ও ব্যাকএন্ডে বিস্তারিত লগ সীমাবদ্ধ রাখা।',
    },
    {
      id: 'VULN-DEMO-012',
      titleBn: 'উচ্চ অগ্রাধিকার সহিংস মামলার সময়সীমা পর্যবেক্ষণ অ্যালগরিদমে ত্রুটি',
      titleEn: 'Algorithmic Drift in High-Risk Case Urgency Prioritization',
      severity: 'MEDIUM' as const,
      asset: 'বিচারিক অগ্রাধিকার মূল্যায়ন ইঞ্জিন',
      owner: 'লিগ্যাল পলিসি ও কোয়ালিটি সেল',
      slaHours: 72,
      slaRemainingHours: 20,
      isSlaAtRisk: false,
      status: 'MITIGATING' as const,
      riskScore: 65,
      lifecycleStage: 'REMEDIATE' as LifecycleStageKey,
      description:
        'কিছু ক্ষেত্রে নারী ও শিশু মামলার সহিংসতার মাত্রা সঠিকভাবে স্কোরে প্রতিফলিত না হওয়ার অসঙ্গতি।',
      remediationPlan:
        'ঝুঁকি স্কোরে সহিংসতার ক্যাটাগরি ওয়েটেজ দ্বিগুণ করা এবং কর্মকর্তাদের সরাসরি ওভাররাইড অনুমোদন দেওয়া।',
    },
  ];

  const stages: { stage: LifecycleStageKey; bn: string; en: string; role: string }[] = [
    { stage: 'DETECT', bn: 'শনাক্তকরণ', en: 'Detection', role: 'স্বয়ংক্রিয় এআই সিকিউরিটি স্ক্যানার' },
    { stage: 'CLASSIFY', bn: 'শ্রেণিবিভাগ', en: 'Classification', role: 'সিকিউরিটি অপারেশন সেন্টার (SOC)' },
    { stage: 'CONTAIN', bn: 'নিয়ন্ত্রণ / কোয়ারেন্টাইন', en: 'Containment', role: 'আইটি সিকিউরিটি প্রকৌশলী' },
    { stage: 'INVESTIGATE', bn: 'মূল কারণ অনুসন্ধান', en: 'Root Cause Analysis', role: 'সিনিয়র সিস্টেম আর্কিটেক্ট' },
    { stage: 'REMEDIATE', bn: 'প্রতিকার ও প্যাচ প্রয়োগ', en: 'Remediation', role: 'অ্যাপ্লিকেশন টিম' },
    { stage: 'VERIFY', bn: 'পুনঃপরীক্ষা ও বৈধকরণ', en: 'Verification', role: 'স্বাধীন অডিট পর্যবেক্ষক' },
    { stage: 'AUDIT', bn: 'চূড়ান্ত অডিট ও সাইন-অফ', en: 'Formal Audit Signoff', role: 'প্রধান নিরাপত্তা কর্মকর্তা' },
  ];

  return vulnTemplates.map((template) => {
    // Generate lifecycle stages up to the current stage
    const currentIdx = stages.findIndex((s) => s.stage === template.lifecycleStage);
    const lifecycle: VulnerabilityLifecycleStage[] = stages.map((st, idx) => {
      let status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' = 'PENDING';
      let actionTaken = 'অপেক্ষমাণ';

      if (idx < currentIdx) {
        status = 'COMPLETED';
        actionTaken = `${st.bn} সফলভাবে সম্পন্ন ও নথিবদ্ধ`;
      } else if (idx === currentIdx) {
        status = 'IN_PROGRESS';
        actionTaken = `${st.bn} কার্যক্রম বর্তমানে সক্রিয়ভাবে চলমান`;
      }

      return {
        stage: st.stage,
        stageNameBn: st.bn,
        stageNameEn: st.en,
        timestamp: '০৯ সেপ্টেম্বর ২০২৬, বেলা ১১:২০',
        responsibleRole: st.role,
        actionTaken,
        status,
        evidenceRef: `AUDIT-REF-${template.id}-${st.stage}`,
      };
    });

    return {
      ...template,
      identifiedAt: '০৭ সেপ্টেম্বর ২০২৬',
      detectedAt: '০৭ সেপ্টেম্বর ২০২৬',
      lifecycle,
      isDemoData: true,
    };
  });
}
