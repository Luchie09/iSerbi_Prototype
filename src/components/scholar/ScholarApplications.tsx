import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Application, Task } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { EvidenceModal } from '../common/EvidenceModal';
import { ApplicantsModal } from '../common/ApplicantsModal';
import { formatDateTime, formatDateOnly, getQueuePosition } from '../../logic/core';
import {
  FileCheck2,
  Calendar,
  Clock,
  MapPin,
  UploadCloud,
  AlertCircle,
  FileText,
  Users,
  CheckCircle2,
} from 'lucide-react';

export const ScholarApplications: React.FC = () => {
  const { currentUser, data, navigate } = useApp();

  const TABS = [
    { id: 'all', label: 'All' },
    { id: 'for_submission', label: 'For Submission' },
    { id: 'verification', label: 'Verification' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ] as const;

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('all');
  const [selectedAppForEvidence, setSelectedAppForEvidence] = useState<{
    application: Application;
    task: Task;
  } | null>(null);
  const [selectedTaskForRoster, setSelectedTaskForRoster] = useState<Task | null>(null);

  if (!currentUser) return null;

  // Filter scholar's own applications
  const myApplications = data.applications.filter(
    (app) => app.scholarId === currentUser.id
  );

  const filteredApplications = myApplications.filter((app) => {
    const task = data.tasks.find((t) => t.id === app.taskId);
    const hasSubmittedRequirement = Boolean(
      app.evidenceFile || app.submittedAt || app.status === 'proof_submitted'
    );

    // Tab filtering:
    // For Submission = confirmed without submitted requirement
    // Verification = proof_submitted (evidence submitted, under review)
    // Approved = verified or hours_reflected
    // Rejected = rejected
    if (activeTab === 'for_submission') {
      if (app.status !== 'confirmed' || hasSubmittedRequirement) return false;
    } else if (activeTab === 'verification') {
      if (app.status !== 'proof_submitted') return false;
    } else if (activeTab === 'approved') {
      if (app.status !== 'verified' && app.status !== 'hours_reflected') return false;
    } else if (activeTab === 'rejected') {
      if (app.status !== 'rejected') return false;
    } else if (activeTab === 'all') {
      const isForSubmission = app.status === 'confirmed' && !hasSubmittedRequirement;
      const isVerification = app.status === 'proof_submitted';
      const isApproved = app.status === 'verified' || app.status === 'hours_reflected';
      const isRejected = app.status === 'rejected';
      return isForSubmission || isVerification || isApproved || isRejected;
    }

    return true;
  });

  const getTabCount = (tab: (typeof TABS)[number]['id']) => {
    if (tab === 'for_submission') {
      return myApplications.filter(
        (a) => a.status === 'confirmed' && !a.evidenceFile && !a.submittedAt
      ).length;
    }
    if (tab === 'verification') {
      return myApplications.filter((a) => a.status === 'proof_submitted').length;
    }
    if (tab === 'approved') {
      return myApplications.filter(
        (a) => a.status === 'verified' || a.status === 'hours_reflected'
      ).length;
    }
    if (tab === 'rejected') {
      return myApplications.filter((a) => a.status === 'rejected').length;
    }
    if (tab === 'all') {
      return myApplications.filter((a) => {
        const isForSubmission = a.status === 'confirmed' && !a.evidenceFile && !a.submittedAt;
        const isVerification = a.status === 'proof_submitted';
        const isApproved = a.status === 'verified' || a.status === 'hours_reflected';
        const isRejected = a.status === 'rejected';
        return isForSubmission || isVerification || isApproved || isRejected;
      }).length;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              My Task Applications & Service Tracking
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Track the full verification lifecycle of your queued community service duties from initial application to official hours credited.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('#tasks')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors self-start md:self-auto"
          >
            + Apply for New Opportunity
          </button>
        </div>

        {/* Tab Controls */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto w-fit">
            {TABS.map((tab) => {
              const count = getTabCount(tab.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <FileCheck2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No applications in this category</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not have any community service applications matching the selected tab filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const task = data.tasks.find((t) => t.id === app.taskId);
            if (!task) return null;

            const queueInfo = getQueuePosition(app.id, data.applications);
            const isApproved =
              app.status === 'verified' || app.status === 'hours_reflected';
            const hasSubmittedRequirement = Boolean(
              app.evidenceFile || app.submittedAt || app.status === 'proof_submitted'
            );

            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left: Task Information & Status */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={app.status}
                      label={app.status === 'confirmed' ? 'For Submission' : undefined}
                    />
                    <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                      {isApproved
                        ? `${app.hoursCredited ?? task.creditHours} Hours Credited`
                        : `${task.creditHours} Hours Expected`}
                    </span>
                            <span className="text-[11px] font-mono text-slate-500">
                      Queue Position: #{queueInfo.position} (of {queueInfo.totalInQueue})
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {task.shortDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Applied: {formatDateTime(app.appliedAt)}
                    </span>
                    <span className="flex items-center gap-1 truncate max-w-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{task.location}</span>
                    </span>
                  </div>

                  {/* Submission Info / Rejection Banner */}
                  {(app.status === 'proof_submitted' || app.status === 'confirmed' || app.status === 'rejected') && (
                    <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-semibold uppercase tracking-wide text-[10px] text-amber-800">
                            {app.status === 'rejected'
                              ? 'Resubmission Requirement'
                              : 'Submission Requirement'}
                          </span>
                        </div>
                        {app.status === 'proof_submitted' && (
                          <span className="text-[10px] text-amber-700 font-mono shrink-0">
                            Submitted: {formatDateTime(app.submittedAt)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-start justify-between gap-3">
                        <p className="text-slate-700 leading-relaxed flex-1">
                          {task.requirements || 'Upload the required signed attendance sheet or certificate for this duty.'}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedAppForEvidence({ application: app, task })}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-colors shrink-0 shadow-xs ${
                            app.status === 'rejected' || app.status === 'confirmed'
                              ? 'text-white bg-[#d92d20] hover:bg-[#b42318]'
                              : 'text-amber-800 bg-white border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {app.status === 'rejected'
                            ? 'Resubmit Proof'
                            : app.status === 'confirmed'
                              ? 'Submit'
                              : 'Edit Submission'}
                        </button>
                      </div>
                      {app.evidenceFile && (
                        <div className="mt-2 text-[11px] text-amber-800 font-medium">
                          Evidence file: {app.evidenceFile}
                        </div>
                      )}
                    </div>
                  )}

                  {app.status === 'rejected' && app.rejectionReason && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Action Required: Coordinator Returned Submission</span>
                      </div>
                      <p className="mt-1.5 text-red-800 leading-relaxed">
                        {app.rejectionReason}
                      </p>
                    </div>
                  )}

                  {isApproved && (
                    <div className="mt-2 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Verified & Reflected in Semester Ledger</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-mono">
                        {formatDateTime(app.verifiedAt)}
                      </span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedAppForEvidence && (
        <EvidenceModal
          application={selectedAppForEvidence.application}
          task={selectedAppForEvidence.task}
          onClose={() => setSelectedAppForEvidence(null)}
        />
      )}

      {selectedTaskForRoster && (
        <ApplicantsModal
          task={selectedTaskForRoster}
          onClose={() => setSelectedTaskForRoster(null)}
        />
      )}
    </div>
  );
};
