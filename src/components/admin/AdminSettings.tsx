import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

const sections = ['Preferences', 'Notification Settings', 'Cookies', 'Terms and Privacy'] as const;
type GeneralSection = (typeof sections)[number];
type SettingsTab = 'General' | 'Change Password' | 'About System';

const SUPPORT_EMAIL = 'support@inydo.ilocosnorte.gov.ph';

const readPreference = (key: string, fallback: string) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch (error) {
    console.error(`Unable to read ${key} preference`, error);
    return fallback;
  }
};

const writePreference = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Unable to save ${key} preference`, error);
  }
};

const Toggle: React.FC<{
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}> = ({ checked, label, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
      checked ? 'bg-[#b42318]' : 'bg-slate-300'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="border-b border-slate-200 py-6 last:border-b-0 last:pb-0 first:pt-0">
    <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
    <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div>
  </section>
);

export const AdminSettings: React.FC = () => {
  const { currentUser, resetUserPassword, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>('General');
  const [activeSection, setActiveSection] = useState<GeneralSection>('Preferences');
  const [theme, setTheme] = useState(() => readPreference('iserbi_theme', 'light'));
  const [systemNotifications, setSystemNotifications] = useState(
    () => readPreference('iserbi_system_notifications', 'enabled') === 'enabled'
  );
  const [cookieChoice, setCookieChoice] = useState(() => readPreference('iserbi_cookie_choice', 'unset'));
  const [manageCookies, setManageCookies] = useState(false);
  const [optionalCookies, setOptionalCookies] = useState(
    () => readPreference('iserbi_optional_cookies', 'disabled') === 'enabled'
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  if (!currentUser) return null;

  const updateTheme = (nextTheme: string) => {
    setTheme(nextTheme);
    writePreference('iserbi_theme', nextTheme);
  };

  const updateSystemNotifications = (enabled: boolean) => {
    setSystemNotifications(enabled);
    writePreference('iserbi_system_notifications', enabled ? 'enabled' : 'disabled');
  };

  const saveCookieChoice = (choice: 'accepted' | 'declined') => {
    setCookieChoice(choice);
    setOptionalCookies(choice === 'accepted');
    writePreference('iserbi_cookie_choice', choice);
    writePreference('iserbi_optional_cookies', choice === 'accepted' ? 'enabled' : 'disabled');
    setManageCookies(false);
    showToast(`Optional cookie preferences ${choice}.`, 'success');
  };

  const saveManagedCookies = () => {
    const choice = optionalCookies ? 'accepted' : 'declined';
    setCookieChoice(choice);
    writePreference('iserbi_cookie_choice', choice);
    writePreference('iserbi_optional_cookies', optionalCookies ? 'enabled' : 'disabled');
    setManageCookies(false);
    showToast('Cookie preferences saved.', 'success');
  };

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

  const handlePasswordChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordSuccess(false);
    setPasswordError('');

    if (!currentPassword || currentPassword !== currentUser.password) {
      setPasswordError('The current password is incorrect.');
      return;
    }
    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      setPasswordError('The new password does not meet all listed requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('The new password and confirmation do not match.');
      return;
    }

    resetUserPassword(currentUser.id, newPassword);
    setPasswordSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password updated successfully.', 'success');
  };

  const tabItems: SettingsTab[] = ['General', 'Change Password', 'About System'];

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <nav
          aria-label="Settings sections"
          className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 px-4 pt-3"
        >
          {tabItems.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-[#b42318] text-[#912018]'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === 'General' && (
          <div className="grid min-h-[540px] md:grid-cols-[220px_minmax(0,1fr)]">
            <nav aria-label="General settings" className="border-b border-slate-200 bg-white p-3 md:border-b-0 md:border-r">
              <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                General
              </div>
              {sections.map((section) => (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`mb-1 w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    activeSection === section
                      ? 'bg-red-50 font-semibold text-[#912018]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {section}
                </button>
              ))}
            </nav>

            <main className="p-5 md:p-8">
              <h3 className="text-lg font-semibold text-slate-900">{activeSection}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {activeSection === 'Preferences' && 'Configure the display theme for the administrator console.'}
                {activeSection === 'Notification Settings' && 'Control system-level notices, dispatch updates, and security alerts.'}
                {activeSection === 'Cookies' && 'Review how browser storage is used and manage optional preferences.'}
                {activeSection === 'Terms and Privacy' && 'Access institutional terms and administrative data governance documentation.'}
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
                {activeSection === 'Preferences' && (
                  <Section title="Display theme">
                    <p>Select the appearance used throughout the iSerbi administrator portal.</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {(['light', 'dark'] as const).map((value) => (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={theme === value}
                          onClick={() => updateTheme(value)}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
                            theme === value
                              ? 'border-[#b42318] bg-red-50 text-[#912018]'
                              : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {value === 'light' ? 'Light Mode' : 'Dark Mode'}
                        </button>
                      ))}
                    </div>
                  </Section>
                )}

                {activeSection === 'Notification Settings' && (
                  <Section title="System notifications">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <p>Receive administrator-level notices, including roster imports, exception alerts, and system security notices.</p>
                        <p className="mt-2 text-xs text-slate-500">Your selection is saved in this browser.</p>
                      </div>
                      <Toggle
                        checked={systemNotifications}
                        label="Enable system notifications"
                        onChange={updateSystemNotifications}
                      />
                    </div>
                  </Section>
                )}

                {activeSection === 'Cookies' && (
                  <div className="space-y-5">
                    <Section title="Cookie and browser-storage use">
                      <p>
                        This prototype does not currently set cookies. It uses browser storage for demo session,
                        application data, and display preferences. Cookie consent below records your choice for future
                        policy compliance; it does not disable the prototype&apos;s required browser storage.
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Current optional preference: {cookieChoice === 'unset' ? 'Not set' : cookieChoice}.
                      </p>
                    </Section>
                    {manageCookies ? (
                      <Section title="Manage preferences">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-slate-700">Required browser storage</p>
                            <p className="text-xs text-slate-500">Used for administrative sign-in and core portal functionality; not a cookie.</p>
                          </div>
                          <span className="text-xs font-semibold text-slate-500">Always enabled</span>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-slate-700">Optional cookies</p>
                            <p className="text-xs text-slate-500">No optional cookies are currently used by this prototype.</p>
                          </div>
                          <Toggle
                            checked={optionalCookies}
                            label="Allow optional preference storage"
                            onChange={setOptionalCookies}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={saveManagedCookies}
                          className="mt-5 rounded-lg bg-[#b42318] px-4 py-2 text-sm font-semibold text-white hover:bg-[#912018]"
                        >
                          Save preferences
                        </button>
                      </Section>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => saveCookieChoice('accepted')}
                          className="rounded-lg bg-[#b42318] px-4 py-2 text-sm font-semibold text-white hover:bg-[#912018]"
                        >
                          Accept optional cookies
                        </button>
                        <button
                          type="button"
                          onClick={() => saveCookieChoice('declined')}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Decline optional cookies
                        </button>
                        <button
                          type="button"
                          onClick={() => setManageCookies(true)}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Manage preferences
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-slate-600">
                      Cookie Policy: no separate policy document is configured in this prototype.{' '}
                      <a
                        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('iSerbi Cookie Policy request')}`}
                        className="font-medium text-[#912018] underline underline-offset-2"
                      >
                        Request the policy from support
                      </a>
                      .
                    </p>
                  </div>
                )}

                {activeSection === 'Terms and Privacy' && (
                  <div className="space-y-5">
                    <Section title="Institutional policies">
                      <p>
                        Official Terms of Service and Administrative Data Privacy Policy documentation for PGIN MISO and INYDO
                        are managed centrally. Contact the system administrator support team for the latest copies.
                      </p>
                    </Section>
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('iSerbi Administrator Terms of Service request')}`}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Request Terms of Service
                      </a>
                      <a
                        href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('iSerbi Privacy & Data Protection Policy request')}`}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Request Privacy Policy
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        )}

        {activeTab === 'Change Password' && (
          <main className="mx-auto max-w-2xl p-5 md:p-8">
            <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
            <p className="mt-1 text-sm text-slate-500">Choose a strong password to protect your administrator privileges.</p>
            <form onSubmit={handlePasswordChange} className="mt-6 space-y-5">
              <label className="block text-sm font-medium text-slate-700">
                Current password
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#b42318] focus:ring-2 focus:ring-red-100"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                New password
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#b42318] focus:ring-2 focus:ring-red-100"
                />
              </label>
              {newPassword && (
                <div aria-live="polite">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Password strength</span>
                    <span className="font-semibold">{passwordStrength.label}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full ${passwordStrength.color}`} style={{ width: passwordStrength.width }} />
                  </div>
                </div>
              )}
              <label className="block text-sm font-medium text-slate-700">
                Confirm new password
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#b42318] focus:ring-2 focus:ring-red-100"
                />
              </label>
              <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">Password requirements</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>At least 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </div>
              {passwordError && <p role="alert" className="text-sm font-medium text-red-700">{passwordError}</p>}
              {passwordSuccess && <p role="status" className="text-sm font-medium text-emerald-700">Password changed successfully.</p>}
              <button
                type="submit"
                className="rounded-lg bg-[#b42318] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#912018]"
              >
                Update Password
              </button>
            </form>
          </main>
        )}

        {activeTab === 'About System' && (
          <main className="p-5 md:p-8">
            <h3 className="text-lg font-semibold text-slate-900">About System</h3>
            <p className="mt-1 text-sm text-slate-500">Institutional information and administrator environment specifications.</p>
            <div className="mt-6 max-w-3xl divide-y divide-slate-200 rounded-xl border border-slate-200">
              <div className="grid gap-1 p-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                <span className="text-sm font-medium text-slate-500">Application</span>
                <span className="text-sm font-semibold text-slate-900">iSerbi Community Service Management System</span>
              </div>
              <div className="grid gap-1 p-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                <span className="text-sm font-medium text-slate-500">Administrative Portal</span>
                <span className="text-sm text-slate-800">PGIN MISO Administrator Console</span>
              </div>
              <div className="grid gap-1 p-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                <span className="text-sm font-medium text-slate-500">Version</span>
                <span className="text-sm font-mono text-slate-800">0.0.0 (prototype)</span>
              </div>
              <div className="grid gap-1 p-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                <span className="text-sm font-medium text-slate-500">Purpose</span>
                <span className="text-sm leading-6 text-slate-800">
                  A provincial scholarship portal for managing community service opportunities, automated CSV recipient matching,
                  applications, requirements, and credited service hours.
                </span>
              </div>
              <div className="grid gap-1 p-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                <span className="text-sm font-medium text-slate-500">Last updated</span>
                <span className="text-sm text-slate-800">September 27, 2026</span>
              </div>
              <div className="grid gap-1 p-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                <span className="text-sm font-medium text-slate-500">Developed by</span>
                <span className="text-sm text-slate-800">Provincial Government of Ilocos Norte · INYDO · PGIN MISO</span>
              </div>
              <div className="grid gap-1 p-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                <span className="text-sm font-medium text-slate-500">Support</span>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-sm font-medium text-[#912018] underline underline-offset-2">
                  {SUPPORT_EMAIL}
                </a>
              </div>
              <div className="grid gap-1 p-5 sm:grid-cols-[190px_minmax(0,1fr)]">
                <span className="text-sm font-medium text-slate-500">Copyright</span>
                <span className="text-sm text-slate-800">© 2026 Provincial Government of Ilocos Norte. All rights reserved.</span>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};
