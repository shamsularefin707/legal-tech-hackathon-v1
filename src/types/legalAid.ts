/**
 * জাতীয় আইনগত সহায়তা কার্যক্রম ব্যবস্থাপনা
 * Core Types & Normalized Justice Operations Architecture
 * Inspired by NALSA LACMS & LADCS, adapted for Bangladesh Digital Legal Aid Pilot
 */

export type UserRole =
  | 'SYSTEM_ADMIN'         // সিস্টেম প্রশাসক
  | 'NATIONAL_OFFICER'     // জাতীয় পর্যায়ের কর্মকর্তা
  | 'DISTRICT_OFFICER'     // জেলা আইনগত সহায়তা কর্মকর্তা
  | 'ASSISTANT_OFFICER'    // সহকারী কর্মকর্তা
  | 'PANEL_LAWYER'         // প্যানেল আইনজীবী
  | 'OBSERVER';            // পর্যবেক্ষক

export interface User {
  id: string;
  name: string;
  designation: string;
  role: UserRole;
  district: string;
  courtJurisdiction?: string;
  assignedLawyerId?: string; // If role is PANEL_LAWYER
  email: string;
  phone: string;
  avatarPlaceholder?: string;
  active: boolean;
}

/**
 * Normalized Internal Case Statuses (Part 6)
 */
export type CaseStatus =
  | 'SUBMITTED'               // আবেদন দাখিলকৃত
  | 'ELIGIBILITY_REVIEW'      // যোগ্যতা যাচাইাধীন
  | 'REGISTERED'              // নিবন্ধিত
  | 'LAWYER_PENDING'          // আইনজীবী নিয়োগ অপেক্ষমাণ
  | 'LAWYER_ASSIGNED'         // আইনজীবী নিয়োগ সম্পন্ন
  | 'HEARING_SCHEDULED'       // শুনানি নির্ধারিত
  | 'ONGOING'                 // চলমান বিচারিক কার্যক্রম
  | 'AWAITING_RESOLUTION'     // নিষ্পত্তির অপেক্ষায়
  | 'DISPOSED'                // নিষ্পত্তিকৃত
  | 'CLOSED'                  // সমাপ্ত / সংরক্ষিত
  | 'OVERDUE'                 // সময়সীমা অতিক্রান্ত
  | 'ESCALATED'               // উচ্চপর্যায়ে প্রেরিত
  // Legacy aliases supported for smooth rendering
  | 'NEW_APPLICATION'
  | 'INITIAL_VERIFICATION'
  | 'ELIGIBILITY_CHECK'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PENDING_LAWYER_ASSIGNMENT'
  | 'IN_PROGRESS'
  | 'HEARING_ONGOING'
  | 'MEDIATION_ONGOING'
  | 'STAYED'
  | 'TRANSFERRED';

export type CaseCategory =
  | 'CRIMINAL'          // ফৌজদারি
  | 'CIVIL'             // দেওয়ানি
  | 'FAMILY'            // পারিবারিক
  | 'WOMEN_CHILD'       // নারী ও শিশু
  | 'LAND_PROPERTY'     // জমি ও সম্পত্তি
  | 'LABOUR'            // শ্রম
  | 'CONSUMER_RIGHTS'   // ভোক্তা অধিকার
  | 'INHERITANCE'       // উত্তরাধিকার
  | 'HUMAN_RIGHTS'      // মানবাধিকার
  | 'OTHER';            // অন্যান্য

export type PriorityLevel = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface PriorityFactor {
  title: string;
  impact: 'POSITIVE' | 'NEUTRAL';
  description: string;
}

export interface PriorityAssessment {
  calculatedPriority: PriorityLevel;
  factors: PriorityFactor[];
  score: number; // 20 - 99
  officerOverride?: {
    overriddenPriority: PriorityLevel;
    officerName: string;
    officerRole: string;
    reason: string;
    timestamp: string;
  };
}

export interface Applicant {
  id: string;
  name: string;
  displayName?: string;
  nidMasked: string;
  phoneMasked: string;
  gender: 'পুরুষ' | 'নারী' | 'অন্যান্য';
  age: number;
  ageBand?: '১৮-২৫' | '২৬-৩৫' | '৩৬-৫০' | '৫১+' | 'নাবালক/কিশোর';
  monthlyIncome: number; // BDT
  occupation: string;
  villageWard: string;
  upazila: string;
  district: string;
  specialEligibility: string[];
  opposingPartyName: string;
  opposingPartyAddress: string;
}

