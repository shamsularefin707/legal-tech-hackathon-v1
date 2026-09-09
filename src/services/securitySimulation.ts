/**
 * নিরাপত্তা মহড়া ও সিমুলেশন সার্ভিস (Security Simulation Service)
 * Implements 10-step interactive security drill:
 * 1. Unauthorized doc request -> 2. Auth token validation fail -> 3. RBAC/BOLA check -> 4. Access denied ->
 * 5. Document protected -> 6. Incident created (INC-2026-0042) -> 7. Admin alert -> 8. Audit event (AUD-2026-0098) ->
 * 9. Vulnerability linked (VULN-2026-001) -> 10. Containment initiated
 */

import { SecurityIncident, AuditLogEntry, VulnerabilityItem } from '../types/legalAid';
import { DEMO_SNAPSHOT_DATE } from '../utils/dateUtils';

export interface SimulationStepState {
  stepNumber: number;
  titleBn: string;
  titleEn: string;
  status: 'PENDING' | 'RUNNING' | 'DONE';
  detail: string;
  evidenceSnippet?: string;
}

export const SIMULATION_INITIAL_STEPS: SimulationStepState[] = [
  {
    stepNumber: 1,
    titleBn: 'অননুমোদিত নথি দর্শনের অনুরোধ প্রেরণ',
    titleEn: 'Unauthorized Document Request Dispatched',
    status: 'PENDING',
    detail: 'বহিরাগত সেশন থেকে মামলা আইডি ম্যানিপুলেশন (IDOR/BOLA) সহ সংবেদনশীল কাবিননামা নথিতে অনুরোধ।',
    evidenceSnippet: 'GET /api/v1/cases/CASE-PILOT-0014/documents/DOC-0014-02 HTTP/1.1\nHost: legalaid.gov.bd\nAuthorization: Bearer [Expired/Forged]',
  },
  {
    stepNumber: 2,
    titleBn: 'টোকেন ও ক্রিপ্টোগ্রাফিক স্বাক্ষর যাচাই ব্যর্থ',
    titleEn: 'Auth Token Cryptographic Validation Failed',
    status: 'PENDING',
    detail: 'সুরক্ষিত গেটওয়েতে সেশন টোকেনের এইচএমএসি-এসএইচএ২৫৬ সিগনেচার অমিল শনাক্ত।',
    evidenceSnippet: 'SEC_AUTH_WARN: Token signature mismatch. Alg: HS256, Status: INVALID_SIG',
  },
  {
    stepNumber: 3,
    titleBn: 'ভূমিকা ও জেলা এক্তিয়ার (RBAC/BOLA) পলিসি প্রয়োগ',
    titleEn: 'RBAC / Object-Level Jurisdiction Enforced',
    status: 'PENDING',
    detail: 'ব্যবহারকারীর জেলা এক্তিয়ার ও মামলার ভৌগোলিক এক্তিয়ার পৃথক হওয়ায় অবজেক্ট ফিল্টারে অমিল।',
    evidenceSnippet: 'POLICY_VIOLATION: User district [External/Guest] !== Case district [হবিগঞ্জ]',
  },
  {
    stepNumber: 4,
    titleBn: 'অনুরোধ তাৎক্ষণিকভাবে প্রত্যাখ্যান ও ব্লক (HTTP 403)',
    titleEn: 'Access Denied & Request Dropped',
    status: 'PENDING',
    detail: 'এপিআই গেটওয়ে ৪০৩ নিষিদ্ধ কোড প্রদান করে সংযোগ বিচ্ছিন্ন করেছে।',
    evidenceSnippet: 'HTTP/1.1 403 Forbidden\nContent-Type: application/json\n{"error": "ACCESS_DENIED_JURISDICTION"}',
  },
  {
    stepNumber: 5,
    titleBn: 'সংবেদনশীল নাগরিক নথি সুরক্ষিত ও অপ্রকাশিত',
    titleEn: 'Citizen Document Protected (Zero Exfiltration)',
    status: 'PENDING',
    detail: 'আদালতের নথি ও ব্যক্তিগত তথ্য সংরক্ষিত অবস্থায় রয়েছে, কোনো বাইট প্রেরণ করা হয়নি।',
    evidenceSnippet: 'RESPONSE_PAYLOAD_SIZE: 0 bytes (Payload shielded)',
  },
  {
    stepNumber: 6,
    titleBn: 'নিরাপত্তা ঘটনা নথিভুক্ত (INC-2026-0042)',
    titleEn: 'Security Incident Created',
    status: 'PENDING',
    detail: 'এসআইইএম কনসোলে ক্রিটিক্যাল লেভেল ইনসিডেন্ট নম্বর INC-2026-0042 সংরক্ষিত।',
    evidenceSnippet: 'INCIDENT_CREATED: INC-2026-0042 [Severity: CRITICAL, Type: BOLA_PREVENTION]',
  },
  {
    stepNumber: 7,
    titleBn: 'জাতীয় নিরাপত্তা ড্যাশবোর্ডে উচ্চ সতর্কবার্তা প্রেরণ',
    titleEn: 'Real-time SOC Alert Dispatched to Admins',
    status: 'PENDING',
    detail: 'সিস্টেম অ্যাডমিনিস্ট্রেটর ও সংশ্লিষ্ট জেলা অফিসারের সিকিউরিটি নোটিফিকেশন চ্যানেলে সতর্কবার্তা প্রেরিত।',
    evidenceSnippet: 'ALERT_DISPATCH: Notification broadcast to 2 Security Officers & System Admin',
  },
  {
    stepNumber: 8,
    titleBn: 'অপরিবর্তনীয় অডিট ট্রেইল সংরক্ষণ (AUD-2026-0098)',
    titleEn: 'Immutable Audit Evidence Recorded',
    status: 'PENDING',
    detail: 'ডিজিটাল টাইমস্ট্যাম্প, আইপি ও পলিসি ভায়োলেশন হ্যাশ সহ অডিট লগবুকে অপরিবর্তনীয় এন্ট্রি।',
    evidenceSnippet: 'AUDIT_ENTRY: AUD-2026-0098 | Action: ACCESS_DENIED | Hash: sha256:7f83b165...',
  },
  {
    stepNumber: 9,
    titleBn: 'শনাক্ত দুর্বলতার সাথে কোরিলেশন স্থাপন (VULN-2026-001)',
    titleEn: 'Linked to Vulnerability VULN-2026-001',
    status: 'PENDING',
    detail: 'ঘটনাটি সিস্টেমের পূর্ব-শনাক্ত বিওএলএ আর্কিটেকচারাল ভালনারেবিলিটির সাথে সম্পর্কিত হলো।',
    evidenceSnippet: 'RELATION_ESTABLISHED: Incident INC-2026-0042 -> Vulnerability VULN-2026-001',
  },
  {
    stepNumber: 10,
    titleBn: 'আইপি কোয়ারেন্টাইন ও সেশন প্রতিষেধক ব্যবস্থা গ্রহণ',
    titleEn: 'IP Quarantined & Auto-Containment Active',
    status: 'PENDING',
    detail: 'আক্রমণকারী আইপি ১৫ মিনিটের জন্য হার্ড-ব্লকলিস্টে অন্তর্ভুক্ত এবং সেশন রদ করা হলো।',
    evidenceSnippet: 'FIREWALL_ACTION: Drop all packets from 192.168.1.185 for 900 seconds. Drill Complete.',
  },
];

