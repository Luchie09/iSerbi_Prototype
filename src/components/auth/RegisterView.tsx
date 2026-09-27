import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SCHOLARSHIP_PROGRAMS } from '../../types';
import { PginSeal, InydoSeal } from '../common/Logos';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

type RegistrationForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  suffixName: string;
  dateOfBirth: string;
  sex: '' | 'Male' | 'Female';
  scholarshipProgram: string;
  collegeProgram: string;
  school: string;
  yearLevel: string;
  email: string;
  contact: string;
  municipality: string;
  barangay: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
};

const initialForm: RegistrationForm = {
  firstName: '',
  middleName: '',
  lastName: '',
  suffixName: '',
  dateOfBirth: '',
  sex: '',
  scholarshipProgram: '',
  collegeProgram: '',
  school: '',
  yearLevel: '',
  email: '',
  contact: '',
  municipality: '',
  barangay: '',
  password: '',
  confirmPassword: '',
  consent: false,
};

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100';
const labelClass = 'mb-1 block text-xs font-semibold text-slate-700';

const calculateAge = (dateOfBirth: string) => {
  if (!dateOfBirth) return null;
  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const birthdayNotReached =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate());
  if (birthdayNotReached) age -= 1;
  return age >= 0 ? age : null;
};

export const RegisterView: React.FC = () => {
  const { navigate, registerScholar } = useApp();
  const [formData, setFormData] = useState<RegistrationForm>(initialForm);
  const [error, setError] = useState('');
  const [createdUserId, setCreatedUserId] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (event.target as HTMLInputElement).checked,
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password) ||
      !/[^A-Za-z0-9]/.test(formData.password)) {
      setError('Password must include an uppercase letter, a number, and a special character.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }
    if (!formData.consent) {
      setError('Please provide consent to the Terms and Conditions and Data Privacy notice.');
      return;
    }

    const name = [
      formData.firstName,
      formData.middleName,
      formData.lastName,
      formData.suffixName,
    ].filter((part) => part.trim()).join(' ').trim();

    const result = registerScholar({
      name,
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim(),
      lastName: formData.lastName.trim(),
      suffixName: formData.suffixName.trim(),
      dateOfBirth: formData.dateOfBirth,
      sex: formData.sex as 'Male' | 'Female',
      email: formData.email.trim(),
      contact: formData.contact.trim(),
      scholarshipProgram: formData.scholarshipProgram,
      program: formData.collegeProgram.trim(),
      collegeProgram: formData.collegeProgram.trim(),
      school: formData.school.trim(),
      yearLevel: formData.yearLevel,
      municipality: formData.municipality.trim(),
      Baranggay: formData.barangay.trim(),
      office: null,
      password: formData.password,
      profilePicture:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    if (!result.success) {
      setError(
        result.reason === 'exists'
          ? 'An account already exists for this official recipient.'
          : 'Name and scholarship track not found on the official list.'
      );
      return;
    }

    setCreatedUserId(result.userId);
  };

  const age = calculateAge(formData.dateOfBirth);

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-7">
            <button
              type="button"
              onClick={() => navigate('#login')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
            <div className="flex items-center gap-2">
              <PginSeal size={36} />
              <InydoSeal size={36} />
            </div>
          </div>

          {!createdUserId ? (
            <div className="p-5 sm:p-7">
              <header>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Scholar Account Registration
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Enter your details as recorded on the official scholarship recipient list.
                </p>
              </header>

              {error && (
                <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <fieldset className="space-y-3">
                  <legend className="mb-3 w-full border-b border-slate-200 pb-2 text-sm font-bold text-slate-900">
                    Personal Information
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <label className={labelClass} htmlFor="lastName">Last Name *</label>
                      <input id="lastName" className={inputClass} name="lastName" value={formData.lastName} onChange={handleChange} required autoComplete="family-name" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="firstName">First Name *</label>
                      <input id="firstName" className={inputClass} name="firstName" value={formData.firstName} onChange={handleChange} required autoComplete="given-name" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="middleName">Middle Name</label>
                      <input id="middleName" className={inputClass} name="middleName" value={formData.middleName} onChange={handleChange} autoComplete="additional-name" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="suffixName">Suffix Name</label>
                      <input id="suffixName" className={inputClass} name="suffixName" value={formData.suffixName} onChange={handleChange} placeholder="Jr., Sr., III" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className={labelClass} htmlFor="dateOfBirth">Date of Birth *</label>
                      <input id="dateOfBirth" type="date" max={new Date().toISOString().slice(0, 10)} className={inputClass} name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="age">Age</label>
                      <input id="age" className={`${inputClass} bg-slate-50`} value={age === null ? '' : `${age} years`} readOnly aria-label="Calculated age" placeholder="Calculated from date of birth" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="sex">Sex *</label>
                      <select id="sex" className={inputClass} name="sex" value={formData.sex} onChange={handleChange} required>
                        <option value="" disabled>Select sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="mb-3 w-full border-b border-slate-200 pb-2 text-sm font-bold text-slate-900">
                    Academic and Scholarship Information
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="scholarshipProgram">Scholarship Program *</label>
                      <select id="scholarshipProgram" className={inputClass} name="scholarshipProgram" value={formData.scholarshipProgram} onChange={handleChange} required>
                        <option value="" disabled>Select scholarship track</option>
                        {SCHOLARSHIP_PROGRAMS.map((program) => <option key={program} value={program}>{program}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="collegeProgram">Course *</label>
                      <input id="collegeProgram" className={inputClass} name="collegeProgram" value={formData.collegeProgram} onChange={handleChange} required placeholder="e.g. BS Computer Science" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="school">School / University Name *</label>
                      <input id="school" className={inputClass} name="school" value={formData.school} onChange={handleChange} required />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="yearLevel">Year Level *</label>
                      <select id="yearLevel" className={inputClass} name="yearLevel" value={formData.yearLevel} onChange={handleChange} required>
                        <option value="" disabled>Select year level</option>
                        {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year', 'Graduate'].map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="mb-3 w-full border-b border-slate-200 pb-2 text-sm font-bold text-slate-900">
                    Contact Information
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="email">Email *</label>
                      <input id="email" type="email" className={inputClass} name="email" value={formData.email} onChange={handleChange} required autoComplete="email" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="contact">Contact Number *</label>
                      <input id="contact" type="tel" className={inputClass} name="contact" value={formData.contact} onChange={handleChange} required autoComplete="tel" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="municipality">Municipality *</label>
                      <input id="municipality" className={inputClass} name="municipality" value={formData.municipality} onChange={handleChange} required autoComplete="address-level2" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="barangay">Barangay *</label>
                      <input id="barangay" className={inputClass} name="barangay" value={formData.barangay} onChange={handleChange} required />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="space-y-3">
                  <legend className="mb-3 w-full border-b border-slate-200 pb-2 text-sm font-bold text-slate-900">
                    Account Credentials
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="password">Password *</label>
                      <input id="password" type="password" className={inputClass} name="password" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="confirmPassword">Confirm Password *</label>
                      <input id="confirmPassword" type="password" className={inputClass} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">Use at least 8 characters, including an uppercase letter, a number, and a special character.</p>
                </fieldset>

                <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-700">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    required
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>
                    I have read and agree to the Terms and Conditions and consent to the collection and processing of my personal information for scholarship and community-service administration.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#d92d20] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#b42318]"
                >
                  Create Scholar Account
                </button>
              </form>
            </div>
          ) : (
            <div className="px-6 py-12 text-center sm:px-10">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h2 className="mt-4 text-xl font-bold text-slate-900">Account Created</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your details matched the official scholarship recipient list. You may now log in using the password you created.
              </p>
              <div className="mx-auto mt-5 max-w-sm rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Generated User ID</p>
                <p className="mt-1 font-mono text-lg font-bold text-slate-900">{createdUserId}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('#login')}
                className="mt-6 rounded-lg bg-[#d92d20] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#b42318]"
              >
                Continue to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
