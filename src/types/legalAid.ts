/**
 * জাতীয় আইনগত সহায়তা কার্যক্রম ব্যবস্থাপনা
 * Core Types & Data Definitions
 * Inspired by NALSA LACMS & LADCS, adapted for Bangladesh Justice Operations
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

export type CaseStatus =
  | 'NEW_APPLICATION'               // নতুন আবেদন
  | 'INITIAL_VERIFICATION'          // প্রাথমিক যাচাই
  | 'ELIGIBILITY_CHECK'             // যোগ্যতা যাচাই
  | 'PENDING_APPROVAL'              // অনুমোদনের অপেক্ষায়
  | 'APPROVED'                      // অনুমোদিত
  | 'PENDING_LAWYER_ASSIGNMENT'     // আইনজীবী নিয়োগ অপেক্ষমাণ
  | 'LAWYER_ASSIGNED'               // আইনজীবী নিয়োগ সম্পন্ন
  | 'IN_PROGRESS'                   // চলমান
  | 'HEARING_ONGOING'               // শুনানি চলমান
  | 'MEDIATION_ONGOING'             // মধ্যস্থতা চলমান
  | 'DISPOSED'                      // নিষ্পত্তি হয়েছে
  | 'CLOSED'                        // বন্ধ
  | 'STAYED'                        // স্থগিত
  | 'TRANSFERRED';                  // স্থানান্তরিত

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

export interface PriorityFactor {
  title: string;
  impact: 'POSITIVE' | 'NEUTRAL';
  description: string;
}

export interface PriorityAssessment {
  calculatedPriority: PriorityLevel;
  factors: PriorityFactor[];
  score: number; // 0 - 100
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
  nidMasked: string; // e.g. "*********1284"
  phoneMasked: string; // e.g. "017******84"
  gender: 'পুরুষ' | 'নারী' | 'অন্যান্য';
  age: number;
  monthlyIncome: number; // BDT
  occupation: string;
  villageWard: string;
  upazila: string;
  district: string;
  specialEligibility: string[]; // e.g. ["নারী", "অতি দরিদ্র", "কারাবন্দী আত্মীয়"]
  opposingPartyName: string;
  opposingPartyAddress: string;
}

export interface PanelLawyer {
  id: string;
  name: string;
  barRegNo: string; // e.g. "DH-BAR-2015-4821"
  phone: string;
  email: string;
  district: string;
  specialisations: CaseCategory[];
  experienceYears: number;
  currentActiveCases: number;
  maxCaseLimit: number;
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  knownConflicts: string[]; // Names of clients / institutions / opposing parties with conflicts
  disposedCasesCount: number;
  successRatePercentage: number;
  address: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  user: string;
  role: string;
  action: string;
  description: string;
  isOfficialRecord: boolean;
}

export interface HearingRecord {
  id: string;
  date: string;
  time: string;
  courtName: string;
  benchCourtNumber: string;
  judgeName?: string;
  purpose: string;
  status: 'নির্ধারিত' | 'অনুষ্ঠিত' | 'মুলতবি' | 'বাতিল';
  courtOutcomeSummary?: string;
  nextDate?: string;
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
    | 'APPLICATION'        // আবেদন
    | 'IDENTITY'           // পরিচয় সংক্রান্ত নথি
    | 'CASE_RECORD'        // মামলার নথি
    | 'COURT_ORDER'        // আদালতের আদেশ
    | 'HEARING_RECORD'     // শুনানির নথি
    | 'MEDIATION_RECORD'   // মধ্যস্থতার নথি
    | 'OTHER';             // অন্যান্য
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  mimeType: string;
  securityHash: string;
  isRestricted: boolean;
  accessCount: number;
}

export interface LegalAidCase {
  id: string;
  caseNumber: string; // e.g. "LA-2026-001284"
  applicant: Applicant;
  category: CaseCategory;
  courtCaseNumber?: string; // Court registered number e.g. "নালিশী মামলা নং ৪১২/২০২৬"
  courtName: string;
  district: string;
  upazila: string;
  status: CaseStatus;
  priorityAssessment: PriorityAssessment;
  assignedOfficerName: string;
  assignedLawyerId?: string;
  assignedLawyerName?: string;
  assignedLawyerBarNo?: string;
  applicationDate: string;
  assignedDate?: string;
  nextHearingDate?: string;
  deadlines: CaseDeadline[];
  hearings: HearingRecord[];
  timeline: TimelineEvent[];
  documents: CaseDocument[];
  summary: string;
  legalIssues: string[];
  reliefSought: string;
  lastActivityDate: string;
  daysWithoutActivity: number; // For "stuck case" detection
  mediationAttempted?: boolean;
  mediationOutcome?: string;
  disposalDate?: string;
  disposalReason?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resourceType: 'মামলা' | 'আইনজীবী' | 'আবেদনকারী' | 'নথি' | 'প্রতিবেদন' | 'নিরাপত্তা' | 'অনুমতি';
  resourceId: string;
  previousState?: string;
  nextState?: string;
  outcome: 'সফল' | 'প্রত্যাখ্যাত' | 'ব্লক করা হয়েছে';
  ipAddress: string;
  districtScope: string;
  details: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  user: string;
  role: string;
  resourceId?: string;
  blocked: boolean;
  actionTaken: string;
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
