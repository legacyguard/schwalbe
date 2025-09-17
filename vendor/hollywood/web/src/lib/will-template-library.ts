
// Will Template Library & Comparison System
// Provides curated templates and version comparison functionality

import type { WillData } from '@/components/legacy/WillWizard';

export interface WillTemplate {
  category: TemplateCategory;
  complexity: 'complex' | 'moderate' | 'simple';
  description: string;
  estimatedCompletionTime: number; // in minutes
  id: string;
  jurisdiction: string;
  lastUpdated: Date;
  legalNotices: string[];
  legalReviewDate?: Date;
  name: string;
  optionalEnhancements: string[];
  placeholders: Record<string, string>;
  popularityScore: number;
  preview: {
    assetTypes: string[];
    beneficiaryCount: number;
    keyFeatures: string[];
    summaryText: string;
  };
  requiredFields: string[];
  tags: string[];
  targetProfile: UserProfile;
  templateData: Partial<WillData>;
}

export interface UserProfile {
  ageRange: '18-30' | '31-45' | '46-60' | '61-75' | '75+';
  complexFamilySituation: boolean; // blended families, etc.
  estimatedNetWorth: 'high' | 'low' | 'medium' | 'very_high';
  hasBusinessInterests: boolean;
  hasChildren: boolean;
  hasInternationalAssets: boolean;
  hasMinorChildren: boolean;
  maritalStatus: 'divorced' | 'married' | 'single' | 'unknown' | 'widowed';
  specialConsiderations: string[]; // disabilities, pets, charities, etc.
}

export type TemplateCategory =
  | 'blended_family'
  | 'business_owner'
  | 'charitable_focused'
  | 'childless_couple'
  | 'established_family'
  | 'international'
  | 'new_parent'
  | 'retiree'
  | 'single_parent'
  | 'special_needs'
  | 'young_professional';

export interface ComparisonReport {
  changes: ChangeSet[];
  comparedAt: Date;
  id: string;
  impactAnalysis: ImpactAnalysis;
  newVersion: WillVersionSnapshot;
  oldVersion: WillVersionSnapshot;
  recommendations: string[];
  requiresLegalReview: boolean;
}

export interface WillVersionSnapshot {
  createdAt: Date;
  data: WillData;
  id: string;
  metadata: {
    completionPercentage: number;
    jurisdiction: string;
    templateUsed?: string;
    totalAssetCategories: number;
    totalBeneficiaries: number;
  };
  version: string;
}

export interface ChangeSet {
  changeType: 'added' | 'modified' | 'removed';
  description: string;
  field: string;
  impact: 'critical' | 'high' | 'low' | 'medium';
  legalImplications?: string;
  newValue?: any;
  oldValue?: any;
  section: keyof WillData;
}

export interface ImpactAnalysis {
  affectedBeneficiaries: string[];
  changedInheritanceAmounts: Array<{
    beneficiary: string;
    difference: number;
    newPercentage: number;
    oldPercentage: number;
  }>;
  newLegalRequirements: string[];
  overallImpact: 'major' | 'minimal' | 'moderate' | 'significant';
  potentialConflicts: string[];
}

export interface Modification {
  description: string;
  estimatedImplementationTime: number; // minutes
  id: string;
  priority: 'high' | 'low' | 'medium';
  rationale: string;
  templateId: string;
  type:
    | 'asset_addition'
    | 'beneficiary_adjustment'
    | 'custom_clause'
    | 'field_change';
}

