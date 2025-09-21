
/**
 * Document Insights and Analytics Service
 * Phase 6: AI Intelligence & Document Analysis
 *
 * Provides comprehensive analytics and insights for document management,
 * including usage patterns, security metrics, and actionable recommendations.
 */

import type { DocumentAnalysisResult } from './documentAnalyzer';

export interface DocumentMetrics {
  averageSize: number;
  categoryDistribution: Record<string, number>;
  documentsThisMonth: number;
  documentsThisWeek: number;
  growthRate: number;
  securityLevels: Record<string, number>;
  totalDocuments: number;
  totalSize: number;
  typeDistribution: Record<string, number>;
}

export interface SecurityInsights {
  complianceScore: number;
  documentsNearingExpiry: number;
  documentsWithoutPasswords: number;
  documentsWithPII: number;
  recommendations: SecurityRecommendation[];
  vulnerabilityCount: number;
}

export interface SecurityRecommendation {
  actionRequired: boolean;
  description: string;
  documentIds: string[];
  estimatedTime: string;
  severity: 'critical' | 'high' | 'low' | 'medium';
  title: string;
  type:
    | 'access_control'
    | 'encryption_upgrade'
    | 'expiry_update'
    | 'password_protection'
    | 'pii_review';
}

export interface UsagePatterns {
  frequentlyAccessedCategories: string[];
  mostActiveDays: string[];
  mostActiveHours: number[];
  searchPatterns: string[];
  uploadTrends: {
    daily: number[];
    monthly: number[];
    weekly: number[];
  };
  userBehavior: {
    averageSessionDuration: number;
    documentsPerSession: number;
    mostCommonActions: string[];
    searchesPerSession: number;
  };
}

export interface DocumentHealth {
  duplicates: DuplicateGroup[];
  healthScore: number;
  issues: DocumentIssue[];
  largeSizeWarnings: string[];
  oldDocuments: string[];
  orphanedFiles: string[];
}

export interface DocumentIssue {
  autoFixable: boolean;
  description: string;
  documentId: string;
  id: string;
  resolution: string;
  severity: 'high' | 'low' | 'medium';
  type:
    | 'access_denied'
    | 'corrupted_file'
    | 'invalid_format'
    | 'missing_metadata'
    | 'security_concern';
}

export interface DuplicateGroup {
  documents: Array<{
    id: string;
    name: string;
    size: number;
    uploadedAt: string;
  }>;
  hash: string;
  recommendedAction: 'keep_largest' | 'keep_newest' | 'manual_review';
  similarity: number;
}

export interface InsightsDashboardData {
  health: DocumentHealth;
  overview: DocumentMetrics;
  predictions: {
    costProjection: number;
    documentsExpected: number;
    maintenanceRequired: string[];
    storageNeeded: number;
  };
  security: SecurityInsights;
  trends: {
    categoryTrends: Array<{
      category: string;
      change: number;
      trend: 'down' | 'stable' | 'up';
    }>;
    securityTrends: Array<{ date: string; issues: number; score: number }>;
    storageGrowth: Array<{ count: number; date: string; size: number }>;
  };
  usage: UsagePatterns;
}

export interface AnalyticsFilter {
  categories?: string[];
  dateRange?: {
    end: Date;
    start: Date;
  };
  securityLevels?: string[];
  types?: string[];
  userId?: string;
}

export class DocumentInsightsService {
  private static instance: DocumentInsightsService;
  private analyticsCache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DocumentInsightsService {
    if (!DocumentInsightsService.instance) {
      DocumentInsightsService.instance = new DocumentInsightsService();
    }
    return DocumentInsightsService.instance;
  }

