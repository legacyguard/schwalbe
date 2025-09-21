
/**
 * Trust Score Calculation System
 * Calculates family protection score based on user actions and document security
 */

export interface TrustScoreFactors {
  accountAge: number; // days
  documentsShared: number;
  documentsUploaded: number;
  emergencyContactsAdded: number;
  encryptionEnabled: boolean;
  familyMembersInvited: number;
  guardiansAssigned: number;
  lastActivityDays: number;
  legalCompliance: number; // 0-100 based on professional reviews
  professionalReviews: number;
  twoFactorAuth: boolean;
  willCompleted: boolean;
}

export interface TrustScoreBreakdown {
  factors: {
    [key: string]: {
      description: string;
      maxScore: number;
      score: number;
      suggestions?: string[];
    };
  };
  maxPossibleScore: number;
  nextMilestone: null | {
    description: string;
    score: number;
    suggestions: string[];
  };
  percentage: number;
  riskAreas: {
    area: string;
    description: string;
    improvements: string[];
    risk: 'high' | 'low' | 'medium';
  }[];
  totalScore: number;
}

export class TrustScoreCalculator {
  private static readonly MAX_SCORE = 100;

  // Scoring weights for different factors
  private static readonly WEIGHTS = {
    documents: 25, // 25 points max - core document security
    professional: 25, // 25 points max - professional validation
    emergency: 15, // 15 points max - emergency preparedness
    family: 15, // 15 points max - family collaboration
    security: 10, // 10 points max - account security
    engagement: 10, // 10 points max - ongoing engagement
  };

  /**
   * Calculate complete trust score with breakdown
   */
  static calculateTrustScore(factors: TrustScoreFactors): TrustScoreBreakdown {
    const documentScore = this.calculateDocumentScore(factors);
    const professionalScore = this.calculateProfessionalScore(factors);
    const emergencyScore = this.calculateEmergencyScore(factors);
    const familyScore = this.calculateFamilyScore(factors);
    const securityScore = this.calculateSecurityScore(factors);
    const engagementScore = this.calculateEngagementScore(factors);

    const totalScore = Math.min(
      documentScore.score +
        professionalScore.score +
        emergencyScore.score +
        familyScore.score +
        securityScore.score +
        engagementScore.score,
      this.MAX_SCORE
    );

    const breakdown: TrustScoreBreakdown = {
      totalScore,
      maxPossibleScore: this.MAX_SCORE,
      percentage: (totalScore / this.MAX_SCORE) * 100,
      factors: {
        documents: documentScore,
        professional: professionalScore,
        emergency: emergencyScore,
        family: familyScore,
        security: securityScore,
        engagement: engagementScore,
      },
      nextMilestone: this.calculateNextMilestone(totalScore, factors),
      riskAreas: this.identifyRiskAreas(factors),
    };

    return breakdown;
  }

