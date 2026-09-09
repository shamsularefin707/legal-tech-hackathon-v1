/**
 * ভূমিকা ও অনুমতি ব্যবস্থাপনা ইঞ্জিন (Role-Based Access Control & Separation of Duties)
 * Authoritative RBAC matrix for National Legal Aid Operations Management
 */

import { User, UserRole, LegalAidCase } from '../types/legalAid';

export type PermissionAction =
  | 'CREATE_APPLICATION'
  | 'EDIT_DRAFT'
  | 'SUBMIT_APPLICATION'
  | 'VERIFY_APPLICATION'
  | 'REGISTER_CASE'
  | 'REJECT_APPLICATION'
  | 'REQUEST_CORRECTION'
  | 'ASSIGN_LAWYER'
  | 'OVERRIDE_PRIORITY'
  | 'UPDATE_LEGAL_ACTIVITY'
  | 'ADD_CASE_NOTE'
  | 'UPLOAD_DOCUMENT'
  | 'DOWNLOAD_DOCUMENT'
  | 'VIEW_HEARINGS'
  | 'VIEW_SECURITY_DASHBOARD'
  | 'RUN_SECURITY_DRILL'
  | 'VIEW_AUDIT_LOG'
  | 'MANAGE_USERS'
  | 'SYSTEM_CONFIG'
  | 'EMERGENCY_OVERRIDE';

