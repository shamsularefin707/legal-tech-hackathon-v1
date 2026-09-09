/**
 * জাতীয় আইনগত সহায়তা কার্যক্রম ব্যবস্থাপনা
 * Context & Justice Operations State Engine
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  User,
  LegalAidCase,
  PanelLawyer,
  AuditLogEntry,
  SecurityEvent,
  PriorityLevel,
  CaseStatus,
  CaseDocument,
  VulnerabilityItem,
  SecurityIncident,
  LifecycleStageKey,
} from '../types/legalAid';
import {
  INITIAL_USERS,
  INITIAL_SECURITY_INCIDENTS,
} from '../data/initialData';
import {
  generateCompleteDemoDataset,
  recalculateLawyerWorkloads,
  DEFAULT_DEMO_DATA_SEED,
  CompleteDemoDataset,
} from '../data/demoGenerator';

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: 'URGENT' | 'WARNING' | 'INFO';
  read: boolean;
  linkCaseId?: string;
}

export interface SimulationStepLog {
  step: number;
  titleBn: string;
  titleEn: string;
  detail: string;
  status: 'DONE' | 'RUNNING' | 'PENDING';
  timestamp?: string;
}

export interface SimulationState {
  isRunning: boolean;
  currentStep: number;
  isCompleted: boolean;
  logs: SimulationStepLog[];
  correlationId?: string;
}

interface LegalAidContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  cases: LegalAidCase[];
  lawyers: PanelLawyer[];
  auditLogs: AuditLogEntry[];
  securityEvents: SecurityEvent[];
  vulnerabilities: VulnerabilityItem[];
  securityIncidents: SecurityIncident[];
  notifications: NotificationItem[];
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  selectedVulnerabilityId: string | null;
  setSelectedVulnerabilityId: (id: string | null) => void;
  selectedIncidentId: string | null;
  setSelectedIncidentId: (id: string | null) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  
  // Modals & Inspection
  isIncidentModalOpen: boolean;
  setIsIncidentModalOpen: (open: boolean) => void;
  isNikahnamaPreviewOpen: boolean;
  setIsNikahnamaPreviewOpen: (open: boolean) => void;
  isSimulationModalOpen: boolean;
  setIsSimulationModalOpen: (open: boolean) => void;
  simulationState: SimulationState;
  
  // Synthetic Demo Dataset Management & Controls
  demoSeed: number;
  regenerateDataset: (newSeed?: number) => void;
  resetToDefaultSeed: () => void;
  validationReport: CompleteDemoDataset['validationReport'];
  isDemoDataPanelOpen: boolean;
  setIsDemoDataPanelOpen: (open: boolean) => void;
  
  // Security & Object-Level Authorization
  checkObjectAccess: (caseRecord: LegalAidCase) => { allowed: boolean; reason?: string };
  triggerUnauthorizedCaseAccessDemo: () => void;
  triggerBulkDownloadAbuseDemo: () => void;
  runSecuritySimulation: () => void;
  viewSecurityIncident: (incidentId: string) => void;
  openNikahnamaPreview: () => void;
  updateVulnerabilityStage: (vulnId: string, stageKey: LifecycleStageKey, status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING') => void;
  
  // Justice Operations Actions
  assignLawyerToCase: (caseId: string, lawyerId: string, overrideReason?: string) => { success: boolean; message: string };
  overrideCasePriority: (caseId: string, newPriority: PriorityLevel, reason: string) => boolean;
  updateCaseStatus: (caseId: string, newStatus: CaseStatus, note: string) => void;
  addDocumentToCase: (caseId: string, docData: { title: string; category: CaseDocument['category']; fileName: string; fileSizeBytes: number; mimeType: string }) => { success: boolean; message: string };
  simulateDownloadDocument: (caseId: string, docId: string) => { success: boolean; message: string };
  requestDataExport: (exportType: string, district: string, reason: string) => { success: boolean; message: string; exportId?: string };
  
  // Computed stats
  stuckCases: LegalAidCase[];
  atRiskDeadlinesCount: number;
}

const LegalAidContext = createContext<LegalAidContextType | undefined>(undefined);

export const LegalAidProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoSeed, setDemoSeed] = useState<number>(DEFAULT_DEMO_DATA_SEED);
  const initialDataset = useMemo(() => generateCompleteDemoDataset(DEFAULT_DEMO_DATA_SEED), []);

  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to District Officer
  const [cases, setCases] = useState<LegalAidCase[]>(initialDataset.cases);
  const [lawyers, setLawyers] = useState<PanelLawyer[]>(initialDataset.lawyers);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(initialDataset.auditLogs);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(initialDataset.securityEvents);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityItem[]>(initialDataset.vulnerabilities);
  const [validationReport, setValidationReport] = useState(initialDataset.validationReport);
  const [securityIncidents, setSecurityIncidents] = useState<SecurityIncident[]>(INITIAL_SECURITY_INCIDENTS);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('case-1284');
  const [selectedVulnerabilityId, setSelectedVulnerabilityId] = useState<string | null>('VULN-DEMO-001');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('inc-42');
  const [activeView, setActiveView] = useState<string>('dashboard');

  // Modals state
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isNikahnamaPreviewOpen, setIsNikahnamaPreviewOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [isDemoDataPanelOpen, setIsDemoDataPanelOpen] = useState(false);

  const regenerateDataset = (newSeed?: number) => {
    const seedToUse = newSeed !== undefined ? newSeed : demoSeed;
    setDemoSeed(seedToUse);
    const fresh = generateCompleteDemoDataset(seedToUse);
    setCases(fresh.cases);
    setLawyers(fresh.lawyers);
    setSecurityEvents(fresh.securityEvents);
    setVulnerabilities(fresh.vulnerabilities);
    setAuditLogs(fresh.auditLogs);
    setValidationReport(fresh.validationReport);
    setSelectedCaseId('case-1284');
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `সিন্থেটিক ডেটাসেট সফলভাবে পুনর্জেনারেট করা হয়েছে (বীজ: ${seedToUse})।`,
        time: 'এখনই',
        type: 'INFO',
        read: false,
      },
      ...prev,
    ]);
  };

  const resetToDefaultSeed = () => {
    regenerateDataset(DEFAULT_DEMO_DATA_SEED);
  };

  const [simulationState, setSimulationState] = useState<SimulationState>({
    isRunning: false,
    currentStep: 0,
    isCompleted: false,
    logs: [],
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'মামলা LA-2026-001284-এর আইনজীবী নিয়োগের সময়সীমা বাকি মাত্র ২ দিন।',
      time: 'আজ সকাল ০৯:৩০',
      type: 'URGENT',
      read: false,
      linkCaseId: 'case-1284',
    },
    {
      id: 'notif-2',
      title: 'মামলা LA-2026-001219 গত ৮ দিন ধরে কার্যক্রমহীন (অচল মামলা সতর্কতা)।',
      time: 'আজ সকাল ০৯:১৫',
      type: 'WARNING',
      read: false,
      linkCaseId: 'case-1219',
    },
    {
      id: 'notif-3',
      title: 'মামলা LA-2026-001190-এর লিখিত জবাব দাখিলের সময়সীমা অতিক্রান্ত হয়েছে।',
      time: 'গতকাল বিকাল ০৪:০০',
      type: 'WARNING',
      read: true,
      linkCaseId: 'case-1190',
    },
    {
      id: 'notif-4',
      title: 'একটি বাহ্যিক অননুমোদিত নথি রিড চেষ্টা নিরাপত্তা ফিল্টারে প্রতিহত হয়েছে।',
      time: '১১ সেপ্টেম্বর ২০২৬',
      type: 'URGENT',
      read: false,
    },
  ]);

  // Object-Level Authorization Rule (Section 20)
  const checkObjectAccess = (caseRecord: LegalAidCase): { allowed: boolean; reason?: string } => {
    // 1. National Officer & System Admin have country-wide read/audit permissions
    if (currentUser.role === 'SYSTEM_ADMIN' || currentUser.role === 'NATIONAL_OFFICER') {
      return { allowed: true };
    }

    // 2. District Officer & Assistant Officer only have access to cases in their district
    if (currentUser.role === 'DISTRICT_OFFICER' || currentUser.role === 'ASSISTANT_OFFICER' || currentUser.role === 'OBSERVER') {
      if (currentUser.district === caseRecord.district) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: `প্রশাসনিক এক্তিয়ার লঙ্ঘন: আপনি '${currentUser.district}' জেলার কর্মকর্তা। '${caseRecord.district}' জেলার মামলা দেখার অনুমতি আপনার নেই।`,
      };
    }

    // 3. Panel Lawyer can ONLY access cases specifically assigned to them!
    if (currentUser.role === 'PANEL_LAWYER') {
      if (caseRecord.assignedLawyerId && caseRecord.assignedLawyerId === currentUser.assignedLawyerId) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: 'অনধিকার প্রবেশ প্রতিহত: এই মামলাটি আপনার নিকট নিয়োগকৃত নয়। প্যানেল আইনজীবী শুধুমাত্র তার নিজ দায়িত্বপ্রাপ্ত মামলার বিবরণ দেখার ক্ষমতাপ্রাপ্ত।',
      };
    }

    return { allowed: false, reason: 'অননুমোদিত ভূমিকা।' };
  };

  // Helper to log audit entries immutably
  const logAudit = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formattedDate = `১১ সেপ্টেম্বর ২০২৬, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      timestamp: formattedDate,
      ...entry,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  // Helper to log security events
  const logSecurity = (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formattedDate = `১১ সেপ্টেম্বর ২০২৬, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newSecEvent: SecurityEvent = {
      id: `sec-${Date.now().toString().slice(-4)}`,
      timestamp: formattedDate,
      ...event,
    };
    setSecurityEvents((prev) => [newSecEvent, ...prev]);
  };

  // Security Demonstration 1: Unauthorized District / Out-of-Scope case access attempt
  const triggerUnauthorizedCaseAccessDemo = () => {
    // Attempt to access case in Gazipur or unassigned
    const targetCase = cases.find((c) => c.district === 'গাজীপুর') || cases[cases.length - 1];
    const reasonMsg = `ব্যবহারকারী '${currentUser.name}' (${currentUser.role}) কর্তৃক এক্তিয়ারবহির্ভূত মামলা '${targetCase.caseNumber}' (${targetCase.district}) প্রবেশের অননুমোদিত চেষ্টা প্রতিহত করা হয়েছে।`;
    
    logAudit({
      user: currentUser.name,
      role: currentUser.designation,
      action: 'এক্তিয়ারবহির্ভূত মামলা প্রবেশের চেষ্টা (IDOR/BOLA প্রতিরোধ)',
      resourceType: 'মামলা',
      resourceId: targetCase.caseNumber,
      outcome: 'প্রত্যাখ্যাত',
      ipAddress: '192.168.10.74',
      districtScope: currentUser.district,
      details: reasonMsg,
    });

    logSecurity({
      severity: 'WARNING',
      title: 'অবজেক্ট-লেভেল অনুমোদন (BOLA) লঙ্ঘন প্রতিহত',
      description: reasonMsg,
      user: currentUser.name,
      role: currentUser.designation,
      resourceId: targetCase.caseNumber,
      blocked: true,
      actionTaken: 'এপিআই লেভেলে অনুরোধ প্রত্যাখ্যান (HTTP 403 Forbidden) এবং নিরাপত্তা লগে নথিভুক্ত।',
    });

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `নিরাপত্তা সতর্কতা: মামলা ${targetCase.caseNumber}-এ অননুমোদিত প্রবেশের চেষ্টা প্রতিহত হয়েছে।`,
        time: 'এখনই',
        type: 'URGENT',
        read: false,
      },
      ...prev,
    ]);
  };

  // Security Demonstration 2: Rapid/Bulk Document Download Abuse detection
  const triggerBulkDownloadAbuseDemo = () => {
    const targetCase = cases[0];
    const desc = `স্বল্প সময়ের ব্যবধানে (৩০ সেকেন্ডে ৭টি) মামলার একাধিক সংরক্ষিত বিচারিক নথি গণহারে ডাউনলোডের চেষ্টা শনাক্ত হয়েছে। স্বয়ংক্রিয় ট্রাফিক থ্রোটলিং প্রয়োগ করা হয়েছে।`;
    
    logAudit({
      user: currentUser.name,
      role: currentUser.designation,
      action: 'সংবেদনশীল নথি গণডাউনলোড অপচেষ্টা শনাক্ত',
      eventType: 'DOCUMENT_DOWNLOAD_BLOCKED',
      resourceType: 'নথি',
      resourceId: `${targetCase.caseNumber} - সকল নথি`,
      outcome: 'ব্লক করা হয়েছে',
      reason: 'অস্বাভাবিক ডাউনলোডের ফ্রিকোয়েন্সি (Anti-Scraping / WAF Rate Limit)',
      correlationId: 'SEC-TRC-99342',
      ipAddress: '192.168.10.74',
      districtScope: currentUser.district,
      details: desc,
      evidenceData: {
        rawEndpoint: 'POST /api/v1/cases/export/batch-documents',
        requestMethod: 'POST',
        failureReason: 'RATE_LIMIT_EXCEEDED',
        policyViolated: 'SEC-DLP-BULK-01: ৩০ সেকেন্ডে সর্বোচ্চ ২টি নথি ডাউনলোড অনুমোদিত',
        mitigationAction: 'আইপি থ্রোটল ও ইউজার সেশন সাময়িক স্থগিত',
      },
    });

    logSecurity({
      severity: 'CRITICAL',
      title: 'নথি নিষ্কাসন অসঙ্গতি (Anomalous Bulk Download) শনাক্ত ও স্থগিত',
      description: desc,
      user: currentUser.name,
      role: currentUser.designation,
      resourceId: targetCase.caseNumber,
      blocked: true,
      actionTaken: 'অতিরিক্ত অনুরোধ ব্লক করা হয়েছে; ব্যবহারকারীর অধিবেশন (Session) নজরদারিতে রাখা হয়েছে।',
      correlationId: 'SEC-TRC-99342',
    });

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'গুরুতর নিরাপত্তা সতর্কতা: অস্বাভাবিক সংখ্যক নথি ডাউনলোডের চেষ্টা প্রতিহত করা হয়েছে।',
        time: 'এখনই',
        type: 'URGENT',
        read: false,
      },
      ...prev,
    ]);
  };

  // Interactive 10-step End-to-End Security Simulation Engine
  const runSecuritySimulation = () => {
    setIsSimulationModalOpen(true);
    const correlationId = `SEC-SIM-${Math.floor(1000 + Math.random() * 9000)}`;

    const stepsTemplate: SimulationStepLog[] = [
      {
        step: 1,
        titleBn: '১. অননুমোদিত নথি এক্সেস অনুরোধ প্রেরণ',
        titleEn: 'Unauthorized Document Access Request',
        detail: 'বহিরাগত আইপি ২০৩.১১২.৫৫.১৯ থেকে কেস LA-2026-001284-এর সংবেদনশীল নথি doc-4 (নিকাহনামা) সরাসরি ডাউনলোডের রিকোয়েস্ট আসে।',
        status: 'RUNNING',
      },
      {
        step: 2,
        titleBn: '২. টোকেন যাচাইকরণ ব্যর্থ (Token Validation Failed)',
        titleEn: 'Token Signature Validation Check',
        detail: 'রিকোয়েস্ট হেডারে কোনো বৈধ ক্রিপ্টোগ্রাফিক বিয়ারার টোকেন বা সেশন সিগনেচার পাওয়া যায়নি। RFC 7519 ভ্যালিডেশন ফেইল্ড।',
        status: 'PENDING',
      },
      {
        step: 3,
        titleBn: '৩. ভূমিকাভিত্তিক এক্সেস ও BOLA ফিল্টারে অনুমোদন প্রত্যাখ্যান',
        titleEn: 'RBAC / BOLA Authorization Denied',
        detail: 'রিকোয়েস্টকারী আবেদনকারী, নিয়োগকৃত আইনজীবী বা জেলা কর্মকর্তা না হওয়ায় অবজেক্ট-লেভেল এক্সেস কঠোরভাবে ডিনায়েড।',
        status: 'PENDING',
      },
      {
        step: 4,
        titleBn: '৪. অনুরোধ তাৎক্ষণিকভাবে প্রতিহত (HTTP 403 Forbidden)',
        titleEn: 'Traffic Drop / Block Action',
        detail: 'ডকুমেন্ট রিপোজিটরি গেটওয়ে কোনো বাইনারি ফাইল ডেটা স্ট্রিম না করে সংযোগ তাত্ক্ষণিক বন্ধ করে দেয়।',
        status: 'PENDING',
      },
      {
        step: 5,
        titleBn: '৫. সিকিউরিটি ইনসিডেন্ট রেজিস্ট্রি প্রস্তুত (INC-2026-0042)',
        titleEn: 'Security Incident Created in Registry',
        detail: 'নিরাপত্তা সাব-সিস্টেমে অটোমেটিক ক্রিটিক্যাল ইনসিডেন্ট টিকেট নিবন্ধিত হয়।',
        status: 'PENDING',
      },
      {
        step: 6,
        titleBn: '৬. ঝুঁকি স্তর শ্রেণিবিভাগ ও অগ্রাধিকার নিরূপণ',
        titleEn: 'Risk Classification (CRITICAL - CVSS 9.1)',
        detail: 'সংবেদনশীল পারিবারিক মামলার গোপনীয় আইনি নথি হওয়ায় তাৎক্ষণিক সর্বোচ্চ সংবেদনশীলতা নির্ধারিত হয়।',
        status: 'PENDING',
      },
      {
        step: 7,
        titleBn: '৭. অপরিবর্তনীয় অডিট ট্রেইলে প্রমাণ সংরক্ষণ',
        titleEn: 'Immutable Audit Trail Ledger Entry',
        detail: `প্যাকেট হেডার হ্যাশ ও আইপি সহ রেকর্ড লেজারে সংরক্ষিত। ট্র্যাকিং আইডি: ${correlationId}`,
        status: 'PENDING',
      },
      {
        step: 8,
        titleBn: '৮. প্রশাসনিক ড্যাশবোর্ডে উচ্চ-ঝুঁকি সতর্কবার্তা জারি',
        titleEn: 'Administrator Notification Dispatched',
        detail: 'জেলা লিগ্যাল এইড কর্মকর্তা ও জাতীয় নিরাপত্তা প্রশাসকের ডেস্কে পুশ অ্যালার্ট ও ইভেন্ট নোটিফিকেশন জারি।',
        status: 'PENDING',
      },
      {
        step: 9,
        titleBn: '৯. স্বয়ংক্রিয় প্রতিরোধ ও কোয়ারেন্টিন (Containment)',
        titleEn: 'Automated Containment & Quarantine',
        detail: 'সংশ্লিষ্ট আইপি ঠিকানা নিরাপত্তা ব্লকলিস্টে প্রেরণ এবং ওয়ান-টাইম ইউআরএল মেয়াদ ১ মিনিটে সীমিত।',
        status: 'PENDING',
      },
      {
        step: 10,
        titleBn: '১০. যাচাইকরণ পরীক্ষা সফল ও অখণ্ডতা সিলমোহর',
        titleEn: 'Verification & Integrity Seal Complete',
        detail: 'নথির নিরাপত্তা হ্যাশ অক্ষত রয়েছে। কোনো ডেটা লিক সংঘটিত হয়নি। ঘটনাটি নিয়ন্ত্রিত (CONTAINED)।',
        status: 'PENDING',
      },
    ];

    setSimulationState({
      isRunning: true,
      currentStep: 1,
      isCompleted: false,
      logs: stepsTemplate,
      correlationId,
    });

    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx < stepsTemplate.length) {
        setSimulationState((prev) => {
          const updatedLogs = prev.logs.map((log, idx) => {
            if (idx < currentIdx) return { ...log, status: 'DONE' as const };
            if (idx === currentIdx) return { ...log, status: 'RUNNING' as const };
            return { ...log, status: 'PENDING' as const };
          });
          return {
            ...prev,
            currentStep: currentIdx + 1,
            logs: updatedLogs,
          };
        });
      } else {
        clearInterval(interval);
        setSimulationState((prev) => ({
          ...prev,
          currentStep: 10,
          isCompleted: true,
          isRunning: false,
          logs: prev.logs.map((l) => ({ ...l, status: 'DONE' as const })),
        }));

        // Append real log entry
        logAudit({
          user: 'নিরাপত্তা মহড়া ইঞ্জিন (SecSim v2.4)',
          role: 'স্বয়ংক্রিয় নিরাপত্তা সিমুলেটর',
          action: 'লাইভ নিরাপত্তা প্রতিরোধ মহড়া পরিচালনা',
          eventType: 'SECURITY_INCIDENT_CREATED',
          resourceType: 'নিরাপত্তা',
          resourceId: 'INC-2026-0042',
          outcome: 'ব্লক করা হয়েছে',
          reason: 'অননুমোদিত সরাসরি নথি ডাউনলোডের চেষ্টা প্রতিহত ও নিয়ন্ত্রিত (CONTAINED)।',
          correlationId,
          ipAddress: '203.112.55.19',
          districtScope: 'জাতীয় পর্যবেক্ষণ',
          details: '১০-ধাপ বিশিষ্ট অ্যান্ড-টু-অ্যান্ড ইনসিডেন্ট রেসপন্স মহড়া সফলভাবে সম্পন্ন হয়েছে। সকল নিয়ন্ত্রণ অক্ষত।',
          evidenceData: {
            rawEndpoint: 'GET /api/v1/cases/LA-2026-001284/documents/doc-4/download',
            requestMethod: 'GET',
            failureReason: 'TOKEN_VALIDATION_FAILED',
            policyViolated: 'SEC-BOLA-01: অবজেক্ট-লেভেল এক্সেস অনুমোদন নেই',
            targetResourceHash: 'sha256:4f8a9e23c7b165...9d21e8',
            mitigationAction: 'আইপি কোয়ারেন্টিন ও ইনসিডেন্ট ট্র্যাকিং সক্রিয়',
          },
        });

        // Push alert notification
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            title: `মহড়া সফল: অননুমোদিত নথি এক্সেস প্রতিহত ও অডিট লগে সংরক্ষিত (আইডি: ${correlationId})।`,
            time: 'এখনই',
            type: 'URGENT',
            read: false,
          },
          ...prev,
        ]);
      }
    }, 450);
  };

  const viewSecurityIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setIsIncidentModalOpen(true);
  };

  const openNikahnamaPreview = () => {
    setIsNikahnamaPreviewOpen(true);
  };

  const updateVulnerabilityStage = (vulnId: string, stageKey: LifecycleStageKey, status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING') => {
    setVulnerabilities((prev) =>
      prev.map((v) => {
        if (v.id === vulnId) {
          const updatedLifecycle = v.lifecycle.map((stg) =>
            stg.stage === stageKey ? { ...stg, status } : stg
          );
          return { ...v, lifecycle: updatedLifecycle };
        }
        return v;
      })
    );
  };

  // Justice Operations: Assign Lawyer Workflow
  const assignLawyerToCase = (
    caseId: string,
    lawyerId: string,
    overrideReason?: string
  ): { success: boolean; message: string } => {
    const targetCase = cases.find((c) => c.id === caseId);
    const selectedLawyer = lawyers.find((l) => l.id === lawyerId);

    if (!targetCase || !selectedLawyer) {
      return { success: false, message: 'মামলা অথবা আইনজীবী শনাক্ত করা যায়নি।' };
    }

    // Conflict of Interest Check
    const hasConflict = selectedLawyer.knownConflicts.some(
      (conflictParty) =>
        conflictParty.toLowerCase().includes(targetCase.applicant.opposingPartyName.toLowerCase()) ||
        targetCase.applicant.opposingPartyName.toLowerCase().includes(conflictParty.toLowerCase())
    );

    if (hasConflict && !overrideReason) {
      logAudit({
        user: currentUser.name,
        role: currentUser.designation,
        action: 'স্বার্থের সংঘাত সতর্কতায় নিয়োগ স্থগিত',
        resourceType: 'আইনজীবী',
        resourceId: `${targetCase.caseNumber} -> ${selectedLawyer.name}`,
        outcome: 'প্রত্যাখ্যাত',
        ipAddress: '192.168.10.12',
        districtScope: currentUser.district,
        details: `আইনজীবী ${selectedLawyer.name}-এর সাথে প্রতিপক্ষ '${targetCase.applicant.opposingPartyName}'-এর স্বার্থের সংঘাত বিদ্যমান। লিখিত কর্মকর্তার সিদ্ধান্ত ব্যতিরেকে নিয়োগ সম্পন্ন করা যাবে না।`,
      });

      return {
        success: false,
        message: `সম্ভাব্য স্বার্থের সংঘাত শনাক্ত হয়েছে: আইনজীবী '${selectedLawyer.name}' পূর্বে প্রতিপক্ষ '${targetCase.applicant.opposingPartyName}'-এর পক্ষে কার্যক্রমে ছিলেন। বিশেষ লিখিত অনুমোদন ব্যতিরেকে নিয়োগ অসম্ভব।`,
      };
    }

    // Workload limit warning check
    if (selectedLawyer.currentActiveCases >= selectedLawyer.maxCaseLimit && !overrideReason) {
      return {
        success: false,
        message: `আইনজীবীর নির্ধারিত কাজের চাপ অতিরিক্ত (বর্তমানে ${selectedLawyer.currentActiveCases}টি, সীমা ${selectedLawyer.maxCaseLimit}টি)। লিখিত কারণ ব্যতিরেকে অতিরিক্ত মামলা অর্পণ করা যাবে না।`,
      };
    }

    const previousLawyer = targetCase.assignedLawyerName || 'অনিয়োগকৃত';

    // Update Lawyer Cases Count
    setLawyers((prev) =>
      prev.map((l) =>
        l.id === lawyerId ? { ...l, currentActiveCases: l.currentActiveCases + 1 } : l
      )
    );

    // Update Case
    const updatedTimelineItem = {
      id: `tl-${Date.now()}`,
      date: '১১ সেপ্টেম্বর ২০২৬',
      time: 'সকাল ১০:৩০',
      user: currentUser.name,
      role: currentUser.designation,
      action: 'আইনজীবী নিয়োগ সম্পন্ন',
      description: `বিজ্ঞ প্যানেল আইনজীবী ${selectedLawyer.name} (বার নং ${selectedLawyer.barRegNo})-কে মামলার দায়িত্ব অর্পণ করা হয়েছে। ${
        overrideReason ? `(কর্মকর্তার লিখিত ব্যখ্যা: ${overrideReason})` : 'স্বার্থের সংঘাতহীন ও বিশেষায়ন উপযুক্ততার ভিত্তিতে অনুমোদিত।'
      }`,
      isOfficialRecord: true,
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'LAWYER_ASSIGNED',
            assignedLawyerId: selectedLawyer.id,
            assignedLawyerName: selectedLawyer.name,
            assignedLawyerBarNo: selectedLawyer.barRegNo,
            assignedDate: '১১ সেপ্টেম্বর ২০২৬',
            lastActivityDate: '১১ সেপ্টেম্বর ২০২৬',
            daysWithoutActivity: 0,
            timeline: [updatedTimelineItem, ...c.timeline],
            deadlines: c.deadlines.map((d) =>
              d.id === 'dl-1'
                ? { ...d, status: 'MET', actionRequired: 'নিয়োগ সম্পন্ন হয়েছে' }
                : { ...d, assignedLawyer: selectedLawyer.name }
            ),
          };
        }
        return c;
      })
    );

    // Immutable Audit Log
    logAudit({
      user: currentUser.name,
      role: currentUser.designation,
      action: 'প্যানেল আইনজীবী নিয়োগ',
      resourceType: 'আইনজীবী',
      resourceId: `${targetCase.caseNumber}`,
      previousState: previousLawyer,
      nextState: `${selectedLawyer.name} (${selectedLawyer.barRegNo})`,
      outcome: 'সফল',
      ipAddress: '192.168.10.12',
      districtScope: targetCase.district,
      details: `মামলা ${targetCase.caseNumber}-এ আইনজীবী নিয়োগ অনুমোদিত হয়েছে। ${
        overrideReason ? `প্রশাসনিক ব্যখ্যা: ${overrideReason}` : ''
      }`,
    });

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: `মামলা ${targetCase.caseNumber}-এ প্যানেল আইনজীবী হিসেবে ${selectedLawyer.name}-কে সফলভাবে নিয়োগ দেওয়া হয়েছে।`,
        time: 'এখনই',
        type: 'INFO',
        read: false,
        linkCaseId: targetCase.id,
      },
      ...prev,
    ]);

    return {
      success: true,
      message: `আইনজীবী ${selectedLawyer.name} সফলভাবে নিয়োগপ্রাপ্ত হয়েছেন এবং মামলার অগ্রগতি টাইমলাইনে নথিভুক্ত হয়েছে।`,
    };
  };

  // Officer Priority Override (Section 7)
  const overrideCasePriority = (
    caseId: string,
    newPriority: PriorityLevel,
    reason: string
  ): boolean => {
    if (!reason.trim()) return false;

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const prevPriority = c.priorityAssessment.calculatedPriority;
          const timelineEntry = {
            id: `tl-${Date.now()}`,
            date: '১১ সেপ্টেম্বর ২০২৬',
            time: 'সকাল ১১:০০',
            user: currentUser.name,
            role: currentUser.designation,
            action: 'কর্মকর্তার সিদ্ধান্তে অগ্রাধিকার পুনর্নির্ধারণ',
            description: `স্বয়ংক্রিয় অগ্রাধিকার '${prevPriority}' পরিবর্তন করে '${newPriority}' নির্ধারণ করা হয়েছে। কর্মকর্তার কারণ: ${reason}`,
            isOfficialRecord: true,
          };

          return {
            ...c,
            lastActivityDate: '১১ সেপ্টেম্বর ২০২৬',
            timeline: [timelineEntry, ...c.timeline],
            priorityAssessment: {
              ...c.priorityAssessment,
              calculatedPriority: newPriority,
              officerOverride: {
                overriddenPriority: newPriority,
                officerName: currentUser.name,
                officerRole: currentUser.designation,
                reason,
                timestamp: '১১ সেপ্টেম্বর ২০২৬, সকাল ১১:০০',
              },
            },
          };
        }
        return c;
      })
    );

    const targetCase = cases.find((c) => c.id === caseId);
    logAudit({
      user: currentUser.name,
      role: currentUser.designation,
      action: 'অগ্রাধিকার সংশোধন ও প্রশাসনিক ব্যখ্যা নথিভুক্ত',
      resourceType: 'মামলা',
      resourceId: targetCase ? targetCase.caseNumber : caseId,
      nextState: `অগ্রাধিকার: ${newPriority}`,
      outcome: 'সফল',
      ipAddress: '192.168.10.12',
      districtScope: currentUser.district,
      details: `কর্মকর্তার লিখিত যুক্তি: ${reason}`,
    });

    return true;
  };

  // Update Case Status
  const updateCaseStatus = (caseId: string, newStatus: CaseStatus, note: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const timelineEntry = {
            id: `tl-${Date.now()}`,
            date: '১১ সেপ্টেম্বর ২০২৬',
            time: 'দুপুর ১২:০০',
            user: currentUser.name,
            role: currentUser.designation,
            action: 'মামলার অবস্থা পরিবর্তন',
            description: `মামলার অবস্থা '${c.status}' থেকে '${newStatus}'-এ পরিবর্তিত হয়েছে। বিবরণ: ${note}`,
            isOfficialRecord: true,
          };
          return {
            ...c,
            status: newStatus,
            lastActivityDate: '১১ সেপ্টেম্বর ২০২৬',
            daysWithoutActivity: 0,
            timeline: [timelineEntry, ...c.timeline],
          };
        }
        return c;
      })
    );

    const targetCase = cases.find((c) => c.id === caseId);
    logAudit({
      user: currentUser.name,
      role: currentUser.designation,
      action: 'মামলার অবস্থা হালনাগাদ',
      resourceType: 'মামলা',
      resourceId: targetCase ? targetCase.caseNumber : caseId,
      previousState: targetCase ? targetCase.status : '',
      nextState: newStatus,
      outcome: 'সফল',
      ipAddress: '192.168.10.12',
      districtScope: targetCase ? targetCase.district : 'ঢাকা',
      details: note,
    });
  };

  // Add Document
  const addDocumentToCase = (
    caseId: string,
    docData: {
      title: string;
      category: CaseDocument['category'];
      fileName: string;
      fileSizeBytes: number;
      mimeType: string;
    }
  ): { success: boolean; message: string } => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedMimes.includes(docData.mimeType)) {
      return { success: false, message: 'অসমর্থিত ফাইল ফরম্যাট। শুধুমাত্র পিডিএফ ও জেপিজি/পিএনজি অনুমতিপ্রাপ্ত।' };
    }
    if (docData.fileSizeBytes > 10 * 1024 * 1024) {
      return { success: false, message: 'ফাইলের আকার ১০ মেগাবাইটের বেশি হতে পারবে না।' };
    }

    const newDoc: CaseDocument = {
      id: `doc-${Date.now()}`,
      title: docData.title,
      category: docData.category,
      fileName: `SEC_${Date.now()}_${docData.fileName}`,
      fileSizeBytes: docData.fileSizeBytes,
      uploadedAt: '১১ সেপ্টেম্বর ২০২৬, ১২:১৫',
      uploadedBy: `${currentUser.name} (${currentUser.designation})`,
      mimeType: docData.mimeType,
      securityHash: `sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}89a7`,
      isRestricted: false,
      accessCount: 1,
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          return {
            ...c,
            documents: [newDoc, ...c.documents],
            lastActivityDate: '১১ সেপ্টেম্বর ২০২৬',
            daysWithoutActivity: 0,
            timeline: [
              {
                id: `tl-${Date.now()}`,
                date: '১১ সেপ্টেম্বর ২০২৬',
                time: 'দুপুর ১২:১৫',
                user: currentUser.name,
                role: currentUser.designation,
                action: 'নতুন নথি আপলোড ও যাচাই',
                description: `নথি '${docData.title}' সফলভাবে আপলোড ও হ্যাশ নিরাপত্তা যাচাই সম্পন্ন হয়েছে।`,
                isOfficialRecord: true,
              },
              ...c.timeline,
            ],
          };
        }
        return c;
      })
    );

    logAudit({
      user: currentUser.name,
      role: currentUser.designation,
      action: 'নথি সংযোজন ও অখণ্ডতা যাচাই',
      resourceType: 'নথি',
      resourceId: `${caseId} / ${newDoc.id}`,
      outcome: 'সফল',
      ipAddress: '192.168.10.12',
      districtScope: currentUser.district,
      details: `শিরোনাম: ${docData.title}, ফাইল: ${docData.fileName}, হ্যাশ: ${newDoc.securityHash}`,
    });

    return { success: true, message: 'নথিটি সফলভাবে সংরক্ষিত ও নিরাপদ সার্ভারে এনক্রিপ্ট করা হয়েছে।' };
  };

  // Simulate authorized document download
  const simulateDownloadDocument = (caseId: string, docId: string): { success: boolean; message: string } => {
    const targetCase = cases.find((c) => c.id === caseId);
    if (!targetCase) return { success: false, message: 'মামলা পাওয়া যায়নি।' };
    
    const access = checkObjectAccess(targetCase);
    if (!access.allowed) {
      logAudit({
        user: currentUser.name,
        role: currentUser.designation,
        action: 'অননুমোদিত নথি ডাউনলোডের চেষ্টা',
        resourceType: 'নথি',
        resourceId: `${targetCase.caseNumber} / ${docId}`,
        outcome: 'প্রত্যাখ্যাত',
        ipAddress: '192.168.10.12',
        districtScope: currentUser.district,
        details: access.reason || 'অননুমোদিত প্রবেশ',
      });
      return { success: false, message: access.reason || 'অনুমতি নেই।' };
    }

    logAudit({
      user: currentUser.name,
      role: currentUser.designation,
      action: 'অনুমোদিত নথি ডাউনলোড ও নিরীক্ষা',
      resourceType: 'নথি',
      resourceId: `${targetCase.caseNumber} / ${docId}`,
      outcome: 'সফল',
      ipAddress: '192.168.10.12',
      districtScope: currentUser.district,
      details: `ব্যবহারকারী সাময়িক সুরক্ষিত এক্সেস টোকেন ব্যবহার করে নথি ডাউনলোড করেছেন।`,
    });

    return { success: true, message: 'অনুমোদিত টোকেনের মাধ্যমে নিরাপদ নথি প্রস্তুত হয়েছে।' };
  };

  // Data Export Request (Section 24)
  const requestDataExport = (
    exportType: string,
    district: string,
    reason: string
  ): { success: boolean; message: string; exportId?: string } => {
    if (!reason || reason.trim().length < 10) {
      return {
        success: false,
        message: 'তথ্য রপ্তানির জন্য বিস্তারিত সুনির্দিষ্ট প্রশাসনিক কারণ উল্লেখ করা বাধ্যতামূলক (ন্যূনতম ১০ অক্ষর)।',
      };
    }

    if (currentUser.role === 'PANEL_LAWYER' || currentUser.role === 'OBSERVER') {
      logAudit({
        user: currentUser.name,
        role: currentUser.designation,
        action: 'অননুমোদিত বাল্ক ডেটা রপ্তানির চেষ্টা প্রতিহত',
        resourceType: 'প্রতিবেদন',
        resourceId: exportType,
        outcome: 'প্রত্যাখ্যাত',
        ipAddress: '192.168.10.12',
        districtScope: currentUser.district,
        details: `প্যানেল আইনজীবী বা পর্যবেক্ষকের বাল্ক তথ্য রপ্তানির অনুমতি নেই।`,
      });
      return { success: false, message: 'আপনার বর্তমান প্রশাসনিক ভূমিকায় তথ্য রপ্তানির অধিকার সংরক্ষিত নেই।' };
    }

    const exportId = `EXP-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    logAudit({
      user: currentUser.name,
      role: currentUser.designation,
      action: 'অনুমোদিত তথ্য রপ্তানি লগ তৈরি',
      resourceType: 'প্রতিবেদন',
      resourceId: exportId,
      outcome: 'সফল',
      ipAddress: '192.168.10.12',
      districtScope: district,
      details: `ধরণ: ${exportType}, জেলা: ${district}, সংরক্ষিত উদ্দেশ্য: ${reason}`,
    });

    return {
      success: true,
      message: `রপ্তানি ফাইল প্রস্তুত হয়েছে। ট্র্যাকিং আইডি: ${exportId}। অডিট লগে এন্ট্রি সংরক্ষিত হয়েছে।`,
      exportId,
    };
  };

  // Computed stuck cases (Section 16)
  const stuckCases = useMemo(() => {
    return cases.filter((c) => c.daysWithoutActivity >= 7 && c.status !== 'DISPOSED' && c.status !== 'CLOSED');
  }, [cases]);

  // Computed deadlines at risk count (Derived dynamically from cases)
  const atRiskDeadlinesCount = useMemo(() => {
    return cases.filter(
      (c) =>
        c.slaStatus === 'APPROACHING_RISK' ||
        c.slaStatus === 'BREACHED' ||
        c.deadlines.some((d) => d.status === 'OVERDUE' || d.daysRemaining <= 3)
    ).length;
  }, [cases]);

  return (
    <LegalAidContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        cases,
        lawyers,
        auditLogs,
        securityEvents,
        vulnerabilities,
        securityIncidents,
        notifications,
        selectedCaseId,
        setSelectedCaseId,
        selectedVulnerabilityId,
        setSelectedVulnerabilityId,
        selectedIncidentId,
        setSelectedIncidentId,
        activeView,
        setActiveView,
        isIncidentModalOpen,
        setIsIncidentModalOpen,
        isNikahnamaPreviewOpen,
        setIsNikahnamaPreviewOpen,
        isSimulationModalOpen,
        setIsSimulationModalOpen,
        simulationState,
        demoSeed,
        regenerateDataset,
        resetToDefaultSeed,
        validationReport,
        isDemoDataPanelOpen,
        setIsDemoDataPanelOpen,
        checkObjectAccess,
        triggerUnauthorizedCaseAccessDemo,
        triggerBulkDownloadAbuseDemo,
        runSecuritySimulation,
        viewSecurityIncident,
        openNikahnamaPreview,
        updateVulnerabilityStage,
        assignLawyerToCase,
        overrideCasePriority,
        updateCaseStatus,
        addDocumentToCase,
        simulateDownloadDocument,
        requestDataExport,
        stuckCases,
        atRiskDeadlinesCount,
      }}
    >
      {children}
    </LegalAidContext.Provider>
  );
};

export const useLegalAid = () => {
  const context = useContext(LegalAidContext);
  if (!context) {
    throw new Error('useLegalAid must be used within LegalAidProvider');
  }
  return context;
};
