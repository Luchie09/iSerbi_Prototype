import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDateTime } from '../../logic/core';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';

export const ScholarNotifications: React.FC = () => {
  const {
    currentUser,
    data,
    navigate,
    markNotifRead,
    markAllNotifsRead,
    deleteNotif,
    deleteAllNotifs,
  } = useApp();

  if (!currentUser) return null;

  const userNotifs = data.notifications.filter((n) => n.userId === currentUser.id);
  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'application_status':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'reminder':
        return <Clock className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'account':
        return <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />;
      default:
        return <FileText className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Bulk Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              System Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.role === 'scholar'
              ? 'Real-time status updates, reminders, and verification alerts regarding your community service.'
              : 'Real-time workflow alerts, pending review queues, and system activity notices.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {userNotifs.length > 0 && (
            <>
              <button
                type="button"
                onClick={markAllNotifsRead}
                disabled={unreadCount === 0}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Mark All as Read</span>
              </button>
              <button
                type="button"
                onClick={deleteAllNotifs}
                className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {userNotifs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Notifications</h3>
            <p className="text-xs text-slate-400 mt-1">
              You are all caught up! New alerts will appear here as soon as they arrive.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {userNotifs.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  markNotifRead(notif.id);
                  if (notif.link) navigate(notif.link);
                }}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer group ${
                  notif.read ? 'hover:bg-slate-50/80' : 'bg-red-50/30 hover:bg-red-50/60'
                }`}
              >
                <div className="mt-0.5">{getNotifIcon(notif.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                    )}
                    <p
                      className={`text-xs text-slate-900 leading-relaxed ${
                        notif.read ? 'font-normal' : 'font-bold'
                      }`}
                    >
                      {notif.message}
                    </p>
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    <span className="font-mono tabular-nums">
                      {formatDateTime(notif.createdAt)}
                    </span>
                    {notif.link && (
                      <span className="text-blue-600 font-medium group-hover:underline flex items-center gap-0.5">
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotif(notif.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
