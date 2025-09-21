/**
 * PreventiveErrorUI - Proactive error prevention interface to avoid common mistakes
 *
 * Features:
 * - Real-time input validation with contextual guidance
 * - Smart form field suggestions and auto-completion
 * - Pattern recognition for common user mistakes
 * - Proactive error messaging before submission
 * - Visual cues for data quality and completeness
 * - Contextual help and tips based on user behavior
 * - Intelligent field highlighting and focus management
 * - Predictive error prevention based on historical data
 * - Accessibility-first design with clear prevention cues
 * - Performance-optimized validation with minimal latency
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { EmotionalErrorAnalytics } from '../../utils/EmotionalErrorAnalytics';

// TypeScript interfaces for comprehensive type safety
export interface PreventionRule {
  id: string;
  field: string;
  type: 'format' | 'required' | 'length' | 'pattern' | 'custom' | 'contextual';
  condition: string | RegExp | ((value: any, context?: any) => boolean);
  message: string;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
  autoFix?: (value: any) => any;
  context?: string;
  frequency: number; // How often this rule triggers
  userImpact: 'minor' | 'moderate' | 'significant';
}

export interface FieldValidation {
  fieldId: string;
  value: any;
  isValid: boolean;
  errors: PreventionError[];
  warnings: PreventionWarning[];
  suggestions: string[];
  confidence: number; // 0-1 scale
  autoFixable: boolean;
  preventionScore: number; // 0-1 scale of how well we're preventing errors
}

export interface PreventionError {
  id: string;
  ruleId: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  field: string;
  suggestion: string;
  canAutoFix: boolean;
  context: string;
  timestamp: number;
}

export interface PreventionWarning {
  id: string;
  message: string;
  type: 'format' | 'quality' | 'consistency' | 'completeness';
  suggestion: string;
  importance: 'low' | 'medium' | 'high';
  context: string;
}

export interface UserBehaviorPattern {
  userId: string;
  fieldId: string;
  commonMistakes: string[];
  preferredFormats: string[];
  completionTime: number;
  errorFrequency: number;
  successRate: number;
  lastUsed: number;
  patterns: {
    typingSpeed: number;
    pauseFrequency: number;
    correctionRate: number;
    confidenceIndicators: string[];
  };
}

export interface PreventiveErrorUIProps {
  fields: FormField[];
  onFieldChange?: (fieldId: string, value: any, validation: FieldValidation) => void;
  onPreventionError?: (error: PreventionError) => void;
  onPreventionWarning?: (warning: PreventionWarning) => void;
  onAutoFix?: (fieldId: string, fixedValue: any) => void;
  enableRealTimeValidation?: boolean;
  enableSmartSuggestions?: boolean;
  enableAutoFix?: boolean;
  preventionThreshold?: number; // 0-1 scale
  userBehaviorData?: UserBehaviorPattern[];
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'date' | 'custom';
  label: string;
  value: any;
  placeholder?: string;
  required?: boolean;
  validationRules?: PreventionRule[];
  customValidation?: (value: any) => FieldValidation;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string | RegExp;
  context?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Advanced prevention engine
class PreventionEngine {
  private preventionRules: Map<string, PreventionRule[]> = new Map();
  private userBehaviorPatterns: Map<string, UserBehaviorPattern> = new Map();
  private fieldHistory: Map<string, any[]> = new Map();
  private preventionCache: Map<string, FieldValidation> = new Map();

  constructor() {
    this.initializeDefaultRules();
    this.initializeUserBehaviorPatterns();
  }

  private initializeDefaultRules(): void {
    // Email validation rules
    this.preventionRules.set('email', [
      {
        id: 'email_format',
        field: 'email',
        type: 'format',
        condition: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address',
        severity: 'high',
        suggestion: 'Use the format: name@example.com',
        autoFix: (value: string) => value.toLowerCase().trim(),
        context: 'Email address validation',
        frequency: 0.3,
        userImpact: 'significant'
      },
      {
        id: 'email_common_domains',
        field: 'email',
        type: 'pattern',
        condition: /@(gmail|yahoo|hotmail|outlook)\.com$/,
        message: 'Consider using a professional email address',
        severity: 'low',
        suggestion: 'A custom domain email may be more appropriate for professional use',
        context: 'Professional email suggestion',
        frequency: 0.1,
        userImpact: 'minor'
      }
    ]);

    // Password validation rules
    this.preventionRules.set('password', [
      {
        id: 'password_length',
        field: 'password',
        type: 'length',
        condition: (value: string) => value.length >= 8,
        message: 'Password should be at least 8 characters long',
        severity: 'high',
        suggestion: 'Use a combination of letters, numbers, and symbols',
        context: 'Password strength requirement',
        frequency: 0.4,
        userImpact: 'significant'
      },
      {
        id: 'password_complexity',
        field: 'password',
        type: 'pattern',
        condition: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        message: 'Password should contain uppercase, lowercase, number, and special character',
        severity: 'medium',
        suggestion: 'Include: A-Z, a-z, 0-9, and !@#$%^&*',
        context: 'Password complexity requirement',
        frequency: 0.25,
        userImpact: 'moderate'
      }
    ]);

    // Phone number validation rules
    this.preventionRules.set('phone', [
      {
        id: 'phone_format',
        field: 'phone',
        type: 'format',
        condition: /^\+?[\d\s\-\(\)]+$/,
        message: 'Please enter a valid phone number',
        severity: 'medium',
        suggestion: 'Use format: +1 (555) 123-4567 or 555-123-4567',
        autoFix: (value: string) => value.replace(/[^\d+\-\s()]/g, ''),
        context: 'Phone number formatting',
        frequency: 0.2,
        userImpact: 'moderate'
      }
    ]);

    // Name validation rules
    this.preventionRules.set('name', [
      {
        id: 'name_format',
        field: 'name',
        type: 'pattern',
        condition: /^[a-zA-Z\s'-]+$/,
        message: 'Name should only contain letters, spaces, hyphens, and apostrophes',
        severity: 'low',
        suggestion: 'Use only alphabetic characters, spaces, hyphens, and apostrophes',
        autoFix: (value: string) => value.replace(/[^a-zA-Z\s'-]/g, ''),
        context: 'Name field validation',
        frequency: 0.15,
        userImpact: 'minor'
      }
    ]);
  }

  private initializeUserBehaviorPatterns(): void {
    // Initialize with default patterns that will be updated with real user data
    this.userBehaviorPatterns.set('default', {
      userId: 'default',
      fieldId: 'general',
      commonMistakes: ['typos', 'missing_required_fields', 'invalid_format'],
      preferredFormats: ['standard', 'simple'],
      completionTime: 30,
      errorFrequency: 0.2,
      successRate: 0.8,
      lastUsed: Date.now(),
      patterns: {
        typingSpeed: 50,
        pauseFrequency: 0.1,
        correctionRate: 0.05,
        confidenceIndicators: ['steady_typing', 'few_pauses']
      }
    });
  }

  validateField(field: FormField, value: any): FieldValidation {
    const cacheKey = `${field.id}-${JSON.stringify(value)}`;
    if (this.preventionCache.has(cacheKey)) {
      return this.preventionCache.get(cacheKey)!;
    }

    const rules = field.validationRules || this.preventionRules.get(field.type) || [];
    const errors: PreventionError[] = [];
    const warnings: PreventionWarning[] = [];
    const suggestions: string[] = [];

    // Apply validation rules
    rules.forEach(rule => {
      let isValid = true;

      if (typeof rule.condition === 'function') {
        isValid = rule.condition(value, { field, userPatterns: this.userBehaviorPatterns });
      } else if (rule.condition instanceof RegExp) {
        isValid = rule.condition.test(value);
      } else {
        isValid = value === rule.condition;
      }

      if (!isValid) {
        const error: PreventionError = {
          id: `error-${rule.id}-${Date.now()}`,
          ruleId: rule.id,
          message: rule.message,
          severity: rule.severity,
          field: field.id,
          suggestion: rule.suggestion || 'Please check this field',
          canAutoFix: !!rule.autoFix,
          context: rule.context || 'Field validation',
          timestamp: Date.now()
        };
        errors.push(error);

        if (rule.suggestion) {
          suggestions.push(rule.suggestion);
        }
      }
    });

    // Generate contextual warnings
    const contextualWarnings = this.generateContextualWarnings(field, value);
    warnings.push(...contextualWarnings);

    // Calculate prevention score
    const preventionScore = this.calculatePreventionScore(errors, warnings, field);

    const validation: FieldValidation = {
      fieldId: field.id,
      value,
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      confidence: this.calculateValidationConfidence(field, value),
      autoFixable: errors.some(e => e.canAutoFix),
      preventionScore
    };

    this.preventionCache.set(cacheKey, validation);
    return validation;
  }

  private generateContextualWarnings(field: FormField, value: any): PreventionWarning[] {
    const warnings: PreventionWarning[] = [];

    // Data quality warnings
    if (field.type === 'text' && value && value.length > 0) {
      if (value.length < 3) {
        warnings.push({
          id: `quality-short-${Date.now()}`,
          message: 'This seems quite short for this field',
          type: 'quality',
          suggestion: 'Consider adding more detail if possible',
          importance: 'low',
          context: 'Data quality check'
        });
      }

      if (/[A-Z]{4,}/.test(value)) {
        warnings.push({
          id: `quality-caps-${Date.now()}`,
          message: 'Consider if all caps is appropriate here',
          type: 'quality',
          suggestion: 'Mixed case is usually easier to read',
          importance: 'low',
          context: 'Readability check'
        });
      }
    }

    // Consistency warnings
    if (field.type === 'email' && value) {
      const domain = value.split('@')[1];
      if (domain && domain.includes('tempmail') || domain.includes('10minutemail')) {
        warnings.push({
          id: `consistency-temp-${Date.now()}`,
          message: 'Temporary email addresses may cause delivery issues',
          type: 'consistency',
          suggestion: 'Consider using a permanent email address',
          importance: 'medium',
          context: 'Email reliability'
        });
      }
    }

    return warnings;
  }

  private calculatePreventionScore(errors: PreventionError[], warnings: PreventionWarning[], field: FormField): number {
    if (errors.length === 0 && warnings.length === 0) return 1;

    let score = 1;
    score -= errors.length * 0.3; // Each error reduces score by 30%
    score -= warnings.length * 0.1; // Each warning reduces score by 10%

    // Bonus for auto-fixable errors
    const autoFixableErrors = errors.filter(e => e.canAutoFix).length;
    score += autoFixableErrors * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  private calculateValidationConfidence(field: FormField, value: any): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on field type
    if (field.type === 'email') confidence += 0.1;
    if (field.type === 'password') confidence += 0.05;

    // Adjust based on value strength
    if (value && typeof value === 'string') {
      if (value.length > 10) confidence += 0.05;
      if (/[A-Z]/.test(value)) confidence += 0.02;
      if (/[0-9]/.test(value)) confidence += 0.02;
      if (/[^A-Za-z0-9]/.test(value)) confidence += 0.02;
    }

    return Math.min(1, confidence);
  }

  updateUserBehavior(userId: string, fieldId: string, behavior: Partial<UserBehaviorPattern>): void {
    const existing = this.userBehaviorPatterns.get(`${userId}-${fieldId}`) || this.userBehaviorPatterns.get('default')!;
    const updated: UserBehaviorPattern = {
      ...existing,
      ...behavior,
      userId,
      fieldId,
      lastUsed: Date.now()
    };

    this.userBehaviorPatterns.set(`${userId}-${fieldId}`, updated);
  }

  getPreventionSuggestions(field: FormField, currentValue: any): string[] {
    const suggestions: string[] = [];
    const rules = this.preventionRules.get(field.type) || [];

    rules.forEach(rule => {
      if (rule.suggestion) {
        suggestions.push(rule.suggestion);
      }
    });

    // Add contextual suggestions
    if (field.type === 'password' && currentValue && currentValue.length < 8) {
      suggestions.push('Try: "MySecurePass123!"');
    }

    if (field.type === 'email' && currentValue && !currentValue.includes('@')) {
      suggestions.push('Add @ symbol and domain (e.g., @gmail.com)');
    }

    return [...new Set(suggestions)]; // Remove duplicates
  }
}

// Main component implementation
export const PreventiveErrorUI: React.FC<PreventiveErrorUIProps> = ({
  fields,
  onFieldChange,
  onPreventionError,
  onPreventionWarning,
  onAutoFix,
  enableRealTimeValidation = true,
  enableSmartSuggestions = true,
  enableAutoFix = true,
  preventionThreshold = 0.7,
  userBehaviorData = [],
  className = '',
  theme = 'auto'
}) => {
  const [fieldValidations, setFieldValidations] = useState<Map<string, FieldValidation>>(new Map());
  const [showSuggestions, setShowSuggestions] = useState<Set<string>>(new Set());
  const [autoFixInProgress, setAutoFixInProgress] = useState<Set<string>>(new Set());

  const preventionEngine = useRef(new PreventionEngine());
  const analytics = useRef(new EmotionalErrorAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();
  const shouldReduceMotion = useReducedMotion();

  // Initialize user behavior data
  useEffect(() => {
    userBehaviorData.forEach(behavior => {
      preventionEngine.current.updateUserBehavior(behavior.userId, behavior.fieldId, behavior);
    });
  }, [userBehaviorData]);

  // Validate fields when they change
  useEffect(() => {
    const validations = new Map<string, FieldValidation>();

    fields.forEach(field => {
      const validation = preventionEngine.current.validateField(field, field.value);
      validations.set(field.id, validation);

      // Report errors and warnings
      validation.errors.forEach(error => {
        onPreventionError?.(error);
        analytics.current.trackEmotionalResponse({
          id: `prevention-${error.id}`,
          errorId: error.id,
          emotionalStrategy: {
            id: 'preventive',
            name: 'Preventive Guidance',
            description: 'Proactive error prevention',
            primaryGoal: 'prevent_escalation',
            emotionalApproach: 'encouraging',
            communicationStyle: 'supportive',
            tone: 'optimistic',
            pacing: 'gentle',
            intensity: 'low'
          },
          responseType: 'encouraging',
          primaryMessage: error.message,
          supportiveMessage: error.suggestion,
          frustrationReducers: [],
          emotionalSupport: {
            primarySupport: 'I can help you avoid this issue',
            secondarySupport: 'Let me guide you through this',
            encouragement: 'You\'re doing great by checking this',
            empathyStatement: 'I know forms can be tricky',
            frustrationAcknowledgment: 'This validation helps prevent frustration later',
            confidenceBuilder: 'You\'ve got this - just follow the suggestion',
            relationshipBuilder: 'I\'m here to help you succeed',
            trustSignal: 'This validation ensures data quality'
          },
          recoveryGuidance: {
            approach: 'step_by_step',
            complexity: 'minimal',
            userControl: 'guided',
            emotionalPacing: 'patient',
            progressVisibility: 'detailed'
          },
          visualPresentation: {
            icon: 'understanding',
            color: 'supportive',
            animation: 'gentle',
            layout: 'clear',
            typography: 'friendly'
          },
          interactionStyle: {
            responsiveness: 'immediate',
            feedback: 'detailed',
            guidance: 'explicit',
            control: 'user_driven',
            pace: 'user_controlled'
          },
          followUpActions: [],
          effectivenessPrediction: validation.confidence,
          timestamp: Date.now()
        }, {
          id: error.id,
          type: 'validation',
          severity: error.severity,
          title: 'Prevention Alert',
          technicalMessage: error.message,
          emotionalContext: {
            userEmotionalState: 'confused',
            frustrationLevel: 0.2,
            emotionalIntensity: 'low',
            emotionalTrajectory: 'stable',
            copingCapacity: 'high',
            stressIndicators: [],
            emotionalNeeds: [{
              type: 'clarity',
              priority: 'medium',
              satisfactionLevel: 0.6,
              expression: 'Need clear guidance',
              fulfillmentActions: ['provide_suggestion']
            }],
            communicationPreference: 'supportive',
            tonePreference: 'friendly'
          },
          frustrationTriggers: [{
            id: 'preventive_validation',
            type: 'unclear_instructions',
            severity: 0.3,
            description: 'Validation message may be confusing',
            context: 'Form validation',
            frequency: 0.1,
            userImpact: 'minor',
            mitigationStrategies: ['clear_suggestions', 'friendly_tone']
          }],
          userJourney: {
            currentStep: 'form_completion',
            intendedGoal: 'submit_form',
            progressMade: 0.8,
            timeSpent: 30,
            workflowComplexity: 'simple',
            interruptionCount: 0,
            frustrationThreshold: 0.5,
            patienceLevel: 'high'
          },
          previousErrors: [],
          errorCount: 1,
          timeSinceLastError: 0,
          userIntent: 'complete_form',
          expectedOutcome: 'successful_submission',
          actualOutcome: 'validation_error',
          timestamp: Date.now(),
          sessionId: 'preventive-session'
        });
      });

      validation.warnings.forEach(warning => {
        onPreventionWarning?.(warning);
      });
    });

    setFieldValidations(validations);
  }, [fields, onPreventionError, onPreventionWarning]);

  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;

    const validation = preventionEngine.current.validateField(field, value);
    setFieldValidations(prev => new Map(prev.set(fieldId, validation)));

    onFieldChange?.(fieldId, value, validation);
  }, [fields, onFieldChange]);

  const handleAutoFix = useCallback(async (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    const validation = fieldValidations.get(fieldId);

    if (!field || !validation?.autoFixable) return;

    setAutoFixInProgress(prev => new Set([...prev, fieldId]));

    // Simulate auto-fix delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const rules = field.validationRules || preventionEngine.current['preventionRules'].get(field.type) || [];
    let fixedValue = field.value;

    // Apply auto-fix rules
    rules.forEach(rule => {
      if (rule.autoFix && !validation.isValid) {
        fixedValue = rule.autoFix(fixedValue);
      }
    });

    handleFieldChange(fieldId, fixedValue);
    onAutoFix?.(fieldId, fixedValue);

    setAutoFixInProgress(prev => {
      const newSet = new Set(prev);
      newSet.delete(fieldId);
      return newSet;
    });
  }, [fields, fieldValidations, handleFieldChange, onAutoFix]);

  const getFieldStatus = (fieldId: string) => {
    const validation = fieldValidations.get(fieldId);
    if (!validation) return 'unknown';

    if (validation.isValid) return 'valid';
    if (validation.errors.length > 0) return 'error';
    if (validation.warnings.length > 0) return 'warning';
    return 'valid';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      valid: 'border-green-300 bg-green-50',
      error: 'border-red-300 bg-red-50',
      warning: 'border-yellow-300 bg-yellow-50',
      unknown: 'border-gray-300 bg-gray-50'
    };
    return colors[status as keyof typeof colors] || colors.unknown;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      valid: '✅',
      error: '⚠️',
      warning: '💡',
      unknown: '❓'
    };
    return icons[status as keyof typeof icons] || icons.unknown;
  };

  return (
    <div className={`preventive-error-ui ${className} theme-${theme}`}>
      {/* Prevention overview */}
      <div className="prevention-overview">
        <h3>Smart Form Validation</h3>
        <div className="overview-stats">
          <span className="valid-fields">
            {Array.from(fieldValidations.values()).filter(v => v.isValid).length} valid
          </span>
          <span className="fields-with-issues">
            {Array.from(fieldValidations.values()).filter(v => !v.isValid).length} need attention
          </span>
          <span className="prevention-score">
            Prevention: {Math.round(
              Array.from(fieldValidations.values()).reduce((sum, v) => sum + v.preventionScore, 0) /
              Math.max(fieldValidations.size, 1) * 100
            )}%
          </span>
        </div>
      </div>

      {/* Form fields with prevention */}
      <div className="preventive-fields">
        {fields.map((field) => {
          const validation = fieldValidations.get(field.id);
          const status = getFieldStatus(field.id);
          const showSuggestion = showSuggestions.has(field.id);

          return (
            <div key={field.id} className="preventive-field">
              <div className={`field-container ${getStatusColor(status)}`}>
                {/* Field label */}
                <label className="field-label">
                  {field.label}
                  {field.required && <span className="required-indicator">*</span>}
                </label>

                {/* Input field */}
                <div className="field-input-container">
                  {field.type === 'textarea' ? (
                    <textarea
                      className="field-input"
                      value={field.value || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type}
                      className="field-input"
                      value={field.value || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      maxLength={field.maxLength}
                      minLength={field.minLength}
                      pattern={typeof field.pattern === 'string' ? field.pattern : undefined}
                      required={field.required}
                      autoComplete={field.autoComplete}
                    />
                  )}

                  {/* Status indicator */}
                  <div className="field-status">
                    <span className="status-icon">{getStatusIcon(status)}</span>
                  </div>
                </div>

                {/* Prevention feedback */}
                <AnimatePresence>
                  {validation && !validation.isValid && (
                    <motion.div
                      className="prevention-feedback"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    >
                      {/* Errors */}
                      {validation.errors.map((error) => (
                        <div key={error.id} className={`prevention-error severity-${error.severity}`}>
                          <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error.message}</span>
                          </div>
                          <div className="error-suggestion">
                            💡 {error.suggestion}
                          </div>
                        </div>
                      ))}

                      {/* Warnings */}
                      {validation.warnings.map((warning) => (
                        <div key={warning.id} className={`prevention-warning importance-${warning.importance}`}>
                          <div className="warning-message">
                            <span className="warning-icon">💡</span>
                            <span className="warning-text">{warning.message}</span>
                          </div>
                          <div className="warning-suggestion">
                            → {warning.suggestion}
                          </div>
                        </div>
                      ))}

                      {/* Auto-fix button */}
                      {validation.autoFixable && enableAutoFix && (
                        <button
                          className="auto-fix-button"
                          onClick={() => handleAutoFix(field.id)}
                          disabled={autoFixInProgress.has(field.id)}
                        >
                          {autoFixInProgress.has(field.id) ? 'Fixing...' : '🔧 Auto-fix'}
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Smart suggestions */}
                {enableSmartSuggestions && validation?.suggestions && validation.suggestions.length > 0 && (
                  <div className="smart-suggestions">
                    <button
                      className="suggestions-toggle"
                      onClick={() => {
                        const newShow = new Set(showSuggestions);
                        if (showSuggestion) {
                          newShow.delete(field.id);
                        } else {
                          newShow.add(field.id);
                        }
                        setShowSuggestions(newShow);
                      }}
                    >
                      💡 Suggestions {showSuggestion ? '−' : '+'}
                    </button>

                    <AnimatePresence>
                      {showSuggestion && (
                        <motion.div
                          className="suggestions-list"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {validation.suggestions?.map((suggestion, index) => (
                            <div key={index} className="suggestion-item">
                              <span className="suggestion-bullet">•</span>
                              <span className="suggestion-text">{suggestion}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Prevention score */}
                {validation && (
                  <div className="prevention-score">
                    <div className="score-bar">
                      <div
                        className="score-fill"
                        style={{ width: `${validation.preventionScore * 100}%` }}
                      />
                    </div>
                    <span className="score-text">
                      {Math.round(validation.preventionScore * 100)}% prevented
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prevention summary */}
      <div className="prevention-summary">
        <h4>Prevention Summary</h4>
        <div className="summary-items">
          <div className="summary-item">
            <span className="summary-label">Errors Prevented:</span>
            <span className="summary-value">
              {Array.from(fieldValidations.values()).reduce((sum, v) => sum + v.errors.length, 0)}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Auto-fix Available:</span>
            <span className="summary-value">
              {Array.from(fieldValidations.values()).filter(v => v.autoFixable).length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Overall Score:</span>
            <span className="summary-value">
              {Math.round(
                Array.from(fieldValidations.values()).reduce((sum, v) => sum + v.preventionScore, 0) /
                Math.max(fieldValidations.size, 1) * 100
              )}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreventiveErrorUI;