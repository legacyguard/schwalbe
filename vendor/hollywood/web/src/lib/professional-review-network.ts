
import type { WillData } from '../types/will';

export type ReviewPriority = 'express' | 'standard' | 'urgent';
export type ReviewStatus =
  | 'assigned'
  | 'completed'
  | 'in_review'
  | 'pending'
  | 'requires_revision';
export type ProfessionalType =
  | 'attorney'
  | 'estate_planner'
  | 'notary'
  | 'tax_advisor';

export interface ProfessionalProfile {
  availability: 'booked' | 'immediate' | 'within_24h' | 'within_week';
  bio: string;
  contactInfo: {
    email: string;
    phone: string;
    website?: string;
  };
  credentials: string[];
  firm: string;
  hourlyRate: number;
  id: string;
  jurisdiction: string[];
  languages: string[];
  location: {
    address?: string;
    city: string;
    country: string;
  };
  name: string;
  profileImage?: string;
  rating: number;
  reviewCount: number;
  specializations: string[];
  title: string;
  type: ProfessionalType;
}

export interface ReviewRequest {
  budget: {
    currency: string;
    max: number;
    min: number;
  };
  createdAt: Date;
  estimatedCompletion?: Date;
  id: string;
  jurisdiction: string;
  language: string;
  notes?: string;
  priority: ReviewPriority;
  professionalId?: string;
  requestedBy: string;
  specificConcerns: string[];
  status: ReviewStatus;
  timeline: string;
  type: ProfessionalType;
  updatedAt: Date;
  willData: WillData;
}

export interface ConsultationOffer {
  id: string;
  nextSteps: string[];
  professionalId: string;
  proposedTimeline: string;
  recommendedServices: {
    description: string;
    estimatedCost: number;
    priority: 'essential' | 'optional' | 'recommended';
    service: string;
  }[];
  totalEstimate: {
    currency: string;
    max: number;
    min: number;
  };
  validUntil: Date;
  willComplexityAssessment: {
    complexity: 'complex' | 'moderate' | 'simple';
    estimatedHours: number;
    keyIssues: string[];
  };
}

export interface NotaryMatch {
  availableSlots: {
    date: Date;
    duration: number;
    location?: string;
    time: string;
    type: 'in_person' | 'video_call';
  }[];
  distanceFromUser?: number;
  professional: ProfessionalProfile;
  services: {
    duration: number;
    price: number;
    service: string;
  }[];
}

export interface ReviewFeedback {
  nextSteps: string[];
  overall: {
    clarity: number;
    completeness: number;
    legalCompliance: number;
    recommendations: number;
  };
  requiresRevision: boolean;
  specificIssues: {
    category: string;
    description: string;
    estimated_fix_time: string;
    recommendation: string;
    severity: 'critical' | 'high' | 'low' | 'medium';
  }[];
  summary: string;
}

export class ProfessionalReviewNetwork {
  private ___apiKey: string;
  private ___baseUrl: string = 'https://api.legacyguard.com/professional-network';

  constructor(apiKey: string) {
    this.___apiKey = apiKey;
  }

