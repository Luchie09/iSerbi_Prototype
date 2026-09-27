import {
  Application,
  Task,
  NotificationRecord,
} from '../types';

/**
 * 5.1 FCFS / FIFO Queue Position
 * Returns 1-based queue position of a given application among all
 * applications for the same task, ordered by appliedAt ascending.
 */
export function getQueuePosition(
  applicationId: string,
  applications: Application[]
): { position: number; totalInQueue: number } {
  const targetApp = applications.find((app) => app.id === applicationId);
  if (!targetApp) {
    return { position: 0, totalInQueue: 0 };
  }

  // Filter all non-rejected applications for this task
  const taskApps = applications
    .filter((app) => app.taskId === targetApp.taskId && app.status !== 'rejected')
    .sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime());

  const index = taskApps.findIndex((app) => app.id === applicationId);
  return {
    position: index >= 0 ? index + 1 : 0,
    totalInQueue: taskApps.length,
  };
}

/**
 * 5.2 Cumulative hours (Prefix Sum Simulation)
 * Sums hoursCredited across all of a scholar's applications with
 * status === "hours_reflected", optionally filtered by semester/year.
 */
export function getCumulativeHours(
  scholarId: string,
  applications: Application[],
  tasks: Task[],
  options?: { semester?: string; year?: number }
): number {
  const verifiedApps = applications.filter(
    (app) => app.scholarId === scholarId && app.status === 'hours_reflected'
  );

  return verifiedApps.reduce((total, app) => {
    const task = tasks.find((t) => t.id === app.taskId);
    if (options?.semester && task && task.semester !== options.semester) {
      return total;
    }
    if (options?.year && task && task.year !== options.year) {
      return total;
    }
    return total + (app.hoursCredited ?? task?.creditHours ?? 0);
  }, 0);
}

/**
 * Helper to compute Prefix Sum array and breakdown for completed tasks
 */
export interface PrefixSumItem {
  applicationId: string;
  taskId: string;
  taskTitle: string;
  verifiedAt: string;
  creditHours: number;
  cumulativeHours: number; // prefix sum at this step
}

export function computePrefixSumHistory(
  scholarId: string,
  applications: Application[],
  tasks: Task[],
  semesterFilter?: string
): { items: PrefixSumItem[]; totalCumulative: number } {
  const completedApps = applications
    .filter((app) => app.scholarId === scholarId && app.status === 'hours_reflected')
    .sort((a, b) => {
      const timeA = new Date(a.verifiedAt || a.appliedAt).getTime();
      const timeB = new Date(b.verifiedAt || b.appliedAt).getTime();
      return timeA - timeB;
    });

  let runningSum = 0;
  const items: PrefixSumItem[] = [];

  for (const app of completedApps) {
    const task = tasks.find((t) => t.id === app.taskId);
    if (semesterFilter && semesterFilter !== 'All' && task?.semester !== semesterFilter) {
      continue;
    }
    const hours = app.hoursCredited ?? task?.creditHours ?? 0;
    runningSum += hours;
    items.push({
      applicationId: app.id,
      taskId: app.taskId,
      taskTitle: task?.title ?? 'Community Service Task',
      verifiedAt: app.verifiedAt || app.appliedAt,
      creditHours: hours,
      cumulativeHours: runningSum,
    });
  }

  return {
    items,
    totalCumulative: runningSum,
  };
}

/**
 * 5.3 Status Transition (Coordinator Verification Action)
 * Approve: sets status to "verified", then "hours_reflected",
 * sets hoursCredited from the task's creditHours, sets verifiedAt/verifiedBy.
 */
export function approveApplication(
  applicationId: string,
  coordinatorId: string,
  applications: Application[],
  tasks: Task[]
): { updatedApplications: Application[]; creditedHours: number } {
  const app = applications.find((a) => a.id === applicationId);
  if (!app) return { updatedApplications: applications, creditedHours: 0 };

  const task = tasks.find((t) => t.id === app.taskId);
  const credit = task?.creditHours ?? 0;
  const now = new Date().toISOString();

  const updatedApplications = applications.map((item) => {
    if (item.id === applicationId) {
      return {
        ...item,
        status: 'hours_reflected' as const,
        verifiedAt: now,
        verifiedBy: coordinatorId,
        hoursCredited: credit,
      };
    }
    return item;
  });

  return { updatedApplications, creditedHours: credit };
}

/**
 * Reject: sets status to "rejected", requires a non-empty reason string.
 */
export function rejectApplication(
  applicationId: string,
  reason: string,
  coordinatorId: string,
  applications: Application[]
): Application[] {
  if (!reason.trim()) {
    throw new Error('A non-empty rejection reason is required.');
  }

  const now = new Date().toISOString();

  return applications.map((item) => {
    if (item.id === applicationId) {
      return {
        ...item,
        status: 'rejected' as const,
        rejectionReason: reason.trim(),
        verifiedAt: now,
        verifiedBy: coordinatorId,
      };
    }
    return item;
  });
}

/**
 * 5.4 Notification Helpers
 */
export function markAsRead(
  notificationId: string,
  notifications: NotificationRecord[]
): NotificationRecord[] {
  return notifications.map((n) =>
    n.id === notificationId ? { ...n, read: true } : n
  );
}

export function markAllAsRead(
  userId: string,
  notifications: NotificationRecord[]
): NotificationRecord[] {
  return notifications.map((n) =>
    n.userId === userId ? { ...n, read: true } : n
  );
}

export function deleteNotification(
  notificationId: string,
  notifications: NotificationRecord[]
): NotificationRecord[] {
  return notifications.filter((n) => n.id !== notificationId);
}

export function deleteAllNotifications(
  userId: string,
  notifications: NotificationRecord[]
): NotificationRecord[] {
  return notifications.filter((n) => n.userId !== userId);
}

/**
 * Consistent date & time formatter across all roles
 */
export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getSubmissionHistory(
  app?: { submittedAt?: string | null; submissionHistory?: { action: 'Submitted' | 'Edited' | 'Resubmitted'; timestamp: string }[] } | null
): { action: 'Submitted' | 'Edited' | 'Resubmitted'; timestamp: string }[] {
  if (!app) return [];

  const history = Array.isArray(app.submissionHistory) ? app.submissionHistory : [];
  if (history.length > 0) {
    return [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  if (app.submittedAt) {
    return [{ action: 'Submitted', timestamp: app.submittedAt }];
  }

  return [];
}

export function formatDateOnly(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Auto-calculates age from a date of birth string (YYYY-MM-DD or ISO).
 */
export function calculateAge(dateOfBirth?: string | null): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Client-side CSV Exporter for Service Records
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export type TaskCategory = 'open' | 'closed' | 'finished' | 'draft';

/**
 * Determines the normalized category/status of a task:
 * - 'draft': Created but not yet published (coordinator-only)
 * - 'finished': Task itself has already been completed/conducted
 * - 'closed': Deadline has passed; no further applications accepted
 * - 'open': Application period is active; queue remains open even when slots are filled
 *
 * Legacy task entries that still use a 'full' status are treated as Open so the FIFO queue
 * model remains consistent with the updated business rules.
 */
export function getTaskCategory(task: Task): TaskCategory {
  if (task.status === 'draft') return 'draft';
  if (task.status === 'finished' || (task.status as string) === 'completed') return 'finished';
  if (task.status === 'closed') return 'closed';
  if ((task.status as string) === 'full') return 'open';

  if (task.deadline) {
    const deadlineTime = new Date(task.deadline).getTime();
    if (!isNaN(deadlineTime) && deadlineTime < Date.now()) {
      return 'closed';
    }
  }

  return 'open';
}
