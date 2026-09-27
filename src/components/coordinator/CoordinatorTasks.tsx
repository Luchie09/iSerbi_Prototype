import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskStatus } from '../../types';
import { formatDateOnly } from '../../logic/core';
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
} from 'lucide-react';

export const CoordinatorTasks: React.FC = () => {
  const { data, createTask, updateTask, deleteTask, showToast } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | TaskStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskForRoster, setSelectedTaskForRoster] = useState<Task | null>(null);

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
    location: '',
    requirements: '',
    semester: '1st Semester 2026-2027',
  });

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      shortDescription: '',
      description: '',
      creditHours: 8,
      slotsTotal: 15,
      dateStart: new Date().toISOString().split('T')[0],
      dateEnd: new Date().toISOString().split('T')[0],
      location: 'Laoag City, Ilocos Norte',
      requirements: 'Valid scholar ID, comfortable attire, sun protection.',
      semester: '1st Semester 2026-2027',
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
      location: task.location,
      requirements: task.requirements,
      semester: task.semester || '1st Semester 2026-2027',
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

    if (editingTask) {
      updateTask(editingTask.id, {
        ...formData,
        status: isDraft ? 'draft' : 'open',
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
          location: formData.location,
          requirements: formData.requirements,
          semester: formData.semester,
          status: isDraft ? 'draft' : 'open',
        },
        isDraft
      );
    }

    setIsModalOpen(false);
  };

  const handleDelete = (taskId: string, title: string) => {
    if (confirm(`Are you sure you want to delete task "${title}"? This will also remove queued applications.`)) {
      deleteTask(taskId);
    }
  };

  // Filter tasks
  const filteredTasks = data.tasks.filter((task) => {
    if (activeFilter !== 'all' && task.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchLoc = task.location.toLowerCase().includes(q);
      if (!matchTitle && !matchLoc) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header with + Create Task Button */}
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
            <span>+ Create Task Opportunity</span>
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {(['all', 'open', 'full', 'completed', 'closed', 'draft'] as const).map((filter) => {
              const count =
                filter === 'all'
                  ? data.tasks.length
                  : data.tasks.filter((t) => t.status === filter).length;

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

      {/* Task Cards Grid with Edit & Delete */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTasks.map((task) => {
          const taskApplications = data.applications
            .filter((a) => a.taskId === task.id)
            .sort((a, b) => new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime());

          const earliestQueueTimestamp = taskApplications[0]?.appliedAt ?? null;

          return (
          <div
            key={task.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-slate-100 text-slate-800 rounded">
                  {task.creditHours} Credit Hours
                </span>

                <div className="flex items-center gap-1">
                  {task.status === 'draft' ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                      Draft
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        task.status === 'open'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.status}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-3 leading-snug">
                {task.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {task.shortDescription}
              </p>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDateOnly(task.dateStart)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTaskForRoster(task)}
                    className="flex items-center gap-1 text-[11px] font-mono font-bold text-blue-600 hover:underline"
                    title="Inspect FIFO applicants queue"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{task.slotsFilled}/{task.slotsTotal} Queued</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{task.location}</span>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <span>Application Log</span>
                  <button
                    type="button"
                    onClick={() => setSelectedTaskForRoster(task)}
                    className="text-[10px] font-semibold text-red-600 hover:text-red-700 hover:underline"
                  >
                    View queue
                  </button>
                </div>
                <div className="mt-1.5 text-[11px] text-slate-700 font-mono">
                  {earliestQueueTimestamp
                    ? `First in queue: ${new Date(earliestQueueTimestamp).toLocaleString()}`
                    : 'No applications received yet'}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Edit / Delete / View Applicants */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedTaskForRoster(task)}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                View Roster ({task.slotsFilled})
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(task)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-white transition-colors"
                  title="Edit task"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id, task.title)}
                  className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-white transition-colors"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* Create / Edit Modal (Section 8.2) */}
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

            {/* Distinct Submit Actions: Save as Draft vs Publish (Section 8.2) */}
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

      {/* Roster Modal */}
      {selectedTaskForRoster && (
        <ApplicantsModal
          task={selectedTaskForRoster}
          onClose={() => setSelectedTaskForRoster(null)}
        />
      )}
    </div>
  );
};
