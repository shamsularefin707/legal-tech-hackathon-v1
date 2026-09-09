/**
 * ৫০টি ডেমো মামলার নির্ধারক সিন্থেটিক জেনারেটর (Deterministic 500 Synthetic Cases Generator)
 * Strict distributions across 6 pilot districts, category quotas, priority levels, and SLA statuses.
 * All records include `isDemoData: true`.
 */

import {
  LegalAidCase,
  CaseCategory,
  CaseStatus,
  PriorityLevel,
  PanelLawyer,
  CaseDeadline,
  HearingRecord,
  TimelineEvent,
  CaseDocument,
} from '../types/legalAid';
import {
  PILOT_DISTRICTS,
  COURT_TYPES,
  SeededRandom,
  TOTAL_CASES_TARGET,
} from './demoConfig';

const FEMALE_NAMES = [
  'মোছা. নাসরিন আক্তার',
  'সুমাইয়া রহমান',
  'ফারহানা পারভীন',
  'মোছা. শিউলি বেগম',
  'তাহমিনা চৌধুরী',
  'সাদিয়া ইসলাম',
  'রুকসানা খাতুন',
  'নাজমা বেগম',
  'মমতাজ বেগম',
  'মোছা. মরিয়ম আক্তার',
  'লতিফা হক',
  'শিরীন সুলতানা',
  'তাসলিমা জাহান',
  'খোদেজা বানু',
  'শাহনাজ পারভীন',
  'জান্নাতুল ফেরদৌস',
  'রাবেয়া বসরী',
  'নূরজাহান আক্তার',
  'আলেয়া বেগম',
  'সাবরিনা আক্তার',
];

const MALE_NAMES = [
  'মো. রফিকুল ইসলাম',
  'মোঃ কামাল হোসেন',
  'আব্দুর রহিম মিয়া',
  'মোঃ শহিদুল ইসলাম',
  'মো. হাবিবুর রহমান',
  'মোঃ সেলিম রেজা',
  'মোঃ শাহজাহান আলী',
  'মো. আনোয়ার হোসেন',
  'মোঃ জহিরুল হক',
  'মো. সাইদুল হাসান',
  'মোঃ মজিবুর রহমান',
  'মো. আল-আমিন',
  'মোঃ তোফাজ্জল হোসেন',
  'মো. নাসির উদ্দিন',
  'মোঃ মনিরুল ইসলাম',
];

const OPPOSING_NAMES = [
  'মোঃ তারেক মাহমুদ',
  'মোঃ দেলোয়ার হোসেন',
  'বুলবুল আহমেদ',
  'মো. শফিকুল ইসলাম',
  'মোখলেছুর রহমান',
  'মোঃ আলমগীর কবির',
  'রিয়াজুল ইসলাম',
  'মোঃ জয়নাল আবেদীন',
  'কাদের মোল্লা',
  'মেসার্স সততা হাউজিং',
  'স্থানীয় প্রভাব বিস্তারকারী পক্ষ',
  'মো. আশরাফ আলী',
];

const FEMALE_VULNERABILITIES = [
  'নারী ও শিশু',
  'অতি দরিদ্র (মাসিক আয় < ৫০০০ টাকা)',
  'শারীরিক ও মানসিক সহিংসতার শিকার',
  'নাবালক সন্তানের একক অভিভাবক',
  'আর্থিক পরনির্ভরশীল ও গৃহহীনতার ঝুঁকি',
  'আইনি প্রক্রিয়া ব্যয়ে সম্পূর্ণ অক্ষম',
  'নিপীড়ক পক্ষের পক্ষ থেকে হুমকি',
];

const LAND_VULNERABILITIES = [
  'প্রান্তিক কৃষক ও বসতবাড়ি হারানোর ঝুঁকি',
  'দরিদ্র পরিবার ও বিধবা নারী সদস্য',
  'ভুয়া দলিল ও অবৈধ দখলের শিকার',
  'আদালতের খরচ বহনে অসমর্থ',
  'উত্তরাধিকার বঞ্চিত',
];

const GENERAL_VULNERABILITIES = [
  'হতদরিদ্র দিনমজুর',
  'আইনগত সহায়তা অশিক্ষিত/অসচেতন',
  'প্রতিবন্ধী সদস্য পরিবার',
  'বয়োবৃদ্ধ ও কর্মহীন',
  'নাবালক সন্তান পরিবার',
];

interface CaseGenTemplate {
  category: CaseCategory;
  caseCategory: string;
  caseSubcategory: string;
  isSensitive: boolean;
  isLand: boolean;
  isCyber: boolean;
  isBribery: boolean;
  legalIssues: string[];
  reliefSought: string;
  riskFactors: string[];
  vulnerabilities: string[];
}