// Curated will templates
const WILL_TEMPLATES: WillTemplate[] = [
  {
    id: 'young_professional_simple',
    name: 'Young Professional - Simple Will',
    description:
      'Perfect for young professionals with modest assets and straightforward wishes',
    category: 'young_professional',
    jurisdiction: 'Slovakia',
    targetProfile: {
      maritalStatus: 'unknown',
      hasChildren: false,
      hasMinorChildren: false,
      ageRange: '18-30',
      estimatedNetWorth: 'low',
      hasBusinessInterests: false,
      hasInternationalAssets: false,
      complexFamilySituation: false,
      specialConsiderations: [],
    },
    complexity: 'simple',
    estimatedCompletionTime: 15,
    popularityScore: 8.5,
    lastUpdated: new Date('2024-01-15'),
    legalReviewDate: new Date('2024-01-10'),
    tags: ['simple', 'young', 'basic', 'quick'],
    templateData: {
      testator_data: {
        maritalStatus: 'single',
      },
      beneficiaries: [
        {
          id: 'template_primary',
          name: '[PRIMARY_BENEFICIARY]',
          relationship: 'parent',
          percentage: 100,
          conditions: '',
        },
      ],
      executor_data: {
        primaryExecutor: {
          name: '[EXECUTOR_NAME]',
          relationship: 'parent',
        },
      },
      special_instructions: {
        organDonation: true,
      },
      legal_data: {
        jurisdiction: 'Slovakia',
      },
    },
    placeholders: {
      '[PRIMARY_BENEFICIARY]': 'Name of main beneficiary (often parents)',
      '[EXECUTOR_NAME]': 'Person who will handle your estate',
    },
    requiredFields: [
      'testator_data.fullName',
      'testator_data.address',
      'beneficiaries',
    ],
    optionalEnhancements: ['funeral_wishes', 'digital_assets', 'pet_care'],
    legalNotices: [
      'Consider updating when life circumstances change',
      'Ensure executor is willing and capable',
      'Review beneficiary choices regularly',
    ],
    preview: {
      summaryText:
        'Leaves everything to one primary beneficiary with simple execution',
      keyFeatures: [
        'Single beneficiary',
        'Simple execution',
        'Organ donation included',
      ],
      beneficiaryCount: 1,
      assetTypes: ['general_estate'],
    },
  },
  {
    id: 'new_parent_comprehensive',
    name: 'New Parent - Comprehensive Protection',
    description:
      'Comprehensive will for new parents focusing on child protection and guardianship',
    category: 'new_parent',
    jurisdiction: 'Slovakia',
    targetProfile: {
      maritalStatus: 'married',
      hasChildren: true,
      hasMinorChildren: true,
      ageRange: '31-45',
      estimatedNetWorth: 'medium',
      hasBusinessInterests: false,
      hasInternationalAssets: false,
      complexFamilySituation: false,
      specialConsiderations: ['guardianship', 'education_fund'],
    },
    complexity: 'moderate',
    estimatedCompletionTime: 30,
    popularityScore: 9.2,
    lastUpdated: new Date('2024-01-20'),
    legalReviewDate: new Date('2024-01-18'),
    tags: ['family', 'children', 'guardianship', 'comprehensive'],
    templateData: {
      testator_data: {
        maritalStatus: 'married',
      },
      beneficiaries: [
        {
          id: 'template_spouse',
          name: '[SPOUSE_NAME]',
          relationship: 'spouse',
          percentage: 60,
          conditions: 'if surviving',
        },
        {
          id: 'template_children',
          name: '[CHILDREN_NAMES]',
          relationship: 'child',
          percentage: 40,
          conditions: 'to be divided equally among all children',
        },
      ],
      executor_data: {
        primaryExecutor: {
          name: '[SPOUSE_NAME]',
          relationship: 'spouse',
        },
        backupExecutor: {
          name: '[BACKUP_EXECUTOR]',
          relationship: 'sibling',
        },
      },
      guardianship_data: {
        primaryGuardian: {
          name: '[PRIMARY_GUARDIAN]',
          relationship: 'sibling',
        },
        backupGuardian: {
          name: '[BACKUP_GUARDIAN]',
          relationship: 'parent',
        },
        guardianInstructions:
          "Prioritize children's education and emotional well-being",
      },
      special_instructions: {
        organDonation: false,
        digitalAssets:
          'Grant access to spouse for managing digital accounts and photos',
      },
      legal_data: {
        jurisdiction: 'Slovakia',
      },
    },
    placeholders: {
      '[SPOUSE_NAME]': "Your spouse's full name",
      '[CHILDREN_NAMES]': "Your children's names",
      '[BACKUP_EXECUTOR]': 'Trusted person if spouse cannot serve',
      '[PRIMARY_GUARDIAN]': 'Who will raise your children',
      '[BACKUP_GUARDIAN]': 'Alternative guardian',
    },
    requiredFields: [
      'testator_data.fullName',
      'testator_data.address',
      'beneficiaries',
      'guardianship_data.primaryGuardian',
    ],
    optionalEnhancements: [
      'education_fund',
      'trust_provisions',
      'insurance_instructions',
    ],
    legalNotices: [
      'Guardian must consent to appointment',
      'Consider establishing education trust',
      'Review insurance beneficiaries',
      'Update when more children are born',
    ],
    preview: {
      summaryText:
        'Protects spouse and children with comprehensive guardianship provisions',
      keyFeatures: [
        'Spouse priority',
        'Child guardianship',
        'Education focus',
        'Backup plans',
      ],
      beneficiaryCount: 2,
      assetTypes: ['general_estate', 'guardianship'],
    },
  },
  {
    id: 'blended_family_balanced',
    name: 'Blended Family - Balanced Approach',
    description:
      'Carefully balanced will for blended families with children from multiple relationships',
    category: 'blended_family',
    jurisdiction: 'Slovakia',
    targetProfile: {
      maritalStatus: 'married',
      hasChildren: true,
      hasMinorChildren: true,
      ageRange: '46-60',
      estimatedNetWorth: 'medium',
      hasBusinessInterests: false,
      hasInternationalAssets: false,
      complexFamilySituation: true,
      specialConsiderations: [
        'blended_family',
        'step_children',
        'ex_spouse_considerations',
      ],
    },
    complexity: 'complex',
    estimatedCompletionTime: 45,
    popularityScore: 7.8,
    lastUpdated: new Date('2024-01-25'),
    legalReviewDate: new Date('2024-01-22'),
    tags: ['blended', 'complex', 'balanced', 'multiple_relationships'],
    templateData: {
      testator_data: {
        maritalStatus: 'married',
      },
      beneficiaries: [
        {
          id: 'template_spouse',
          name: '[CURRENT_SPOUSE]',
          relationship: 'spouse',
          percentage: 40,
          conditions: 'for lifetime use',
        },
        {
          id: 'template_bio_children',
          name: '[BIOLOGICAL_CHILDREN]',
          relationship: 'child',
          percentage: 35,
          conditions: 'biological children from previous marriage',
        },
        {
          id: 'template_step_children',
          name: '[STEP_CHILDREN]',
          relationship: 'child',
          percentage: 25,
          conditions: 'step-children from current marriage',
        },
      ],
      executor_data: {
        primaryExecutor: {
          name: '[NEUTRAL_EXECUTOR]',
          relationship: 'friend',
        },
      },
      guardianship_data: {
        guardianInstructions:
          'Consider existing custody arrangements and maintain sibling relationships',
      },
      special_instructions: {
        personalMessages: [
          {
            recipient: '[CURRENT_SPOUSE]',
            message: 'Thank you for embracing our blended family',
          },
        ],
      },
      legal_data: {
        jurisdiction: 'Slovakia',
      },
    },
    placeholders: {
      '[CURRENT_SPOUSE]': "Current spouse's name",
      '[BIOLOGICAL_CHILDREN]': 'Your biological children',
      '[STEP_CHILDREN]': 'Your step-children',
      '[NEUTRAL_EXECUTOR]': 'Neutral party to avoid family conflicts',
    },
    requiredFields: [
      'testator_data.fullName',
      'testator_data.address',
      'beneficiaries',
      'executor_data.primaryExecutor',
    ],
    optionalEnhancements: [
      'trust_provisions',
      'conflict_resolution',
      'family_mediation',
    ],
    legalNotices: [
      'Consider family dynamics carefully',
      'May require family discussions',
      'Consider separate trusts for different children',
      'Regular updates recommended as children mature',
    ],
    preview: {
      summaryText:
        'Balances interests of current spouse and children from multiple relationships',
      keyFeatures: [
        'Balanced distribution',
        'Neutral executor',
        'Family harmony focus',
        'Lifetime provisions',
      ],
      beneficiaryCount: 3,
      assetTypes: ['general_estate', 'trust_provisions'],
    },
  },
  {
    id: 'business_owner_comprehensive',
    name: 'Business Owner - Asset Protection',
    description:
      'Comprehensive will for business owners with succession planning and asset protection',
    category: 'business_owner',
    jurisdiction: 'Slovakia',
    targetProfile: {
      maritalStatus: 'married',
      hasChildren: true,
      hasMinorChildren: false,
      ageRange: '46-60',
      estimatedNetWorth: 'high',
      hasBusinessInterests: true,
      hasInternationalAssets: false,
      complexFamilySituation: false,
      specialConsiderations: [
        'business_succession',
        'tax_planning',
        'employee_protection',
      ],
    },
    complexity: 'complex',
    estimatedCompletionTime: 60,
    popularityScore: 8.9,
    lastUpdated: new Date('2024-01-30'),
    legalReviewDate: new Date('2024-01-28'),
    tags: ['business', 'succession', 'complex', 'assets'],
    templateData: {
      testator_data: {
        maritalStatus: 'married',
      },
      beneficiaries: [
        {
          id: 'template_spouse',
          name: '[SPOUSE_NAME]',
          relationship: 'spouse',
          percentage: 45,
          conditions: 'excluding business interests',
        },
        {
          id: 'template_children',
          name: '[CHILDREN_NAMES]',
          relationship: 'child',
          percentage: 45,
          conditions: 'including business succession rights',
        },
        {
          id: 'template_employees',
          name: '[EMPLOYEE_TRUST]',
          relationship: 'other',
          percentage: 10,
          conditions: 'employee benefit trust',
        },
      ],
      executor_data: {
        primaryExecutor: {
          name: '[BUSINESS_ATTORNEY]',
          relationship: 'other',
        },
      },
      special_instructions: {
        digitalAssets:
          'Business continuity plan and digital asset inventory attached',
      },
      legal_data: {
        jurisdiction: 'Slovakia',
      },
    },
    placeholders: {
      '[SPOUSE_NAME]': 'Spouse who may or may not be involved in business',
      '[CHILDREN_NAMES]': 'Children being groomed for business succession',
      '[EMPLOYEE_TRUST]': 'Trust for key employees',
      '[BUSINESS_ATTORNEY]': 'Business attorney or corporate executor',
    },
    requiredFields: [
      'testator_data.fullName',
      'testator_data.address',
      'beneficiaries',
      'executor_data.primaryExecutor',
      'assets.businessInterests',
    ],
    optionalEnhancements: [
      'business_valuation',
      'tax_optimization',
      'employee_succession',
    ],
    legalNotices: [
      'Coordinate with business attorney',
      'Consider tax implications',
      'Update buy-sell agreements',
      'Review regularly as business grows',
    ],
    preview: {
      summaryText:
        'Protects family while ensuring business continuity and employee welfare',
      keyFeatures: [
        'Business succession',
        'Employee protection',
        'Tax planning',
        'Professional execution',
      ],
      beneficiaryCount: 3,
      assetTypes: ['general_estate', 'business_interests', 'employee_benefits'],
    },
  },
  {
    id: 'retiree_legacy_focused',
    name: 'Retiree - Legacy Focused',
    description:
      'Legacy-focused will for retirees with charitable giving and grandchildren provisions',
    category: 'retiree',
    jurisdiction: 'Slovakia',
    targetProfile: {
      maritalStatus: 'widowed',
      hasChildren: true,
      hasMinorChildren: false,
      ageRange: '75+',
      estimatedNetWorth: 'high',
      hasBusinessInterests: false,
      hasInternationalAssets: false,
      complexFamilySituation: false,
      specialConsiderations: [
        'charitable_giving',
        'grandchildren',
        'legacy_planning',
      ],
    },
    complexity: 'moderate',
    estimatedCompletionTime: 40,
    popularityScore: 8.7,
    lastUpdated: new Date('2024-02-01'),
    legalReviewDate: new Date('2024-01-30'),
    tags: ['legacy', 'charity', 'grandchildren', 'retiree'],
    templateData: {
      testator_data: {
        maritalStatus: 'widowed',
      },
      beneficiaries: [
        {
          id: 'template_children',
          name: '[ADULT_CHILDREN]',
          relationship: 'child',
          percentage: 60,
          conditions: 'to be divided equally',
        },
        {
          id: 'template_grandchildren',
          name: '[GRANDCHILDREN]',
          relationship: 'grandchild',
          percentage: 25,
          conditions: 'education trust fund',
        },
        {
          id: 'template_charity',
          name: '[PREFERRED_CHARITY]',
          relationship: 'charity',
          percentage: 15,
          conditions: 'charitable bequest',
        },
      ],
      executor_data: {
        primaryExecutor: {
          name: '[ELDEST_CHILD]',
          relationship: 'child',
        },
      },
      special_instructions: {
        funeralWishes:
          'Simple funeral service, donations to charity in lieu of flowers',
        charitableBequests: [
          {
            charity: '[PREFERRED_CHARITY]',
            amount: 15,
          },
        ],
        personalMessages: [
          {
            recipient: '[GRANDCHILDREN]',
            message: 'Education fund to help achieve your dreams',
          },
        ],
      },
      legal_data: {
        jurisdiction: 'Slovakia',
      },
    },
    placeholders: {
      '[ADULT_CHILDREN]': 'Your adult children',
      '[GRANDCHILDREN]': 'Your grandchildren',
      '[PREFERRED_CHARITY]': 'Charity close to your heart',
      '[ELDEST_CHILD]': 'Most responsible adult child',
    },
    requiredFields: [
      'testator_data.fullName',
      'testator_data.address',
      'beneficiaries',
    ],
    optionalEnhancements: [
      'memorial_service',
      'family_heirlooms',
      'oral_history',
    ],
    legalNotices: [
      'Consider tax implications of charitable giving',
      'Ensure charity is properly registered',
      'Consider education trust structures',
      'Regular updates as grandchildren are born',
    ],
    preview: {
      summaryText:
        'Creates lasting legacy through family support and charitable giving',
      keyFeatures: [
        'Multi-generational',
        'Charitable giving',
        'Education focus',
        'Personal messages',
      ],
      beneficiaryCount: 3,
      assetTypes: ['general_estate', 'education_trust', 'charitable_bequest'],
    },
  },
];

