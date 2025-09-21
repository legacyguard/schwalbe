
// Guardian Notification Center - Advanced notification management with Sofia personality integration
// Phase 3A: Family Shield System - Comprehensive notification and response coordination system

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import { AnimationSystem } from '@/lib/animation-system';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import type { PersonalityMode } from '@/lib/sofia-types';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// Switch import removed as unused
import { Label } from '@/components/ui/label';

// Icons
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  Bell,
  Clock,
  Eye,
  Filter,
  Heart,
  RefreshCw,
  Send,
  Shield,
  Users,
} from 'lucide-react';

interface GuardianNotification {
  action_required: boolean;
  action_url?: string;
  attempted_at: null | string;
  created_at: string;
  delivery_error?: string;
  delivery_method: 'all' | 'email' | 'push' | 'sms';
  delivery_status: 'delivered' | 'failed' | 'pending' | 'sent';
  expires_at: null | string;
  guardian_email?: string;
  guardian_id: string;
  guardian_name?: string;
  id: string;
  message: string;
  notification_type:
    | 'activation_request'
    | 'shield_activated'
    | 'status_update'
    | 'verification_needed';
  priority: 'high' | 'low' | 'medium' | 'urgent';
  read_at: null | string;
  responded_at: null | string;
  sent_at: null | string;
  title: string;
  user_id: string;
  verification_token?: string;
}

interface NotificationTemplate {
  delivery_method: GuardianNotification['delivery_method'];
  id: string;
  message_template: string;
  name: string;
  personality_variants: {
    adaptive: { message: string; title: string };
    empathetic: { message: string; title: string };
    pragmatic: { message: string; title: string };
  };
  priority: GuardianNotification['priority'];
  title_template: string;
  type: GuardianNotification['notification_type'];
}

interface GuardianNotificationCenterProps {
  className?: string;
  onEmergencyTriggered?: () => void;
  onNotificationRead?: (notificationId: string) => void;
  onNotificationSent?: (notification: GuardianNotification) => void;
  personalityMode?: PersonalityMode;
}

export const GuardianNotificationCenter: React.FC<
  GuardianNotificationCenterProps
