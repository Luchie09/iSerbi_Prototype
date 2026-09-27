import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Role, UserStatus, ScholarshipStatus, SCHOLARSHIP_PROGRAMS } from '../../types';
import { formatDateOnly, getCumulativeHours } from '../../logic/core';
import {
  Users,
  Search,
  Plus,
  Edit2,
  KeyRound,
  UserX,
  UserCheck,
  Shield,
  GraduationCap,
  Briefcase,
  Building,
  CheckCircle2,
  X,
  Lock,
  Mail,
  Phone,
  Building2,
  Sparkles,
  AlertCircle,
  Copy,
} from 'lucide-react';

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const suffixName = parts[parts.length - 1]?.match(/^(Jr\.?|Sr\.?|II|III|IV|V)$/i)
    ? parts.pop() || ''
    : '';
  const lastName = parts.length > 1 ? parts.pop() || '' : '';
  const firstName = parts.shift() || '';
  const middleName = parts.join(' ');
  return { firstName, middleName, lastName, suffixName };
};

const getNextUserId = (role: Role, users: User[]): string => {
  const prefix = role === 'scholar' ? 'SCH' : role === 'admin' ? 'ADM' : 'COOR';
  const padLength = role === 'scholar' ? 5 : 3;
  const usedIds = new Set(users.map((u) => u.userId.toLowerCase()));
  let seq = users.filter((u) => u.role === role).length + 1;
  let candidate = `${prefix}-${String(seq).padStart(padLength, '0')}`;
  while (usedIds.has(candidate.toLowerCase())) {
    seq += 1;
    candidate = `${prefix}-${String(seq).padStart(padLength, '0')}`;
  }
  return candidate;
};

const getDefaultTempPassword = (role: Role): string => {
  if (role === 'scholar') return 'Scholar123';
  if (role === 'admin') return 'Admin123';
  return 'Coordinator123';
};

const getRetentionExpiryDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '5 years from registration';
  d.setFullYear(d.getFullYear() + 5);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const AdminUsers: React.FC = () => {
  const {
    data,
    toggleUserStatus,
    resetUserPassword,
    registerUser,
    updateUserProfile,
    updateScholarStatus,
    replaceOfficialScholarRecipients,
    showToast,
  } = useApp();

  // Filters
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [addRole, setAddRole] = useState<Role>('scholar');

  // Add User Form State
  const [addForm, setAddForm] = useState({
    // Shared / Staff fields
    fullName: '',
    email: '',
    contact: '',
    office: 'INYDO — Youth Development Office',
    // Scholar-specific fields
    firstName: '',
    middleName: '',
    lastName: '',
    suffixName: '',
    municipality: 'Laoag City',
    Baranggay: '',
    school: 'Mariano Marcos State University',
    collegeProgram: 'BS Information Technology',
    yearLevel: '1st Year',
    scholarshipProgram: SCHOLARSHIP_PROGRAMS[0] as string,
  });

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Edit Scholar Form State (Mirrors ScholarProfile.tsx)
  const [editScholarForm, setEditScholarForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    suffixName: '',
    email: '',
    contact: '',
    municipality: '',
    Baranggay: '',
    school: '',
    collegeProgram: '',
    yearLevel: '1st Year',
    scholarshipProgram: SCHOLARSHIP_PROGRAMS[0] as string,
    scholarshipStatus: 'Active' as ScholarshipStatus,
  });

  // Edit Staff Form State (Mirrors AdminProfile.tsx / CoordinatorProfile.tsx)
  const [editStaffForm, setEditStaffForm] = useState({
    name: '',
    email: '',
    contact: '',
    office: '',
  });

  // Calculate filtered users
  const filteredUsers = data.users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.name.toLowerCase().includes(q);
      const matchId = user.userId.toLowerCase().includes(q);
      const matchEmail = user.email.toLowerCase().includes(q);
      const matchSchool = (user.school || '').toLowerCase().includes(q);
      const matchOffice = (user.office || '').toLowerCase().includes(q);
      if (!matchName && !matchId && !matchEmail && !matchSchool && !matchOffice) {
        return false;
      }
    }
    return true;
  });

  // Stats
  const totalUsersCount = data.users.length;
  const scholarsCount = data.users.filter((u) => u.role === 'scholar').length;
  const coordinatorsCount = data.users.filter((u) => u.role === 'coordinator').length;
  const adminsCount = data.users.filter((u) => u.role === 'admin').length;

  // Open Add Modal
  const handleOpenAddUser = (initialRole: Role = 'scholar') => {
    setAddRole(initialRole);
    setAddForm({
      fullName: '',
      email: '',
      contact: '',
      office:
        initialRole === 'admin'
          ? 'PGIN — Management Information Systems Office (MISO)'
          : 'INYDO — Youth Development Office',
      firstName: '',
      middleName: '',
      lastName: '',
      suffixName: '',
      municipality: 'Laoag City',
      Baranggay: '',
      school: 'Mariano Marcos State University',
      collegeProgram: 'BS Information Technology',
      yearLevel: '1st Year',
      scholarshipProgram: SCHOLARSHIP_PROGRAMS[0],
    });
    setIsAddUserModalOpen(true);
  };

  // Submit Add User
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const autoUserId = getNextUserId(addRole, data.users);
    const tempPassword = getDefaultTempPassword(addRole);

    if (addRole === 'scholar') {
      if (!addForm.firstName.trim() || !addForm.lastName.trim() || !addForm.email.trim()) {
        showToast('Please provide first name, last name, and email.', 'error');
        return;
      }

      const fullName = [
        addForm.firstName.trim(),
        addForm.middleName.trim(),
        addForm.lastName.trim(),
        addForm.suffixName.trim(),
      ]
        .filter(Boolean)
        .join(' ');

      registerUser({
        role: 'scholar',
        name: fullName,
        userId: autoUserId,
        email: addForm.email.trim(),
        contact: addForm.contact.trim() || '0912-345-6789',
        program: addForm.collegeProgram.trim() || 'BS Information Technology',
        collegeProgram: addForm.collegeProgram.trim() || 'BS Information Technology',
        scholarshipProgram: addForm.scholarshipProgram,
        yearLevel: addForm.yearLevel,
        school: addForm.school.trim() || 'Mariano Marcos State University',
        municipality: addForm.municipality.trim(),
        Baranggay: addForm.Baranggay.trim(),
        firstName: addForm.firstName.trim(),
        middleName: addForm.middleName.trim(),
        lastName: addForm.lastName.trim(),
        suffixName: addForm.suffixName.trim(),
        password: tempPassword,
        mustChangePassword: true,
        status: 'active',
        scholarshipStatus: 'Active',
        profilePicture:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      });

      // Also ensure added to official recipients list so they match seamlessly
      const normalize = (v: string) => v.trim().toLowerCase();
      const existsInRoster = data.officialScholarRecipients.some(
        (r) => normalize(r.scholarName) === normalize(fullName)
      );
      if (!existsInRoster) {
        replaceOfficialScholarRecipients([
          ...data.officialScholarRecipients,
          { scholarName: fullName, scholarshipTrack: addForm.scholarshipProgram },
        ]);
      }

      showToast(
        `Scholar account created for ${fullName} (${autoUserId}) with temporary password "${tempPassword}".`,
        'success'
      );
    } else {
      // Admin or Coordinator
      if (!addForm.fullName.trim() || !addForm.email.trim()) {
        showToast('Please provide full name and official email.', 'error');
        return;
      }

      registerUser({
        role: addRole,
        name: addForm.fullName.trim(),
        userId: autoUserId,
        email: addForm.email.trim(),
        contact: addForm.contact.trim() || '0917-123-4567',
        office: addForm.office.trim(),
        password: tempPassword,
        mustChangePassword: true,
        status: 'active',
        profilePicture:
          addRole === 'admin'
            ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      });

      const roleLabel = addRole === 'admin' ? 'Administrator' : 'Coordinator';
      showToast(
        `${roleLabel} account created for ${addForm.fullName.trim()} (${autoUserId}) with temporary password "${tempPassword}".`,
        'success'
      );
    }

    setIsAddUserModalOpen(false);
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    if (user.role === 'scholar') {
      const parts = splitFullName(user.name);
      setEditScholarForm({
        firstName: user.firstName || parts.firstName || '',
        middleName: user.middleName || parts.middleName || '',
        lastName: user.lastName || parts.lastName || '',
        suffixName: user.suffixName || parts.suffixName || '',
        email: user.email || '',
        contact: user.contact || '',
        municipality: user.municipality || '',
        Baranggay: user.Baranggay || '',
        school: user.school || '',
        collegeProgram: user.collegeProgram || user.program || '',
        yearLevel: user.yearLevel || '1st Year',
        scholarshipProgram: user.scholarshipProgram || SCHOLARSHIP_PROGRAMS[0],
        scholarshipStatus: user.scholarshipStatus || 'Active',
      });
    } else {
      // Coordinator or Admin
      setEditStaffForm({
        name: user.name || '',
        email: user.email || '',
        contact: user.contact || '',
        office: user.office || '',
      });
    }
  };

  // Submit Edit User
  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (editingUser.role === 'scholar') {
      const fullName = [
        editScholarForm.firstName.trim(),
        editScholarForm.middleName.trim(),
        editScholarForm.lastName.trim(),
        editScholarForm.suffixName.trim(),
      ]
        .filter(Boolean)
        .join(' ');

      updateUserProfile(editingUser.id, {
        name: fullName,
        firstName: editScholarForm.firstName.trim(),
        middleName: editScholarForm.middleName.trim(),
        lastName: editScholarForm.lastName.trim(),
        suffixName: editScholarForm.suffixName.trim(),
        email: editScholarForm.email.trim(),
        contact: editScholarForm.contact.trim(),
        municipality: editScholarForm.municipality.trim(),
        Baranggay: editScholarForm.Baranggay.trim(),
        school: editScholarForm.school.trim(),
        collegeProgram: editScholarForm.collegeProgram.trim(),
        program: editScholarForm.collegeProgram.trim(),
        yearLevel: editScholarForm.yearLevel,
        scholarshipProgram: editScholarForm.scholarshipProgram,
        scholarshipStatus: editScholarForm.scholarshipStatus,
      });

      if (editScholarForm.scholarshipStatus !== editingUser.scholarshipStatus) {
        updateScholarStatus(editingUser.id, editScholarForm.scholarshipStatus);
      }

      showToast(`Scholar profile for ${fullName} updated successfully.`, 'success');
    } else {
      // Coordinator or Admin: ONLY edit fields relevant to that role's profile
      updateUserProfile(editingUser.id, {
        name: editStaffForm.name.trim(),
        email: editStaffForm.email.trim(),
        contact: editStaffForm.contact.trim(),
        office: editStaffForm.office.trim(),
      });

      showToast(`Profile details for ${editStaffForm.name.trim()} updated.`, 'success');
    }

    setEditingUser(null);
  };

  // Reset to default temporary password
  const handleResetPassword = (user: User) => {
    const tempPassword = getDefaultTempPassword(user.role);
    resetUserPassword(user.id, tempPassword);
    updateUserProfile(user.id, { mustChangePassword: true });
    showToast(
      `Password for ${user.name} reset to temporary password "${tempPassword}". User will be prompted to change it on first login.`,
      'info'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">User Management</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Directory of all registered user accounts across roles (Scholars, Coordinators, and Administrators). Manage credentials, account standing, and profile records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAddUser('scholar')}
          className="px-4 py-2.5 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add User Account</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Users
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{totalUsersCount}</span>
            <span className="text-[11px] text-slate-400">All accounts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Scholars
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-red-600">{scholarsCount}</span>
            <span className="text-[11px] text-slate-400">Provincial grantees</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Coordinators
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-blue-600">{coordinatorsCount}</span>
            <span className="text-[11px] text-slate-400">Department staff</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Administrators
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-purple-600">{adminsCount}</span>
            <span className="text-[11px] text-slate-400">System admins</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs outline-none focus:border-red-500"
            >
              <option value="all">All Roles ({data.users.length})</option>
              <option value="scholar">Scholars ({scholarsCount})</option>
              <option value="coordinator">Coordinators ({coordinatorsCount})</option>
              <option value="admin">Administrators ({adminsCount})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs outline-none focus:border-red-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, email, office..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-xs"
          />
        </div>
      </div>

      {/* Main Users Table (WITHOUT Affiliation / Program column) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4">Role Context / Office</th>
                <th className="py-3 px-4 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-xs">No user accounts found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Try adjusting your search criteria or role filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const completedHours =
                    user.role === 'scholar'
                      ? getCumulativeHours(user.id, data.applications, data.tasks)
                      : null;
                  const isMustChangePass = user.mustChangePassword;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* User Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={user.profilePicture}
                            alt={user.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 truncate">{user.name}</span>
                              {isMustChangePass && (
                                <span
                                  className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-amber-100 text-amber-800"
                                  title="Temporary password assigned; prompted on first login"
                                >
                                  Temp Pass
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span className="text-slate-600 font-semibold">{user.userId}</span>
                              <span>·</span>
                              <span className="truncate">{user.email}</span>
                              {user.contact && (
                                <>
                                  <span>·</span>
                                  <span>{user.contact}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* System Role Badge */}
                      <td className="py-3.5 px-4">
                        {user.role === 'scholar' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-red-600" />
                            <span>Scholar</span>
                          </span>
                        )}
                        {user.role === 'coordinator' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                            <Briefcase className="w-3 h-3 text-blue-600" />
                            <span>Coordinator</span>
                          </span>
                        )}
                        {user.role === 'admin' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200 inline-flex items-center gap-1">
                            <Shield className="w-3 h-3 text-purple-600" />
                            <span>Administrator</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            user.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {user.status === 'active' ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      {/* Date Registered */}
                      <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                        <div>{formatDateOnly(user.dateRegistered)}</div>
                        {user.role === 'scholar' && (
                          <div
                            className="text-[9px] text-slate-400 font-sans mt-0.5"
                            title={`Account retained in User Management for 5 years until ${getRetentionExpiryDate(user.dateRegistered)} regardless of ongoing semester recipient status`}
                          >
                            Retention: {getRetentionExpiryDate(user.dateRegistered)}
                          </div>
                        )}
                      </td>

                      {/* Role Context / Office */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {user.role === 'scholar' ? (
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold font-mono text-slate-900">
                              {completedHours}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">/ 40 hrs</span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-700 line-clamp-1">
                            {user.office || 'Provincial Government of Ilocos Norte'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Profile button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditUser(user)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                            title={`Edit ${user.role} profile fields`}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit Record</span>
                          </button>

                          {/* Reset to temporary password */}
                          <button
                            type="button"
                            onClick={() => handleResetPassword(user)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title={`Reset to temporary password (${getDefaultTempPassword(user.role)})`}
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.status === 'active'
                                ? 'text-red-500 hover:bg-red-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={user.status === 'active' ? 'Deactivate account' : 'Activate account'}
                          >
                            {user.status === 'active' ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================= */}
      {/* ADD USER MODAL (Auto-Generated ID, Default Temp Password)         */}
      {/* ================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-bold text-slate-900">Add New System User</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Provision an account manually with an auto-generated User ID and temporary credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Role Selector Tabs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select User Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddRole('scholar')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      addRole === 'scholar'
                        ? 'bg-red-50 border-red-500 text-red-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Scholar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddRole('coordinator')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      addRole === 'coordinator'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Coordinator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddRole('admin')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      addRole === 'admin'
                        ? 'bg-purple-50 border-purple-500 text-purple-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Administrator</span>
                  </button>
                </div>
              </div>

              {/* Auto-Generated User ID & Default Temporary Password Callout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                    Auto-Generated User ID
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-black font-mono text-slate-900">
                      {getNextUserId(addRole, data.users)}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">
                      Auto-Assigned
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Consistent with self-registration sequence
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                    Default Temporary Password
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-black font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {getDefaultTempPassword(addRole)}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                    Prompted to change on first login
                  </span>
                </div>
              </div>

              {/* DYNAMIC FORM FIELDS BASED ON SELECTED ROLE */}

              {/* 1. Scholar Fields (Mirrors Scholar Profile) */}
              {addRole === 'scholar' && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={addForm.firstName}
                        onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })}
                        placeholder="e.g. Juan"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={addForm.middleName}
                        onChange={(e) => setAddForm({ ...addForm, middleName: e.target.value })}
                        placeholder="e.g. Santos"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={addForm.lastName}
                        onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })}
                        placeholder="e.g. Dela Cruz"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Suffix (e.g. Jr., III)
                      </label>
                      <input
                        type="text"
                        value={addForm.suffixName}
                        onChange={(e) => setAddForm({ ...addForm, suffixName: e.target.value })}
                        placeholder="Optional"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                        placeholder="scholar@example.com"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Contact
                      </label>
                      <input
                        type="text"
                        value={addForm.contact}
                        onChange={(e) => setAddForm({ ...addForm, contact: e.target.value })}
                        placeholder="0912-345-6789"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Municipality / City
                      </label>
                      <input
                        type="text"
                        value={addForm.municipality}
                        onChange={(e) => setAddForm({ ...addForm, municipality: e.target.value })}
                        placeholder="e.g. Laoag City"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Barangay
                      </label>
                      <input
                        type="text"
                        value={addForm.Baranggay}
                        onChange={(e) => setAddForm({ ...addForm, Baranggay: e.target.value })}
                        placeholder="e.g. Brgy. 1 San Lorenzo"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        School / University
                      </label>
                      <input
                        type="text"
                        value={addForm.school}
                        onChange={(e) => setAddForm({ ...addForm, school: e.target.value })}
                        placeholder="e.g. Mariano Marcos State University"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        College Program / Degree
                      </label>
                      <input
                        type="text"
                        value={addForm.collegeProgram}
                        onChange={(e) => setAddForm({ ...addForm, collegeProgram: e.target.value })}
                        placeholder="e.g. BS Computer Science"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Year Level
                      </label>
                      <select
                        value={addForm.yearLevel}
                        onChange={(e) => setAddForm({ ...addForm, yearLevel: e.target.value })}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Scholarship Track (Provincial Grant)
                      </label>
                      <select
                        value={addForm.scholarshipProgram}
                        onChange={(e) =>
                          setAddForm({ ...addForm, scholarshipProgram: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {SCHOLARSHIP_PROGRAMS.map((track) => (
                          <option key={track} value={track}>
                            {track}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Coordinator / Admin Fields (Mirrors Staff Profile) */}
              {addRole !== 'scholar' && (
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.fullName}
                      onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      placeholder="e.g. Maria Remedios Santos"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Government Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                        placeholder="staff@ilocosnorte.gov.ph"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={addForm.contact}
                        onChange={(e) => setAddForm({ ...addForm, contact: e.target.value })}
                        placeholder="0917-123-4567"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Office / Department
                    </label>
                    <input
                      type="text"
                      value={addForm.office}
                      onChange={(e) => setAddForm({ ...addForm, office: e.target.value })}
                      placeholder="e.g. INYDO — Youth Development Office"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  The account will be provisioned with status <strong>Active</strong>. When the user logs in using temporary password{' '}
                  <strong className="font-mono">{getDefaultTempPassword(addRole)}</strong>, the portal will immediately mandate setting a permanent password.
                </span>
              </div>

              {/* Submit Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* EDIT USER MODAL (Role-Specific Profile Fields Mirroring Actual UI) */}
      {/* ================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={editingUser.profilePicture}
                  alt={editingUser.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Edit User Record</h3>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        editingUser.role === 'scholar'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : editingUser.role === 'coordinator'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {editingUser.role}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    User ID: {editingUser.userId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* ========================================================= */}
              {/* 1. SCHOLAR PROFILE EDIT FIELDS (Mirrors ScholarProfile)    */}
              {/* ========================================================= */}
              {editingUser.role === 'scholar' && (
                <div className="space-y-4">
                  <div className="p-3 bg-red-50/50 rounded-xl border border-red-100 text-xs text-red-800 space-y-1">
                    <div className="font-bold flex items-center justify-between">
                      <span>Scholar Profile Fields</span>
                      <span className="text-[10px] font-mono font-semibold bg-red-100 px-2 py-0.5 rounded text-red-900">
                        5-Year Retention: Active until {getRetentionExpiryDate(editingUser.dateRegistered)}
                      </span>
                    </div>
                    <p className="text-[11px] text-red-700 leading-relaxed">
                      Admin edits mirror the official Scholar Profile fields. Under provincial retention policy, this user account is protected from immediate deletion and is retained in User Management for 5 years from registration ({formatDateOnly(editingUser.dateRegistered)}), regardless of semester recipient list updates.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editScholarForm.firstName}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={editScholarForm.middleName}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, middleName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editScholarForm.lastName}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Suffix Name
                      </label>
                      <input
                        type="text"
                        value={editScholarForm.suffixName}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, suffixName: e.target.value })
                        }
                        placeholder="e.g. Jr., III"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={editScholarForm.email}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, email: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="text"
                        value={editScholarForm.contact}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, contact: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Municipality / City
                      </label>
                      <input
                        type="text"
                        value={editScholarForm.municipality}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, municipality: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Barangay
                      </label>
                      <input
                        type="text"
                        value={editScholarForm.Baranggay}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, Baranggay: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        School / University
                      </label>
                      <input
                        type="text"
                        value={editScholarForm.school}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, school: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        College Degree Program
                      </label>
                      <input
                        type="text"
                        value={editScholarForm.collegeProgram}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, collegeProgram: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Year Level
                      </label>
                      <select
                        value={editScholarForm.yearLevel}
                        onChange={(e) =>
                          setEditScholarForm({ ...editScholarForm, yearLevel: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Scholarship Track
                      </label>
                      <select
                        value={editScholarForm.scholarshipProgram}
                        onChange={(e) =>
                          setEditScholarForm({
                            ...editScholarForm,
                            scholarshipProgram: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        {SCHOLARSHIP_PROGRAMS.map((prog) => (
                          <option key={prog} value={prog}>
                            {prog}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Grant Status
                      </label>
                      <select
                        value={editScholarForm.scholarshipStatus}
                        onChange={(e) =>
                          setEditScholarForm({
                            ...editScholarForm,
                            scholarshipStatus: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                      >
                        <option value="Active">Active</option>
                        <option value="Graduated">Graduated</option>
                        <option value="Withdrawn">Withdrawn</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 2. ADMIN & COORDINATOR PROFILE EDIT FIELDS                */}
              {/* (Only role-appropriate fields: Name, Email, Contact, Office)*/}
              {/* ========================================================= */}
              {editingUser.role !== 'scholar' && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold">Staff Profile Fields:</span> Displaying only fields relevant to {editingUser.role === 'admin' ? 'Administrator' : 'Coordinator'} accounts (No scholar-specific fields).
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editStaffForm.name}
                      onChange={(e) => setEditStaffForm({ ...editStaffForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Government Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={editStaffForm.email}
                        onChange={(e) =>
                          setEditStaffForm({ ...editStaffForm, email: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={editStaffForm.contact}
                        onChange={(e) =>
                          setEditStaffForm({ ...editStaffForm, contact: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assigned Office / Department
                    </label>
                    <input
                      type="text"
                      value={editStaffForm.office}
                      onChange={(e) =>
                        setEditStaffForm({ ...editStaffForm, office: e.target.value })
                      }
                      placeholder="e.g. INYDO — Youth Development Office"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
