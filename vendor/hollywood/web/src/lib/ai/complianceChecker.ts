
/**
 * Automated Compliance Checker and Legal Review System for LegacyGuard
 * Provides intelligent compliance monitoring and legal requirement validation
 */

export interface ComplianceRule {
  category: ComplianceCategory;
  description: string;
  exemptions?: ExemptionRule[];
  id: string;
  jurisdiction: string;
  keywords: string[];
  lastUpdated: string;
  name: string;
  patterns: RegExp[];
  regulation: string;
  requirements: ComplianceRequirement[];
  severity: 'critical' | 'high' | 'low' | 'medium';
  validationLogic: ValidationLogic;
  version: string;
}

export interface ComplianceRequirement {
  deadline?: string;
  description: string;
  documentation: string[];
  id: string;
  mandatory: boolean;
  validationCriteria: ValidationCriteria[];
}

export interface ValidationLogic {
  confidence: number;
  rules: ValidationStep[];
  type: 'ai' | 'custom' | 'keyword' | 'pattern';
}

export interface ValidationStep {
  action: 'exempt' | 'flag' | 'recommend' | 'require';
  condition: string;
  message: string;
  priority: number;
}

export interface ValidationCriteria {
  field: string;
  operator:
    | 'between'
    | 'contains'
    | 'equals'
    | 'greater_than'
    | 'less_than'
    | 'matches';
  required: boolean;
  value: unknown;
}

export interface ExemptionRule {
  condition: string;
  reason: string;
  validUntil?: string;
}

export interface ComplianceCheck {
  automated: boolean;
  checkedAt: string;
  documentId: string;
  exemptions: AppliedExemption[];
  findings: ComplianceFinding[];
  id: string;
  nextCheckDue?: string;
  recommendations: ComplianceRecommendation[];
  reviewRequired: boolean;
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'high' | 'low' | 'medium';
  status: ComplianceStatus;
}

export interface ComplianceFinding {
  confidence: number;
  description: string;
  evidence: string[];
  id: string;
  impact: string;
  location?: DocumentLocation;
  remediation: RemediationStep[];
  severity: 'critical' | 'high' | 'low' | 'medium';
  type: 'gap' | 'recommendation' | 'risk' | 'violation';
}

export interface ComplianceRecommendation {
  actions: string[];
  category: 'best_practice' | 'legal' | 'regulatory' | 'security';
  cost?: 'high' | 'low' | 'medium';
  description: string;
  id: string;
  priority: 'high' | 'immediate' | 'low' | 'medium';
  riskReduction: number; // 0-1
  timeline: string;
  title: string;
}

export interface AppliedExemption {
  approvedBy: string;
  conditions?: string[];
  reason: string;
  ruleId: string;
  validUntil?: string;
}

export interface RemediationStep {
  automated: boolean;
  deadline?: string;
  description: string;
  owner: 'professional' | 'system' | 'user';
  resources?: string[];
  step: string;
}

export interface DocumentLocation {
  coordinates?: { height: number; width: number; x: number; y: number };
  line?: number;
  page?: number;
  paragraph?: number;
  section?: string;
}

export interface LegalReview {
  assignedTo?: string;
  completedAt?: string;
  createdAt: string;
  documentId: string;
  dueDate?: string;
  followUpRequired: boolean;
  id: string;
  issues: LegalIssue[];
  recommendations: LegalRecommendation[];
  requiredBy?: string;
  reviewType: LegalReviewType;
  status: LegalReviewStatus;
  urgency: 'high' | 'immediate' | 'low' | 'normal';
}

export interface LegalIssue {
  category: LegalIssueCategory;
  description: string;
  id: string;
  implications: string[];
  jurisdiction: string;
  precedent?: string[];
  severity: 'critical' | 'high' | 'low' | 'medium';
  statute?: string;
  timeframe?: string;
  title: string;
}

export interface LegalRecommendation {
  actions: string[];
  description: string;
  estimatedCost?: string;
  id: string;
  priority: number;
  professional:
    | 'attorney'
    | 'financial_planner'
    | 'notary'
    | 'other'
    | 'tax_advisor';
  timeline: string;
  title: string;
}

export type ComplianceCategory =
  | 'corporate'
  | 'data_protection'
  | 'employment'
  | 'estate_planning'
  | 'financial'
  | 'healthcare'
  | 'industry_specific'
  | 'insurance'
  | 'international'
  | 'privacy'
  | 'tax';

export type ComplianceStatus =
  | 'compliant'
  | 'exempt'
  | 'non_compliant'
  | 'partial'
  | 'under_review'
  | 'unknown';

