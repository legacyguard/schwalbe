import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { WillWizardRoutes } from '@/features/will/wizard/routes/WillWizardRoutes';
import { AssetsRoutes } from '@/features/assets/routes/AssetsRoutes';
import { ShareViewer } from '@/features/sharing/viewer/ShareViewer';
import { RemindersRoutes } from '@/features/reminders/routes/RemindersRoutes';
import { DocumentRoutes } from '@/features/documents/routes/DocumentRoutes';
import { SubscriptionsRoutes } from '@/features/subscriptions/SubscriptionsRoutes';
import { AccountRoutes } from '@/features/account/AccountRoutes';
import { LegalRoutes } from '@/features/legal/routes/LegalRoutes';
import SupportEN from '@/pages/support/support.en'
import SupportCS from '@/pages/support/support.cs'
import SupportSK from '@/pages/support/support.sk'
import { SupportIndex } from '@/features/support/SupportIndex'
import { isLandingEnabled } from '@/config/flags';
import LandingV2 from '@/components/landing/LandingV2';
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import '@/lib/i18n';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
            {/* Public routes */}
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            {isLandingEnabled() && (
              <Route path="/landing-v2" element={<LandingV2 />} />
            )}
            <Route path="/will/wizard/*" element={<ProtectedRoute><WillWizardRoutes /></ProtectedRoute>} />
            <Route path="/assets/*" element={<ProtectedRoute><AssetsRoutes /></ProtectedRoute>} />
            <Route path="/reminders/*" element={<ProtectedRoute><RemindersRoutes /></ProtectedRoute>} />
            <Route path="/documents/*" element={<ProtectedRoute><DocumentRoutes /></ProtectedRoute>} />
            <Route path="/share/:shareId" element={<ShareViewer />} />
            <Route path="/subscriptions/*" element={<ProtectedRoute><SubscriptionsRoutes /></ProtectedRoute>} />
            <Route path="/account/*" element={<ProtectedRoute><AccountRoutes /></ProtectedRoute>} />
            <Route path="/legal/*" element={<LegalRoutes />} />
            <Route path="/support" element={<SupportIndex />} />
            <Route path="/support.en" element={<SupportEN />} />
            <Route path="/support.cs" element={<SupportCS />} />
            <Route path="/support.sk" element={<SupportSK />} />
            <Route
              path="/"
              element={
                isLandingEnabled() ? (
                  <LandingV2 />
                ) : (
                  <ProtectedRoute>
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
                  </ProtectedRoute>
                )
              }
            />
            <Route path="*" element={<Navigate to="/assets" replace />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </AuthProvider>
    </React.StrictMode>
  );
}