export function createSimulationDrillIncident(
  caseId: string = 'CASE-PILOT-0014',
  caseNumber: string = 'NLAS-HAB-2026-0014'
): SecurityIncident {
  return {
    id: 'INC-DEMO-SIM-0042',
    incidentNumber: 'INC-2026-0042',
    titleBn: 'অবজেক্ট-লেভেল অনুপ্রবেশ অপচেষ্টা প্রতিহত (সিমুলেশন মহড়া)',
    titleEn: 'Simulated IDOR/BOLA Access Attempt Blocked',
    severity: 'CRITICAL',
    status: 'CONTAINED',
    detectedAt: `${DEMO_SNAPSHOT_DATE} ১০:১৫:০০`,
    isoDetectedAt: `${DEMO_SNAPSHOT_DATE}T10:15:00`,
    resourceId: caseId,
    resourceType: 'মামলা নথি',
    resourceTitle: `মামলা নং ${caseNumber}-এর সংবেদনশীল নথি`,
    actor: 'সিমুলেটেড অনুপ্রবেশকারী (192.168.1.185)',
    detectionReason: 'টোকেন স্বাক্ষর অমিল ও জেলা এক্তিয়ার নীতি লঙ্ঘন',
    threatSummary: 'বহিরাগত সেশন থেকে জেলা সীমানা অতিক্রম করে সুরক্ষিত আদালতে নথি প্রাপ্তির চেষ্টা।',
    whyFlagged: 'ব্যবহারকারীর আইপি ও পরিচয় হবিগঞ্জ জেলার এক্তিয়ারভুক্ত নয়।',
    whatWasBlocked: 'নথি দর্শন ও ডাউনলোড প্রচেষ্টা তাৎক্ষণিক ৪০৩ দ্বারা স্থগিত।',
    evidencePreserved: 'সম্পূর্ণ এপিআই পেলোড হেডার এবং ক্রিপ্টোগ্রাফিক স্বাক্ষর অসঙ্গতি সংরক্ষিত।',
    controlsTriggered: ['OBJECT_LEVEL_ACCESS_CONTROL', 'JWT_VERIFIER', 'GEO_JURISDICTION_GUARD'],
    remediationOccurred: 'আইপি সাময়িক কোয়ারেন্টাইনে প্রেরণ ও সেশন বিনষ্টকরণ।',
    correlationId: 'corr-drill-sim-4291',
    caseId,
    vulnerabilityId: 'VULN-DEMO-001',
    auditId: 'AUD-2026-0098',
    controlResponse: {
      tokenValidation: 'FAILED',
      rbacCheck: 'DENIED',
      requestAction: 'BLOCKED',
      sessionAction: 'QUARANTINED',
      auditEvent: 'RECORDED',
      incidentStatus: 'CREATED',
    },
  };
}