export type LegalReviewType =
  | 'compliance_check'
  | 'contract_review'
  | 'dispute_prevention'
  | 'estate_planning'
  | 'general_counsel'
  | 'regulatory_filing'
  | 'risk_assessment'
  | 'tax_implications';

export type LegalReviewStatus =
  | 'completed'
  | 'escalated'
  | 'in_progress'
  | 'pending'
  | 'requires_followup';

export type LegalIssueCategory =
  | 'compliance_violation'
  | 'contract_terms'
  | 'employment_law'
  | 'estate_law'
  | 'intellectual_property'
  | 'liability'
  | 'privacy_law'
  | 'regulatory_change'
  | 'tax_implication';

class ComplianceCheckerService {
  private readonly ___COMPLIANCE_VERSION = '1.0';
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private activeChecks: Map<string, ComplianceCheck[]> = new Map();

  constructor() {
    this.initializeComplianceRules();
  }

  /**
   * Initialize built-in compliance rules
   */
  private initializeComplianceRules(): void {
    const defaultRules: ComplianceRule[] = [
      {
        id: 'gdpr-privacy',
        name: 'GDPR Privacy Compliance',
        description:
          'General Data Protection Regulation compliance for personal data',
        category: 'privacy',
        jurisdiction: 'EU',
        regulation: 'GDPR',
        severity: 'critical',
        requirements: [
          {
            id: 'gdpr-consent',
            description: 'Explicit consent for personal data processing',
            mandatory: true,
            documentation: ['consent_forms', 'privacy_policy'],
            validationCriteria: [
              {
                field: 'content',
                operator: 'contains',
                value: 'consent',
                required: true,
              },
            ],
          },
        ],
        keywords: ['personal data', 'privacy', 'consent', 'gdpr'],
        patterns: [/\b(personal\s+data|privacy\s+policy|consent)\b/i],
        validationLogic: {
          type: 'keyword',
          rules: [
            {
              condition: 'contains personal data',
              action: 'require',
              message:
                'Document contains personal data and requires GDPR compliance review',
              priority: 1,
            },
          ],
          confidence: 0.8,
        },
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      },
      {
        id: 'hipaa-healthcare',
        name: 'HIPAA Healthcare Privacy',
        description:
          'Health Insurance Portability and Accountability Act compliance',
        category: 'healthcare',
        jurisdiction: 'US',
        regulation: 'HIPAA',
        severity: 'critical',
        requirements: [
          {
            id: 'hipaa-phi',
            description: 'Protection of Protected Health Information (PHI)',
            mandatory: true,
            documentation: ['authorization_forms', 'privacy_notice'],
            validationCriteria: [
              {
                field: 'content',
                operator: 'contains',
                value: 'medical',
                required: false,
              },
            ],
          },
        ],
        keywords: ['medical', 'health', 'patient', 'phi', 'hipaa'],
        patterns: [
          /\b(medical\s+record|health\s+information|patient\s+data)\b/i,
        ],
        validationLogic: {
          type: 'keyword',
          rules: [
            {
              condition: 'contains health information',
              action: 'flag',
              message:
                'Document may contain protected health information requiring HIPAA compliance',
              priority: 1,
            },
          ],
          confidence: 0.7,
        },
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      },
      {
        id: 'estate-planning-law',
        name: 'Estate Planning Legal Requirements',
        description: 'Legal requirements for estate planning documents',
        category: 'estate_planning',
        jurisdiction: 'US',
        regulation: 'State Estate Laws',
        severity: 'high',
        requirements: [
          {
            id: 'will-witnesses',
            description: 'Proper witnessing and execution of will documents',
            mandatory: true,
            documentation: ['witness_signatures', 'notarization'],
            validationCriteria: [
              {
                field: 'signatures',
                operator: 'greater_than',
                value: 1,
                required: true,
              },
            ],
          },
        ],
        keywords: [
          'will',
          'testament',
          'estate',
          'beneficiary',
          'witness',
          'notary',
        ],
        patterns: [/\b(last\s+will|testament|estate\s+plan)\b/i],
        validationLogic: {
          type: 'pattern',
          rules: [
            {
              condition: 'is will document',
              action: 'require',
              message:
                'Will documents require proper legal execution and witnessing',
              priority: 1,
            },
          ],
          confidence: 0.9,
        },
        lastUpdated: new Date().toISOString(),
        version: '1.0',
      },
    ];

    defaultRules.forEach(rule => {
      this.complianceRules.set(rule.id, rule);
    });
  }

