/**
 * Conditional Release Mechanism Engine
 * Advanced system for controlling when and how video messages are released to recipients
 */

import React, { useState, useEffect } from 'react';
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

interface ReleaseCondition {
  id: string;
  type: 'date' | 'milestone' | 'emergency' | 'manual' | 'conditional' | 'combined';
  name: string;
  description: string;
  isActive: boolean;
  priority: number; // 1-10, higher = more important
  configuration: ConditionConfiguration;
  status: 'pending' | 'monitoring' | 'triggered' | 'completed' | 'failed' | 'cancelled';
  triggerHistory: TriggerEvent[];
  createdAt: Date;
  lastEvaluated?: Date;
  nextEvaluation?: Date;
}

interface ConditionConfiguration {
  // Date-based conditions
  scheduledDate?: Date;
  timeZone?: string;
  allowEarlyRelease?: boolean;
  maxDelay?: number; // in hours

  // Milestone conditions
  milestone?: {
    type: 'birthday' | 'anniversary' | 'graduation' | 'wedding' | 'achievement' | 'custom';
    targetPerson: string;
    targetAge?: number;
    targetDate?: Date;
    recurrence?: 'none' | 'yearly' | 'custom';
    description: string;
  };

  // Emergency conditions
  emergency?: {
    triggers: ('health_check_missed' | 'no_contact' | 'manual_activation' | 'system_alert')[];
    timeThreshold: number; // hours without contact
    escalationLevels: string[];
    requiresConfirmation: boolean;
  };

  // Conditional logic
  conditions?: {
    logicalOperator: 'AND' | 'OR' | 'NOT';
    rules: Array<{
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
      value: string | number | boolean;
    }>;
  };

  // Advanced settings
  notifications?: {
    preReleaseWarning: boolean;
    warningPeriod: number; // days before release
    notifyRecipients: boolean;
    notifyCreator: boolean;
    customMessage?: string;
  };

  approvals?: {
    requiresApproval: boolean;
    approvers: string[];
    approvalDeadline?: number; // hours to approve
    autoApproveAfterDeadline: boolean;
  };
}

interface TriggerEvent {
  id: string;
  timestamp: Date;
  type: 'condition_met' | 'manual_trigger' | 'approval_granted' | 'approval_denied' | 'system_override';
  triggeredBy: string;
  details: string;
  success: boolean;
  metadata?: Record<string, any>;
}

interface VideoRelease {
  id: string;
  videoId: string;
  conditionId: string;
  status: 'scheduled' | 'pending_approval' | 'approved' | 'released' | 'failed' | 'cancelled';
  scheduledFor?: Date;
  releasedAt?: Date;
  recipients: string[];
  releaseMethod: 'email' | 'app_notification' | 'download_link' | 'streaming';
  accessDuration?: number; // hours of access
  expiresAt?: Date;
  downloadCount: number;
  viewCount: number;
  metadata: {
    triggeredCondition: string;
    releaseReason: string;
    approvedBy?: string;
    customMessage?: string;
  };
}

interface ConditionalReleaseEngineProps {
  videoId?: string;
  onConditionCreated?: (condition: ReleaseCondition) => void;
  onConditionTriggered?: (conditionId: string, videoId: string) => void;
  onVideoReleased?: (release: VideoRelease) => void;
  familyMembers?: Array<{ id: string; name: string; relationship: string; email?: string }>;
  existingConditions?: ReleaseCondition[];
}

