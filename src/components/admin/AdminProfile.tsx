import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateOnly } from '../../logic/core';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Calendar,
  Shield,
  Edit2,
  Check,
  X,
  Server,
  Database,
} from 'lucide-react';

export const AdminProfile: React.FC = () => {
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
    showToast('Administrator profile details updated.', 'success');
  };

  const handleCancel = () => {
    setContact(currentUser.contact || '');
    setEmail(currentUser.email || '');
    setOffice(currentUser.office || '');
    setIsEditing(false);
  };

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
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-purple-50 text-purple-700 border border-purple-200">
                  System Administrator
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">
                Staff ID: {currentUser.userId}
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <Building className="w-4 h-4 text-slate-400" />
                <span className="font-medium">
                  {currentUser.office || 'PGIN — Management Information Systems Office (MISO)'}
                </span>
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
              Contact Number
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
              Office / Department
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
                <span className="truncate">{currentUser.office || 'PGIN MISO'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Infrastructure Telemetry Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          System Administration Scope
        </h3>
        <p className="text-xs text-slate-500">
          Security clearance and operational authority over iSerbi provincial node.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Server className="w-4 h-4 text-purple-600" />
              <span>Full Role-Based Access Control (RBAC)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authority to approve pending self-registered scholars, grant coordinator access, deactivate accounts, and override credentials.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Master Recipient Registry Authority</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Maintains the provincial master record of active, graduated, and withdrawn scholarship recipients distinct from operational service logs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
