
/**
 * LegacyGuard Business Succession Planning Service
 * Comprehensive business succession planning and corporate document management
 * for enterprise clients and business owners.
 */

export type BusinessType =
  | 'corporation'
  | 'llc'
  | 'non_profit'
  | 'partnership'
  | 'sole_proprietorship'
  | 'trust';

export type SuccessionTrigger =
  | 'death'
  | 'departure'
  | 'disability'
  | 'dissolution'
  | 'merger'
  | 'retirement'
  | 'sale';

export type StakeholderRole =
  | 'advisor'
  | 'board_member'
  | 'key_employee'
  | 'owner'
  | 'partner'
  | 'shareholder'
  | 'successor';

export type BusinessAssetType =
  | 'accounts_receivable'
  | 'contracts'
  | 'equipment'
  | 'goodwill'
  | 'intellectual_property'
  | 'inventory'
  | 'licenses'
  | 'real_estate';

export interface BusinessEntity {
  assets: BusinessAsset[];
  createdAt: string;
  description: string;
  documents: CorporateDocument[];
  ein: string;
  governance: BusinessGovernance;
  id: string;
  incorporationDate: string;
  industry: string;
  jurisdiction: string;
  keyPersons: KeyPerson[];
  liabilities: BusinessLiability[];
  name: string;
  ownership: BusinessOwnership[];
  successionPlan?: SuccessionPlan;
  type: BusinessType;
  updatedAt: string;
  valuation: {
    amount: number;
    appraiser?: string;
    currency: string;
    method: string;
    valuationDate: string;
  };
}

export interface BusinessOwnership {
  buyoutProvisions: BuyoutProvision[];
  createdAt: string;
  equityType: string;
  id: string;
  ownershipPercentage: number;
  role: StakeholderRole;
  stakeholderId: string;
  stakeholderName: string;
  transferRestrictions: TransferRestriction[];
  vestingSchedule?: VestingSchedule;
  votingRights: boolean;
}

export interface BusinessGovernance {
  boardOfDirectors: BoardMember[];
  bylaws: ByLaws;
  committees: Committee[];
  meetingRequirements: MeetingRequirement[];
  officers: Officer[];
  operatingAgreements: OperatingAgreement[];
  votingAgreements: VotingAgreement[];
}

export interface BusinessAsset {
  criticalToOperations: boolean;
  description: string;
  encumbrances: Encumbrance[];
  id: string;
  name: string;
  ownership: string;
  successorDesignation?: string;
  transferability: string;
  type: BusinessAssetType;
  valuation: {
    amount: number;
    currency: string;
    valuationDate: string;
  };
}

export interface BusinessLiability {
  amount: number;
  creditor: string;
  currency: string;
  description: string;
  id: string;
  maturityDate?: string;
  personalGuarantees: PersonalGuarantee[];
  successorLiability: boolean;
}

export interface KeyPerson {
  compensationPackage: CompensationPackage;
  criticalKnowledge: string[];
  department: string;
  documentationStatus: DocumentationStatus;
  id: string;
  name: string;
  relationships: KeyRelationship[];
  retentionStrategies: RetentionStrategy[];
  role: string;
  successorCandidates: SuccessorCandidate[];
}

export interface SuccessionPlan {
  advisors: PlanAdvisor[];
  businessId: string;
  contingencies: ContingencyPlan[];
  createdAt: string;
  financing: FinancingStrategy;
  id: string;
  lastReviewed: string;
  nextReview: string;
  objectives: string[];
  planName: string;
  scenarios: SuccessionScenario[];
  status: 'active' | 'draft' | 'executed' | 'under_review';
  tax: TaxStrategy;
  timeline: SuccessionTimeline;
  transition: TransitionPlan;
  triggers: SuccessionTrigger[];
  updatedAt: string;
  valuation: BusinessValuation;
}

export interface SuccessionScenario {
  actions: ActionItem[];
  financialImplications: FinancialImpact;
  id: string;
  impact: 'critical' | 'high' | 'low' | 'medium';
  name: string;
  probability: number;
  risks: RiskAssessment[];
  successors: SuccessorDesignation[];
  timeline: string;
  trigger: SuccessionTrigger;
}

