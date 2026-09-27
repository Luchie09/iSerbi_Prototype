import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Role, UserStatus } from '../../types';
import { formatDateOnly } from '../../logic/core';
import {
  Users,
  Plus,
  Search,
  Check,
  X,
  KeyRound,
  Shield,
  Edit2,
  Lock,
  UserX,
  UserCheck,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const {
    data,
    approveUserRegistration,
    toggleUserStatus,
    resetUserPassword,
    registerUser,
    updateUserProfile,
    showToast,
  } = useApp();

  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add User Modal State (for creating Coordinator or Admin)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    userId: '',
    email: '',
    contact: '',
    role: 'coordinator' as Role,
    office: 'INYDO — Youth Development Office',
    password: 'password123',
  });

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    contact: '',
    office: '',
    program: '',
  });

  const handleOpenAddModal = () => {
    setNewUserData({
      name: '',
      userId: `STAFF-${String(data.users.length + 1).padStart(3, '0')}`,
      email: '',
      contact: '',
      role: 'coordinator',
      office: 'INYDO — Youth Development Office',
      password: 'password123',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name.trim() || !newUserData.userId.trim() || !newUserData.email.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    registerUser({
      role: newUserData.role,
      name: newUserData.name,
      userId: newUserData.userId,
      email: newUserData.email,
      contact: newUserData.contact,
      office: newUserData.office,
      password: newUserData.password,
      profilePicture:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    });

    // Auto activate staff accounts created by admin
    const newId = `USR-${String(data.users.length + 1).padStart(4, '0')}`;
    setTimeout(() => {
      approveUserRegistration(newId);
    }, 100);

    setIsAddModalOpen(false);
    showToast(`Staff account for ${newUserData.name} created.`, 'success');
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      contact: user.contact,
      office: user.office || '',
      program: user.program || '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUserProfile(editingUser.id, {
      name: editFormData.name,
      email: editFormData.email,
      contact: editFormData.contact,
      office: editFormData.office || null,
      program: editFormData.program || undefined,
    });

    setEditingUser(null);
  };

  const filteredUsers = data.users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter !== 'all' && user.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = user.name.toLowerCase().includes(q);
      const matchId = user.userId.toLowerCase().includes(q);
      const matchEmail = user.email.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchEmail) return false;
    }

    return true;
  });

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-700 border border-amber-200">
            Pending Approval
          </span>
        );
      case 'deactivated':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-50 text-red-700 border border-red-200">
            Deactivated
          </span>
        );
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'scholar':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700">
            Scholar
          </span>
        );
      case 'coordinator':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
            Coordinator
          </span>
        );
      case 'admin':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-50 text-purple-700 border border-purple-200">
            Administrator
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with + Add User */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              User Directory & Account Permissions
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Manage account lifecycle across all three portals: activate pending scholars, reset passwords, deactivate accounts, and create Coordinator or Administrator profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Coordinator / Admin</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="all">All Roles ({data.users.length})</option>
              <option value="scholar">Scholars</option>
              <option value="coordinator">Coordinators</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending Approval</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID or email..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Affiliation / Program</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered</th>
                <th className="py-3 px-4 text-right">Account Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{user.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {user.userId} · {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">{getRoleBadge(user.role)}</td>

                  <td className="py-3.5 px-4 text-slate-600 max-w-[200px]">
                    <span className="block truncate">
                      {user.role === 'scholar'
                        ? `${user.program} (${user.yearLevel})`
                        : user.office || 'PGIN'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">{getStatusBadge(user.status)}</td>

                  <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                    {formatDateOnly(user.dateRegistered)}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {user.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => approveUserRegistration(user.id)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                          title="Approve pending account"
                        >
                          Approve
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(user)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                        title="Edit user details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => resetUserPassword(user.id)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                        title="Reset password to default"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleUserStatus(user.id)}
                        className={`p-1.5 rounded transition-colors ${
                          user.status === 'active'
                            ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={user.status === 'active' ? 'Deactivate account' : 'Reactivate account'}
                      >
                        {user.status === 'active' ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal (Section 9.2) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Staff Account</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.name}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  placeholder="e.g. Atty. Maria Lourdes Santos"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Staff ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserData.userId}
                    onChange={(e) => setNewUserData({ ...newUserData, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    System Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value as Role })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="coordinator">Scholarship Coordinator</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="staff@ilocosnorte.gov.ph"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Office / Division
                </label>
                <input
                  type="text"
                  value={newUserData.office}
                  onChange={(e) => setNewUserData({ ...newUserData, office: e.target.value })}
                  placeholder="e.g. INYDO or PGIN MISO"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Default Temporary Password
                </label>
                <input
                  type="text"
                  required
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg shadow-xs"
                >
                  Create & Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Edit User Details</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={editFormData.contact}
                  onChange={(e) => setEditFormData({ ...editFormData, contact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {editingUser.role === 'scholar' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Degree Program</label>
                  <input
                    type="text"
                    value={editFormData.program}
                    onChange={(e) => setEditFormData({ ...editFormData, program: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Office / Division</label>
                  <input
                    type="text"
                    value={editFormData.office}
                    onChange={(e) => setEditFormData({ ...editFormData, office: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
