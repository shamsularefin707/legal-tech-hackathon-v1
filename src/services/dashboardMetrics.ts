/**
 * ড্যাশবোর্ড পরিসংখ্যান হিসাবায়ন ইঞ্জিন (Dynamic Dashboard Metrics Engine)
 * Derives all metrics in real-time from the active dataset. No hardcoded counters.
 */

import { LegalAidCase, PanelLawyer, SecurityIncident, VulnerabilityItem } from '../types/legalAid';
import { DEMO_SNAPSHOT_DATE } from '../utils/dateUtils';

export interface DashboardMetricsSummary {
  totalCases: number;
  ongoingCases: number;
  awaitingResolutionCases: number;
  overdueCases: number;
  todaysHearingsCount: number;
  lawyerAssignmentPendingCount: number;
  slaRiskCount: number;
  inactiveStuckCasesCount: number;
  openSecurityIncidentsCount: number;
  criticalVulnerabilitiesCount: number;
  disposedCasesCount: number;
  activeLawyersCount: number;
  overcapacityLawyersCount: number;
}

export function calculateDashboardMetrics(
  cases: LegalAidCase[],
  lawyers: PanelLawyer[],
  securityIncidents: SecurityIncident[],
  vulnerabilities: VulnerabilityItem[],
  snapshotDate: string = DEMO_SNAPSHOT_DATE
): DashboardMetricsSummary {
  const totalCases = cases.length;

  const ongoingCases = cases.filter(
    (c) =>
      c.status === 'ONGOING' ||
      c.status === 'HEARING_SCHEDULED' ||
      c.status === 'HEARING_ONGOING' ||
      c.status === 'IN_PROGRESS' ||
      c.status === 'MEDIATION_ONGOING'
  ).length;

  const awaitingResolutionCases = cases.filter(
    (c) => c.status === 'AWAITING_RESOLUTION' || c.status === 'PENDING_APPROVAL'
  ).length;

  const overdueCases = cases.filter(
    (c) =>
      c.status === 'OVERDUE' ||
      c.slaStatus === 'OVERDUE' ||
      c.slaStatus === 'BREACHED' ||
      c.deadlines.some((d) => d.status === 'OVERDUE')
  ).length;

  // Today's hearings: matching DEMO_SNAPSHOT_DATE
  const todaysHearingsCount = cases.reduce((acc, c) => {
    const todayHearings = c.hearings.filter(
      (h) => h.isoDate === snapshotDate || (h.date && h.date.includes('০৯ সেপ্টেম্বর ২০২৬'))
    );
    return acc + todayHearings.length;
  }, 0);

  const lawyerAssignmentPendingCount = cases.filter(
    (c) =>
      !c.assignedLawyerId &&
      (c.status === 'LAWYER_PENDING' ||
        c.status === 'PENDING_LAWYER_ASSIGNMENT' ||
        c.status === 'REGISTERED')
  ).length;

  const slaRiskCount = cases.filter(
    (c) =>
      c.slaStatus === 'AT_RISK' ||
      c.slaStatus === 'APPROACHING_RISK' ||
      c.slaStatus === 'OVERDUE' ||
      c.slaStatus === 'BREACHED'
  ).length;

  const inactiveStuckCasesCount = cases.filter((c) => (c.daysWithoutActivity || 0) >= 14).length;

  const openSecurityIncidentsCount = securityIncidents.filter(
    (i) => i.status === 'OPEN' || i.status === 'INVESTIGATING' || i.status === 'DETECTED'
  ).length;

  const criticalVulnerabilitiesCount = vulnerabilities.filter(
    (v) => (v.severity === 'CRITICAL' || v.severity === 'HIGH') && v.status !== 'RESOLVED'
  ).length;

  const disposedCasesCount = cases.filter(
    (c) => c.status === 'DISPOSED' || c.status === 'CLOSED'
  ).length;

  const activeLawyersCount = lawyers.length;
  const overcapacityLawyersCount = lawyers.filter(
    (l) => (l.workloadPercentage || 0) >= 100 || l.currentActiveCases >= l.maxCaseLimit
  ).length;

  return {
    totalCases,
    ongoingCases,
    awaitingResolutionCases,
    overdueCases,
    todaysHearingsCount,
    lawyerAssignmentPendingCount,
    slaRiskCount,
    inactiveStuckCasesCount,
    openSecurityIncidentsCount,
    criticalVulnerabilitiesCount,
    disposedCasesCount,
    activeLawyersCount,
    overcapacityLawyersCount,
  };
}
