import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarCheck,
  FileCheck2,
  FolderOpen,
  Bell,
  User,
  Users,
  Award,
  ClipboardList,
  ShieldCheck,
  X,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
}

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    currentRoute,
    navigate,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    data,
  } = useApp();

  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      if (!desktop) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop, setSidebarOpen]);

  const sidebarVisible = isDesktop || sidebarOpen;
  const desktopWidthClass = sidebarCollapsed ? 'w-[72px]' : 'w-[260px]';
  const mobileWidthClass = 'w-[82vw] max-w-[260px]';
  const mobileTranslateClass = sidebarOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-full opacity-0 pointer-events-none';

  if (!currentUser) return null;

  // Unread notifications for badge count
  const unreadNotifs = data.notifications.filter(
    (n) => n.userId === currentUser.id && !n.read
  ).length;

  // Pending applications count for coordinator verification badge
  const pendingVerificationsCount = data.applications.filter(
    (a) => a.status === 'proof_submitted'
  ).length;

  // Pending user registrations count for admin badge
  const pendingUsersCount = data.users.filter((u) => u.status === 'pending').length;

  // Pending registration exceptions count for admin badge
  const pendingExceptionsCount = (data.registrationExceptions || []).filter(
    (e) => e.status === 'pending_review'
  ).length;

  // Active tasks count
  const openTasksCount = data.tasks.filter((t) => t.status === 'open').length;

  // Build role-specific nav items strictly adhering to specification order
  let navItems: SidebarItem[] = [];

  if (currentUser.role === 'scholar') {
    // Scholar order: Dashboard -> Task Opportunities -> My Applications -> Documents -> Notifications -> Settings -> Profile (last)
    navItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '#dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'tasks',
        label: 'Task Opportunities',
        route: '#tasks',
        icon: CalendarCheck,
        badgeCount: openTasksCount > 0 ? openTasksCount : undefined,
      },
      {
        id: 'applications',
        label: 'My Applications',
        route: '#applications',
        icon: FileCheck2,
      },
      {
        id: 'documents',
        label: 'Documents',
        route: '#documents',
        icon: FolderOpen,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        route: '#notifications',
        icon: Bell,
        badgeCount: unreadNotifs > 0 ? unreadNotifs : undefined,
      },
    ];
  } else if (currentUser.role === 'coordinator') {
    // Coordinator order: Dashboard -> Task Opportunity Management -> Task Verification -> Service Records -> Document Management -> Notifications -> Profile (last)
    navItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '#dashboard',
        icon: LayoutDashboard,
      },
      {
        id: 'tasks',
        label: 'Task Opportunities',
        route: '#tasks',
        icon: CalendarCheck,
      },
      {
        id: 'verification',
        label: 'Task Verification',
        route: '#verification',
        icon: ShieldCheck,
        badgeCount: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined,
      },
      {
        id: 'records',
        label: 'Service Records',
        route: '#records',
        icon: ClipboardList,
      },
      {
        id: 'documents',
        label: 'Document Management',
        route: '#documents',
        icon: FolderOpen,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        route: '#notifications',
        icon: Bell,
        badgeCount: unreadNotifs > 0 ? unreadNotifs : undefined,
      },
    ];
  } else if (currentUser.role === 'admin') {
    // Admin order: Dashboard -> User Management -> Scholar Recipients -> Notifications
    navItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        route: '#dashboard',
        icon: LayoutDashboard,
        badgeCount: pendingExceptionsCount > 0 ? pendingExceptionsCount : undefined,
      },
      {
        id: 'users',
        label: 'User Management',
        route: '#users',
        icon: Users,
      },
      {
        id: 'scholars',
        label: 'Scholar Recipients',
        route: '#scholars',
        icon: Award,
      },
      {
        id: 'notifications',
        label: 'Notifications',
        route: '#notifications',
        icon: Bell,
        badgeCount: unreadNotifs > 0 ? unreadNotifs : undefined,
      },
    ];
  }

  // Active route checking helper
  const isItemActive = (route: string) => {
    if (route === '#dashboard' && (currentRoute === '' || currentRoute === '#' || currentRoute === '#dashboard')) {
      return true;
    }
    return currentRoute === route;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed top-3 bottom-3 left-3 z-50 flex flex-col overflow-hidden border border-slate-200/90 bg-white/90 backdrop-blur-xl shadow-[0_18px_50px_rgba(15,23,42,0.10)] transition-all duration-200 ease-in-out rounded-[30px] ${
          isDesktop ? desktopWidthClass : mobileWidthClass
        } ${isDesktop ? (sidebarVisible ? 'translate-x-0' : '-translate-x-full') : mobileTranslateClass} ${
          isDesktop ? 'lg:translate-x-0 lg:left-3' : 'lg:-translate-x-full'
        } ${!isDesktop && !sidebarOpen ? 'invisible' : 'visible'}`}
      >
        <div className="flex items-center justify-between h-20 px-4 bg-white/70">
          {!sidebarCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[2rem] font-black tracking-[-0.06em] text-slate-900 leading-none">
                iSerbi
              </span>
              <span className="text-[11px] text-slate-500 font-medium truncate mt-1.5">
                Community Service System Management
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items in strict order */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-1.5">
          {navItems.map((item) => {
            const active = isItemActive(item.route);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 text-xs font-medium rounded-xl transition-all duration-150 group ${
                  active
                    ? 'text-red-700 bg-[#fef3f2] font-semibold shadow-[inset_0_0_0_1px_rgba(220,38,38,0.06)]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 truncate'}`}>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? 'text-red-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!sidebarCollapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full tabular-nums ${
                      active
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Profile always clickable to expand to full page */}
        <div className={`p-3 bg-white/70 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          <button
            type="button"
            onClick={() => navigate('#profile')}
            className={`flex items-center ${sidebarCollapsed ? 'justify-center w-10 h-10 p-0' : 'gap-3 p-2'} rounded-xl text-left transition-all ${
              currentRoute === '#profile'
                ? 'bg-red-50 border border-red-200'
                : 'hover:bg-white border border-transparent hover:border-slate-200'
            }`}
            title={sidebarCollapsed ? currentUser.name : undefined}
          >
            <img
              src={currentUser.profilePicture}
              alt={currentUser.name}
              className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-9 h-9'} rounded-full object-cover border border-slate-200 shrink-0`}
              referrerPolicy="no-referrer"
            />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] font-mono text-slate-500 truncate">
                  {currentUser.userId}
                </div>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
