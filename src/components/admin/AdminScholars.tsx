import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficialScholarRecipient, ScholarshipStatus } from '../../types';
import { formatDateOnly, getCumulativeHours } from '../../logic/core';
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  GraduationCap,
  AlertTriangle,
  Edit2,
  X,
  Check,
  Upload,
} from 'lucide-react';

const parseRecipientCsv = (csv: string): OfficialScholarRecipient[] => {
  const source = csv.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"' && quoted && source[index + 1] === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && source[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }
  if (quoted) throw new Error('The CSV contains an unclosed quoted field.');
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length < 2) throw new Error('The CSV must contain a header and at least one recipient.');

  const headers = rows[0].map((header) => header.trim().toLocaleLowerCase());
  const nameIndex = headers.indexOf('scholar name');
  const trackIndex = headers.indexOf('scholarship track');
  if (nameIndex === -1 || trackIndex === -1) {
    throw new Error('CSV headers must include "Scholar Name" and "Scholarship Track".');
  }

  const recipients = rows.slice(1).map((values, index) => {
    const scholarName = (values[nameIndex] || '').trim();
    const scholarshipTrack = (values[trackIndex] || '').trim();
    if (!scholarName || !scholarshipTrack) {
      throw new Error(`CSV row ${index + 2} is missing a scholar name or scholarship track.`);
    }
    return { scholarName, scholarshipTrack };
  });

  const uniqueRecipients = new Map<string, OfficialScholarRecipient>();
  recipients.forEach((recipient) => {
    const key = `${recipient.scholarName.toLocaleLowerCase()}\u0000${recipient.scholarshipTrack.toLocaleLowerCase()}`;
    uniqueRecipients.set(key, recipient);
  });
  return Array.from(uniqueRecipients.values());
};

export const AdminScholars: React.FC = () => {
  const { data, updateScholarStatus, replaceOfficialScholarRecipients, showToast } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | ScholarshipStatus>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportingRoster, setIsImportingRoster] = useState(false);

  // Status editing modal / inline
  const [editingScholarId, setEditingScholarId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ScholarshipStatus>('Active');

  const scholars = data.users.filter((u) => u.role === 'scholar');

  // Programs list
  const programs = Array.from(
    new Set(scholars.map((s) => s.program).filter(Boolean))
  ) as string[];

  const filteredScholars = scholars.filter((scholar) => {
    if (statusFilter !== 'all' && scholar.scholarshipStatus !== statusFilter) {
      return false;
    }
    if (programFilter !== 'all' && scholar.program !== programFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = scholar.name.toLowerCase().includes(q);
      const matchId = scholar.userId.toLowerCase().includes(q);
      const matchEmail = scholar.email.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchEmail) return false;
    }

    return true;
  });

  const handleStartEdit = (id: string, current: ScholarshipStatus = 'Active') => {
    setEditingScholarId(id);
    setSelectedStatus(current);
  };

  const handleSaveStatus = (scholarId: string) => {
    updateScholarStatus(scholarId, selectedStatus);
    setEditingScholarId(null);
  };

  const handleRecipientCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImportingRoster(true);
    try {
      const recipients = parseRecipientCsv(await file.text());
      replaceOfficialScholarRecipients(recipients);
    } catch (uploadError) {
      const message = uploadError instanceof Error
        ? uploadError.message
        : 'Unable to import the recipient CSV.';
      showToast(message, 'error');
    } finally {
      setIsImportingRoster(false);
      event.target.value = '';
    }
  };

  const getStatusBadge = (status?: ScholarshipStatus) => {
    switch (status) {
      case 'Active':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Active</span>
          </span>
        );
      case 'Graduated':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
            <GraduationCap className="w-3 h-3" />
            <span>Graduated</span>
          </span>
        );
      case 'Withdrawn':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Withdrawn</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded">
            Enrolled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Provincial Scholar Master Registry
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Official administrative recipient roster. Distinct from the Coordinator's Service Records, this directory tracks grant statuses (Active, Graduated, Withdrawn) and enrollment tenure.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 self-start md:items-end md:self-auto">
          <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-700">
            {scholars.length} Total Scholars Registered
          </div>
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 ${isImportingRoster ? 'pointer-events-none opacity-60' : ''}`}>
            <Upload className="h-3.5 w-3.5" />
            {isImportingRoster ? 'Importing roster…' : 'Upload official recipient CSV'}
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleRecipientCsvUpload}
              disabled={isImportingRoster}
              className="sr-only"
            />
          </label>
          <p className="text-[11px] text-slate-500">
            {data.officialScholarRecipients.length} official recipient records · CSV columns: Scholar Name, Scholarship Track
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Graduated">Graduated</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Program:</span>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium max-w-[180px] truncate"
            >
              <option value="all">All Programs</option>
              {programs.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholar name or ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-xs"
          />
        </div>
      </div>

      {/* Registry Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Scholar Full Name</th>
                <th className="py-3 px-4">Scholar ID</th>
                <th className="py-3 px-4">Academic Degree Program</th>
                <th className="py-3 px-4">Year Level</th>
                <th className="py-3 px-4 text-center">Cumulative CS Hours</th>
                <th className="py-3 px-4">Scholarship Status</th>
                <th className="py-3 px-4">Enrolled Date</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScholars.map((scholar) => {
                const isEditingThis = editingScholarId === scholar.id;
                const hours = getCumulativeHours(
                  scholar.id,
                  data.applications,
                  data.tasks
                );

                return (
                  <tr key={scholar.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={scholar.profilePicture}
                          alt={scholar.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                            {scholar.name}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">
                            {scholar.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {scholar.userId}
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {scholar.program || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {scholar.yearLevel || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs tabular-nums">
                        {hours} hrs
                      </span>
                    </td>

                    {/* Status with Inline Editing */}
                    <td className="py-3.5 px-4">
                      {isEditingThis ? (
                        <select
                          value={selectedStatus}
                          onChange={(e) =>
                            setSelectedStatus(e.target.value as ScholarshipStatus)
                          }
                          className="px-2 py-1 text-xs border border-slate-300 rounded bg-white font-medium"
                        >
                          <option value="Active">Active</option>
                          <option value="Graduated">Graduated</option>
                          <option value="Withdrawn">Withdrawn</option>
                        </select>
                      ) : (
                        getStatusBadge(scholar.scholarshipStatus)
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-500 tabular-nums">
                      {formatDateOnly(scholar.dateRegistered)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isEditingThis ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveStatus(scholar.id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                            title="Save status change"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingScholarId(null)}
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
                            handleStartEdit(scholar.id, scholar.scholarshipStatus)
                          }
                          className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3 text-slate-400" />
                          <span>Status</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
