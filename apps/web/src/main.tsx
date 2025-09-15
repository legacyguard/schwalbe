import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { WillWizardRoutes } from '@/features/will/wizard/routes/WillWizardRoutes';
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
            <Route
              path="/"
              element={
                <div className="text-white p-6">
                  <h1 className="text-2xl font-semibold mb-4">Schwalbe App</h1>
                  <p className="mb-4">Welcome. Use the link below to start the Will Wizard.</p>
                  <Link className="underline text-sky-300" to="/will/wizard/start">
                    Start Will Wizard
                  </Link>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/will/wizard/start" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </React.StrictMode>
  );
}
