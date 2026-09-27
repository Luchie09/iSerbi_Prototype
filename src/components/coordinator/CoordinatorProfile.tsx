import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateOnly } from '../../logic/core';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle2,
  Edit2,
  Check,
  X,
  ShieldCheck,
  CalendarCheck,
} from 'lucide-react';

export const CoordinatorProfile: React.FC = () => {
  const { currentUser, data, updateUserProfile, showToast } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [contact, setContact] = useState(currentUser?.contact || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [office, setOffice] = useState(currentUser?.office || '');

  if (!currentUser) return null;

  const handleSave = () => {
    updateUserProfile(currentUser.id, {
      contact: contact.trim(),
      email: email.trim(),
      office: office.trim(),
    });
    setIsEditing(false);
    showToast('Coordinator profile details updated.', 'success');
  };

  const handleCancel = () => {
    setContact(currentUser.contact || '');
    setEmail(currentUser.email || '');
    setOffice(currentUser.office || '');
    setIsEditing(false);
  };

  // Activity stats this semester
  const tasksPostedCount = data.tasks.filter((t) => t.createdBy === currentUser.id).length;
  const verificationsCompletedCount = data.applications.filter(
    (a) => a.verifiedBy === currentUser.id
  ).length;

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <img
              src={currentUser.profilePicture}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Scholarship Coordinator
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Staff ID: {currentUser.userId}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{currentUser.office || 'Provincial Youth Development Office'}</span>
              </div>
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
                <span>Edit Profile</span>
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

        {/* Details Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
              Official Email
            </span>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            ) : (
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{currentUser.email}</span>
              </div>
            )}
          </div>

          <div>
            <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
              Office Phone / Hotline
            </span>
            {isEditing ? (
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            ) : (
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{currentUser.contact}</span>
              </div>
            )}
          </div>

          <div>
            <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
              Designation / Unit
            </span>
            {isEditing ? (
              <input
                type="text"
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            ) : (
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="truncate">{currentUser.office || 'INYDO Unit'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Semestral Activity Summary (Section 8.6) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Semester Administrative Summary
        </h3>
        <p className="text-xs text-slate-500">
          Your auditing, publishing, and certification metrics for Academic Year 2026-2027.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Tasks Posted & Managed
              </span>
              <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                {tasksPostedCount} Opportunities
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                Verifications Completed
              </span>
              <span className="text-2xl font-black font-mono text-emerald-700 tabular-nums">
                {verificationsCompletedCount} Certifications
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
