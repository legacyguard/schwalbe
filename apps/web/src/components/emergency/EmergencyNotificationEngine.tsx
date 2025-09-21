/**
 * Emergency Notification Engine
 * Handles emergency activation protocols and notification workflows
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import { PersonalityAwareAnimation } from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';

interface EmergencyNotification {
  id: string;
  type: 'health_check_missed' | 'manual_activation' | 'guardian_triggered' | 'system_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredBy?: string;
  triggeredAt: Date;
  status: 'pending' | 'sent' | 'acknowledged' | 'escalated' | 'resolved';
  recipients: EmergencyContact[];
  attempts: NotificationAttempt[];
  escalationLevel: number;
  maxEscalationLevel: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'primary' | 'secondary' | 'backup';
  priority: number;
  preferredMethod: 'email' | 'sms' | 'phone' | 'all';
  lastContact?: Date;
  responseStatus?: 'pending' | 'acknowledged' | 'no_response';
}

interface NotificationAttempt {
  id: string;
  contactId: string;
  method: 'email' | 'sms' | 'phone';
  sentAt: Date;
  status: 'sent' | 'delivered' | 'failed' | 'acknowledged';
  response?: string;
  responseAt?: Date;
}

interface EmergencyProtocol {
  id: string;
  name: string;
  triggerConditions: string[];
  escalationTimeMinutes: number;
  maxAttempts: number;
  requiresAcknowledgment: boolean;
  autoResolve: boolean;
  customMessage?: string;
}

interface EmergencyNotificationEngineProps {
  emergencyContacts?: EmergencyContact[];
  protocols?: EmergencyProtocol[];
  onTriggerEmergency?: (type: EmergencyNotification['type'], severity: EmergencyNotification['severity']) => void;
  onUpdateContact?: (contactId: string, updates: Partial<EmergencyContact>) => void;
  onCreateProtocol?: (protocol: Omit<EmergencyProtocol, 'id'>) => void;
  onTestNotification?: (contactId: string, method: string) => void;
}

const defaultProtocols: EmergencyProtocol[] = [
  {
    id: 'health_check',
    name: 'Health Check Missed',
    triggerConditions: ['No activity for 72 hours', 'Missed 3 consecutive check-ins'],
    escalationTimeMinutes: 60,
    maxAttempts: 3,
    requiresAcknowledgment: true,
    autoResolve: false,
    customMessage: 'We haven\'t heard from you in a while. Please respond to confirm you\'re okay.'
  },
  {
    id: 'manual_activation',
    name: 'Manual Emergency',
    triggerConditions: ['User manually triggered emergency', 'Emergency button pressed'],
    escalationTimeMinutes: 15,
    maxAttempts: 5,
    requiresAcknowledgment: true,
    autoResolve: false,
    customMessage: 'An emergency has been manually triggered. Immediate response required.'
  },
  {
    id: 'guardian_alert',
    name: 'Guardian Alert',
    triggerConditions: ['Guardian requested emergency contact', 'Guardian escalation'],
    escalationTimeMinutes: 30,
    maxAttempts: 4,
    requiresAcknowledgment: true,
    autoResolve: false
  }
];

export default function EmergencyNotificationEngine({
  emergencyContacts = [],
  protocols = defaultProtocols,
  onTriggerEmergency,
  onUpdateContact,
  onCreateProtocol,
  onTestNotification
}: EmergencyNotificationEngineProps) {
  const [activeNotifications, setActiveNotifications] = useState<EmergencyNotification[]>([]);
  const [showEmergencyPanel, setShowEmergencyPanel] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<EmergencyNotification['severity']>('medium');
  const [systemStatus, setSystemStatus] = useState<'operational' | 'testing' | 'emergency' | 'maintenance'>('operational');
  const [lastHealthCheck, setLastHealthCheck] = useState<Date>(new Date());

  // Initialize Sofia personality for emergency guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.trustBuilder);

  useEffect(() => {
    adaptToContext('trust');
  }, [adaptToContext]);

  // Simulate health check monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      setLastHealthCheck(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleEmergencyActivation = useCallback((type: EmergencyNotification['type'], customMessage?: string) => {
    const notification: EmergencyNotification = {
      id: `emergency_${Date.now()}`,
      type,
      severity: selectedSeverity,
      message: customMessage || emergencyMessage || 'Emergency assistance needed.',
      triggeredAt: new Date(),
      status: 'pending',
      recipients: emergencyContacts.filter(contact => contact.role === 'primary'),
      attempts: [],
      escalationLevel: 0,
      maxEscalationLevel: 3
    };

    setActiveNotifications(prev => [notification, ...prev]);
    setSystemStatus('emergency');
    onTriggerEmergency?.(type, selectedSeverity);

    learnFromInteraction({
      type: 'click',
      duration: 2000,
      context: 'trust'
    });

    // Simulate notification sending
    setTimeout(() => {
      setActiveNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, status: 'sent' as const } : n)
      );
    }, 2000);
  }, [selectedSeverity, emergencyMessage, emergencyContacts, onTriggerEmergency, learnFromInteraction]);

  const handleTestNotification = useCallback((contactId: string, method: string) => {
    onTestNotification?.(contactId, method);

    // Show test notification
    const testNotification: EmergencyNotification = {
      id: `test_${Date.now()}`,
      type: 'system_alert',
      severity: 'low',
      message: `Test notification sent via ${method}`,
      triggeredAt: new Date(),
      status: 'sent',
      recipients: emergencyContacts.filter(c => c.id === contactId),
      attempts: [],
      escalationLevel: 0,
      maxEscalationLevel: 1
    };

    setActiveNotifications(prev => [testNotification, ...prev]);

    // Auto-resolve test notification
    setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== testNotification.id));
    }, 5000);
  }, [emergencyContacts, onTestNotification]);

  const getSeverityColor = (severity: EmergencyNotification['severity']) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: EmergencyNotification['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'acknowledged': return 'text-green-600 bg-green-100';
      case 'escalated': return 'text-orange-600 bg-orange-100';
      case 'resolved': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSystemStatusColor = () => {
    switch (systemStatus) {
      case 'operational': return 'text-green-600 bg-green-100';
      case 'testing': return 'text-blue-600 bg-blue-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const timeSinceLastHealthCheck = Math.floor((new Date().getTime() - lastHealthCheck.getTime()) / 1000);

  return (
    <PersonalityAwareAnimation personality={personality} context="trust">
      <div className="w-full space-y-6">
        {/* Emergency System Status */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <Card className={`border-2 transition-all duration-300 ${
            systemStatus === 'emergency' ? 'border-red-500 bg-red-50' :
            systemStatus === 'operational' ? 'border-green-500 bg-green-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  🚨 Emergency System Status
                  <motion.div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getSystemStatusColor()}`}
                    animate={{ scale: systemStatus === 'emergency' ? [1, 1.05, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: systemStatus === 'emergency' ? Infinity : 0 }}
                  >
                    {systemStatus.toUpperCase()}
                  </motion.div>
                </CardTitle>
                <Button
                  onClick={() => setShowEmergencyPanel(!showEmergencyPanel)}
                  className={`${
                    showEmergencyPanel ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  {showEmergencyPanel ? 'Hide Emergency Panel' : '🚨 Emergency Activation'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">💓</div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Health Check</p>
                    <p className="font-medium">
                      {timeSinceLastHealthCheck < 60 ? `${timeSinceLastHealthCheck}s ago` :
                       timeSinceLastHealthCheck < 3600 ? `${Math.floor(timeSinceLastHealthCheck / 60)}m ago` :
                       `${Math.floor(timeSinceLastHealthCheck / 3600)}h ago`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🛡️</div>
                  <div>
                    <p className="text-sm text-muted-foreground">Emergency Contacts</p>
                    <p className="font-medium">{emergencyContacts.length} configured</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔔</div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                    <p className="font-medium">{activeNotifications.filter(n => n.status !== 'resolved').length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Emergency Activation Panel */}
        <AnimatePresence>
          {showEmergencyPanel && (
            <LiquidMotion.ScaleIn delay={0}>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-red-500 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-700">🚨 Emergency Activation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Emergency Severity</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(['low', 'medium', 'high', 'critical'] as const).map((severity) => (
                          <Button
                            key={severity}
                            size="sm"
                            variant={selectedSeverity === severity ? 'default' : 'outline'}
                            onClick={() => setSelectedSeverity(severity)}
                            className={`${selectedSeverity === severity ? getSeverityColor(severity) : ''}`}
                          >
                            {severity.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Emergency Message</label>
                      <Textarea
                        value={emergencyMessage}
                        onChange={(e) => setEmergencyMessage(e.target.value)}
                        placeholder="Describe the emergency situation..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => handleEmergencyActivation('manual_activation')}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={systemStatus === 'emergency'}
                      >
                        🚨 Activate Emergency
                      </Button>
                      <Button
                        onClick={() => handleEmergencyActivation('health_check_missed', 'Testing emergency system')}
                        variant="outline"
                        className="border-yellow-500 text-yellow-700 hover:bg-yellow-50"
                      >
                        🧪 Test System
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </LiquidMotion.ScaleIn>
          )}
        </AnimatePresence>

        {/* Emergency Contacts Management */}
        <LiquidMotion.ScaleIn delay={0.4}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Emergency Contacts
                <span className="text-sm text-muted-foreground">
                  ({emergencyContacts.length} contacts)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emergencyContacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">📞</div>
                    <p>No emergency contacts configured.</p>
                    <p className="text-sm">Add trusted contacts to receive emergency notifications.</p>
                  </div>
                ) : (
                  emergencyContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="border-2 border-border hover:border-primary/50 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">
                                {contact.role === 'primary' ? '🛡️' :
                                 contact.role === 'secondary' ? '🔄' : '📦'}
                              </div>
                              <div>
                                <h3 className="font-medium">{contact.name}</h3>
                                <div className="text-sm text-muted-foreground">
                                  <p>{contact.email}</p>
                                  <p>{contact.phone}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                contact.role === 'primary' ? 'bg-green-100 text-green-600' :
                                contact.role === 'secondary' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {contact.role}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTestNotification(contact.id, contact.preferredMethod)}
                              >
                                Test
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Active Notifications */}
        {activeNotifications.length > 0 && (
          <LiquidMotion.ScaleIn delay={0.6}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔔 Active Notifications
                  <span className="text-sm text-muted-foreground">
                    ({activeNotifications.filter(n => n.status !== 'resolved').length} active)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AnimatePresence>
                    {activeNotifications.slice(0, 5).map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`border-2 ${
                          notification.severity === 'critical' ? 'border-red-500 bg-red-50' :
                          notification.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                          notification.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(notification.severity)}`}>
                                  {notification.severity}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                                  {notification.status}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {notification.triggeredAt.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{notification.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Recipients: {notification.recipients.map(r => r.name).join(', ')}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </LiquidMotion.ScaleIn>
        )}

        {/* Sofia Guidance */}
        <LiquidMotion.ScaleIn delay={0.8}>
          <motion.div
            className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl px-4 py-3"
            animate={{
              boxShadow: [
                '0 0 15px rgba(34, 197, 94, 0.1)',
                '0 0 25px rgba(34, 197, 94, 0.15)',
                '0 0 15px rgba(34, 197, 94, 0.1)',
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-green-600 text-sm font-medium">
                ✨ Sofia: "{systemStatus === 'emergency'
                  ? 'Emergency protocol activated. Your trusted contacts are being notified immediately.'
                  : emergencyContacts.length === 0
                    ? 'Set up emergency contacts first. They\'re your lifeline when you need help most.'
                    : timeSinceLastHealthCheck > 86400
                      ? 'Consider updating your health check. Your family worries when they don\'t hear from you.'
                      : 'Your emergency system is ready. Your family can rest knowing you\'re protected.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}