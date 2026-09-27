import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  User,
  Task,
  Application,
  DocumentRecord,
  NotificationRecord,
  ScholarshipStatus,
  UserStatus,
  ApplicationStatus,
  OfficialScholarRecipient,
  RegistrationException,
} from '../types';
import { INITIAL_DEMO_DATA, DemoDatabase } from '../data/demo-data';
import {
  approveApplication,
  rejectApplication,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../logic/core';

interface AppContextType {
  currentUser: User | null;
  currentRoute: string;
  data: DemoDatabase;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  navigate: (route: string) => void;
  login: (userId: string, password?: string) => boolean;
  switchUser: (userId: string) => void;
  logout: () => void;
  applyForTask: (taskId: string) => boolean;
  submitEvidence: (applicationId: string, fileName: string, notes: string) => void;
  approveApplicationAction: (applicationId: string) => void;
  rejectApplicationAction: (applicationId: string, reason: string) => void;
  createTask: (task: Omit<Task, 'id' | 'slotsFilled' | 'createdBy' | 'createdAt'>, isDraft: boolean) => void;
  updateTask: (taskId: string, task: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  uploadDocument: (doc: Omit<DocumentRecord, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  replaceDocument: (docId: string, fileName: string, fileSize?: string) => void;
  deleteDocument: (docId: string) => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  updateScholarStatus: (userId: string, status: ScholarshipStatus) => void;
  registerUser: (
    userData: Omit<User, 'id' | 'dateRegistered' | 'status'> & { status?: UserStatus }
  ) => void;
  registerScholar: (
    userData: Omit<User, 'id' | 'userId' | 'dateRegistered' | 'status' | 'role' | 'scholarshipStatus'>
  ) => { success: true; userId: string } | { success: false; reason: 'not_found' | 'exists' };
  replaceOfficialScholarRecipients: (recipients: OfficialScholarRecipient[]) => void;
  resolveRegistrationException: (id: string, notes?: string) => void;
  dismissRegistrationException: (id: string) => void;
  deleteRegistrationException: (id: string) => void;
  approveUserRegistration: (userId: string) => void;
  toggleUserStatus: (userId: string) => void;
  resetUserPassword: (userId: string, newPass?: string) => void;
  overrideServiceRecord: (applicationId: string, hours: number, status: ApplicationStatus) => void;
  markNotifRead: (notifId: string) => void;
  markAllNotifsRead: () => void;
  deleteNotif: (notifId: string) => void;
  deleteAllNotifs: () => void;
  resetAllDataToDefault: () => void;
}

const STORAGE_KEY = 'iserbi_prototype_db_v3';
const AUTH_KEY = 'iserbi_current_user_id';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load data from localStorage or fallback to INITIAL_DEMO_DATA
  const [data, setData] = useState<DemoDatabase>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.applications?.some((a: Application) => a.id === 'APP-0021' && a.status === 'confirmed')) {
          return {
            ...parsed,
            officialScholarRecipients:
              Array.isArray(parsed.officialScholarRecipients) && parsed.officialScholarRecipients.length > 0
                ? parsed.officialScholarRecipients
                : INITIAL_DEMO_DATA.officialScholarRecipients,
            registrationExceptions:
              Array.isArray(parsed.registrationExceptions) && parsed.registrationExceptions.length > 0
                ? parsed.registrationExceptions
                : INITIAL_DEMO_DATA.registrationExceptions,
          };
        }
      }
    } catch (e) {
      console.error('Failed to parse saved database from localStorage', e);
    }
    return INITIAL_DEMO_DATA;
  });

  // Current authenticated user
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const savedUser = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
      if (savedUser) return savedUser;
    } catch {
      // ignore
    }
    // Default to initial active scholar for smooth interactive prototype launch
    return 'USR-0001';
  });

  const currentUser = data.users.find((u) => u.id === currentUserId) || null;

  // Active hash route
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash || '#dashboard';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [data]);

  // Sync current user to session/localStorage
  useEffect(() => {
    if (currentUserId) {
      sessionStorage.setItem(AUTH_KEY, currentUserId);
      localStorage.setItem(AUTH_KEY, currentUserId);
    } else {
      sessionStorage.removeItem(AUTH_KEY);
      localStorage.removeItem(AUTH_KEY);
    }
  }, [currentUserId]);

  // Listen to hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || (currentUser ? '#dashboard' : '#login');
      setCurrentRoute(hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  }, []);

  const navigate = useCallback((route: string) => {
    window.location.hash = route;
    setCurrentRoute(route);
    setSidebarOpen(false);
  }, []);

  const login = useCallback(
    (userId: string, password?: string): boolean => {
      const trimmedId = userId.trim();
      const user = data.users.find(
        (u) =>
          u.userId.toLowerCase() === trimmedId.toLowerCase() ||
          u.email.toLowerCase() === trimmedId.toLowerCase()
      );

      if (!user) {
        showToast('Account not found with this User ID or Email.', 'error');
        return false;
      }

      if (user.status === 'pending') {
        showToast('Your registration is pending coordinator approval.', 'info');
        return false;
      }

      if (user.status === 'deactivated') {
        showToast('This account has been deactivated. Please contact administrator.', 'error');
        return false;
      }

      if (password && user.password !== password) {
        showToast('Invalid credentials. Please verify your password.', 'error');
        return false;
      }

      setCurrentUserId(user.id);
      showToast(`Welcome back, ${user.name}!`, 'success');
      navigate('#dashboard');
      return true;
    },
    [data.users, navigate, showToast]
  );

  const switchUser = useCallback(
    (userId: string) => {
      const user = data.users.find((u) => u.id === userId);
      if (user) {
        setCurrentUserId(user.id);
        showToast(`Switched active view to ${user.name} (${user.role.toUpperCase()})`, 'info');
        navigate('#dashboard');
      }
    },
    [data.users, navigate, showToast]
  );

  const logout = useCallback(() => {
    setCurrentUserId(null);
    showToast('You have been logged out safely.', 'info');
    navigate('#login');
  }, [navigate, showToast]);

  const applyForTask = useCallback(
    (taskId: string): boolean => {
      if (!currentUser || currentUser.role !== 'scholar') {
        showToast('Only scholars can apply for community service tasks.', 'error');
        return false;
      }

      const task = data.tasks.find((t) => t.id === taskId);
      if (!task) return false;

      // Check if already applied
      const existing = data.applications.find(
        (a) => a.taskId === taskId && a.scholarId === currentUser.id && a.status !== 'rejected'
      );
      if (existing) {
        showToast('You have already applied for this task.', 'info');
        return false;
      }

      const now = new Date().toISOString();
      const newAppId = `APP-${String(data.applications.length + 1).padStart(4, '0')}`;

      const newApplication: Application = {
        id: newAppId,
        taskId,
        scholarId: currentUser.id,
        appliedAt: now,
        status: 'applied',
        evidenceFile: null,
        evidenceNotes: null,
        rejectionReason: null,
        verifiedAt: null,
        verifiedBy: null,
        hoursCredited: null,
      };

      // Add application and increment filled slots
      setData((prev) => ({
        ...prev,
        applications: [...prev.applications, newApplication],
        tasks: prev.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                slotsFilled: t.slotsFilled + 1,
                status: t.slotsFilled + 1 >= t.slotsTotal ? 'full' : t.status,
              }
            : t
        ),
        notifications: [
          ...prev.notifications,
          {
            id: `NOTIF-${Date.now()}`,
            userId: currentUser.id,
            type: 'application_status',
            message: `Successfully queued for "${task.title}". Your application is queued in FIFO order.`,
            createdAt: now,
            read: false,
            link: '#applications',
          },
        ],
        activities: [
          {
            id: `ACT-${Date.now()}`,
            actor: currentUser.name,
            action: 'Applied for task',
            target: task.title,
            timestamp: now,
            role: 'scholar',
          },
          ...prev.activities,
        ],
      }));

      showToast(`Application submitted! You are queued for ${task.title}.`, 'success');
      return true;
    },
    [currentUser, data.applications, data.tasks, showToast]
  );

  const submitEvidence = useCallback(
    (applicationId: string, fileName: string, notes: string) => {
      const now = new Date().toISOString();
      setData((prev) => {
        const app = prev.applications.find((a) => a.id === applicationId);
        const task = app ? prev.tasks.find((t) => t.id === app.taskId) : null;
        const scholar = app ? prev.users.find((u) => u.id === app.scholarId) : null;

        const updatedApps = prev.applications.map((a) =>
          a.id === applicationId
            ? {
                ...a,
                status: 'proof_submitted' as const,
                evidenceFile: fileName,
                evidenceNotes: notes,
                submittedAt: now,
                rejectionReason: null, // Clear any previous rejection
              }
            : a
        );

        // Notify coordinators
        const coordinatorNotifs: NotificationRecord[] = prev.users
          .filter((u) => u.role === 'coordinator')
          .map((coord) => ({
            id: `NOTIF-${Date.now()}-${coord.id}`,
            userId: coord.id,
            type: 'application_status',
            message: `Proof submitted by ${scholar?.name || 'Scholar'} for "${task?.title || 'Task'}". Ready for verification.`,
            createdAt: now,
            read: false,
            link: '#verification',
          }));

        return {
          ...prev,
          applications: updatedApps,
          notifications: [...prev.notifications, ...coordinatorNotifs],
          activities: [
            {
              id: `ACT-${Date.now()}`,
              actor: scholar?.name || 'Scholar',
              action: 'Submitted evidence for',
              target: task?.title || 'Community Service',
              timestamp: now,
              role: 'scholar',
            },
            ...prev.activities,
          ],
        };
      });

      showToast('Attendance evidence submitted successfully! Awaiting coordinator review.', 'success');
    },
    [showToast]
  );

  const approveApplicationAction = useCallback(
    (applicationId: string) => {
      if (!currentUser) return;
      setData((prev) => {
        const targetApp = prev.applications.find((a) => a.id === applicationId);
        const task = targetApp ? prev.tasks.find((t) => t.id === targetApp.taskId) : null;
        const scholar = targetApp ? prev.users.find((u) => u.id === targetApp.scholarId) : null;

        const { updatedApplications, creditedHours } = approveApplication(
          applicationId,
          currentUser.id,
          prev.applications,
          prev.tasks
        );

        const now = new Date().toISOString();
        const scholarNotif: NotificationRecord | null = scholar
          ? {
              id: `NOTIF-${Date.now()}`,
              userId: scholar.id,
              type: 'application_status',
              message: `Approved! ${creditedHours} community service hours credited for "${task?.title || 'Task'}".`,
              createdAt: now,
              read: false,
              link: '#profile',
            }
          : null;

        return {
          ...prev,
          applications: updatedApplications,
          notifications: scholarNotif ? [...prev.notifications, scholarNotif] : prev.notifications,
          activities: [
            {
              id: `ACT-${Date.now()}`,
              actor: currentUser.name,
              action: `Verified & credited ${creditedHours} hrs for`,
              target: `${task?.title || 'Task'} (${scholar?.name || 'Scholar'})`,
              timestamp: now,
              role: 'coordinator',
            },
            ...prev.activities,
          ],
        };
      });

      showToast('Application verified! Hours reflected immediately.', 'success');
    },
    [currentUser, showToast]
  );

  const rejectApplicationAction = useCallback(
    (applicationId: string, reason: string) => {
      if (!currentUser) return;
      if (!reason.trim()) {
        showToast('Please provide a specific reason for rejection.', 'error');
        return;
      }

      setData((prev) => {
        const targetApp = prev.applications.find((a) => a.id === applicationId);
        const task = targetApp ? prev.tasks.find((t) => t.id === targetApp.taskId) : null;
        const scholar = targetApp ? prev.users.find((u) => u.id === targetApp.scholarId) : null;

        const updatedApps = rejectApplication(
          applicationId,
          reason,
          currentUser.id,
          prev.applications
        );

        const now = new Date().toISOString();
        const scholarNotif: NotificationRecord | null = scholar
          ? {
              id: `NOTIF-${Date.now()}`,
              userId: scholar.id,
              type: 'application_status',
              message: `Your proof for "${task?.title || 'Task'}" was returned: ${reason}`,
              createdAt: now,
              read: false,
              link: '#applications',
            }
          : null;

        return {
          ...prev,
          applications: updatedApps,
          notifications: scholarNotif ? [...prev.notifications, scholarNotif] : prev.notifications,
          activities: [
            {
              id: `ACT-${Date.now()}`,
              actor: currentUser.name,
              action: 'Returned proof for revision on',
              target: `${task?.title || 'Task'} (${scholar?.name || 'Scholar'})`,
              timestamp: now,
              role: 'coordinator',
            },
            ...prev.activities,
          ],
        };
      });

      showToast('Application returned to scholar with feedback.', 'info');
    },
    [currentUser, showToast]
  );

  const createTask = useCallback(
    (taskData: Omit<Task, 'id' | 'slotsFilled' | 'createdBy' | 'createdAt'>, isDraft: boolean) => {
      if (!currentUser) return;
      const now = new Date().toISOString();
      const newTaskId = `TASK-${String(data.tasks.length + 1).padStart(3, '0')}`;
      const newTask: Task = {
        ...taskData,
        id: newTaskId,
        status: isDraft ? 'draft' : 'open',
        slotsFilled: 0,
        createdBy: currentUser.id,
        createdAt: now,
        semester: taskData.semester || '1st Semester 2026-2027',
        year: taskData.year || 2026,
      };

      // If published, broadcast notification to scholars
      const scholarNotifs: NotificationRecord[] = !isDraft
        ? data.users
            .filter((u) => u.role === 'scholar' && u.status === 'active')
            .map((scholar) => ({
              id: `NOTIF-${Date.now()}-${scholar.id}`,
              userId: scholar.id,
              type: 'new_task',
              message: `New Opportunity: "${newTask.title}" (${newTask.creditHours} hrs) is open for application!`,
              createdAt: now,
              read: false,
              link: '#tasks',
            }))
        : [];

      setData((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
        notifications: [...prev.notifications, ...scholarNotifs],
        activities: [
          {
            id: `ACT-${Date.now()}`,
            actor: currentUser.name,
            action: isDraft ? 'Saved draft task' : 'Published new task opportunity',
            target: newTask.title,
            timestamp: now,
            role: 'coordinator',
          },
          ...prev.activities,
        ],
      }));

      showToast(
        isDraft ? 'Task saved as draft.' : 'New task opportunity published successfully!',
        'success'
      );
    },
    [currentUser, data.tasks.length, data.users, showToast]
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
      }));
      showToast('Task updated successfully.', 'success');
    },
    [showToast]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      setData((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== taskId),
        applications: prev.applications.filter((a) => a.taskId !== taskId),
      }));
      showToast('Task removed.', 'info');
    },
    [showToast]
  );

  const uploadDocument = useCallback(
    (doc: Omit<DocumentRecord, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
      if (!currentUser) return;
      const now = new Date().toISOString().split('T')[0];
      const newDoc: DocumentRecord = {
        ...doc,
        id: `DOC-${String(data.documents.length + 1).padStart(3, '0')}`,
        uploadedAt: now,
        uploadedBy: `${currentUser.name} (${currentUser.office || currentUser.role})`,
      };

      setData((prev) => ({
        ...prev,
        documents: [newDoc, ...prev.documents],
        activities: [
          {
            id: `ACT-${Date.now()}`,
            actor: currentUser.name,
            action: 'Uploaded repository document',
            target: newDoc.fileName,
            timestamp: new Date().toISOString(),
            role: currentUser.role,
          },
          ...prev.activities,
        ],
      }));

      showToast(`Document "${newDoc.fileName}" published to repository.`, 'success');
    },
    [currentUser, data.documents.length, showToast]
  );

  const replaceDocument = useCallback(
    (docId: string, fileName: string, fileSize = '1.5 MB') => {
      const now = new Date().toISOString().split('T')[0];
      setData((prev) => ({
        ...prev,
        documents: prev.documents.map((d) =>
          d.id === docId
            ? {
                ...d,
                fileName,
                fileSize,
                uploadedAt: now,
              }
            : d
        ),
      }));
      showToast('Document replaced with updated revision.', 'success');
    },
    [showToast]
  );

  const deleteDocument = useCallback(
    (docId: string) => {
      setData((prev) => ({
        ...prev,
        documents: prev.documents.filter((d) => d.id !== docId),
      }));
      showToast('Document removed from repository.', 'info');
    },
    [showToast]
  );

  const updateUserProfile = useCallback(
    (userId: string, updates: Partial<User>) => {
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
      }));
      showToast('Profile information updated.', 'success');
    },
    [showToast]
  );

  const updateScholarStatus = useCallback(
    (userId: string, scholarshipStatus: ScholarshipStatus) => {
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, scholarshipStatus } : u)),
      }));
      showToast(`Scholarship status updated to ${scholarshipStatus}.`, 'success');
    },
    [showToast]
  );

  const registerUser = useCallback(
    (userData: Omit<User, 'id' | 'dateRegistered' | 'status'> & { status?: UserStatus }) => {
      const now = new Date().toISOString().split('T')[0];
      const newId = `USR-${String(data.users.length + 1).padStart(4, '0')}`;
      const newUser: User = {
        ...userData,
        id: newId,
        status: userData.status || 'active',
        dateRegistered: now,
        scholarshipStatus: userData.scholarshipStatus || 'Active',
      };

      setData((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
        notifications: [
          ...prev.notifications,
          ...prev.users
            .filter((u) => u.role === 'admin' || u.role === 'coordinator')
            .map((admin) => ({
              id: `NOTIF-${Date.now()}-${admin.id}`,
              userId: admin.id,
              type: 'account' as const,
              message: `New scholar registration submitted: ${newUser.name} (${newUser.program}).`,
              createdAt: new Date().toISOString(),
              read: false,
              link: '#users',
            })),
        ],
      }));
    },
    [data.users]
  );

  const replaceOfficialScholarRecipients = useCallback(
    (recipients: OfficialScholarRecipient[]) => {
      setData((prev) => ({ ...prev, officialScholarRecipients: recipients }));
      showToast(`Official recipient list imported: ${recipients.length} records.`, 'success');
    },
    [showToast]
  );

  const registerScholar = useCallback(
    (
      userData: Omit<User, 'id' | 'userId' | 'dateRegistered' | 'status' | 'role' | 'scholarshipStatus'>
    ): { success: true; userId: string } | { success: false; reason: 'not_found' | 'exists' } => {
      const normalize = (value: string) => value.trim().toLocaleLowerCase();
      const normalizedName = normalize(userData.name);
      const normalizedTrack = normalize(userData.scholarshipProgram || '');
      const recipientExists = data.officialScholarRecipients.some(
        (recipient) =>
          normalize(recipient.scholarName) === normalizedName &&
          normalize(recipient.scholarshipTrack) === normalizedTrack
      );

      if (!recipientExists) {
        const matchedByName = data.officialScholarRecipients.find(
          (recipient) => normalize(recipient.scholarName) === normalizedName
        );
        const reason = matchedByName ? 'track_mismatch' : 'unmatched_roster';
        const reasonDescription = matchedByName
          ? `Scholar selected '${userData.scholarshipProgram}', but official CSV record is under '${matchedByName.scholarshipTrack}'.`
          : `Applicant name '${userData.name}' was not found in the official provincial recipient list for '${userData.scholarshipProgram}'.`;
        const suggestedMatch = matchedByName
          ? `Official track on record: '${matchedByName.scholarshipTrack}'`
          : undefined;

        const newException: RegistrationException = {
          id: `EXC-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          contact: userData.contact,
          scholarshipProgram: userData.scholarshipProgram,
          collegeProgram: userData.collegeProgram,
          school: userData.school,
          attemptedAt: new Date().toISOString(),
          reason,
          reasonDescription,
          suggestedMatch,
          status: 'pending_review',
        };

        setData((prev) => ({
          ...prev,
          registrationExceptions: [newException, ...(prev.registrationExceptions || [])],
        }));

        return { success: false, reason: 'not_found' };
      }

      const conflictUser = data.users.find(
        (user) =>
          (user.role === 'scholar' &&
            normalize(user.name) === normalizedName &&
            normalize(user.scholarshipProgram || '') === normalizedTrack) ||
          normalize(user.email) === normalize(userData.email)
      );

      if (conflictUser) {
        const isEmailConflict = normalize(conflictUser.email) === normalize(userData.email);
        const newException: RegistrationException = {
          id: `EXC-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          contact: userData.contact,
          scholarshipProgram: userData.scholarshipProgram,
          collegeProgram: userData.collegeProgram,
          school: userData.school,
          attemptedAt: new Date().toISOString(),
          reason: isEmailConflict ? 'duplicate_email' : 'duplicate_account',
          reasonDescription: isEmailConflict
            ? `Email '${userData.email}' is already registered to user account ${conflictUser.userId} (${conflictUser.name}).`
            : `Official recipient '${userData.name}' is already registered with User ID ${conflictUser.userId}.`,
          suggestedMatch: `Existing account: ${conflictUser.userId} (${conflictUser.email})`,
          status: 'pending_review',
        };

        setData((prev) => ({
          ...prev,
          registrationExceptions: [newException, ...(prev.registrationExceptions || [])],
        }));

        return { success: false, reason: 'exists' };
      }

      const usedInternalIds = new Set(data.users.map((user) => user.id));
      let internalSequence = data.users.length + 1;
      let internalId = `USR-${String(internalSequence).padStart(4, '0')}`;
      while (usedInternalIds.has(internalId)) {
        internalSequence += 1;
        internalId = `USR-${String(internalSequence).padStart(4, '0')}`;
      }

      const usedLoginIds = new Set(data.users.map((user) => user.userId.toLocaleLowerCase()));
      let loginSequence = data.users.filter((user) => user.role === 'scholar').length + 1;
      let userId = `SCH-${String(loginSequence).padStart(5, '0')}`;
      while (usedLoginIds.has(userId.toLocaleLowerCase())) {
        loginSequence += 1;
        userId = `SCH-${String(loginSequence).padStart(5, '0')}`;
      }

      const newUser: User = {
        ...userData,
        id: internalId,
        userId,
        role: 'scholar',
        status: 'active',
        dateRegistered: new Date().toISOString().split('T')[0],
        scholarshipStatus: 'Active',
      };
      setData((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
        registrationExceptions: (prev.registrationExceptions || []).map((exc) =>
          normalize(exc.name) === normalizedName ? { ...exc, status: 'resolved', notes: `Registered as ${userId}` } : exc
        ),
      }));
      showToast(`Account created. Your generated User ID is ${userId}.`, 'success');
      return { success: true, userId };
    },
    [data.officialScholarRecipients, data.users, showToast]
  );

  const resolveRegistrationException = useCallback(
    (exceptionId: string, notes?: string) => {
      setData((prev) => ({
        ...prev,
        registrationExceptions: (prev.registrationExceptions || []).map((exc) =>
          exc.id === exceptionId
            ? { ...exc, status: 'resolved', notes: notes || exc.notes || 'Marked as resolved by Administrator' }
            : exc
        ),
      }));
      showToast('Registration exception marked as resolved.', 'success');
    },
    [showToast]
  );

  const dismissRegistrationException = useCallback(
    (exceptionId: string) => {
      setData((prev) => ({
        ...prev,
        registrationExceptions: (prev.registrationExceptions || []).map((exc) =>
          exc.id === exceptionId ? { ...exc, status: 'dismissed' } : exc
        ),
      }));
      showToast('Registration exception dismissed.', 'info');
    },
    [showToast]
  );

  const deleteRegistrationException = useCallback(
    (exceptionId: string) => {
      setData((prev) => ({
        ...prev,
        registrationExceptions: (prev.registrationExceptions || []).filter(
          (exc) => exc.id !== exceptionId
        ),
      }));
      showToast('Registration exception record removed.', 'info');
    },
    [showToast]
  );

  const approveUserRegistration = useCallback(
    (userId: string) => {
      setData((prev) => {
        const user = prev.users.find((u) => u.id === userId);
        return {
          ...prev,
          users: prev.users.map((u) => (u.id === userId ? { ...u, status: 'active' } : u)),
          activities: [
            {
              id: `ACT-${Date.now()}`,
              actor: currentUser?.name || 'Administrator',
              action: 'Approved account registration for',
              target: user?.name || 'User',
              timestamp: new Date().toISOString(),
              role: currentUser?.role || 'admin',
            },
            ...prev.activities,
          ],
        };
      });
      showToast('User account approved and activated.', 'success');
    },
    [currentUser, showToast]
  );

  const toggleUserStatus = useCallback(
    (userId: string) => {
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => {
          if (u.id === userId) {
            const nextStatus: UserStatus = u.status === 'active' ? 'deactivated' : 'active';
            return { ...u, status: nextStatus };
          }
          return u;
        }),
      }));
      showToast('User account status updated.', 'info');
    },
    [showToast]
  );

  const resetUserPassword = useCallback(
    (userId: string, newPass = 'password123') => {
      setData((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u.id === userId ? { ...u, password: newPass } : u)),
      }));
      showToast(`Password reset successfully (Default: "${newPass}").`, 'success');
    },
    [showToast]
  );

  const overrideServiceRecord = useCallback(
    (applicationId: string, hours: number, status: ApplicationStatus) => {
      setData((prev) => ({
        ...prev,
        applications: prev.applications.map((a) =>
          a.id === applicationId
            ? {
                ...a,
                hoursCredited: hours,
                status,
                verifiedBy: currentUser?.id || a.verifiedBy,
                verifiedAt: a.verifiedAt || new Date().toISOString(),
              }
            : a
        ),
      }));
      showToast('Service record updated.', 'success');
    },
    [currentUser, showToast]
  );

  const markNotifRead = useCallback((notifId: string) => {
    setData((prev) => ({
      ...prev,
      notifications: markAsRead(notifId, prev.notifications),
    }));
  }, []);

  const markAllNotifsRead = useCallback(() => {
    if (!currentUser) return;
    setData((prev) => ({
      ...prev,
      notifications: markAllAsRead(currentUser.id, prev.notifications),
    }));
    showToast('All notifications marked as read.', 'info');
  }, [currentUser, showToast]);

  const deleteNotif = useCallback((notifId: string) => {
    setData((prev) => ({
      ...prev,
      notifications: deleteNotification(notifId, prev.notifications),
    }));
  }, []);

  const deleteAllNotifs = useCallback(() => {
    if (!currentUser) return;
    setData((prev) => ({
      ...prev,
      notifications: deleteAllNotifications(currentUser.id, prev.notifications),
    }));
    showToast('All notifications cleared.', 'info');
  }, [currentUser, showToast]);

  const resetAllDataToDefault = useCallback(() => {
    setData(INITIAL_DEMO_DATA);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('iserbi_prototype_db_v1');
    showToast('All prototype data reset to official INYDO baseline.', 'info');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRoute,
        data,
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        toast,
        showToast,
        navigate,
        login,
        switchUser,
        logout,
        applyForTask,
        submitEvidence,
        approveApplicationAction,
        rejectApplicationAction,
        createTask,
        updateTask,
        deleteTask,
        uploadDocument,
        replaceDocument,
        deleteDocument,
        updateUserProfile,
        updateScholarStatus,
        registerUser,
        registerScholar,
        replaceOfficialScholarRecipients,
        resolveRegistrationException,
        dismissRegistrationException,
        deleteRegistrationException,
        approveUserRegistration,
        toggleUserStatus,
        resetUserPassword,
        overrideServiceRecord,
        markNotifRead,
        markAllNotifsRead,
        deleteNotif,
        deleteAllNotifs,
        resetAllDataToDefault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
