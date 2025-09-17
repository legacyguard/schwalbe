
// src/App.tsx - Web Application Entry Point

import { Suspense, lazy } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/config';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ClerkProvider } from '@/providers/ClerkProvider';
import { LocalizationProvider } from '@/contexts/LocalizationContext';
import SignInPage from '@/pages/auth/SignIn';
import SignUpPage from '@/pages/auth/SignUp';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SkipLinks } from '@/components/accessibility/SkipLinks';
import { ErrorBoundary } from 'react-error-boundary';

// Public Pages - Immediate load (critical for first impression)
import { LandingPage } from '@/pages/LandingPage';
import { TermsPage as Terms } from '@/pages/Terms';
import { PrivacyPage as Privacy } from '@/pages/Privacy';
import NotFound from '@/pages/NotFound';

// Lazy load non-critical public pages
const Blog = lazy(() => import('@/pages/Blog'));
const BlogArticle = lazy(() => import('@/pages/BlogArticle'));

// Protected Pages - Lazy load to reduce initial bundle size
const Index = lazy(() => import('@/pages/Index'));
const Vault = lazy(() => import('@/pages/Vault'));
const Guardians = lazy(() => import('@/pages/Guardians'));
const Legacy = lazy(() => import('@/pages/Legacy'));
const TimeCapsule = lazy(() => import('@/pages/TimeCapsule'));
const TimeCapsuleView = lazy(() => import('@/pages/TimeCapsuleView'));
const Settings = lazy(() => import('@/pages/Settings'));
const ProtocolSettings = lazy(() => import('@/pages/ProtocolSettings'));
const MyFamily = lazy(() => import('@/pages/MyFamily').then(m => ({ default: m.MyFamilyPage })));
const Family = lazy(() => import('@/pages/Family'));
const FamilyProtection = lazy(() => import('@/pages/FamilyProtection'));
const EmergencyAccess = lazy(() => import('@/pages/EmergencyAccess'));
const EmergencyVerification = lazy(() => import('@/pages/EmergencyVerification'));
const EmergencyConfirmation = lazy(() => import('@/pages/EmergencyConfirmation'));
const SurvivorAccess = lazy(() => import('@/pages/SurvivorAccess'));
const SurvivorManual = lazy(() => import('@/pages/SurvivorManual'));
const SocialCollaborationPage = lazy(() => import('@/pages/SocialCollaborationPage'));
const SecurityDeepDivePage = lazy(() => import('@/pages/SecurityDeepDivePage'));
const MonitoringPage = lazy(() => import('@/pages/MonitoringPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const IntelligentOrganizer = lazy(() => import('@/pages/IntelligentOrganizer'));
const ComponentShowcase = lazy(() => import('@/pages/ComponentShowcase'));
const Performance = lazy(() => import('@/pages/Performance'));
const WillManagement = lazy(() => import('@/pages/WillManagement').then(m => ({ default: m.WillManagement })));

// Onboarding Pages
const OnboardingWrapper = lazy(() => import('@/components/onboarding/OnboardingWrapper').then(m => ({ default: m.OnboardingWrapper })));

// Test Pages
const TestNotifications = lazy(() => import('@/pages/TestNotifications'));
const WillWizardCombinations = lazy(() => import('@/pages/test/WillWizardCombinations'));

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role='alert'>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

// Loading component for lazy-loaded pages
function PageLoader() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='text-center'>
        <div className='w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
        <p className='text-muted-foreground'>Loading page...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallbackRender={ErrorFallback}>
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={<div>Loading translations...</div>}>
          <ClerkProvider>
            <Router>
              <SkipLinks />
              <Routes>
                {/* Public Routes */}
                <Route path='/' element={<LandingPage />} />
                <Route path='/sign-in/*' element={<SignInPage />} />
                <Route path='/sign-up/*' element={<SignUpPage />} />
                <Route path='/blog' element={<Blog />} />
                <Route path='/blog/:slug' element={<BlogArticle />} />
                <Route path='/terms' element={<Terms />} />
                <Route path='/privacy' element={<Privacy />} />

                {/* Protected Routes with Dashboard Layout */}
                <Route
                  path='/dashboard'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Index />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/vault'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Vault />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/guardians'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Guardians />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/legacy'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Legacy />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/time-capsule'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <TimeCapsule />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/time-capsule/:id'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <TimeCapsuleView />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/settings'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Settings />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/protocol-settings'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <ProtocolSettings />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/my-family'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <MyFamily />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/family'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Family />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/family-protection'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <FamilyProtection />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/emergency-access'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <EmergencyAccess />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/emergency-verification'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <EmergencyVerification />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/emergency-confirmation'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <EmergencyConfirmation />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/survivor-access'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <SurvivorAccess />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/survivor-manual'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <SurvivorManual />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/social-collaboration'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <SocialCollaborationPage />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/security-deep-dive'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <SecurityDeepDivePage />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/monitoring'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <MonitoringPage />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/analytics'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <AnalyticsPage />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/intelligent-organizer'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <IntelligentOrganizer />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/component-showcase'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <ComponentShowcase />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/performance'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <Performance />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/will-management'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <WillManagement />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/onboarding'
                  element={
                    <ProtectedRoute>
                      <OnboardingWrapper>
                        <Suspense fallback={<PageLoader />}>
                          <div>Onboarding content</div>
                        </Suspense>
                      </OnboardingWrapper>
                    </ProtectedRoute>
                  }
                />

                {/* Test Routes */}
                <Route
                  path='/test-notifications'
                  element={
                    <ProtectedRoute>
                      <DashboardLayout>
                        <Suspense fallback={<PageLoader />}>
                          <TestNotifications />
                        </Suspense>
                      </DashboardLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/test/will-wizard-combinations'
                  element={
                    <LocalizationProvider>
                      <Suspense fallback={<PageLoader />}>
                        <WillWizardCombinations />
                      </Suspense>
                    </LocalizationProvider>
                  }
                />

                {/* 404 Route */}
                <Route path='*' element={<NotFound />} />
              </Routes>
            </Router>
          </ClerkProvider>
        </Suspense>
      </I18nextProvider>
    </ErrorBoundary>
  );
}
