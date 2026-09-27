import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import { formatDateOnly, formatDateTime, getTaskCategory, TaskCategory } from '../../logic/core';
import { ApplicantsModal } from '../common/ApplicantsModal';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  X,
  FileCheck2,
  Send,
  Save,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

export const CoordinatorTasks: React.FC = () => {
  const { data, createTask, updateTask, deleteTask, showToast } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'closed' | 'full' | 'finished' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [selectedTaskForRoster, setSelectedTaskForRoster] = useState<Task | null>(null);

  // Delete Confirmation Modal State
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Modal State for Create / Edit Task
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    creditHours: 8,
    slotsTotal: 15,
    dateStart: '2026-10-15',
    dateEnd: '2026-10-15',
    deadline: '2026-10-13T17:00',
    location: '',
    requirements: '',
    semester: '1st Semester 2026-2027',
    status: 'open' as TaskStatus,
  });

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      title: '',
      shortDescription: '',
      description: '',
      creditHours: 8,
      slotsTotal: 15,
      dateStart: today,
      dateEnd: today,
      deadline: `${today}T17:00`,
      location: 'Laoag City, Ilocos Norte',
      requirements: 'Valid scholar ID, comfortable attire, sun protection.',
      semester: '1st Semester 2026-2027',
      status: 'open',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      shortDescription: task.shortDescription,
      description: task.description,
      creditHours: task.creditHours,
      slotsTotal: task.slotsTotal,
      dateStart: task.dateStart,
      dateEnd: task.dateEnd,
      deadline: task.deadline
        ? task.deadline.includes('T')
          ? task.deadline.slice(0, 16)
          : `${task.deadline}T17:00`
        : '',
      location: task.location,
      requirements: task.requirements,
      semester: task.semester || '1st Semester 2026-2027',
      status: (task.status === 'completed' ? 'finished' : task.status) as TaskStatus,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (isDraft: boolean) => {
    if (!formData.title.trim()) {
      showToast('Task title is required.', 'error');
      return;
    }
    if (!formData.location.trim()) {
      showToast('Location venue is required.', 'error');
      return;
    }

    const finalStatus: TaskStatus = isDraft
      ? 'draft'
      : formData.status === 'draft'
      ? 'open'
      : formData.status;

    if (editingTask) {
      updateTask(editingTask.id, {
        ...formData,
        creditHours: Number(formData.creditHours),
        slotsTotal: Number(formData.slotsTotal),
        deadline: formData.deadline ? formData.deadline : undefined,
        status: finalStatus,
      });
    } else {
      createTask(
        {
          title: formData.title,
          shortDescription: formData.shortDescription || formData.title,
          description: formData.description || formData.shortDescription,
          creditHours: Number(formData.creditHours),
          slotsTotal: Number(formData.slotsTotal),
          dateStart: formData.dateStart,
          dateEnd: formData.dateEnd,
          deadline: formData.deadline ? formData.deadline : undefined,
          location: formData.location,
          requirements: formData.requirements,
          semester: formData.semester,
          status: finalStatus,
        },
        isDraft
      );
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    deleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  // Filter tasks based on normalized categories: Open, Closed, Full, Finished, Draft
  const filteredTasks = data.tasks.filter((task) => {
    const category = getTaskCategory(task);
    if (activeFilter !== 'all' && category !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchLoc = task.location.toLowerCase().includes(q);
      const matchDesc = task.description.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc && !matchDesc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with Create Task Button */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Task Opportunity Management
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Create, configure, publish, and manage community service initiatives. Oversee capacity and monitor FIFO queuing allocations.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task Opportunity</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(['all', 'open', 'closed', 'full', 'finished', 'draft'] as const).map((filter) => {
              const count =
                filter === 'all'
                  ? data.tasks.length
                  : data.tasks.filter((t) => getTaskCategory(t) === filter).length;

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

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks or venues..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Task Cards Grid matching Scholar layout & structure */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No Task Opportunities Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords or switching filter tabs to see other opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;
            const category = getTaskCategory(task);

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
                            : category === 'finished'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {category}
                      </span>
                    </div>

                    {/* Applicant Count Pill with click to open Full Detail & Application Log */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTaskForRoster(task);
                      }}
                      className="text-xs font-mono font-medium text-slate-600 hover:text-red-600 hover:underline flex items-center gap-1.5 p-1 rounded hover:bg-slate-50 transition-colors"
                      title="Click to view Task Detail & Application Log"
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

                  {/* Simplified Application Log display: Link only */}
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

                {/* Card Bottom: View Full Detail toggle on left, Edit & Delete on right */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleExpand(task.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <span>{isExpanded ? 'Less info' : 'View Full Detail'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Coordinators see Edit and Delete actions in the equivalent position */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(task)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      title="Edit task opportunity"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskToDelete(task)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                      title="Delete task opportunity"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Task Opportunity?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Permanent removal confirmation
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-50/70 border border-red-100 rounded-xl text-xs text-red-900 space-y-1.5">
              <p className="font-semibold text-slate-700">
                Are you sure you want to permanently delete:
              </p>
              <p className="font-bold text-slate-900 bg-white p-2 rounded-lg border border-red-200">
                {taskToDelete.title}
              </p>
              <p className="text-[11px] text-red-700">
                This action cannot be undone. All ({taskToDelete.slotsFilled}) queued scholar applications for this task will also be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingTask ? 'Edit Task Opportunity' : 'Create New Task Opportunity'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Activity Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Coastal Cleanup Drive & Mangrove Nursery Care"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="1-2 sentences summarizing activity purpose"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Service Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed duty scope, assembly procedures, and supervisor contact"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Credit Hours (Earned)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={formData.creditHours}
                    onChange={(e) => setFormData({ ...formData, creditHours: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Maximum Capacity Slots
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={formData.slotsTotal}
                    onChange={(e) => setFormData({ ...formData, slotsTotal: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.dateStart}
                    onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.dateEnd}
                    onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Application Deadline / Closing Period */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Application Deadline (Closing Period) <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Specify the date and time when scholar applications for this task will officially close.
                </p>
              </div>

              {/* Status / Category Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Task Category / Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="open">Open (Application period is active, scholars can apply)</option>
                  <option value="closed">Closed (Application deadline passed, no longer accepting applications)</option>
                  <option value="full">Full (Task has reached maximum approved/accepted applicants)</option>
                  <option value="finished">Finished (Task itself has already been completed/conducted)</option>
                  <option value="draft">Draft (Unpublished, coordinator-only draft)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Note: Draft tasks remain hidden from scholars until published or switched to Open.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location Venue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Currimao Seashore, Currimao, Ilocos Norte"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Requirements & Prescribed Attire
                </label>
                <input
                  type="text"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="e.g. Closed shoes, ID, gloves, water tumbler"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Submit Actions: Save as Draft vs Publish */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFormSubmit(true)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save as Draft</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFormSubmit(false)}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Opportunity</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail & Application Log Modal */}
      {selectedTaskForRoster && (
        <ApplicantsModal
          task={selectedTaskForRoster}
          onClose={() => setSelectedTaskForRoster(null)}
        />
      )}
    </div>
  );
};
