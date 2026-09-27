import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV, formatDateTime } from '../../logic/core';
import { User } from '../../types';
import {
  ClipboardList,
  Search,
  Filter,
  FileSpreadsheet,
  Eye,
  X,
  Pencil,
} from 'lucide-react';

const DEFAULT_CS_REQUIRED_HOURS = 55;

export const CoordinatorRecords: React.FC = () => {
  const { data, showToast } = useApp();

  const [semesterFilter, setSemesterFilter] = useState<string>('All');
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [programFilter, setProgramFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHistoryScholar, setSelectedHistoryScholar] = useState<{
    scholar: User;
    history: Array<{ taskTitle: string; verifiedAt: string; hours: number; semester?: string }>;
  } | null>(null);
  const [editingScholarId, setEditingScholarId] = useState<string | null>(null);
  const [manualOverallHours, setManualOverallHours] = useState<Record<string, { earned: number; required: number }>>({});
  const [editValue, setEditValue] = useState<{ earned: number; required: number }>({
    earned: 0,
    required: DEFAULT_CS_REQUIRED_HOURS,
  });

  const scholarshipPrograms = Array.from(
    new Set(
      data.users
        .filter((user) => user.role === 'scholar')
        .map((user) => user.scholarshipProgram)
        .filter((program): program is string => Boolean(program))
    )
  );

  const scholarSummaries = data.users
    .filter((user) => user.role === 'scholar')
    .map((scholar) => {
      const eligibleApps = data.applications.filter(
        (app) => app.scholarId === scholar.id && app.status === 'hours_reflected'
      );

      const history = eligibleApps
        .map((app) => {
          const task = data.tasks.find((t) => t.id === app.taskId);
          return {
            taskTitle: task?.title || 'Community Service Task',
            verifiedAt: app.verifiedAt || app.appliedAt,
            hours: app.hoursCredited ?? task?.creditHours ?? 0,
            semester: task?.semester || 'Unspecified',
          };
        })
        .sort((a, b) => new Date(a.verifiedAt).getTime() - new Date(b.verifiedAt).getTime());

      const computedEarned = history.reduce((sum, item) => sum + item.hours, 0);
      const manualValue = manualOverallHours[scholar.id];
      const earned = manualValue?.earned ?? computedEarned;
      const required = manualValue?.required ?? DEFAULT_CS_REQUIRED_HOURS;
      const semesters = Array.from(new Set(history.map((item) => item.semester).filter(Boolean))); 
      const semesterLabel = semesters.length === 0 ? 'N/A' : semesters.length === 1 ? semesters[0] : 'Multiple';

      return {
        scholar,
        earned,
        required,
        history,
        semesterLabel,
      };
    })
    .filter((summary) => {
      if (programFilter !== 'All' && summary.scholar.scholarshipProgram !== programFilter) {
        return false;
      }

      if (semesterFilter !== 'All' && summary.semesterLabel !== semesterFilter) {
        return false;
      }

      if (yearFilter !== 'All') {
        const hasMatchingYear = summary.history.some((item) => {
          const task = data.tasks.find((t) => t.title === item.taskTitle);
          return String(task?.year || '') === yearFilter;
        });
        if (!hasMatchingYear) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchScholar =
          summary.scholar.name.toLowerCase().includes(q) || summary.scholar.userId.toLowerCase().includes(q);
        const matchTrack = (summary.scholar.scholarshipProgram || '').toLowerCase().includes(q);
        if (!matchScholar && !matchTrack) {
          const historyMatch = summary.history.some((item) => item.taskTitle.toLowerCase().includes(q));
          if (!historyMatch) return false;
        }
      }

      return true;
    });

  const handleOpenEdit = (scholar: User, currentEarned: number, currentRequired: number) => {
    setEditingScholarId(scholar.id);
    setEditValue({ earned: currentEarned, required: currentRequired });
  };

  const handleSaveEdit = (scholarId: string) => {
    setManualOverallHours((prev) => ({
      ...prev,
      [scholarId]: {
        earned: Number(editValue.earned),
        required: Number(editValue.required),
      },
    }));
    setEditingScholarId(null);
  };

  const handleExportCSV = () => {
    const headers = ['Scholar Name', 'Scholar ID', 'Scholarship Track', 'Rendered CS Hours'];
    const rows = scholarSummaries.map((summary) => [
      summary.scholar.name,
      summary.scholar.userId,
      summary.scholar.scholarshipProgram || 'Unspecified',
      `${summary.earned}/${summary.required}`,
    ]);

    const filename = `iSerbi_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(filename, headers, rows);
    showToast(`Exported ${scholarSummaries.length} scholar audit summaries.`, 'success');
  };

  const openHistory = (scholar: User) => {
    const history = data.applications
      .filter((app) => app.scholarId === scholar.id && app.status === 'hours_reflected')
      .map((app) => {
        const task = data.tasks.find((t) => t.id === app.taskId);
        return {
          taskTitle: task?.title || 'Community Service Task',
          verifiedAt: app.verifiedAt || app.appliedAt,
          hours: app.hoursCredited ?? task?.creditHours ?? 0,
          semester: task?.semester || 'Unspecified',
        };
      })
      .sort((a, b) => new Date(a.verifiedAt).getTime() - new Date(b.verifiedAt).getTime());

    setSelectedHistoryScholar({ scholar, history });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Community Service Master Record
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Audit-ready master summary for all scholars. Review completed service history, reconcile the rendered hours total, and export a downloadable audit report.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2 text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Download Audit Report</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Scholarship Program:</span>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="All">All Programs</option>
              {scholarshipPrograms.map((program) => (
                <option key={program} value={program}>{program}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Semester:</span>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="All">All Semesters</option>
              <option value="1st Semester 2026-2027">1st Semester 2026-2027</option>
              <option value="2nd Semester 2025-2026">2nd Semester 2025-2026</option>
              <option value="N/A">N/A</option>
              <option value="Multiple">Multiple</option>
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
            placeholder="Search scholar or track..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Scholar Name</th>
                <th className="py-3 px-4">Scholar ID</th>
                <th className="py-3 px-4">Scholarship Track</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Community Service History</th>
                <th className="py-3 px-4">Rendered CS Hours</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scholarSummaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No scholar records found.
                  </td>
                </tr>
              ) : (
                scholarSummaries.map(({ scholar, earned, required, history, semesterLabel }) => (
                  <tr key={scholar.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{scholar.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{scholar.userId}</td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {scholar.scholarshipProgram || 'Unspecified'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{semesterLabel}</td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => openHistory(scholar)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View History</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded tabular-nums">
                        {earned}/{required}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(scholar, earned, required)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editingScholarId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Manual Audit Update</div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Rendered CS Hours</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingScholarId(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Rendered</label>
                  <input
                    type="number"
                    min={0}
                    value={editValue.earned}
                    onChange={(e) => setEditValue((prev) => ({ ...prev, earned: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">Total Required</label>
                  <input
                    type="number"
                    min={0}
                    value={editValue.required}
                    onChange={(e) => setEditValue((prev) => ({ ...prev, required: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center font-mono font-bold text-slate-900">
                {editValue.earned}/{editValue.required}
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingScholarId(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdit(editingScholarId)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Save Hours
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedHistoryScholar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wide text-blue-700">Community Service History</div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedHistoryScholar.scholar.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryScholar(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {selectedHistoryScholar.history.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No completed tasks recorded for this scholar.</div>
              ) : (
                <div className="space-y-3">
                  {selectedHistoryScholar.history.map((item, index) => (
                    <div key={`${selectedHistoryScholar.scholar.id}-${index}`} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div>
                        <div className="font-bold text-slate-800">{item.taskTitle}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {item.semester || 'Unspecified'} · {formatDateTime(item.verifiedAt)}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded">
                        +{item.hours} hrs
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedHistoryScholar(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
