/**
 * ড্যাশবোর্ড পরিসংখ্যান হিসাবায়ন ইঞ্জিন (Dynamic Dashboard Metrics Engine)
 * Derives all metrics in real-time from the active dataset. No hardcoded counters.
 */

import { LegalAidCase, PanelLawyer, SecurityIncident, VulnerabilityItem } from '../types/legalAid';
import { DEMO_SNAPSHOT_DATE } from '../utils/dateUtils';

export interface DashboardMetricsSummary {
  totalCases: number;
  // Mutually Exclusive Primary Case Statuses
  submittedCases: number;
  underReviewCases: number;
  registeredCases: number;
  ongoingCases: number;
  awaitingResolutionCases: number;
  resolvedCases: number;
  closedCases: number;
  appealedCases: number;

  // Deadline Statuses (Orthogonal to Case Status)
  expiredCases: number;
  atRiskCases: number;
  approachingCases: number;
  normalDeadlineCases: number;

  // Activity Status (Orthogonal to Case Status)
  activeCases: number;
  inactiveCases: number;

  // Operational metrics
  todaysHearingsCount: number;
  lawyerAssignmentPendingCount: number;
  overdueCases: number;
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

  // 1. Mutually Exclusive Primary Case Statuses
  const submittedCases = cases.filter((c) => c.status === 'SUBMITTED').length;
  const underReviewCases = cases.filter((c) => c.status === 'UNDER_REVIEW').length;
  const registeredCases = cases.filter((c) => c.status === 'REGISTERED').length;
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
  const resolvedCases = cases.filter((c) => c.status === 'RESOLVED').length;
  const closedCases = cases.filter(
    (c) => c.status === 'CLOSED' || c.status === 'DISPOSED'
  ).length;
  const appealedCases = cases.filter((c) => c.status === 'APPEALED').length;

  // 2. Orthogonal Deadline Statuses
  const expiredCases = cases.filter(
    (c) =>
      c.deadlineStatus === 'EXPIRED' ||
      (c.status !== 'CLOSED' && c.status !== 'DISPOSED' && c.status !== 'RESOLVED' && c.slaRemainingDays < 0)
  ).length;

  const atRiskCases = cases.filter(
    (c) =>
      c.deadlineStatus === 'AT_RISK' ||
      (c.status !== 'CLOSED' && c.status !== 'DISPOSED' && c.status !== 'RESOLVED' && c.slaRemainingDays >= 0 && c.slaRemainingDays <= 7)
  ).length;

  const approachingCases = cases.filter(
    (c) =>
      c.deadlineStatus === 'APPROACHING' ||
      (c.status !== 'CLOSED' && c.status !== 'DISPOSED' && c.status !== 'RESOLVED' && c.slaRemainingDays > 7 && c.slaRemainingDays <= 20)
  ).length;

  const normalDeadlineCases = cases.filter(
    (c) =>
      c.deadlineStatus === 'NORMAL' ||
      c.status === 'CLOSED' ||
      c.status === 'DISPOSED' ||
      c.status === 'RESOLVED' ||
      c.slaRemainingDays > 20
  ).length;

  // 3. Orthogonal Activity Status
  const inactiveCases = cases.filter(
    (c) =>
      c.activityStatus === 'INACTIVE' ||
      ((c.daysWithoutActivity || 0) >= 30 && c.status !== 'CLOSED' && c.status !== 'DISPOSED')
  ).length;
  const activeCases = totalCases - inactiveCases;

  // 4. Today's hearings: matching DEMO_SNAPSHOT_DATE and SCHEDULED
  const todaysHearingsCount = cases.reduce((acc, c) => {
    const todayHearings = c.hearings.filter(
      (h) =>
        (h.hearingDate === snapshotDate ||
          h.isoDate === snapshotDate ||
          (h.date && h.date.includes('০৯ সেপ্টেম্বর ২০২৬'))) &&
        (h.status === 'SCHEDULED' || !h.status)
    );
    return acc + todayHearings.length;
  }, 0);

  const lawyerAssignmentPendingCount = cases.filter(
    (c) =>
      !c.assignedLawyerId &&
      (c.status === 'LAWYER_PENDING' ||
        c.status === 'PENDING_LAWYER_ASSIGNMENT' ||
        c.status === 'REGISTERED' ||
        c.status === 'SUBMITTED' ||
        c.status === 'UNDER_REVIEW')
  ).length;

  const overdueCases = expiredCases;
  const slaRiskCount = atRiskCases;
  const inactiveStuckCasesCount = inactiveCases;

  const openSecurityIncidentsCount = securityIncidents.filter(
    (i) => i.status === 'OPEN' || i.status === 'INVESTIGATING' || i.status === 'DETECTED'
  ).length;

  const criticalVulnerabilitiesCount = vulnerabilities.filter(
    (v) => (v.severity === 'CRITICAL' || v.severity === 'HIGH') && v.status !== 'RESOLVED'
  ).length;

  const disposedCasesCount = closedCases + resolvedCases;

  const activeLawyersCount = lawyers.length;
  const overcapacityLawyersCount = lawyers.filter(
    (l) => (l.workloadPercentage || 0) >= 100 || l.currentActiveCases >= l.maxCaseLimit
  ).length;

  return {
    totalCases,
    submittedCases,
    underReviewCases,
    registeredCases,
    ongoingCases,
    awaitingResolutionCases,
    resolvedCases,
    closedCases,
    appealedCases,

    expiredCases,
    atRiskCases,
    approachingCases,
    normalDeadlineCases,

    activeCases,
    inactiveCases,

    todaysHearingsCount,
    lawyerAssignmentPendingCount,
    overdueCases,
    slaRiskCount,
    inactiveStuckCasesCount,
    openSecurityIncidentsCount,
    criticalVulnerabilitiesCount,
    disposedCasesCount,
    activeLawyersCount,
    overcapacityLawyersCount,
  };
}
