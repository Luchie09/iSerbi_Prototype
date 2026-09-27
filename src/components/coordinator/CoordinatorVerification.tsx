import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../logic/core';
import {
  ShieldCheck,
  Check,
  X,
  FileText,
  AlertCircle,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const CoordinatorVerification: React.FC = () => {
  const { data, approveApplicationAction, rejectApplicationAction, showToast } = useApp();

  const [selectedTaskId, setSelectedTaskId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Reject Modal State
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Evidence Preview Modal State
  const [previewFile, setPreviewFile] = useState<{
    fileName: string;
    notes: string;
    scholarName: string;
    taskTitle: string;
  } | null>(null);

  // Pending queue is strictly applications where status === "proof_submitted"
  const pendingApplications = data.applications.filter(
    (app) => app.status === 'proof_submitted'
  );

  const filteredQueue = pendingApplications.filter((app) => {
    if (selectedTaskId !== 'all' && app.taskId !== selectedTaskId) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const task = data.tasks.find((t) => t.id === app.taskId);
      const scholar = data.users.find((u) => u.id === app.scholarId);
      const matchScholar = scholar?.name.toLowerCase().includes(q) || scholar?.userId.toLowerCase().includes(q);
      const matchTask = task?.title.toLowerCase().includes(q);
      if (!matchScholar && !matchTask) return false;
    }

    return true;
  });

  const handleApprove = (appId: string, scholarName: string, taskTitle: string) => {
    approveApplicationAction(appId);
  };

  const handleOpenRejectModal = (appId: string) => {
    setRejectingAppId(appId);
    setRejectionReason('');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAppId) return;
    if (!rejectionReason.trim()) {
      showToast('Please provide a specific feedback reason for returning the submission.', 'error');
      return;
    }

    rejectApplicationAction(rejectingAppId, rejectionReason.trim());
    setRejectingAppId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Task Verification & Certification Queue
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Inspect submitted signed attendance sheets and log certificates. Approving immediately credits hours into the scholar’s cumulative prefix sum ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold font-mono">
              {pendingApplications.length} Submissions Pending
            </span>
          </div>
        </div>

        {/* Filter Bar: By Task + Live Search */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-72"
            >
              <option value="all">All Pending Tasks ({pendingApplications.length})</option>
              {data.tasks.map((task) => {
                const count = pendingApplications.filter((a) => a.taskId === task.id).length;
                if (count === 0) return null;
                return (
                  <option key={task.id} value={task.id}>
                    {task.title} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scholar name or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Verification Queue Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredQueue.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Verification Queue Clear</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No submissions are currently pending your audit. All attendance sheets have been evaluated.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Scholar Recipient</th>
                  <th className="py-3 px-4">Community Task Activity</th>
                  <th className="py-3 px-4">Submitted Evidence</th>
                  <th className="py-3 px-4">Duty Notes</th>
                  <th className="py-3 px-4">Submitted Timestamp</th>
                  <th className="py-3 px-4 text-center">Credit Hours</th>
                  <th className="py-3 px-4 text-right">Certification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQueue.map((app) => {
                  const scholar = data.users.find((u) => u.id === app.scholarId);
                  const task = data.tasks.find((t) => t.id === app.taskId);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Scholar Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              scholar?.profilePicture ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={scholar?.name || 'Scholar'}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                              {scholar?.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {scholar?.userId} · {scholar?.program}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Task Info */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                          {task?.title}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[180px] block">
                          {task?.location}
                        </span>
                      </td>

                      {/* Evidence File & Preview Button */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewFile({
                              fileName: app.evidenceFile || 'Proof Document.pdf',
                              notes: app.evidenceNotes || 'None provided.',
                              scholarName: scholar?.name || 'Scholar',
                              taskTitle: task?.title || 'Community Service',
                            })
                          }
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                        >
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {app.evidenceFile || 'Log Sheet.pdf'}
                          </span>
                          <Eye className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
                        </button>
                      </td>

                      {/* Notes */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {app.evidenceNotes || 'No additional shift notes provided.'}
                        </p>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums">
                        {formatDateTime(app.submittedAt || app.appliedAt)}
                      </td>

                      {/* Hours */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          +{task?.creditHours} hrs
                        </span>
                      </td>

                      {/* Actions: Approve / Reject */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleApprove(app.id, scholar?.name || '', task?.title || '')
                            }
                            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                            title="Certify proof and credit hours"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenRejectModal(app.id)}
                            className="px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1"
                            title="Return for revision with feedback"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal (Reason Required) */}
      {rejectingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Return Proof for Revision</span>
              </div>
              <button
                type="button"
                onClick={() => setRejectingAppId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-6 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Provide a clear reason explaining why this submission is returned. The scholar will receive this feedback and will be able to resubmit a corrected document.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rejection Reason / Specific Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Uploaded attendance sheet lacks the supervisor's official signature. Please re-upload with Dr. Agcaoili's signature."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingAppId(null)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg font-bold shadow-xs transition-colors"
                >
                  Confirm Rejection & Send
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Document Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-sm text-slate-900">
                  {previewFile.fileName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex justify-between text-slate-500">
                  <span>Scholar:</span>
                  <span className="font-bold text-slate-900">{previewFile.scholarName}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Target Activity:</span>
                  <span className="font-bold text-slate-900 truncate max-w-[240px]">
                    {previewFile.taskTitle}
                  </span>
                </div>
              </div>

              {/* Simulated Document Preview Canvas */}
              <div className="border border-slate-300 rounded-xl p-8 bg-white shadow-inner flex flex-col items-center justify-center text-center space-y-2 min-h-[220px]">
                <FileText className="w-12 h-12 text-slate-400" />
                <span className="font-bold text-slate-800 text-sm">{previewFile.fileName}</span>
                <span className="text-[11px] text-slate-500 max-w-xs">
                  Official INYDO Verified Attendance Slip with Supervising Officer Seal
                </span>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Signature & Geotag Verified</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">
                  Submitted Duty Accomplishment Notes:
                </span>
                <p className="p-3 bg-slate-50 rounded-lg text-slate-700 border border-slate-200 leading-relaxed">
                  {previewFile.notes}
                </p>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