export class WillTemplateLibrary {
  /**
   * Get templates that match user profile
   */
  getTemplatesForSituation(profile: Partial<UserProfile>): WillTemplate[] {
    return WILL_TEMPLATES.filter(template => {
      let matchScore = 0;

      // Marital status match
      if (
        profile.maritalStatus &&
        template.targetProfile.maritalStatus === profile.maritalStatus
      ) {
        matchScore += 3;
      } else if (template.targetProfile.maritalStatus === 'unknown') {
        matchScore += 1;
      }

      // Children match
      if (profile.hasChildren === template.targetProfile.hasChildren) {
        matchScore += 2;
      }

      // Minor children match
      if (
        profile.hasMinorChildren === template.targetProfile.hasMinorChildren
      ) {
        matchScore += 2;
      }

      // Age range match
      if (profile.ageRange === template.targetProfile.ageRange) {
        matchScore += 2;
      }

      // Net worth match
      if (
        profile.estimatedNetWorth === template.targetProfile.estimatedNetWorth
      ) {
        matchScore += 1;
      }

      // Business interests match
      if (
        profile.hasBusinessInterests ===
        template.targetProfile.hasBusinessInterests
      ) {
        matchScore += 2;
      }

      // Complex family situation match
      if (
        profile.complexFamilySituation ===
        template.targetProfile.complexFamilySituation
      ) {
        matchScore += 2;
      }

      // Require at least 50% match
      return matchScore >= 6;
    }).sort((a, b) => {
      // Sort by popularity and recency
      const aScore =
        a.popularityScore + new Date(a.lastUpdated).getTime() / 1000000000;
      const bScore =
        b.popularityScore + new Date(b.lastUpdated).getTime() / 1000000000;
      return bScore - aScore;
    });
  }