const TEMPLATES: CaseGenTemplate[] = [
  // Women / Gender-based / Family (57%)
  {
    category: 'WOMEN_CHILD',
    caseCategory: 'WOMEN_CHILD',
    caseSubcategory: 'যৌতুক দাবি ও পারিবারিক সহিংসতা',
    isSensitive: true,
    isLand: false,
    isCyber: false,
    isBribery: false,
    legalIssues: ['যৌতুক নিরোধ আইন ২০১৮ এর ৩ ধারা', 'পারিবারিক সহিংসতা প্রতিরোধ আইন ২০১০ এর ধারা ৩ ও ৪'],
    reliefSought: 'পারিবারিক সুরক্ষা আদেশ ও শারীরিক ক্ষতিপূরণ প্রদান।',
    riskFactors: ['শারীরিক সহিংসতার ধারাবাহিক পুনরাবৃত্তি', 'শিশুর সামনে হুমকি প্রদর্শন', 'বাসস্থান থেকে উচ্ছেদের শঙ্কা'],
    vulnerabilities: ['নারী ও শিশু', 'শারীরিক ও মানসিক সহিংসতার শিকার', 'নাবালক সন্তানের একক অভিভাবক'],
  },
  {
    category: 'FAMILY',
    caseCategory: 'FAMILY',
    caseSubcategory: 'স্ত্রী ও সন্তানের ভরণপোষণ ও দেনমোহর আদায়',
    isSensitive: true,
    isLand: false,
    isCyber: false,
    isBribery: false,
    legalIssues: ['পারিবারিক আদালত আইন ২০২৩ এর ৫ ধারা', 'মুসলিম পারিবারিক আইন অধ্যাদেশ ১৯৬১ এর ৯ ধারা'],
    reliefSought: 'বকেয়া ও মাসিক ভরণপোষণ এবং বাকি দেনমোহর বাবদ পাওনা উদ্ধার।',
    riskFactors: ['সন্তানের মৌলিক ব্যয় বন্ধ', 'আর্থিক নিঃস্বতার ঝুঁকি', 'আইনি নোটিশ উপেক্ষা'],
    vulnerabilities: ['অতি দরিদ্র', 'নাবালক সন্তানের অভিভাবক', 'গৃহহীনতার ঝুঁকি'],
  },
  {
    category: 'WOMEN_CHILD',
    caseCategory: 'WOMEN_CHILD',
    caseSubcategory: 'যৌন হয়রানি ও পথচারী উত্ত্যক্তকরণ',
    isSensitive: true,
    isLand: false,
    isCyber: false,
    isBribery: false,
    legalIssues: ['নারী ও শিশু নির্যাতন দমন আইন ২০০০ এর ১০ ধারা'],
    reliefSought: 'অপরাধীর বিরুদ্ধে কঠোর আইনি ব্যবস্থা ও আবেদনকারীর ব্যক্তিগত নিরাপত্তা নিশ্চিতকরণ।',
    riskFactors: ['কর্মক্ষেত্র/শিক্ষা প্রতিষ্ঠানে ক্রমাগত ভীতি প্রদর্শন', 'মানসিক চাপ'],
    vulnerabilities: ['নারী', 'নিপীড়ক পক্ষের স্থানীয় প্রভাব'],
  },
  {
    category: 'WOMEN_CHILD',
    caseCategory: 'WOMEN_CHILD',
    caseSubcategory: 'যৌন সহিংসতা সংক্রান্ত অভিযোগ',
    isSensitive: true,
    isLand: false,
    isCyber: false,
    isBribery: false,
    legalIssues: ['নারী ও শিশু নির্যাতন দমন আইন ২০০০ এর ৯(১) ধারা'],
    reliefSought: 'আইনগত প্রতিকার, বিজ্ঞ আদালতে ট্রায়াল সুরক্ষা ও চিকিৎসা আইনি সহায়তা।',
    riskFactors: ['ভুক্তভোগীর প্রাণনাশের হুমকি', 'সাক্ষী প্রভাবিত করার চেষ্টা', 'চরম সামাজিক সংকট'],
    vulnerabilities: ['চরম ট্রমা ও ঝুঁকি', 'সুরক্ষিত ভুক্তভোগী পরিচয়', 'আইনগত নিরাপত্তা অভাব'],
  },
  {
    category: 'FAMILY',
    caseCategory: 'FAMILY',
    caseSubcategory: 'নাবালক সন্তানের বৈধ অভিভাবকত্ব ও জিম্মাদারি',
    isSensitive: true,
    isLand: false,
    isCyber: false,
    isBribery: false,
    legalIssues: ['গার্ডিয়ানস অ্যান্ড ওয়ার্ডস অ্যাক্ট ১৮৯০ এর ২৫ ধারা'],
    reliefSought: 'নাবালকের নিরাপত্তা ও মায়ের অনুকূলে সন্তানের জিম্মাদারি বহাল রাখা।',
    riskFactors: ['সন্তানকে বলপূর্বক ছিনিয়ে নেওয়ার আশঙ্কা', 'সন্তানের স্বাস্থ্য ও নিরাপত্তা সংকট'],
    vulnerabilities: ['নাবালক সন্তান', 'মা ও শিশুর নিরাপত্তাহীনতা'],
  },
  {
    category: 'FAMILY',
    caseCategory: 'FAMILY',
    caseSubcategory: 'বিয়ে বিচ্ছেদ পরবর্তী সুরক্ষা ও পারিবারিক অধিকার',
    isSensitive: true,
    isLand: false,
    isCyber: false,
    isBribery: false,
    legalIssues: ['পারিবারিক আদালত আইন ২০২৩', 'মুসলিম বিবাহ বিচ্ছেদ আইন ১৯৩৯'],
    reliefSought: 'বিচ্ছেদ সংক্রান্ত ন্যায়সংগত নিষ্পত্তি ও নিজস্ব মালামাল ফেরত পাওয়া।',
    riskFactors: ['আর্থিক সহায় সম্বলহীনতা', 'শ্বশুরবাড়ির পক্ষের ভীতি প্রদর্শন'],
    vulnerabilities: ['নারী', 'পারিবারিক অভিভাবকহীনতা'],
  },

  // Land / Property (20%)
  {
    category: 'LAND_PROPERTY',
    caseCategory: 'LAND_PROPERTY',
    caseSubcategory: 'পৈতৃক বসতভিটা ও কৃষি জমির সীমানা বিরোধ',
    isSensitive: false,
    isLand: true,
    isCyber: false,
    isBribery: false,
    legalIssues: ['সুনির্দিষ্ট প্রতিকার আইন ১৮৭৭ এর ৮ ও ৯ ধারা', 'বঙ্গীয় প্রজাস্বত্ব আইন'],
    reliefSought: 'বেদখলকৃত বসতবাড়ি পুনরুদ্ধার ও শান্তিশৃঙ্খলা বজায় রাখার নিষেধাজ্ঞা আদেশ।',
    riskFactors: ['জমি জবরদখল ও বলপ্রয়োগ', 'ফসলি জমি বিনষ্ট', 'স্থানীয় সালিশে অবজ্ঞা'],
    vulnerabilities: ['প্রান্তিক কৃষক ও বসতবাড়ি হারানোর ঝুঁকি', 'দরিদ্র পরিবার'],
  },
  {
    category: 'LAND_PROPERTY',
    caseCategory: 'LAND_PROPERTY',
    caseSubcategory: 'ভুয়া আমমোক্তারনামা ও অবৈধ দলিল বাতিল মোকদ্দমা',
    isSensitive: false,
    isLand: true,
    isCyber: false,
    isBribery: false,
    legalIssues: ['সুনির্দিষ্ট প্রতিকার আইন ১৮৭৭ এর ৩৯ ধারা', 'রেজিস্ট্রেশন আইন ১৯০৮'],
    reliefSought: 'জাল দলিল বাতিল ঘোষণা এবং স্বত্ব সাব্যস্তক্রমে দখল বহাল রাখা।',
    riskFactors: ['তৃতীয় পক্ষের কাছে দ্রুত বিক্রির পাঁয়তারা', 'জালিয়াত চক্রের প্রভাব'],
    vulnerabilities: ['অসহায় ওয়ারিশান', 'আইনি ব্যয় বহনে অক্ষম'],
  },
  {
    category: 'LAND_PROPERTY',
    caseCategory: 'LAND_PROPERTY',
    caseSubcategory: 'উত্তরাধিকার সূত্রে প্রাপ্ত সম্পত্তিতে বাঁটোয়ারা দাবি',
    isSensitive: false,
    isLand: true,
    isCyber: false,
    isBribery: false,
    legalIssues: ['বণ্টন আইন ১৮৯৩ (Partition Act)', 'দেওয়ানি কার্যবিধি'],
    reliefSought: 'সহ-অংশীদারদের মধ্যে সুষম বণ্টনের প্রাথমিক ও চূড়ান্ত ডিক্রি জারি।',
    riskFactors: ['অন্যান্য অংশীদার কর্তৃক সম্পত্তিতে প্রবেশে বাধা', 'ভাঙচুরের হুমকি'],
    vulnerabilities: ['নারী ও এতিম উত্তরাধিকারী'],
  },

  // Violence / Criminal Matters (10%)
  {
    category: 'CRIMINAL',
    caseCategory: 'CRIMINAL',
    caseSubcategory: 'মারপিট, গুরুতর জখম ও অপরাধমূলক ভীতি প্রদর্শন',
    isSensitive: false,
    isLand: false,
    isCyber: false,
    isBribery: false,
    legalIssues: ['দণ্ডবিধি ১৮৬০ এর ৩২৩, ৩২৪, ৩২৫ ও ৫০৬ ধারা'],
    reliefSought: 'বিচারিক ট্রায়ালে রাষ্ট্রপক্ষের আইনি সহায়তা ও আসামিদের দৃষ্টান্তমূলক শাস্তি।',
    riskFactors: ['পুনরায় হামলার হুমকি', 'অভিযোগ প্রত্যাহারের অন্যায় চাপ'],
    vulnerabilities: ['আহত দরিদ্র ভুক্তভোগী', 'চিকিৎসা খরচে নিঃস্ব'],
  },
  {
    category: 'CRIMINAL',
    caseCategory: 'CRIMINAL',
    caseSubcategory: 'চুরি, গৃহে অনধিকার প্রবেশ ও মালামাল লুটপাট',
    isSensitive: false,
    isLand: false,
    isCyber: false,
    isBribery: false,
    legalIssues: ['দণ্ডবিধি ১৮৬০ এর ৩৮০ ও ৪৪৮ ধারা'],
    reliefSought: 'লুণ্ঠিত সম্পদ উদ্ধার ও বিজ্ঞ আদালতে বিচার ত্বরান্বিতকরণ।',
    riskFactors: ['অজ্ঞাতনামা দুষ্কৃতীদের তৎপরতা', 'নিরাপত্তাহীনতা'],
    vulnerabilities: ['নিঃস্ব পরিবার'],
  },

  // Cybercrime (5%)
  {
    category: 'CRIMINAL',
    caseCategory: 'CYBERCRIME',
    caseSubcategory: 'সামাজিক মাধ্যমে ভুয়া আইডি খুলে ব্ল্যাকমেইল ও মানহানি',
    isSensitive: true,
    isLand: false,
    isCyber: true,
    isBribery: false,
    legalIssues: ['সাইবার নিরাপত্তা আইন ২০২৩ / ডিজিটাল নিরাপত্তা বিধানাবলী'],
    reliefSought: 'ডিজিটাল আলামত সংরক্ষণ, ভুয়া অ্যাকাউন্ট নিষ্ক্রিয় ও আসামির বিরুদ্ধে আইনানুগ ব্যবস্থা।',
    riskFactors: ['ডিজিটাল তথ্য ছড়িয়ে পড়ার ঝুঁকি', 'ব্যক্তিগত সুনাম ক্ষুণ্ণ হওয়া', 'মানসিক চাপ'],
    vulnerabilities: ['তরুণী শিক্ষার্থী', 'ডিজিটাল ফরেনসিক ব্যয় বহনে অপারগ'],
  },
  {
    category: 'CRIMINAL',
    caseCategory: 'CYBERCRIME',
    caseSubcategory: 'অনলাইনে পরিচয় জালিয়াতি ও আর্থিক প্রতারণা',
    isSensitive: false,
    isLand: false,
    isCyber: true,
    isBribery: false,
    legalIssues: ['সাইবার আইন ও দণ্ডবিধি ৪২০ ধারা'],
    reliefSought: 'মোবাইল ফিন্যান্সিয়াল অ্যাকাউন্টের অপব্যবহার রোধ ও ক্ষতিপূরণ উদ্ধার।',
    riskFactors: ['প্রতারক চক্রের ট্র্যাক হারানো', 'লেনদেন লুকানোর চেষ্টা'],
    vulnerabilities: ['দরিদ্র গ্রাহক', 'প্রযুক্তিতে অনভিজ্ঞ'],
  },

  // Bribery / Corruption Allegations (3%)
  {
    category: 'CIVIL',
    caseCategory: 'BRIBERY_CORRUPTION',
    caseSubcategory: 'সেবা প্রদানে অনৈতিক অর্থ দাবি সংক্রান্ত অভিযোগ',
    isSensitive: false,
    isLand: false,
    isCyber: false,
    isBribery: true,
    legalIssues: ['দুর্নীতি প্রতিরোধ সংক্রান্ত আইনগত ধারা ও প্রশাসনিক ট্রাইব্যুনাল প্রতিকার'],
    reliefSought: 'বিজ্ঞ আদালতের তত্ত্বাবধানে আইনসঙ্গত সেবা প্রাপ্তি ও হয়রানি বন্ধ।',
    riskFactors: ['প্রশাসনিক ফাইল আটকে রাখার হুমকি', 'প্রতিশোধমূলক হয়রানি'],
    vulnerabilities: ['প্রান্তিক নাগরিক', 'নিয়মমাফিক সেবা থেকে বঞ্চিত'],
  },

  // Other Legal Aid (Labour, Consumer Rights, Human Rights - 5%)
  {
    category: 'LABOUR',
    caseCategory: 'LABOUR',
    caseSubcategory: 'বিনা নোটিশে চাকরিচ্যুতি ও বকেয়া বেতন আদায়',
    isSensitive: false,
    isLand: false,
    isCyber: false,
    isBribery: false,
    legalIssues: ['বাংলাদেশ শ্রম আইন ২০০৬ এর ধারা ২৬ ও ৩৩'],
    reliefSought: 'শ্রম আদালতে বকেয়া মজুরি, সার্ভিস বেনিফিট ও আইনসম্মত ক্ষতিপূরণ উদ্ধার।',
    riskFactors: ['মালিকপক্ষের গড়িমসি', 'শ্রমিকের বাসাভাড়া ও অন্নের সংকট'],
    vulnerabilities: ['পোশাক শ্রমিক', 'দৈনন্দিন আয়ের উপর নির্ভরশীল'],
  },
  {
    category: 'CONSUMER_RIGHTS',
    caseCategory: 'CONSUMER_RIGHTS',
    caseSubcategory: 'ভেজাল কৃষি কীটনাশক সরবরাহ ও ফসল নষ্টের ক্ষতিপূরণ',
    isSensitive: false,
    isLand: false,
    isCyber: false,
    isBribery: false,
    legalIssues: ['ভোক্তা-অধিকার সংরক্ষণ আইন ২০০৯'],
    reliefSought: 'ক্ষতিপূরণ প্রদান ও অসাধু ব্যবসায়ীর বিরুদ্ধে বিচারিক ব্যবস্থা।',
    riskFactors: ['মৌসুমি ফসল নষ্ট', 'ঋণখেলাপির ঝুঁকি'],
    vulnerabilities: ['ক্ষুদ্র চাষী'],
  },
];