export interface RoleDefinition {
  code: UserRole;
  titleBn: string;
  titleEn: string;
  descriptionBn: string;
  badgeColor: string;
  permissions: PermissionAction[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  NATIONAL_ADMIN: {
    code: 'NATIONAL_ADMIN',
    titleBn: 'জাতীয় প্রশাসক ও সংস্থা প্রধান',
    titleEn: 'National Administrator',
    descriptionBn: 'জাতীয় পর্যায়ের সার্বিক প্রশাসনিক তদারকি, কনফিগারেশন, জেলা এক্তিয়ার, নিরাপত্তা ড্যাশবোর্ড ও অডিট নিয়ন্ত্রণ।',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    permissions: [
      'CREATE_APPLICATION',
      'EDIT_DRAFT',
      'SUBMIT_APPLICATION',
      'VERIFY_APPLICATION',
      'REGISTER_CASE',
      'REJECT_APPLICATION',
      'REQUEST_CORRECTION',
      'ASSIGN_LAWYER',
      'OVERRIDE_PRIORITY',
      'UPDATE_LEGAL_ACTIVITY',
      'ADD_CASE_NOTE',
      'UPLOAD_DOCUMENT',
      'DOWNLOAD_DOCUMENT',
      'VIEW_HEARINGS',
      'VIEW_SECURITY_DASHBOARD',
      'RUN_SECURITY_DRILL',
      'VIEW_AUDIT_LOG',
      'MANAGE_USERS',
      'SYSTEM_CONFIG',
      'EMERGENCY_OVERRIDE',
    ],
  },
  DISTRICT_LEGAL_AID_ADMIN: {
    code: 'DISTRICT_LEGAL_AID_ADMIN',
    titleBn: 'জেলা লিগ্যাল এইড অফিসার',
    titleEn: 'District Legal Aid Administrator',
    descriptionBn: 'আবেদন যাচাই, আনুষ্ঠানিক মামলা নিবন্ধন, প্যানেল আইনজীবী নিয়োগ এবং মধ্যস্থতা ও জেলা পর্যায়ের বিচারিক কার্যক্রম তদারকি।',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    permissions: [
      'CREATE_APPLICATION',
      'EDIT_DRAFT',
      'SUBMIT_APPLICATION',
      'VERIFY_APPLICATION',
      'REGISTER_CASE',
      'REJECT_APPLICATION',
      'REQUEST_CORRECTION',
      'ASSIGN_LAWYER',
      'OVERRIDE_PRIORITY',
      'UPDATE_LEGAL_ACTIVITY',
      'ADD_CASE_NOTE',
      'UPLOAD_DOCUMENT',
      'DOWNLOAD_DOCUMENT',
      'VIEW_HEARINGS',
      'VIEW_AUDIT_LOG',
      'RUN_SECURITY_DRILL',
    ],
  },
  LEGAL_AID_STAFF: {
    code: 'LEGAL_AID_STAFF',
    titleBn: 'আইনগত সহায়তা সহকারী / স্টাফ',
    titleEn: 'Legal Aid Staff / Case Worker',
    descriptionBn: 'আবেদন গ্রহণ, প্রাথমিক খসড়া প্রস্তুত, নথি স্ক্যান ও দাখিলকরণ। নিজস্ব দাখিলকৃত আবেদন অনুমোদন বা নিবন্ধন করার ক্ষমতা নেই।',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    permissions: [
      'CREATE_APPLICATION',
      'EDIT_DRAFT',
      'SUBMIT_APPLICATION',
      'UPLOAD_DOCUMENT',
      'DOWNLOAD_DOCUMENT',
      'VIEW_HEARINGS',
      'ADD_CASE_NOTE',
    ],
  },
  PANEL_LAWYER: {
    code: 'PANEL_LAWYER',
    titleBn: 'প্যানেল আইনজীবী (LADCS)',
    titleEn: 'Panel Lawyer',
    descriptionBn: 'নিয়োজিত মামলার প্রতিনিধিত্ব, আদালতে কার্যবিবরণী পেশ, আইনি পদক্ষেপ হালনাগাদ ও শুনানি পর্যবেক্ষণ।',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    permissions: [
      'UPDATE_LEGAL_ACTIVITY',
      'ADD_CASE_NOTE',
      'UPLOAD_DOCUMENT',
      'DOWNLOAD_DOCUMENT',
      'VIEW_HEARINGS',
    ],
  },
  JUDICIAL_OFFICER: {
    code: 'JUDICIAL_OFFICER',
    titleBn: 'বিজ্ঞ বিচারিক কর্মকর্তা',
    titleEn: 'Judicial Officer',
    descriptionBn: 'সংশ্লিষ্ট আদালতের শুনানি দিনপঞ্জি, বিচার প্রক্রিয়ার অগ্রগতি পর্যবেক্ষণ ও অডিট ইতিহাস অবলোকন (রিড-অনলি বিচারিক ভূমিকা)।',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    permissions: [
      'VIEW_HEARINGS',
      'ADD_CASE_NOTE',
      'DOWNLOAD_DOCUMENT',
      'VIEW_AUDIT_LOG',
    ],
  },
  AUDITOR: {
    code: 'AUDITOR',
    titleBn: 'আইন ও আর্থিক অডিটর',
    titleEn: 'Independent Auditor',
    descriptionBn: 'সার্বিক অপরিবর্তনীয় অডিট ট্রেইল, নিরাপত্তা লগ ও প্রতিবেদন নিরীক্ষা (সম্পূর্ণ রিড-অনলি এক্সেস, কোনো পরিবর্তনের অনুমতি নেই)।',
    badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
    permissions: [
      'VIEW_AUDIT_LOG',
      'VIEW_SECURITY_DASHBOARD',
      'VIEW_HEARINGS',
      'DOWNLOAD_DOCUMENT',
    ],
  },

  // Legacy mappings
  SYSTEM_ADMIN: {
    code: 'SYSTEM_ADMIN',
    titleBn: 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
    titleEn: 'System Administrator',
    descriptionBn: 'প্রযুক্তিগত পরিচালনা ও নিরাপত্তা অবকাঠামো ব্যবস্থাপনা।',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    permissions: [
      'CREATE_APPLICATION',
      'EDIT_DRAFT',
      'SUBMIT_APPLICATION',
      'VERIFY_APPLICATION',
      'REGISTER_CASE',
      'ASSIGN_LAWYER',
      'OVERRIDE_PRIORITY',
      'UPDATE_LEGAL_ACTIVITY',
      'ADD_CASE_NOTE',
      'UPLOAD_DOCUMENT',
      'DOWNLOAD_DOCUMENT',
      'VIEW_HEARINGS',
      'VIEW_SECURITY_DASHBOARD',
      'RUN_SECURITY_DRILL',
      'VIEW_AUDIT_LOG',
      'MANAGE_USERS',
      'SYSTEM_CONFIG',
      'EMERGENCY_OVERRIDE',
    ],
  },
  NATIONAL_OFFICER: {
    code: 'NATIONAL_OFFICER',
    titleBn: 'জাতীয় পর্যায়ের কর্মকর্তা',
    titleEn: 'National Officer',
    descriptionBn: 'জাতীয় সংস্থার ঊর্ধ্বতন কর্মকর্তা।',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    permissions: [
      'CREATE_APPLICATION',
      'EDIT_DRAFT',
      'SUBMIT_APPLICATION',
      'VERIFY_APPLICATION',
      'REGISTER_CASE',
      'ASSIGN_LAWYER',
      'OVERRIDE_PRIORITY',
      'UPDATE_LEGAL_ACTIVITY',
      'ADD_CASE_NOTE',
      'UPLOAD_DOCUMENT',
      'DOWNLOAD_DOCUMENT',
      'VIEW_HEARINGS',
      'VIEW_SECURITY_DASHBOARD',
      'RUN_SECURITY_DRILL',
      'VIEW_AUDIT_LOG',
    ],
  },
  DISTRICT_OFFICER: {
    code: 'DISTRICT_OFFICER',
    titleBn: 'জেলা আইনগত সহায়তা কর্মকর্তা',
    titleEn: 'District Legal Aid Officer',
    descriptionBn: 'জেলা পর্যায়ের কর্মকর্তা।',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    permissions: [
      'CREATE_APPLICATION',
      'EDIT_DRAFT',
      'SUBMIT_APPLICATION',
      'VERIFY_APPLICATION',
      'REGISTER_CASE',
      'ASSIGN_LAWYER',
      'OVERRIDE_PRIORITY',
      'UPDATE_LEGAL_ACTIVITY',
      'ADD_CASE_NOTE',
      'UPLOAD_DOCUMENT',
      'DOWNLOAD_DOCUMENT',
      'VIEW_HEARINGS',
      'VIEW_AUDIT_LOG',
    ],
  },
  ASSISTANT_OFFICER: {
    code: 'ASSISTANT_OFFICER',
    titleBn: 'সহকারী কর্মকর্তা',
    titleEn: 'Assistant Officer',
    descriptionBn: 'সহকারী কর্মকর্তা।',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    permissions: [
      'CREATE_APPLICATION',
      'EDIT_DRAFT',
      'SUBMIT_APPLICATION',
      'UPLOAD_DOCUMENT',
      'DOWNLOAD_DOCUMENT',
      'VIEW_HEARINGS',
      'ADD_CASE_NOTE',
    ],
  },
  OBSERVER: {
    code: 'OBSERVER',
    titleBn: 'পর্যবেক্ষক',
    titleEn: 'Observer',
    descriptionBn: 'পর্যবেক্ষক।',
    badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
    permissions: ['VIEW_AUDIT_LOG', 'VIEW_HEARINGS', 'DOWNLOAD_DOCUMENT'],
  },
};

/**
 * Check if a given user has a specific permission
 */
export function hasPermission(user: User, action: PermissionAction): boolean {
  if (!user || !user.active) return false;
  const def = ROLE_DEFINITIONS[user.role];
  if (!def) return false;
  return def.permissions.includes(action);
}

/**
 * Separation of Duties check:
 * submittedBy !== registeredBy
 * createdBy !== approvedBy
 */
export function checkSeparationOfDuties(
  user: User,
  caseRecord: LegalAidCase
): { allowed: boolean; reasonBn?: string; isSelfApprovalAttempt: boolean } {
  // Check if current user is the one who created or submitted this application
  const isCreator =
    (caseRecord.createdBy && caseRecord.createdBy === user.id) ||
    (caseRecord.submittedBy && caseRecord.submittedBy === user.id) ||
    (caseRecord.assignedOfficerName && caseRecord.assignedOfficerName === user.name);

  if (isCreator) {
    return {
      allowed: false,
      reasonBn:
        'স্বার্থের সংঘাত প্রতিরোধ (Separation of Duties): আবেদনকারী বা দাখিলকারী কর্মকর্তা নিজে এই আবেদন অনুমোদন বা নিবন্ধন করতে পারবেন না। জেলা লিগ্যাল এইড কমিটির অন্য কোনো অনুমোদিত কর্মকর্তা দ্বারা এটি অনুমোদিত হতে হবে।',
      isSelfApprovalAttempt: true,
    };
  }

  return { allowed: true, isSelfApprovalAttempt: false };
}

/**
 * Emergency Override verification for Self-Approval
 */
export function canPerformEmergencyOverride(user: User): boolean {
  return user.role === 'NATIONAL_ADMIN' || user.role === 'SYSTEM_ADMIN';
}