  /**
   * Get a specific template by ID
   */
  getTemplate(templateId: string): null | WillTemplate {
    return WILL_TEMPLATES.find(t => t.id === templateId) || null;
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: TemplateCategory): WillTemplate[] {
    return WILL_TEMPLATES.filter(t => t.category === category);
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): WillTemplate[] {
    return [...WILL_TEMPLATES];
  }

  /**
   * Search templates by keywords
   */
  searchTemplates(query: string): WillTemplate[] {
    const queryLower = query.toLowerCase();
    return WILL_TEMPLATES.filter(
      template =>
        template.name.toLowerCase().includes(queryLower) ||
        template.description.toLowerCase().includes(queryLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );
  }

  /**
   * Apply template to will data
   */
  applyTemplate(templateId: string, currentData?: Partial<WillData>): WillData {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Merge template data with current data, preferring current data where available
    const mergedData: WillData = {
      testator_data: {
        ...template.templateData.testator_data,
        ...currentData?.testator_data,
      },
      beneficiaries: currentData?.beneficiaries?.length
        ? currentData.beneficiaries
        : template.templateData.beneficiaries || [],
      assets: {
        ...template.templateData.assets,
        ...currentData?.assets,
      },
      executor_data: {
        ...template.templateData.executor_data,
        ...currentData?.executor_data,
      },
      guardianship_data: {
        ...template.templateData.guardianship_data,
        ...currentData?.guardianship_data,
      },
      special_instructions: {
        ...template.templateData.special_instructions,
        ...currentData?.special_instructions,
      },
      legal_data: {
        ...template.templateData.legal_data,
        ...currentData?.legal_data,
      },
      // Add required properties with defaults
      completeness_score: currentData?.completeness_score ?? 0,
      family_protection_level: currentData?.family_protection_level ?? 'standard',
      review_eligibility: currentData?.review_eligibility ?? true,
    };

    return mergedData;
  }

  /**
   * Compare two will versions
   */
  compareWillVersions(oldWill: WillData, newWill: WillData): ComparisonReport {
    const changes: ChangeSet[] = [];

    // Compare testator data
    this.compareSection(
      'testator_data',
      oldWill.testator_data,
      newWill.testator_data,
      changes
    );

    // Compare beneficiaries
    this.compareBeneficiaries(
      oldWill.beneficiaries,
      newWill.beneficiaries,
      changes
    );

    // Compare assets
    this.compareSection('assets', oldWill.assets, newWill.assets, changes);

    // Compare executor data
    this.compareSection(
      'executor_data',
      oldWill.executor_data,
      newWill.executor_data,
      changes
    );

    // Compare guardianship data
    this.compareSection(
      'guardianship_data',
      oldWill.guardianship_data,
      newWill.guardianship_data,
      changes
    );

    // Compare special instructions
    this.compareSection(
      'special_instructions',
      oldWill.special_instructions,
      newWill.special_instructions,
      changes
    );

    // Analyze impact
    const impactAnalysis = this.analyzeImpact(changes, oldWill, newWill);

    return {
      id: `comparison_${Date.now()}`,
      comparedAt: new Date(),
      oldVersion: this.createSnapshot(oldWill, 'old'),
      newVersion: this.createSnapshot(newWill, 'new'),
      changes,
      impactAnalysis,
      recommendations: this.generateRecommendations(changes, impactAnalysis),
      requiresLegalReview: this.requiresLegalReview(changes),
    };
  }

  /**
   * Suggest template modifications based on user data
   */
  suggestTemplateModifications(
    template: WillTemplate,
    userData: WillData
  ): Modification[] {
    const modifications: Modification[] = [];

    // Check if user has more complex needs than template
    if (userData.beneficiaries.length > template.preview.beneficiaryCount) {
      modifications.push({
        id: `mod_${Date.now()}_beneficiaries`,
        templateId: template.id,
        type: 'beneficiary_adjustment',
        description:
          'Add additional beneficiaries to match your family situation',
        rationale: `You have ${userData.beneficiaries.length} beneficiaries but template handles ${template.preview.beneficiaryCount}`,
        priority: 'high',
        estimatedImplementationTime: 10,
      });
    }

    // Check for business interests
    if (
      (userData.assets as any).businessInterests &&
      !template.targetProfile.hasBusinessInterests
    ) {
      modifications.push({
        id: `mod_${Date.now()}_business`,
        templateId: template.id,
        type: 'asset_addition',
        description: 'Add business succession planning',
        rationale:
          'You have business interests that require special consideration',
        priority: 'high',
        estimatedImplementationTime: 20,
      });
    }

    // Check for guardianship needs
    if (
      userData.guardianship_data.minorChildren?.length &&
      !template.templateData.guardianship_data?.primaryGuardian
    ) {
      modifications.push({
        id: `mod_${Date.now()}_guardianship`,
        templateId: template.id,
        type: 'custom_clause',
        description: 'Add comprehensive guardianship provisions',
        rationale: 'You have minor children who need guardian appointment',
        priority: 'high',
        estimatedImplementationTime: 15,
      });
    }

    return modifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get all available categories
   */
  getAvailableCategories(): Array<{
    category: TemplateCategory;
    count: number;
    description: string;
  }> {
    const categoryCounts = new Map<TemplateCategory, number>();

    WILL_TEMPLATES.forEach(template => {
      categoryCounts.set(
        template.category,
        (categoryCounts.get(template.category) || 0) + 1
      );
    });

    const categoryDescriptions: Record<TemplateCategory, string> = {
      young_professional: 'For young adults starting their careers',
      new_parent: 'For new parents focusing on child protection',
      established_family: 'For families with stable assets and relationships',
      blended_family: 'For families with children from multiple relationships',
      business_owner: 'For entrepreneurs and business owners',
      retiree: 'For retirees focused on legacy and charitable giving',
      single_parent: 'For single parents with unique challenges',
      childless_couple: 'For couples without children',
      charitable_focused: 'For those prioritizing charitable giving',
      international: 'For those with international assets or concerns',
      special_needs: 'For families with special needs considerations',
    };

    return Array.from(categoryCounts.entries()).map(([category, count]) => ({
      category,
      count,
      description: categoryDescriptions[category],
    }));
  }

  // Helper methods
  private compareSection(
    sectionName: keyof WillData,
    oldSection: any,
    newSection: any,
    changes: ChangeSet[]
  ) {
    if (!oldSection && !newSection) return;

    if (!oldSection && newSection) {
      changes.push({
        section: sectionName,
        field: '*',
        changeType: 'added',
        newValue: newSection,
        impact: 'medium',
        description: `Added ${sectionName} section`,
      });
      return;
    }

    if (oldSection && !newSection) {
      changes.push({
        section: sectionName,
        field: '*',
        changeType: 'removed',
        oldValue: oldSection,
        impact: 'high',
        description: `Removed ${sectionName} section`,
      });
      return;
    }

    // Compare individual fields
    const allKeys = new Set([
      ...Object.keys(oldSection || {}),
      ...Object.keys(newSection || {}),
    ]);

    allKeys.forEach(key => {
      const oldValue = oldSection?.[key];
      const newValue = newSection?.[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          section: sectionName,
          field: key,
          changeType: !oldValue ? 'added' : !newValue ? 'removed' : 'modified',
          oldValue,
          newValue,
          impact: this.determineImpact(sectionName, key),
          description: `${sectionName}.${key} ${!oldValue ? 'added' : !newValue ? 'removed' : 'modified'}`,
        });
      }
    });
  }

