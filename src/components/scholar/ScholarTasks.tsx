import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task } from '../../types';
import { getQueuePosition, formatDateOnly, formatDateTime, getTaskCategory, TaskCategory } from '../../logic/core';
import { ApplicantsModal } from '../common/ApplicantsModal';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react';

export const ScholarTasks: React.FC = () => {
  const { currentUser, data, applyForTask, cancelApplication } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'closed' | 'finished'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskForRoster, setSelectedTaskForRoster] = useState<Task | null>(null);
  const [selectedTaskForSpec, setSelectedTaskForSpec] = useState<Task | null>(null);

  if (!currentUser) return null;

  // Exclude draft tasks from scholar view as specified:
  // Draft tasks are only visible on coordinator side
  const visibleTasks = data.tasks.filter((t) => t.status !== 'draft');

  const filteredTasks = visibleTasks.filter((task) => {
    const category = getTaskCategory(task);

    // Status category filter
    if (activeFilter !== 'all' && category !== activeFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      const matchLoc = task.location.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Algorithm Context */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Community Service Task Opportunities
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Browse accredited provincial volunteer initiatives. Slots are allocated on a strict
              First-Come-First-Served (FIFO) basis. Your queue timestamp secures your allocation priority.
            </p>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          {/* Segmented Filter Controls: Open, Closed, Finished */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(['all', 'open', 'closed', 'finished'] as const).map((filter) => {
              const count =
                filter === 'all'
                  ? visibleTasks.length
                  : visibleTasks.filter((t) => getTaskCategory(t) === filter).length;

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap capitalize ${
                    activeFilter === filter
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, venues, keywords..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No Task Opportunities Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switching filters to see open, closed, or finished opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => {
            const category = getTaskCategory(task);

            const taskApplications = data.applications
              .filter((a) => a.taskId === task.id)
              .sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime());

            // Check if user already applied
            const userApplication = data.applications.find(
              (a) => a.taskId === task.id && a.scholarId === currentUser.id && a.status !== 'rejected'
            );

            // Queue position calculation
            const queueInfo = userApplication
              ? getQueuePosition(userApplication.id, data.applications)
              : null;

            return (
              <div
                key={task.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top: Header & Badges */}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-red-50 text-red-700 border border-red-200 rounded">
                        {task.creditHours} Hours Credit
                      </span>
                      {/* Consistent Status Badge */}
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          category === 'open'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : category === 'closed'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {category}
                      </span>
                    </div>

                    {/* Applicant Count Pill with click to open roster */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskForRoster(task);
                      }}
                      className="text-xs font-mono font-medium text-slate-600 hover:text-red-600 hover:underline flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 transition-colors"
                      title="Click to view FIFO Queue Roster"
                    >
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {task.slotsFilled}/{task.slotsTotal} Slots
                      </span>
                    </button>
                  </div>

                  {/* Title & Short Description */}
                  <h3 className="text-sm font-bold text-slate-900 mt-3 leading-snug">
                    {task.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                    {task.shortDescription}
                  </p>

                  {/* Date, Location, and Application Deadline (minimal & clean in metadata row) */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono text-[11px]">
                        {formatDateOnly(task.dateStart)}{' '}
                        {task.dateEnd !== task.dateStart ? `— ${formatDateOnly(task.dateEnd)}` : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px]">
                        Deadline:{' '}
                        <span className="font-mono font-medium text-slate-700">
                          {task.deadline ? formatDateTime(task.deadline) : 'No deadline set'}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{task.location}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedTaskForRoster(task)}
                      className="inline-flex items-center text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                    >
                      View application log
                    </button>
                  </div>

                </div>

                {/* Card Bottom: Full Task Specification link & Apply / Cancel / Queue Status Button */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTaskForSpec(task)}
                    className="inline-flex items-center text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                  >
                    Full Task Specification
                  </button>

                  {/* Apply or Applied / Cancel Status Buttons */}
                  {category === 'closed' ? (
                    <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold font-mono">
                      Application Closed
                    </span>
                  ) : userApplication ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Applied · #{queueInfo?.position ?? '—'}
                        </span>
                      </div>
                      {category !== 'finished' && (
                        <button
                          type="button"
                          onClick={() => cancelApplication(userApplication.id)}
                          className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                          title="Cancel this application"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ) : category === 'open' ? (
                    <button
                      type="button"
                      onClick={() => applyForTask(task.id)}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>Apply (Queue)</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold font-mono">
                      Task Finished
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Task Specification Modal */}
      {selectedTaskForSpec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Full Task Specification</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedTaskForSpec.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskForSpec(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="text-[10px] font-bold uppercase tracking-wide text-red-600 mb-1">Title</div>
                <div className="text-sm font-bold text-slate-900">{selectedTaskForSpec.title}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Hours Credit</div>
                  <div className="font-mono text-sm font-bold text-slate-800 mt-1">{selectedTaskForSpec.creditHours} hrs</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Capacity</div>
                  <div className="font-mono text-sm font-bold text-slate-800 mt-1">{selectedTaskForSpec.slotsFilled}/{selectedTaskForSpec.slotsTotal} filled</div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Service Description</div>
                <p className="text-slate-600 leading-relaxed">{selectedTaskForSpec.description}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Requirements & Attire</div>
                <p className="text-slate-600 leading-relaxed">{selectedTaskForSpec.requirements}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Date</div>
                  <div className="font-mono text-xs text-slate-700 mt-1">
                    {formatDateOnly(selectedTaskForSpec.dateStart)}
                    {selectedTaskForSpec.dateEnd !== selectedTaskForSpec.dateStart ? ` — ${formatDateOnly(selectedTaskForSpec.dateEnd)}` : ''}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Deadline</div>
                  <div className="font-mono text-xs text-slate-700 mt-1">
                    {selectedTaskForSpec.deadline ? formatDateTime(selectedTaskForSpec.deadline) : 'No deadline set'}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Venue</div>
                <div className="flex items-center gap-2 text-slate-700 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedTaskForSpec.location}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedTaskForSpec(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIFO Applicants Roster Modal */}
      {selectedTaskForRoster && (
        <ApplicantsModal
          task={selectedTaskForRoster}
          onClose={() => setSelectedTaskForRoster(null)}
        />
      )}
    </div>
  );
};

