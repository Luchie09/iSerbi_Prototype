import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { formatDateTime, formatDateOnly, getTaskCategory } from '../../logic/core';
import { X, Users, Clock, ShieldCheck, Calendar, MapPin, AlertCircle, FileText } from 'lucide-react';

interface ApplicantsModalProps {
  task: Task;
  onClose: () => void;
}

export const ApplicantsModal: React.FC<ApplicantsModalProps> = ({ task, onClose }) => {
  const { data } = useApp();
  const [activeTab, setActiveTab] = useState<'roster' | 'details'>('roster');

  // Sort applications for this task strictly by appliedAt ascending (FIFO queue order)
  const taskApplications = data.applications
    .filter((a) => a.taskId === task.id)
    .sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Task Detail & Application Log
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200 rounded">
                  {task.creditHours} hrs
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
                {task.title}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Quick Metadata Bar */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Service Schedule</span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-800 mt-0.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDateOnly(task.dateStart)}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Deadline</span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700 mt-0.5 font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{task.deadline ? formatDateTime(task.deadline) : 'Rolling until full'}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Venue / Location</span>
            <div className="flex items-center gap-1 text-[11px] text-slate-800 mt-0.5 truncate font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{task.location}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Capacity Allocation</span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-900 mt-0.5 font-bold">
              <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{task.slotsFilled} / {task.slotsTotal} filled</span>
            </div>
          </div>
        </div>

        {/* Tabs: Application Log Roster vs Full Task Specifications */}
        <div className="flex items-center px-6 border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Application Log & Queue Roster ({taskApplications.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'details'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Full Task Specifications</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                <p className="text-slate-600 leading-relaxed">{task.description}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-semibold text-slate-700 block text-[11px] uppercase tracking-wide">
                  Requirements & Prescribed Attire
                </span>
                <p className="text-slate-600 leading-relaxed">{task.requirements}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Academic Term</span>
                  <span className="font-mono text-xs text-slate-700 font-semibold">{task.semester || 'Academic Term'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Opportunity Category</span>
                  <span className="font-mono text-xs text-slate-700 font-semibold capitalize">{getTaskCategory(task)}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {taskApplications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-600">No applications received yet.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Applications will be queued strictly in FIFO order once scholars apply.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3 w-12 text-center">Queue #</th>
                        <th className="py-2.5 px-3">Applicant Name</th>
                        <th className="py-2.5 px-3">Scholar / Student ID</th>
                        <th className="py-2.5 px-3">Applied Timestamp (FCFS)</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {taskApplications.map((app, index) => {
                        const scholar = data.users.find((u) => u.id === app.scholarId);
                        const isWithinCapacity = index < task.slotsTotal;

                        return (
                          <tr
                            key={app.id}
                            className={`hover:bg-slate-50 transition-colors ${
                              !isWithinCapacity ? 'bg-amber-50/30' : ''
                            }`}
                          >
                            <td className="py-3 px-3 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-mono font-bold ${
                                  isWithinCapacity
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {index + 1}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    scholar?.profilePicture ||
                                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                                  }
                                  alt={scholar?.name || 'Applicant'}
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <div className="font-semibold text-slate-900">
                                    {scholar?.name || 'Scholar Recipient'}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {scholar?.program || 'Academic Scholar'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {scholar?.userId || '—'}
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 tabular-nums">
                              {formatDateTime(app.appliedAt)}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold rounded capitalize ${
                                  app.status === 'verified' || app.status === 'hours_reflected'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : app.status === 'proof_submitted'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {app.status.replace('_', ' ')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified FIFO Queuing Algorithm · Certified by PGIN INYDO
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
