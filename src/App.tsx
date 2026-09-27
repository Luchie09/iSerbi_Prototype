/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/common/TopBar';
import { Sidebar } from './components/common/Sidebar';
import { FloatingFAQ } from './components/common/FloatingFAQ';
import { Toast } from './components/common/Toast';

// Auth Views
import { LoginView } from './components/auth/LoginView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { RegisterView } from './components/auth/RegisterView';
import { ChangeTemporaryPasswordModal } from './components/auth/ChangeTemporaryPasswordModal';

// Scholar Views
import { ScholarDashboard } from './components/scholar/ScholarDashboard';
import { ScholarTasks } from './components/scholar/ScholarTasks';
import { ScholarApplications } from './components/scholar/ScholarApplications';
import { ScholarDocuments } from './components/scholar/ScholarDocuments';
import { ScholarNotifications } from './components/scholar/ScholarNotifications';
import { ScholarSettings } from './components/scholar/ScholarSettings';
import { ScholarProfile } from './components/scholar/ScholarProfile';

// Coordinator Views
import { CoordinatorDashboard } from './components/coordinator/CoordinatorDashboard';
import { CoordinatorTasks } from './components/coordinator/CoordinatorTasks';
import { CoordinatorVerification } from './components/coordinator/CoordinatorVerification';
import { CoordinatorRecords } from './components/coordinator/CoordinatorRecords';
import { CoordinatorDocuments } from './components/coordinator/CoordinatorDocuments';
import { CoordinatorProfile } from './components/coordinator/CoordinatorProfile';

// Administrator Views
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminScholars } from './components/admin/AdminScholars';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminProfile } from './components/admin/AdminProfile';

const AppContent: React.FC = () => {
  const { currentUser, currentRoute, sidebarCollapsed } = useApp();

  // Route routing for public/auth views
  if (!currentUser || currentRoute === '#login') {
    if (currentRoute === '#forgot-password') {
      return (
        <>
          <ForgotPasswordView />
          <Toast />
        </>
      );
    }
    if (currentRoute === '#register') {
      return (
        <>
          <RegisterView />
          <Toast />
        </>
      );
    }
    return (
      <>
        <LoginView />
        <Toast />
      </>
    );
  }

  // Derive page title and breadcrumbs for current view
  let pageTitle = 'Dashboard';
  let breadcrumbs: string[] = [];

  const normalizedRoute = currentRoute || '#dashboard';

  switch (normalizedRoute) {
    case '#dashboard':
      pageTitle = 'Dashboard';
      breadcrumbs = ['Home', 'Dashboard'];
      break;
    case '#tasks':
      pageTitle =
        currentUser.role === 'scholar'
          ? 'Task Opportunities'
          : 'Task Opportunity Management';
      breadcrumbs = ['Tasks', 'Opportunities'];
      break;
    case '#applications':
      pageTitle = 'My Applications';
      breadcrumbs = ['Tracking', 'Applications'];
      break;
    case '#verification':
      pageTitle = 'Task Verification';
      breadcrumbs = ['Certification', 'Queue'];
      break;
    case '#records':
      pageTitle = 'Service Records';
      breadcrumbs = ['Ledger', 'Service Records'];
      break;
    case '#documents':
      pageTitle =
        currentUser.role === 'scholar'
          ? 'Documents'
          : 'Document Management';
      breadcrumbs = ['Repository', 'Documents'];
      break;
    case '#notifications':
      pageTitle = 'Notifications';
      breadcrumbs = ['User', 'Notifications'];
      break;
    case '#settings':
      pageTitle = 'Settings';
      breadcrumbs = ['System', 'Settings'];
      break;
    case '#users':
      pageTitle = 'User Management';
      breadcrumbs = ['Admin', 'User Management'];
      break;
    case '#scholars':
      pageTitle = 'Scholar Recipients';
      breadcrumbs = ['Admin', 'Scholar Recipients'];
      break;
    case '#profile':
      pageTitle = 'Profile';
      breadcrumbs = ['Account', 'Profile'];
      break;
    default:
      pageTitle = 'Dashboard';
      breadcrumbs = ['Portal'];
      break;
  }

  // Render role-specific screen based on route
  const renderMainContent = () => {
    if (currentUser.role === 'scholar') {
      switch (normalizedRoute) {
        case '#dashboard':
          return <ScholarDashboard />;
        case '#tasks':
          return <ScholarTasks />;
        case '#applications':
          return <ScholarApplications />;
        case '#documents':
          return <ScholarDocuments />;
        case '#notifications':
          return <ScholarNotifications />;
        case '#settings':
          return <ScholarSettings />;
        case '#profile':
          return <ScholarProfile />;
        default:
          return <ScholarDashboard />;
      }
    } else if (currentUser.role === 'coordinator') {
      switch (normalizedRoute) {
        case '#dashboard':
          return <CoordinatorDashboard />;
        case '#tasks':
          return <CoordinatorTasks />;
        case '#verification':
          return <CoordinatorVerification />;
        case '#records':
          return <CoordinatorRecords />;
        case '#documents':
          return <CoordinatorDocuments />;
        case '#settings':
          return <ScholarSettings />;
        case '#profile':
          return <CoordinatorProfile />;
        default:
          return <CoordinatorDashboard />;
      }
    } else if (currentUser.role === 'admin') {
      switch (normalizedRoute) {
        case '#dashboard':
          return <AdminDashboard />;
        case '#users':
          return <AdminUsers />;
        case '#scholars':
          return <AdminScholars />;
        case '#settings':
          return <AdminSettings />;
        case '#profile':
          return <AdminProfile />;
        default:
          return <AdminDashboard />;
      }
    }

    return <ScholarDashboard />;
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col antialiased px-0 pb-4">
      {/* Sidebar Navigation (260px desktop, collapsible drawer mobile) */}
      <Sidebar />

      {/* Main Content Viewport Area with desktop left padding for 260px sidebar */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${sidebarCollapsed ? 'lg:pl-[88px]' : 'lg:pl-[278px]'}`}>
        {/* Top Navigation Bar */}
        <TopBar pageTitle={pageTitle} breadcrumb={breadcrumbs} />

        {/* Page Content Viewport */}
        <main className="flex-1 p-5 md:p-7 lg:p-8 max-w-[1600px] w-full mx-auto">
          <div className="space-y-7">{renderMainContent()}</div>
        </main>
      </div>

      {/* Temporary Password Change Modal (Shown on First Login) */}
      <ChangeTemporaryPasswordModal />

      {/* Floating FAQ Widget (Fixed bottom-right corner for Scholars) */}
      <FloatingFAQ />

      {/* Global Toast Alert */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
