
/**
 * Quick Insights Engine Service
 * Handles document analysis, family impact calculations, and insight generation
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  DocumentAnalysis,
  FamilyImpactStatement,
  InsightAnalytics,
  InsightCalculation,
  InsightFilters,
  QuickInsight,
} from '@/types/insights';

// Document type for analysis
interface DocumentForAnalysis {
  content?: string;
  created_at: string;
  id: string;
  metadata?: Record<string, any>;
  name: string;
  size?: number;
  type: string;
  updated_at: string;
  user_id: string;
}

// Family member type for analysis
interface FamilyMemberForAnalysis {
  age?: number;
  birth_date?: string;
  contact_info?: Record<string, any>;
  id: string;
  name: string;
  relationship: string;
  role?: string;
}

export class InsightsService {
  private readonly INSIGHT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private insightCache = new Map<
    string,
    { data: QuickInsight[]; timestamp: number }
  >();

  /**
   * Generate insights for a specific document
   */
  async analyzeDocument(
    documentId: string,
    userId: string
  ): Promise<DocumentAnalysis> {
    try {
      // Fetch document details
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (docError || !document) {
        throw new Error('Document not found');
      }

      // Analyze document content (this would integrate with AI/ML service)
      // Map database document to DocumentForAnalysis interface
      const mappedDocument = {
        ...document,
        name: document.title || 'Untitled',
        type: document.document_type || 'unknown',
      } as DocumentForAnalysis;

      const analysis = await this.performDocumentAnalysis(mappedDocument);

      // Generate insights based on analysis
      const insights = await this.generateDocumentInsights(mappedDocument, analysis);

      // Store insights in database
      await this.storeInsights(insights.immediate.concat(insights.potential));

      return {
        documentId,
        documentType: document.document_type || 'unknown',
        extractedValue: analysis,
        insights,
        recommendations: this.generateRecommendations(analysis, mappedDocument),
      };
    } catch (error) {
      console.error('Document analysis failed:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive family impact statement
   */
  async generateFamilyImpactStatement(
    userId: string
  ): Promise<FamilyImpactStatement> {
    try {
      // Fetch user's family members
      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId);

      // Fetch user's documents for analysis
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);

      // Map documents to the expected interface
      const mappedDocuments = (documents || []).map(doc => ({
        ...doc,
        name: doc.title || 'Untitled',
        type: doc.document_type || 'unknown',
      } as DocumentForAnalysis));

      // Calculate protection gaps and levels
      const protectionAnalysis = this.calculateProtectionLevel(mappedDocuments);

      // Generate impact scenarios
      const impactScenarios = this.generateImpactScenarios(
        familyMembers || [],
        mappedDocuments
      );

      const statement: FamilyImpactStatement = {
        userId,
        scenario: impactScenarios.primary,
        impactDescription: this.generateImpactDescription(
          protectionAnalysis,
          familyMembers || []
        ),
        affectedMembers: (familyMembers || []).map(member => ({
          memberId: member.id,
          name: member.name,
          impact: this.calculateMemberImpact(member, mappedDocuments),
          riskLevel: this.calculateMemberRisk(member, protectionAnalysis),
        })),
        protectionGaps: this.identifyProtectionGaps(mappedDocuments),
        overallProtectionLevel: protectionAnalysis.percentage,
        estimatedTimeSaved: 0, // Default value
        emotionalBenefits: this.generateEmotionalBenefits(protectionAnalysis),
        generatedAt: new Date().toISOString(),
      };

      // Store the impact statement
      await (supabase as any).from('family_impact_statements').upsert({
        user_id: userId,
        statement: statement,
        created_at: new Date().toISOString(),
      });

      return statement;
    } catch (error) {
      console.error('Family impact statement generation failed:', error);
      throw error;
    }
  }

  /**
   * Calculate time saved and protection level metrics
   */
  async calculateInsightMetrics(userId: string): Promise<InsightCalculation> {
    try {
      const { data: documents } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId);

      const { data: familyMembers } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId);

      // Map documents to the expected interface
      const mappedDocuments = (documents || []).map(doc => ({
        ...doc,
        name: doc.title || 'Untitled',
        type: doc.document_type || 'unknown',
      } as DocumentForAnalysis));

      const timeSaved = this.calculateTimeSaved(mappedDocuments);
      const protectionLevel = this.calculateProtectionLevel(mappedDocuments);
      const familyImpact = this.calculateFamilyImpactMetrics(
        familyMembers || [],
        mappedDocuments
      );
      const urgencyScore = this.calculateUrgencyScore(
        mappedDocuments,
        familyMembers || []
      );

      return {
        timeSaved,
        protectionLevel,
        familyImpact,
        urgencyScore,
      };
    } catch (error) {
      console.error('Insight metrics calculation failed:', error);
      throw error;
    }
  }

  /**
   * Get all insights for a user with filtering
   */
  async getUserInsights(
    userId: string,
    filters?: InsightFilters
  ): Promise<QuickInsight[]> {
    const cacheKey = `insights_${userId}_${JSON.stringify(filters || {})}`;
    const cached = this.insightCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.INSIGHT_CACHE_TTL) {
      return cached.data;
    }

    try {
      let query = supabase
        .from('quick_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.types?.length) {
          query = query.in('type', filters.types);
        }
        if (filters.impact?.length) {
          query = query.in('impact', filters.impact);
        }
        if (filters.priority?.length) {
          query = query.in('priority', filters.priority);
        }
        if (filters.actionable !== undefined) {
          query = query.eq('actionable', filters.actionable);
        }
        if (filters.timeRange) {
          query = query
            .gte('created_at', filters.timeRange.start)
            .lte('created_at', filters.timeRange.end);
        }
      }

      const { data, error } = await query;

      if (error) throw error;

      const insights = (data || []).map(insight => ({
        ...insight,
        createdAt: insight.created_at,
        updatedAt: insight.updated_at,
        userId: insight.user_id,
      })) as unknown as QuickInsight[];

      // Cache the results
      this.insightCache.set(cacheKey, {
        data: insights,
        timestamp: Date.now(),
      });

      return insights;
    } catch (error) {
      console.error('Failed to fetch user insights:', error);
      throw error;
    }
  }

  /**
   * Generate new insights based on recent activity
   */
  async generateFreshInsights(userId: string): Promise<QuickInsight[]> {
    try {
      // Get recent documents and activity
      const { data: recentDocs } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const insights: QuickInsight[] = [];

      // Generate insights for each recent document
      for (const doc of recentDocs || []) {
        const mappedDoc = {
          ...doc,
          name: doc.title || 'Untitled',
          type: doc.document_type || 'unknown',
        } as DocumentForAnalysis;

        const docInsights = await this.generateDocumentSpecificInsights(
          mappedDoc,
          userId
        );
        insights.push(...docInsights);
      }

      // Generate overall progress insights
      const progressInsights = await this.generateProgressInsights(userId);
      insights.push(...progressInsights);

      // Store new insights
      await this.storeInsights(insights);

      return insights;
    } catch (error) {
      console.error('Fresh insights generation failed:', error);
      throw error;
    }
  }

  /**
   * Get insight analytics and trends
   */
  async getInsightAnalytics(userId: string): Promise<InsightAnalytics> {
    try {
      const { data: insights } = await supabase
        .from('quick_insights')
        .select('*')
        .eq('user_id', userId);

      // Note: insight_actions table doesn't exist in current schema
      const actions: any[] = [];

      const mappedInsights = (insights || []).map(insight => ({
        ...insight,
        createdAt: insight.created_at,
        updatedAt: insight.updated_at,
        userId: insight.user_id,
      })) as unknown as QuickInsight[];

      return this.calculateInsightAnalytics(mappedInsights, actions);
    } catch (error) {
      console.error('Insight analytics calculation failed:', error);
      throw error;
    }
  }

  // Private helper methods
  private async performDocumentAnalysis(
    document: DocumentForAnalysis
  ): Promise<DocumentAnalysis['extractedValue']> {
    // This would integrate with AI service for document analysis
    // For now, providing structured analysis based on document type

    const baseScore = Math.random() * 0.3 + 0.7; // 70-100% quality score

    return {
      keyInfo: this.extractKeyInformation(document),
      missingInfo: this.identifyMissingInformation(document),
      qualityScore: baseScore,
      completenessPercentage: Math.round(baseScore * 100),
    };
  }

  private extractKeyInformation(document: DocumentForAnalysis): string[] {
    const info: string[] = [];

    if (document.type === 'will') {
      info.push(
        'Beneficiaries identified',
        'Asset distribution specified',
        'Executor named'
      );
    } else if (document.type === 'insurance_policy') {
      info.push(
        'Coverage amount specified',
        'Beneficiaries listed',
        'Policy terms defined'
      );
    } else if (document.type === 'property_deed') {
      info.push(
        'Property address confirmed',
        'Ownership details clear',
        'Transfer conditions set'
      );
    }

    return info;
  }

  private identifyMissingInformation(document: DocumentForAnalysis): string[] {
    const missing: string[] = [];

    // Basic validation based on document type
    if (!(document as any).beneficiaries?.length) {
      missing.push('Beneficiary information');
    }
    if (!document.metadata?.guardian_info) {
      missing.push('Guardian designation');
    }

    return missing;
  }

  private async generateDocumentInsights(
    document: DocumentForAnalysis,
    analysis: DocumentAnalysis['extractedValue']
  ): Promise<{ immediate: QuickInsight[]; potential: QuickInsight[] }> {
    const immediate: QuickInsight[] = [];
    const potential: QuickInsight[] = [];

    // Generate immediate insights
    if (analysis.completenessPercentage < 80) {
      immediate.push({
        id: `doc_incomplete_${document.id}`,
        userId: document.user_id,
        documentId: document.id,
        type: 'completion_gap',
        title: 'Document Incomplete',
        description: `Your ${document.type} is ${analysis.completenessPercentage}% complete. Adding missing information will strengthen your family's protection.`,
        impact: 'high',
        priority: 'important',
        actionable: true,
        actionText: 'Complete Document',
        actionUrl: `/vault/${document.id}/edit`,
        metadata: {
          calculatedAt: new Date().toISOString(),
          confidence: 0.9,
          category: 'document_quality',
          tags: ['incomplete', 'action_required'],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return { immediate, potential };
  }

  private generateRecommendations(
    analysis: DocumentAnalysis['extractedValue'],
    _document: DocumentForAnalysis
  ) {
    const recommendations = [];

    if (analysis.completenessPercentage < 90) {
      recommendations.push({
        priority: 'high' as const,
        action: 'Complete missing information',
        reason: 'Incomplete documents may not provide full legal protection',
        impact:
          'Ensures your wishes are clearly documented and legally enforceable',
      });
    }

    return recommendations;
  }

  private calculateTimeSaved(
    documents: DocumentForAnalysis[]
  ): InsightCalculation['timeSaved'] {
    const baseTimePerDoc = 2.5; // Average hours saved per document
    const totalHours = documents.length * baseTimePerDoc;

    return {
      hours: Math.round(totalHours * 10) / 10,
      tasks: [
        'Legal consultations',
        'Document drafting',
        'Research time',
        'Administrative work',
      ],
      comparison: `Equivalent to ${Math.ceil(totalHours / 8)} full work days`,
    };
  }

  private calculateProtectionLevel(
    documents: DocumentForAnalysis[]
  ): InsightCalculation['protectionLevel'] {
    const essentialDocs = [
      'will',
      'power_of_attorney',
      'healthcare_directive',
      'insurance_policy',
    ];
    const hasEssential = essentialDocs.filter(type =>
      documents.some(doc => doc.type === type)
    );

    const basePercentage = (hasEssential.length / essentialDocs.length) * 70;
    const bonusPercentage = Math.min(30, documents.length * 5);
    const percentage = Math.min(100, basePercentage + bonusPercentage);

    const gaps = essentialDocs.filter(
      type => !documents.some(doc => doc.type === type)
    );

    return {
      percentage: Math.round(percentage),
      gaps: gaps.map(gap => `Missing ${gap.replace('_', ' ')}`),
      strengths: hasEssential.map(
        strength => `${strength.replace('_', ' ')} documented`
      ),
    };
  }

  private calculateFamilyImpactMetrics(
    familyMembers: FamilyMemberForAnalysis[],
    _documents: DocumentForAnalysis[]
  ): InsightCalculation['familyImpact'] {
    return {
      members: familyMembers.length,
      scenarios: [
        'Sudden incapacity',
        'Estate distribution',
        'Healthcare decisions',
        'Financial management',
      ],
      benefits: [
        'Clear inheritance plan',
        'Reduced family stress',
        'Legal protection',
        'Peace of mind',
      ],
    };
  }

  private calculateUrgencyScore(
    documents: DocumentForAnalysis[],
    familyMembers: FamilyMemberForAnalysis[]
  ): InsightCalculation['urgencyScore'] {
    let score = 0;
    const factors: string[] = [];

    // Age factor
    if (familyMembers.some(m => m.age && m.age > 65)) {
      score += 30;
      factors.push('Family members over 65');
    }

    // Missing essential documents
    const essentialDocs = ['will', 'power_of_attorney', 'healthcare_directive'];
    const missingEssential = essentialDocs.filter(
      type => !documents.some(doc => doc.type === type)
    );

    score += missingEssential.length * 20;
    if (missingEssential.length > 0) {
      factors.push(`Missing ${missingEssential.length} essential document(s)`);
    }

    // Recent life events (placeholder - would be tracked in user profile)
    // score += recentEvents * 15;

    const timeline =
      score > 70
        ? 'Immediate action recommended'
        : score > 40
          ? 'Action needed within 3 months'
          : 'Plan to complete within 6 months';

    return {
      score: Math.min(100, score),
      factors,
      timeline,
    };
  }

  private generateImpactDescription(
    protectionAnalysis: InsightCalculation['protectionLevel'],
    familyMembers: FamilyMemberForAnalysis[]
  ): string {
    const level = protectionAnalysis.percentage;

    if (level > 80) {
      return `Your family has strong protection with ${level}% coverage. ${familyMembers.length} family members will benefit from your comprehensive planning.`;
    } else if (level > 50) {
      return `Your family has moderate protection with ${level}% coverage. Completing remaining documents will provide full security for ${familyMembers.length} family members.`;
    } else {
      return `Your family currently has ${level}% protection. Immediate action is recommended to secure ${familyMembers.length} family members' future.`;
    }
  }

  private generateImpactScenarios(
    familyMembers: FamilyMemberForAnalysis[],
    documents: DocumentForAnalysis[]
  ): { primary: string } {
    return {
      primary: `In case of unexpected events, your current documentation will guide ${familyMembers.length} family members through important decisions with ${documents.length} secure documents.`,
    };
  }

  private calculateMemberImpact(
    member: FamilyMemberForAnalysis,
    _documents: DocumentForAnalysis[]
  ): string {
    if (member.role === 'spouse') {
      return 'Primary beneficiary with full access to estate planning decisions';
    } else if (member.role === 'child') {
      return 'Protected inheritance rights and clear guardianship provisions';
    } else {
      return 'Designated beneficiary with specific provisions outlined';
    }
  }

  private calculateMemberRisk(
    member: FamilyMemberForAnalysis,
    protectionAnalysis: InsightCalculation['protectionLevel']
  ): 'high' | 'low' | 'medium' {
    const level = protectionAnalysis.percentage;

    if (member.role === 'spouse' && level < 60) return 'high';
    if (member.role === 'child' && level < 70) return 'medium';
    if (level < 50) return 'high';
    if (level < 80) return 'medium';
    return 'low';
  }

  private identifyProtectionGaps(
    documents: DocumentForAnalysis[]
  ): FamilyImpactStatement['protectionGaps'] {
    const gaps: FamilyImpactStatement['protectionGaps'] = [];

    const essentialDocs = ['will', 'power_of_attorney', 'healthcare_directive'];

    essentialDocs.forEach(docType => {
      if (!documents.some(doc => doc.type === docType)) {
        gaps.push({
          area: docType
            .replace('_', ' ')
            .replace(/\b\w/g, l => l.toUpperCase()),
          risk: `Family decisions may be delayed or contested without clear ${docType.replace('_', ' ')} documentation`,
          recommendation: `Create a comprehensive ${docType.replace('_', ' ')} to protect your family`,
          urgency: 'immediate' as const,
        });
      }
    });

    return gaps;
  }

  private generateEmotionalBenefits(
    protectionAnalysis: InsightCalculation['protectionLevel']
  ): string[] {
    const benefits = [
      'Peace of mind knowing your family is protected',
      'Reduced stress during difficult times',
      'Clear guidance for your loved ones',
      'Confidence in your legacy planning',
    ];

    if (protectionAnalysis.percentage > 80) {
      benefits.push('Complete security and family harmony');
    }

    return benefits;
  }

  private async generateDocumentSpecificInsights(
    document: DocumentForAnalysis,
    userId: string
  ): Promise<QuickInsight[]> {
    const insights: QuickInsight[] = [];

    // Check document age and suggest updates
    const docAge = Date.now() - new Date(document.created_at).getTime();
    const ageInMonths = docAge / (1000 * 60 * 60 * 24 * 30);

    if (ageInMonths > 12 && document.type === 'will') {
      insights.push({
        id: `will_review_${document.id}`,
        userId,
        documentId: document.id,
        type: 'urgent_action',
        title: 'Annual Will Review Due',
        description:
          'Your will is over a year old. An annual review ensures it reflects your current wishes and circumstances.',
        impact: 'medium',
        priority: 'important',
        actionable: true,
        actionText: 'Schedule Review',
        actionUrl: `/vault/${document.id}/review`,
        metadata: {
          calculatedAt: new Date().toISOString(),
          confidence: 0.8,
          category: 'document_maintenance',
          tags: ['review_due', 'annual_check'],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return insights;
  }

  private async generateProgressInsights(
    userId: string
  ): Promise<QuickInsight[]> {
    const insights: QuickInsight[] = [];

    const calculation = await this.calculateInsightMetrics(userId);

    // Protection level insight
    insights.push({
      id: `protection_level_${userId}`,
      userId,
      type: 'protection_level',
      title: 'Family Protection Update',
      description: `Your family protection is at ${calculation.protectionLevel.percentage}%. ${calculation.protectionLevel.gaps.length === 0 ? 'Excellent coverage!' : 'A few steps will complete your protection.'}`,
      value: `${calculation.protectionLevel.percentage}%`,
      impact: calculation.protectionLevel.percentage > 80 ? 'low' : 'high',
      priority:
        calculation.protectionLevel.percentage > 80
          ? 'nice_to_have'
          : 'important',
      actionable: calculation.protectionLevel.gaps.length > 0,
      actionText:
        calculation.protectionLevel.gaps.length > 0
          ? 'Complete Protection'
          : undefined,
      actionUrl:
        calculation.protectionLevel.gaps.length > 0 ? '/vault' : undefined,
      metadata: {
        calculatedAt: new Date().toISOString(),
        confidence: 0.95,
        category: 'protection_status',
        tags: ['protection_level', 'family_security'],
      },
      familyImpact: {
        affectedMembers: [],
        riskReduction: calculation.protectionLevel.percentage,
        emotionalBenefit: 'Enhanced family security and peace of mind',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return insights;
  }

  private async storeInsights(insights: QuickInsight[]): Promise<void> {
    if (insights.length === 0) return;

    try {
      // Map QuickInsight to database schema
      const dbInsights = insights.map(insight => ({
        id: insight.id,
        user_id: insight.userId,
        document_id: insight.documentId || null,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        priority: insight.priority,
        actionable: insight.actionable || false,
        action_text: insight.actionText || null,
        action_url: insight.actionUrl || null,
        value: insight.value || null,
        metadata: insight.metadata || {},
        family_impact: insight.familyImpact || null,
        created_at: insight.createdAt,
        updated_at: insight.updatedAt,
      }));

      const { error } = await supabase
        .from('quick_insights')
        .upsert(dbInsights, { onConflict: 'id' });

      if (error) throw error;

      // Clear cache for affected users
      insights.forEach(insight => {
        const cacheKeys = Array.from(this.insightCache.keys()).filter(key =>
          key.includes(insight.userId)
        );
        cacheKeys.forEach(key => this.insightCache.delete(key));
      });
    } catch (error) {
      console.error('Failed to store insights:', error);
      throw error;
    }
  }

  private calculateInsightAnalytics(
    insights: QuickInsight[],
    actions: Array<{ completed?: boolean; created_at?: string; impact: string; timestamp: string; type: string; }>
  ): InsightAnalytics {
    const totalInsights = insights.length;
    const actionableInsights = insights.filter(i => i.actionable).length;
    const completedActions = actions.filter(a => a.completed || false).length;

    // Calculate average protection level from recent insights
    const protectionInsights = insights.filter(
      i => i.type === 'protection_level'
    );
    const averageProtectionLevel =
      protectionInsights.length > 0
        ? protectionInsights.reduce(
            (sum, i) => sum + parseInt(i.value || '0'),
            0
          ) / protectionInsights.length
        : 0;

    // Calculate total time saved
    const timeSavedInsights = insights.filter(i => i.type === 'time_saved');
    const totalTimeSaved = timeSavedInsights.reduce((sum, i) => {
      const hours = parseFloat(i.value?.replace(' hours', '') || '0');
      return sum + hours;
    }, 0);

    // Calculate top categories
    const categoryCount = insights.reduce(
      (acc, i) => {
        const category = i.metadata?.category || 'unknown';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topCategories = Object.entries(categoryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({
        category,
        count,
        averageImpact: this.calculateAverageImpact(
          insights.filter(i => i.metadata?.category === category)
        ),
      }));

    // Generate trend data (last 30 days)
    const trendData = this.generateTrendData(insights, actions);

    return {
      totalInsights,
      actionableInsights,
      completedActions,
      averageProtectionLevel: Math.round(averageProtectionLevel),
      totalTimeSaved,
      topCategories,
      trendData,
    };
  }

  private calculateAverageImpact(insights: QuickInsight[]): string {
    if (insights.length === 0) return 'medium';

    const impactScores = insights.map(i => {
      switch (i.impact) {
        case 'high':
          return 3;
        case 'medium':
          return 2;
        case 'low':
          return 1;
        default:
          return 2;
      }
    });

    const average =
      impactScores.reduce((sum, score) => sum + score, 0) / impactScores.length;

    if (average > 2.5) return 'high';
    if (average > 1.5) return 'medium';
    return 'low';
  }

  private generateTrendData(
    insights: QuickInsight[],
    actions: Array<{ completed?: boolean; created_at?: string; impact: string; timestamp: string; type: string; }>
  ): InsightAnalytics['trendData'] {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map(date => {
      const dayInsights = insights.filter(i => i.createdAt?.startsWith(date));
      const dayActions = actions.filter(
        a => a.created_at?.startsWith(date) && (a.completed || false)
      );

      const protectionInsights = dayInsights.filter(
        i => i.type === 'protection_level'
      );
      const avgProtection =
        protectionInsights.length > 0
          ? protectionInsights.reduce(
              (sum, i) => sum + parseInt(i.value || '0'),
              0
            ) / protectionInsights.length
          : 0;

      return {
        date,
        insightsGenerated: dayInsights.length,
        actionsCompleted: dayActions.length,
        protectionLevel: Math.round(avgProtection),
      };
    });
  }
}

export const insightsService = new InsightsService();
