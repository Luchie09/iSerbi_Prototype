import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime, formatDateOnly } from '../../logic/core';
import { RegistrationException, RegistrationExceptionReason } from '../../types';
import {
  Users,
  Award,
  ArrowRight,
  Shield,
  Layers,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Search,
  Copy,
  Check,
  ExternalLink,
  X,
  Filter,
  UserCheck,
  ShieldAlert,
  Clock,
  Mail,
  FileQuestion,
  UserMinus,
  Sparkles,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    data,
    navigate,
    switchUser,
    resolveRegistrationException,
    dismissRegistrationException,
    showToast,
  } = useApp();

  const [exceptionFilter, setExceptionFilter] = useState<'all' | RegistrationExceptionReason | 'resolved'>('all');
  const [activeUsersFilter, setActiveUsersFilter] = useState<'all' | 'scholar' | 'staff'>('all');
  const [showUnregisteredModal, setShowUnregisteredModal] = useState(false);
  const [unregisteredSearch, setUnregisteredSearch] = useState('');
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  if (!currentUser) return null;

  // Counts by role
  const totalScholars = data.users.filter((u) => u.role === 'scholar').length;
  const totalCoordinators = data.users.filter((u) => u.role === 'coordinator').length;
  const totalAdmins = data.users.filter((u) => u.role === 'admin').length;

  // Official recipients vs Registered scholars
  const normalize = (v: string) => v.trim().toLowerCase();
  const registeredScholars = data.users.filter((u) => u.role === 'scholar');
  const unregisteredRecipients = data.officialScholarRecipients.filter(
    (recipient) =>
      !registeredScholars.some(
        (u) => normalize(u.name) === normalize(recipient.scholarName)
      )
  );

  // Registration Exceptions
  const allExceptions = data.registrationExceptions || [];
  const pendingExceptionsCount = allExceptions.filter((e) => e.status === 'pending_review').length;

  const filteredExceptions = allExceptions.filter((exc) => {
    if (exceptionFilter === 'resolved') {
      return exc.status === 'resolved' || exc.status === 'dismissed';
    }
    if (exceptionFilter === 'all') {
      return true;
    }
    return exc.reason === exceptionFilter;
  });

  // Active Users live display
  // Simulated dynamic real-time status for demonstration
  const liveUsers = [
    {
      user: currentUser,
      activity: 'Active in Administrator Console',
      location: 'PGIN MISO HQ',
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
        const times = ['Just now', '1 min ago', '2 mins ago', '4 mins ago', '7 mins ago', '12 mins ago', '15 mins ago', '18 mins ago', '24 mins ago'];
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

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    showToast(`Copied ${email} to clipboard.`, 'info');
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleConfirmResolve = (id: string) => {
    resolveRegistrationException(id, resolutionNote.trim() || 'Reviewed and handled by Administrator');
    setResolvingId(null);
    setResolutionNote('');
  };

  const filteredUnregistered = unregisteredRecipients.filter((r) => {
    if (!unregisteredSearch.trim()) return true;
    const q = unregisteredSearch.toLowerCase();
    return r.scholarName.toLowerCase().includes(q) || r.scholarshipTrack.toLowerCase().includes(q);
  });

  const getReasonBadge = (reason: RegistrationExceptionReason) => {
    switch (reason) {
      case 'unmatched_roster':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Not in Official CSV</span>
          </span>
        );
      case 'track_mismatch':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
            <Layers className="w-3 h-3 text-blue-600" />
            <span>Track Mismatch</span>
          </span>
        );
      case 'duplicate_account':
      case 'duplicate_email':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-purple-50 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
            <UserMinus className="w-3 h-3 text-purple-600" />
            <span>Duplicate Account</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#d92d20] text-white rounded">
              System Administrator Portal
            </span>
            <span className="text-xs text-slate-300 font-medium">
              PGIN Management Information Systems Office (MISO)
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Administrator Console — {currentUser.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Monitor real-time active users, oversee official CSV roster enrollments, inspect automated registration exceptions, and manage provincial user credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => navigate('#scholars')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            <span>Official Recipient Roster</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scholars Count */}
        <div
          onClick={() => navigate('#scholars')}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Registered Scholars
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {totalScholars}
            </span>
            <span className="text-xs text-slate-400 font-medium">Active accounts</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Across 6 provincial scholarship programs
          </p>
        </div>

        {/* Registration Exceptions Stat Card */}
        <div
          onClick={() => {
            const el = document.getElementById('exceptions-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-amber-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Registration Exceptions
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-amber-600 tabular-nums">
              {pendingExceptionsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Require follow-up</span>
          </div>
          <p className="mt-3 text-[11px] text-amber-700 font-semibold">
            {pendingExceptionsCount > 0 ? 'Unmatched in CSV or duplicate conflicts' : 'All registrations validated'}
          </p>
        </div>

        {/* Staff & Coordinators */}
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
            <span className="text-xs text-slate-400 font-medium">Authorized staff</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            {totalCoordinators} Coordinators · {totalAdmins} Administrators
          </p>
        </div>

        {/* Unregistered Scholar Accounts (Repurposed Queue Allocation Widget) */}
        <div
          onClick={() => setShowUnregisteredModal(true)}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-red-300 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Unregistered Accounts
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-100 flex items-center justify-center transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-red-600 tabular-nums">
              {unregisteredRecipients.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Awaiting signup</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              {data.officialScholarRecipients.length - unregisteredRecipients.length} of {data.officialScholarRecipients.length} enrolled
            </span>
            <span className="text-red-600 font-semibold group-hover:underline flex items-center gap-0.5">
              <span>View List</span>
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Registration Exceptions / Unmatched Registrations */}
        <div id="exceptions-section" className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Registration Exceptions & Unmatched Attempts
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Scholars who encountered CSV roster mismatches or duplicate account conflicts during self-signup.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full shrink-0 self-start sm:self-auto">
                {pendingExceptionsCount} Pending Review
              </span>
            </div>

            {/* Filter Pills for Exceptions */}
            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setExceptionFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  exceptionFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({allExceptions.length})
              </button>
              <button
                type="button"
                onClick={() => setExceptionFilter('unmatched_roster')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  exceptionFilter === 'unmatched_roster'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Not in CSV Roster
              </button>
              <button
                type="button"
                onClick={() => setExceptionFilter('track_mismatch')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  exceptionFilter === 'track_mismatch'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Track Mismatches
              </button>
              <button
                type="button"
                onClick={() => setExceptionFilter('duplicate_account')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  exceptionFilter === 'duplicate_account'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Duplicates
              </button>
              <button
                type="button"
                onClick={() => setExceptionFilter('resolved')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  exceptionFilter === 'resolved'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Resolved / Dismissed
              </button>
            </div>

            {/* Exceptions Cards List (Scrollable) */}
            <div className="mt-3 space-y-3 max-h-[460px] overflow-y-auto pr-1.5">
              {filteredExceptions.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No registration exceptions found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {exceptionFilter === 'all'
                      ? 'All scholars have successfully registered without CSV matching conflicts.'
                      : 'No exceptions matching the selected filter.'}
                  </p>
                </div>
              ) : (
                filteredExceptions.map((exc) => {
                  const isPending = exc.status === 'pending_review';

                  return (
                    <div
                      key={exc.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isPending
                          ? 'border-amber-200 bg-amber-50/20'
                          : 'border-slate-200 bg-slate-50/40 opacity-80'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-900">{exc.name}</span>
                            {getReasonBadge(exc.reason)}
                            {exc.status === 'resolved' && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-100 text-emerald-800">
                                Resolved
                              </span>
                            )}
                            {exc.status === 'dismissed' && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600">
                                Dismissed
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span>Track: <strong>{exc.scholarshipProgram || 'Unspecified'}</strong></span>
                            {exc.collegeProgram && <span>· {exc.collegeProgram}</span>}
                            {exc.school && <span>· {exc.school}</span>}
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-slate-400 shrink-0 self-start">
                          {formatDateTime(exc.attemptedAt)}
                        </div>
                      </div>

                      {/* Diagnostic details box */}
                      <div className="mt-2.5 p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1">
                        <p className="text-slate-700 leading-snug">
                          <strong className="text-slate-800 font-semibold">Issue: </strong>
                          {exc.reasonDescription}
                        </p>
                        {exc.suggestedMatch && (
                          <p className="text-blue-700 font-medium">
                            <strong>Diagnostic Hint: </strong>
                            {exc.suggestedMatch}
                          </p>
                        )}
                        {exc.notes && (
                          <p className="text-emerald-700 text-[11px] font-medium pt-1 border-t border-slate-100">
                            <strong>Admin Note: </strong>
                            {exc.notes}
                          </p>
                        )}
                      </div>

                      {/* Action Bar */}
                      <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(exc.email)}
                            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 hover:underline"
                            title="Copy scholar email"
                          >
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{copiedEmail === exc.email ? 'Email Copied!' : exc.email}</span>
                          </button>
                          {exc.contact && (
                            <span className="text-[11px] font-mono text-slate-400">
                              · {exc.contact}
                            </span>
                          )}
                        </div>

                        {isPending && (
                          <div className="flex items-center gap-2">
                            {resolvingId === exc.id ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={resolutionNote}
                                  onChange={(e) => setResolutionNote(e.target.value)}
                                  placeholder="Resolution notes (optional)..."
                                  className="px-2 py-1 text-xs border border-slate-300 rounded-md outline-none focus:border-red-500 w-48"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleConfirmResolve(exc.id)}
                                  className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setResolvingId(null)}
                                  className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setResolvingId(exc.id);
                                    setResolutionNote('');
                                  }}
                                  className="px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                                >
                                  Mark Handled
                                </button>
                                <button
                                  type="button"
                                  onClick={() => dismissRegistrationException(exc.id)}
                                  className="px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                                >
                                  Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              Auto-approval is enabled for exact CSV matches; review exceptions for spelling or track discrepancies.
            </span>
            <button
              type="button"
              onClick={() => navigate('#scholars')}
              className="font-semibold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Verify Official Roster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Active Users Real-Time Monitor (Replaces System Audit Trail) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
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
            <div className="mt-2.5 flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
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

            {/* Real-time active users list (Scrollable) */}
            <div className="mt-3 divide-y divide-slate-100 max-h-[460px] overflow-y-auto pr-1.5">
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
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5 truncate max-w-[90px]">
                      {item.user.userId}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              Live session pulse: 15s interval
            </span>
            <button
              type="button"
              onClick={() => navigate('#users')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage User Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Unregistered Scholars Modal */}
      {showUnregisteredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Unregistered Scholar Accounts
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Official recipients listed in the uploaded CSV roster who have not yet signed up for an account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUnregisteredModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls */}
            <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={unregisteredSearch}
                  onChange={(e) => setUnregisteredSearch(e.target.value)}
                  placeholder="Filter by recipient name or scholarship track..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-red-500"
                />
              </div>
              <div className="px-3 py-1.5 bg-red-50 text-red-700 font-bold rounded-lg shrink-0">
                {unregisteredRecipients.length} Pending Registration
              </div>
            </div>

            {/* Modal Body: List of Unregistered Official Recipients */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
              {filteredUnregistered.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No unregistered scholars</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {unregisteredSearch
                      ? 'No official recipients matched your search query.'
                      : 'All scholars in the official CSV have completed registration!'}
                  </p>
                </div>
              ) : (
                filteredUnregistered.map((recipient, index) => (
                  <div
                    key={`${recipient.scholarName}-${index}`}
                    className="py-3 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {recipient.scholarName}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Track: <span className="font-medium text-slate-700">{recipient.scholarshipTrack}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                        Pending Signup
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(recipient.scholarName);
                          showToast(`Copied "${recipient.scholarName}" to clipboard.`, 'info');
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Copy scholar name"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Official Roster Total: <strong>{data.officialScholarRecipients.length}</strong> recipients
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const namesList = unregisteredRecipients
                      .map((r) => `${r.scholarName} (${r.scholarshipTrack})`)
                      .join('\n');
                    navigator.clipboard.writeText(namesList);
                    showToast('Copied all unregistered scholars to clipboard.', 'success');
                  }}
                  className="px-3 py-1.5 font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy List</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUnregisteredModal(false);
                    navigate('#scholars');
                  }}
                  className="px-3 py-1.5 font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Manage CSV Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
