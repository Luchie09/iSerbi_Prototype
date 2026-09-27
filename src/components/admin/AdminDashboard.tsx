import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime, formatDateOnly } from '../../logic/core';
import {
  Users,
  ShieldAlert,
  UserCheck,
  Award,
  Activity,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser, data, navigate, approveUserRegistration } = useApp();

  if (!currentUser) return null;

  // Counts by role
  const totalScholars = data.users.filter((u) => u.role === 'scholar').length;
  const totalCoordinators = data.users.filter((u) => u.role === 'coordinator').length;
  const totalAdmins = data.users.filter((u) => u.role === 'admin').length;
  const pendingRegistrations = data.users.filter((u) => u.status === 'pending');

  const totalTasks = data.tasks.length;
  const totalApplications = data.applications.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded">
              System Administrator Portal
            </span>
            <span className="text-xs text-slate-300 font-medium">
              PGIN Management Information Systems Office (MISO)
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Administrator Console — {currentUser.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Oversee user directory permissions, certify incoming scholar enrollments, manage staff accounts, and monitor system-wide FIFO queues.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => navigate('#users')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Manage All Users ({data.users.length})</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards (Section 9.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scholars Count */}
        <div
          onClick={() => navigate('#scholars')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Scholar Recipients
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {totalScholars}
            </span>
            <span className="text-xs text-slate-400 font-medium">Registered grant holders</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Across 8 provincial degree programs
          </p>
        </div>

        {/* Pending Registrations */}
        <div
          onClick={() => navigate('#users')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-red-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-amber-600 tabular-nums">
              {pendingRegistrations.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Require activation</span>
          </div>
          <p className="mt-3 text-[11px] text-amber-700 font-semibold">
            {pendingRegistrations.length > 0 ? 'Review self-registered scholars' : 'All accounts verified'}
          </p>
        </div>

        {/* Coordinators & Staff */}
        <div
          onClick={() => navigate('#users')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Staff & Coordinators
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {totalCoordinators + totalAdmins}
            </span>
            <span className="text-xs text-slate-400 font-medium">INYDO & PGIN</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            {totalCoordinators} Coordinators · {totalAdmins} Administrators
          </p>
        </div>

        {/* Total Applications Processed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Queued Allocations
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {totalApplications}
            </span>
            <span className="text-xs text-slate-400 font-medium">Across {totalTasks} tasks</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Managed via FIFO timestamp queue
          </p>
        </div>
      </div>

      {/* Two-Column Middle Section: Pending Registration Queue / Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Registrations Quick Approval (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Pending Account Registrations (Self-Registered Scholars)
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                {pendingRegistrations.length} Pending
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {pendingRegistrations.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <UserCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No pending registrations!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    All submitted scholar accounts have been authorized.
                  </p>
                </div>
              ) : (
                pendingRegistrations.map((user) => (
                  <div
                    key={user.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{user.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          ({user.userId})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {user.program} · {user.yearLevel}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Registered: {formatDateOnly(user.dateRegistered)} · {user.email}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => approveUserRegistration(user.id)}
                        className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                      >
                        Approve & Activate
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Approval enables full login access to the Scholar portal.
            </span>
            <button
              type="button"
              onClick={() => navigate('#users')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
            >
              <span>View User Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Security & Activity Audit Log (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">System Audit Trail</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Live Sync</span>
            </div>

            <div className="mt-3 space-y-3">
              {data.activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 leading-snug">
                      <strong className="font-semibold text-slate-900">{act.actor}</strong>{' '}
                      <span className="text-slate-500">{act.action}</span>{' '}
                      <span className="font-medium text-slate-800">{act.target}</span>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {formatDateTime(act.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <span className="text-[11px] text-slate-400">
              iSerbi System Integrity · PGIN MISO
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