const conditionTemplates = [
  {
    id: 'birthday_message',
    name: 'Birthday Release',
    type: 'milestone' as const,
    description: 'Release video on someone\'s birthday',
    icon: '🎂',
    defaultConfig: {
      milestone: {
        type: 'birthday' as const,
        recurrence: 'yearly' as const
      },
      notifications: {
        preReleaseWarning: true,
        warningPeriod: 7,
        notifyRecipients: true
      }
    }
  },
  {
    id: 'graduation_day',
    name: 'Graduation Release',
    type: 'milestone' as const,
    description: 'Release when someone graduates',
    icon: '🎓',
    defaultConfig: {
      milestone: {
        type: 'graduation' as const,
        recurrence: 'none' as const
      },
      notifications: {
        preReleaseWarning: true,
        warningPeriod: 3
      }
    }
  },
  {
    id: 'emergency_activation',
    name: 'Emergency Release',
    type: 'emergency' as const,
    description: 'Release during emergency situations',
    icon: '🚨',
    defaultConfig: {
      emergency: {
        triggers: ['health_check_missed', 'no_contact'],
        timeThreshold: 48,
        requiresConfirmation: true
      },
      notifications: {
        notifyRecipients: true,
        notifyCreator: false
      }
    }
  },
  {
    id: 'scheduled_future',
    name: 'Future Date Release',
    type: 'date' as const,
    description: 'Release on a specific future date',
    icon: '📅',
    defaultConfig: {
      allowEarlyRelease: false,
      notifications: {
        preReleaseWarning: true,
        warningPeriod: 1
      }
    }
  },
  {
    id: 'achievement_unlock',
    name: 'Achievement Release',
    type: 'milestone' as const,
    description: 'Release when someone achieves something special',
    icon: '🏆',
    defaultConfig: {
      milestone: {
        type: 'achievement' as const,
        recurrence: 'none' as const
      },
      approvals: {
        requiresApproval: true,
        autoApproveAfterDeadline: false
      }
    }
  },
  {
    id: 'combined_conditions',
    name: 'Complex Conditions',
    type: 'combined' as const,
    description: 'Release based on multiple combined conditions',
    icon: '🔗',
    defaultConfig: {
      conditions: {
        logicalOperator: 'AND' as const,
        rules: []
      },
      approvals: {
        requiresApproval: true
      }
    }
  }
];

