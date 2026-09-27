import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PginSeal, InydoSeal } from '../common/Logos';
import { ArrowLeft, CheckCircle2, KeyRound, Mail, ShieldAlert } from 'lucide-react';

export const ForgotPasswordView: React.FC = () => {
  const { navigate, resetUserPassword, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [identifier, setIdentifier] = useState('juan.delacruz@example.com');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) {
      setError('Please provide your registered Email or Scholar ID.');
      return;
    }
    setStep(2);
    showToast('6-digit OTP sent to registered email address.', 'info');
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.trim() !== '123456') {
      setError('Invalid OTP code. Please use the demo code: 123456');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    resetUserPassword('USR-0001', newPassword);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <button
              type="button"
              onClick={() => navigate('#login')}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </button>
            <div className="flex items-center gap-2">
              <PginSeal size={32} />
              <InydoSeal size={32} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Account Recovery
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reset your iSerbi community service portal password
          </p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address or Scholar ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. 2023-00123 or scholar@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg shadow-sm transition-colors"
              >
                Send 6-Digit OTP Code
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="mt-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>Demo Hint: Enter OTP code: 123456</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Simulated OTP code sent to your registered contact channel.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  6-Digit Verification OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-3 py-2 text-sm font-mono tracking-widest text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg shadow-sm transition-colors"
              >
                Reset Password & Save
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="mt-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Password Successfully Reset!
              </h3>
              <p className="text-xs text-slate-500">
                You can now log in to the iSerbi system with your updated credentials.
              </p>
              <button
                type="button"
                onClick={() => navigate('#login')}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] rounded-lg transition-colors"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