export function createSimulationDrillAuditLog(
  caseId: string = 'CASE-PILOT-0014',
  caseNumber: string = 'NLAS-HAB-2026-0014'
): AuditLogEntry {
  return {
    id: 'AUD-2026-0098',
    timestamp: '২০২৬-০৯-০৯ ১০:১৫:০০',
    isoTimestamp: `${DEMO_SNAPSHOT_DATE}T10:15:00`,
    user: 'সিমুলেটেড অনুপ্রবেশকারী সেশন',
    role: 'UNAUTHORIZED_GUEST',
    action: 'অননুমোদিত মামলা নথি দর্শনের চেষ্টা প্রতিহত (BOLA Drill)',
    eventType: 'ACCESS_DENIED',
    resourceType: 'নথি',
    resourceId: caseId,
    outcome: 'ব্লক করা হয়েছে',
    reason: 'অবজেক্ট-লেভেল এক্তিয়ার লঙ্ঘন ও মেয়াদোত্তীর্ণ টোকেন',
    correlationId: 'corr-drill-sim-4291',
    caseId,
    incidentId: 'INC-2026-0042',
    vulnerabilityId: 'VULN-DEMO-001',
    integrityStatus: 'VERIFIED',
    ipAddress: '192.168.1.185',
    districtScope: 'হবিগঞ্জ',
    details: `মামলা নং: ${caseNumber} - সংবেদনশীল কাবিননামা নথিতে বহিরাগত আইপি থেকে অননুমোদিত অ্যাক্সেস ব্লক।`,
    evidenceData: {
      rawEndpoint: `/api/v1/cases/${caseId}/documents/DOC-0014-02`,
      requestMethod: 'GET',
      failureReason: 'ACCESS_DENIED_JURISDICTION',
      policyViolated: 'OBJECT_LEVEL_AUTHORIZATION_POLICY',
      targetResourceHash: 'sha256-7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      mitigationAction: 'IP_QUARANTINED_15_MIN',
    },
  };
}
