/**
 * VisualErrorHierarchy - Hierarchical error presentation with clear importance distinction
 *
 * Features:
 * - Visual importance hierarchy with distinct styling for different error levels
 * - Progressive error disclosure based on severity and user context
 * - Contextual error grouping and prioritization
 * - Smart error consolidation to prevent information overload
 * - Emotional intelligence integration for appropriate error presentation
 * - Accessibility-first design with clear visual cues
 * - Performance-optimized rendering with intelligent error filtering
 * - Real-time error importance assessment and adaptation
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { EmotionalErrorAnalytics } from '../../utils/EmotionalErrorAnalytics';

// TypeScript interfaces for comprehensive type safety
export interface ErrorImportance {
  level: 'critical' | 'high' | 'medium' | 'low' | 'info';
  priority: number; // 1-10 scale
  urgency: 'immediate' | 'high' | 'normal' | 'low';
  userImpact: 'blocking' | 'disruptive' | 'annoying' | 'minimal';
  context: string;
  requiresAction: boolean;
  canBeDismissed: boolean;
  suggestedDelay: number; // seconds before showing
}

export interface VisualErrorGroup {
  id: string;
  title: string;
  category: 'validation' | 'network' | 'permission' | 'data' | 'system' | 'user_input';
  importance: ErrorImportance;
  errors: VisualError[];
  consolidated: boolean;
  displayStrategy: 'expandable' | 'summary' | 'priority_only' | 'full_details';
  emotionalContext: {
    userFrustration: number;
    cognitiveLoad: number;
    urgency: number;
  };
}

export interface VisualError {
  id: string;
  message: string;
  technical: string;
  importance: ErrorImportance;
  groupId?: string;
  timestamp: number;
  resolved: boolean;
  userAcknowledged: boolean;
  suggestedActions: string[];
  helpContext: string;
  relatedErrors: string[];
}

export interface VisualErrorHierarchyProps {
  errors: VisualError[];
  onErrorAction?: (errorId: string, action: string) => void;
  onErrorDismiss?: (errorId: string) => void;
  onGroupExpand?: (groupId: string) => void;
  maxVisibleErrors?: number;
  groupErrors?: boolean;
  showTechnical?: boolean;
  autoConsolidate?: boolean;
  importanceThreshold?: number;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

// Advanced error hierarchy engine
class VisualErrorHierarchyEngine {
  private errorGroups: Map<string, VisualErrorGroup> = new Map();
  private importanceCache: Map<string, ErrorImportance> = new Map();
  private consolidationRules: Map<string, any> = new Map();

  constructor() {
    this.initializeImportanceLevels();
    this.initializeConsolidationRules();
  }

  private initializeImportanceLevels(): void {
    // Critical errors - immediate attention required
    this.importanceCache.set('critical', {
      level: 'critical',
      priority: 10,
      urgency: 'immediate',
      userImpact: 'blocking',
      context: 'System stability or data integrity at risk',
      requiresAction: true,
      canBeDismissed: false,
      suggestedDelay: 0
    });

    // High priority errors - significant impact
    this.importanceCache.set('high', {
      level: 'high',
      priority: 8,
      urgency: 'high',
      userImpact: 'disruptive',
      context: 'Major functionality impaired',
      requiresAction: true,
      canBeDismissed: false,
      suggestedDelay: 1
    });

    // Medium priority errors - moderate impact
    this.importanceCache.set('medium', {
      level: 'medium',
      priority: 5,
      urgency: 'normal',
      userImpact: 'annoying',
      context: 'Some functionality affected',
      requiresAction: false,
      canBeDismissed: true,
      suggestedDelay: 3
    });

    // Low priority errors - minor impact
    this.importanceCache.set('low', {
      level: 'low',
      priority: 2,
      urgency: 'low',
      userImpact: 'minimal',
      context: 'Minor inconvenience or cosmetic issue',
      requiresAction: false,
      canBeDismissed: true,
      suggestedDelay: 5
    });

    // Info level - notifications
    this.importanceCache.set('info', {
      level: 'info',
      priority: 1,
      urgency: 'low',
      userImpact: 'minimal',
      context: 'Informational message',
      requiresAction: false,
      canBeDismissed: true,
      suggestedDelay: 2
    });
  }

  private initializeConsolidationRules(): void {
    // Validation errors consolidation
    this.consolidationRules.set('validation', {
      maxErrors: 3,
      strategy: 'summary',
      groupTitle: 'Validation Issues',
      consolidationMessage: 'Multiple validation errors found'
    });

    // Network errors consolidation
    this.consolidationRules.set('network', {
      maxErrors: 2,
      strategy: 'priority_only',
      groupTitle: 'Connection Issues',
      consolidationMessage: 'Network connectivity problems detected'
    });

    // Permission errors consolidation
    this.consolidationRules.set('permission', {
      maxErrors: 2,
      strategy: 'expandable',
      groupTitle: 'Permission Issues',
      consolidationMessage: 'Access permissions need to be reviewed'
    });
  }

  assessErrorImportance(error: VisualError): ErrorImportance {
    // Check cache first
    if (this.importanceCache.has(error.id)) {
      return this.importanceCache.get(error.id)!;
    }

    // Assess based on error properties
    let importance = { ...this.importanceCache.get('medium')! };

    // Critical indicators
    if (error.technical.includes('fatal') || error.technical.includes('crash') ||
        error.technical.includes('security') || error.technical.includes('corruption')) {
      importance = { ...this.importanceCache.get('critical')! };
    }
    // High priority indicators
    else if (error.technical.includes('timeout') || error.technical.includes('unauthorized') ||
             error.technical.includes('forbidden') || error.technical.includes('blocked')) {
      importance = { ...this.importanceCache.get('high')! };
    }
    // Low priority indicators
    else if (error.technical.includes('warning') || error.technical.includes('deprecated') ||
             error.technical.includes('optimization')) {
      importance = { ...this.importanceCache.get('low')! };
    }

    // Adjust based on user context
    if (error.suggestedActions.length > 0) {
      importance.priority = Math.min(10, importance.priority + 1);
    }

    if (error.relatedErrors.length > 2) {
      importance.priority = Math.min(10, importance.priority + 2);
    }

    this.importanceCache.set(error.id, importance);
    return importance;
  }

  groupErrors(errors: VisualError[]): VisualErrorGroup[] {
    const groups: Map<string, VisualErrorGroup> = new Map();
    const ungrouped: VisualError[] = [];

    // Group errors by category and importance
    errors.forEach(error => {
      const importance = this.assessErrorImportance(error);
      error.importance = importance;

      const groupKey = `${error.groupId || 'default'}-${importance.level}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: groupKey,
          title: this.getGroupTitle(error, importance),
          category: error.groupId as any || 'system',
          importance,
          errors: [],
          consolidated: false,
          displayStrategy: this.getDisplayStrategy(error, importance),
          emotionalContext: {
            userFrustration: this.calculateFrustrationLevel(error, importance),
            cognitiveLoad: this.calculateCognitiveLoad(error, importance),
            urgency: importance.priority
          }
        });
      }

      groups.get(groupKey)!.errors.push(error);
    });

    // Apply consolidation rules
    const consolidatedGroups: VisualErrorGroup[] = [];
    groups.forEach(group => {
      const rule = this.consolidationRules.get(group.category);
      if (rule && group.errors.length > rule.maxErrors) {
        group.consolidated = true;
        group.title = rule.consolidationMessage;
        group.displayStrategy = rule.strategy;
        // Keep only highest priority errors
        group.errors = group.errors
          .sort((a, b) => b.importance.priority - a.importance.priority)
          .slice(0, rule.maxErrors);
      }
      consolidatedGroups.push(group);
    });

    return consolidatedGroups.sort((a, b) => b.importance.priority - a.importance.priority);
  }

  private getGroupTitle(error: VisualError, importance: ErrorImportance): string {
    const categoryTitles = {
      validation: 'Input Validation',
      network: 'Connection Issues',
      permission: 'Access Control',
      data: 'Data Processing',
      system: 'System Status',
      user_input: 'User Input'
    };

    return categoryTitles[error.groupId as keyof typeof categoryTitles] || 'System Issues';
  }

  private getDisplayStrategy(error: VisualError, importance: ErrorImportance): VisualErrorGroup['displayStrategy'] {
    if (importance.level === 'critical') return 'full_details';
    if (importance.level === 'high') return 'expandable';
    if (importance.level === 'medium') return 'summary';
    return 'priority_only';
  }

  private calculateFrustrationLevel(error: VisualError, importance: ErrorImportance): number {
    let frustration = 0.5; // Base level

    if (importance.userImpact === 'blocking') frustration += 0.3;
    if (importance.userImpact === 'disruptive') frustration += 0.2;
    if (error.suggestedActions.length === 0) frustration += 0.2;
    if (error.relatedErrors.length > 0) frustration += 0.1;

    return Math.min(1, frustration);
  }

  private calculateCognitiveLoad(error: VisualError, importance: ErrorImportance): number {
    let load = 0.3; // Base cognitive load

    if (importance.level === 'critical') load += 0.4;
    if (importance.level === 'high') load += 0.3;
    if (error.technical.length > 100) load += 0.2;
    if (error.suggestedActions.length > 3) load += 0.2;

    return Math.min(1, load);
  }
}

// Main component implementation
export const VisualErrorHierarchy: React.FC<VisualErrorHierarchyProps> = ({
  errors,
  onErrorAction,
  onErrorDismiss,
  onGroupExpand,
  maxVisibleErrors = 5,
  groupErrors = true,
  showTechnical = false,
  autoConsolidate = true,
  importanceThreshold = 3,
  className = '',
  theme = 'auto'
}) => {
  const [errorGroups, setErrorGroups] = useState<VisualErrorGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [dismissedErrors, setDismissedErrors] = useState<Set<string>>(new Set());
  const [showAllErrors, setShowAllErrors] = useState(false);

  const hierarchyEngine = useMemo(() => new VisualErrorHierarchyEngine(), []);
  const analytics = useMemo(() => new EmotionalErrorAnalytics(), []);

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();
  const shouldReduceMotion = useReducedMotion();

  // Process and group errors
  useEffect(() => {
    if (errors.length === 0) {
      setErrorGroups([]);
      return;
    }

    const filteredErrors = errors.filter(error =>
      !dismissedErrors.has(error.id) &&
      error.importance.priority >= importanceThreshold
    );

    if (groupErrors) {
      const groups = hierarchyEngine.groupErrors(filteredErrors);
      setErrorGroups(groups);
    } else {
      // Create individual error groups
      const individualGroups = filteredErrors.map(error => ({
        id: `individual-${error.id}`,
        title: 'Error',
        category: 'system' as const,
        importance: error.importance,
        errors: [error],
        consolidated: false,
        displayStrategy: 'full_details' as const,
        emotionalContext: {
          userFrustration: hierarchyEngine['calculateFrustrationLevel'](error, error.importance),
          cognitiveLoad: hierarchyEngine['calculateCognitiveLoad'](error, error.importance),
          urgency: error.importance.priority
        }
      }));
      setErrorGroups(individualGroups);
    }
  }, [errors, groupErrors, importanceThreshold, dismissedErrors, hierarchyEngine]);

  const handleGroupToggle = useCallback((groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
      onGroupExpand?.(groupId);
    }
    setExpandedGroups(newExpanded);
  }, [expandedGroups, onGroupExpand]);

  const handleErrorAction = useCallback((errorId: string, action: string) => {
    onErrorAction?.(errorId, action);
    analytics.trackUserEngagement(errorId, 'action_taken');
  }, [onErrorAction]);

  const handleErrorDismiss = useCallback((errorId: string) => {
    setDismissedErrors(prev => new Set([...prev, errorId]));
    onErrorDismiss?.(errorId);
    analytics.trackUserEngagement(errorId, 'dismissed');
  }, [onErrorDismiss]);

  const getImportanceColor = (importance: ErrorImportance) => {
    const colors = {
      critical: 'bg-red-50 border-red-200 text-red-800',
      high: 'bg-orange-50 border-orange-200 text-orange-800',
      medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      low: 'bg-blue-50 border-blue-200 text-blue-800',
      info: 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return colors[importance.level] || colors.medium;
  };

  const getImportanceIcon = (importance: ErrorImportance) => {
    const icons = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️',
      info: '💡'
    };
    return icons[importance.level] || icons.medium;
  };

  const getDisplayStrategy = (group: VisualErrorGroup) => {
    if (group.consolidated) {
      return group.displayStrategy;
    }

    if (group.errors.length === 1) {
      return 'full_details';
    }

    return group.displayStrategy;
  };

  const visibleGroups = showAllErrors ? errorGroups : errorGroups.slice(0, maxVisibleErrors);
  const hasMoreErrors = errorGroups.length > maxVisibleErrors;

  if (errorGroups.length === 0) {
    return (
      <div className={`visual-error-hierarchy ${className} theme-${theme}`}>
        <div className="no-errors">
          <div className="success-icon">✅</div>
          <p>All systems operational</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`visual-error-hierarchy ${className} theme-${theme}`}>
      {/* Error summary header */}
      <div className="error-summary">
        <h3>Error Overview</h3>
        <div className="summary-stats">
          <span className="total-errors">{errorGroups.length} issues</span>
          <span className="critical-count">
            {errorGroups.filter(g => g.importance.level === 'critical').length} critical
          </span>
          <span className="high-count">
            {errorGroups.filter(g => g.importance.level === 'high').length} high priority
          </span>
        </div>
      </div>

      {/* Error groups */}
      <div className="error-groups">
        <AnimatePresence>
          {visibleGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            const displayStrategy = getDisplayStrategy(group);

            return (
              <motion.div
                key={group.id}
                className={`error-group importance-${group.importance.level}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                {/* Group header */}
                <div
                  className={`group-header ${getImportanceColor(group.importance)}`}
                  onClick={() => handleGroupToggle(group.id)}
                >
                  <div className="group-icon">
                    <span className="icon">{getImportanceIcon(group.importance)}</span>
                  </div>
                  <div className="group-content">
                    <h4 className="group-title">{group.title}</h4>
                    <div className="group-meta">
                      <span className="error-count">{group.errors.length} errors</span>
                      <span className="importance-level">{group.importance.level}</span>
                      <span className="urgency">{group.importance.urgency}</span>
                    </div>
                  </div>
                  <div className="group-actions">
                    {displayStrategy === 'expandable' && (
                      <button className="expand-button">
                        {isExpanded ? '−' : '+'}
                      </button>
                    )}
                    {group.importance.canBeDismissed && (
                      <button
                        className="dismiss-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          group.errors.forEach(error => handleErrorDismiss(error.id));
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Group content */}
                <AnimatePresence>
                  {(isExpanded || displayStrategy === 'full_details') && (
                    <motion.div
                      className="group-content"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                    >
                      {group.errors.map((error, index) => (
                        <motion.div
                          key={error.id}
                          className={`error-item ${getImportanceColor(error.importance)}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="error-message">
                            <p>{error.message}</p>
                            {showTechnical && (
                              <details className="technical-details">
                                <summary>Technical Details</summary>
                                <code>{error.technical}</code>
                              </details>
                            )}
                          </div>

                          {/* Suggested actions */}
                          {error.suggestedActions.length > 0 && (
                            <div className="error-actions">
                              {error.suggestedActions.map((action, actionIndex) => (
                                <button
                                  key={actionIndex}
                                  className="action-button"
                                  onClick={() => handleErrorAction(error.id, action)}
                                >
                                  {action}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Help context */}
                          {error.helpContext && (
                            <div className="error-help">
                              <details>
                                <summary>Help & Context</summary>
                                <p>{error.helpContext}</p>
                              </details>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Emotional context indicator */}
                {group.emotionalContext.userFrustration > 0.7 && (
                  <div className="emotional-indicator">
                    <span className="frustration-level">
                      High frustration potential - {Math.round(group.emotionalContext.userFrustration * 100)}%
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Show more/less controls */}
      {hasMoreErrors && (
        <div className="error-controls">
          <button
            className="show-more-button"
            onClick={() => setShowAllErrors(!showAllErrors)}
          >
            {showAllErrors ? 'Show Less' : `Show ${errorGroups.length - maxVisibleErrors} More`}
          </button>
        </div>
      )}

      {/* Accessibility information */}
      <div className="accessibility-info" aria-live="polite">
        <p>Errors are organized by priority level. Critical errors are shown first.</p>
      </div>
    </div>
  );
};

export default VisualErrorHierarchy;