  private compareBeneficiaries(
    oldBeneficiaries: WillData['beneficiaries'],
    newBeneficiaries: WillData['beneficiaries'],
    changes: ChangeSet[]
  ) {
    const oldNames = new Set(oldBeneficiaries.map(b => b.name));
    const newNames = new Set(newBeneficiaries.map(b => b.name));

    // Check for added beneficiaries
    newBeneficiaries.forEach(beneficiary => {
      if (!oldNames.has(beneficiary.name)) {
        changes.push({
          section: 'beneficiaries',
          field: 'add',
          changeType: 'added',
          newValue: beneficiary,
          impact: 'high',
          description: `Added beneficiary: ${beneficiary.name} (${beneficiary.percentage}%)`,
        });
      }
    });

    // Check for removed beneficiaries
    oldBeneficiaries.forEach(beneficiary => {
      if (!newNames.has(beneficiary.name)) {
        changes.push({
          section: 'beneficiaries',
          field: 'remove',
          changeType: 'removed',
          oldValue: beneficiary,
          impact: 'critical',
          description: `Removed beneficiary: ${beneficiary.name} (was ${beneficiary.percentage}%)`,
        });
      }
    });

    // Check for modified beneficiaries
    oldBeneficiaries.forEach(oldBen => {
      const newBen = newBeneficiaries.find(b => b.name === oldBen.name);
      if (
        newBen &&
        (oldBen.percentage !== newBen.percentage ||
          oldBen.relationship !== newBen.relationship)
      ) {
        changes.push({
          section: 'beneficiaries',
          field: 'modify',
          changeType: 'modified',
          oldValue: oldBen,
          newValue: newBen,
          impact: 'high',
          description: `Modified beneficiary: ${newBen.name} (${oldBen.percentage}% → ${newBen.percentage}%)`,
        });
      }
    });
  }