  /**
   * Request attorney review for will document
   */
  async requestAttorneyReview(
    willData: WillData,
    jurisdiction: string,
    options: {
      budget?: { currency: string; max: number; min: number };
      preferredLanguage?: string;
      priority?: ReviewPriority;
      specificConcerns?: string[];
      timeline?: string;
    } = {}
  ): Promise<ReviewRequest> {
    const reviewRequest: ReviewRequest = {
      id: this.generateId(),
      willData,
      requestedBy: willData.testator_data.fullName || 'Unknown',
      type: 'attorney',
      priority: options.priority || 'standard',
      status: 'pending',
      jurisdiction,
      language: options.preferredLanguage || 'en',
      specificConcerns: options.specificConcerns || [],
      budget: options.budget || { min: 200, max: 800, currency: 'EUR' },
      timeline: options.timeline || 'within_week',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Auto-match with suitable attorneys
    const suitableAttorneys = await this.findSuitableAttorneys(
      jurisdiction,
      willData
    );

    if (suitableAttorneys.length > 0) {
      reviewRequest.professionalId = suitableAttorneys[0].id;
      reviewRequest.status = 'assigned';
      reviewRequest.estimatedCompletion = this.calculateEstimatedCompletion(
        reviewRequest.priority
      );
    }

    return reviewRequest;
  }

  /**
   * Get estate planner consultation offers
   */
  async getEstateplannerConsultation(
    willData: WillData
  ): Promise<ConsultationOffer[]> {
    const complexity = this.assessWillComplexity(willData);
    const suitablePlanners = await this.findSuitablePlanners(willData);

    return suitablePlanners.map(
      planner =>
        ({
          id: this.generateId(),
          professionalId: planner.id,
          willComplexityAssessment: {
            complexity: complexity.level,
            estimatedHours: complexity.estimatedHours,
            keyIssues: complexity.keyIssues,
          },
          recommendedServices: this.generateRecommendedServices(
            willData,
            complexity
          ),
          totalEstimate: {
            min: complexity.estimatedHours * (planner.hourlyRate * 0.8),
            max: complexity.estimatedHours * (planner.hourlyRate * 1.2),
            currency: 'EUR',
          },
          proposedTimeline: this.calculateTimeline(complexity.level),
          nextSteps: [
            'Initial consultation call (30 minutes)',
            'Document review and analysis',
            'Preparation of recommendations',
            'Implementation of suggested changes',
          ],
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }) as ConsultationOffer
    );
  }

  /**
   * Connect with notary services including brnoadvokati.cz
   */
  async connectWithNotary(
    location: string,
    _willData?: WillData,
    preferences: {
      language?: string;
      serviceType?:
        | 'document_certification'
        | 'full_notarization'
        | 'will_witnessing';
      timeframe?: string;
    } = {}
  ): Promise<NotaryMatch[]> {
    const notaries = await this.findNotaries(location, preferences);

    // Include special integration with brnoadvokati.cz for Czech/Slovak users
    if (
      location.toLowerCase().includes('brno') ||
      location.toLowerCase().includes('czech') ||
      location.toLowerCase().includes('slovakia')
    ) {
      const brnoLawyers = await this.getBrnoAdvokatiIntegration();
      notaries.push(...brnoLawyers);
    }

    return notaries.map(notary => ({
      professional: notary,
      availableSlots: this.generateAvailableSlots(notary),
      services: this.getNotaryServices(notary, preferences.serviceType),
      distanceFromUser: this.calculateDistance(
        location || 'Unknown',
        notary.location.city
      ),
    }));
  }

  /**
   * Submit will for professional review and get feedback
   */
  async submitForReview(reviewRequest: ReviewRequest): Promise<ReviewFeedback> {
    // Simulate professional review process
    const feedback = await this.processReview(reviewRequest);

    // Update request status
    reviewRequest.status = feedback.requiresRevision
      ? 'requires_revision'
      : 'completed';
    reviewRequest.updatedAt = new Date();

    return feedback;
  }

  /**
   * Get list of available professionals by type and location
   */
  async searchProfessionals(
    type: ProfessionalType,
    filters: {
      availability?: string;
      jurisdiction?: string;
      language?: string;
      maxRate?: number;
      specialization?: string;
    } = {}
  ): Promise<ProfessionalProfile[]> {
    const allProfessionals = await this.getAllProfessionals();

    return allProfessionals.filter(professional => {
      if (professional.type !== type) return false;
      if (
        filters.jurisdiction &&
        !professional.jurisdiction.includes(filters.jurisdiction)
      )
        return false;
      if (
        filters.language &&
        !professional.languages.includes(filters.language)
      )
        return false;
      if (
        filters.specialization &&
        !professional.specializations.includes(filters.specialization)
      )
        return false;
      if (filters.maxRate && professional.hourlyRate > filters.maxRate)
        return false;
      if (
        filters.availability &&
        professional.availability !== filters.availability
      )
        return false;
      return true;
    });
  }

  // Private helper methods
  private async findSuitableAttorneys(
    jurisdiction: string,
    _willData: WillData
  ): Promise<ProfessionalProfile[]> {
    const attorneys = await this.searchProfessionals('attorney', {
      jurisdiction,
      specialization: 'estate_law',
    });

    // Sort by rating and availability
    return attorneys
      .sort((a, b) => {
        if (a.availability === 'immediate' && b.availability !== 'immediate')
          return -1;
        if (b.availability === 'immediate' && a.availability !== 'immediate')
          return 1;
        return b.rating - a.rating;
      })
      .slice(0, 5);
  }

  private async findSuitablePlanners(
    _willData: WillData
  ): Promise<ProfessionalProfile[]> {
    return this.searchProfessionals('estate_planner', {
      specialization: 'comprehensive_planning',
    });
  }

  private async findNotaries(
    _location: string,
    preferences: Record<string, any>
  ): Promise<ProfessionalProfile[]> {
    return this.searchProfessionals('notary', {
      language: preferences.language as string,
    });
  }

  private assessWillComplexity(willData: WillData): {
    estimatedHours: number;
    keyIssues: string[];
    level: 'complex' | 'moderate' | 'simple';
  } {
    let complexityScore = 0;
    const keyIssues: string[] = [];

    // Asset complexity - check all asset types
    let assetCount = 0;
    if (willData.assets.realEstate)
      assetCount += willData.assets.realEstate.length;
    if (willData.assets.vehicles) assetCount += willData.assets.vehicles.length;
    if (willData.assets.bankAccounts)
      assetCount += willData.assets.bankAccounts.length;
    if (willData.assets.investments)
      assetCount += willData.assets.investments.length;
    if (willData.assets.personalProperty)
      assetCount += willData.assets.personalProperty.length;

    if (assetCount > 5) {
      complexityScore += 2;
      keyIssues.push('Multiple asset types requiring individual handling');
    }

    // Beneficiary complexity
    if (willData.beneficiaries.length > 3) {
      complexityScore += 1;
      keyIssues.push(
        'Multiple beneficiaries with different inheritance shares'
      );
    }

    // Special provisions
    if (willData.specialProvisions && willData.specialProvisions.length > 0) {
      complexityScore += 2;
      keyIssues.push('Custom provisions requiring legal review');
    }

    // Guardian appointments
    if (willData.guardianship) {
      complexityScore += 1;
      keyIssues.push('Guardianship arrangements for minors');
    }

    let level: 'complex' | 'moderate' | 'simple';
    let estimatedHours: number;

    if (complexityScore <= 2) {
      level = 'simple';
      estimatedHours = 2;
    } else if (complexityScore <= 4) {
      level = 'moderate';
      estimatedHours = 4;
    } else {
      level = 'complex';
      estimatedHours = 8;
    }

    return { level, estimatedHours, keyIssues };
  }

  private generateRecommendedServices(
    willData: WillData,
    complexity: Record<string, any>
  ) {
    const services = [
      {
        service: 'Will Review and Optimization',
        description:
          'Comprehensive review of will structure and legal compliance',
        estimatedCost: (complexity.estimatedHours as number) * 150,
        priority: 'essential',
      },
    ];

    if (
      willData.assets.personalProperty?.some(
        asset => asset.category === 'business'
      )
    ) {
      services.push({
        service: 'Business Succession Planning',
        description: 'Specialized planning for business assets and succession',
        estimatedCost: 800,
        priority: 'recommended',
      });
    }

    // Check for high-value assets across all categories
    const hasHighValueAssets = [
      ...(willData.assets.realEstate || []),
      ...(willData.assets.vehicles || []),
      ...(willData.assets.bankAccounts || []),
      ...(willData.assets.investments || []),
      ...(willData.assets.personalProperty || []),
    ].some(asset => (asset.value || 0) > 100000);

    if (hasHighValueAssets) {
      services.push({
        service: 'Tax Optimization Strategy',
        description: 'Minimize estate taxes and optimize inheritance structure',
        estimatedCost: 600,
        priority: 'recommended',
      });
    }

    return services;
  }

  private async getBrnoAdvokatiIntegration(): Promise<ProfessionalProfile[]> {
    // Integration with brnoadvokati.cz
    return [
      {
        id: 'brno-law-001',
        name: 'JUDr. Pavel Novák',
        type: 'attorney',
        title: 'Partner',
        firm: 'Brno Legal Partners',
        jurisdiction: ['Czech Republic', 'Slovakia'],
        languages: ['Czech', 'Slovak', 'English'],
        specializations: ['estate_law', 'inheritance_law', 'family_law'],
        rating: 4.8,
        reviewCount: 127,
        hourlyRate: 180,
        availability: 'within_24h',
        bio: 'Experienced estate planning attorney with 15+ years specializing in Czech and Slovak inheritance law.',
        credentials: ['Czech Bar Association', 'Certified Estate Planner'],
        location: {
          city: 'Brno',
          country: 'Czech Republic',
          address: 'Veveří 111, 602 00 Brno',
        },
        contactInfo: {
          email: 'novak@brnoadvokati.cz',
          phone: '+420 123 456 789',
          website: 'https://brnoadvokati.cz',
        },
      },
      {
        id: 'brno-notary-001',
        name: 'JUDr. Marie Svobodová',
        type: 'notary',
        title: 'Public Notary',
        firm: 'Notary Office Brno Center',
        jurisdiction: ['Czech Republic'],
        languages: ['Czech', 'English', 'German'],
        specializations: [
          'will_certification',
          'inheritance_proceedings',
          'property_transfers',
        ],
        rating: 4.9,
        reviewCount: 89,
        hourlyRate: 120,
        availability: 'within_week',
        bio: 'Certified public notary providing comprehensive inheritance and will services.',
        credentials: ['Czech Notary Chamber', 'Certified Public Notary'],
        location: {
          city: 'Brno',
          country: 'Czech Republic',
          address: 'Masarykova 456, 602 00 Brno',
        },
        contactInfo: {
          email: 'svobodova@notarbno.cz',
          phone: '+420 987 654 321',
        },
      },
    ];
  }

  private generateAvailableSlots(professional: ProfessionalProfile) {
    const slots = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends

      slots.push({
        date,
        time: '09:00',
        duration: 60,
        type: 'in_person' as const,
        location: professional.location.address || undefined,
      });

      slots.push({
        date,
        time: '14:00',
        duration: 60,
        type: 'video_call' as const,
      });
    }

    return slots.slice(0, 8); // Return next 8 available slots
  }

