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
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const ScholarTasks: React.FC = () => {
  const { currentUser, data, applyForTask, cancelApplication } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'closed' | 'full' | 'finished'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [selectedTaskForRoster, setSelectedTaskForRoster] = useState<Task | null>(null);

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

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

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
          {/* Segmented Filter Controls: Open, Closed, Full, Finished */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(['all', 'open', 'closed', 'full', 'finished'] as const).map((filter) => {
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
            Try adjusting your search keywords or switching filters to see open, closed, full, or finished opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
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
                            : category === 'full'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
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
                          {task.deadline ? formatDateTime(task.deadline) : 'Rolling admission'}
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

                  {/* Expanded Details Section */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 text-xs animate-in fade-in duration-150">
                      <div>
                        <span className="font-semibold text-slate-700 block mb-0.5">
                          Full Scope of Service:
                        </span>
                        <p className="text-slate-600 leading-relaxed">{task.description}</p>
                      </div>

                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="font-semibold text-slate-700 block mb-0.5">
                          Requirements & Attire:
                        </span>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {task.requirements}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-600 py-1 border-t border-slate-100">
                        <span>Deadline:</span>
                        <span className="font-mono font-semibold text-slate-800">
                          {task.deadline ? formatDateTime(task.deadline) : 'Rolling admission'}
                        </span>
                      </div>

                      <div className="flex items-center justify-end text-[11px] text-slate-400 font-mono">
                        <span>{task.semester}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Bottom: Expand Toggle & Apply / Cancel / Queue Status Button */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(task.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Less info' : 'View full details'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Apply or Applied / Cancel Status Buttons */}
                  {userApplication ? (
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
                  ) : category === 'closed' ? (
                    <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold font-mono">
                      Application Closed
                    </span>
                  ) : category === 'full' ? (
                    <span className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold font-mono">
                      Slots Full
                    </span>
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

