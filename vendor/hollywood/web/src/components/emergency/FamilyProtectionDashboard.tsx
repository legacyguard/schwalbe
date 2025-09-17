
// Family Protection Dashboard - Comprehensive emergency management hub with Sofia integration
// Phase 3A: Family Shield System - Central command center for all family protection features

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import { AnimationSystem } from '@/lib/animation-system';
import type { PersonalityMode } from '@/lib/sofia-types';

// Import our emergency components
import { DeadMansSwitchManager } from './DeadMansSwitchManager';
import { EmergencyContactSystem } from './EmergencyContactSystem';
import { GuardianNotificationCenter } from './GuardianNotificationCenter';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Icons
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  Globe,
  Heart,
  MessageSquare,
  Settings,
  Shield,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';

interface ProtectionStatus {
  actionRequiredNotifications: number;
  contactsCount: number;
  emergencyRulesActive: number;
  lastActivity: Date | null;
  primaryContactsCount: number;
  recentAlerts: Array<{
    id: string;
    message: string;
    timestamp: Date;
    type: 'error' | 'info' | 'warning';
  }>;
  switchStatus: 'active' | 'inactive' | 'pending' | 'triggered';
  unreadNotifications: number;
}

interface FamilyProtectionDashboardProps {
  className?: string;
  personalityMode?: PersonalityMode;
}

export const FamilyProtectionDashboard: React.FC<
  FamilyProtectionDashboardProps