  private getNotaryServices(
    professional: ProfessionalProfile,
    _serviceType?: string
  ) {
    const baseServices = [
      { service: 'Will Witnessing', price: 80, duration: 30 },
      { service: 'Document Certification', price: 50, duration: 15 },
      { service: 'Full Notarization', price: 150, duration: 60 },
    ];

    if (professional.location.country === 'Czech Republic') {
      baseServices.push({
        service: 'Inheritance Proceedings',
        price: 300,
        duration: 120,
      });
    }

    return baseServices;
  }

  private async processReview(
    reviewRequest: ReviewRequest
  ): Promise<ReviewFeedback> {
    // Simulate comprehensive will review
    const issues = this.identifyPotentialIssues(
      reviewRequest.willData,
      reviewRequest.jurisdiction
    );

    return {
      overall: {
        legalCompliance:
          issues.length === 0 ? 95 : Math.max(60, 95 - issues.length * 10),
        clarity: 88,
        completeness: 92,
        recommendations: 85,
      },
      specificIssues: issues,
      summary:
        issues.length === 0
          ? 'Your will appears to be legally sound and well-structured. Minor improvements suggested for clarity.'
          : `${issues.length} issues identified that should be addressed to ensure legal compliance and clarity.`,
      nextSteps:
        issues.length === 0
          ? [
              'Consider adding more specific asset descriptions',
              'Review beneficiary contact information',
            ]
          : [
              'Address critical legal compliance issues',
              'Revise unclear provisions',
              'Consider additional legal consultation',
            ],
      requiresRevision: issues.some(
        issue => issue.severity === 'high' || issue.severity === 'critical'
      ),
    };
  }

