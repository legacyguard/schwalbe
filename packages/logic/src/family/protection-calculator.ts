/**
 * Protection Level Calculator
 * Calculates time saved and protection metrics for family impact
 */

type MinimalDocument = { category?: string; description?: string; file_size?: number; created_at?: string };
type WillData = {
  testatorInfo?: { fullName?: string };
  beneficiaries?: Array<any>;
  executors?: Array<any>;
  assets?: Record<string, any>;
  witnesses?: Array<any>;
  specialProvisions?: Array<any>;
};

export interface ProtectionMetrics {
  completenessPercentage: number;
  familyImpactScore: number;
  protectionLevel: 'basic' | 'comprehensive' | 'premium' | 'standard';
  protectionScore: number;
  riskMitigationLevel: number;
  timeSavedHours: number;
}

export interface TimeBreakdown {
  assetDiscovery: number;
  beneficiaryResolution: number;
  documentProcessing: number;
  emergencyAccess: number;
  legalSearchTime: number;
  total: number;
}

/**
 * Calculate comprehensive protection metrics
 */
export function calculateProtectionMetrics(
  documents: MinimalDocument[],
  willData?: WillData,
  familyMembersCount: number = 0,
  emergencyContactsCount: number = 0
): ProtectionMetrics {
  const timeSaved = calculateDetailedTimeSaved(documents, willData);
  const protectionScore = calculateProtectionScore(
    documents,
    familyMembersCount,
    emergencyContactsCount,
    willData
  );
  const familyImpact = calculateFamilyImpactScore(
    documents,
    familyMembersCount,
    emergencyContactsCount
  );
  const riskMitigation = calculateRiskMitigationLevel(documents, willData);
  const completeness = calculateCompletenessPercentage(documents, willData);

  return {
    timeSavedHours: timeSaved.total,
    protectionLevel: getProtectionLevel(protectionScore),
    protectionScore,
    familyImpactScore: familyImpact,
    riskMitigationLevel: riskMitigation,
    completenessPercentage: completeness,
  };
}

/**
 * Calculate detailed time breakdown saved by organization
 */
export function calculateDetailedTimeSaved(
  documents: MinimalDocument[],
  willData?: WillData
): TimeBreakdown {
  let documentProcessing = 0;
  let legalSearchTime = 0;
  let assetDiscovery = 0;
  let beneficiaryResolution = 0;
  let emergencyAccess = 0;

  // Time saved per document category (hours)
  const categoryTimeMap: Record<
    string,
    { emergency: number; legal: number; processing: number }
  > = {
    legal: { processing: 4, legal: 8, emergency: 2 },
    financial: { processing: 3, legal: 6, emergency: 4 },
    insurance: { processing: 2, legal: 4, emergency: 6 },
    medical: { processing: 1, legal: 2, emergency: 8 },
    property: { processing: 3, legal: 12, emergency: 1 },
    personal: { processing: 0.5, legal: 1, emergency: 0.5 },
    will: { processing: 8, legal: 20, emergency: 10 },
  };

  // Calculate document-based time savings
  documents.forEach(doc => {
    const category = doc.category || 'personal';
    const timeData = categoryTimeMap[category] || categoryTimeMap.personal;

    documentProcessing += timeData.processing;
    legalSearchTime += timeData.legal;
    emergencyAccess += timeData.emergency;
  });

  // Will-specific time savings
  if (willData) {
    // Asset discovery time saved
    const assetCount = willData.assets
      ? Object.keys(willData.assets).length
      : 0;
    assetDiscovery += assetCount * 4; // 4 hours per asset type

    // Beneficiary resolution time saved
    const beneficiaryCount = willData.beneficiaries
      ? willData.beneficiaries.length
      : 0;
    beneficiaryResolution += beneficiaryCount * 6; // 6 hours per beneficiary dispute avoided

    // Clear instructions prevent family disputes
    if (willData.specialProvisions && willData.specialProvisions.length > 0) {
      beneficiaryResolution += 20; // Major family dispute avoided
    }
  }

  const total =
    documentProcessing +
    legalSearchTime +
    assetDiscovery +
    beneficiaryResolution +
    emergencyAccess;

  return {
    documentProcessing: Math.round(documentProcessing),
    legalSearchTime: Math.round(legalSearchTime),
    assetDiscovery: Math.round(assetDiscovery),
    beneficiaryResolution: Math.round(beneficiaryResolution),
    emergencyAccess: Math.round(emergencyAccess),
    total: Math.round(total),
  };
}

/**
 * Calculate overall protection score (0-100)
 */
function calculateProtectionScore(
  documents: MinimalDocument[],
  familyMembers: number,
  emergencyContacts: number,
  willData?: WillData
): number {
  let score = 0;

  // Document diversity and coverage (30 points)
  const categories = new Set(documents.map(d => d.category).filter(Boolean));
  const essentialCategories = ['legal', 'financial', 'insurance', 'medical'];
  const coverageScore = (categories.size / 8) * 30; // 8 total categories
  const essentialCoverage = essentialCategories.filter(cat =>
    categories.has(cat)
  ).length;
  score += coverageScore + (essentialCoverage / 4) * 10;

  // Will completeness (25 points)
  if (willData) {
    if (willData.testatorInfo?.fullName) score += 5;
    if (willData.beneficiaries && willData.beneficiaries.length > 0) score += 8;
    if (willData.executors && willData.executors.length > 0) score += 5;
    if (willData.assets && Object.keys(willData.assets).length > 0) score += 4;
    if (willData.witnesses && willData.witnesses.length >= 2) score += 3;
  }

  // Family network (20 points)
  score += Math.min(10, familyMembers * 2.5);
  score += Math.min(10, emergencyContacts * 5);

  // Document quality and organization (15 points)
  const avgFileSize = documents.length
    ? documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0) / documents.length
    : 0;
  if (avgFileSize > 100000) score += 5; // Good quality scans/files
  if (documents.some(d => d.description && d.description.length > 20))
    score += 5; // Good descriptions
  score += Math.min(5, documents.length * 0.5); // Document quantity

  // Emergency preparedness (10 points)
  const hasEmergencyDocs = documents.some(d =>
    ['medical', 'insurance', 'legal'].includes(d.category || '')
  );
  if (hasEmergencyDocs) score += 5;
  if (emergencyContacts > 0) score += 5;

  return Math.min(100, Math.round(score));
}

