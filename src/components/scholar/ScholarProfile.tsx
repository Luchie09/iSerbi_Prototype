import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getCumulativeHours,
  computePrefixSumHistory,
  formatDateOnly,
} from '../../logic/core';
import {
  User as UserIcon,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Clock,
  Edit2,
  Check,
  X,
  Award,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const ScholarProfile: React.FC = () => {
  const { currentUser, data, updateUserProfile, showToast } = useApp();

  const splitName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const suffixName = parts[parts.length - 1]?.match(/^(Jr\.?|Sr\.?|II|III|IV|V)$/i)
      ? parts.pop() || ''
      : '';

    const lastName = parts.length > 1 ? parts.pop() || '' : '';
    const firstName = parts.shift() || '';
    const middleName = parts.join(' ');

    return { firstName, middleName, lastName, suffixName };
  };

  const initialNameParts = splitName(currentUser?.name || '');

  const [isEditing, setIsEditing] = useState(false);
  const [semesterFilter, setSemesterFilter] = useState<string>('All');

  const [firstName, setFirstName] = useState(currentUser?.firstName || initialNameParts.firstName || '');
  const [middleName, setMiddleName] = useState(currentUser?.middleName || initialNameParts.middleName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || initialNameParts.lastName || '');
  const [suffixName, setSuffixName] = useState(currentUser?.suffixName || initialNameParts.suffixName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [contact, setContact] = useState(currentUser?.contact || '');
  const [municipality, setMunicipality] = useState(currentUser?.municipality || '');
  const [Baranggay, setBaranggay] = useState(currentUser?.Baranggay || '');
  const [school, setSchool] = useState(currentUser?.school || '');
  const [collegeProgram, setCollegeProgram] = useState(
    currentUser?.collegeProgram || currentUser?.program || ''
  );
  const [yearLevel, setYearLevel] = useState(currentUser?.yearLevel || '');
  const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture || '');

  if (!currentUser) return null;

  const handleSave = () => {
    const fullName = [firstName, middleName, lastName, suffixName]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    updateUserProfile(currentUser.id, {
      name: fullName,
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      suffixName: suffixName.trim(),
      email: email.trim(),
      contact: contact.trim(),
      municipality: municipality.trim(),
      Baranggay: Baranggay.trim(),
      school: school.trim(),
      collegeProgram: collegeProgram.trim(),
      program: collegeProgram.trim() || currentUser.program || 'BS Computer Science',
      yearLevel: yearLevel.trim(),
      profilePicture: profilePicture || currentUser.profilePicture,
    });
    setIsEditing(false);
    showToast('Profile details successfully updated.', 'success');
  };

  const handleCancel = () => {
    const parts = splitName(currentUser.name || '');
    setFirstName(currentUser.firstName || parts.firstName || '');
    setMiddleName(currentUser.middleName || parts.middleName || '');
    setLastName(currentUser.lastName || parts.lastName || '');
    setSuffixName(currentUser.suffixName || parts.suffixName || '');
    setEmail(currentUser.email || '');
    setContact(currentUser.contact || '');
    setMunicipality(currentUser.municipality || '');
    setBaranggay(currentUser.Baranggay || '');
    setSchool(currentUser.school || '');
    setCollegeProgram(currentUser.collegeProgram || currentUser.program || '');
    setYearLevel(currentUser.yearLevel || '');
    setProfilePicture(currentUser.profilePicture || '');
    setIsEditing(false);
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please choose a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : currentUser.profilePicture;
      setProfilePicture(result);
    };
    reader.readAsDataURL(file);
  };

  // Prefix Sum history computation
  const { items: prefixSumHistory, totalCumulative } = computePrefixSumHistory(
    currentUser.id,
    data.applications,
    data.tasks,
    semesterFilter
  );

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={isEditing ? profilePicture || currentUser.profilePicture : currentUser.profilePicture}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                referrerPolicy="no-referrer"
              />
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-red-200 bg-red-600 text-white shadow-sm transition hover:bg-red-700">
                  <Edit2 className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </label>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-50 text-red-700 border border-red-200">
                  {currentUser.scholarshipStatus || 'Active Scholar'}
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Scholar ID: {currentUser.userId}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  {currentUser.program || 'Undergraduate Grant'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-600">{currentUser.yearLevel || 'Enrolled'}</span>
              </div>
              {currentUser.scholarshipProgram && (
                <div className="mt-2 text-[11px] text-slate-500">
                  Scholarship Track: <span className="font-semibold text-slate-700">{currentUser.scholarshipProgram}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Contact Details</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 pt-6 text-xs">
          {isEditing ? (
            <>
              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Suffix Name (if any)
                </label>
                <input
                  type="text"
                  value={suffixName}
                  onChange={(e) => setSuffixName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Jr., Sr., III"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Mobile Contact
                </label>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Municipality
                </label>
                <input
                  type="text"
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Baranggay
                </label>
                <input
                  type="text"
                  value={Baranggay}
                  onChange={(e) => setBaranggay(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  School
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  College Program
                </label>
                <input
                  type="text"
                  value={collegeProgram}
                  onChange={(e) => setCollegeProgram(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Year Level
                </label>
                <select
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="5th Year">5th Year</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Scholarship Program
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 font-medium">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{currentUser.scholarshipProgram || 'Engineering, Mathematics, and Technology'}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Full Name
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>{currentUser.name}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Official Email
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{currentUser.email}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Mobile Contact
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{currentUser.contact}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Address
                </span>
                <div className="text-slate-800 font-medium">
                  {currentUser.municipality || 'Not set'}
                  {currentUser.municipality && currentUser.Baranggay ? ', ' : ''}
                  {currentUser.Baranggay || ''}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  School
                </span>
                <div className="text-slate-800 font-medium">{currentUser.school || 'Not set'}</div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  College Program
                </span>
                <div className="text-slate-800 font-medium">
                  {currentUser.collegeProgram || currentUser.program || 'Not set'}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Year Level
                </span>
                <div className="text-slate-800 font-medium">{currentUser.yearLevel || 'Not set'}</div>
              </div>

              <div>
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                  Scholarship Program
                </span>
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span>{currentUser.scholarshipProgram || 'Engineering, Mathematics, and Technology'}</span>
                </div>
              </div>
            </>
          )}

          <div className="md:col-span-2 xl:col-span-4">
            <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
              Enrollment Date
            </span>
            <div className="flex items-center gap-2 text-slate-800 font-mono">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{formatDateOnly(currentUser.dateRegistered)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task History Section with Semester Filter and Prefix-Sum Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Community Service History & Prefix-Sum Progress
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Verified activities contributing to your mandatory 50-hour semestral service quota.
              Calculated using cumulative prefix sums: <code className="bg-slate-100 px-1 py-0.5 rounded text-red-700"></code>.
            </p>
          </div>

          {/* Semester Filter Dropdown (Section 7.5) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter Semester:</span>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="All">All Semesters</option>
              <option value="1st Semester 2026-2027">1st Semester 2026-2027</option>
              <option value="2nd Semester 2025-2026">2nd Semester 2025-2026</option>
            </select>
          </div>
        </div>

        {/* Total Cumulative Scorecard */}
        <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Cumulative Credited Service Hours
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                  {totalCumulative} Hours
                </span>
                <span className="text-xs text-slate-500">
                  (of 50 Hours Semestral Requirement)
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-100/70 border border-emerald-300 px-2.5 py-1 rounded-full">
              Status: {totalCumulative >= 50 ? 'Requirement Satisfied ✓' : `${50 - totalCumulative} Hours Remaining`}
            </span>
          </div>
        </div>

        {/* Table of Completed Tasks with Running Prefix Sum Column */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4">Completed Community Task</th>
                <th className="py-2.5 px-4">Verification Date</th>
                <th className="py-2.5 px-4 text-center">Earned (h)</th>
                <th className="py-2.5 px-4 text-right">Prefix Sum (Σh)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prefixSumHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No verified hours recorded for the selected semester.
                  </td>
                </tr>
              ) : (
                prefixSumHistory.map((item, index) => (
                  <tr key={item.applicationId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-slate-400 font-bold">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{item.taskTitle}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.taskId}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      {formatDateOnly(item.verifiedAt)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                      +{item.creditHours}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-red-50 text-red-700 border border-red-200 tabular-nums">
                        {item.cumulativeHours} hrs
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
