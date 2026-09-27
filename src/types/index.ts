export type Role = 'scholar' | 'coordinator' | 'admin';

export type UserStatus = 'active' | 'pending' | 'deactivated';

export type ScholarshipStatus = 'Active' | 'Graduated' | 'Withdrawn';

export interface User {
  id: string;
  role: Role;
  status: UserStatus;
  name: string;
  userId: string;
  email: string;
  contact: string;
  program?: string;
  scholarshipProgram?: string;
  yearLevel?: string;
  school?: string;
  collegeProgram?: string;
  municipality?: string;
  Baranggay?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  suffixName?: string;
  dateOfBirth?: string;
  sex?: 'Male' | 'Female';
  office?: string | null;
  password: string;
  profilePicture: string;
  dateRegistered: string;
  scholarshipStatus?: ScholarshipStatus;
  mustChangePassword?: boolean;
}

export const SCHOLARSHIP_PROGRAMS = [
  'Engineering, Mathematics, and Technology',
  'Accountancy, Business, and Management',
  'Humanities and Social Sciences',
  'Health and Science',
  'Agriculture and Fisheries',
  'Technical-Vocational',
] as const;

export interface OfficialScholarRecipient {
  scholarName: string;
  scholarshipTrack: string;
}

export type RegistrationExceptionReason =
  | 'unmatched_roster'
  | 'track_mismatch'
  | 'duplicate_account'
  | 'duplicate_email';

export interface RegistrationException {
  id: string;
  name: string;
  email: string;
  contact?: string;
  scholarshipProgram?: string;
  collegeProgram?: string;
  school?: string;
  attemptedAt: string;
  reason: RegistrationExceptionReason;
  reasonDescription: string;
  suggestedMatch?: string;
  status: 'pending_review' | 'resolved' | 'dismissed';
  notes?: string;
}

export type TaskStatus = 'open' | 'full' | 'completed' | 'closed' | 'draft';

export interface Task {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  creditHours: number;
  slotsTotal: number;
  slotsFilled: number;
  dateStart: string;
  dateEnd: string;
  location: string;
  requirements: string;
  status: TaskStatus;
  createdBy: string;
  createdAt?: string;
  semester?: string;
  year?: number;
}

export type ApplicationStatus =
  | 'applied'
  | 'confirmed'
  | 'proof_submitted'
  | 'verified'
  | 'hours_reflected'
  | 'rejected';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'applied',
  'confirmed',
  'proof_submitted',
  'verified',
  'hours_reflected',
];

export interface Application {
  id: string;
  taskId: string;
  scholarId: string;
  appliedAt: string; // ISO timestamp — drives FIFO / FCFS order
  status: ApplicationStatus;
  evidenceFile: string | null;
  evidenceNotes: string | null;
  rejectionReason: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  hoursCredited: number | null;
  submittedAt?: string | null;
}

export type DocumentCategory = 'renewal' | 'guideline' | 'policy';

export interface DocumentRecord {
  id: string;
  fileName: string;
  category: DocumentCategory;
  uploadedAt: string;
  uploadedBy: string;
  fileSize?: string;
  description?: string;
}

export type NotificationType =
  | 'application_status'
  | 'new_task'
  | 'reminder'
  | 'account';

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface ActivityLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  role: Role;
}