export type LawyerCapacityStatus = 'UNDER_CAPACITY' | 'NORMAL' | 'NEAR_CAPACITY' | 'OVER_CAPACITY';

export interface PanelLawyer {
  id: string;
  name: string;
  displayName?: string;
  barRegNo: string;
  phone: string;
  email: string;
  district: string;
  districtType?: 'DIGITAL_LEGAL_AID_PILOT' | 'REFERENCE_GEOGRAPHY';
  specialisations: CaseCategory[];
  specializationNames?: string[];
  experienceYears: number;
  currentActiveCases: number;
  maxCaseLimit: number;
  capacity?: number;
  workloadPercentage?: number;
  capacityStatus?: LawyerCapacityStatus;
  highPriorityCases?: number;
  upcomingHearings?: number;
  overdueTasks?: number;
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  status?: 'ACTIVE' | 'BUSY' | 'LEAVE';
  knownConflicts: string[];
  disposedCasesCount: number;
  successRatePercentage: number;
  address: string;
  isDemoData?: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string; // Display formatted e.g. "০৯ আগস্ট ২০২৬" or ISO "2026-08-09"
  isoDate?: string; // Normalized ISO "YYYY-MM-DD"
  time: string;
  user: string;
  role: string;
  action: string;
  description: string;
  isOfficialRecord: boolean;
}

/**
 * Normalized Hearing Statuses (Part 7)
 */
export type HearingStatus = 'COMPLETED' | 'TODAY' | 'UPCOMING' | 'OVERDUE_REVIEW';

export interface HearingRecord {
  id: string;
  caseId?: string;
  caseNumber?: string;
  lawyerId?: string;
  lawyerName?: string;
  date: string; // Bengali display e.g. "০৯ সেপ্টেম্বর ২০২৬"
  isoDate?: string; // Normalized ISO "2026-09-09"
  time: string;
  courtName: string;
  benchCourtNumber: string;
  district?: string;
  judgeName?: string;
  purpose: string;
  status: HearingStatus | 'নির্ধারিত' | 'অনুষ্ঠিত' | 'মুলতবি' | 'বাতিল';
  statusBn?: string;
  courtOutcomeSummary?: string;
  nextDate?: string;
  isPlanned?: boolean;
}

export interface CaseDeadline {
  id: string;
  title: string;
  dueDate: string;
  daysRemaining: number;
  category: 'URGENT' | 'WITHIN_7_DAYS' | 'AT_RISK' | 'OVERDUE';
  assignedOfficer: string;
  assignedLawyer?: string;
  status: 'PENDING' | 'MET' | 'OVERDUE';
  actionRequired: string;
}

export interface CaseDocument {
  id: string;
  title: string;
  category:
    | 'APPLICATION'
    | 'IDENTITY'
    | 'CASE_RECORD'
    | 'COURT_ORDER'
    | 'HEARING_RECORD'
    | 'MEDIATION_RECORD'
    | 'OTHER';
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  mimeType: string;
  securityHash: string;
  isRestricted: boolean;
  accessCount: number;
}

/**
 * Normalized SLA Statuses (Part 8)
 */
export type SlaStatus = 'ON_TRACK' | 'AT_RISK' | 'OVERDUE' | 'ESCALATED' | 'RESOLVED';

export interface RiskFactorDetail {
  title: string;
  impact: number;
  description: string;
}

export interface LegalAidCase {
  id: string;
  isDemoData?: boolean;
  caseNumber: string;
  applicant: Applicant;
  category: CaseCategory;
  courtCaseNumber?: string;
  courtName: string;
  courtType?: string;
  district: string;
  districtType?: 'DIGITAL_LEGAL_AID_PILOT' | 'REFERENCE_GEOGRAPHY';
  upazila: string;
  status: CaseStatus;
  priorityAssessment: PriorityAssessment;
  assignedOfficerName: string;
  assignedLawyerId?: string | null;
  assignedLawyerName?: string;
  assignedLawyerBarNo?: string;

