import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateOnly, calculateAge } from '../../logic/core';
import {
  User as UserIcon,
  Mail,
  Phone,
  Building,
  Calendar,
  Briefcase,
  Edit2,
  Check,
  X,
  MapPin,
  Camera,
} from 'lucide-react';

export const CoordinatorProfile: React.FC = () => {
  const { currentUser, updateUserProfile, showToast } = useApp();

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

  const nameParts = splitName(currentUser?.name || '');

  const [isEditing, setIsEditing] = useState(false);

  // Profile Photo
  const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture || '');

  // Personal Information
  const [firstName, setFirstName] = useState(currentUser?.firstName || nameParts.firstName || '');
  const [middleName, setMiddleName] = useState(currentUser?.middleName || nameParts.middleName || '');
  const [lastName, setLastName] = useState(currentUser?.lastName || nameParts.lastName || '');
  const [suffixName, setSuffixName] = useState(currentUser?.suffixName || nameParts.suffixName || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser?.dateOfBirth || '');
  const [sex, setSex] = useState<'Male' | 'Female' | ''>(currentUser?.sex || '');

  // Employment Information
  const [office, setOffice] = useState(currentUser?.office || '');
  const [jobPosition, setJobPosition] = useState(currentUser?.jobPosition || '');

  // Contact Information
  const [email, setEmail] = useState(currentUser?.email || '');
  const [contact, setContact] = useState(currentUser?.contact || '');
  const [municipality, setMunicipality] = useState(currentUser?.municipality || '');
  const [Baranggay, setBaranggay] = useState(currentUser?.Baranggay || '');

  if (!currentUser) return null;

  const currentAge = calculateAge(dateOfBirth) ?? currentUser.age;

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : currentUser.profilePicture;
      setProfilePicture(result);
      if (!isEditing) {
        updateUserProfile(currentUser.id, { profilePicture: result });
        showToast('Profile photo successfully updated.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const fullName = [firstName, middleName, lastName, suffixName]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const computedAge = calculateAge(dateOfBirth);

    updateUserProfile(currentUser.id, {
      name: fullName || currentUser.name,
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      suffixName: suffixName.trim(),
      dateOfBirth: dateOfBirth.trim() || undefined,
      age: computedAge ?? undefined,
      sex: (sex as 'Male' | 'Female') || undefined,
      office: office.trim(),
      jobPosition: jobPosition.trim(),
      email: email.trim(),
      contact: contact.trim(),
      municipality: municipality.trim(),
      Baranggay: Baranggay.trim(),
      profilePicture: profilePicture || currentUser.profilePicture,
    });

    setIsEditing(false);
    showToast('Coordinator profile details updated successfully.', 'success');
  };

  const handleCancel = () => {
    const parts = splitName(currentUser.name || '');
    setFirstName(currentUser.firstName || parts.firstName || '');
    setMiddleName(currentUser.middleName || parts.middleName || '');
    setLastName(currentUser.lastName || parts.lastName || '');
    setSuffixName(currentUser.suffixName || parts.suffixName || '');
    setDateOfBirth(currentUser.dateOfBirth || '');
    setSex(currentUser.sex || '');
    setOffice(currentUser.office || '');
    setJobPosition(currentUser.jobPosition || '');
    setEmail(currentUser.email || '');
    setContact(currentUser.contact || '');
    setMunicipality(currentUser.municipality || '');
    setBaranggay(currentUser.Baranggay || '');
    setProfilePicture(currentUser.profilePicture || '');
    setIsEditing(false);
  };

  const displayDOB = currentUser.dateOfBirth ? formatDateOnly(currentUser.dateOfBirth) : null;
  const displayAge = calculateAge(currentUser.dateOfBirth) ?? currentUser.age;

  return (
    <div className="space-y-6">
      {/* Header & Profile Photo Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Editable / Uploadable Profile Photo */}
            <div className="relative group">
              <img
                src={isEditing ? profilePicture || currentUser.profilePicture : currentUser.profilePicture}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm transition group-hover:brightness-95"
                referrerPolicy="no-referrer"
              />
              <label
                className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-red-600 text-white shadow-md transition hover:bg-red-700 hover:scale-110 active:scale-95"
                title="Upload / change profile picture"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileImageChange}
                />
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-blue-600" />
                  <span>Scholarship Coordinator</span>
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-1">
                Staff ID: {currentUser.userId}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.jobPosition || 'Youth Development Officer'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.office || 'Provincial Youth Development Office'}
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
                  <span>Save Changes</span>
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
      </div>

      {/* SECTION 1: Personal Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <UserIcon className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
            Personal Information
          </h3>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Que"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. James Bryan"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Middle Name
              </label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Suffix Name
              </label>
              <input
                type="text"
                value={suffixName}
                onChange={(e) => setSuffixName(e.target.value)}
                placeholder="e.g. Jr., III, Sr."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {currentAge !== null && (
                <p className="mt-1 text-[11px] text-blue-700 font-medium">
                  Auto-calculated Age: <strong className="font-bold">{currentAge} years old</strong>
                </p>
              )}
            </div>

            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Sex
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Last Name
              </span>
              <div className="font-medium text-slate-800 text-sm">
                {currentUser.lastName || nameParts.lastName || '—'}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                First Name
              </span>
              <div className="font-medium text-slate-800 text-sm">
                {currentUser.firstName || nameParts.firstName || currentUser.name}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Middle Name
              </span>
              <div className="font-medium text-slate-800 text-sm">
                {currentUser.middleName || nameParts.middleName || '—'}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Suffix Name
              </span>
              <div className="font-medium text-slate-800 text-sm">
                {currentUser.suffixName || nameParts.suffixName || 'None'}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Date of Birth & Age
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  {displayDOB ? displayDOB : 'Not provided'}
                  {displayAge !== null && (
                    <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {displayAge} yrs old
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Sex
              </span>
              <div className="text-slate-800 font-medium">
                {currentUser.sex || 'Not specified'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Employment Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
            Employment Information
          </h3>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Office / Department *
              </label>
              <input
                type="text"
                required
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                placeholder="e.g. INYDO — Youth Development Office"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Job Position / Designation *
              </label>
              <input
                type="text"
                required
                value={jobPosition}
                onChange={(e) => setJobPosition(e.target.value)}
                placeholder="e.g. Provincial Youth Development Officer IV"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Office / Department
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Building className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{currentUser.office || 'Provincial Youth Development Office'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Job Position / Designation
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{currentUser.jobPosition || 'Scholarship Coordinator'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Contact Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Phone className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
            Contact Information
          </h3>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coordinator@inydo.ilocosnorte.gov.ph"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Contact Number *
              </label>
              <input
                type="tel"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="0917-555-0101"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Municipality / City
              </label>
              <input
                type="text"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder="e.g. Laoag City"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-500 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Barangay
              </label>
              <input
                type="text"
                value={Baranggay}
                onChange={(e) => setBaranggay(e.target.value)}
                placeholder="e.g. Brgy. 1 San Lorenzo"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Email Address
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Contact Number
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{currentUser.contact || 'Not provided'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider mb-1">
                Address
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-medium">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {currentUser.municipality || currentUser.Baranggay
                    ? `${currentUser.municipality || ''}${
                        currentUser.municipality && currentUser.Baranggay ? ', ' : ''
                      }${currentUser.Baranggay || ''}`
                    : 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
