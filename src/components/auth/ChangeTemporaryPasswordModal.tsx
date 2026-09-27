import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, ShieldAlert, Check, LogOut, Eye, EyeOff } from 'lucide-react';

export const ChangeTemporaryPasswordModal: React.FC = () => {
  const { currentUser, resetUserPassword, updateUserProfile, logout, showToast } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser || !currentUser.mustChangePassword) {
    return null;
  }

  const passwordStrength = (() => {
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    if (score <= 1) return { label: 'Weak', width: '25%', color: 'bg-red-500' };
    if (score === 2) return { label: 'Fair', width: '50%', color: 'bg-amber-500' };
    if (score === 3) return { label: 'Good', width: '75%', color: 'bg-emerald-500' };
    return { label: 'Strong', width: '100%', color: 'bg-emerald-600' };
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must include at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError('Password must include at least one number.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError('Password must include at least one special character.');
      return;
    }
    if (
      newPassword === 'Scholar123' ||
      newPassword === 'Admin123' ||
      newPassword === 'Coordinator123' ||
      newPassword === 'password123' ||
      newPassword === currentUser.userId
    ) {
      setError('New password cannot be the default temporary password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setSubmitting(true);
    resetUserPassword(currentUser.id, newPassword);
    updateUserProfile(currentUser.id, { mustChangePassword: false });
    showToast('Permanent password set successfully. Welcome to iSerbi!', 'success');
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-red-600 to-amber-600 p-6 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">First-Time Login Required</h2>
          <p className="text-xs text-red-100 mt-1 max-w-sm mx-auto leading-relaxed">
            Your account was provisioned with a default temporary password. For security compliance, please set your permanent password before proceeding.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Logged in as {currentUser.name}</span>
              <span className="block text-[11px] text-amber-700 mt-0.5 font-mono">User ID: {currentUser.userId}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Permanent Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-3 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {newPassword && (
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>Strength</span>
                  <span className="font-semibold">{passwordStrength.label}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${passwordStrength.color} transition-all`} style={{ width: passwordStrength.width }} />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="bg-slate-50 p-3 rounded-xl text-[11px] text-slate-600 space-y-1">
            <span className="font-semibold block text-slate-700 mb-0.5">Password requirements:</span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <span className={newPassword.length >= 8 ? 'text-emerald-600 font-semibold' : ''}>• 8+ characters</span>
              <span className={/[A-Z]/.test(newPassword) ? 'text-emerald-600 font-semibold' : ''}>• One uppercase</span>
              <span className={/[0-9]/.test(newPassword) ? 'text-emerald-600 font-semibold' : ''}>• One number</span>
              <span className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-600 font-semibold' : ''}>• One special char</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors"
            >
              Save Password & Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