export interface CorporateDocument {
  accessLevel: 'confidential' | 'public' | 'restricted';
  category: string;
  expirationDate?: string;
  filingRequirements: FilingRequirement[];
  id: string;
  importance: 'critical' | 'important' | 'supporting';
  name: string;
  relatedDocuments: string[];
  retention: RetentionPolicy;
  status: 'current' | 'expired' | 'pending_renewal';
  type: CorporateDocumentType;
  versions: DocumentVersion[];
}

export type CorporateDocumentType =
  | 'articles_of_incorporation'
  | 'business_plan'
  | 'buy_sell_agreement'
  | 'contract'
  | 'employment_contract'
  | 'financial_statement'
  | 'insurance_policy'
  | 'license'
  | 'non_disclosure_agreement'
  | 'operating_agreement'
  | 'partnership_agreement'
  | 'permit'
  | 'shareholder_agreement'
  | 'succession_plan'
  | 'tax_return';

export interface TransferRestriction {
  approvalRequired: boolean;
  description: string;
  dragAlongRights: boolean;
  exceptions: string[];
  rightOfFirstRefusal: boolean;
  tagAlongRights: boolean;
  type: string;
}

export interface VestingSchedule {
  acceleration: AccelerationTrigger[];
  cliffPeriod?: string;
  totalShares: number;
  vestingPeriod: string;
}

export interface BuyoutProvision {
  fundingMechanism: string;
  paymentTerms: PaymentTerms;
  timeframe: string;
  trigger: SuccessionTrigger;
  valuationMethod: string;
}

export interface ContingencyPlan {
  actions: ActionItem[];
  id: string;
  resources: ResourceRequirement[];
  responsible: string[];
  scenario: string;
  timeline: string;
  triggers: string[];
}

// Missing type definitions
export interface BoardMember {
  compensation: number;
  id: string;
  name: string;
  position: string;
  startDate: string;
  term: string;
}

export interface Officer {
  compensation: number;
  department: string;
  id: string;
  name: string;
  startDate: string;
  title: string;
}

export interface Committee {
  charter: string;
  id: string;
  members: string[];
  name: string;
  type: string;
}

export interface VotingAgreement {
  expirationDate: string;
  id: string;
  parties: string[];
  terms: string;
}

export interface OperatingAgreement {
  effectiveDate: string;
  id: string;
  parties: string[];
  terms: string;
}

export interface ByLaws {
  amendmentProcess: string;
  effectiveDate: string;
  provisions: string[];
  version: string;
}

export interface MeetingRequirement {
  frequency: string;
  noticeRequired: number;
  quorum: number;
  type: string;
}

export interface Encumbrance {
  amount: number;
  description: string;
  holder: string;
  type: string;
}

export interface PersonalGuarantee {
  amount: number;
  conditions: string[];
  expirationDate?: string;
  guarantor: string;
}

export interface KeyRelationship {
  contact: string;
  id: string;
  importance: string;
  type: string;
}

export interface CompensationPackage {
  baseSalary: number;
  benefits: string[];
  bonuses: number;
  equity: number;
}

export interface RetentionStrategy {
  cost: number;
  description: string;
  duration: string;
  type: string;
}

export interface SuccessorCandidate {
  developmentNeeds: string[];
  id: string;
  name: string;
  readiness: string;
}

export interface DocumentationStatus {
  completeness: number;
  documented: boolean;
  lastUpdated: string;
}

export interface SuccessionTimeline {
  phases: Array<{
    endDate: string;
    milestones: string[];
    name: string;
    startDate: string;
  }>;
  totalDuration: string;
}

export interface TaxStrategy {
  estimatedSavings: number;
  implementation: string[];
  strategies: string[];
}

export interface FinancingStrategy {
  amount: number;
  sources: string[];
  terms: string;
  timeline: string;
}

export interface TransitionPlan {
  duration: string;
  milestones: string[];
  phases: string[];
  responsibilities: Record<string, string[]>;
}

export interface PlanAdvisor {
  contact: string;
  firm: string;
  id: string;
  name: string;
  role: string;
}

