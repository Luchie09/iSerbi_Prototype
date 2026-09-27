import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime, formatDateOnly } from '../../logic/core';
import {
  ShieldCheck,
  CalendarCheck,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Users,
  ChevronRight,
} from 'lucide-react';

export const CoordinatorDashboard: React.FC = () => {
  const { currentUser, data, navigate } = useApp();

  if (!currentUser) return null;

  // Stat 1: Pending verifications count (applications where status === "proof_submitted")
  const pendingVerifications = data.applications.filter(
    (a) => a.status === 'proof_submitted'
  );

  // Stat 2: Active postings count
  const activePostingsCount = data.tasks.filter((t) => t.status === 'open').length;

  // Stat 3: Total Hours Reflected this semester system-wide
  const totalHoursReflectedSystemWide = data.applications
    .filter((a) => a.status === 'hours_reflected')
    .reduce((sum, a) => {
      const task = data.tasks.find((t) => t.id === a.taskId);
      return sum + (a.hoursCredited ?? task?.creditHours ?? 0);
    }, 0);

  // Stat 4: Total registered scholars
  const activeScholarsCount = data.users.filter((u) => u.role === 'scholar').length;

  // Recent activity feed
  const recentActivities = [...data.activities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

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

      {/* Top Stat Cards (Section 8.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Active Task Postings
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

        {/* Total Hours Reflected System-Wide */}
        <div
          onClick={() => navigate('#records')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Hours Certified
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-emerald-700 tabular-nums">
              {totalHoursReflectedSystemWide} hrs
            </span>
            <span className="text-xs text-slate-400 font-medium">This semester</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Aggregated via Prefix Sum validation
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

      {/* Two-Column Lower Section: Verification Priority Queue Preview / Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pending Verifications Immediate Action (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Verification Queue (Awaiting Coordinator Certification)
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                {pendingVerifications.length} Urgent
              </span>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {pendingVerifications.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">All submissions verified!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No pending attendance proofs awaiting certification.
                  </p>
                </div>
              ) : (
                pendingVerifications.slice(0, 4).map((app) => {
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

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
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

        {/* Right: Recent System Activity Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Recent Activity & Audit Trail
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Live</span>
            </div>

            <div className="mt-3 space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
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
            <button
              type="button"
              onClick={() => navigate('#records')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 hover:underline"
            >
              View Full Service Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