> = ({
  className = '',
  personalityMode,
  // _onNotificationSent, // Not used
  // _onNotificationRead, // Not used
  // _onEmergencyTriggered, // Not used
}) => {
  const { t } = useTranslation('ui/guardian-notifications');
  const { userId } = useAuth();
  const createSupabaseClient = useSupabaseWithClerk();
  const personalityManager = usePersonalityManager();

  // State
  const [notifications, setNotifications] = useState<GuardianNotification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedGuardians, setSelectedGuardians] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    'action_required' | 'all' | 'unread'
  >('all');
  const [guardians, setGuardians] = useState<
    Array<{ email: string; id: string; name: string }>
  >([]);

  // Get effective personality mode
  const detectedMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const effectiveMode =
    personalityMode ||
    (detectedMode === 'balanced' ? 'adaptive' : detectedMode);

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const animConfig = AnimationSystem.getConfig(effectiveMode);

  // Notification templates with personality variants
  const notificationTemplates: NotificationTemplate[] = useMemo(
    () => [
      {
        id: 'wellness_check',
        name: t('templates.wellnessCheck.name'),
        type: 'status_update',
        title_template: t('templates.wellnessCheck.title.adaptive'),
        message_template:
          t('templates.wellnessCheck.message.adaptive'),
        priority: 'medium',
        delivery_method: 'email',
        personality_variants: {
          empathetic: {
            title: t('templates.wellnessCheck.title.empathetic'),
            message:
              t('templates.wellnessCheck.message.empathetic'),
          },
          pragmatic: {
            title: t('templates.wellnessCheck.title.pragmatic'),
            message:
              t('templates.wellnessCheck.message.pragmatic'),
          },
          adaptive: {
            title: t('templates.wellnessCheck.title.adaptive'),
            message:
              t('templates.wellnessCheck.message.adaptive'),
          },
        },
      },
      {
        id: 'emergency_alert',
        name: t('templates.emergencyAlert.name'),
        type: 'activation_request',
        title_template: t('templates.emergencyAlert.title.adaptive'),
        message_template:
          t('templates.emergencyAlert.message.adaptive'),
        priority: 'urgent',
        delivery_method: 'all',
        personality_variants: {
          empathetic: {
            title: t('templates.emergencyAlert.title.empathetic'),
            message:
              t('templates.emergencyAlert.message.empathetic'),
          },
          pragmatic: {
            title: t('templates.emergencyAlert.title.pragmatic'),
            message:
              t('templates.emergencyAlert.message.pragmatic'),
          },
          adaptive: {
            title: t('templates.emergencyAlert.title.adaptive'),
            message:
              t('templates.emergencyAlert.message.adaptive'),
          },
        },
      },
      {
        id: 'activation_confirmation',
        name: t('templates.activationConfirmation.name'),
        type: 'verification_needed',
        title_template: t('templates.activationConfirmation.title.adaptive'),
        message_template:
          t('templates.activationConfirmation.message.adaptive'),
        priority: 'high',
        delivery_method: 'email',
        personality_variants: {
          empathetic: {
            title: t('templates.activationConfirmation.title.empathetic'),
            message:
              t('templates.activationConfirmation.message.empathetic'),
          },
          pragmatic: {
            title: t('templates.activationConfirmation.title.pragmatic'),
            message:
              t('templates.activationConfirmation.message.pragmatic'),
          },
          adaptive: {
            title: t('templates.activationConfirmation.title.adaptive'),
            message:
              t('templates.activationConfirmation.message.adaptive'),
          },
        },
      },
      {
        id: 'status_update',
        name: t('templates.statusUpdate.name'),
        type: 'status_update',
        title_template: t('templates.statusUpdate.title.adaptive'),
        message_template: t('templates.statusUpdate.message.adaptive'),
        priority: 'low',
        delivery_method: 'email',
        personality_variants: {
          empathetic: {
            title: t('templates.statusUpdate.title.empathetic'),
            message:
              t('templates.statusUpdate.message.empathetic'),
          },
          pragmatic: {
            title: t('templates.statusUpdate.title.pragmatic'),
            message:
              t('templates.statusUpdate.message.pragmatic'),
          },
          adaptive: {
            title: t('templates.statusUpdate.title.adaptive'),
            message:
              t('templates.statusUpdate.message.adaptive'),
          },
        },
      },
    ],
    []
  );

  // Load notifications and guardians
  const loadNotificationData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const supabase = await createSupabaseClient();

      // Load guardian notifications
      const { data: notificationData, error: notificationError } =
        await supabase
          .from('guardian_notifications')
          .select(
            `
          *,
          guardians!inner(name, email)
        `
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

      if (notificationError) throw notificationError;

      // Load guardians for sending new notifications
      const { data: guardianData, error: guardianError } = await supabase
        .from('guardians')
        .select('id, name, email')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (guardianError) throw guardianError;

      // Transform notification data
      const transformedNotifications: GuardianNotification[] = (
        notificationData || []
      ).map(
        n =>
          ({
            ...n,
            guardian_name: (n.guardians as any)?.name,
            guardian_email: (n.guardians as any)?.email,
          }) as any
      );

      setNotifications(transformedNotifications);
      setGuardians(guardianData || []);
      setError(null);
    } catch (err) {
      console.error('Error loading notification data:', err);
      setError(
        err instanceof Error ? err.message : t('errors.loadNotifications')
      );
    } finally {
      setLoading(false);
    }
  }, [userId, createSupabaseClient]);

  // Send notification to guardians
  const sendNotification = useCallback(async () => {
    if (!userId || selectedGuardians.length === 0) return;

    try {
      const supabase = await createSupabaseClient();
      const template = notificationTemplates.find(
        t => t.id === selectedTemplate
      );
      if (!template) return;

      const personalityContent = template.personality_variants[effectiveMode];
      const title = customMessage ? t('customMessageTitle') : personalityContent.title;
      const message = customMessage || personalityContent.message;

      const notifications = selectedGuardians.map(guardianId => ({
        guardian_id: guardianId,
        user_id: userId,
        notification_type: template.type,
        title,
        message,
        action_required:
          template.type === 'activation_request' ||
          template.type === 'verification_needed',
        priority: template.priority,
        delivery_method: template.delivery_method,
        verification_token:
          template.type === 'verification_needed' ? crypto.randomUUID() : null,
        expires_at:
          template.type === 'verification_needed'
            ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
            : null,
      }));

      const { error } = await supabase
        .from('guardian_notifications')
        .insert(notifications);

      if (error) throw error;

      toast.success(
        effectiveMode === 'empathetic'
          ? `💚 ${notifications.length} ${t('toast.success.empathetic')}`
          : effectiveMode === 'pragmatic'
            ? `🛡️ ${notifications.length} ${t('toast.success.pragmatic')}`
            : `✅ ${t('toast.success.adaptive')} ${notifications.length} guardians`
      );

      // Reset form and close dialog
      setSelectedTemplate('');
      setCustomMessage('');
      setSelectedGuardians([]);
      setShowSendDialog(false);

      // Reload notifications
      await loadNotificationData();

      // Trigger callback
      // notifications.forEach(n => _onNotificationSent?.(n as GuardianNotification)); // Not available
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error(t('toast.error.sendFailed'));
    }
  }, [
    userId,
    createSupabaseClient,
    selectedGuardians,
    selectedTemplate,
    customMessage,
    notificationTemplates,
    effectiveMode,
    loadNotificationData,
  ]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const supabase = await createSupabaseClient();

        const { error } = await supabase
          .from('guardian_notifications')
          .update({ read_at: new Date().toISOString() } as any)
          .eq('id', notificationId);

        if (error) throw error;

        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId
              ? ({ ...n, read_at: new Date().toISOString() } as any)
              : n
          )
        );

        // _onNotificationRead?.(notificationId); // Not available
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    [createSupabaseClient]
  );

  // Archive notification
  const archiveNotification = useCallback(
    async (notificationId: string) => {
      try {
        // const _supabase = await createSupabaseClient(); // Not used

        // In a real implementation, you might add an archived_at column
        // For now, we'll just remove it from the UI
        setNotifications(prev => prev.filter(n => n.id !== notificationId));

        toast.success(t('toast.archived'));
      } catch (err) {
        console.error('Error archiving notification:', err);
        toast.error(t('toast.error.archiveFailed'));
      }
    },
    [createSupabaseClient]
  );

  // Initialize data loading
  useEffect(() => {
    loadNotificationData();
  }, [loadNotificationData]);

  // Get personality-specific content
  const getPersonalityContent = () => {
    switch (effectiveMode) {
      case 'empathetic':
        return {
          title: t('title.empathetic'),
          subtitle: t('subtitle.empathetic'),
          sendButtonText: t('buttons.send.empathetic'),
          emptyMessage: t('emptyState.empathetic'),
          bgGradient: 'from-emerald-50 to-green-50',
          borderColor: 'border-emerald-200',
          accentColor: 'text-emerald-600',
          icon: Heart,
        };
      case 'pragmatic':
        return {
          title: t('title.pragmatic'),
          subtitle: t('subtitle.pragmatic'),
          sendButtonText: t('buttons.send.pragmatic'),
          emptyMessage: t('emptyState.pragmatic'),
          bgGradient: 'from-blue-50 to-slate-50',
          borderColor: 'border-blue-200',
          accentColor: 'text-blue-600',
          icon: Shield,
        };
      default:
        return {
          title: t('title.adaptive'),
          subtitle: t('subtitle.adaptive'),
          sendButtonText: t('buttons.send.adaptive'),
          emptyMessage: t('emptyState.adaptive'),
          bgGradient: 'from-purple-50 to-indigo-50',
          borderColor: 'border-purple-200',
          accentColor: 'text-purple-600',
          icon: Bell,
        };
    }
  };

  const personalityContent = getPersonalityContent();
  const IconComponent = personalityContent.icon;

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    switch (filterStatus) {
      case 'unread':
        return notifications.filter(n => !n.read_at);
      case 'action_required':
        return notifications.filter(n => n.action_required && !n.responded_at);
      default:
        return notifications;
    }
  }, [notifications, filterStatus]);

  // Get notification statistics
  const stats = useMemo(
    () => ({
      total: notifications.length,
      unread: notifications.filter(n => !n.read_at).length,
      actionRequired: notifications.filter(
        n => n.action_required && !n.responded_at
      ).length,
      sent: notifications.filter(
        n => n.delivery_status === 'sent' || n.delivery_status === 'delivered'
      ).length,
    }),
    [notifications]
  );

  if (loading) {
    return (
      <div
        className={`bg-gradient-to-br ${personalityContent.bgGradient} rounded-xl border ${personalityContent.borderColor} p-6 ${className}`}
      >
        <div className='flex items-center justify-center h-32'>
          <motion.div
            {...(!shouldReduceMotion && {
              animate: { rotate: 360 },
              transition: { duration: 2, repeat: Infinity, ease: 'linear' }
            })}
          >
            <Bell className='w-8 h-8 text-gray-400' />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`bg-gradient-to-br ${personalityContent.bgGradient} rounded-xl border ${personalityContent.borderColor} shadow-sm ${className}`}
      {...(!shouldReduceMotion && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: animConfig.duration, ease: animConfig.ease as any }
      })}
    >
      {/* Header */}
      <div className='p-6 pb-4'>
        <div className='flex items-start justify-between mb-6'>
          <div className='flex items-start gap-3'>
            <motion.div
              className={`p-2 rounded-lg bg-white/80 backdrop-blur-sm ${personalityContent.accentColor}`}
              {...(!shouldReduceMotion && {
                whileHover: { scale: 1.05 }
              })}
            >
              <IconComponent className='w-6 h-6' />
            </motion.div>

            <div>
              <h3 className='text-lg font-semibold text-gray-800 mb-1'>
                {personalityContent.title}
              </h3>
              <p className='text-sm text-gray-600'>
                {personalityContent.subtitle}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={loadNotificationData}>
              <RefreshCw className='w-4 h-4' />
            </Button>

            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
              <DialogTrigger asChild>
                <Button size='sm' className='bg-white/90 backdrop-blur-sm'>
                  <Send className='w-4 h-4 mr-2' />
                  {personalityContent.sendButtonText}
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>{personalityContent.sendButtonText}</DialogTitle>
                </DialogHeader>

                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='guardians'>{t('dialog.selectGuardians')}</Label>
                    <div className='mt-2 space-y-2 max-h-32 overflow-y-auto'>
                      {guardians.map(guardian => (
                        <div
                          key={guardian.id}
                          className='flex items-center space-x-2'
                        >
                          <input
                            type='checkbox'
                            id={guardian.id}
                            checked={selectedGuardians.includes(guardian.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedGuardians(prev => [
                                  ...prev,
                                  guardian.id,
                                ]);
                              } else {
                                setSelectedGuardians(prev =>
                                  prev.filter(id => id !== guardian.id)
                                );
                              }
                            }}
                            className='rounded border-gray-300'
                          />
                          <label htmlFor={guardian.id} className='text-sm'>
                            {guardian.name} ({guardian.email})
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='template'>{t('dialog.messageTemplate')}</Label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('dialog.templatePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {notificationTemplates.map(template => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <div className='bg-gray-50 rounded-lg p-3'>
                      <div className='text-sm font-medium text-gray-700 mb-1'>
                        {
                          notificationTemplates.find(
                            t => t.id === selectedTemplate
                          )?.personality_variants[effectiveMode]?.title
                        }
                      </div>
                      <div className='text-xs text-gray-600'>
                        {
                          notificationTemplates.find(
                            t => t.id === selectedTemplate
                          )?.personality_variants[effectiveMode]?.message
                        }
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor='custom-message'>
                      {t('dialog.customMessage')}
                    </Label>
                    <Textarea
                      id='custom-message'
                      value={customMessage}
                      onChange={e => setCustomMessage(e.target.value)}
                      placeholder={t('dialog.customMessagePlaceholder')}
                      rows={4}
                    />
                  </div>

                  <div className='flex gap-2'>
                    <Button
                      onClick={sendNotification}
                      className='flex-1'
                      disabled={
                        selectedGuardians.length === 0 ||
                        (!selectedTemplate && !customMessage)
                      }
                    >
                      {personalityContent.sendButtonText}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={() => setShowSendDialog(false)}
                    >
                      {t('buttons.cancel')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <Alert className='mb-4'>
            <AlertTriangle className='w-4 h-4' />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className='grid grid-cols-4 gap-3 mb-6'>
          <div className='bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center'>
            <div className='text-lg font-semibold text-gray-800'>
              {stats.total}
            </div>
            <div className='text-xs text-gray-600'>{t('statistics.total')}</div>
          </div>
          <div className='bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center'>
            <div className='text-lg font-semibold text-blue-600'>
              {stats.unread}
            </div>
            <div className='text-xs text-gray-600'>{t('statistics.unread')}</div>
          </div>
          <div className='bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center'>
            <div className='text-lg font-semibold text-orange-600'>
              {stats.actionRequired}
            </div>
            <div className='text-xs text-gray-600'>{t('statistics.actionRequired')}</div>
          </div>
          <div className='bg-white/60 backdrop-blur-sm rounded-lg p-3 text-center'>
            <div className='text-lg font-semibold text-green-600'>
              {stats.sent}
            </div>
            <div className='text-xs text-gray-600'>{t('statistics.delivered')}</div>
          </div>
        </div>

        {/* Filter */}
        <div className='flex items-center gap-2 mb-4'>
          <Filter className='w-4 h-4 text-gray-500' />
          <Select
            value={filterStatus}
            onValueChange={(value: string) => setFilterStatus(value as any)}
          >
            <SelectTrigger className='w-48 h-8'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('filters.all')}</SelectItem>
              <SelectItem value='unread'>{t('filters.unread')}</SelectItem>
              <SelectItem value='action_required'>{t('filters.actionRequired')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className='bg-white/60 backdrop-blur-sm rounded-lg p-8 text-center'>
            <Bell className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-600 mb-4'>
              {personalityContent.emptyMessage}
            </p>
            <Button onClick={() => setShowSendDialog(true)}>
              <Send className='w-4 h-4 mr-2' />
              {personalityContent.sendButtonText}
            </Button>
          </div>
        ) : (
          <div className='space-y-3'>
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                className={`bg-white/80 backdrop-blur-sm rounded-lg p-4 border-l-4 ${
                  notification.priority === 'urgent'
                    ? 'border-red-500'
                    : notification.priority === 'high'
                      ? 'border-orange-500'
                      : notification.priority === 'medium'
                        ? 'border-blue-500'
                        : 'border-gray-300'
                } ${!notification.read_at ? 'bg-blue-50/80' : ''}`}
                {...(!shouldReduceMotion && {
                  initial: { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { delay: index * 0.05 }
                })}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          notification.delivery_status === 'delivered'
                            ? 'bg-green-500'
                            : notification.delivery_status === 'sent'
                              ? 'bg-blue-500'
                              : notification.delivery_status === 'failed'
                                ? 'bg-red-500'
                                : 'bg-yellow-500'
                        }`}
                      />
                      <h5 className='font-medium text-gray-800'>
                        {notification.title}
                      </h5>
                      <Badge variant='outline' className='text-xs'>
                        {notification.priority}
                      </Badge>
                      {notification.action_required && (
                        <Badge variant='destructive' className='text-xs'>
                          <AlertCircle className='w-3 h-3 mr-1' />
                          {t('notifications.badges.actionRequired')}
                        </Badge>
                      )}
                      {!notification.read_at && (
                        <div className='w-2 h-2 bg-blue-500 rounded-full' />
                      )}
                    </div>

                    <p className='text-sm text-gray-600 mb-2'>
                      {notification.message}
                    </p>

                    <div className='flex items-center gap-4 text-xs text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <Users className='w-3 h-3' />
                        {t('notifications.labels.to')}: {notification.guardian_name || 'Guardian'}
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-3 h-3' />
                        {new Date(
                          notification.created_at
                        ).toLocaleDateString()}{' '}
                        {t('notifications.labels.at')}{' '}
                        {new Date(notification.created_at).toLocaleTimeString()}
                      </div>
                      {notification.expires_at && (
                        <div className='flex items-center gap-1 text-orange-600'>
                          <AlertTriangle className='w-3 h-3' />
                          {t('notifications.labels.expires')}:{' '}
                          {new Date(
                            notification.expires_at
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    {!notification.read_at && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => markAsRead(notification.id)}
                        className='text-blue-600 hover:text-blue-700'
                      >
                        <Eye className='w-4 h-4' />
                      </Button>
                    )}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => archiveNotification(notification.id)}
                      className='text-gray-600 hover:text-gray-700'
                    >
                      <Archive className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GuardianNotificationCenter;
