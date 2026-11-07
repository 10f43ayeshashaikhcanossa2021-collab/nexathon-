/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from './types/inkloom';
import { api } from './api/client';
import { AppShell } from './components/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { SubmissionPage } from './pages/SubmissionPage';
import { ResultsPage } from './pages/ResultsPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { ApprovalPage } from './pages/ApprovalPage';
import { BrandHubPage } from './pages/BrandHubPage';
import { GuidelinesPage } from './pages/GuidelinesPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { UsersPage } from './pages/UsersPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(() => api.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [pageParams, setPageParams] = useState<any>({});

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'submissions-new':
        return (
          <SubmissionPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            loadDemo={pageParams?.loadDemo}
          />
        );
      case 'results':
        return (
          <ResultsPage
            currentUser={currentUser}
            submissionId={pageParams?.submissionId || 'sub-lumora-1000'}
            onNavigate={handleNavigate}
          />
        );
      case 'review-queue':
        return <ReviewQueuePage currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'approval':
        return (
          <ApprovalPage
            currentUser={currentUser}
            versionId={pageParams?.versionId || 'ver-sub-lumora-1010-v1'}
            onNavigate={handleNavigate}
          />
        );
      case 'brand-hub':
        return <BrandHubPage currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'guidelines':
        return <GuidelinesPage currentUser={currentUser} />;
      case 'history':
        return <HistoryPage currentUser={currentUser} onNavigate={handleNavigate} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'users':
        return <UsersPage currentUser={currentUser} />;
      case 'audit-logs':
        return <AuditLogPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage currentUser={currentUser} onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppShell
      currentUser={currentUser}
      onUserChange={handleUserChange}
      currentPage={currentPage}
      onNavigate={handleNavigate}
    >
      {renderPage()}
    </AppShell>
  );
}
