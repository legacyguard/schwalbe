/**
 * ContextAwareNotifications - Advanced notification system with smart timing and emotional intelligence
 *
 * Features:
 * - Intelligent timing based on user behavior patterns
 * - Emotional state-aware content adaptation
 * - Context-sensitive positioning and styling
 * - Progressive disclosure for complex notifications
 * - Smart dismissal and follow-up mechanisms
 * - Sofia AI integration for personalized messaging
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
// Note: These modules would need to be implemented in a real application
// import { useNotificationHistory } from '../../hooks/useNotificationHistory';
// import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
// import { NotificationAnalytics } from '../../utils/NotificationAnalytics';

// Mock implementations for development
const useNotificationHistory = () => ({
  addToHistory: (...args: any[]) => {},
});

class SofiaMessageGenerator {
  generateMessage(...args: any[]) {
    return 'Sofia is here to help you.';
  }
}

class NotificationAnalytics {
  trackShown(...args: any[]) {}
  trackDismissed(...args: any[]) {}
  trackEngaged(...args: any[]) {}
  trackViewed(...args: any[]) {}
}

// TypeScript interfaces for type safety
export interface NotificationContext {
  userActivity: 'active' | 'idle' | 'focused' | 'distracted';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  currentTask: 'browsing' | 'creating' | 'reviewing' | 'planning';
  emotionalState: 'calm' | 'anxious' | 'excited' | 'overwhelmed' | 'focused';
  urgency: 'low' | 'medium' | 'high';
  category: 'reminder' | 'achievement' | 'warning' | 'celebration' | 'guidance';
}

export interface NotificationContent {
  id: string;
  title: string;
  message: string;
  sofiaMessage?: string;
  actions?: NotificationAction[];
  priority: number;
  category: NotificationContext['category'];
  emotionalTone: 'supportive' | 'encouraging' | 'urgent' | 'celebratory' | 'gentle';
  visualStyle: 'minimal' | 'prominent' | 'celebratory' | 'urgent';
  autoDismiss?: boolean;
  dismissDelay?: number;
  followUp?: NotificationFollowUp;
  position?: NotificationPosition;
  timing?: string;
}

export interface NotificationAction {
  label: string;
  action: string;
  primary?: boolean;
  destructive?: boolean;
  emotionalImpact?: 'positive' | 'neutral' | 'negative';
}

export interface NotificationFollowUp {
  delay: number;
  type: 'reminder' | 'encouragement' | 'guidance';
  message: string;
  sofiaMessage?: string;
}

export interface NotificationPosition {
  x: 'left' | 'center' | 'right';
  y: 'top' | 'bottom';
  quadrant?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface NotificationPreferences {
  maxNotifications: number;
  preferredPosition: NotificationPosition;
  quietHours: { start: number; end: number };
  emotionalSensitivity: 'low' | 'medium' | 'high';
  notificationStyle: 'toast' | 'banner' | 'modal' | 'inline';
  autoRead: boolean;
  smartTiming: boolean;
}

export interface ContextAwareNotificationsProps {
  notifications: NotificationContent[];
  preferences?: Partial<NotificationPreferences>;
  onNotificationAction?: (notificationId: string, action: string) => void;
  onNotificationDismiss?: (notificationId: string, reason: 'user' | 'auto' | 'replaced') => void;
  onNotificationEngage?: (notificationId: string, engagement: 'view' | 'interact' | 'dismiss') => void;
  className?: string;
}

// Advanced notification timing engine
class NotificationTimingEngine {
  private userPatterns: Map<string, any> = new Map();
  private emotionalContext: Map<string, any> = new Map();

  analyzeOptimalTiming(context: NotificationContext): {
    timing: 'now' | 'delayed' | 'scheduled';
    delay?: number;
    reason: string;
  } {
    const { userActivity, timeOfDay, emotionalState, urgency } = context;

    // High priority notifications should be shown immediately
    if (urgency === 'high') {
      return { timing: 'now', reason: 'High urgency requires immediate attention' };
    }

    // Don't interrupt focused work unless high priority
    if (userActivity === 'focused' && urgency === 'low') {
      return {
        timing: 'delayed',
        delay: 300000, // 5 minutes
        reason: 'User is focused, delaying to avoid interruption'
      };
    }

    // Adjust timing based on emotional state
    if (emotionalState === 'overwhelmed') {
      return {
        timing: 'delayed',
        delay: 600000, // 10 minutes
        reason: 'User appears overwhelmed, giving space before notification'
      };
    }

    // Quiet hours consideration
    const hour = new Date().getHours();
    if ((hour >= 22 && hour <= 7) && urgency === 'low') {
      return {
        timing: 'scheduled',
        delay: (8 - hour) * 3600000, // Schedule for 8 AM
        reason: 'Within quiet hours, scheduling for morning'
      };
    }

    return { timing: 'now', reason: 'Optimal timing conditions met' };
  }

  learnFromInteraction(notificationId: string, interaction: 'viewed' | 'dismissed' | 'engaged'): void {
    // Learn from user behavior patterns
    const pattern = this.userPatterns.get(notificationId) || {};
    pattern.lastInteraction = interaction;
    pattern.interactionTime = Date.now();
    this.userPatterns.set(notificationId, pattern);
  }
}

// Smart positioning engine
class NotificationPositioningEngine {
  calculateOptimalPosition(
    context: NotificationContext,
    preferences: NotificationPreferences,
    existingNotifications: NotificationContent[]
  ): NotificationPosition {
    const { userActivity, currentTask, emotionalState } = context;

    // Base position from preferences
    const position = { ...preferences.preferredPosition };

    // Adjust based on current task
    if (currentTask === 'creating' || currentTask === 'planning') {
      position.y = 'bottom'; // Don't block creation area
    }

    // Adjust based on emotional state
    if (emotionalState === 'anxious') {
      position.x = 'right'; // Less intrusive positioning
    }

    // Avoid overlapping with existing notifications
    const occupiedPositions = new Set(
      existingNotifications.map(n => `${n.position?.x}-${n.position?.y}`)
    );

    while (occupiedPositions.has(`${position.x}-${position.y}`)) {
      // Try alternative positions
      if (position.y === 'top') {
        position.y = 'bottom';
      } else if (position.x === 'right') {
        position.x = 'left';
      } else {
        break; // Accept overlap if no alternatives
      }
    }

    return position;
  }
}

// Main component implementation
export const ContextAwareNotifications: React.FC<ContextAwareNotificationsProps> = ({
  notifications,
  preferences = {},
  onNotificationAction,
  onNotificationDismiss,
  onNotificationEngage,
  className = ''
}) => {
  const [activeNotifications, setActiveNotifications] = useState<NotificationContent[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [notificationQueue, setNotificationQueue] = useState<NotificationContent[]>([]);

  const timingEngine = useRef(new NotificationTimingEngine());
  const positioningEngine = useRef(new NotificationPositioningEngine());
  const analytics = useRef(new NotificationAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences: userPrefs } = useUserPreferences();
  const { addToHistory } = useNotificationHistory();

  // Merge preferences - avoid duplicate properties
  const defaultPreferences: NotificationPreferences = {
    maxNotifications: 3,
    preferredPosition: { x: 'right', y: 'top' },
    quietHours: { start: 22, end: 8 },
    emotionalSensitivity: 'medium',
    notificationStyle: 'toast',
    autoRead: false,
    smartTiming: true,
  };

  const mergedPreferences: NotificationPreferences = {
    ...defaultPreferences,
    ...userPrefs.notifications,
    ...preferences
  };

  // Process notification queue
  const processQueue = useCallback(() => {
    if (notificationQueue.length === 0) return;

    const firstNotification = notificationQueue[0];
    if (!firstNotification) return;

    const context: NotificationContext = {
      userActivity: 'active', // This would come from activity tracking
      timeOfDay: getTimeOfDay(),
      currentTask: 'browsing', // This would come from task detection
      emotionalState,
      urgency: firstNotification.priority > 8 ? 'high' : firstNotification.priority > 5 ? 'medium' : 'low' as const,
      category: firstNotification.category
    };

    const timing = timingEngine.current.analyzeOptimalTiming(context);

    if (timing.timing === 'now' && activeNotifications.length < mergedPreferences.maxNotifications) {
      const notification = notificationQueue.shift();
      if (notification) {
        const position = positioningEngine.current.calculateOptimalPosition(
          context,
          mergedPreferences,
          activeNotifications
        );

        const enhancedNotification = {
          ...notification,
          position,
          timing: timing.reason
        };

        setActiveNotifications(prev => [...prev, enhancedNotification]);
        setNotificationQueue([...notificationQueue]);

        // Track analytics
        analytics.current.trackShown(notification.id, context, timing.reason);

        // Auto-dismiss if configured
        if (notification.autoDismiss && notification.dismissDelay) {
          setTimeout(() => {
            handleDismiss(notification.id, 'auto');
          }, notification.dismissDelay);
        }
      }
    }
  }, [notificationQueue, activeNotifications.length, emotionalState, mergedPreferences]);

  // Queue management effect
  useEffect(() => {
    if (notifications.length > 0) {
      const newNotifications = notifications.filter(n => !dismissedNotifications.has(n.id));
      setNotificationQueue(prev => [...prev, ...newNotifications]);
    }
  }, [notifications, dismissedNotifications]);

  // Process queue when conditions are met
  useEffect(() => {
    const interval = setInterval(processQueue, 1000);
    return () => clearInterval(interval);
  }, [processQueue]);

  const getTimeOfDay = useCallback((): NotificationContext['timeOfDay'] => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }, []);

  const handleDismiss = useCallback((notificationId: string, reason: 'user' | 'auto' | 'replaced') => {
    setActiveNotifications(prev => prev.filter(n => n.id !== notificationId));
    setDismissedNotifications(prev => new Set([...prev, notificationId]));

    onNotificationDismiss?.(notificationId, reason);
    analytics.current.trackDismissed(notificationId, reason);

    // Process follow-up if configured
    const notification = activeNotifications.find(n => n.id === notificationId);
    if (notification?.followUp) {
      const followUp = notification.followUp;
      setTimeout(() => {
        // Queue follow-up notification
        const followUpNotification: NotificationContent = {
          id: `${notificationId}-followup`,
          title: 'Follow-up',
          message: followUp.message || 'How can I help you further?',
          sofiaMessage: followUp.sofiaMessage,
          category: 'guidance',
          priority: 3,
          emotionalTone: 'gentle',
          visualStyle: 'minimal',
          autoDismiss: true,
          dismissDelay: 5000
        };
        setNotificationQueue(prev => [...prev, followUpNotification]);
      }, followUp.delay);
    }
  }, [activeNotifications, onNotificationDismiss]);

  const handleAction = useCallback((notificationId: string, action: string) => {
    onNotificationAction?.(notificationId, action);
    analytics.current.trackEngaged(notificationId, action);
    onNotificationEngage?.(notificationId, 'interact');
  }, [onNotificationAction, onNotificationEngage]);

  const handleEngage = useCallback((notificationId: string) => {
    onNotificationEngage?.(notificationId, 'view');
    analytics.current.trackViewed(notificationId);
  }, [onNotificationEngage]);

  // Generate Sofia message based on emotional context
  const generateSofiaMessage = useCallback((notification: NotificationContent): string => {
    const sofiaGenerator = new SofiaMessageGenerator();

    return sofiaGenerator.generateMessage({
      type: 'notification',
      context: notification.category,
      emotionalTone: notification.emotionalTone,
      userEmotionalState: emotionalState,
      urgency: notification.priority > 7 ? 'high' : notification.priority > 4 ? 'medium' : 'low'
    });
  }, [emotionalState]);

  // Notification variants for different styles
  const getNotificationVariants = (style: NotificationContent['visualStyle']) => {
    const baseVariants = {
      hidden: {
        opacity: 0,
        scale: 0.8,
        y: style === 'urgent' ? -20 : 20,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          type: 'spring',
          stiffness: style === 'urgent' ? 400 : 300,
          damping: style === 'urgent' ? 30 : 25,
        }
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        y: style === 'urgent' ? -10 : 10,
        transition: { duration: 0.2 }
      }
    };

    if (style === 'celebratory') {
      return {
        ...baseVariants,
        visible: {
          ...baseVariants.visible,
          rotate: [0, -2, 2, 0],
          transition: {
            ...baseVariants.visible.transition,
            rotate: {
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut'
            }
          }
        }
      };
    }

    return baseVariants;
  };

  // Get position styles
  const getPositionStyles = (position: NotificationPosition) => {
    const base = {
      position: 'fixed' as const,
      zIndex: 1000,
    };

    const positions = {
      'top-left': { top: 20, left: 20 },
      'top-right': { top: 20, right: 20 },
      'bottom-left': { bottom: 20, left: 20 },
      'bottom-right': { bottom: 20, right: 20 },
      'top-center': { top: 20, left: '50%', transform: 'translateX(-50%)' },
      'bottom-center': { bottom: 20, left: '50%', transform: 'translateX(-50%)' },
    };

    const key = position.quadrant || `${position.y}-${position.x}`;
    return { ...base, ...positions[key as keyof typeof positions] };
  };

  return (
    <div className={`context-aware-notifications ${className}`}>
      <AnimatePresence mode="popLayout">
        {activeNotifications.map((notification, index) => {
          const position = notification.position || mergedPreferences.preferredPosition;
          const sofiaMessage = notification.sofiaMessage || generateSofiaMessage(notification);

          return (
            <motion.div
              key={notification.id}
              className={`notification notification--${notification.visualStyle}`}
              style={getPositionStyles(position)}
              variants={getNotificationVariants(notification.visualStyle)}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
              onHoverStart={() => handleEngage(notification.id)}
              onClick={() => handleEngage(notification.id)}
            >
              {/* Notification content */}
              <div className="notification__content">
                <div className="notification__header">
                  <h4 className="notification__title">{notification.title}</h4>
                  {notification.visualStyle === 'urgent' && (
                    <div className="notification__urgency-indicator" />
                  )}
                </div>

                <p className="notification__message">{notification.message}</p>

                {sofiaMessage && (
                  <div className="notification__sofia">
                    <div className="sofia-avatar">
                      <span className="sofia-avatar__emoji">🧚‍♀️</span>
                    </div>
                    <p className="sofia-message">{sofiaMessage}</p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="notification__actions">
                  {notification.actions.map((action) => (
                    <button
                      key={action.action}
                      className={`notification__action ${
                        action.primary ? 'notification__action--primary' : ''
                      } ${
                        action.destructive ? 'notification__action--destructive' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAction(notification.id, action.action);
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Dismiss button */}
              <button
                className="notification__dismiss"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss(notification.id, 'user');
                }}
                aria-label="Dismiss notification"
              >
                ×
              </button>

              {/* Progress bar for auto-dismiss */}
              {notification.autoDismiss && (
                <div className="notification__progress">
                  <motion.div
                    className="notification__progress-bar"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{
                      duration: (notification.dismissDelay || 5000) / 1000,
                      ease: 'linear'
                    }}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ContextAwareNotifications;