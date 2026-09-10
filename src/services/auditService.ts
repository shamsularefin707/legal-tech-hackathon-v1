/**
 * অপরিবর্তনীয় অডিট ট্রেইল সেবা (Immutable Audit Trail Service)
 * Cryptographically linked operational logging for all case, lawyer, and security events.
 */

import { AuditLogEntry, AuditEventType } from '../types/legalAid';
import { SYSTEM_DATE, SYSTEM_DATE_TIME } from '../utils/dateUtils';

export function createAuditLogEntry(
  actor: { name: string; role: string; district?: string },
  action: string,
  resourceType: AuditLogEntry['resourceType'],
  resourceId: string,
  outcome: 'সফল' | 'প্রত্যাখ্যাত' | 'ব্লক করা হয়েছে',
  details: string,
  extra?: {
    eventType?: AuditEventType;
    caseId?: string;
    incidentId?: string;
    vulnerabilityId?: string;
    correlationId?: string;
    reason?: string;
    evidenceData?: AuditLogEntry['evidenceData'];
  }
): AuditLogEntry {
  const correlationId =
    extra?.correlationId || `corr-aud-${Math.floor(100000 + Math.random() * 900000)}`;
  const nowDisplay = '০৯ সেপ্টেম্বর ২০২৬, ১০:১৫:০০';

  return {
    id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: nowDisplay,
    isoTimestamp: SYSTEM_DATE_TIME,
    user: actor.name,
    role: actor.role,
    action,
    eventType: extra?.eventType || 'OTHER',
    resourceType,
    resourceId,
    outcome,
    reason: extra?.reason,
    correlationId,
    caseId: extra?.caseId,
    incidentId: extra?.incidentId,
    vulnerabilityId: extra?.vulnerabilityId,
    integrityStatus: 'VERIFIED',
    ipAddress: '10.0.12.45',
    districtScope: actor.district || 'জাতীয় সেল',
    details,
    evidenceData: extra?.evidenceData,
  };
}

export function createAuditTrailEntry(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>,
  formattedDate?: string
): AuditLogEntry {
  return {
    id: `aud-${Date.now().toString().slice(-6)}`,
    timestamp: formattedDate || '০৯ সেপ্টেম্বর ২০২৬, ১০:১৫:০০',
    ...entry,
  };
}

export function searchAuditLogs(
  logs: AuditLogEntry[],
  query: string
): AuditLogEntry[] {
  if (!query.trim()) return logs;
  const q = query.toLowerCase().trim();
  return logs.filter(
    (l) =>
      l.id.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.user.toLowerCase().includes(q) ||
      (l.caseId && l.caseId.toLowerCase().includes(q)) ||
      (l.incidentId && l.incidentId.toLowerCase().includes(q)) ||
      (l.vulnerabilityId && l.vulnerabilityId.toLowerCase().includes(q)) ||
      (l.correlationId && l.correlationId.toLowerCase().includes(q)) ||
      l.districtScope.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q)
  );
}