  /**
   * Get comprehensive dashboard data with all insights
   */
  async getDashboardData(
    filter?: AnalyticsFilter
  ): Promise<InsightsDashboardData> {
    const cacheKey = `dashboard_${JSON.stringify(filter)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const [overview, security, usage, health, trends, predictions] =
        await Promise.all([
          this.getDocumentMetrics(filter),
          this.getSecurityInsights(filter),
          this.getUsagePatterns(filter),
          this.getDocumentHealth(filter),
          this.getTrends(filter),
          this.getPredictions(filter),
        ]);

      const dashboardData: InsightsDashboardData = {
        overview,
        security,
        usage,
        health,
        trends,
        predictions,
      };

      this.setCache(cacheKey, dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard insights');
    }
  }

  /**
   * Get document metrics and statistics
   */
  async getDocumentMetrics(filter?: AnalyticsFilter): Promise<DocumentMetrics> {
    // Using mock data for now until Supabase table is set up
    const documents = this.generateMockDocuments();
    const filteredDocs = this.applyFilter(documents || [], filter);
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const docsThisMonth = filteredDocs.filter(
      doc => new Date(doc.created_at) >= thisMonth
    );
    const docsThisWeek = filteredDocs.filter(
      doc => new Date(doc.created_at) >= thisWeek
    );
    const docsLastMonth = filteredDocs.filter(doc => {
      const docDate = new Date(doc.created_at);
      return docDate >= lastMonth && docDate < thisMonth;
    });

    const totalSize = filteredDocs.reduce(
      (sum, doc) => sum + (doc.size || 0),
      0
    );
    const categoryDist = this.getDistribution(filteredDocs, 'category');
    const typeDist = this.getDistribution(filteredDocs, 'type');
    const securityDist = this.getDistribution(filteredDocs, 'security_level');

    const growthRate =
      docsLastMonth.length > 0
        ? ((docsThisMonth.length - docsLastMonth.length) /
            docsLastMonth.length) *
          100
        : docsThisMonth.length > 0
          ? 100
          : 0;

    return {
      totalDocuments: filteredDocs.length,
      totalSize,
      averageSize:
        filteredDocs.length > 0 ? totalSize / filteredDocs.length : 0,
      documentsThisMonth: docsThisMonth.length,
      documentsThisWeek: docsThisWeek.length,
      growthRate,
      categoryDistribution: categoryDist,
      typeDistribution: typeDist,
      securityLevels: securityDist,
    };
  }

  /**
   * Get security insights and recommendations
   */
  async getSecurityInsights(
    filter?: AnalyticsFilter
  ): Promise<SecurityInsights> {
    // Using mock data for now until Supabase table is set up
    const documents = this.generateMockDocuments();
    const filteredDocs = this.applyFilter(documents || [], filter);
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    let documentsWithPII = 0;
    let documentsWithoutPasswords = 0;
    let vulnerabilityCount = 0;
    const recommendations: SecurityRecommendation[] = [];

    const documentsNearingExpiry = filteredDocs.filter(doc => {
      if (doc.expiry_date) {
        const expiryDate = new Date(doc.expiry_date);
        return expiryDate <= thirtyDaysFromNow && expiryDate > now;
      }
      return false;
    }).length;

    filteredDocs.forEach(doc => {
      const analysis = doc.analysis_result as DocumentAnalysisResult;

      if (analysis?.piiDetected && analysis.piiDetected.length > 0) {
        documentsWithPII++;
      }

      if (!doc.is_password_protected) {
        documentsWithoutPasswords++;
        if (
          (analysis?.category as any) === 'financial' ||
          (analysis?.category as any) === 'legal'
        ) {
          recommendations.push({
            type: 'password_protection',
            severity: 'high',
            title: 'Add Password Protection',
            description: `${doc.name} contains sensitive information and should be password protected`,
            documentIds: [doc.id],
            actionRequired: true,
            estimatedTime: '2 minutes',
          });
        }
      }

      // Check for vulnerability indicators in recommendations
      if (analysis?.recommendations?.some(r => r.type === 'security')) {
        vulnerabilityCount += analysis.recommendations.filter(
          r => r.type === 'security'
        ).length;
      }
    });

    // Add expiry recommendations
    if (documentsNearingExpiry > 0) {
      recommendations.push({
        type: 'expiry_update',
        severity: 'medium',
        title: 'Update Document Expiry Dates',
        description: `${documentsNearingExpiry} documents are expiring within 30 days`,
        documentIds: filteredDocs
          .filter(
            doc =>
              doc.expiry_date && new Date(doc.expiry_date) <= thirtyDaysFromNow
          )
          .map(doc => doc.id),
        actionRequired: false,
        estimatedTime: '5 minutes',
      });
    }

    const complianceScore = this.calculateComplianceScore(filteredDocs);

    return {
      documentsWithPII,
      documentsWithoutPasswords,
      documentsNearingExpiry,
      vulnerabilityCount,
      complianceScore,
      recommendations: recommendations.slice(0, 10), // Limit to top 10
    };
  }

  /**
   * Get usage patterns and analytics
   */
  async getUsagePatterns(filter?: AnalyticsFilter): Promise<UsagePatterns> {
    // In a real implementation, this would analyze user activity logs
    // For now, we'll provide simulated realistic patterns
    const documents = this.generateMockDocuments();
    const filteredDocs = this.applyFilter(documents || [], filter);

    // Analyze upload patterns by hour
    const hourlyUploads = new Array(24).fill(0);
    const dailyUploads: Record<string, number> = {};
    const categoryAccess: Record<string, number> = {};

    filteredDocs.forEach(doc => {
      const date = new Date(doc.created_at);
      const hour = date.getHours();
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });

      hourlyUploads[hour]++;
      dailyUploads[day] = (dailyUploads[day] || 0) + 1;

      const category = doc.category || 'uncategorized';
      categoryAccess[category] = (categoryAccess[category] || 0) + 1;
    });

    const mostActiveHours = hourlyUploads
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);

    const mostActiveDays = Object.entries(dailyUploads)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);

    const frequentlyAccessedCategories = Object.entries(categoryAccess)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);

    return {
      mostActiveHours,
      mostActiveDays,
      frequentlyAccessedCategories,
      searchPatterns: ['financial documents', 'insurance', 'contracts'], // Simulated
      uploadTrends: {
        daily: this.generateTrendData(7),
        weekly: this.generateTrendData(4),
        monthly: this.generateTrendData(12),
      },
      userBehavior: {
        averageSessionDuration: 12.5, // minutes
        documentsPerSession: 3.2,
        searchesPerSession: 1.8,
        mostCommonActions: ['upload', 'view', 'search', 'organize'],
      },
    };
  }

  /**
   * Get document health analysis
   */
  async getDocumentHealth(filter?: AnalyticsFilter): Promise<DocumentHealth> {
    // Using mock data for now until Supabase table is set up
    const documents = this.generateMockDocuments();
    const filteredDocs = this.applyFilter(documents || [], filter);
    const issues: DocumentIssue[] = [];
    const duplicates: DuplicateGroup[] = [];
    const orphanedFiles: string[] = [];
    const largeSizeWarnings: string[] = [];
    const oldDocuments: string[] = [];

    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
    const LARGE_FILE_THRESHOLD = 10 * 1024 * 1024; // 10MB

    // Analyze each document for health issues
    filteredDocs.forEach(doc => {
      // Check for missing metadata
      if (!doc.category || !doc.type) {
        issues.push({
          id: `missing_metadata_${doc.id}`,
          type: 'missing_metadata',
          severity: 'low',
          documentId: doc.id,
          description: 'Document is missing category or type information',
          resolution: 'Update document metadata through the document editor',
          autoFixable: false,
        });
      }

      // Check for large files
      if (doc.size && doc.size > LARGE_FILE_THRESHOLD) {
        largeSizeWarnings.push(doc.id);
      }

      // Check for old documents
      if (doc.created_at && new Date(doc.created_at) < sixMonthsAgo) {
        oldDocuments.push(doc.id);
      }

      // Check for security concerns
      const analysis = doc.analysis_result as DocumentAnalysisResult;
      if (
        analysis?.piiDetected &&
        analysis.piiDetected.length > 0 &&
        !doc.is_password_protected
      ) {
        issues.push({
          id: `security_${doc.id}`,
          type: 'security_concern',
          severity: 'high',
          documentId: doc.id,
          description: 'Document contains PII but is not password protected',
          resolution: 'Add password protection to this document',
          autoFixable: false,
        });
      }
    });

    // Find potential duplicates based on filename similarity
    const fileGroups = this.groupSimilarFiles(filteredDocs);
    fileGroups.forEach(group => {
      if (group.documents.length > 1) {
        duplicates.push({
          hash: group.hash,
          documents: group.documents.map(doc => ({
            id: doc.id,
            name: doc.name,
            size: doc.size || 0,
            uploadedAt: doc.created_at,
          })),
          similarity: group.similarity,
          recommendedAction: 'manual_review',
        });
      }
    });

    const healthScore = this.calculateHealthScore(
      filteredDocs.length,
      issues.length,
      duplicates.length,
      orphanedFiles.length
    );

    return {
      healthScore,
      issues: issues.slice(0, 20), // Limit to top 20 issues
      duplicates,
      orphanedFiles,
      largeSizeWarnings,
      oldDocuments,
    };
  }

  /**
   * Get trend analysis
   */
  private async getTrends(_filter?: AnalyticsFilter) {
    // Generate simulated trend data
    const dates = this.getLast30Days();
    const storageGrowth = dates.map(date => ({
      date: date.toISOString().split('T')[0],
      size: Math.floor(Math.random() * 1000000) + 5000000,
      count: Math.floor(Math.random() * 50) + 100,
    }));

    const categoryTrends = [
      { category: 'financial', trend: 'up' as const, change: 15.2 },
      { category: 'legal', trend: 'stable' as const, change: 2.1 },
      { category: 'personal', trend: 'up' as const, change: 8.7 },
      { category: 'medical', trend: 'down' as const, change: -3.4 },
    ];

    const securityTrends = dates.map(date => ({
      date: date.toISOString().split('T')[0],
      score: Math.floor(Math.random() * 20) + 80,
      issues: Math.floor(Math.random() * 5),
    }));

    return {
      storageGrowth,
      categoryTrends,
      securityTrends,
    };
  }

  /**
   * Get predictions and forecasts
   */
  private async getPredictions(_filter?: AnalyticsFilter) {
    // Simulate predictions based on current trends
    return {
      storageNeeded: 2.5, // GB
      documentsExpected: 150,
      maintenanceRequired: [
        'Review password protection for financial documents',
        'Update expiry dates for 12 documents',
        'Organize uncategorized documents',
      ],
      costProjection: 29.99, // USD per month
    };
  }

  /**
   * Generate actionable recommendations based on insights
   */
  async getRecommendations(
    filter?: AnalyticsFilter
  ): Promise<SecurityRecommendation[]> {
    const insights = await this.getDashboardData(filter);
    const recommendations: SecurityRecommendation[] = [
      ...insights.security.recommendations,
    ];

    // Add performance recommendations
    if (insights.health.largeSizeWarnings.length > 5) {
      recommendations.push({
        type: 'encryption_upgrade',
        severity: 'medium',
        title: 'Optimize Large Files',
        description: `${insights.health.largeSizeWarnings.length} files are larger than 10MB. Consider compression.`,
        documentIds: insights.health.largeSizeWarnings,
        actionRequired: false,
        estimatedTime: '10 minutes',
      });
    }

    // Add organization recommendations
    if (
      insights.health.issues.filter(i => i.type === 'missing_metadata').length >
      10
    ) {
      recommendations.push({
        type: 'access_control',
        severity: 'low',
        title: 'Improve Document Organization',
        description:
          'Many documents are missing categories and tags. Better organization improves searchability.',
        documentIds: insights.health.issues
          .filter(i => i.type === 'missing_metadata')
          .map(i => i.documentId),
        actionRequired: false,
        estimatedTime: '15 minutes',
      });
    }

    return recommendations.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Export insights data for reporting
   */
  async exportInsights(
    format: 'csv' | 'json' = 'json',
    filter?: AnalyticsFilter
  ): Promise<string> {
    const data = await this.getDashboardData(filter);

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return JSON.stringify(data, null, 2);
  }

  // Private helper methods

  private applyFilter(documents: any[], filter?: AnalyticsFilter): any[] {
    if (!filter) return documents;

    return documents.filter(doc => {
      if (filter.dateRange) {
        const docDate = new Date(doc.created_at);
        if (
          docDate < filter.dateRange.start ||
          docDate > filter.dateRange.end
        ) {
          return false;
        }
      }

      if (filter.categories && !filter.categories.includes(doc.category)) {
        return false;
      }

      if (filter.types && !filter.types.includes(doc.type)) {
        return false;
      }

      if (
        filter.securityLevels &&
        !filter.securityLevels.includes(doc.security_level)
      ) {
        return false;
      }

      if (filter.userId && doc.user_id !== filter.userId) {
        return false;
      }

      return true;
    });
  }

  private getDistribution(
    documents: any[],
    field: string
  ): Record<string, number> {
    const distribution: Record<string, number> = {};
    documents.forEach(doc => {
      const value = doc[field] || 'unknown';
      distribution[value] = (distribution[value] || 0) + 1;
    });
    return distribution;
  }

  private calculateComplianceScore(documents: any[]): number {
    if (documents.length === 0) return 100;

    let score = 100;
    let issues = 0;

    documents.forEach(doc => {
      const analysis = doc.analysis_result as DocumentAnalysisResult;

      // Check for PII without protection
      if (
        analysis?.piiDetected &&
        analysis.piiDetected.length > 0 &&
        !doc.is_password_protected
      ) {
        issues++;
      }

      // Check for missing expiry dates on important documents
      if (
        (doc.category === 'financial' || doc.category === 'legal') &&
        !doc.expiry_date
      ) {
        issues++;
      }

      // Check for old analysis results
      if (
        analysis &&
        new Date(analysis.timestamp) <
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ) {
        issues++;
      }
    });

    const deductionPerIssue = Math.min(100 / documents.length, 10);
    score -= issues * deductionPerIssue;

    return Math.max(0, Math.round(score));
  }

  private calculateHealthScore(
    totalDocs: number,
    issues: number,
    duplicates: number,
    orphaned: number
  ): number {
    if (totalDocs === 0) return 100;

    const issueWeight = 0.6;
    const duplicateWeight = 0.3;
    const orphanedWeight = 0.1;

    const issueScore = Math.max(
      0,
      100 - (issues / totalDocs) * 100 * issueWeight
    );
    const duplicateScore = Math.max(
      0,
      100 - (duplicates / totalDocs) * 100 * duplicateWeight
    );
    const orphanedScore = Math.max(
      0,
      100 - (orphaned / totalDocs) * 100 * orphanedWeight
    );

    return Math.round(issueScore + duplicateScore + orphanedScore);
  }

  private groupSimilarFiles(
    documents: any[]
  ): Array<{ documents: any[]; hash: string; similarity: number }> {
    const groups: Array<{
      documents: any[];
      hash: string;
      similarity: number;
    }> = [];
    const processed = new Set<string>();

    documents.forEach(doc => {
      if (processed.has(doc.id)) return;

      const similar = documents.filter(
        other =>
          other.id !== doc.id &&
          !processed.has(other.id) &&
          this.calculateFileSimilarity(doc.name, other.name) > 0.8
      );

      if (similar.length > 0) {
        const group = {
          hash: this.generateHash(
            [doc, ...similar]
              .map(d => d.id)
              .sort()
              .join('')
          ),
          documents: [doc, ...similar],
          similarity: 0.8,
        };
        groups.push(group);

        [doc, ...similar].forEach(d => processed.add(d.id));
      }
    });

    return groups;
  }

  private calculateFileSimilarity(name1: string, name2: string): number {
    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const n1 = normalize(name1);
    const n2 = normalize(name2);

    if (n1 === n2) return 1;

    const longer = n1.length > n2.length ? n1 : n2;
    const shorter = n1.length > n2.length ? n2 : n1;

    if (longer.length === 0) return 1;

    let matches = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (longer.includes(shorter[i])) matches++;
    }

    return matches / longer.length;
  }

  private generateHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private generateTrendData(periods: number): number[] {
    return Array.from(
      { length: periods },
      () => Math.floor(Math.random() * 50) + 10
    );
  }

  private getLast30Days(): Date[] {
    const dates: Date[] = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dates.push(date);
    }

    return dates;
  }

  private convertToCSV(data: InsightsDashboardData): string {
    const headers = ['Metric', 'Value', 'Category'];
    const rows: string[][] = [headers];

    // Add overview metrics
    Object.entries(data.overview).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          rows.push([`${key}_${subKey}`, String(subValue), 'Overview']);
        });
      } else {
        rows.push([key, String(value), 'Overview']);
      }
    });

    // Add security metrics
    Object.entries(data.security).forEach(([key, value]) => {
      if (key !== 'recommendations') {
        rows.push([key, String(value), 'Security']);
      }
    });

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  private getFromCache(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() < expiry) {
      return this.analyticsCache.get(key);
    }
    this.analyticsCache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.analyticsCache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Clear analytics cache
   */
  clearCache(): void {
    this.analyticsCache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get real-time metrics for live dashboard updates
   */
  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    documentsProcessing: number;
    storageUsed: number;
    systemLoad: number;
  }> {
    // In a real implementation, this would connect to real-time monitoring
    return {
      activeUsers: Math.floor(Math.random() * 10) + 1,
      documentsProcessing: Math.floor(Math.random() * 5),
      systemLoad: Math.random() * 100,
      storageUsed: Math.random() * 80 + 20,
    };
  }

  /**
   * Generate mock documents for testing
   */
  private generateMockDocuments(): any[] {
    const categories = [
      'financial',
      'legal',
      'personal',
      'medical',
      'insurance',
    ];
    const types = ['pdf', 'docx', 'jpg', 'png', 'xlsx'];
    const securityLevels = ['public', 'private', 'confidential', 'restricted'];
    const now = new Date();
    const documents = [];

    // Generate realistic mock documents
    for (let i = 0; i < 45; i++) {
      const daysAgo = Math.floor(Math.random() * 180); // Random date within last 6 months
      const created_at = new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000
      );
      const category =
        categories[Math.floor(Math.random() * categories.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const hasExpiry = Math.random() > 0.5;
      const expiryDays = Math.floor(Math.random() * 365) - 30; // -30 to +335 days from now
      const hasPII = Math.random() > 0.6;
      const isPasswordProtected = Math.random() > 0.4;

      documents.push({
        id: `doc_${i + 1}`,
        name: `${category}_document_${i + 1}.${type}`,
        category,
        type,
        size: Math.floor(Math.random() * 15000000) + 100000, // 100KB to 15MB
        created_at: created_at.toISOString(),
        updated_at: created_at.toISOString(),
        user_id: 'user_1',
        security_level:
          securityLevels[Math.floor(Math.random() * securityLevels.length)],
        is_password_protected: isPasswordProtected,
        expiry_date: hasExpiry
          ? new Date(
              now.getTime() + expiryDays * 24 * 60 * 60 * 1000
            ).toISOString()
          : null,
        analysis_result: {
          category,
          piiDetection: {
            hasPII,
            types: hasPII
              ? ['ssn', 'email', 'phone'].slice(
                  0,
                  Math.floor(Math.random() * 3) + 1
                )
              : [],
          },
          security: {
            vulnerabilities: Math.random() > 0.8 ? ['outdated_encryption'] : [],
          },
          timestamp: created_at.toISOString(),
        },
      });
    }

    return documents;
  }
}

export const documentInsightsService = DocumentInsightsService.getInstance();