  private determineImpact(
    section: keyof WillData,
    field: string
  ): ChangeSet['impact'] {
    // Critical impact fields
    if (
      section === 'beneficiaries' ||
      (section === 'executor_data' && field === 'primaryExecutor')
    ) {
      return 'critical';
    }

    // High impact fields
    if (
      section === 'testator_data' &&
      ['fullName', 'address'].includes(field)
    ) {
      return 'high';
    }

    if (section === 'guardianship_data' && field === 'primaryGuardian') {
      return 'high';
    }

    // Medium impact fields
    if (section === 'assets' || section === 'special_instructions') {
      return 'medium';
    }

    return 'low';
  }

  private analyzeImpact(
    changes: ChangeSet[],
    oldWill: WillData,
    newWill: WillData
  ): ImpactAnalysis {
    const criticalChanges = changes.filter(c => c.impact === 'critical').length;
    const highChanges = changes.filter(c => c.impact === 'high').length;

    let overallImpact: ImpactAnalysis['overallImpact'] = 'minimal';
    if (criticalChanges > 0) overallImpact = 'major';
    else if (highChanges > 2) overallImpact = 'significant';
    else if (highChanges > 0) overallImpact = 'moderate';

    const affectedBeneficiaries = changes
      .filter(c => c.section === 'beneficiaries')
      .map(c => c.newValue?.name || c.oldValue?.name)
      .filter(Boolean);

    const changedInheritanceAmounts = oldWill.beneficiaries
      .map(oldBen => {
        const newBen = newWill.beneficiaries.find(b => b.name === oldBen.name);
        if (newBen && oldBen.percentage !== newBen.percentage) {
          return {
            beneficiary: oldBen.name,
            oldPercentage: oldBen.percentage,
            newPercentage: newBen.percentage,
            difference: newBen.percentage - oldBen.percentage,
          };
        }
        return null;
      })
      .filter(Boolean) as ImpactAnalysis['changedInheritanceAmounts'];

    return {
      overallImpact,
      affectedBeneficiaries: [...new Set(affectedBeneficiaries)],
      changedInheritanceAmounts,
      newLegalRequirements: this.identifyNewLegalRequirements(changes),
      potentialConflicts: this.identifyPotentialConflicts(changes),
    };
  }

