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
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
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
                    </div>

                    <div>
                      <h3 className="text-sm md:text-base font-bold text-slate-900 leading-snug">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {task.shortDescription}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Applied</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-700 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateTime(app.appliedAt)}
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Location</div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{task.location}</span>
                        </div>
                      </div>

                      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Queue</div>
                        <div className="mt-1 text-[11px] font-mono text-slate-700">
                          #{queueInfo.position} of {queueInfo.totalInQueue}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {(app.status === 'proof_submitted' || app.status === 'confirmed' || app.status === 'rejected') && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                      <div className="min-w-0 flex-1 text-xs text-slate-600">
                        {app.status === 'confirmed' && (
                          <>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              Submission detail
                            </div>
                            <p className="mt-1 leading-relaxed text-slate-700">
                              {task.requirements || 'Upload the required signed attendance sheet or certificate for this duty.'}
                            </p>
                            {task.deadline && (
                              <p className="mt-1 text-[11px] text-slate-600 font-medium">
                                Due by {formatDateTime(task.deadline)}
                              </p>
                            )}
                          </>
                        )}

                        {app.status === 'proof_submitted' && (
                          <>
                            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                              Last submitted
                            </div>
                            <p className="mt-1 font-mono text-[11px] text-slate-700">
                              {formatDateTime(app.submittedAt || app.appliedAt)}
                            </p>
                          </>
                        )}

                        {app.status === 'rejected' && app.rejectionReason && (
                          <>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                              Rejection reason
                            </div>
                            <p className="mt-1 leading-relaxed text-red-800">{app.rejectionReason}</p>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedAppForEvidence({ application: app, task })}
                        className={`shrink-0 px-3 py-2 text-[10px] font-bold rounded-md transition-colors shadow-xs ${
                          app.status === 'rejected'
                            ? 'text-white bg-[#d92d20] hover:bg-[#b42318]'
                            : app.status === 'confirmed'
                              ? 'text-white bg-[#d92d20] hover:bg-[#b42318]'
                              : 'text-amber-800 bg-white border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {app.status === 'rejected'
                          ? 'Resubmit'
                          : app.status === 'confirmed'
                            ? 'Submit'
                            : 'Edit Submission'}
                      </button>
                    </div>

                    {app.evidenceFile && (
                      <div className="mt-3 text-[11px] text-amber-800 font-medium">
                        Evidence file: {app.evidenceFile}
                      </div>
                    )}
                  </div>
                )}

                {isApproved && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Verified</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-mono">
                        {formatDateTime(app.verifiedAt)}
                      </span>
                    </div>
                  </div>
                )}
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
