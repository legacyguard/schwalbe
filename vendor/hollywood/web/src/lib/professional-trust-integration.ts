
import type {
  ProfessionalReview,
  TrustSealLevel,
} from '@/components/trust/EnhancedTrustSeal';
import type {
  ReviewFeedback,
  ReviewRequest,
} from '@/lib/professional-review-network';
import type { WillData } from '@/types/will';

export interface TrustSealUpgrade {
  additionalBenefits: string[];
  certificateUrl?: string;
  originalLevel: TrustSealLevel;
  professionalReview: ProfessionalReview;
  upgradeDate: Date;
  upgradedLevel: TrustSealLevel;
  upgradeReason: string;
}

export class ProfessionalTrustIntegration {
  /**
   * Determines trust seal level based on professional reviews
   */
  static determineTrustSealLevel(
    professionalReviews: ProfessionalReview[],
    validationScore: number
  ): TrustSealLevel {
    if (professionalReviews.length === 0) {
      return validationScore >= 95 ? 'verified' : 'basic';
    }

    const hasAttorneyReview = professionalReviews.some(
      r => r.reviewType === 'attorney_review' && r.verified
    );
    const hasNotaryReview = professionalReviews.some(
      r => r.reviewType === 'notary_certification' && r.verified
    );
    const hasComprehensiveAudit = professionalReviews.some(
      r => r.reviewType === 'comprehensive_audit' && r.verified
    );

    const averageScore =
      professionalReviews.reduce((sum, r) => sum + r.complianceScore, 0) /
      professionalReviews.length;
    const highQualityReviews = professionalReviews.filter(
      r => r.complianceScore >= 90 && r.verified
    ).length;

    // Premium Level: Multiple professional reviews with high scores
    if (
      hasAttorneyReview &&
      hasNotaryReview &&
      averageScore >= 95 &&
      highQualityReviews >= 2
    ) {
      return 'premium';
    }

    // Professional Level: Attorney or comprehensive audit with good score
    if ((hasAttorneyReview || hasComprehensiveAudit) && averageScore >= 85) {
      return 'professional';
    }

    // Verified Level: Any verified professional review
    if (professionalReviews.some(r => r.verified && r.complianceScore >= 75)) {
      return 'verified';
    }

    return 'basic';
  }

  /**
   * Creates professional review record from review feedback
   */
  static createProfessionalReview(
    reviewRequest: ReviewRequest,
    reviewFeedback: ReviewFeedback,
    professionalInfo: {
      firmName: string;
      licenseNumber?: string;
      name: string;
      title: string;
    }
  ): ProfessionalReview {
    const reviewType =
      reviewRequest.type === 'attorney'
        ? 'attorney_review'
        : reviewRequest.type === 'notary'
          ? 'notary_certification'
          : 'comprehensive_audit';

    const complianceScore = Math.round(
      (reviewFeedback.overall.legalCompliance +
        reviewFeedback.overall.completeness +
        reviewFeedback.overall.recommendations) /
        3
    );

    return {
      id: `review_${reviewRequest.id}`,
      professionalName: professionalInfo.name,
      professionalTitle: professionalInfo.title,
      firmName: professionalInfo.firmName,
      reviewDate: new Date(),
      jurisdiction: reviewRequest.jurisdiction,
      licenseNumber: professionalInfo.licenseNumber,
      reviewType,
      complianceScore,
      verified: !reviewFeedback.requiresRevision && complianceScore >= 75,
      certificateUrl:
        complianceScore >= 85
          ? this.generateCertificateUrl(reviewRequest.id)
          : undefined,
    };
  }

  /**
   * Processes trust seal upgrade after professional review
   */
  static async processReviewUpgrade(
    reviewRequest: ReviewRequest,
    reviewFeedback: ReviewFeedback,
    currentTrustLevel: TrustSealLevel,
    professionalReviews: ProfessionalReview[] = []
  ): Promise<null | TrustSealUpgrade> {
    // Don't upgrade if review requires revision
    if (reviewFeedback.requiresRevision) {
      return null;
    }

    const professionalInfo = await this.getProfessionalInfo(
      reviewRequest.professionalId || ''
    );
    if (!professionalInfo) {
      return null;
    }

    // Create new professional review record
    const newReview = this.createProfessionalReview(
      reviewRequest,
      reviewFeedback,
      professionalInfo
    );

    // Calculate new trust seal level with the new review
    const allReviews = [...professionalReviews, newReview];
    const newLevel = this.determineTrustSealLevel(
      allReviews,
      reviewFeedback.overall.legalCompliance
    );

    // Only create upgrade if level actually increases
    if (
      this.getTrustLevelRank(newLevel) <=
      this.getTrustLevelRank(currentTrustLevel)
    ) {
      return null;
    }

    const upgradeReason = this.getUpgradeReason(
      currentTrustLevel,
      newLevel,
      newReview
    );
    const additionalBenefits = this.getUpgradeBenefits(newLevel);

    return {
      originalLevel: currentTrustLevel,
      upgradedLevel: newLevel,
      professionalReview: newReview,
      upgradeDate: new Date(),
      certificateUrl: newReview.certificateUrl,
      upgradeReason,
      additionalBenefits,
    };
  }

