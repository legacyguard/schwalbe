import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SofiaChat, SofiaContextService, type SofiaContext, type ActionButton } from '@schwalbe/ai-assistant';
import { OnboardingQuestionnaire, OnboardingPlan, generatePlan, type Plan } from '@schwalbe/onboarding';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useTranslation } from 'react-i18next';

interface PersonalizedDashboardProps {
  userId?: string;
}

export default function PersonalizedDashboard({ userId }: PersonalizedDashboardProps) {
  usePageTitle('Personalized Dashboard');
  const { t } = useTranslation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSofiaChat, setShowSofiaChat] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [sofiaContext, setSofiaContext] = useState<Partial<SofiaContext>>({
    documentCount: 0,
    guardianCount: 0,
    completionPercentage: 0,
    familyStatus: 'single',
    hasWill: false,
  });

  // Mock user data - in real app this would come from API
  useEffect(() => {
    // Simulate loading user context
    setSofiaContext({
      documentCount: 3,
      guardianCount: 1,
      completionPercentage: 45,
      familyStatus: 'family',
      hasWill: false,
      lastActivity: new Date().toISOString(),
    });
  }, []);

  const handleOnboardingComplete = (generatedPlan: Plan) => {
    setPlan(generatedPlan);
    setShowOnboarding(false);
    // Update Sofia context with plan info
    setSofiaContext((prev: Partial<SofiaContext>) => ({
      ...prev,
      userPersona: generatedPlan.persona,
    }));
  };

  const handleSofiaAction = (action: ActionButton) => {
    switch (action.id) {
      case 'start_onboarding':
        setShowOnboarding(true);
        break;
      case 'add_first_doc':
        // Navigate to document upload
        console.log('Navigate to document upload');
        break;
      case 'add_guardian':
        // Navigate to guardian management
        console.log('Navigate to guardian management');
        break;
      default:
        console.log('Action:', action);
    }
  };

  const getNextMilestone = () => {
    if (!plan) return null;
    return plan.nextBestAction;
  };

  const nextMilestone = getNextMilestone();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('dashboard.title', 'Your Family Protection Dashboard')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('dashboard.subtitle', 'Personalized guidance for your family\'s future')}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowOnboarding(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('dashboard.takeQuestionnaire', 'Take Questionnaire')}
              </button>
              <button
                onClick={() => setShowSofiaChat(!showSofiaChat)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                💬 Sofia
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('dashboard.welcome', 'Welcome to Your Protection Journey')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('dashboard.welcomeMessage',
                  'Based on your current progress, here\'s what you should focus on next to protect your family.')}
              </p>

              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{sofiaContext.documentCount}</div>
                  <div className="text-sm text-gray-600">{t('dashboard.documents', 'Documents')}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{sofiaContext.guardianCount}</div>
                  <div className="text-sm text-gray-600">{t('dashboard.guardians', 'Guardians')}</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{sofiaContext.completionPercentage}%</div>
                  <div className="text-sm text-gray-600">{t('dashboard.progress', 'Complete')}</div>
                </div>
              </div>

              {/* Next Action */}
              {nextMilestone && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    {t('dashboard.nextAction', 'Next Best Action')}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{nextMilestone.title}</p>
                      <p className="text-sm text-gray-600">{nextMilestone.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {t('dashboard.estimate', 'Estimated time')}: {nextMilestone.estimateMinutes} {t('dashboard.minutes', 'minutes')}
                      </p>
                    </div>
                    <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
                      {t('dashboard.start', 'Start')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t('dashboard.recentActivity', 'Recent Activity')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    📄
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Added passport document</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    👥
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Added emergency contact</p>
                    <p className="text-sm text-gray-600">1 day ago</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Sofia Chat */}
            {showSofiaChat && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-96"
              >
                <SofiaChat
                  initialContext={sofiaContext}
                  onAction={handleSofiaAction}
                  className="h-full"
                />
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {t('dashboard.quickActions', 'Quick Actions')}
              </h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="font-medium text-blue-900">📄 Add Document</div>
                  <div className="text-sm text-blue-700">Upload important files</div>
                </button>
                <button className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="font-medium text-green-900">👥 Add Guardian</div>
                  <div className="text-sm text-green-700">Invite trusted contacts</div>
                </button>
                <button className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <div className="font-medium text-purple-900">📋 Create Will</div>
                  <div className="text-sm text-purple-700">Start estate planning</div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {!plan ? (
              <OnboardingQuestionnaire
                onComplete={handleOnboardingComplete}
                onCancel={() => setShowOnboarding(false)}
                t={t}
              />
            ) : (
              <OnboardingPlan
                plan={plan}
                onStart={() => {
                  setShowOnboarding(false);
                  // Navigate to implementation
                }}
                onRestart={() => setPlan(null)}
                t={t}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}