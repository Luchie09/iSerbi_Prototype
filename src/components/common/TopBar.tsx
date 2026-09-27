import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import { formatDateTime } from '../../logic/core';

interface TopBarProps {
  pageTitle: string;
  breadcrumb?: string[];
}

export const TopBar: React.FC<TopBarProps> = ({ pageTitle, breadcrumb = [] }) => {
  const {
    currentUser,
    data,
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    navigate,
    logout,
    markNotifRead,
    markAllNotifsRead,
  } = useApp();

  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setSidebarCollapsed(!sidebarCollapsed);
      return;
    }
    setSidebarOpen(!sidebarOpen);
  };

  const [notifOpen, setNotifOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userNotifications = currentUser
    ? data.notifications.filter((n) => n.userId === currentUser.id)
    : [];

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'application_status':
        return <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'account':
        return <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  return (
    <header className="relative z-30 mx-2 mt-3 lg:ml-4 lg:mr-3 flex items-center justify-between h-16 px-4 md:px-5 bg-white/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] rounded-[22px]">
      {/* Left Zone: Mobile Hamburger + Breadcrumb / Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 -ml-1 text-slate-600 rounded-xl hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
          aria-label="Toggle navigation menu"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-bold text-slate-900 tracking-[-0.03em] leading-tight truncate">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right Zone: Notifications + Settings */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full tabular-nums">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAllReadHandler}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {userNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No notifications yet.
                  </div>
                ) : (
                  userNotifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotifRead(notif.id);
                        if (notif.link) {
                          navigate(notif.link);
                          setNotifOpen(false);
                        }
                      }}
                      className={`p-3.5 flex gap-3 text-left transition-colors cursor-pointer ${
                        notif.read ? 'hover:bg-slate-50' : 'bg-red-50/40 hover:bg-red-50/70'
                      }`}
                    >
                      <div className="mt-0.5">{getNotifIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs text-slate-800 leading-snug ${
                            notif.read ? '' : 'font-semibold'
                          }`}
                        >
                          {notif.message}
                        </p>
                        <span className="text-[11px] text-slate-400 mt-1 block tabular-nums">
                          {formatDateTime(notif.createdAt)}
                        </span>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  type="button"
                  onClick={() => {
                    navigate('#notifications');
                    setNotifOpen(false);
                  }}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => navigate('#settings')}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
          aria-label="Open settings"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => logout()}
          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );

  function markAllAllReadHandler() {
    markAllNotifsRead();
  }
};