export function generateSyntheticCases(
  rng: SeededRandom,
  lawyers: PanelLawyer[]
): LegalAidCase[] {
  const cases: LegalAidCase[] = [];

  // Exact target district distribution
  // Dhaka: 150, Gazipur: 80, Narayanganj: 75, Chattogram: 75, Cumilla: 65, Tangail: 55 = 500 total
  const districtQuotas: { district: string; count: number; upazilas: string[] }[] =
    PILOT_DISTRICTS.map((d) => ({
      district: d.districtBn,
      count: d.targetCases,
      upazilas: d.upazilas,
    }));

  // Target category distribution among 500 cases:
  // Women / Gender / Family: 285 (57%)
  // Land / Property: 100 (20%)
  // Criminal / Violence: 50 (10%)
  // Cybercrime: 25 (5%)
  // Bribery / Corruption: 15 (3%)
  // Other: 25 (5%)
  // Total = 500 cases.
  const categoryPlan: ('WOMEN_GENDER' | 'LAND' | 'VIOLENCE' | 'CYBER' | 'BRIBERY' | 'OTHER')[] = [];
  for (let i = 0; i < 285; i++) categoryPlan.push('WOMEN_GENDER');
  for (let i = 0; i < 100; i++) categoryPlan.push('LAND');
  for (let i = 0; i < 50; i++) categoryPlan.push('VIOLENCE');
  for (let i = 0; i < 25; i++) categoryPlan.push('CYBER');
  for (let i = 0; i < 15; i++) categoryPlan.push('BRIBERY');
  for (let i = 0; i < 25; i++) categoryPlan.push('OTHER');

  // Status distribution (500 total):
  // PENDING_LAWYER_ASSIGNMENT: 30
  // LAWYER_ASSIGNED: 65
  // IN_PROGRESS: 195
  // HEARING_ONGOING: 110
  // MEDIATION_ONGOING: 35
  // DISPOSED: 65
  // Sum = 500
  const statusPlan: CaseStatus[] = [];
  for (let i = 0; i < 30; i++) statusPlan.push('PENDING_LAWYER_ASSIGNMENT');
  for (let i = 0; i < 65; i++) statusPlan.push('LAWYER_ASSIGNED');
  for (let i = 0; i < 195; i++) statusPlan.push('IN_PROGRESS');
  for (let i = 0; i < 110; i++) statusPlan.push('HEARING_ONGOING');
  for (let i = 0; i < 35; i++) statusPlan.push('MEDIATION_ONGOING');
  for (let i = 0; i < 65; i++) statusPlan.push('DISPOSED');

  // Priority distribution:
  // VERY_HIGH: 40 (8%)
  // HIGH: 125 (25%)
  // MEDIUM: 225 (45%)
  // LOW: 110 (22%)
  // Sum = 500
  const priorityPlan: PriorityLevel[] = [];
  for (let i = 0; i < 40; i++) priorityPlan.push('VERY_HIGH');
  for (let i = 0; i < 125; i++) priorityPlan.push('HIGH');
  for (let i = 0; i < 225; i++) priorityPlan.push('MEDIUM');
  for (let i = 0; i < 110; i++) priorityPlan.push('LOW');

  // SLA status plan:
  // BREACHED: 32 (6.4%)
  // APPROACHING_RISK: 65 (13%)
  // NORMAL: 403 (80.6%)
  const slaPlan: ('BREACHED' | 'APPROACHING_RISK' | 'NORMAL')[] = [];
  for (let i = 0; i < 32; i++) slaPlan.push('BREACHED');
  for (let i = 0; i < 65; i++) slaPlan.push('APPROACHING_RISK');
  for (let i = 0; i < 403; i++) slaPlan.push('NORMAL');

  // Pre-shuffle plans using seeded random
  const shuffledCategoryPlan = rng.sample(categoryPlan, categoryPlan.length);
  const shuffledStatusPlan = rng.sample(statusPlan, statusPlan.length);
  const shuffledPriorityPlan = rng.sample(priorityPlan, priorityPlan.length);
  const shuffledSlaPlan = rng.sample(slaPlan, slaPlan.length);

  let caseCounter = 1;

  for (const distConfig of districtQuotas) {
    const districtLawyers = lawyers.filter((l) => l.district === distConfig.district);

    for (let c = 0; c < distConfig.count; c++) {
      const globalIndex = caseCounter - 1;
      const categoryType = shuffledCategoryPlan[globalIndex] || 'WOMEN_GENDER';
      const status = shuffledStatusPlan[globalIndex] || 'IN_PROGRESS';
      const priority = shuffledPriorityPlan[globalIndex] || 'MEDIUM';
      const slaStatus = shuffledSlaPlan[globalIndex] || 'NORMAL';

      // Pick matching template
      let matchedTemplates = TEMPLATES.filter((t) => {
        if (categoryType === 'WOMEN_GENDER')
          return t.category === 'WOMEN_CHILD' || t.category === 'FAMILY';
        if (categoryType === 'LAND') return t.category === 'LAND_PROPERTY';
        if (categoryType === 'VIOLENCE') return t.category === 'CRIMINAL' && !t.isCyber;
        if (categoryType === 'CYBER') return t.isCyber;
        if (categoryType === 'BRIBERY') return t.isBribery;
        return t.category === 'LABOUR' || t.category === 'CONSUMER_RIGHTS';
      });
      if (matchedTemplates.length === 0) matchedTemplates = [TEMPLATES[0]];
      const template = rng.pick(matchedTemplates);

      const upazila = rng.pick(distConfig.upazilas);
      const courtType = rng.pick(COURT_TYPES);

      // Dedicated flagship cases retaining known IDs
      let caseId = `LA-DEMO-2026-${String(caseCounter).padStart(4, '0')}`;
      if (caseCounter === 1) caseId = 'case-1284'; // Flagship case in Dhaka
      else if (caseCounter === 2) caseId = 'case-1219'; // Stale case in Gazipur
      else if (caseCounter === 3) caseId = 'case-1190'; // SLA overdue case in Narayanganj

      const isFemale =
        categoryType === 'WOMEN_GENDER' ||
        template.category === 'WOMEN_CHILD' ||
        rng.next() < 0.65;
      const applicantName = isFemale ? rng.pick(FEMALE_NAMES) : rng.pick(MALE_NAMES);
      const opposingName = rng.pick(OPPOSING_NAMES);

      // Masked identifiers
      const nidEnd = String(rng.nextInt(1000, 9999));
      const phoneEnd = String(rng.nextInt(10, 99));
      const nidMasked = `*********${nidEnd}`;
      const phoneMasked = `017******${phoneEnd}`;

      // Display name protection for sensitive cases
      const isHighlySensitive =
        template.isSensitive ||
        template.caseSubcategory.includes('যৌন') ||
        template.caseSubcategory.includes('সহিংসতা') ||
        priority === 'VERY_HIGH';

      const applicantDisplayName = isHighlySensitive
        ? `ডেমো আবেদনকারী ${String(caseCounter).padStart(3, '0')} (সুরক্ষিত)`
        : `ডেমো আবেদনকারী ${String(caseCounter).padStart(3, '0')} (${applicantName.split(' ')[0]})`;

      // Assign lawyer if appropriate
      let assignedLawyer: PanelLawyer | undefined = undefined;
      if (status !== 'PENDING_LAWYER_ASSIGNMENT' && districtLawyers.length > 0) {
        // Prefer lawyer with matching specialization
        const matchingLawyers = districtLawyers.filter((l) =>
          l.specialisations.includes(template.category)
        );
        assignedLawyer =
          matchingLawyers.length > 0 ? rng.pick(matchingLawyers) : rng.pick(districtLawyers);
      }

      // Risk score calculation (20 - 99)
      let calculatedRiskScore = 45;
      if (priority === 'VERY_HIGH') calculatedRiskScore = rng.nextInt(85, 99);
      else if (priority === 'HIGH') calculatedRiskScore = rng.nextInt(70, 84);
      else if (priority === 'MEDIUM') calculatedRiskScore = rng.nextInt(45, 69);
      else calculatedRiskScore = rng.nextInt(20, 44);

      if (slaStatus === 'BREACHED') calculatedRiskScore = Math.min(99, calculatedRiskScore + 10);

      // Deadlines & SLA
      const daysSinceActivity =
        caseCounter === 2 // case-1219 is specifically stale
          ? 18
          : slaStatus === 'BREACHED'
          ? rng.nextInt(15, 32)
          : slaStatus === 'APPROACHING_RISK'
          ? rng.nextInt(7, 13)
          : rng.nextInt(1, 6);

      const daysWithoutActivity = daysSinceActivity;

      const deadlines: CaseDeadline[] = [];
      const deadlinesCount = rng.nextInt(1, 3);
      for (let d = 0; d < deadlinesCount; d++) {
        const isOverdue = slaStatus === 'BREACHED' && d === 0;
        const daysRem = isOverdue
          ? -rng.nextInt(1, 10)
          : slaStatus === 'APPROACHING_RISK' && d === 0
          ? rng.nextInt(1, 3)
          : rng.nextInt(4, 25);

        const dueDay = Math.max(1, (11 + daysRem) % 28);
        deadlines.push({
          id: `dl-${caseCounter}-${d + 1}`,
          title:
            d === 0
              ? 'আইনজীবী কর্তৃক অন্তর্বর্তীকালীন আবেদন / জবাব দাখিল'
              : 'বিজ্ঞ আদালতের তলবকৃত নথিপত্র উপস্থাপন',
          dueDate: `${dueDay} সেপ্টেম্বর ২০২৬`,
          daysRemaining: daysRem,
          category:
            isOverdue
              ? 'OVERDUE'
              : daysRem <= 3
              ? 'URGENT'
              : daysRem <= 7
              ? 'WITHIN_7_DAYS'
              : 'AT_RISK',
          assignedOfficer: 'জেলা লিগ্যাল এইড অফিসার',
          assignedLawyer: assignedLawyer?.name,
          status: isOverdue ? 'OVERDUE' : 'PENDING',
          actionRequired: isOverdue
            ? 'জরুরি নোটিশ জারি ও ব্যাখ্যা তলব'
            : 'নথি প্রস্তুতকরণ ও আদালতে দাখিল',
        });
      }

      // Hearings
      const hearings: HearingRecord[] = [];
      if (status === 'HEARING_ONGOING' || status === 'IN_PROGRESS') {
        hearings.push({
          id: `hear-${caseCounter}-1`,
          date: `${rng.nextInt(12, 28)} সেপ্টেম্বর ২০২৬`,
          time: '১০:৩০ পূর্বাহ্ণ',
          courtName: `${distConfig.district} জেলা আদালত`,
          benchCourtNumber: 'আদালত কক্ষ নং ০৩',
          judgeName: 'বিজ্ঞ বিচারক',
          purpose: 'চার্জ গঠন / অন্তর্বর্তীকালীন সুরক্ষা আদেশ শুনানি',
          status: 'নির্ধারিত',
          courtOutcomeSummary: 'শুনানি অব্যাহত রয়েছে',
          nextDate: '২৯ সেপ্টেম্বর ২০২৬',
        });
      }

      // Timeline events
      const timeline: TimelineEvent[] = [
        {
          id: `tl-${caseCounter}-1`,
          date: '০১ আগস্ট ২০২৬',
          time: '১০:০০ ঘটিকা',
          user: 'মো. সাইদুল ইসলাম',
          role: 'বেঞ্চ সহকারী',
          action: 'আবেদন নিবন্ধন সম্পন্ন',
          description: 'আবেদনকারীর আর্থসামাজিক অবস্থা ও এনআইডি রেকর্ড যাচাইপূর্বক তালিকাভুক্ত।',
          isOfficialRecord: true,
        },
      ];

      if (assignedLawyer) {
        timeline.push({
          id: `tl-${caseCounter}-2`,
          date: '০৮ আগস্ট ২০২৬',
          time: '১১:৩০ ঘটিকা',
          user: 'মো. মাহবুবুর রহমান',
          role: 'সিনিয়র সহকারী জজ',
          action: 'প্যানেল আইনজীবী নিয়োগ অনুমোদন',
          description: `দায়িত্বপ্রাপ্ত আইনজীবী: ${assignedLawyer.name} (${assignedLawyer.barRegNo})`,
          isOfficialRecord: true,
        });
      }

      // Documents
      const documents: CaseDocument[] = [
        {
          id: `doc-${caseCounter}-app`,
          title: 'আইনগত সহায়তা আবেদনপত্র ও হলফনামা',
          category: 'APPLICATION',
          fileName: `application_${caseCounter}.pdf`,
          fileSizeBytes: 420000,
          uploadedAt: '০২ আগস্ট ২০২৬',
          uploadedBy: 'ফ্রন্ট ডেস্ক সহকারী',
          mimeType: 'application/pdf',
          securityHash: `sha256-demo-${caseCounter}app`,
          isRestricted: false,
          accessCount: rng.nextInt(1, 5),
        },
      ];

      if (template.isSensitive && caseCounter === 1) {
        // Retain the specific nikahnama document for case-1284
        documents.push({
          id: 'doc-4',
          title: 'নিকাহনামা ও কাবিননামা দলিল (সংবেদনশীল)',
          category: 'IDENTITY',
          fileName: 'nikahnama_certified_copy.pdf',
          fileSizeBytes: 1250000,
          uploadedAt: '০৪ সেপ্টেম্বর ২০২৬',
          uploadedBy: 'ফ্রন্ট ডেস্ক সহকারী',
          mimeType: 'application/pdf',
          securityHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          isRestricted: true,
          accessCount: 3,
        });
      }

      // Domain-specific fields
      let propertyType: 'Agricultural' | 'Residential' | 'Commercial' | 'Inherited property' | 'Government/claimed public land' | undefined = undefined;
      if (template.isLand) {
        propertyType = rng.pick([
          'Agricultural',
          'Residential',
          'Inherited property',
          'Commercial',
        ]);
      }

      const caseDescription = template.isSensitive
        ? template.caseSubcategory.includes('যৌন')
          ? 'Synthetic case involving an allegation of sexual violence. Detailed facts intentionally omitted from demo dataset.'
          : `${template.caseSubcategory} বিষয়ে আইনি প্রতিকার ও পারিবারিক সুরক্ষা চেয়ে দাখিলকৃত আবেদন।`
        : template.isBribery
        ? 'Allegation of demanding unlawful gratification during municipal trade license renewal. Stated as reported allegation pending formal judicial verification.'
        : `${distConfig.district} জেলার ${upazila} এলাকায় সংঘটিত ${template.caseSubcategory} সংক্রান্ত আইনি বিরোধ।`;

      const generatedCase: LegalAidCase = {
        id: caseId,
        isDemoData: true,
        caseNumber: caseId.startsWith('case-')
          ? `LA-DEMO-2026-00${caseId.replace('case-', '')}`
          : caseId,
        courtCaseNumber: `নালিশী মোকদ্দমা নং ${rng.nextInt(100, 990)}/২০২৬`,
        courtName: `${distConfig.district} ${courtType}`,
        courtType,
        district: distConfig.district,
        upazila,
        category: template.category,
        status,
        priorityAssessment: {
          calculatedPriority: priority,
          score:
            priority === 'VERY_HIGH'
              ? 92
              : priority === 'HIGH'
              ? 78
              : priority === 'MEDIUM'
              ? 55
              : 30,
          factors: [
            {
              title: template.isSensitive
                ? 'শারীরিক ও সামাজিক নিরাপত্তার ঝুঁকি'
                : 'আর্থিক সংকট ও জীবিকা অনিশ্চয়তা',
              impact: 'POSITIVE',
              description: template.isSensitive
                ? 'আবেদনকারীর উপর শারীরিক নির্যাতনের আশঙ্কা ও জরুরি সুরক্ষা আদেশ প্রয়োজন।'
                : 'নিয়মিত আয়ের উৎস নেই এবং আইনি ফি বহনে সম্পূর্ণ অসমর্থ।',
            },
            {
              title: isFemale
                ? 'নারী ও প্রান্তিক জনগোষ্ঠীর আইনি সুরক্ষা'
                : 'দীর্ঘমেয়াদী বিরোধ নিষ্পত্তি অগ্রাধিকার',
              impact: 'POSITIVE',
              description: 'দ্রুত বিচারিক সহায়তার মাধ্যমে নাগরিক প্রতিকার নিশ্চিতকরণ।',
            },
          ],
        },
        assignedOfficerName: 'মো. মাহবুবুর রহমান (সিনিয়র সহকারী জজ)',
        assignedLawyerId: assignedLawyer?.id || null,
        assignedLawyerName: assignedLawyer?.name,
        assignedLawyerBarNo: assignedLawyer?.barRegNo,
        applicationDate: `${rng.nextInt(1, 28)} জুলাই ২০২৬`,
        assignedDate: assignedLawyer ? '০৮ আগস্ট ২০২৬' : undefined,
        nextHearingDate: hearings[0]?.date,
        deadlines,
        hearings,
        timeline,
        documents,
        summary: caseDescription,
        legalIssues: template.legalIssues,
        reliefSought: template.reliefSought,
        lastActivityDate: `${Math.max(1, 10 - daysSinceActivity)} সেপ্টেম্বর ২০২৬`,
        daysWithoutActivity,
        daysSinceLastActivity: daysSinceActivity,
        mediationAttempted: status === 'MEDIATION_ONGOING',
        mediationOutcome:
          status === 'MEDIATION_ONGOING' ? 'উভয় পক্ষের উপস্থিতিতে প্রাথমিক শুনানি চলছে' : undefined,

        // Structured synthetic attributes
        caseCategory: template.caseCategory,
        caseSubcategory: template.caseSubcategory,
        description: caseDescription,
        applicantName,
        applicantDisplayName,
        applicantGender: isFemale ? 'নারী' : 'পুরুষ',
        applicantAgeBand: rng.pick(['১৮-২৫', '২৬-৩৫', '৩৬-৫০', '৫১+']),
        vulnerabilityFactors: template.vulnerabilities,
        priorityLevel: priority,
        riskScore: calculatedRiskScore,
        riskFactors: template.riskFactors,
        filingStage:
          status === 'PENDING_LAWYER_ASSIGNMENT'
            ? 'আইনজীবী নিয়োগ অপেক্ষমাণ'
            : status === 'LAWYER_ASSIGNED'
            ? 'আইনজীবী নিয়োগ সম্পন্ন'
            : status === 'HEARING_ONGOING'
            ? 'শুনানি চলমান'
            : status === 'MEDIATION_ONGOING'
            ? 'মধ্যস্থতা পর্ব'
            : status === 'DISPOSED'
            ? 'নিষ্পত্তি সম্পন্ন'
            : 'প্রস্তুতি পর্ব',
        slaDeadline: deadlines[0]?.dueDate || '২০ সেপ্টেম্বর ২০২৬',
        slaStatus,
        legalAidEligibility: 'ELIGIBLE',
        mediationApplicable:
          template.category === 'FAMILY' || template.category === 'LAND_PROPERTY',
        securityClassification: isHighlySensitive ? 'Highly Sensitive' : 'Official',
        documentCount: documents.length,
        sensitiveDocumentCount: documents.filter((d) => d.isRestricted).length,
        securityAlerts:
          slaStatus === 'BREACHED'
            ? ['সময়সীমা অতিক্রান্ত সতর্কতা']
            : isHighlySensitive
            ? ['ভুক্তভোগীর তথ্য সুরক্ষা ফিল্টার সক্রিয়']
            : [],
        createdBy: 'সিস্টেম ফ্রন্ট ডেস্ক',
        updatedAt: '১০ সেপ্টেম্বর ২০২৬',

        // Domain fields
        landDispute: template.isLand,
        propertyType,
        cybercrimeType: template.isCyber ? template.caseSubcategory : undefined,
        digitalEvidenceAvailable: template.isCyber,
        platformType: template.isCyber ? 'সোশ্যাল মিডিয়া প্ল্যাটফর্ম' : undefined,
        technicalRisk: template.isCyber ? 'অ্যাকাউন্ট অপব্যবহার ঝুঁকি' : undefined,
        privacyRisk: template.isCyber ? 'ব্যক্তিগত তথ্য ফাঁসের শঙ্কা' : undefined,
        allegationStatus: template.isBribery ? 'Reported allegation' : undefined,

        applicant: {
          id: `app-${caseCounter}`,
          name: applicantName,
          displayName: applicantDisplayName,
          nidMasked,
          phoneMasked,
          gender: isFemale ? 'নারী' : 'পুরুষ',
          age: rng.nextInt(22, 58),
          ageBand: rng.pick(['১৮-২৫', '২৬-৩৫', '৩৬-৫০', '৫১+']),
          monthlyIncome: rng.nextInt(3500, 11000),
          occupation: isFemale ? 'গৃহিণী / ক্ষুদ্র উদ্যোক্তা' : 'দিনমজুর / ছোট দোকানি',
          villageWard: `ওয়ার্ড নং ${rng.nextInt(1, 9)}, ডেমো গ্রাম`,
          upazila,
          district: distConfig.district,
          specialEligibility: template.vulnerabilities,
          opposingPartyName: opposingName,
          opposingPartyAddress: `${upazila}, ${distConfig.district}`,
        },
      };

      cases.push(generatedCase);
      caseCounter++;
    }
  }

  return cases;
}
