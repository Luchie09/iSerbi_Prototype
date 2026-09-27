import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { OfficialScholarRecipient, SCHOLARSHIP_PROGRAMS, User } from '../../types';
import { formatDateOnly } from '../../logic/core';
import {
  Award,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  X,
  Check,
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

const CURRENT_SEMESTER_LABEL = '1st Semester AY 2026-2027';

export const AdminScholars: React.FC = () => {
  const { data, replaceOfficialScholarRecipients, updateUserProfile, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('all');

  // Filter with two options: 'registered' vs 'pending_registration' (plus 'all' view)
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'pending_registration'>('all');

  // CSV Modal State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvRawText, setCsvRawText] = useState('');
  const [csvError, setCsvError] = useState('');
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Single Recipient Modal State
  const [isAddRecipientModalOpen, setIsAddRecipientModalOpen] = useState(false);
  const [addRecipientForm, setAddRecipientForm] = useState({
    scholarName: '',
    scholarshipTrack: SCHOLARSHIP_PROGRAMS[0] as string,
  });

  // Edit Recipient State
  const [editingTarget, setEditingTarget] = useState<{
    originalRecipient: OfficialScholarRecipient;
    originalIndex: number;
    isRegistered: boolean;
    matchedScholar?: User;
    formName: string;
    formTrack: string;
    syncRegisteredProfile: boolean;
    confirmedRegisteredEdit: boolean;
  } | null>(null);

  // Delete Recipient Confirmation State
  const [deletingTarget, setDeletingTarget] = useState<{
    recipient: OfficialScholarRecipient;
    index: number;
    isRegistered: boolean;
    matchedScholar?: User;
  } | null>(null);

  // Normalize string for matching
  const normalize = (val: string) => val.trim().toLowerCase();

  // Scholars map
  const scholarsMap = new Map<string, User>();
  data.users
    .filter((u) => u.role === 'scholar')
    .forEach((scholar) => {
      scholarsMap.set(normalize(scholar.name), scholar);
    });

  // Calculate metrics for the current semester
  const totalRecipients = data.officialScholarRecipients.length;
  const registeredCount = data.officialScholarRecipients.filter((r) =>
    scholarsMap.has(normalize(r.scholarName))
  ).length;
  const pendingRegistrationCount = totalRecipients - registeredCount;
  const registrationRate =
    totalRecipients > 0 ? Math.round((registeredCount / totalRecipients) * 100) : 0;

  // Filtered list with original indices
  const recipientsWithIndices = data.officialScholarRecipients.map((recipient, originalIndex) => ({
    recipient,
    originalIndex,
  }));

  const filteredRecipientsWithIndices = recipientsWithIndices.filter(({ recipient }) => {
    const isRegistered = scholarsMap.has(normalize(recipient.scholarName));

    if (statusFilter === 'registered' && !isRegistered) return false;
    if (statusFilter === 'pending_registration' && isRegistered) return false;

    if (trackFilter !== 'all' && recipient.scholarshipTrack !== trackFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = recipient.scholarName.toLowerCase().includes(q);
      const matchTrack = recipient.scholarshipTrack.toLowerCase().includes(q);
      if (!matchName && !matchTrack) return false;
    }

    return true;
  });

  // Add Single Recipient Submit
  const handleAddRecipientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = addRecipientForm.scholarName.trim();
    const track = addRecipientForm.scholarshipTrack.trim();

    if (!name) {
      showToast('Please provide the scholar recipient name.', 'error');
      return;
    }

    const exists = data.officialScholarRecipients.some(
      (r) => normalize(r.scholarName) === normalize(name) && normalize(r.scholarshipTrack) === normalize(track)
    );
    if (exists) {
      showToast(`Recipient "${name}" under track "${track}" is already on this semester's roster.`, 'error');
      return;
    }

    replaceOfficialScholarRecipients([
      ...data.officialScholarRecipients,
      { scholarName: name, scholarshipTrack: track },
    ]);

    setIsAddRecipientModalOpen(false);
    setAddRecipientForm({ scholarName: '', scholarshipTrack: SCHOLARSHIP_PROGRAMS[0] });
    showToast(
      `Added "${name}" to current semester recipient list. Now eligible for automated registration matching (Pending Registration).`,
      'success'
    );
  };

  // Open Edit Recipient Modal
  const handleOpenEditRecipient = (recipient: OfficialScholarRecipient, originalIndex: number) => {
    const isRegistered = scholarsMap.has(normalize(recipient.scholarName));
    const matchedScholar = scholarsMap.get(normalize(recipient.scholarName));

    setEditingTarget({
      originalRecipient: recipient,
      originalIndex,
      isRegistered,
      matchedScholar,
      formName: recipient.scholarName,
      formTrack: recipient.scholarshipTrack,
      syncRegisteredProfile: false,
      confirmedRegisteredEdit: false,
    });
  };

  // Save Edit Recipient
  const handleSaveEditRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    const updatedName = editingTarget.formName.trim();
    const updatedTrack = editingTarget.formTrack.trim();
    if (!updatedName) {
      showToast('Scholar name cannot be empty.', 'error');
      return;
    }

    // If already registered and name/track changed without confirmation check
    if (
      editingTarget.isRegistered &&
      (updatedName !== editingTarget.originalRecipient.scholarName ||
        updatedTrack !== editingTarget.originalRecipient.scholarshipTrack) &&
      !editingTarget.confirmedRegisteredEdit
    ) {
      setEditingTarget({
        ...editingTarget,
        confirmedRegisteredEdit: true,
      });
      return;
    }

    const updatedRecipients = data.officialScholarRecipients.map((r, i) =>
      i === editingTarget.originalIndex
        ? { scholarName: updatedName, scholarshipTrack: updatedTrack }
        : r
    );
    replaceOfficialScholarRecipients(updatedRecipients);

    if (
      editingTarget.isRegistered &&
      editingTarget.syncRegisteredProfile &&
      editingTarget.matchedScholar
    ) {
      updateUserProfile(editingTarget.matchedScholar.id, {
        name: updatedName,
        scholarshipProgram: updatedTrack,
      });
      showToast(
        `Recipient updated and synced with User Management account for "${updatedName}".`,
        'success'
      );
    } else {
      showToast(`Recipient entry updated to "${updatedName}".`, 'success');
    }

    setEditingTarget(null);
  };

  // Open Delete Recipient Confirmation
  const handleOpenDeleteRecipient = (recipient: OfficialScholarRecipient, originalIndex: number) => {
    const isRegistered = scholarsMap.has(normalize(recipient.scholarName));
    const matchedScholar = scholarsMap.get(normalize(recipient.scholarName));

    setDeletingTarget({
      recipient,
      index: originalIndex,
      isRegistered,
      matchedScholar,
    });
  };

  // Confirm Delete Recipient (Only removes from Scholar Recipients, does NOT delete or deactivate User Account)
  const handleConfirmDelete = () => {
    if (!deletingTarget) return;

    const targetName = deletingTarget.recipient.scholarName;
    const updatedRecipients = data.officialScholarRecipients.filter(
      (_, i) => i !== deletingTarget.index
    );
    replaceOfficialScholarRecipients(updatedRecipients);

    if (deletingTarget.isRegistered && deletingTarget.matchedScholar) {
      showToast(
        `Removed "${targetName}" from current semester list. Their User Account (${deletingTarget.matchedScholar.userId}) remains fully active under the 5-year retention rule.`,
        'info'
      );
    } else {
      showToast(`Removed "${targetName}" from current semester recipient list.`, 'info');
    }

    setDeletingTarget(null);
  };

  // CSV File input upload
  const handleCsvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        try {
          const parsed = parseRecipientCsv(content);
          if (importMode === 'replace') {
            replaceOfficialScholarRecipients(parsed);
          } else {
            const existingKeys = new Set(
              data.officialScholarRecipients.map(
                (r) => `${normalize(r.scholarName)}\u0000${normalize(r.scholarshipTrack)}`
              )
            );
            const combined = [...data.officialScholarRecipients];
            parsed.forEach((p) => {
              const k = `${normalize(p.scholarName)}\u0000${normalize(p.scholarshipTrack)}`;
              if (!existingKeys.has(k)) {
                combined.push(p);
                existingKeys.add(k);
              }
            });
            replaceOfficialScholarRecipients(combined);
          }

          showToast(
            `Successfully processed CSV: ${parsed.length} recipients for ${CURRENT_SEMESTER_LABEL}.`,
            'success'
          );
          setIsCsvModalOpen(false);
          setCsvRawText('');
          setCsvError('');
        } catch (err: any) {
          setCsvError(err.message || 'Failed to parse CSV file.');
        }
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // CSV Paste submit
  const handleCsvRawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCsvError('');
    if (!csvRawText.trim()) {
      setCsvError('Please paste valid CSV content.');
      return;
    }

    try {
      const parsed = parseRecipientCsv(csvRawText);
      if (importMode === 'replace') {
        replaceOfficialScholarRecipients(parsed);
      } else {
        const existingKeys = new Set(
          data.officialScholarRecipients.map(
            (r) => `${normalize(r.scholarName)}\u0000${normalize(r.scholarshipTrack)}`
          )
        );
        const combined = [...data.officialScholarRecipients];
        parsed.forEach((p) => {
          const k = `${normalize(p.scholarName)}\u0000${normalize(p.scholarshipTrack)}`;
          if (!existingKeys.has(k)) {
            combined.push(p);
            existingKeys.add(k);
          }
        });
        replaceOfficialScholarRecipients(combined);
      }

      showToast(
        `Successfully processed CSV: ${parsed.length} recipients for ${CURRENT_SEMESTER_LABEL}.`,
        'success'
      );
      setIsCsvModalOpen(false);
      setCsvRawText('');
    } catch (err: any) {
      setCsvError(err.message || 'Failed to parse CSV content.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (Scoped to Current Semester Only) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-red-600" />
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Scholar Recipients
              </h2>
            </div>
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-red-600" />
              <span>Current Semester: {CURRENT_SEMESTER_LABEL}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Official masterlist of eligible provincial scholarship recipients uploaded for the current semester ({CURRENT_SEMESTER_LABEL}). Cross-referenced during scholar self-registration for automated approval. Registered scholars remain listed automatically.
          </p>
        </div>

        {/* List-level actions: Add Recipient & Upload CSV */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              setAddRecipientForm({ scholarName: '', scholarshipTrack: SCHOLARSHIP_PROGRAMS[0] });
              setIsAddRecipientModalOpen(true);
            }}
            className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>+ Add Recipient</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCsvError('');
              setIsCsvModalOpen(true);
            }}
            className="px-4 py-2.5 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Recipient CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Total Semester Recipients
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{totalRecipients}</span>
            <span className="text-xs text-slate-400">On official roster</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Validated grantees for {CURRENT_SEMESTER_LABEL}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Registered Scholars
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-600">
              {registeredCount}
            </span>
            <span className="text-xs text-slate-400">({registrationRate}%)</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Completed account registration & stay listed
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            Pending Registration
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-600">
              {pendingRegistrationCount}
            </span>
            <span className="text-xs text-slate-400">Grantees</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            On CSV roster who haven't registered an account yet
          </p>
        </div>
      </div>

      {/* Data Retention Note Banner */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">
              Provincial Data Retention Policy (5-Year Account Retention)
            </span>
            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
              User Management Policy
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            If a scholar is later removed from the current semester's recipient list (e.g., due to graduation or discontinued scholarship), their existing User Account is not deleted or deactivated immediately. It remains active in <strong>User Management</strong> and is only automatically deactivated or purged <strong>5 years</strong> after the date the account was registered to the system, regardless of ongoing recipient status.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar with specific options: Registered & Pending Registration */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary Filter with the Two Requested Options */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Filter Status:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({totalRecipients})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('registered')}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'registered'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Registered ({registeredCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending_registration')}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5 ${
                  statusFilter === 'pending_registration'
                    ? 'bg-amber-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pending Registration ({pendingRegistrationCount})</span>
              </button>
            </div>
          </div>

          {/* Track Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Track:</span>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-xs outline-none focus:border-red-500 max-w-[220px]"
            >
              <option value="all">All Scholarship Tracks</option>
              {SCHOLARSHIP_PROGRAMS.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search current semester recipients..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white text-xs"
          />
        </div>
      </div>

      {/* Recipients Table (With Actions column containing Edit and Remove) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Scholar Name</th>
                <th className="py-3 px-4">Scholarship Track</th>
                <th className="py-3 px-4">Registration Status</th>
                <th className="py-3 px-4">Matched User Account</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecipientsWithIndices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-xs">
                      No recipients found for {CURRENT_SEMESTER_LABEL}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery || statusFilter !== 'all' || trackFilter !== 'all'
                        ? 'Try clearing or changing your filters.'
                        : 'Click "+ Add Recipient" or "Upload Recipient CSV" to populate eligible grantees.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecipientsWithIndices.map(({ recipient, originalIndex }) => {
                  const matchedUser = scholarsMap.get(normalize(recipient.scholarName));
                  const isRegistered = Boolean(matchedUser);

                  return (
                    <tr
                      key={`${recipient.scholarName}-${originalIndex}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Scholar Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">
                            {recipient.scholarName}
                          </span>
                        </div>
                      </td>

                      {/* Scholarship Track */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {recipient.scholarshipTrack}
                      </td>

                      {/* Registration Status */}
                      <td className="py-3.5 px-4">
                        {isRegistered ? (
                          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Registered</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending Registration</span>
                          </span>
                        )}
                      </td>

                      {/* Matched User Account Info (Registered scholars remain automatically listed) */}
                      <td className="py-3.5 px-4">
                        {isRegistered && matchedUser ? (
                          <div className="flex items-center gap-2.5">
                            <img
                              src={matchedUser.profilePicture}
                              alt={matchedUser.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono text-slate-900 text-xs">
                                  {matchedUser.userId}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                  Active Account
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                <span>{matchedUser.email}</span>
                                <span className="mx-1">·</span>
                                <span>Registered {formatDateOnly(matchedUser.dateRegistered)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>Pending scholar signup on portal</span>
                          </div>
                        )}
                      </td>

                      {/* Actions Column: Edit & Remove */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditRecipient(recipient, originalIndex)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit recipient details (e.g. fix typos without re-uploading CSV)"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDeleteRecipient(recipient, originalIndex)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove recipient entry from current semester list"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 1. ADD SINGLE RECIPIENT MODAL                                    */}
      {/* ================================================================= */}
      {isAddRecipientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Add Scholar Recipient
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Add a legitimate recipient to {CURRENT_SEMESTER_LABEL}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRecipientModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecipientSubmit} className="p-5 space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Adding this recipient manually makes them immediately eligible for the automated CSV-matching check when they register. Their status will start as <strong>Pending Registration</strong>.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Scholar Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={addRecipientForm.scholarName}
                  onChange={(e) =>
                    setAddRecipientForm({ ...addRecipientForm, scholarName: e.target.value })
                  }
                  placeholder="e.g. Juan Dela Cruz"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Must match the name the scholar will enter upon self-registration.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Scholarship Track *
                </label>
                <select
                  value={addRecipientForm.scholarshipTrack}
                  onChange={(e) =>
                    setAddRecipientForm({
                      ...addRecipientForm,
                      scholarshipTrack: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                >
                  {SCHOLARSHIP_PROGRAMS.map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddRecipientModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors"
                >
                  Add to Semester Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. EDIT RECIPIENT MODAL (With Confirmation for Registered status) */}
      {/* ================================================================= */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Recipient Record
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Correct typographical or track errors without re-uploading the entire CSV.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRecipient} className="p-5 space-y-4 text-xs">
              {/* If recipient has already registered, prompt warning & confirmation */}
              {editingTarget.isRegistered && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-xs">
                      Registered Scholar Notice
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-800">
                    This recipient has already registered as <strong>{editingTarget.matchedScholar?.name}</strong> (User ID: <span className="font-mono font-bold">{editingTarget.matchedScholar?.userId}</span>). Modifying this entry may cause a discrepancy with their existing profile in User Management.
                  </p>
                  <label className="flex items-start gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingTarget.syncRegisteredProfile}
                      onChange={(e) =>
                        setEditingTarget({
                          ...editingTarget,
                          syncRegisteredProfile: e.target.checked,
                        })
                      }
                      className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                    />
                    <span className="text-[11px] font-semibold text-amber-900">
                      Also update the registered scholar profile name & track in User Management
                    </span>
                  </label>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Scholar Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingTarget.formName}
                  onChange={(e) =>
                    setEditingTarget({ ...editingTarget, formName: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Scholarship Track *
                </label>
                <select
                  value={editingTarget.formTrack}
                  onChange={(e) =>
                    setEditingTarget({ ...editingTarget, formTrack: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-medium"
                >
                  {SCHOLARSHIP_PROGRAMS.map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
                </select>
              </div>

              {/* If registered and trying to save without acknowledging confirmation */}
              {editingTarget.isRegistered && editingTarget.confirmedRegisteredEdit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800">
                  <span className="font-bold block mb-1">Confirm Recipient Edit:</span>
                  Please click "Save Changes" again to confirm updating this registered recipient record.
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. REMOVE RECIPIENT CONFIRMATION MODAL                            */}
      {/* ================================================================= */}
      {deletingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-red-50">
              <div className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Remove Recipient Entry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingTarget(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-700 leading-relaxed">
                Are you sure you want to remove <strong>{deletingTarget.recipient.scholarName}</strong> ({deletingTarget.recipient.scholarshipTrack}) from the current semester's recipient list?
              </p>

              {/* Crucial Data Retention Note Confirmation */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-600 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-slate-900">
                    Account Protection Guarantee
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Removing this entry <strong>only affects the current semester's Scholar Recipients roster</strong>. It will <strong>NOT delete or deactivate</strong> any existing User Account in User Management. Accounts remain active under the 5-year provincial retention policy.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Keep Recipient
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
                >
                  Confirm Remove Entry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. CSV Upload / Import Modal                                      */}
      {/* ================================================================= */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-red-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Upload Recipient CSV ({CURRENT_SEMESTER_LABEL})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Upload the official roster of eligible grantees for the current semester.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCsvModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-red-50/60 border border-red-200 rounded-xl p-3 text-red-900">
                <span className="font-bold block mb-1">CSV Format Requirements:</span>
                <p className="text-[11px] text-red-800 leading-relaxed">
                  Your CSV file must include columns for <strong className="font-mono">Scholar Name</strong> and <strong className="font-mono">Scholarship Track</strong>.
                  Registration approval will match against these records for the active semester.
                </p>
              </div>

              {csvError && (
                <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded-xl font-medium">
                  {csvError}
                </div>
              )}

              {/* Mode Selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Import Behavior for Current Semester
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setImportMode('replace')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      importMode === 'replace'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Replace Semester Masterlist
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMode('append')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                      importMode === 'append'
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Append to Existing List
                  </button>
                </div>
              </div>

              {/* File Upload Box */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select CSV File
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv,text/csv"
                  onChange={handleCsvFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-300 hover:border-red-400 rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-50 hover:bg-red-50/30 transition-all text-slate-600 cursor-pointer"
                >
                  <Upload className="w-6 h-6 text-red-600" />
                  <span className="font-bold text-xs text-slate-800">
                    Click to browse and choose a CSV file
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Supports .csv exports with Scholar Name and Scholarship Track
                  </span>
                </button>
              </div>

              {/* Or Paste Raw Text */}
              <form onSubmit={handleCsvRawSubmit} className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block font-semibold text-slate-700">
                  Or Paste Raw CSV Text Below:
                </label>
                <textarea
                  rows={5}
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  placeholder={`Scholar Name,Scholarship Track\nJuan Dela Cruz,Engineering, Mathematics, and Technology\nMaria Clara Santos,Health and Science`}
                  className="w-full font-mono text-[11px] p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCsvModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-xl shadow-xs transition-colors"
                  >
                    Process CSV Text
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