  /**
   * Gets professional information (mock implementation)
   */
  private static async getProfessionalInfo(
    professionalId: string
  ): Promise<null | {
    firmName: string;
    licenseNumber?: string;
    name: string;
    title: string;
  }> {
    // Mock implementation - in real app, would fetch from professional network
    const mockProfessionals: Record<
      string,
      {
        firmName: string;
        licenseNumber: string;
        name: string;
        title: string;
      }
    > = {
      'brno-law-001': {
        name: 'JUDr. Pavel Novák',
        title: 'Partner Attorney',
        firmName: 'Brno Legal Partners',
        licenseNumber: 'CZ-BAR-12345',
      },
      'brno-notary-001': {
        name: 'JUDr. Marie Svobodová',
        title: 'Public Notary',
        firmName: 'Notary Office Brno Center',
        licenseNumber: 'CZ-NOT-67890',
      },
    };

    return (
      mockProfessionals[professionalId] || {
        name: 'Professional Legal Review',
        title: 'Qualified Legal Professional',
        firmName: 'Legal Review Network',
        licenseNumber: undefined,
      }
    );
  }

  /**
   * Generates certificate URL for high-quality reviews
   */
  private static generateCertificateUrl(reviewId: string): string {
    return `https://legacyguard.com/certificates/review/${reviewId}`;
  }

  /**
   * Gets numerical rank of trust levels for comparison
   */
  private static getTrustLevelRank(level: TrustSealLevel): number {
    const ranks = {
      basic: 1,
      verified: 2,
      professional: 3,
      premium: 4,
    };
    return ranks[level] || 1;
  }

  /**
   * Gets reason for trust seal upgrade
   */
  private static getUpgradeReason(
    _fromLevel: TrustSealLevel,
    toLevel: TrustSealLevel,
    review: ProfessionalReview
  ): string {
    switch (toLevel) {
      case 'premium':
        return `Multiple professional reviews with ${review.complianceScore}% compliance score achieved premium certification status.`;
      case 'professional':
        return `Professional legal review by ${review.professionalTitle} ${review.professionalName} achieved ${review.complianceScore}% compliance.`;
      case 'verified':
        return `Professional verification completed with ${review.complianceScore}% compliance score.`;
      default:
        return 'Professional review completed successfully.';
    }
  }

  /**
   * Gets additional benefits for each trust level
   */
  private static getUpgradeBenefits(level: TrustSealLevel): string[] {
    switch (level) {
      case 'premium':
        return [
          'Highest level of legal assurance',
          'Multiple professional verifications',
          'Premium certificate with enhanced credibility',
          'Priority support for legal updates',
          'Comprehensive audit trail',
          'Enhanced document authenticity',
        ];
      case 'professional':
        return [
          'Professional legal validation',
          'Attorney-reviewed and approved',
          'Professional certificate included',
          'Enhanced legal compliance',
          'Professional network verification',
        ];
      case 'verified':
        return [
          'Professional verification completed',
          'Enhanced legal compliance',
          'Verified by qualified professional',
          'Improved document credibility',
        ];
      default:
        return ['Basic legal template compliance'];
    }
  }

  /**
   * Generates enhanced trust seal with professional reviews
   */
  static generateEnhancedTrustSeal(
    willData: WillData,
    professionalReviews: ProfessionalReview[],
    validationScore: number = 0
  ) {
    const jurisdiction = willData.legal_data?.jurisdiction || 'Slovakia';
    const level = this.determineTrustSealLevel(
      professionalReviews,
      validationScore
    );
    const lastUpdated =
      professionalReviews.length > 0
        ? new Date(
            Math.max(...professionalReviews.map(r => r.reviewDate.getTime()))
          )
        : new Date();

    return {
      level,
      jurisdiction,
      lastUpdated,
      professionalReviews,
      validationScore,
    };
  }

  /**
   * Creates upgrade notification message
   */
  static createUpgradeNotification(upgrade: TrustSealUpgrade): {
    message: string;
    title: string;
    type: 'info' | 'success';
  } {
    return {
      title: `Trust Seal Upgraded to ${upgrade.upgradedLevel.charAt(0).toUpperCase() + upgrade.upgradedLevel.slice(1)}!`,
      message: `Your will has been upgraded from ${upgrade.originalLevel} to ${upgrade.upgradedLevel} level following professional review by ${upgrade.professionalReview.professionalName}. ${upgrade.upgradeReason}`,
      type: 'success',
    };
  }
}

// Export singleton instance
export const professionalTrustIntegration = ProfessionalTrustIntegration;
