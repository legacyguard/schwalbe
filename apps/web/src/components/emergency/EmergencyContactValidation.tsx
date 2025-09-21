/**
 * Emergency Contact Validation System
 * Validates and verifies emergency contacts through multiple methods
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LiquidMotion } from '@/components/animations/LiquidMotion';
import { PersonalityAwareAnimation } from '@/components/animations/PersonalityAwareAnimations';
import {
  useSofiaPersonality,
  PersonalityPresets
} from '@/components/sofia-firefly/SofiaFireflyPersonality';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  isPrimary: boolean;
  isBackup: boolean;
  validationStatus: 'unverified' | 'email_pending' | 'phone_pending' | 'verified' | 'failed';
  lastValidated?: Date;
  validationHistory: ValidationAttempt[];
  reachabilityScore: number; // 0-100
  responseTime?: number; // average response time in minutes
  preferredContactMethod: 'email' | 'phone' | 'both';
}

interface ValidationAttempt {
  id: string;
  method: 'email' | 'sms' | 'voice_call' | 'test_notification';
  status: 'sent' | 'delivered' | 'responded' | 'failed' | 'timeout';
  timestamp: Date;
  responseTime?: number;
  verificationCode?: string;
  errorDetails?: string;
}

interface ValidationTest {
  id: string;
  contactId: string;
  type: 'scheduled' | 'manual' | 'emergency_drill';
  methods: string[];
  scheduledDate: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: ValidationAttempt[];
}

interface EmergencyContactValidationProps {
  emergencyContacts?: EmergencyContact[];
  onValidateContact?: (contactId: string, method: 'email' | 'sms' | 'voice_call') => Promise<void>;
  onUpdateContact?: (contactId: string, updates: Partial<EmergencyContact>) => Promise<void>;
  onRunEmergencyDrill?: (contactIds: string[]) => Promise<void>;
  onScheduleValidation?: (contactId: string, scheduledDate: Date, methods: string[]) => Promise<void>;
}

const validationMethods = [
  {
    key: 'email',
    label: 'Email Verification',
    icon: '📧',
    description: 'Send verification email with response required'
  },
  {
    key: 'sms',
    label: 'SMS Verification',
    icon: '📱',
    description: 'Send SMS with verification code'
  },
  {
    key: 'voice_call',
    label: 'Voice Call',
    icon: '☎️',
    description: 'Automated voice call with verification'
  },
  {
    key: 'test_notification',
    label: 'Test Emergency Alert',
    icon: '🚨',
    description: 'Send test emergency notification'
  }
];

export default function EmergencyContactValidation({
  emergencyContacts = [],
  onValidateContact,
  onUpdateContact,
  onRunEmergencyDrill,
  onScheduleValidation
}: EmergencyContactValidationProps) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'validate' | 'schedule' | 'history'>('overview');
  const [validationInProgress, setValidationInProgress] = useState<Set<string>>(new Set());
  const [selectedMethods, setSelectedMethods] = useState<Set<string>>(new Set(['email']));

  // Initialize Sofia personality for validation guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.nurturingUser);

  useEffect(() => {
    adaptToContext('validating');
  }, [adaptToContext]);

  const getValidationStatusColor = (status: EmergencyContact['validationStatus']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500';
      case 'email_pending':
      case 'phone_pending':
        return 'bg-blue-500';
      case 'unverified':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: EmergencyContact['validationStatus']) => {
    switch (status) {
      case 'verified':
        return '✅';
      case 'email_pending':
        return '📧';
      case 'phone_pending':
        return '📱';
      case 'unverified':
        return '❓';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getReachabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateOverallValidationScore = () => {
    if (emergencyContacts.length === 0) return 0;
    const totalScore = emergencyContacts.reduce((acc, contact) => {
      const validationScore = contact.validationStatus === 'verified' ? 100 :
        contact.validationStatus.includes('pending') ? 50 : 0;
      return acc + (validationScore * contact.reachabilityScore / 100);
    }, 0);
    return Math.round(totalScore / emergencyContacts.length);
  };

  const handleValidateContact = async (contactId: string, method: 'email' | 'sms' | 'voice_call') => {
    setValidationInProgress(prev => new Set(prev).add(contactId));
    try {
      await onValidateContact?.(contactId, method);
      learnFromInteraction({
        type: 'validation_started',
        duration: 500,
        context: 'validating'
      });
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setValidationInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(contactId);
        return newSet;
      });
    }
  };

  const handleEmergencyDrill = async () => {
    const contactIds = emergencyContacts.map(c => c.id);
    try {
      await onRunEmergencyDrill?.(contactIds);
      learnFromInteraction({
        type: 'emergency_drill',
        duration: 2000,
        context: 'validating'
      });
    } catch (error) {
      console.error('Emergency drill failed:', error);
    }
  };

  const verifiedContacts = emergencyContacts.filter(c => c.validationStatus === 'verified');
  const pendingContacts = emergencyContacts.filter(c => c.validationStatus.includes('pending'));
  const failedContacts = emergencyContacts.filter(c => c.validationStatus === 'failed' || c.validationStatus === 'unverified');

  const overallScore = calculateOverallValidationScore();

  return (
    <PersonalityAwareAnimation personality={personality} context="validating">
      <div className="w-full space-y-6">
        {/* Header & Overview */}
        <LiquidMotion.ScaleIn delay={0.1}>
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                🚨 Emergency Contact Validation
                <motion.div
                  className={`text-sm px-3 py-1 rounded-full text-white ${
                    overallScore >= 80 ? 'bg-green-500' :
                    overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {overallScore}% Ready
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ensure your emergency contacts are reachable when it matters most. Regular validation prevents failed emergency notifications.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  className="text-center p-3 bg-green-100 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl text-green-600">✅</div>
                  <div className="font-medium">{verifiedContacts.length}</div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                </motion.div>

                <motion.div
                  className="text-center p-3 bg-blue-100 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl text-blue-600">⏳</div>
                  <div className="font-medium">{pendingContacts.length}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </motion.div>

                <motion.div
                  className="text-center p-3 bg-yellow-100 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl text-yellow-600">❓</div>
                  <div className="font-medium">{failedContacts.length}</div>
                  <div className="text-sm text-muted-foreground">Needs Attention</div>
                </motion.div>

                <motion.div
                  className="text-center p-3 bg-red-100 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  onClick={handleEmergencyDrill}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="text-2xl text-red-600">🚨</div>
                  <div className="font-medium text-sm">Run Drill</div>
                  <div className="text-xs text-muted-foreground">Test All</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Tab Navigation */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {[
              { key: 'overview', label: 'Contact Overview', icon: '👥' },
              { key: 'validate', label: 'Validate Now', icon: '🔍' },
              { key: 'schedule', label: 'Schedule Tests', icon: '📅' },
              { key: 'history', label: 'Validation History', icon: '📋' }
            ].map((tab) => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                className="flex-1"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>
        </LiquidMotion.ScaleIn>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      👥 Emergency Contacts Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {emergencyContacts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-4">📞</div>
                        <p>No emergency contacts configured</p>
                        <p className="text-sm">Add emergency contacts to get started with validation.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {emergencyContacts.map((contact, index) => (
                          <motion.div
                            key={contact.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className={`border-2 transition-all cursor-pointer ${
                              selectedContact === contact.id
                                ? 'border-primary shadow-lg'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedContact(selectedContact === contact.id ? null : contact.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <motion.div
                                        className={`w-4 h-4 rounded-full ${getValidationStatusColor(contact.validationStatus)} mb-1`}
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                                      />
                                      <div className="text-xs">{getStatusIcon(contact.validationStatus)}</div>
                                    </div>

                                    <div>
                                      <h3 className="font-medium flex items-center gap-2">
                                        {contact.name}
                                        {contact.isPrimary && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Primary</span>}
                                        {contact.isBackup && <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Backup</span>}
                                      </h3>
                                      <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {contact.email && `📧 ${contact.email}`}
                                        {contact.phone && ` 📱 ${contact.phone}`}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <div className={`text-lg font-bold ${getReachabilityColor(contact.reachabilityScore)}`}>
                                      {contact.reachabilityScore}%
                                    </div>
                                    <div className="text-xs text-muted-foreground">Reachability</div>
                                    {contact.responseTime && (
                                      <div className="text-xs text-muted-foreground">
                                        Avg: {contact.responseTime}min
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Expanded Contact Details */}
                                <AnimatePresence>
                                  {selectedContact === contact.id && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="mt-4 border-t pt-4"
                                    >
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                          <h4 className="font-medium mb-2">Last Validation</h4>
                                          <p className="text-sm text-muted-foreground">
                                            {contact.lastValidated
                                              ? contact.lastValidated.toLocaleDateString()
                                              : 'Never validated'
                                            }
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-medium mb-2">Preferred Method</h4>
                                          <p className="text-sm text-muted-foreground capitalize">
                                            {contact.preferredContactMethod}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleValidateContact(contact.id, 'email');
                                          }}
                                          disabled={validationInProgress.has(contact.id) || !contact.email}
                                        >
                                          📧 Email Test
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleValidateContact(contact.id, 'sms');
                                          }}
                                          disabled={validationInProgress.has(contact.id) || !contact.phone}
                                        >
                                          📱 SMS Test
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleValidateContact(contact.id, 'voice_call');
                                          }}
                                          disabled={validationInProgress.has(contact.id) || !contact.phone}
                                        >
                                          ☎️ Call Test
                                        </Button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'validate' && (
            <motion.div
              key="validate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      🔍 Validate Contacts Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Validation Methods */}
                      <div>
                        <h3 className="font-medium mb-3">Choose Validation Methods</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {validationMethods.map(method => (
                            <motion.div
                              key={method.key}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                selectedMethods.has(method.key)
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => {
                                const newMethods = new Set(selectedMethods);
                                if (newMethods.has(method.key)) {
                                  newMethods.delete(method.key);
                                } else {
                                  newMethods.add(method.key);
                                }
                                setSelectedMethods(newMethods);
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{method.icon}</div>
                                <div>
                                  <div className="font-medium">{method.label}</div>
                                  <div className="text-sm text-muted-foreground">{method.description}</div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Batch Validation */}
                      <div className="flex gap-4">
                        <Button
                          className="flex-1 bg-primary hover:bg-primary/90"
                          onClick={handleEmergencyDrill}
                          disabled={selectedMethods.size === 0}
                        >
                          🚨 Run Emergency Drill (All Contacts)
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            verifiedContacts.forEach(contact => {
                              if (selectedMethods.has('email') && contact.email) {
                                handleValidateContact(contact.id, 'email');
                              }
                            });
                          }}
                          disabled={selectedMethods.size === 0 || verifiedContacts.length === 0}
                        >
                          🔄 Re-validate Verified Contacts
                        </Button>
                      </div>

                      {/* Individual Contact Validation */}
                      <div>
                        <h3 className="font-medium mb-3">Individual Contact Validation</h3>
                        <div className="space-y-3">
                          {emergencyContacts.map(contact => (
                            <div
                              key={contact.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <motion.div
                                  className={`w-3 h-3 rounded-full ${getValidationStatusColor(contact.validationStatus)}`}
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                                <div>
                                  <div className="font-medium">{contact.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {contact.validationStatus} • {contact.reachabilityScore}% reachable
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {contact.email && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleValidateContact(contact.id, 'email')}
                                    disabled={validationInProgress.has(contact.id)}
                                  >
                                    {validationInProgress.has(contact.id) ? '⏳' : '📧'}
                                  </Button>
                                )}
                                {contact.phone && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleValidateContact(contact.id, 'sms')}
                                    disabled={validationInProgress.has(contact.id)}
                                  >
                                    {validationInProgress.has(contact.id) ? '⏳' : '📱'}
                                  </Button>
                                )}
                                {contact.phone && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleValidateContact(contact.id, 'voice_call')}
                                    disabled={validationInProgress.has(contact.id)}
                                  >
                                    {validationInProgress.has(contact.id) ? '⏳' : '☎️'}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📅 Schedule Validation Tests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-4">🕐</div>
                        <p>Scheduled validation coming soon!</p>
                        <p className="text-sm">Set up automatic validation tests for your emergency contacts.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      📋 Validation History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {emergencyContacts.map(contact => (
                        <div key={contact.id} className="border rounded-lg p-4">
                          <h3 className="font-medium mb-3">{contact.name}</h3>
                          {contact.validationHistory.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No validation history yet</p>
                          ) : (
                            <div className="space-y-2">
                              {contact.validationHistory.slice(-5).map(attempt => (
                                <div
                                  key={attempt.id}
                                  className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                                >
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {attempt.method === 'email' ? '📧' :
                                       attempt.method === 'sms' ? '📱' :
                                       attempt.method === 'voice_call' ? '☎️' : '🚨'}
                                    </span>
                                    <span className="capitalize">{attempt.method.replace('_', ' ')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      attempt.status === 'responded' ? 'bg-green-100 text-green-700' :
                                      attempt.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                                      attempt.status === 'failed' ? 'bg-red-100 text-red-700' :
                                      'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      {attempt.status}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {attempt.timestamp.toLocaleDateString()}
                                    </span>
                                    {attempt.responseTime && (
                                      <span className="text-muted-foreground">
                                        {attempt.responseTime}min
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sofia Guidance */}
        <LiquidMotion.ScaleIn delay={0.5}>
          <motion.div
            className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl px-4 py-3"
            animate={{
              boxShadow: [
                '0 0 15px rgba(239, 68, 68, 0.1)',
                '0 0 25px rgba(239, 68, 68, 0.15)',
                '0 0 15px rgba(239, 68, 68, 0.1)',
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
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-red-700 text-sm font-medium">
                ✨ Sofia: "{overallScore < 60
                  ? 'Critical: Your emergency contacts need validation. Start with email verification for quick results.'
                  : overallScore < 80
                    ? 'Good progress! Consider validating remaining contacts and scheduling regular tests.'
                    : 'Excellent! Your emergency network is well-validated and ready for emergencies.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}