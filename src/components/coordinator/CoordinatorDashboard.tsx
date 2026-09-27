import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CalendarCheck,
  Users,
  ChevronRight,
} from 'lucide-react';

export const CoordinatorDashboard: React.FC = () => {
  const { currentUser, data, navigate } = useApp();
  const [activeUsersFilter, setActiveUsersFilter] = useState<'all' | 'scholar' | 'staff'>('all');

  if (!currentUser) return null;

  // Stat 1: Pending verifications count (applications where status === "proof_submitted")
  const pendingVerifications = data.applications.filter(
    (a) => a.status === 'proof_submitted'
  );

  // Stat 2: Active postings count
  const activePostingsCount = data.tasks.filter((t) => t.status === 'open').length;

  // Stat 3: Total registered scholars
  const activeScholarsCount = data.users.filter((u) => u.role === 'scholar').length;

  // Active Users live display
  const liveUsers = [
    {
      user: currentUser,
      activity: 'Active in Coordinator Console',
      location: currentUser.office || 'INYDO Operations HQ',
      lastSeen: 'Active now',
      isCurrent: true,
    },
    ...data.users
      .filter((u) => u.id !== currentUser.id && u.status === 'active')
      .map((user, idx) => {
        const activities = [
          'Browsing Task Opportunities',
          'Submitting Service Proof Evidence',
          'Viewing My Applications & Queue',
          'Reviewing Verified Hours Ledger',
          'Reviewing Document Repository',
          'Updating Profile Details',
          'Active session in portal',
        ];
        const times = ['Just now', '1 min ago', '2 mins ago', '4 mins ago', '7 mins ago', '12 mins ago', '15 mins ago', '18 mins ago'];
        return {
          user,
          activity: activities[idx % activities.length],
          location: user.role === 'scholar' ? user.school || 'Laoag City Campus' : user.office || 'INYDO Central',
          lastSeen: times[idx % times.length],
          isCurrent: false,
        };
      }),
  ];

  const filteredActiveUsers = liveUsers.filter((item) => {
    if (activeUsersFilter === 'scholar') return item.user.role === 'scholar';
    if (activeUsersFilter === 'staff') return item.user.role === 'coordinator' || item.user.role === 'admin';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-sm border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white rounded">
              Coordinator Portal
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {currentUser.office || 'INYDO Central Operations'}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Welcome, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Audit submitted community service proof, evaluate FIFO allocation queues, and certify hours into the official Provincial Scholar ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => navigate('#verification')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review Pending Queue ({pendingVerifications.length})</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards (3 clean cards without Total Hours Certified) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pending Verifications */}
        <div
          onClick={() => navigate('#verification')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-red-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pending Verifications
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-amber-600 tabular-nums">
              {pendingVerifications.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Awaiting audit</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 flex items-center gap-1 font-medium text-amber-700">
            Action required in Verification queue
          </p>
        </div>

        {/* Active Postings */}
        <div
          onClick={() => navigate('#tasks')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {activePostingsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              of {data.tasks.length} total tasks
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Open for scholar FIFO applications
          </p>
        </div>

        {/* Active Scholars Monitored */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Monitored Scholars
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {activeScholarsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Provincial scholars</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Enrolled in INYDO service tracking
          </p>
        </div>
      </div>

      {/* Two-Column Lower Section: Verification Priority Queue Preview / Active Users */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Verifications Immediate Action (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between lg:h-[400px]">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Verification Queue
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                {pendingVerifications.length} Urgent
              </span>
            </div>

            <div
              className="mt-3 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain pr-2"
              aria-label="Verification Queue"
            >
              {pendingVerifications.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">All submissions verified!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No pending attendance proofs awaiting certification.
                  </p>
                </div>
              ) : (
                pendingVerifications.map((app) => {
                  const task = data.tasks.find((t) => t.id === app.taskId);
                  const scholar = data.users.find((u) => u.id === app.scholarId);

                  return (
                    <div
                      key={app.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {scholar?.name || 'Scholar'}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            ({scholar?.userId})
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                          {task?.title || 'Community Service Activity'}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          Evidence: <span className="text-blue-600 font-medium">{app.evidenceFile}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                          +{task?.creditHours} hrs
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate('#verification')}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg shadow-xs transition-colors"
                        >
                          Review & Verify
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400">
              Approving automatically updates scholar prefix sum & dashboard totals.
            </span>
            <button
              type="button"
              onClick={() => navigate('#verification')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Go to Verification Panel</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Active Users Real-Time Monitor (5 cols) - Replaces Recent Activity */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between lg:h-[400px]">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Active Users</h3>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                <span>{filteredActiveUsers.length} Online</span>
              </div>
            </div>

            {/* Quick role filter */}
            <div className="mt-2.5 flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs shrink-0">
              <button
                type="button"
                onClick={() => setActiveUsersFilter('all')}
                className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-colors ${
                  activeUsersFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Users
              </button>
              <button
                type="button"
                onClick={() => setActiveUsersFilter('scholar')}
                className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-colors ${
                  activeUsersFilter === 'scholar'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Scholars
              </button>
              <button
                type="button"
                onClick={() => setActiveUsersFilter('staff')}
                className={`flex-1 py-1 px-2 rounded-md font-medium text-center transition-colors ${
                  activeUsersFilter === 'staff'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Staff
              </button>
            </div>

            {/* Real-time active users list */}
            <div
              className="mt-3 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain pr-2"
              aria-label="Active users"
            >
              {filteredActiveUsers.map((item) => (
                <div
                  key={item.user.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={item.user.profilePicture}
                        alt={item.user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 truncate">
                          {item.user.name}
                        </span>
                        {item.isCurrent && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-slate-900 text-white rounded">
                            You
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-bold uppercase rounded ${
                            item.user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : item.user.role === 'coordinator'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {item.user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.activity}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium block">
                      {item.lastSeen}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[90px] block mt-0.5">
                      {item.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs shrink-0">
            <span className="text-[11px] text-slate-400">
              Real-time active sessions authenticated in INYDO
            </span>
            <button
              type="button"
              onClick={() => navigate('#records')}
              className="font-semibold text-slate-600 hover:text-slate-900 hover:underline"
            >
              View Service Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
