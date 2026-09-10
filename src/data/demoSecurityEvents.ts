/**
 * সিন্থেটিক নিরাপত্তা ইভেন্ট ডেটাসেট (Synthetic Security Events Dataset)
 * 35-45 realistic security events linked to cases and actors
 * All records include `isDemoData: true`.
 */

import { SecurityEvent, LegalAidCase, PanelLawyer } from '../types/legalAid';
import { SeededRandom } from './demoConfig';

export function generateSyntheticSecurityEvents(
  rng: SeededRandom,
  cases: LegalAidCase[],
  lawyers: PanelLawyer[]
): SecurityEvent[] {
  const events: SecurityEvent[] = [];
  const eventCount = rng.nextInt(36, 44);

  const eventPrototypes = [
    {
      eventType: 'BOLA_UNAUTHORIZED_ACCESS_ATTEMPT',
      severity: 'CRITICAL' as const,
      title: 'অননুমোদিত জেলা এক্তিয়ারে মামলা প্রবেশের অপচেষ্টা (BOLA)',
      description: 'ব্যবহারকারী তার নিজ জেলার বাইরে অন্য জেলার সুরক্ষিত মামলায় প্রবেশের চেষ্টা করায় ব্লক করা হয়েছে।',
      controlTriggered: 'OBJECT_LEVEL_ACCESS_CONTROL_POLICY',
      result: 'BLOCKED',
      reason: 'ব্যবহারকারীর জেলা এক্তিয়ার ও মামলার জেলা এক্তিয়ার অসঙ্গতিপূর্ণ।',
      blocked: true,
      actionTaken: 'অনুরোধ ব্লক করা হয়েছে এবং অডিট লগে ফ্ল্যাগ করা হয়েছে',
    },
    {
      eventType: 'BULK_DOWNLOAD_ABUSE_ATTEMPT',
      severity: 'WARNING' as const,
      title: 'অস্বাভাবিক হারে নথি ডাউনলোডের প্রচেষ্টা প্রতিহত',
      description: 'স্বল্প সময়ে ৬০ সেকেন্ডে ২৫টির অধিক আদালতের নথি ডাউনলোডের চেষ্টা করায় রেট লিমিটার সক্রিয় হয়েছে।',
      controlTriggered: 'RATE_LIMITER_AND_THROTTLING_POLICY',
      result: 'BLOCKED',
      reason: 'থ্রেশহোল্ড অতিক্রম করায় সিস্টেম স্বয়ংক্রিয়ভাবে সংযোগ সাময়িক স্থগিত করেছে।',
      blocked: true,
      actionTaken: 'ডাউনলোড সেশন ১৫ মিনিটের জন্য নিষ্ক্রিয় ও নিরাপত্তা সতর্কতা জারি',
    },
    {
      eventType: 'TOKEN_VALIDATION_FAILURE',
      severity: 'WARNING' as const,
      title: 'মেয়াদোত্তীর্ণ বা বিকৃত সেশন টোকেন শনাক্ত',
      description: 'সুরক্ষিত এপিআই অনুরোধে অপ্রত্যাশিত ক্রিপ্টোগ্রাফিক স্বাক্ষর অসঙ্গতি লক্ষ্য করা গেছে।',
      controlTriggered: 'JWT_SIGNATURE_VERIFICATION',
      result: 'REJECTED',
      reason: 'টোকেন মেয়াদোত্তীর্ণ অথবা ম্যানিপুলেটেড।',
      blocked: true,
      actionTaken: 'ব্যবহারকারীকে লগআউট করা হয়েছে এবং নতুন প্রমাণীকরণ চাওয়া হয়েছে',
    },
    {
      eventType: 'SENSITIVE_IDENTITY_ACCESS_LOGGED',
      severity: 'INFO' as const,
      title: 'সংবেদনশীল নিকাহনামা/পরিচয় নথিতে বৈধ প্রবেশ',
      description: 'দায়িত্বপ্রাপ্ত কর্মকর্তা কর্তৃক মামলার যাচাইয়ের স্বার্থে সংবেদনশীল নথি পর্যবেক্ষণ।',
      controlTriggered: 'SENSITIVE_DOCUMENT_AUDIT_HOOK',
      result: 'PERMITTED',
      reason: 'ব্যবহারকারীর রোল ও সংশ্লিষ্ট মামলার এক্তিয়ার বৈধ।',
      blocked: false,
      actionTaken: 'অডিট ট্রেইলে টাইমস্ট্যাম্প ও ডিজিটাল ফিঙ্গারপ্রিন্ট সংরক্ষিত',
    },
    {
      eventType: 'REPEATED_AUTHENTICATION_FAILURE',
      severity: 'WARNING' as const,
      title: 'একাধিকবার ভুল পাসওয়ার্ড ইনপুট সতর্কতা',
      description: 'একই আইপি অ্যাড্রেস থেকে ৩ মিনিটে ৫ বার ব্যর্থ লগইন প্রচেষ্টার রেকর্ড।',
      controlTriggered: 'BRUTE_FORCE_PROTECTION',
      result: 'BLOCKED',
      reason: 'ব্রুট ফোর্স আক্রমণ প্রতিরোধ ফিল্টার সক্রিয়।',
      blocked: true,
      actionTaken: 'উক্ত আইপি ৩০ মিনিটের জন্য ক্যাপচা লক করা হয়েছে',
    },
    {
      eventType: 'EXCESSIVE_PRIVILEGE_DETECTED',
      severity: 'CRITICAL' as const,
      title: 'অতিরিক্ত প্রশাসনিক সুযোগ ব্যবহারের চেষ্টা নিরীক্ষা',
      description: 'বেঞ্চ সহকারী অ্যাকাউন্ট থেকে নিরাপত্তা অডিট লগ মোছার চেষ্টা প্রতিহত।',
      controlTriggered: 'IMMUTABLE_AUDIT_INTEGRITY_POLICY',
      result: 'BLOCKED',
      reason: 'অডিট ট্রেইল অপরিবর্তনীয় এবং কোনো রোল দ্বারাই মোছা সম্ভব নয়।',
      blocked: true,
      actionTaken: 'হস্তক্ষেপের চেষ্টা রেকর্ড ও ন্যাশনাল অফিসারকে নোটিফিকেশন পাঠানো হয়েছে',
    },
  ];

  for (let i = 1; i <= eventCount; i++) {
    const proto = rng.pick(eventPrototypes);
    const targetCase = rng.pick(cases);
    const targetLawyer = rng.pick(lawyers);

    const day = rng.nextInt(1, 9);
    let hour = rng.nextInt(8, 17);
    let minute = rng.nextInt(10, 59);
    if (day === 9) {
      hour = rng.nextInt(8, 9); // strictly 08:xx or 09:xx so < 10:15:00 on SYSTEM_DATE
      minute = rng.nextInt(10, 55);
    }

    const timestamp = `২০২৬-০৯-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    events.push({
      id: `SEC-DEMO-${String(i).padStart(4, '0')}`,
      isDemoData: true,
      timestamp,
      eventType: proto.eventType,
      severity: proto.severity,
      title: proto.title,
      description: `${proto.description} [মামলা নম্বর: ${targetCase.caseNumber}]`,
      user: proto.severity === 'CRITICAL' ? 'অজানা এক্সটার্নাল সেশন / গেস্ট' : targetLawyer.name,
      role: proto.severity === 'CRITICAL' ? 'UNAUTHORIZED_ACTOR' : 'PANEL_LAWYER',
      actorType: proto.severity === 'CRITICAL' ? 'EXTERNAL_IP' : 'AUTHENTICATED_USER',
      actorId: targetLawyer.id,
      resourceId: targetCase.id,
      caseId: targetCase.id,
      result: proto.result,
      reason: proto.reason,
      controlTriggered: proto.controlTriggered,
      status: proto.blocked ? 'RESOLVED_BLOCKED' : 'AUDITED',
      blocked: proto.blocked,
      actionTaken: proto.actionTaken,
      correlationId: `corr-sec-${rng.nextInt(100000, 999999)}`,
    });
  }

  // Sort descending by timestamp
  return events.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}