  /**
   * Calculate document security score (0-25 points)
   */
  private static calculateDocumentScore(factors: TrustScoreFactors) {
    const maxScore = this.WEIGHTS.documents;
    let score = 0;
    const suggestions: string[] = [];

    // Basic document upload (0-15 points)
    if (factors.documentsUploaded === 0) {
      suggestions.push(
        'Upload your first document to start protecting your family'
      );
    } else if (factors.documentsUploaded < 3) {
      score += Math.min(factors.documentsUploaded * 3, 9);
      suggestions.push('Upload more essential documents (ID, insurance, etc.)');
    } else if (factors.documentsUploaded < 10) {
      score += Math.min(9 + (factors.documentsUploaded - 3) * 1, 15);
      suggestions.push('Add remaining important documents');
    } else {
      score += 15;
    }

    // Will completion bonus (5 points)
    if (factors.willCompleted) {
      score += 5;
    } else {
      suggestions.push('Complete your will using our guided wizard');
    }

    // Encryption bonus (5 points)
    if (factors.encryptionEnabled) {
      score += 5;
    } else {
      suggestions.push('Enable document encryption for maximum security');
    }

    return {
      score: Math.min(score, maxScore),
      maxScore,
      description: 'Document security and organization',
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Calculate professional validation score (0-25 points)
   */
  private static calculateProfessionalScore(factors: TrustScoreFactors) {
    const maxScore = this.WEIGHTS.professional;
    let score = 0;
    const suggestions: string[] = [];

    // Professional reviews (0-20 points)
    if (factors.professionalReviews === 0) {
      suggestions.push('Get professional review of your key documents');
    } else {
      score += Math.min(factors.professionalReviews * 10, 20);
      if (factors.professionalReviews === 1) {
        suggestions.push('Consider additional reviews for complex documents');
      }
    }

    // Legal compliance bonus (0-5 points)
    if (factors.legalCompliance > 0) {
      score += Math.min(factors.legalCompliance * 0.05, 5);
    } else {
      suggestions.push('Ensure your documents meet legal requirements');
    }

    return {
      score: Math.min(score, maxScore),
      maxScore,
      description: 'Professional validation and legal compliance',
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Calculate emergency preparedness score (0-15 points)
   */
  private static calculateEmergencyScore(factors: TrustScoreFactors) {
    const maxScore = this.WEIGHTS.emergency;
    let score = 0;
    const suggestions: string[] = [];

    // Emergency contacts (0-8 points)
    if (factors.emergencyContactsAdded === 0) {
      suggestions.push(
        'Add emergency contacts who can access your information'
      );
    } else {
      score += Math.min(factors.emergencyContactsAdded * 4, 8);
      if (factors.emergencyContactsAdded < 3) {
        suggestions.push('Add more emergency contacts for redundancy');
      }
    }

    // Guardians for minors (0-7 points)
    if (factors.guardiansAssigned === 0) {
      suggestions.push('Assign guardians if you have minor children');
    } else {
      score += Math.min(factors.guardiansAssigned * 3.5, 7);
    }

    return {
      score: Math.min(score, maxScore),
      maxScore,
      description: 'Emergency access and guardian assignments',
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Calculate family collaboration score (0-15 points)
   */
  private static calculateFamilyScore(factors: TrustScoreFactors) {
    const maxScore = this.WEIGHTS.family;
    let score = 0;
    const suggestions: string[] = [];

    // Family members invited (0-10 points)
    if (factors.familyMembersInvited === 0) {
      suggestions.push(
        'Invite family members to collaborate on protection planning'
      );
    } else {
      score += Math.min(factors.familyMembersInvited * 3, 10);
      if (factors.familyMembersInvited < 3) {
        suggestions.push('Invite more family members for better coordination');
      }
    }

    // Document sharing (0-5 points)
    if (factors.documentsShared === 0) {
      suggestions.push('Share important documents with trusted family members');
    } else {
      score += Math.min(factors.documentsShared * 1, 5);
    }

    return {
      score: Math.min(score, maxScore),
      maxScore,
      description: 'Family collaboration and communication',
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Calculate account security score (0-10 points)
   */
  private static calculateSecurityScore(factors: TrustScoreFactors) {
    const maxScore = this.WEIGHTS.security;
    let score = 5; // Base score for having an account
    const suggestions: string[] = [];

    // Two-factor authentication (5 points)
    if (factors.twoFactorAuth) {
      score += 5;
    } else {
      suggestions.push(
        'Enable two-factor authentication for enhanced security'
      );
    }

    return {
      score: Math.min(score, maxScore),
      maxScore,
      description: 'Account security and authentication',
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Calculate ongoing engagement score (0-10 points)
   */
  private static calculateEngagementScore(factors: TrustScoreFactors) {
    const maxScore = this.WEIGHTS.engagement;
    let score = 0;
    const suggestions: string[] = [];

    // Recent activity bonus (0-5 points)
    if (factors.lastActivityDays <= 7) {
      score += 5;
    } else if (factors.lastActivityDays <= 30) {
      score += 3;
      suggestions.push('Regular updates help maintain family protection');
    } else {
      score += 1;
      suggestions.push('Stay engaged to keep your family protection current');
    }

    // Account maturity bonus (0-5 points)
    if (factors.accountAge >= 90) {
      score += 5;
    } else if (factors.accountAge >= 30) {
      score += 3;
    } else {
      score += 1;
    }

    return {
      score: Math.min(score, maxScore),
      maxScore,
      description: 'Ongoing engagement and account maturity',
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };
  }

  /**
   * Calculate next milestone
   */
  private static calculateNextMilestone(
    currentScore: number,
    factors: TrustScoreFactors
  ) {
    const milestones = [
      { score: 25, description: 'Basic Protection Established', key: 'basic' },
      {
        score: 50,
        description: 'Solid Foundation Complete',
        key: 'foundation',
      },
      { score: 75, description: 'Advanced Protection Active', key: 'advanced' },
      {
        score: 90,
        description: 'Exceptional Family Security',
        key: 'exceptional',
      },
      {
        score: 100,
        description: 'Maximum Protection Achieved',
        key: 'maximum',
      },
    ];

    const nextMilestone = milestones.find(m => m.score > currentScore);
    if (!nextMilestone) return null;

    const suggestions = this.getMilestoneSuggestions(
      nextMilestone.key,
      factors
    );

    return {
      score: nextMilestone.score,
      description: nextMilestone.description,
      suggestions,
    };
  }

  /**
   * Get suggestions for reaching next milestone
   */
  private static getMilestoneSuggestions(
    milestone: string,
    factors: TrustScoreFactors
  ): string[] {
    const suggestions: string[] = [];

    switch (milestone) {
      case 'basic':
        if (factors.documentsUploaded < 3) {
          suggestions.push('Upload 3 essential documents');
        }
        if (factors.emergencyContactsAdded === 0) {
          suggestions.push('Add at least one emergency contact');
        }
        break;

      case 'foundation':
        if (!factors.willCompleted) {
          suggestions.push('Complete your will with our wizard');
        }
        if (factors.professionalReviews === 0) {
          suggestions.push('Get professional review of key documents');
        }
        break;

      case 'advanced':
        if (factors.familyMembersInvited < 2) {
          suggestions.push('Invite family members to collaborate');
        }
        if (!factors.twoFactorAuth) {
          suggestions.push('Enable two-factor authentication');
        }
        break;

      case 'exceptional':
        suggestions.push('Consider additional professional reviews');
        suggestions.push('Review and update emergency procedures');
        break;

      case 'maximum':
        suggestions.push('Maintain regular updates and reviews');
        suggestions.push('Help other families achieve protection');
        break;
    }

    return suggestions;
  }

  /**
   * Identify risk areas that need attention
   */
  private static identifyRiskAreas(factors: TrustScoreFactors) {
    const risks = [];

    // Critical document gaps
    if (factors.documentsUploaded < 3) {
      risks.push({
        area: 'Essential Documents Missing',
        risk: 'high' as const,
        description: 'Your family lacks access to critical information',
        improvements: [
          'Upload ID documents and insurance policies',
          'Add financial account information',
          'Include medical directives',
        ],
      });
    }

    // No professional validation
    if (factors.professionalReviews === 0 && factors.willCompleted) {
      risks.push({
        area: 'Legal Validation Needed',
        risk: 'medium' as const,
        description: 'Documents may not meet legal requirements',
        improvements: [
          'Request professional review of your will',
          'Verify state-specific legal compliance',
          'Consider attorney consultation',
        ],
      });
    }

    // Emergency access issues
    if (factors.emergencyContactsAdded === 0) {
      risks.push({
        area: 'Emergency Access Gap',
        risk: 'high' as const,
        description: 'No one can access your information in emergency',
        improvements: [
          'Add trusted family members as emergency contacts',
          'Test emergency access procedures',
          'Provide clear instructions to contacts',
        ],
      });
    }

    // Security vulnerabilities
    if (!factors.twoFactorAuth) {
      risks.push({
        area: 'Account Security Risk',
        risk: 'medium' as const,
        description: 'Account could be compromised without 2FA',
        improvements: [
          'Enable two-factor authentication',
          'Use strong, unique passwords',
          'Review login activity regularly',
        ],
      });
    }

    // Engagement concerns
    if (factors.lastActivityDays > 90) {
      risks.push({
        area: 'Outdated Information Risk',
        risk: 'low' as const,
        description: 'Information may become stale without regular updates',
        improvements: [
          'Schedule regular review reminders',
          'Update documents when circumstances change',
          'Maintain active family communication',
        ],
      });
    }

    return risks;
  }

  /**
   * Get quick improvement suggestions
   */
  static getQuickImprovements(factors: TrustScoreFactors, limit = 3) {
    const allSuggestions: string[] = [];
    const breakdown = this.calculateTrustScore(factors);

    Object.values(breakdown.factors).forEach(factor => {
      if (factor.suggestions) {
        factor.suggestions.forEach(suggestion => {
          allSuggestions.push(suggestion);
        });
      }
    });

    // Prioritize high-impact improvements
    const prioritized = allSuggestions.filter(
      s =>
        s.includes('professional') ||
        s.includes('emergency') ||
        s.includes('will')
    );

    const others = allSuggestions.filter(s => !prioritized.includes(s));

    return [...prioritized, ...others].slice(0, limit);
  }
}

/**
 * Hook for calculating and tracking trust score
 */
export function calculateUserTrustScore(userStats: any): TrustScoreBreakdown {
  const factors: TrustScoreFactors = {
    documentsUploaded: userStats?.documents?.length || 0,
    professionalReviews: userStats?.professional_reviews?.length || 0,
    emergencyContactsAdded: userStats?.emergency_contacts?.length || 0,
    guardiansAssigned: userStats?.guardians?.length || 0,
    willCompleted: userStats?.will_completed || false,
    encryptionEnabled: userStats?.encryption_enabled ?? true,
    twoFactorAuth: userStats?.two_factor_enabled || false,
    familyMembersInvited: userStats?.family_members?.length || 0,
    documentsShared: userStats?.shared_documents?.length || 0,
    lastActivityDays: userStats?.last_activity_days || 0,
    accountAge: userStats?.account_age_days || 0,
    legalCompliance: userStats?.legal_compliance_score || 0,
  };

  return TrustScoreCalculator.calculateTrustScore(factors);
}