  // Normalized Sequential Dates (Part 2)
  filingDate?: string; // ISO 'YYYY-MM-DD'
  registrationDate?: string; // ISO 'YYYY-MM-DD'
  eligibilityDecisionDate?: string; // ISO 'YYYY-MM-DD'
  lawyerRecommendationDate?: string; // ISO 'YYYY-MM-DD'
  lawyerAssignmentDate?: string; // ISO 'YYYY-MM-DD'
  firstHearingDate?: string; // ISO 'YYYY-MM-DD'
  latestHearingDate?: string; // ISO 'YYYY-MM-DD'
  lastActivityDate: string; // ISO 'YYYY-MM-DD'
  disposalDate?: string; // ISO 'YYYY-MM-DD'
  disposalReason?: string;
  applicationDate: string; // display or ISO
  assignedDate?: string;
  nextHearingDate?: string;

  // Inactivity metric
  daysWithoutActivity: number;
  daysSinceLastActivity?: number;

  // Normalized SLA Engine (Part 8)
  slaStartDate?: string; // ISO 'YYYY-MM-DD'
  configuredSlaDays?: number;
  slaTargetDate?: string; // ISO 'YYYY-MM-DD'
  slaRemainingDays?: number;
  slaConsumedPercentage?: number;
  slaStatus?: SlaStatus | 'NORMAL' | 'APPROACHING_RISK' | 'BREACHED';

  // Deterministic Risk Engine (Part 13 & 14)
  riskScore?: number; // 20 - 99
  riskLevel?: RiskLevel;
  riskFactorsList?: RiskFactorDetail[];

  // Hearings & Timeline
  deadlines: CaseDeadline[];
  hearings: HearingRecord[];
  timeline: TimelineEvent[];
  documents: CaseDocument[];
  summary: string;
  legalIssues: string[];
  reliefSought: string;

  mediationAttempted?: boolean;
  mediationOutcome?: string;

  // Synthetic schema compatibility fields
  caseCategory?: string;
  caseSubcategory?: string;
  description?: string;
  applicantName?: string;
  applicantDisplayName?: string;
  applicantGender?: 'পুরুষ' | 'নারী' | 'অন্যান্য';
  applicantAgeBand?: string;
  vulnerabilityFactors?: string[];
  priorityLevel?: PriorityLevel;
  riskFactors?: string[];
  filingStage?: string;
  slaDeadline?: string;
  legalAidEligibility?: 'ELIGIBLE' | 'REVIEW_PENDING' | 'SPECIAL_APPROVAL';
  mediationApplicable?: boolean;
  securityClassification?: 'Highly Sensitive' | 'Confidential' | 'Official' | 'Standard';
  documentCount?: number;
  sensitiveDocumentCount?: number;
  securityAlerts?: string[];
  createdBy?: string;
  updatedAt?: string;

  // Domain-specific fields
  landDispute?: boolean;
  propertyType?: 'Agricultural' | 'Residential' | 'Commercial' | 'Inherited property' | 'Government/claimed public land';
  cybercrimeType?: string;
  digitalEvidenceAvailable?: boolean;
  platformType?: string;
  technicalRisk?: string;
  privacyRisk?: string;
  allegationStatus?: string;
}

export type AuditEventType =
  | 'CASE_CREATED'
  | 'CASE_UPDATED'
  | 'DOCUMENT_VIEWED'
  | 'DOCUMENT_DOWNLOAD_BLOCKED'
  | 'LAWYER_ASSIGNED'
  | 'PRIORITY_CHANGED'
  | 'ACCESS_DENIED'
  | 'TOKEN_VALIDATION_FAILED'
  | 'SECURITY_INCIDENT_CREATED'
  | 'VULNERABILITY_REMEDIATED'
  | 'HEARING_RESCHEDULED'
  | 'DATASET_REGENERATED'
  | 'OTHER';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // e.g. "২০২৬-০৯-০৯ ১০:১৫:০০"
  isoTimestamp?: string; // ISO
  user: string;
  role: string;
  action: string;
  eventType?: AuditEventType;
  resourceType: 'মামলা' | 'আইনজীবী' | 'আবেদনকারী' | 'নথি' | 'প্রতিবেদন' | 'নিরাপত্তা' | 'অনুমতি';
  resourceId: string;
  previousState?: string;
  nextState?: string;
  outcome: 'সফল' | 'প্রত্যাখ্যাত' | 'ব্লক করা হয়েছে';
  reason?: string;
  correlationId?: string;
  caseId?: string;
  incidentId?: string;
  vulnerabilityId?: string;
  integrityStatus?: 'VALID' | 'VERIFIED' | 'TAMPER_CHECKED';
  ipAddress: string;
  districtScope: string;
  details: string;
  evidenceData?: {
    rawEndpoint?: string;
    requestMethod?: string;
    failureReason?: string;
    policyViolated?: string;
    targetResourceHash?: string;
    mitigationAction?: string;
  };
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  isoTimestamp?: string;
  eventType?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  user: string;
  role: string;
  resourceId?: string;
  caseId?: string;
  vulnerabilityId?: string;
  incidentId?: string;
  actorType?: string;
  actorId?: string;
  result?: string;
  reason?: string;
  controlTriggered?: string;
  status?: string;
  blocked: boolean;
  actionTaken: string;
  correlationId?: string;
  isDemoData?: boolean;
}

