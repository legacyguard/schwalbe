import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { WillWizardRoutes } from '@/features/will/wizard/routes/WillWizardRoutes';
import { AssetsRoutes } from '@/features/assets/routes/AssetsRoutes';
import { ShareViewer } from '@/features/sharing/viewer/ShareViewer';
import { RemindersRoutes } from '@/features/reminders/routes/RemindersRoutes';
import { DocumentRoutes } from '@/features/documents/routes/DocumentRoutes';
import { SubscriptionsRoutes } from '@/features/subscriptions/SubscriptionsRoutes';
import { AccountRoutes } from '@/features/account/AccountRoutes';
import { LegalRoutes } from '@/features/legal/routes/LegalRoutes';
import '@/lib/i18n';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/will/wizard/*" element={<WillWizardRoutes />} />
            <Route path="/assets/*" element={<AssetsRoutes />} />
            <Route path="/reminders/*" element={<RemindersRoutes />} />
            <Route path="/documents/*" element={<DocumentRoutes />} />
            <Route path="/share/:shareId" element={<ShareViewer />} />
            <Route path="/subscriptions/*" element={<SubscriptionsRoutes />} />
            <Route path="/account/*" element={<AccountRoutes />} />
            <Route path="/legal/*" element={<LegalRoutes />} />
            <Route
              path="/"
              element={
                <div className="text-white p-6">
                  <h1 className="text-2xl font-semibold mb-4">Schwalbe App</h1>
                  <p className="mb-4">Welcome. Use the links below to explore features.</p>
                  <div className="flex gap-4">
                    <Link aria-label="Start Will Wizard" className="underline text-sky-300" to="/will/wizard/start">
                      Start Will Wizard
                    </Link>
                    <Link aria-label="Open Asset Dashboard" className="underline text-emerald-300" to="/assets">
                      Asset Dashboard
                    </Link>
                    <Link aria-label="Open Documents" className="underline text-indigo-300" to="/documents">
                      Documents
                    </Link>
                    <Link aria-label="Open Subscriptions" className="underline text-pink-300" to="/subscriptions">
                      Subscriptions
                    </Link>
                  </div>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/assets" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </React.StrictMode>
  );
}