export interface SuccessorDesignation {
  conditions: string[];
  readiness: string;
  role: string;
  successorId: string;
  successorName: string;
}

export interface ActionItem {
  action: string;
  assignee?: string;
  category?: string;
  completedDate?: string;
  createdAt?: string;
  deadline: string;
  dependencies?: string[];
  description?: string;
  dueDate?: string;
  estimatedEffort?: string;
  id: string;
  lastUpdated?: string;
  notes?: string;
  priority?: string;
  responsible: string;
  status: string;
  title?: string;
}

export interface RiskAssessment {
  category?: string;
  description?: string;
  id?: string;
  impact: string;
  mitigation: string[];
  owner?: string;
  probability: number;
  reviewDate?: string;
  risk: string;
  severity?: string;
}

export interface FinancialImpact {
  costs: number;
  currency?: string;
  estimatedCost?: number;
  financingNeeded?: boolean;
  netImpact: number;
  revenue: number;
  taxImplications: number;
}

export interface FilingRequirement {
  agency: string;
  deadline: string;
  status: string;
  type: string;
}

export interface RetentionPolicy {
  destructionMethod: string;
  duration: string;
  storageLocation: string;
}

export interface DocumentVersion {
  author: string;
  changes: string[];
  date: string;
  version: string;
}

export interface AccelerationTrigger {
  conditions: string[];
  event: string;
  percentageAccelerated: number;
}

export interface PaymentTerms {
  collateral?: string;
  duration: string;
  interestRate?: number;
  structure: string;
}

export interface ResourceRequirement {
  amount: number;
  availability: string;
  source: string;
  type: string;
}

export interface SuccessionPlanTemplate {
  businessType: BusinessType;
  id: string;
  name: string;
  provisions: string[];
  sections: string[];
}

export interface BusinessValuation {
  amount?: number;
  appraiser?: string;
  assetValues?: any[];
  assumptions: string[];
  businessId?: string;
  date?: string;
  discounts?: DiscountFactor[];
  enterpriseValue?: number;
  equityValue?: number;
  id?: string;
  method: string;
  multiples?: IndustryMultiple[];
  nextValuation?: string;
  sensitivity?: SensitivityAnalysis;
  validity?: string;
  valuationDate?: string;
}

export interface AssetValuation {
  amount: number;
  assetId: string;
  date: string;
  method: string;
}

export interface DiscountFactor {
  justification: string;
  percentage: number;
  type: string;
}

export interface IndustryMultiple {
  date: string;
  metric: string;
  multiple: number;
  source: string;
}

export interface SensitivityAnalysis {
  impact: Record<string, number>;
  range: { max: number; min: number };
  variable: string;
}

export interface ReadinessScore {
  categories: Record<string, number>;
  overall: number;
  timestamp: string;
}

export interface GapAnalysis {
  gaps: Array<{
    actions: string[];
    area: string;
    current: string;
    target: string;
  }>;
}

export interface Recommendation {
  id: string;
  implementation: string[];
  justification: string;
  priority: string;
  recommendation: string;
}

export interface ImplementationMilestone {
  date: string;
  dependencies: string[];
  description?: string;
  id?: string;
  milestone: string;
  name?: string;
  responsible?: string;
  status: string;
  targetDate?: string;
}

export interface FinancialProjection {
  assumptions: string[];
  expenses: number;
  period: string;
  profit: number;
  projections?: any;
  revenue: number;
  scenario?: string;
  timeframe?: string;
}

export interface ReviewSchedule {
  agenda?: string[];
  frequency: string;
  nextReview: string;
  participants?: string[];
  reviewers: string[];
  scope: string[];
}

export interface SuccessionReport {
  actionItems: ActionItem[];
  businessId: string;
  executiveSummary: string;
  financialProjections: FinancialProjection[];
  gapAnalysis: GapAnalysis[];
  id: string;
  planId: string;
  readinessScore: ReadinessScore;
  recommendations: Recommendation[];
  reportDate: string;
  reviewSchedule: ReviewSchedule;
  riskAssessment: RiskAssessment[];
  timeline: ImplementationMilestone[];
}