export default function ConditionalReleaseEngine({
  videoId,
  onConditionCreated,
  onConditionTriggered,
  onVideoReleased,
  familyMembers = [],
  existingConditions = []
}: ConditionalReleaseEngineProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'monitor' | 'history' | 'settings'>('create');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [conditions, setConditions] = useState<ReleaseCondition[]>(existingConditions);
  const [releases, setReleases] = useState<VideoRelease[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for creating conditions
  const [conditionForm, setConditionForm] = useState({
    name: '',
    description: '',
    type: 'date' as ReleaseCondition['type'],
    priority: 5,
    configuration: {} as ConditionConfiguration
  });

  // Initialize Sofia personality for release guidance
  const { personality, adaptToContext, learnFromInteraction } = useSofiaPersonality(PersonalityPresets.analyticalUser);

  useEffect(() => {
    adaptToContext('planning');
    startConditionMonitoring();
  }, [adaptToContext]);

  const startConditionMonitoring = () => {
    // Simulate condition monitoring
    const interval = setInterval(() => {
      evaluateConditions();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  };

  const evaluateConditions = () => {
    const now = new Date();

    conditions.forEach(condition => {
      if (condition.status === 'monitoring' && condition.isActive) {
        const shouldTrigger = evaluateCondition(condition, now);

        if (shouldTrigger) {
          triggerCondition(condition.id);
        }

        // Update last evaluated time
        condition.lastEvaluated = now;
        condition.nextEvaluation = getNextEvaluationTime(condition);
      }
    });

    setConditions([...conditions]);
  };

  const evaluateCondition = (condition: ReleaseCondition, currentTime: Date): boolean => {
    const config = condition.configuration;

    switch (condition.type) {
      case 'date':
        return config.scheduledDate ? currentTime >= config.scheduledDate : false;

      case 'milestone':
        if (config.milestone) {
          if (config.milestone.type === 'birthday' && config.milestone.targetDate) {
            // Check if it's the person's birthday
            const target = config.milestone.targetDate;
            return (
              currentTime.getMonth() === target.getMonth() &&
              currentTime.getDate() === target.getDate()
            );
          }
          return config.milestone.targetDate ? currentTime >= config.milestone.targetDate : false;
        }
        return false;

      case 'emergency':
        // In a real implementation, this would check actual emergency conditions
        return false;

      case 'conditional':
        return evaluateConditionalLogic(config.conditions, currentTime);

      case 'combined':
        return evaluateMultipleConditions(condition, currentTime);

      default:
        return false;
    }
  };

  const evaluateConditionalLogic = (conditions: ConditionConfiguration['conditions'], currentTime: Date): boolean => {
    if (!conditions || !conditions.rules.length) return false;

    const results = conditions.rules.map(rule => {
      // Simulate rule evaluation based on mock data
      switch (rule.field) {
        case 'user_age':
          return rule.operator === 'greater_than' ? 25 > (rule.value as number) : false;
        case 'family_size':
          return rule.operator === 'equals' ? familyMembers.length === rule.value : false;
        case 'day_of_week':
          return rule.operator === 'equals' ? currentTime.getDay() === rule.value : false;
        default:
          return false;
      }
    });

    switch (conditions.logicalOperator) {
      case 'AND':
        return results.every(result => result);
      case 'OR':
        return results.some(result => result);
      case 'NOT':
        return !results.every(result => result);
      default:
        return false;
    }
  };

  const evaluateMultipleConditions = (condition: ReleaseCondition, currentTime: Date): boolean => {
    // Complex evaluation logic for combined conditions
    return false; // Simplified for demo
  };

  const getNextEvaluationTime = (condition: ReleaseCondition): Date => {
    const now = new Date();
    const nextEval = new Date(now);

    switch (condition.type) {
      case 'date':
        // Check once per hour leading up to the date
        nextEval.setHours(nextEval.getHours() + 1);
        break;
      case 'milestone':
        // Check daily for milestone conditions
        nextEval.setDate(nextEval.getDate() + 1);
        break;
      case 'emergency':
        // Check every 5 minutes for emergency conditions
        nextEval.setMinutes(nextEval.getMinutes() + 5);
        break;
      default:
        nextEval.setHours(nextEval.getHours() + 1);
    }

    return nextEval;
  };

  const triggerCondition = async (conditionId: string) => {
    const condition = conditions.find(c => c.id === conditionId);
    if (!condition) return;

    try {
      // Create trigger event
      const triggerEvent: TriggerEvent = {
        id: `trigger_${Date.now()}`,
        timestamp: new Date(),
        type: 'condition_met',
        triggeredBy: 'system',
        details: `Condition "${condition.name}" was triggered`,
        success: true
      };

      condition.triggerHistory.push(triggerEvent);
      condition.status = 'triggered';

      // Check if approval is required
      if (condition.configuration.approvals?.requiresApproval) {
        await requestApproval(condition);
      } else {
        await releaseVideo(condition);
      }

      onConditionTriggered?.(conditionId, videoId!);

      learnFromInteraction({
        type: 'condition_triggered',
        duration: 1000,
        context: 'planning'
      });

    } catch (error) {
      console.error('Failed to trigger condition:', error);

      const errorEvent: TriggerEvent = {
        id: `error_${Date.now()}`,
        timestamp: new Date(),
        type: 'condition_met',
        triggeredBy: 'system',
        details: `Failed to trigger condition: ${error}`,
        success: false
      };

      condition.triggerHistory.push(errorEvent);
      condition.status = 'failed';
    }

    setConditions([...conditions]);
  };

  const requestApproval = async (condition: ReleaseCondition) => {
    // Simulate approval request
    const approvers = condition.configuration.approvals?.approvers || [];

    // In a real implementation, this would send notifications to approvers
    console.log(`Requesting approval from: ${approvers.join(', ')}`);

    // For demo, simulate automatic approval after 1 second
    setTimeout(() => {
      approveRelease(condition.id, 'auto_system');
    }, 1000);
  };

  const approveRelease = (conditionId: string, approvedBy: string) => {
    const condition = conditions.find(c => c.id === conditionId);
    if (!condition) return;

    const approvalEvent: TriggerEvent = {
      id: `approval_${Date.now()}`,
      timestamp: new Date(),
      type: 'approval_granted',
      triggeredBy: approvedBy,
      details: `Release approved by ${approvedBy}`,
      success: true
    };

    condition.triggerHistory.push(approvalEvent);
    releaseVideo(condition);
  };

  const releaseVideo = async (condition: ReleaseCondition) => {
    if (!videoId) return;

    const release: VideoRelease = {
      id: `release_${Date.now()}`,
      videoId,
      conditionId: condition.id,
      status: 'released',
      releasedAt: new Date(),
      recipients: [], // Would be populated based on condition configuration
      releaseMethod: 'app_notification',
      downloadCount: 0,
      viewCount: 0,
      metadata: {
        triggeredCondition: condition.name,
        releaseReason: condition.description,
        customMessage: condition.configuration.notifications?.customMessage
      }
    };

    setReleases(prev => [...prev, release]);
    condition.status = 'completed';

    onVideoReleased?.(release);

    // Send notifications to recipients
    await sendReleaseNotifications(release, condition);
  };

  const sendReleaseNotifications = async (release: VideoRelease, condition: ReleaseCondition) => {
    // Simulate sending notifications
    console.log(`Sending release notifications for video ${release.videoId}`);

    if (condition.configuration.notifications?.notifyRecipients) {
      release.recipients.forEach(recipientId => {
        const recipient = familyMembers.find(m => m.id === recipientId);
        if (recipient?.email) {
          console.log(`Email notification sent to ${recipient.email}`);
        }
      });
    }
  };

  const createCondition = async () => {
    if (!conditionForm.name) return;

    setIsCreating(true);

    try {
      const newCondition: ReleaseCondition = {
        id: `condition_${Date.now()}`,
        name: conditionForm.name,
        type: conditionForm.type,
        description: conditionForm.description,
        isActive: true,
        priority: conditionForm.priority,
        configuration: conditionForm.configuration,
        status: 'monitoring',
        triggerHistory: [],
        createdAt: new Date(),
        nextEvaluation: getNextEvaluationTime({
          ...conditionForm,
          id: '',
          isActive: true,
          status: 'monitoring',
          triggerHistory: [],
          createdAt: new Date()
        } as ReleaseCondition)
      };

      setConditions(prev => [...prev, newCondition]);
      onConditionCreated?.(newCondition);

      // Reset form
      setConditionForm({
        name: '',
        description: '',
        type: 'date',
        priority: 5,
        configuration: {}
      });
      setSelectedTemplate(null);

      learnFromInteraction({
        type: 'condition_created',
        duration: 2000,
        context: 'planning'
      });

    } catch (error) {
      console.error('Failed to create condition:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = conditionTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setConditionForm({
        name: template.name,
        description: template.description,
        type: template.type,
        priority: 5,
        configuration: template.defaultConfig
      });
    }
  };

  const getStatusColor = (status: ReleaseCondition['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'triggered': return 'text-blue-600';
      case 'monitoring': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: ReleaseCondition['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'triggered': return '🚀';
      case 'monitoring': return '👁️';
      case 'failed': return '❌';
      case 'cancelled': return '⏸️';
      default: return '⏳';
    }
  };

  const formatTimeUntil = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff <= 0) return 'Now';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <PersonalityAwareAnimation personality={personality} context="planning">
      <div className="w-full space-y-6">
        {/* Header */}
        <LiquidMotion.ScaleIn delay={0.1}>
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                ⚙️ Conditional Release Engine
                <motion.div
                  className="text-sm px-3 py-1 rounded-full bg-indigo-500 text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Smart Triggers
                </motion.div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Set intelligent conditions that automatically release your video messages at the perfect moments.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-indigo-600">⚙️</div>
                  <div className="font-medium">{conditions.length}</div>
                  <div className="text-sm text-muted-foreground">Conditions</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-green-600">👁️</div>
                  <div className="font-medium">{conditions.filter(c => c.status === 'monitoring').length}</div>
                  <div className="text-sm text-muted-foreground">Monitoring</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-blue-600">🚀</div>
                  <div className="font-medium">{conditions.filter(c => c.status === 'triggered').length}</div>
                  <div className="text-sm text-muted-foreground">Triggered</div>
                </motion.div>

                <motion.div className="text-center p-3 bg-white rounded-lg shadow-sm" whileHover={{ scale: 1.05 }}>
                  <div className="text-2xl text-purple-600">✅</div>
                  <div className="font-medium">{releases.length}</div>
                  <div className="text-sm text-muted-foreground">Released</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </LiquidMotion.ScaleIn>

        {/* Tab Navigation */}
        <LiquidMotion.ScaleIn delay={0.2}>
          <div className="flex space-x-1 bg-muted rounded-lg p-1">
            {[
              { key: 'create', label: 'Create Conditions', icon: '➕' },
              { key: 'monitor', label: 'Active Monitoring', icon: '👁️' },
              { key: 'history', label: 'Release History', icon: '📋' },
              { key: 'settings', label: 'Engine Settings', icon: '⚙️' }
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
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Templates */}
                <LiquidMotion.ScaleIn delay={0.3}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        📋 Condition Templates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {conditionTemplates.map((template, index) => (
                          <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedTemplate === template.id
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-border hover:border-indigo-300'
                            }`}
                            onClick={() => handleTemplateSelect(template.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{template.icon}</div>
                              <div className="flex-1">
                                <h3 className="font-medium">{template.name}</h3>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                                <div className="text-xs text-muted-foreground mt-1 capitalize">
                                  Type: {template.type}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </LiquidMotion.ScaleIn>

                {/* Condition Builder */}
                <LiquidMotion.ScaleIn delay={0.4}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🔧 Condition Builder
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Condition Name *</label>
                          <Input
                            value={conditionForm.name}
                            onChange={(e) => setConditionForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter condition name..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <Textarea
                            value={conditionForm.description}
                            onChange={(e) => setConditionForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe when this condition should trigger..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Condition Type</label>
                          <select
                            value={conditionForm.type}
                            onChange={(e) => setConditionForm(prev => ({ ...prev, type: e.target.value as ReleaseCondition['type'] }))}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background"
                          >
                            <option value="date">Specific Date</option>
                            <option value="milestone">Life Milestone</option>
                            <option value="emergency">Emergency Trigger</option>
                            <option value="conditional">Conditional Logic</option>
                            <option value="combined">Combined Conditions</option>
                            <option value="manual">Manual Release</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Priority Level</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min="1"
                              max="10"
                              value={conditionForm.priority}
                              onChange={(e) => setConditionForm(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium w-8">{conditionForm.priority}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Higher priority conditions are evaluated first
                          </p>
                        </div>

                        {/* Type-specific configuration */}
                        {conditionForm.type === 'date' && (
                          <div>
                            <label className="block text-sm font-medium mb-2">Release Date</label>
                            <Input
                              type="datetime-local"
                              onChange={(e) => setConditionForm(prev => ({
                                ...prev,
                                configuration: {
                                  ...prev.configuration,
                                  scheduledDate: new Date(e.target.value)
                                }
                              }))}
                            />
                          </div>
                        )}

                        {conditionForm.type === 'milestone' && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">Milestone Type</label>
                              <select
                                onChange={(e) => setConditionForm(prev => ({
                                  ...prev,
                                  configuration: {
                                    ...prev.configuration,
                                    milestone: {
                                      ...prev.configuration.milestone,
                                      type: e.target.value as any
                                    }
                                  }
                                }))}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                              >
                                <option value="">Select milestone type</option>
                                <option value="birthday">Birthday</option>
                                <option value="graduation">Graduation</option>
                                <option value="wedding">Wedding</option>
                                <option value="anniversary">Anniversary</option>
                                <option value="achievement">Achievement</option>
                                <option value="custom">Custom</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Target Person</label>
                              <select
                                onChange={(e) => setConditionForm(prev => ({
                                  ...prev,
                                  configuration: {
                                    ...prev.configuration,
                                    milestone: {
                                      ...prev.configuration.milestone,
                                      targetPerson: e.target.value
                                    }
                                  }
                                }))}
                                className="w-full px-3 py-2 border border-border rounded-md bg-background"
                              >
                                <option value="">Select family member</option>
                                {familyMembers.map(member => (
                                  <option key={member.id} value={member.id}>
                                    {member.name} ({member.relationship})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Advanced Settings */}
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3">Advanced Settings</h4>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                onChange={(e) => setConditionForm(prev => ({
                                  ...prev,
                                  configuration: {
                                    ...prev.configuration,
                                    notifications: {
                                      ...prev.configuration.notifications,
                                      preReleaseWarning: e.target.checked
                                    }
                                  }
                                }))}
                                className="rounded"
                              />
                              <span className="text-sm">Send pre-release warning</span>
                            </label>

                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                onChange={(e) => setConditionForm(prev => ({
                                  ...prev,
                                  configuration: {
                                    ...prev.configuration,
                                    approvals: {
                                      ...prev.configuration.approvals,
                                      requiresApproval: e.target.checked
                                    }
                                  }
                                }))}
                                className="rounded"
                              />
                              <span className="text-sm">Require approval before release</span>
                            </label>

                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                onChange={(e) => setConditionForm(prev => ({
                                  ...prev,
                                  configuration: {
                                    ...prev.configuration,
                                    notifications: {
                                      ...prev.configuration.notifications,
                                      notifyRecipients: e.target.checked
                                    }
                                  }
                                }))}
                                className="rounded"
                              />
                              <span className="text-sm">Notify recipients when released</span>
                            </label>
                          </div>
                        </div>

                        {/* Create Button */}
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            onClick={createCondition}
                            disabled={!conditionForm.name || isCreating}
                            className="w-full bg-indigo-500 hover:bg-indigo-600"
                          >
                            {isCreating ? '⏳ Creating...' : '➕ Create Condition'}
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </LiquidMotion.ScaleIn>
              </div>
            </motion.div>
          )}

          {activeTab === 'monitor' && (
            <motion.div
              key="monitor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      👁️ Active Condition Monitoring
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {conditions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-4">⚙️</div>
                        <p>No conditions created yet</p>
                        <p className="text-sm">Create your first release condition to get started!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conditions.map((condition, index) => (
                          <motion.div
                            key={condition.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`text-lg ${getStatusColor(condition.status)}`}>
                                  {getStatusIcon(condition.status)}
                                </div>
                                <div>
                                  <h3 className="font-medium">{condition.name}</h3>
                                  <p className="text-sm text-muted-foreground">{condition.description}</p>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className={`text-sm font-medium ${getStatusColor(condition.status)}`}>
                                  {condition.status.replace('_', ' ').toUpperCase()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Priority: {condition.priority}/10
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Type:</span>
                                <span className="ml-2 capitalize">{condition.type}</span>
                              </div>
                              <div>
                                <span className="font-medium">Last Checked:</span>
                                <span className="ml-2">
                                  {condition.lastEvaluated?.toLocaleTimeString() || 'Never'}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Next Check:</span>
                                <span className="ml-2">
                                  {condition.nextEvaluation ? formatTimeUntil(condition.nextEvaluation) : 'N/A'}
                                </span>
                              </div>
                            </div>

                            {condition.triggerHistory.length > 0 && (
                              <div className="mt-3 border-t pt-3">
                                <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
                                <div className="space-y-1">
                                  {condition.triggerHistory.slice(-3).map(event => (
                                    <div key={event.id} className="text-xs flex items-center justify-between">
                                      <span>{event.details}</span>
                                      <span className="text-muted-foreground">
                                        {event.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
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
                      📋 Release History ({releases.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {releases.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <div className="text-4xl mb-4">📋</div>
                        <p>No videos released yet</p>
                        <p className="text-sm">Your conditional releases will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {releases.map((release, index) => (
                          <motion.div
                            key={release.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-medium">Video Released</h3>
                                <p className="text-sm text-muted-foreground">
                                  Triggered by: {release.metadata.triggeredCondition}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                  Released
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {release.releasedAt?.toLocaleString()}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Views:</span>
                                <span className="ml-2">{release.viewCount}</span>
                              </div>
                              <div>
                                <span className="font-medium">Downloads:</span>
                                <span className="ml-2">{release.downloadCount}</span>
                              </div>
                              <div>
                                <span className="font-medium">Method:</span>
                                <span className="ml-2 capitalize">{release.releaseMethod.replace('_', ' ')}</span>
                              </div>
                              <div>
                                <span className="font-medium">Recipients:</span>
                                <span className="ml-2">{release.recipients.length}</span>
                              </div>
                            </div>

                            {release.metadata.customMessage && (
                              <div className="mt-3 p-3 bg-muted rounded">
                                <div className="text-sm">
                                  <strong>Custom Message:</strong> {release.metadata.customMessage}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </LiquidMotion.ScaleIn>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <LiquidMotion.ScaleIn delay={0.3}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      ⚙️ Engine Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-3">Monitoring Settings</h3>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between">
                            <span>Enable automatic monitoring</span>
                            <input type="checkbox" defaultChecked className="rounded" />
                          </label>
                          <label className="flex items-center justify-between">
                            <span>Send monitoring alerts</span>
                            <input type="checkbox" defaultChecked className="rounded" />
                          </label>
                          <label className="flex items-center justify-between">
                            <span>Require confirmation for emergency releases</span>
                            <input type="checkbox" defaultChecked className="rounded" />
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-3">Notification Settings</h3>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between">
                            <span>Email notifications</span>
                            <input type="checkbox" defaultChecked className="rounded" />
                          </label>
                          <label className="flex items-center justify-between">
                            <span>SMS notifications</span>
                            <input type="checkbox" className="rounded" />
                          </label>
                          <label className="flex items-center justify-between">
                            <span>In-app notifications</span>
                            <input type="checkbox" defaultChecked className="rounded" />
                          </label>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-3">Security Settings</h3>
                        <div className="space-y-3">
                          <label className="flex items-center justify-between">
                            <span>Require two-factor authentication for releases</span>
                            <input type="checkbox" className="rounded" />
                          </label>
                          <label className="flex items-center justify-between">
                            <span>Log all release activities</span>
                            <input type="checkbox" defaultChecked className="rounded" />
                          </label>
                          <label className="flex items-center justify-between">
                            <span>Encrypt release notifications</span>
                            <input type="checkbox" defaultChecked className="rounded" />
                          </label>
                        </div>
                      </div>
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
            className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl px-4 py-3"
            animate={{
              boxShadow: [
                '0 0 15px rgba(99, 102, 241, 0.1)',
                '0 0 25px rgba(99, 102, 241, 0.15)',
                '0 0 15px rgba(99, 102, 241, 0.1)',
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
                className="w-2 h-2 bg-indigo-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-indigo-700 text-sm font-medium">
                ✨ Sofia: "{activeTab === 'create'
                  ? 'Conditional releases ensure your messages reach loved ones at exactly the right moment. Consider both joyful milestones and protective emergency scenarios.'
                  : activeTab === 'monitor'
                    ? 'The engine is actively monitoring your conditions. Each one is checked according to its schedule, ensuring perfect timing for your precious messages.'
                    : activeTab === 'history'
                      ? 'Your release history shows the beautiful moments when your love reached its intended recipients. Each release is a gift delivered at the perfect time.'
                      : 'Fine-tune these settings to match your family\'s needs. The right configuration ensures your messages arrive safely and securely when they\'re needed most.'}"
              </p>
            </div>
          </motion.div>
        </LiquidMotion.ScaleIn>
      </div>
    </PersonalityAwareAnimation>
  );
}