  private generateRecommendations(
    changes: ChangeSet[],
    impact: ImpactAnalysis
  ): string[] {
    const recommendations: string[] = [];

    if (impact.overallImpact === 'major') {
      recommendations.push(
        'Consider professional legal review due to major changes'
      );
    }

    if (impact.changedInheritanceAmounts.length > 0) {
      recommendations.push(
        'Notify affected beneficiaries of inheritance changes'
      );
    }

    if (changes.some(c => c.section === 'executor_data')) {
      recommendations.push(
        'Confirm executor is still willing and able to serve'
      );
    }

    if (changes.some(c => c.section === 'guardianship_data')) {
      recommendations.push('Confirm guardians consent to appointment');
    }

    return recommendations;
  }

  private requiresLegalReview(changes: ChangeSet[]): boolean {
    return changes.some(
      c =>
        c.impact === 'critical' ||
        (c.section === 'beneficiaries' && c.changeType === 'removed') ||
        (c.section === 'executor_data' && c.field === 'primaryExecutor')
    );
  }

  private createSnapshot(
    willData: WillData,
    version: string
  ): WillVersionSnapshot {
    return {
      id: `snapshot_${Date.now()}_${version}`,
      version,
      createdAt: new Date(),
      data: willData,
      metadata: {
        jurisdiction: willData.legal_data?.jurisdiction || 'Unknown',
        totalBeneficiaries: willData.beneficiaries.length,
        totalAssetCategories: Object.keys(willData.assets || {}).length,
        completionPercentage: this.calculateCompletionPercentage(willData),
      },
    };
  }

