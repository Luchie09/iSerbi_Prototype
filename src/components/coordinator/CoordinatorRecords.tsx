import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatDateOnly, formatDateTime, exportToCSV } from '../../logic/core';
import {
  ClipboardList,
  Search,
  Download,
  Edit2,
  Filter,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const CoordinatorRecords: React.FC = () => {
  const { data, overrideServiceRecord, showToast } = useApp();

  const [semesterFilter, setSemesterFilter] = useState<string>('All');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state for manual coordinator override audit
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editHours, setEditHours] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<ApplicationStatus>('hours_reflected');

  // Filter service records
  const filteredRecords = data.applications.filter((app) => {
    const task = data.tasks.find((t) => t.id === app.taskId);
    const scholar = data.users.find((u) => u.id === app.scholarId);

    if (semesterFilter !== 'All' && task && task.semester !== semesterFilter) {
      return false;
    }
    if (yearFilter !== 'All' && task && String(task.year) !== yearFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchScholar = scholar?.name.toLowerCase().includes(q) || scholar?.userId.toLowerCase().includes(q);
      const matchTask = task?.title.toLowerCase().includes(q);
      if (!matchScholar && !matchTask) return false;
    }

    return true;
  });

  const handleStartEdit = (appId: string, currentHours: number | null, currentStatus: ApplicationStatus) => {
    const task = data.tasks.find((t) => t.id === data.applications.find((a) => a.id === appId)?.taskId);
    setEditingAppId(appId);
    setEditHours(currentHours ?? task?.creditHours ?? 0);
    setEditStatus(currentStatus);
  };

  const handleSaveEdit = (appId: string) => {
    overrideServiceRecord(appId, Number(editHours), editStatus);
    setEditingAppId(null);
  };

  const handleExportCSV = () => {
    const headers = [
      'Record ID',
      'Scholar Name',
      'Scholar ID',
      'Program',
      'Task Title',
      'Semester',
      'Credited Hours',
      'Status',
      'Date Applied',
      'Date Verified',
    ];

    const rows = filteredRecords.map((app) => {
      const scholar = data.users.find((u) => u.id === app.scholarId);
      const task = data.tasks.find((t) => t.id === app.taskId);

      return [
        app.id,
        scholar?.name || 'Unknown',
        scholar?.userId || '—',
        scholar?.program || '—',
        task?.title || '—',
        task?.semester || '1st Semester 2026-2027',
        app.hoursCredited ?? task?.creditHours ?? 0,
        app.status,
        formatDateTime(app.appliedAt),
        formatDateTime(app.verifiedAt),
      ];
    });

    const filename = `iSerbi_Service_Records_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filename, headers, rows);
    showToast(`Exported ${filteredRecords.length} service records to CSV.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header with Export Action */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Community Service Master Records
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Official provincial audit ledger. Filter by semester or scholar, override or correct records during audit reviews, and export to CSV.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Export to Excel / CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Semester:</span>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="All">All Semesters</option>
              <option value="1st Semester 2026-2027">1st Semester 2026-2027</option>
              <option value="2nd Semester 2025-2026">2nd Semester 2025-2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Year:</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="All">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholar or task..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-xs"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Scholar Name & ID</th>
                <th className="py-3 px-4">Community Task</th>
                <th className="py-3 px-4 text-center">Credit Hours</th>
                <th className="py-3 px-4">Date Verified</th>
                <th className="py-3 px-4">Pipeline Status</th>
                <th className="py-3 px-4 text-right">Audit Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching service records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((app) => {
                  const scholar = data.users.find((u) => u.id === app.scholarId);
                  const task = data.tasks.find((t) => t.id === app.taskId);
                  const isEditingThis = editingAppId === app.id;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">
                          {scholar?.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {scholar?.userId} · {scholar?.program}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-800 block truncate">
                          {task?.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {task?.semester}
                        </span>
                      </td>

                      {/* Hours: editable or static */}
                      <td className="py-3.5 px-4 text-center">
                        {isEditingThis ? (
                          <input
                            type="number"
                            min={0}
                            max={40}
                            value={editHours}
                            onChange={(e) => setEditHours(Number(e.target.value))}
                            className="w-16 px-1.5 py-1 text-center border border-slate-300 rounded font-mono font-bold"
                          />
                        ) : (
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded tabular-nums">
                            {app.hoursCredited ?? task?.creditHours ?? 0} hrs
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 tabular-nums">
                        {formatDateOnly(app.verifiedAt || app.appliedAt)}
                      </td>

                      {/* Status: editable or badge */}
                      <td className="py-3.5 px-4">
                        {isEditingThis ? (
                          <select
                            value={editStatus}
                            onChange={(e) =>
                              setEditStatus(e.target.value as ApplicationStatus)
                            }
                            className="px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                          >
                            <option value="applied">Applied</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="proof_submitted">Proof Submitted</option>
                            <option value="verified">Verified</option>
                            <option value="hours_reflected">Hours Reflected</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <StatusBadge status={app.status} />
                        )}
                      </td>

                      {/* Action Edit */}
                      <td className="py-3.5 px-4 text-right">
                        {isEditingThis ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(app.id)}
                              className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              title="Save record"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingAppId(null)}
                              className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleStartEdit(app.id, app.hoursCredited, app.status)
                            }
                            className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                            title="Audit edit record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
