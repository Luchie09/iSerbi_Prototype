import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getCumulativeHours, formatDateOnly } from '../../logic/core';
import { StatusBadge } from '../common/StatusBadge';
import { EvidenceModal } from '../common/EvidenceModal';
import { ApplicantsModal } from '../common/ApplicantsModal';
import { Application, Task } from '../../types';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Info,
} from 'lucide-react';

export const ScholarDashboard: React.FC = () => {
  const { currentUser, data, navigate, applyForTask } = useApp();

  const [selectedTaskForRoster, setSelectedTaskForRoster] = useState<Task | null>(null);
  const [selectedAppForEvidence, setSelectedAppForEvidence] = useState<{
    application: Application;
    task: Task;
  } | null>(null);

  // Selected date on calendar to inspect
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  const monthStart = new Date(calendarYear, calendarMonth, 1);
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const leadingEmptyDays = monthStart.getDay();

  const changeCalendarMonth = (offset: number) => {
    const nextDate = new Date(calendarYear, calendarMonth + offset, 1);
    setCalendarMonth(nextDate.getMonth());
    setCalendarYear(nextDate.getFullYear());
  };

  if (!currentUser) return null;

  // Calculate cumulative hours for current semester using Prefix Sum pure function
  const currentSemester = '1st Semester 2026-2027';
  const targetRequiredHours = 30; // standard PGIN requirement
  const cumulativeHours = getCumulativeHours(currentUser.id, data.applications, data.tasks, {
    semester: currentSemester,
  });

  const progressPercent = Math.min(100, Math.round((cumulativeHours / targetRequiredHours) * 100));

  // User applications
  const userApps = data.applications.filter((a) => a.scholarId === currentUser.id);

  // Task follow-ups: duties that need rendering, proof submission, or proof resubmission
  const taskFollowUps = userApps.filter(
    (a) => a.status === 'confirmed' || a.status === 'rejected' || a.status === 'proof_submitted'
  );

  const completedTasksCount = userApps.filter(
    (a) => a.status === 'hours_reflected' || a.status === 'verified' || a.status === 'confirmed'
  ).length;

  // Open tasks preview (3-4 items)
  const openTasksPreview = data.tasks
    .filter((t) => t.status === 'open')
    .slice(0, 3);

  // Approved task dates for mini calendar
  const approvedTaskDates = userApps
    .filter((a) => a.status === 'confirmed' || a.status === 'hours_reflected')
    .map((a) => {
      const task = data.tasks.find((t) => t.id === a.taskId);
      return {
        date: task?.dateStart || '',
        title: task?.title || 'Community Service Duty',
        status: a.status,
      };
    })
    .filter((item) => item.date);

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[26px] p-6 md:p-7 shadow-[0_18px_45px_rgba(15,23,42,0.12)] border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-600/90 text-white rounded">
              Scholar Portal
            </span>
            <span className="text-xs text-slate-300 font-medium">
              AY 2026-2027 · {currentSemester}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            Naimbag nga aldaw, {currentUser.name}!
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Track your mandatory 30-hour community service requirement, secure queuing slots in FIFO order, and verify accredited hours.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => navigate('#tasks')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Browse Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Stat Cards (Section 7.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Cumulative Hours (Prefix-Sum) */}
        <div className="bg-white p-6 rounded-[22px] border border-slate-200 shadow-[0_10px_30px_rgba(15,23,42,0.04)] relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Cumulative Hours
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {cumulativeHours}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ {targetRequiredHours} hrs</span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-red-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-slate-500">
              <span>{progressPercent}% Completed</span>
              <span className="font-mono">{Math.max(0, targetRequiredHours - cumulativeHours)} hrs needed</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Active Applications */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              My Queued Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {userApps.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Total registered</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-red-500" />
            FIFO priority stamped per submission
          </p>
        </div>

        {/* Stat 3: Awaiting Verification */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Proof In Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {userApps.filter((a) => a.status === 'proof_submitted').length}
            </span>
            <span className="text-xs text-slate-400 font-medium">Under evaluation</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Coordinator reviews in 2-3 working days
          </p>
        </div>

        {/* Stat 4: d */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Task Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
              {completedTasksCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Approved / reflected</span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500/80">
            {completedTasksCount > 0 ? 'Tasks successfully completed and credited.' : 'No completed task yet.'}
          </p>
        </div>
      </div>

      {/* Two-Column Middle Section: Left Mini Calendar / Right Action Needed */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
        {/* Left: Compact Interactive Calendar (5 cols) */}
      <div className="lg:col-span-5 bg-white p-6 rounded-[24px] border border-slate-200 shadow-[0_12px_34px_rgba(15,23,42,0.04)] flex flex-col justify-between lg:h-[400px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Approved Duty Schedule
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeCalendarMonth(-1)}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="min-w-[110px] text-center text-[11px] font-mono font-medium text-slate-500">
                  {new Date(calendarYear, calendarMonth).toLocaleString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => changeCalendarMonth(1)}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2 mb-3">
              Upcoming scheduled community service dates confirmed by INYDO.
            </p>

            {/* Calendar Grid Representation */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="py-1 font-semibold text-slate-400 text-[10px]">
                  {day}
                </div>
              ))}

              {Array.from({ length: leadingEmptyDays }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-8 rounded-lg" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasTask = approvedTaskDates.some((d) => d.date === dateStr);
                const isSelected = selectedCalendarDate === dateStr;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedCalendarDate(hasTask ? dateStr : null)}
                    className={`h-8 rounded-lg flex items-center justify-center font-mono text-xs transition-colors relative ${
                      hasTask
                        ? 'bg-red-50 text-red-700 font-bold border border-red-200 hover:bg-red-100'
                        : 'text-slate-700 hover:bg-slate-100'
                    } ${isSelected ? 'ring-2 ring-red-600 bg-red-100' : ''}`}
                  >
                    <span>{day}</span>
                    {hasTask && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Date Detail Card */}
            {selectedCalendarDate ? (
              <div className="mt-4 p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs">
                <div className="font-semibold text-red-900">
                  Duty on {formatDateOnly(selectedCalendarDate)}:
                </div>
                {approvedTaskDates
                  .filter((d) => d.date === selectedCalendarDate)
                  .map((item, idx) => (
                    <div key={idx} className="mt-1 text-slate-700 flex items-center justify-between">
                      <span className="truncate">{item.title}</span>
                      <StatusBadge status={item.status as any} />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="mt-4 p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-[11px] text-slate-500 text-center">
                Click highlighted red dates to view verified scheduled duty locations.
              </div>
            )}
          </div>

        </div>

        {/* Right: Task Requirements & Reminders List (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-[24px] border border-slate-200 shadow-[0_12px_34px_rgba(15,23,42,0.04)] flex flex-col justify-between lg:h-[400px]">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-2xl font-bold text-slate-900">
                  Task Reminder
                </h3>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                {taskFollowUps.length} Items
              </span>
            </div>

            <div
              className="mt-3 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain pr-2"
              aria-label="Task reminders"
            >
              {taskFollowUps.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No task requirements pending.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Your upcoming task submissions and reminders are clear for now.
                  </p>
                </div>
              ) : (
                taskFollowUps.map((app) => {
                  const task = data.tasks.find((t) => t.id === app.taskId);
                  if (!task) return null;

                  const reminderText =
                    app.status === 'rejected'
                      ? `Resubmission for ${task.title}. ${app.rejectionReason || 'Please revise the returned requirements.'}`
                      : app.status === 'confirmed'
                        ? `Render for ${task.title}. Please attend and complete the task requirements.`
                        : `For submission: ${task.title}. Please submit your proof before the deadline.`;

                  return (
                    <div key={app.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {task.title}
                          </h4>
                          <StatusBadge status={app.status} />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                          {reminderText}
                        </p>
                        {app.status === 'rejected' && app.rejectionReason && (
                          <p className="text-[11px] text-red-600 mt-1 font-medium bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            Returned: {app.rejectionReason}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedAppForEvidence({ application: app, task })}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg shrink-0 transition-colors shadow-xs"
                      >
                        {app.status === 'rejected' ? 'Resubmit Proof' : app.status === 'confirmed' ? 'Submit Proof' : 'Review'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Reminder: complete task requirements on assigned dates and resubmit rejected items promptly.
            </span>
            <button
              type="button"
              onClick={() => navigate('#applications')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Manage Applications</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      {/* Modal Dialogs */}
      {selectedTaskForRoster && (
        <ApplicantsModal
          task={selectedTaskForRoster}
          onClose={() => setSelectedTaskForRoster(null)}
        />
      )}

      {selectedAppForEvidence && (
        <EvidenceModal
          application={selectedAppForEvidence.application}
          task={selectedAppForEvidence.task}
          onClose={() => setSelectedAppForEvidence(null)}
        />
      )}
    </div>
  );
};