  private calculateCompletionPercentage(willData: WillData): number {
    let completed = 0;
    let total = 0;

    // Check required fields
    const requiredFields = [
      willData.testator_data?.fullName,
      willData.testator_data?.address,
      willData.beneficiaries?.length > 0,
    ];

    requiredFields.forEach(field => {
      total++;
      if (field) completed++;
    });

    return Math.round((completed / total) * 100);
  }

  private identifyNewLegalRequirements(changes: ChangeSet[]): string[] {
    const requirements: string[] = [];

    if (changes.some(c => c.section === 'guardianship_data')) {
      requirements.push('Guardian consent documentation required');
    }

    if (
      changes.some(
        c => c.section === 'beneficiaries' && c.changeType === 'added'
      )
    ) {
      requirements.push('Consider forced heir implications');
    }

    return requirements;
  }

  private identifyPotentialConflicts(changes: ChangeSet[]): string[] {
    const conflicts: string[] = [];

    const beneficiaryChanges = changes.filter(
      c => c.section === 'beneficiaries'
    );
    if (beneficiaryChanges.length > 0) {
      conflicts.push('Family members may question inheritance changes');
    }

    if (changes.some(c => c.section === 'executor_data')) {
      conflicts.push('Previous executor may need formal notification');
    }

    return conflicts;
  }
}

// Export singleton instance
export const willTemplateLibrary = new WillTemplateLibrary();
