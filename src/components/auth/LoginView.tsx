import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PginSeal, InydoSeal } from '../common/Logos';
import { Eye, EyeOff, Lock, User, ArrowRight, Shield, Sparkles } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, navigate, switchUser } = useApp();

  const [userId, setUserId] = useState('2023-00123'); // Juan Dela Cruz default for smooth first-click demo
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const success = login(userId, password);
    if (!success) {
      setErrorMessage('Invalid credentials or unregistered account. Please check your User ID and password.');
    }
  };

  const handleQuickLogin = (demoUserId: string) => {
    switchUser(demoUserId);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Banner with Provincial Affiliation */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-4">
        <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
        </span>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Brand Mark: PGIN and INYDO seals side by side capped at 56-64px */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center justify-center gap-3">
              <PginSeal size={80} className="h-20 w-21" />
              <InydoSeal size={80} className="h-20 w-21" />
            </div>

            <h2 className="mt-4 text-4xl font-black text-slate-900 tracking-tight">
              iSerbi
            </h2>
            <p className="mt-1 text-xs text-slate-500 max-w-xs">
            </p>

        
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scholar / Staff User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 2023-00123 or COORD-001"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="text-xs">
                <button
                  type="button"
                  onClick={() => navigate('#forgot-password')}
                  className="text-[#1e6fd9] hover:text-[#1858ad] font-semibold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-[#d92d20] hover:bg-[#b42318] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <span>Login to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>


          {/* Registration Link */}
          <div className="mt-5 text-center">
            <span className="text-xs text-slate-500">New scholarship recipient? </span>
            <button
              type="button"
              onClick={() => navigate('#register')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
            >
              Register Account
            </button>
          </div>
        </div>

        {/* Support Notice Footer */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            Official INYDO Community Service Automation System
          </p>
          <p className="text-[11px] text-slate-400">
            For login assistance, contact{' '}
            <a
              href="mailto:support@inydo.ilocosnorte.gov.ph"
              className="text-[#1e6fd9] hover:underline"
            >
              support@inydo.ilocosnorte.gov.ph
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