> = ({ className = '', personalityMode }) => {
  const { t } = useTranslation('ui/family-protection-dashboard');
  const { userId: _userId } = useAuth();
  const personalityManager = usePersonalityManager();

  // State
  const [activeTab, setActiveTab] = useState('overview');
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus>({
    switchStatus: 'inactive',
    contactsCount: 0,
    primaryContactsCount: 0,
    unreadNotifications: 0,
    actionRequiredNotifications: 0,
    lastActivity: null,
    emergencyRulesActive: 0,
    recentAlerts: [],
  });

  // Get effective personality mode
  const detectedMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const effectiveMode =
    personalityMode ||
    (detectedMode === 'balanced' ? 'adaptive' : detectedMode);

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const animConfig = AnimationSystem.getConfig(effectiveMode);

  // Callback handlers to update status from child components
  // const _handleSwitchStatusChange = (status: ProtectionStatus['switchStatus']) => { // Not used
  //   setProtectionStatus(prev => ({ ...prev, switchStatus: status }));
  // };

  const handleContactsUpdate = (total: number, primary: number) => {
    setProtectionStatus(prev => ({
      ...prev,
      contactsCount: total,
      primaryContactsCount: primary,
    }));
  };

  const handleNotificationsUpdate = (
    unread: number,
    actionRequired: number
  ) => {
    setProtectionStatus(prev => ({
      ...prev,
      unreadNotifications: unread,
      actionRequiredNotifications: actionRequired,
    }));
  };

  const handleEmergencyTriggered = () => {
    setProtectionStatus(prev => ({
      ...prev,
      switchStatus: 'triggered',
      recentAlerts: [
        {
          id: Date.now().toString(),
          type: 'error',
          message: t('alerts.emergencyActivated'),
          timestamp: new Date(),
        },
        ...prev.recentAlerts.slice(0, 4),
      ],
    }));
  };

  // Get personality-specific content
  const getPersonalityContent = () => {
    switch (effectiveMode) {
      case 'empathetic':
        return {
          title: t('title.empathetic'),
          subtitle: t('subtitle.empathetic'),
          description: t('description.empathetic'),
          overviewTitle: t('overviewTitle.empathetic'),
          bgGradient: 'from-emerald-50 via-green-50 to-teal-50',
          borderColor: 'border-emerald-200',
          accentColor: 'text-emerald-600',
          icon: Heart,
          tabs: {
            overview: t('tabs.empathetic.overview'),
            switch: t('tabs.empathetic.switch'),
            contacts: t('tabs.empathetic.contacts'),
            notifications: t('tabs.empathetic.notifications'),
          },
        };
      case 'pragmatic':
        return {
          title: t('title.pragmatic'),
          subtitle: t('subtitle.pragmatic'),
          description: t('description.pragmatic'),
          overviewTitle: t('overviewTitle.pragmatic'),
          bgGradient: 'from-blue-50 via-slate-50 to-cyan-50',
          borderColor: 'border-blue-200',
          accentColor: 'text-blue-600',
          icon: Shield,
          tabs: {
            overview: t('tabs.pragmatic.overview'),
            switch: t('tabs.pragmatic.switch'),
            contacts: t('tabs.pragmatic.contacts'),
            notifications: t('tabs.pragmatic.notifications'),
          },
        };
      default:
        return {
          title: t('title.adaptive'),
          subtitle: t('subtitle.adaptive'),
          description: t('description.adaptive'),
          overviewTitle: t('overviewTitle.adaptive'),
          bgGradient: 'from-purple-50 via-indigo-50 to-blue-50',
          borderColor: 'border-purple-200',
          accentColor: 'text-purple-600',
          icon: Globe,
          tabs: {
            overview: t('tabs.adaptive.overview'),
            switch: t('tabs.adaptive.switch'),
            contacts: t('tabs.adaptive.contacts'),
            notifications: t('tabs.adaptive.notifications'),
          },
        };
    }
  };

  const personalityContent = getPersonalityContent();
  const IconComponent = personalityContent.icon;

  // Get status configuration
  const getStatusConfig = () => {
    switch (protectionStatus.switchStatus) {
      case 'active':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle,
          message: t(`status.messages.active.${effectiveMode}`),
        };
      case 'triggered':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: AlertTriangle,
          message: t(`status.messages.triggered.${effectiveMode}`),
        };
      case 'pending':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: Clock,
          message: t(`status.messages.pending.${effectiveMode}`),
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          icon: XCircle,
          message: t(`status.messages.inactive.${effectiveMode}`),
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Calculate health score
  const healthScore = useMemo(() => {
    let score = 0;
    if (protectionStatus.switchStatus === 'active') score += 30;
    if (protectionStatus.contactsCount >= 2) score += 25;
    if (protectionStatus.primaryContactsCount >= 1) score += 20;
    if (protectionStatus.emergencyRulesActive >= 2) score += 15;
    if (protectionStatus.actionRequiredNotifications === 0) score += 10;
    return Math.min(score, 100);
  }, [protectionStatus]);

  return (
    <div className={className}>
      {/* Header */}
      <motion.div
        className={`bg-gradient-to-br ${personalityContent.bgGradient} rounded-xl border ${personalityContent.borderColor} shadow-lg mb-6`}
        {...(!shouldReduceMotion && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: animConfig.duration, ease: animConfig.ease as any }
        })}
      >
        <div className='p-6'>
          <div className='flex items-start justify-between mb-6'>
            <div className='flex items-start gap-4'>
              <motion.div
                className={`p-3 rounded-xl bg-white/80 backdrop-blur-sm ${personalityContent.accentColor}`}
                {...(!shouldReduceMotion && {
                  whileHover: { scale: 1.05 }
                })}
              >
                <IconComponent className='w-8 h-8' />
              </motion.div>

              <div>
                <h1 className='text-2xl font-bold text-gray-800 mb-2'>
                  {personalityContent.title}
                </h1>
                <p className='text-gray-600 mb-1'>
                  {personalityContent.subtitle}
                </p>
                <p className='text-sm text-gray-500'>
                  {personalityContent.description}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className={`flex items-center gap-3 px-4 py-2 rounded-full ${statusConfig.bgColor} backdrop-blur-sm`}
            >
              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
              <span className={`text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.message}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-white/70 backdrop-blur-sm rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Activity className='w-4 h-4 text-blue-600' />
                <span className='text-sm font-medium text-gray-700'>
                  {t('metrics.healthScore.label')}
                </span>
              </div>
              <div className='text-2xl font-bold text-gray-800'>
                {healthScore}%
              </div>
              <div className='text-xs text-gray-500'>
                {healthScore >= 80
                  ? t('metrics.healthScore.ratings.excellent')
                  : healthScore >= 60
                    ? t('metrics.healthScore.ratings.good')
                    : healthScore >= 40
                      ? t('metrics.healthScore.ratings.fair')
                      : t('metrics.healthScore.ratings.needsAttention')}
              </div>
            </div>

            <div className='bg-white/70 backdrop-blur-sm rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Users className='w-4 h-4 text-green-600' />
                <span className='text-sm font-medium text-gray-700'>
                  {t('metrics.guardians.label')}
                </span>
              </div>
              <div className='text-2xl font-bold text-gray-800'>
                {protectionStatus.contactsCount}
              </div>
              <div className='text-xs text-gray-500'>
                {protectionStatus.primaryContactsCount} {t('metrics.guardians.primary')}
              </div>
            </div>

            <div className='bg-white/70 backdrop-blur-sm rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Bell className='w-4 h-4 text-orange-600' />
                <span className='text-sm font-medium text-gray-700'>
                  {t('metrics.notifications.label')}
                </span>
              </div>
              <div className='text-2xl font-bold text-gray-800'>
                {protectionStatus.unreadNotifications}
              </div>
              <div className='text-xs text-gray-500'>
                {protectionStatus.actionRequiredNotifications} {t('metrics.notifications.needAction')}
              </div>
            </div>

            <div className='bg-white/70 backdrop-blur-sm rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-1'>
                <Clock className='w-4 h-4 text-purple-600' />
                <span className='text-sm font-medium text-gray-700'>
                  {t('metrics.lastCheck.label')}
                </span>
              </div>
              <div className='text-sm font-bold text-gray-800'>
                {protectionStatus.lastActivity
                  ? protectionStatus.lastActivity.toLocaleDateString()
                  : t('metrics.lastCheck.never')}
              </div>
              <div className='text-xs text-gray-500'>
                {protectionStatus.lastActivity
                  ? protectionStatus.lastActivity.toLocaleTimeString()
                  : t('metrics.lastCheck.noRecentActivity')}
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          {protectionStatus.recentAlerts.length > 0 && (
            <div className='mt-4'>
              <h4 className='text-sm font-medium text-gray-700 mb-2'>
                {t('alerts.title')}
              </h4>
              <div className='space-y-2'>
                {protectionStatus.recentAlerts.slice(0, 2).map(alert => (
                  <Alert
                    key={alert.id}
                    className={`${
                      alert.type === 'error'
                        ? 'border-red-200 bg-red-50'
                        : alert.type === 'warning'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-blue-200 bg-blue-50'
                    }`}
                  >
                    <AlertTriangle className='w-4 h-4' />
                    <AlertDescription className='flex items-center justify-between'>
                      <span>{alert.message}</span>
                      <span className='text-xs text-gray-500'>
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs Interface */}
      <motion.div
        {...(!shouldReduceMotion && {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: animConfig.duration, delay: 0.1 }
        })}
      >
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-6'
        >
          <TabsList className='grid w-full grid-cols-4 lg:w-max'>
            <TabsTrigger value='overview' className='flex items-center gap-2'>
              <TrendingUp className='w-4 h-4' />
              <span className='hidden sm:inline'>
                {personalityContent.tabs.overview}
              </span>
            </TabsTrigger>
            <TabsTrigger value='switch' className='flex items-center gap-2'>
              <Zap className='w-4 h-4' />
              <span className='hidden sm:inline'>
                {personalityContent.tabs.switch}
              </span>
            </TabsTrigger>
            <TabsTrigger value='contacts' className='flex items-center gap-2'>
              <Users className='w-4 h-4' />
              <span className='hidden sm:inline'>
                {personalityContent.tabs.contacts}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value='notifications'
              className='flex items-center gap-2'
            >
              <Bell className='w-4 h-4' />
              <span className='hidden sm:inline'>
                {personalityContent.tabs.notifications}
              </span>
              {protectionStatus.unreadNotifications > 0 && (
                <Badge variant='destructive' className='text-xs ml-1'>
                  {protectionStatus.unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-6'>
            <div className='grid lg:grid-cols-2 gap-6'>
              {/* Dead Man's Switch Overview */}
              <DeadMansSwitchManager
                personalityMode={effectiveMode}
                onEmergencyTriggered={_ruleId => {
                  handleEmergencyTriggered();
                }}
                onHealthCheckMissed={_checkId => {
                  // Health check missed - could trigger additional monitoring
                }}
              />

              {/* Quick Actions */}
              <motion.div
                className='bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-6'
                {...(!shouldReduceMotion && {
                  initial: { opacity: 0, x: 20 },
                  animate: { opacity: 1, x: 0 },
                  transition: { delay: 0.2 }
                })}
              >
                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                  {t(`quickActions.title.${effectiveMode}`)}
                </h3>

                <div className='space-y-3'>
                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => setActiveTab('contacts')}
                  >
                    <Users className='w-4 h-4 mr-3' />
                    {t(`quickActions.addContact.${effectiveMode}`)}
                  </Button>

                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => setActiveTab('notifications')}
                  >
                    <MessageSquare className='w-4 h-4 mr-3' />
                    {t(`quickActions.sendMessage.${effectiveMode}`)}
                  </Button>

                  <Button
                    variant='outline'
                    className='w-full justify-start'
                    onClick={() => setActiveTab('switch')}
                  >
                    <Settings className='w-4 h-4 mr-3' />
                    {t(`quickActions.settings.${effectiveMode}`)}
                  </Button>

                  <Button
                    variant='default'
                    className='w-full justify-start bg-primary hover:bg-primary-hover'
                    onClick={async () => {
                      try {
                        // Get Supabase URL from environment or use the default
                        const supabaseUrl =
                          import.meta.env.VITE_SUPABASE_URL ||
                          window.location.origin;
                        const supabaseAnonKey = import.meta.env
                          .VITE_SUPABASE_ANON_KEY;

                        // Call the Supabase Edge Function
                        const response = await fetch(
                          `${supabaseUrl}/functions/v1/generate-survivor-manual`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${supabaseAnonKey}`,
                            },
                            body: JSON.stringify({
                              user_id: _userId,
                            }),
                            credentials: 'include',
                          }
                        );

                        if (!response.ok) {
                          throw new Error('Failed to generate manual');
                        }

                        // Get the PDF blob
                        const blob = await response.blob();

                        // Create download link
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `family-manual-${new Date().toISOString().split('T')[0]}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);

                        // Show success message
                        toast.success(t(`toasts.manualSuccess.${effectiveMode}`));
                      } catch (error) {
                        console.error('Error generating manual:', error);
                        toast.error(t(`toasts.manualError.${effectiveMode}`));
                      }
                    }}
                  >
                    <BookOpen className='w-4 h-4 mr-3' />
                    <span className='flex-1 text-left'>
                      {t(`quickActions.generateManual.${effectiveMode}`)}
                    </span>
                    <Download className='w-4 h-4 ml-2' />
                  </Button>

                  <div className='pt-3 border-t border-gray-200'>
                    <p className='text-sm text-gray-600 text-center'>
                      {t(`quickActions.statusMessage.${effectiveMode}`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value='switch'>
            <DeadMansSwitchManager
              personalityMode={effectiveMode}
              onEmergencyTriggered={handleEmergencyTriggered}
              onHealthCheckMissed={_checkId => {
                // Health check missed - could trigger additional monitoring
              }}
            />
          </TabsContent>

          <TabsContent value='contacts'>
            <EmergencyContactSystem
              personalityMode={effectiveMode}
              onContactAdded={contact => {
                // Update counts
                handleContactsUpdate(
                  protectionStatus.contactsCount + 1,
                  protectionStatus.primaryContactsCount +
                    (contact.can_trigger_emergency ? 1 : 0)
                );
              }}
              onContactUpdated={_contact => {
                // Contact updated successfully
              }}
              onNotificationSent={_notification => {
                // Notification sent successfully
              }}
            />
          </TabsContent>

          <TabsContent value='notifications'>
            <GuardianNotificationCenter
              personalityMode={effectiveMode}
              onNotificationSent={_notification => {
                // Notification sent successfully
              }}
              onNotificationRead={_notificationId => {
                handleNotificationsUpdate(
                  Math.max(0, protectionStatus.unreadNotifications - 1),
                  protectionStatus.actionRequiredNotifications
                );
              }}
              onEmergencyTriggered={handleEmergencyTriggered}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default FamilyProtectionDashboard;