/**
 * Get protection level from score
 */
function getProtectionLevel(
  score: number
): 'basic' | 'comprehensive' | 'premium' | 'standard' {
  if (score >= 85) return 'comprehensive';
  if (score >= 70) return 'premium';
  if (score >= 50) return 'standard';
  return 'basic';
}

/**
 * Calculate family impact score
 */
function calculateFamilyImpactScore(
  documents: MinimalDocument[],
  familyMembers: number,
  emergencyContacts: number
): number {
  const totalPeopleProtected = familyMembers + emergencyContacts;
  const documentImpact = Math.min(50, documents.length * 5);
  const familyNetworkImpact = Math.min(30, totalPeopleProtected * 6);
  const accessibilityImpact = emergencyContacts > 0 ? 20 : 0;

  return Math.min(
    100,
    documentImpact + familyNetworkImpact + accessibilityImpact
  );
}

/**
 * Calculate risk mitigation level
 */
function calculateRiskMitigationLevel(
  documents: MinimalDocument[],
  willData?: WillData
): number {
  let score = 0;

  // Financial risk mitigation
  const hasInsurance = documents.some(d => d.category === 'insurance');
  const hasFinancialDocs = documents.some(d => d.category === 'financial');
  if (hasInsurance) score += 25;
  if (hasFinancialDocs) score += 15;

  // Legal risk mitigation
  const hasLegalDocs = documents.some(d => d.category === 'legal');
  if (hasLegalDocs) score += 20;
  if (willData && willData.beneficiaries?.length) score += 25;

  // Medical emergency risk mitigation
  const hasMedicalDocs = documents.some(d => d.category === 'medical');
  if (hasMedicalDocs) score += 15;

  return Math.min(100, score);
}

/**
 * Calculate completeness percentage
 */
function calculateCompletenessPercentage(
  documents: MinimalDocument[],
  willData?: WillData
): number {
  const essentialItems = [
    { name: 'Will/Testament', present: !!willData },
    {
      name: 'Insurance Policies',
      present: documents.some(d => d.category === 'insurance'),
    },
    {
      name: 'Financial Accounts',
      present: documents.some(d => d.category === 'financial'),
    },
    {
      name: 'Legal Documents',
      present: documents.some(d => d.category === 'legal'),
    },
    {
      name: 'Medical Information',
      present: documents.some(d => d.category === 'medical'),
    },
    {
      name: 'Property Documents',
      present: documents.some(d => d.category === 'property'),
    },
  ];

  const completedItems = essentialItems.filter(item => item.present).length;
  return Math.round((completedItems / essentialItems.length) * 100);
}

/**
 * Generate protection improvement suggestions
 */
export function getProtectionImprovements(
  metrics: ProtectionMetrics,
  documents: Document[],
  willData?: WillData
): {
  action: string;
  impact: string;
  priority: 'high' | 'low' | 'medium';
  timeEstimate: string;
}[] {
  const suggestions: Array<{
    action: string;
    impact: string;
    priority: 'high' | 'low' | 'medium';
    timeEstimate: string;
  }> = [];

  if (!willData || !willData.beneficiaries?.length) {
    suggestions.push({
      priority: 'high',
      action: 'Complete your will',
      impact: 'Increase protection by 25+ points',
      timeEstimate: '15 minutes',
    });
  }

  const hasInsurance = documents.some(d => d.category === 'insurance');
  if (!hasInsurance) {
    suggestions.push({
      priority: 'high',
      action: 'Add insurance documents',
      impact: 'Major financial protection for family',
      timeEstimate: '5 minutes',
    });
  }

  const hasMedical = documents.some(d => d.category === 'medical');
  if (!hasMedical) {
    suggestions.push({
      priority: 'medium',
      action: 'Upload medical information',
      impact: 'Enable faster emergency decisions',
      timeEstimate: '3 minutes',
    });
  }

  if (metrics.protectionScore < 70) {
    suggestions.push({
      priority: 'medium',
      action: 'Add emergency contact',
      impact: 'Immediate access in crises',
      timeEstimate: '30 seconds',
    });
  }

  return suggestions;
}

/**
 * Calculate monetary value of time saved
 */
export function calculateTimeSavedValue(
  timeSavedHours: number,
  hourlyRate: number = 150
): {
  familyTimeValue: number;
  legalFeesAvoided: number;
  stressReduction: number;
  totalValue: number;
} {
  // Legal fees avoided (typically $300-500/hr for estate attorneys)
  const legalFeesAvoided = timeSavedHours * 400;

  // Family time value (opportunity cost)
  const familyTimeValue = timeSavedHours * hourlyRate;

  // Stress reduction value (estimated health/productivity impact)
  const stressReduction = timeSavedHours * 50;

  const totalValue = legalFeesAvoided + familyTimeValue + stressReduction;

  return {
    totalValue: Math.round(totalValue),
    legalFeesAvoided: Math.round(legalFeesAvoided),
    familyTimeValue: Math.round(familyTimeValue),
    stressReduction: Math.round(stressReduction),
  };
}