export type VulnerabilitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type VulnerabilityStatus =
  | 'OPEN'
  | 'TRIAGED'
  | 'MITIGATING'
  | 'PATCHED'
  | 'VERIFYING'
  | 'RESOLVED'
  | 'UNDER_REVIEW'
  | 'CONTAINED';

export type LifecycleStageKey =
  | 'DETECT'
  | 'CLASSIFY'
  | 'CONTAIN'
  | 'INVESTIGATE'
  | 'REMEDIATE'
  | 'VERIFY'
  | 'AUDIT';

export interface VulnerabilityLifecycleStage {
  stage: LifecycleStageKey;
  stageNameBn: string;
  stageNameEn: string;
  timestamp: string;
  responsibleRole: string;
  actionTaken: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  evidenceRef: string;
}

export interface VulnerabilityItem {
  id: string;
  title?: string;
  titleBn: string;
  titleEn: string;
  severity: VulnerabilitySeverity;
  asset: string;
  status: VulnerabilityStatus;
  owner: string;
  sla?: string;
  slaHours: number;
  slaRemainingHours: number;
  isSlaAtRisk?: boolean;
  description: string;
  riskScore?: number;
  lifecycleStage?: LifecycleStageKey;
  identifiedAt: string;
  detectedAt?: string;
  remediationPlan: string;
  lifecycle: VulnerabilityLifecycleStage[];
  relatedIncidentId?: string;
  relatedControl?: string;
  isDemoData?: boolean;
}

export type IncidentStatus =
  | 'OPEN'
  | 'DETECTED'
  | 'TRIAGED'
  | 'CONTAINED'
  | 'INVESTIGATING'
  | 'REMEDIATED'
  | 'VERIFIED'
  | 'CLOSED';

export interface SecurityIncident {
  id: string;
  incidentNumber: string;
  titleBn: string;
  titleEn: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: IncidentStatus;
  detectedAt: string;
  isoDetectedAt?: string;
  resourceId: string;
  resourceType: string;
  resourceTitle: string;
  actor: string;
  detectionReason: string;
  threatSummary: string;
  whyFlagged: string;
  whatWasBlocked: string;
  evidencePreserved: string;
  controlsTriggered: string[];
  remediationOccurred: string;
  correlationId: string;
  caseId?: string;
  vulnerabilityId?: string;
  auditId?: string;
  controlResponse: {
    tokenValidation: 'FAILED' | 'PASSED';
    rbacCheck: 'DENIED' | 'ALLOWED';
    requestAction: 'BLOCKED' | 'PERMITTED';
    sessionAction: 'QUARANTINED' | 'ACTIVE';
    auditEvent: 'RECORDED' | 'SKIPPED';
    incidentStatus: 'CREATED' | 'UPDATED';
  };
}

export interface DataExportRequest {
  id: string;
  exportType: 'মামলা_তালিকা' | 'আইনজীবী_তালিকা' | 'মাসিক_প্রতিবেদন' | 'পরিসংখ্যান';
  district: string;
  caseCategory?: string;
  requestedBy: string;
  requestedAt: string;
  purposeReason: string;
  status: 'APPROVED' | 'REJECTED' | 'LOGGED';
  downloadToken: string;
}