  /**
   * Perform comprehensive compliance check on a document
   */
  async checkCompliance(
    documentId: string,
    content: string,
    metadata: Record<string, unknown> = {}
  ): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = [];

    for (const [_ruleId, rule] of this.complianceRules.entries()) {
      const check = await this.performSingleComplianceCheck(
        documentId,
        content,
        metadata,
        rule
      );

      if (check) {
        checks.push(check);
      }
    }

    // Store checks for document
    this.activeChecks.set(documentId, checks);

    return checks.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Perform a single compliance rule check
   */
  private async performSingleComplianceCheck(
    documentId: string,
    content: string,
    metadata: Record<string, unknown>,
    rule: ComplianceRule
  ): Promise<ComplianceCheck | null> {
    // Check if rule applies to this document
    const applicability = await this.checkRuleApplicability(
      content,
      metadata,
      rule
    );
    if (!applicability.applies) {
      return null;
    }

    // Perform validation
    const findings = await this.validateAgainstRule(content, metadata, rule);

    if (findings.length === 0) {
      // Document is compliant with this rule
      return {
        id: this.generateId(),
        documentId,
        ruleId: rule.id,
        ruleName: rule.name,
        status: 'compliant',
        severity: rule.severity,
        findings: [],
        recommendations: [],
        exemptions: [],
        checkedAt: new Date().toISOString(),
        nextCheckDue: this.calculateNextCheckDate(rule),
        reviewRequired: false,
        automated: true,
      };
    }

    // Generate recommendations based on findings
    const recommendations = await this.generateComplianceRecommendations(
      findings,
      rule
    );

    // Check for exemptions
    const exemptions = await this.checkExemptions(rule, findings);

    // Determine overall status
    const status = this.determineComplianceStatus(findings, exemptions);

    return {
      id: this.generateId(),
      documentId,
      ruleId: rule.id,
      ruleName: rule.name,
      status,
      severity: rule.severity,
      findings,
      recommendations,
      exemptions,
      checkedAt: new Date().toISOString(),
      nextCheckDue: this.calculateNextCheckDate(rule),
      reviewRequired: findings.some(
        f => f.severity === 'critical' || f.severity === 'high'
      ),
      automated: true,
    };
  }

  /**
   * Check if a compliance rule applies to the document
   */
  private async checkRuleApplicability(
    content: string,
    metadata: Record<string, unknown>,
    rule: ComplianceRule
  ): Promise<{ applies: boolean; confidence: number; reasons: string[] }> {
    const reasons: string[] = [];
    let confidence = 0;

    // Check keywords
    const keywordMatches = rule.keywords.filter(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    );
    if (keywordMatches.length > 0) {
      confidence += 0.3;
      reasons.push(`Contains keywords: ${keywordMatches.join(', ')}`);
    }

    // Check patterns
    const patternMatches = rule.patterns.filter(pattern =>
      pattern.test(content)
    );
    if (patternMatches.length > 0) {
      confidence += 0.4;
      reasons.push(`Matches compliance patterns`);
    }

    // Check document metadata
    if (metadata.category === rule.category) {
      confidence += 0.3;
      reasons.push(`Document category matches rule category`);
    }

    return {
      applies: confidence > 0.3,
      confidence,
      reasons,
    };
  }