export type ActionStatus =
  | 'blocked'
  | 'cancelled'
  | 'completed'
  | 'in_progress'
  | 'pending';

export class BusinessSuccessionPlanningService {
  private businesses: Map<string, BusinessEntity> = new Map();
  private successionPlans: Map<string, SuccessionPlan> = new Map();
  private templates: Map<string, SuccessionPlanTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  async createBusiness(
    businessData: Partial<BusinessEntity>
  ): Promise<BusinessEntity> {
    const business: BusinessEntity = {
      id: this.generateId(),
      name: businessData.name || '',
      type: businessData.type || 'llc',
      ein: businessData.ein || '',
      incorporationDate:
        businessData.incorporationDate || new Date().toISOString(),
      jurisdiction: businessData.jurisdiction || '',
      industry: businessData.industry || '',
      description: businessData.description || '',
      valuation: businessData.valuation || {
        amount: 0,
        currency: 'USD',
        valuationDate: new Date().toISOString(),
        method: 'book_value',
      },
      ownership: businessData.ownership || [],
      governance: businessData.governance || this.createDefaultGovernance(),
      assets: businessData.assets || [],
      liabilities: businessData.liabilities || [],
      keyPersons: businessData.keyPersons || [],
      documents: businessData.documents || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.businesses.set(business.id, business);
    return business;
  }

  async createSuccessionPlan(
    businessId: string,
    planData: Partial<SuccessionPlan>
  ): Promise<SuccessionPlan> {
    const business = this.businesses.get(businessId);
    if (!business) {
      throw new Error(`Business not found: ${businessId}`);
    }

    const plan: SuccessionPlan = {
      id: this.generateId(),
      businessId,
      planName: planData.planName || `${business.name} Succession Plan`,
      objectives: planData.objectives || [],
      timeline: planData.timeline || this.createDefaultTimeline(),
      triggers: planData.triggers || ['death', 'disability', 'retirement'],
      scenarios: planData.scenarios || [],
      valuation:
        planData.valuation || (await this.createBusinessValuation(businessId)),
      tax: planData.tax || this.createDefaultTaxStrategy(),
      financing: planData.financing || this.createDefaultFinancingStrategy(),
      transition: planData.transition || this.createDefaultTransitionPlan(),
      contingencies: planData.contingencies || [],
      status: 'draft',
      lastReviewed: new Date().toISOString(),
      nextReview: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 year
      advisors: planData.advisors || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.successionPlans.set(plan.id, plan);
    business.successionPlan = plan;
    business.updatedAt = new Date().toISOString();

    return plan;
  }

  async addSuccessionScenario(
    planId: string,
    scenario: Partial<SuccessionScenario>
  ): Promise<SuccessionScenario> {
    const plan = this.successionPlans.get(planId);
    if (!plan) {
      throw new Error(`Succession plan not found: ${planId}`);
    }

    const newScenario: SuccessionScenario = {
      id: this.generateId(),
      name: scenario.name || `Scenario ${plan.scenarios.length + 1}`,
      trigger: scenario.trigger || 'retirement',
      probability: scenario.probability || 0.3,
      impact: scenario.impact || 'medium',
      timeline: scenario.timeline || '6-12 months',
      successors: scenario.successors || [],
      actions: scenario.actions || [],
      risks: scenario.risks || [],
      financialImplications: scenario.financialImplications || {
        revenue: 0,
        costs: 0,
        taxImplications: 0,
        netImpact: 0,
        estimatedCost: 0,
        currency: 'USD',
        financingNeeded: false,
      },
    };

    plan.scenarios.push(newScenario);
    plan.updatedAt = new Date().toISOString();

    return newScenario;
  }

  async performValuation(
    businessId: string,
    method: string = 'dcf',
    appraiser?: string
  ): Promise<BusinessValuation> {
    const business = this.businesses.get(businessId);
    if (!business) {
      throw new Error(`Business not found: ${businessId}`);
    }

    const valuation: BusinessValuation = {
      id: this.generateId(),
      businessId,
      method,
      appraiser,
      valuationDate: new Date().toISOString(),
      enterpriseValue: this.calculateEnterpriseValue(business, method),
      equityValue: this.calculateEquityValue(business),
      assetValues: business.assets.map(asset => ({
        assetId: asset.id,
        method,
        value: asset.valuation.amount,
        currency: asset.valuation.currency,
      })),
      assumptions: this.getValuationAssumptions(method),
      discounts: this.calculateDiscounts(business),
      multiples: this.getIndustryMultiples(business.industry),
      sensitivity: this.performSensitivityAnalysis(business),
      validity: '12 months',
      nextValuation: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    return valuation;
  }

  async generateSuccessionReport(planId: string): Promise<SuccessionReport> {
    const plan = this.successionPlans.get(planId);
    if (!plan) {
      throw new Error(`Succession plan not found: ${planId}`);
    }

    const business = this.businesses.get(plan.businessId);
    if (!business) {
      throw new Error(`Business not found: ${plan.businessId}`);
    }

    const report: SuccessionReport = {
      id: this.generateId(),
      planId,
      businessId: plan.businessId,
      reportDate: new Date().toISOString(),
      executiveSummary: this.generateExecutiveSummary(business, plan),
      readinessScore: this.calculateReadinessScore(plan),
      gapAnalysis: await this.performGapAnalysis(plan),
      recommendations: await this.generateRecommendations(plan),
      timeline: this.generateImplementationTimeline(plan),
      riskAssessment: await this.assessRisks(plan),
      financialProjections: await this.createFinancialProjections(plan),
      actionItems: this.generateActionItems(plan),
      reviewSchedule: this.createReviewSchedule(plan),
    };

    return report;
  }

  async trackImplementation(
    planId: string,
    actionId: string,
    status: ActionStatus,
    notes?: string
  ): Promise<void> {
    const plan = this.successionPlans.get(planId);
    if (!plan) {
      throw new Error(`Succession plan not found: ${planId}`);
    }

    const action = this.findActionItem(plan, actionId);
    if (!action) {
      throw new Error(`Action item not found: ${actionId}`);
    }

    action.status = status;
    action.lastUpdated = new Date().toISOString();
    if (notes) {
      action.notes = notes;
    }

    if (status === 'completed') {
      action.completedDate = new Date().toISOString();
    }

    plan.updatedAt = new Date().toISOString();
    await this.updatePlanProgress(plan);
  }

  private initializeTemplates(): void {
    // Initialize succession plan templates
    const templates: SuccessionPlanTemplate[] = [
      {
        id: 'family_business',
        name: 'Family Business Succession',
        businessType: 'llc' as BusinessType,
        sections: ['governance', 'valuation', 'succession'],
        provisions: [
          'family_governance',
          'training_program',
          'fairness_assessment',
        ],
      },
      {
        id: 'management_buyout',
        name: 'Management Buyout Plan',
        businessType: 'corporation' as BusinessType,
        sections: ['buyout', 'financing', 'transition'],
        provisions: ['valuation', 'financing', 'earnout_structure'],
      },
      {
        id: 'strategic_sale',
        name: 'Strategic Sale Preparation',
        businessType: 'corporation' as BusinessType,
        sections: ['preparation', 'valuation', 'sale'],
        provisions: ['due_diligence', 'value_optimization', 'deal_structure'],
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private createDefaultGovernance(): BusinessGovernance {
    return {
      boardOfDirectors: [],
      officers: [],
      committees: [],
      votingAgreements: [],
      operatingAgreements: [],
      bylaws: {} as ByLaws,
      meetingRequirements: [],
    };
  }

  private createDefaultTimeline(): SuccessionTimeline {
    return {
      phases: [],
      totalDuration: '24 months',
    };
  }

  private async createBusinessValuation(
    businessId: string
  ): Promise<BusinessValuation> {
    return this.performValuation(businessId);
  }

  private createDefaultTaxStrategy(): TaxStrategy {
    return {
      strategies: [],
      estimatedSavings: 0,
      implementation: [],
    };
  }

  private createDefaultFinancingStrategy(): FinancingStrategy {
    return {
      sources: [],
      amount: 0,
      terms: '',
      timeline: '',
    };
  }

  private createDefaultTransitionPlan(): TransitionPlan {
    return {
      phases: [],
      duration: '12 months',
      responsibilities: {},
      milestones: [],
    };
  }

  private calculateEnterpriseValue(
    business: BusinessEntity,
    method: string
  ): number {
    // Simplified valuation calculation
    const assetValue = business.assets.reduce(
      (sum, asset) => sum + asset.valuation.amount,
      0
    );
    const liabilityValue = business.liabilities.reduce(
      (sum, liability) => sum + liability.amount,
      0
    );

    switch (method) {
      case 'asset_based':
        return assetValue - liabilityValue;
      case 'dcf':
        return assetValue * 1.2; // Simplified DCF multiple
      case 'market_multiple':
        return assetValue * 1.5; // Market multiple approach
      default:
        return assetValue - liabilityValue;
    }
  }

  private calculateEquityValue(business: BusinessEntity): number {
    return this.calculateEnterpriseValue(business, 'asset_based');
  }

  private getValuationAssumptions(method: string): string[] {
    const assumptions = {
      dcf: ['Discount rate: 10%', 'Growth rate: 3%', 'Terminal multiple: 10x'],
      market_multiple: ['Industry multiple: 1.5x', 'Revenue multiple: 2x'],
      asset_based: ['Market value of assets', 'Book value of liabilities'],
    };

    return assumptions[method as keyof typeof assumptions] || [];
  }

  private calculateDiscounts(_business: BusinessEntity): DiscountFactor[] {
    return [
      {
        type: 'marketability',
        percentage: 0.2,
        justification: 'Private company discount',
      },
      {
        type: 'control',
        percentage: 0.1,
        justification: 'Minority interest discount',
      },
    ];
  }

  private getIndustryMultiples(_industry: string): IndustryMultiple[] {
    // Industry-specific multiples (simplified)
    return [
      {
        metric: 'revenue',
        multiple: 2.0,
        source: 'Industry Analysis',
        date: new Date().toISOString(),
      },
      {
        metric: 'ebitda',
        multiple: 8.0,
        source: 'Industry Analysis',
        date: new Date().toISOString(),
      },
      {
        metric: 'earnings',
        multiple: 12.0,
        source: 'Industry Analysis',
        date: new Date().toISOString(),
      },
    ];
  }

  private performSensitivityAnalysis(
    business: BusinessEntity
  ): SensitivityAnalysis {
    return {
      variable: 'revenue_growth',
      range: { min: -0.1, max: 0.2 },
      impact: {
        base_case: business.valuation.amount,
        best_case: business.valuation.amount * 1.3,
        worst_case: business.valuation.amount * 0.7,
      },
    };
  }

  private generateExecutiveSummary(
    business: BusinessEntity,
    _plan: SuccessionPlan
  ): string {
    return `This succession plan for ${business.name} outlines a comprehensive strategy for business continuity and ownership transition. The plan addresses ${_plan.triggers.length} potential succession triggers and includes ${_plan.scenarios.length} detailed scenarios.`;
  }

  private calculateReadinessScore(_plan: SuccessionPlan): ReadinessScore {
    const totalItems = this.countTotalActionItems(_plan);
    const completedItems = this.countCompletedActionItems(_plan);
    const score = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return {
      overall: Math.round(score),
      categories: {
        planning: Math.round(score * 0.9),
        documentation: Math.round(score * 1.1),
        implementation: Math.round(score * 0.8),
        review: Math.round(score * 0.95),
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async performGapAnalysis(
    _plan: SuccessionPlan
  ): Promise<GapAnalysis[]> {
    return [
      {
        gaps: [
          {
            area: 'Documentation',
            current: 'Basic documents in place',
            target: 'Complete legal documentation',
            actions: ['Update buy-sell agreement', 'Review succession plan'],
          },
        ],
      },
    ];
  }

  private async generateRecommendations(
    _plan: SuccessionPlan
  ): Promise<Recommendation[]> {
    return [
      {
        id: this.generateId(),
        priority: 'high',
        recommendation: 'Update Buy-Sell Agreement',
        justification:
          'Review and update buy-sell agreement to reflect current valuation methods',
        implementation: [
          'Contact attorney',
          'Schedule valuation',
          'Review agreement terms',
        ],
      },
    ];
  }

  private generateImplementationTimeline(
    _plan: SuccessionPlan
  ): ImplementationMilestone[] {
    return [
      {
        id: this.generateId(),
        milestone: 'Plan Finalization',
        name: 'Plan Finalization',
        description: 'Complete succession plan documentation',
        date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        targetDate: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        ).toISOString(),
        dependencies: [],
        responsible: 'planning_committee',
        status: 'pending',
      },
    ];
  }

  private async assessRisks(_plan: SuccessionPlan): Promise<RiskAssessment[]> {
    return [
      {
        id: this.generateId(),
        risk: 'Key person dependency risk',
        category: 'operational',
        description: 'Key person dependency risk',
        impact: 'high',
        probability: 0.6,
        severity: 'high',
        mitigation: ['Cross-training program', 'Documentation of processes'],
        owner: 'management_team',
        reviewDate: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];
  }

  private async createFinancialProjections(
    _plan: SuccessionPlan
  ): Promise<FinancialProjection[]> {
    return [
      {
        period: '5_years',
        scenario: 'base_case',
        timeframe: '5_years',
        projections: {
          revenue: [1000000, 1100000, 1210000, 1331000, 1464100],
          expenses: [800000, 860000, 924400, 992924, 1066172],
          netIncome: [200000, 240000, 285600, 338076, 397928],
        },
        revenue: 1000000,
        expenses: 800000,
        profit: 200000,
        assumptions: ['3% annual growth', 'Stable margins'],
      },
    ];
  }

  private generateActionItems(_plan: SuccessionPlan): ActionItem[] {
    return [
      {
        id: this.generateId(),
        action: 'Complete valuation update',
        title: 'Complete valuation update',
        description:
          'Obtain current business valuation from qualified appraiser',
        category: 'valuation',
        priority: 'high',
        responsible: 'business_owner',
        assignee: 'business_owner',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        dependencies: [],
        estimatedEffort: '20 hours',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private createReviewSchedule(_plan: SuccessionPlan): ReviewSchedule {
    return {
      frequency: 'quarterly',
      participants: ['owner', 'advisors', 'successors'],
      agenda: ['Progress review', 'Plan updates', 'Market conditions'],
      nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      reviewers: ['owner', 'advisors', 'successors'],
      scope: ['progress_review', 'plan_updates', 'market_conditions'],
    };
  }

  private findActionItem(
    plan: SuccessionPlan,
    actionId: string
  ): ActionItem | undefined {
    // Search through all scenarios and contingencies for the action item
    for (const scenario of plan.scenarios) {
      const action = scenario.actions.find(a => a.id === actionId);
      if (action) return action;
    }

    for (const contingency of plan.contingencies) {
      const action = contingency.actions.find(a => a.id === actionId);
      if (action) return action;
    }

    return undefined;
  }

  private async updatePlanProgress(plan: SuccessionPlan): Promise<void> {
    const readinessScore = this.calculateReadinessScore(plan);

    if (readinessScore.overall >= 90) {
      plan.status = 'active';
    } else if (readinessScore.overall >= 50) {
      plan.status = 'under_review';
    }

    plan.updatedAt = new Date().toISOString();
  }

  private countTotalActionItems(plan: SuccessionPlan): number {
    let count = 0;
    plan.scenarios.forEach(scenario => (count += scenario.actions.length));
    plan.contingencies.forEach(
      contingency => (count += contingency.actions.length)
    );
    return count;
  }

  private countCompletedActionItems(plan: SuccessionPlan): number {
    let count = 0;
    plan.scenarios.forEach(scenario => {
      count += scenario.actions.filter(
        action => action.status === 'completed'
      ).length;
    });
    plan.contingencies.forEach(contingency => {
      count += contingency.actions.filter(
        action => action.status === 'completed'
      ).length;
    });
    return count;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Export the service instance
export const businessSuccessionPlanningService =
  new BusinessSuccessionPlanningService();