  private identifyPotentialIssues(willData: WillData, _jurisdiction: string) {
    const issues: Array<{
      category: string;
      description: string;
      estimated_fix_time: string;
      recommendation: string;
      severity: 'critical' | 'high' | 'low' | 'medium';
    }> = [];

    // Check for missing executor
    if (!willData.executor_data.primaryExecutor) {
      issues.push({
        category: 'Legal Compliance',
        severity: 'high' as const,
        description: 'No executor appointed',
        recommendation:
          'Appoint a trusted person as executor to handle estate administration',
        estimated_fix_time: '5 minutes',
      });
    }

    // Check for vague asset descriptions
    if (willData.assets && willData.assets.realEstate) {
      const vagueAssets = willData.assets.realEstate.filter(
        asset => asset.description.length < 20
      );
      if (vagueAssets.length > 0) {
        issues.push({
          category: 'Clarity',
          severity: 'medium' as const,
          description: `${vagueAssets.length} assets have insufficient descriptions`,
          recommendation:
            'Provide more detailed descriptions including serial numbers, addresses, or account numbers where applicable',
          estimated_fix_time: '15 minutes',
        });
      }
    }

    // Check for beneficiary share issues
    const totalShares = willData.beneficiaries.reduce(
      (sum, b) => sum + b.percentage,
      0
    );
    if (Math.abs(totalShares - 100) > 0.01) {
      issues.push({
        category: 'Legal Compliance',
        severity: 'critical',
        description: `Beneficiary shares total ${totalShares}% instead of 100%`,
        recommendation: 'Adjust beneficiary shares to total exactly 100%',
        estimated_fix_time: '10 minutes',
      });
    }

    return issues;
  }

  private calculateEstimatedCompletion(priority: ReviewPriority): Date {
    const now = new Date();
    switch (priority) {
      case 'express':
        now.setHours(now.getHours() + 24);
        break;
      case 'urgent':
        now.setDate(now.getDate() + 3);
        break;
      case 'standard':
        now.setDate(now.getDate() + 7);
        break;
    }
    return now;
  }

  private calculateTimeline(complexity: string): string {
    switch (complexity) {
      case 'simple':
        return '3-5 business days';
      case 'moderate':
        return '1-2 weeks';
      case 'complex':
        return '2-4 weeks';
      default:
        return '1-2 weeks';
    }
  }

  private calculateDistance(_location1: string, _location2: string): number {
    // Simplified distance calculation - in real implementation would use geolocation APIs
    return Math.random() * 50; // Random distance in km for demonstration
  }

  private async getAllProfessionals(): Promise<ProfessionalProfile[]> {
    // In real implementation, this would fetch from database/API
    // For now, return mock data
    return [];
  }

  private generateId(): string {
    return 'req_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const professionalNetwork = new ProfessionalReviewNetwork(
  process.env.VITE_PROFESSIONAL_NETWORK_API_KEY || 'demo_key'
);