  /**
   * Validate document content against compliance rule
   */
  private async validateAgainstRule(
    content: string,
    metadata: Record<string, unknown>,
    rule: ComplianceRule
  ): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];

    for (const step of rule.validationLogic.rules) {
      const violation = await this.checkValidationStep(
        content,
        metadata,
        step,
        rule
      );
      if (violation) {
        findings.push(violation);
      }
    }

    return findings;
  }

  /**
   * Check individual validation step
   */
  private async checkValidationStep(
    content: string,
    _metadata: Record<string, unknown>,
    step: ValidationStep,
    rule: ComplianceRule
  ): Promise<ComplianceFinding | null> {
    let conditionMet = false;

    // Simple condition checking (in production, would use more sophisticated logic)
    switch (step.condition) {
      case 'contains personal data':
        conditionMet = this.containsPersonalData(content);
        break;
      case 'contains health information':
        conditionMet = this.containsHealthInformation(content);
        break;
      case 'is will document':
        conditionMet = this.isWillDocument(content);
        break;
      default:
        conditionMet = false;
    }

    if (!conditionMet) {
      return null;
    }

    return {
      id: this.generateId(),
      type: step.action === 'flag' ? 'risk' : 'violation',
      description: step.message,
      severity: this.mapStepSeverity(step.action, rule.severity),
      confidence: rule.validationLogic.confidence,
      evidence: this.extractEvidence(content, step.condition),
      impact: this.describeImpact(step.action, rule),
      remediation: await this.generateRemediationSteps(step, rule),
    };
  }

  /**
   * Generate compliance recommendations
   */
  private async generateComplianceRecommendations(
    findings: ComplianceFinding[],
    rule: ComplianceRule
  ): Promise<ComplianceRecommendation[]> {
    const recommendations: ComplianceRecommendation[] = [];

    for (const finding of findings) {
      if (finding.type === 'violation' || finding.type === 'gap') {
        recommendations.push({
          id: this.generateId(),
          title: `Address ${rule.regulation} Compliance`,
          description: `Resolve compliance issue: ${finding.description}`,
          priority:
            finding.severity === 'critical'
              ? 'immediate'
              : finding.severity === 'high'
                ? 'high'
                : 'medium',
          category: 'regulatory',
          actions: finding.remediation.map(r => r.description),
          timeline: finding.severity === 'critical' ? 'Immediate' : '30 days',
          cost: 'medium',
          riskReduction: 0.8,
        });
      }
    }

    return recommendations;
  }

  /**
   * Check for applicable exemptions
   */
  private async checkExemptions(
    rule: ComplianceRule,
    findings: ComplianceFinding[]
  ): Promise<AppliedExemption[]> {
    const exemptions: AppliedExemption[] = [];

    if (rule.exemptions) {
      for (const exemption of rule.exemptions) {
        // Check if exemption condition is met
        // This is a simplified implementation
        if (findings.length === 0) {
          exemptions.push({
            ruleId: rule.id,
            reason: exemption.reason,
            approvedBy: 'system',
            validUntil: exemption.validUntil,
          });
        }
      }
    }

    return exemptions;
  }

  /**
   * Request legal review for a document
   */
  async requestLegalReview(
    documentId: string,
    reviewType: LegalReviewType,
    urgency: LegalReview['urgency'] = 'normal',
    requiredBy?: string
  ): Promise<LegalReview> {
    // Analyze document for legal issues
    const issues = await this.identifyLegalIssues(documentId, reviewType);
    const recommendations = await this.generateLegalRecommendations(
      issues,
      reviewType
    );

    const review: LegalReview = {
      id: this.generateId(),
      documentId,
      reviewType,
      urgency,
      requiredBy,
      issues,
      recommendations,
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: this.calculateReviewDueDate(urgency),
      followUpRequired: issues.some(i => i.severity === 'critical'),
    };

    await this.storeLegalReview(review);

    return review;
  }

  /**
   * Identify potential legal issues in a document
   */
  private async identifyLegalIssues(
    documentId: string,
    reviewType: LegalReviewType
  ): Promise<LegalIssue[]> {
    const issues: LegalIssue[] = [];

    // Get document content
    const content = await this.getDocumentContent(documentId);
    if (!content) return issues;

    // Check for common legal issues based on review type
    switch (reviewType) {
      case 'contract_review':
        issues.push(...(await this.checkContractIssues(content)));
        break;
      case 'estate_planning':
        issues.push(...(await this.checkEstatePlanningIssues(content)));
        break;
      case 'tax_implications':
        issues.push(...(await this.checkTaxIssues(content)));
        break;
      case 'compliance_check': {
        // Use existing compliance checks
        const complianceChecks = this.activeChecks.get(documentId) || [];
        issues.push(...this.convertComplianceToLegalIssues(complianceChecks));
        break;
      }
    }

    return issues;
  }

  /**
   * Helper methods for content analysis
   */
  private containsPersonalData(content: string): boolean {
    const patterns = [
      /\b\d{3}-?\d{2}-?\d{4}\b/, // SSN
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{3}-?\d{3}-?\d{4}\b/, // Phone
    ];

    return patterns.some(pattern => pattern.test(content));
  }

  private containsHealthInformation(content: string): boolean {
    const healthKeywords = [
      'medical',
      'health',
      'patient',
      'diagnosis',
      'treatment',
      'prescription',
      'doctor',
      'physician',
      'hospital',
      'clinic',
    ];

    const lowerContent = content.toLowerCase();
    return healthKeywords.some(keyword => lowerContent.includes(keyword));
  }

  private isWillDocument(content: string): boolean {
    const willPatterns = [
      /last\s+will\s+and\s+testament/i,
      /\bi,?\s+\w+\s+\w+,?\s+being\s+of\s+sound\s+mind/i,
      /\bbequeath\b/i,
      /\bexecutor\b/i,
      /\bbeneficiary\b/i,
    ];

    return willPatterns.some(pattern => pattern.test(content));
  }

  private mapStepSeverity(
    action: string,
    ruleSeverity: string
  ): ComplianceFinding['severity'] {
    if (action === 'require')
      return ruleSeverity as ComplianceFinding['severity'];
    if (action === 'flag') return 'medium';
    return 'low';
  }

  private extractEvidence(content: string, _condition: string): string[] {
    // Extract relevant text snippets as evidence
    const sentences = content.split('.').filter(s => s.trim().length > 10);
    return sentences
      .filter(s => {
        const lower = s.toLowerCase();
        return (
          lower.includes('personal') ||
          lower.includes('health') ||
          lower.includes('will') ||
          lower.includes('testament')
        );
      })
      .slice(0, 3);
  }

  private describeImpact(action: string, rule: ComplianceRule): string {
    switch (action) {
      case 'require':
        return `Non-compliance with ${rule.regulation} may result in legal penalties`;
      case 'flag':
        return `Potential compliance risk that should be reviewed`;
      default:
        return `Compliance concern identified`;
    }
  }

  private async generateRemediationSteps(
    _step: ValidationStep,
    rule: ComplianceRule
  ): Promise<RemediationStep[]> {
    return [
      {
        step: 'Review compliance requirement',
        description: `Review ${rule.regulation} requirements for this document type`,
        owner: 'user',
        automated: false,
      },
      {
        step: 'Consult legal professional',
        description: `Consult with attorney specializing in ${rule.category}`,
        owner: 'professional',
        automated: false,
        resources: ['legal_consultation'],
      },
      {
        step: 'Implement compliance measures',
        description: 'Update document to meet compliance requirements',
        owner: 'user',
        automated: false,
      },
    ];
  }

  private determineComplianceStatus(
    findings: ComplianceFinding[],
    exemptions: AppliedExemption[]
  ): ComplianceStatus {
    if (exemptions.length > 0) return 'exempt';

    const violations = findings.filter(f => f.type === 'violation');
    if (violations.length === 0) return 'compliant';

    const criticalViolations = violations.filter(
      f => f.severity === 'critical'
    );
    if (criticalViolations.length > 0) return 'non_compliant';

    return 'partial';
  }

  private calculateNextCheckDate(rule: ComplianceRule): string {
    // Calculate based on rule severity and type
    const months =
      rule.severity === 'critical' ? 3 : rule.severity === 'high' ? 6 : 12;

    const nextCheck = new Date();
    nextCheck.setMonth(nextCheck.getMonth() + months);
    return nextCheck.toISOString();
  }

  private calculateReviewDueDate(urgency: LegalReview['urgency']): string {
    const days =
      urgency === 'immediate'
        ? 1
        : urgency === 'high'
          ? 3
          : urgency === 'normal'
            ? 7
            : 14;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate.toISOString();
  }

  // Placeholder implementations
  private async checkContractIssues(_content: string): Promise<LegalIssue[]> {
    return [];
  }
  private async checkEstatePlanningIssues(
    _content: string
  ): Promise<LegalIssue[]> {
    return [];
  }
  private async checkTaxIssues(_content: string): Promise<LegalIssue[]> {
    return [];
  }

  private convertComplianceToLegalIssues(
    checks: ComplianceCheck[]
  ): LegalIssue[] {
    return checks.flatMap(check =>
      check.findings.map(finding => ({
        id: this.generateId(),
        category: 'compliance_violation' as LegalIssueCategory,
        title: `${check.ruleName} Compliance Issue`,
        description: finding.description,
        severity: finding.severity,
        jurisdiction: 'US', // Default
        implications: [finding.impact],
      }))
    );
  }

  private async generateLegalRecommendations(
    issues: LegalIssue[],
    _reviewType: LegalReviewType
  ): Promise<LegalRecommendation[]> {
    return issues.map(issue => ({
      id: this.generateId(),
      title: `Address ${issue.category}`,
      description: `Resolve legal issue: ${issue.title}`,
      actions: [
        'Consult with attorney',
        'Review legal requirements',
        'Update documentation',
      ],
      priority: issue.severity === 'critical' ? 1 : 2,
      professional: 'attorney',
      timeline: issue.severity === 'critical' ? 'Immediate' : '2 weeks',
    }));
  }

  private async getDocumentContent(
    _documentId: string
  ): Promise<null | string> {
    // In production, would retrieve from document store
    return null;
  }

  private async storeLegalReview(review: LegalReview): Promise<void> {
    // Store review request
    console.warn('Legal review requested:', review.id);
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}

// Export singleton instance
export const complianceChecker = new ComplianceCheckerService();
export default complianceChecker;
