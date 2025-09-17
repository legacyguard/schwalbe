
/**
 * Quick Insights Engine
 * Provides immediate value demonstration after document upload
 */

import type { Document } from '@/integrations/supabase/types';
import type { WillData } from '@/types/will';

export interface QuickInsight {
  action_suggestion?: {
    action:
      | 'add_beneficiary'
      | 'complete_will'
      | 'request_review'
      | 'set_emergency_contact'
      | 'upload_document';
    text: string;
    urgent: boolean;
  };
  celebration?: boolean;
  description: string;
  emotional_message: string;
  id: string;
  impact: 'high' | 'low' | 'medium';
  title: string;
  type:
    | 'family_impact'
    | 'next_action'
    | 'protection_level'
    | 'risk_mitigation'
    | 'time_saved';
  value: number | string;
  valueType: 'count' | 'money' | 'people' | 'percentage' | 'text' | 'time';
}

export interface QuickInsightInput {
  documents: Document[];
  emergencyContactsCount?: number;
  familyMembersCount?: number;
  isFirstDocument?: boolean;
  willData?: WillData;
}

/**
 * Generate immediate insights after document upload or profile completion
 */
export function generateQuickInsights(
  input: QuickInsightInput
): QuickInsight[] {
  const insights: QuickInsight[] = [];
  const {
    documents,
    willData,
    familyMembersCount = 0,
    emergencyContactsCount = 0,
    isFirstDocument,
  } = input;

  // First document celebration
  if (isFirstDocument && documents.length === 1) {
    insights.push({
      id: 'first-document-milestone',
      type: 'family_impact',
      title:
        "Great! You've placed the first stone in your family's mosaic of certainty",
      description:
        'Your first document is now securely protected with military-grade encryption.',
      value: '1 document protected',
      valueType: 'text',
      impact: 'high',
      emotional_message: `${familyMembersCount || 'Your family'} can now access this important document in any emergency.`,
      celebration: true,
      action_suggestion: {
        text: 'Add emergency contact (30 seconds)',
        action: 'set_emergency_contact',
        urgent: false,
      },
    });
  }

  // Time saved calculation
  const timeSavedHours = calculateTimeSaved(documents, willData);
  if (timeSavedHours > 0) {
    insights.push({
      id: 'time-saved',
      type: 'time_saved',
      title: 'Time Saved for Your Family',
      description:
        "By organizing these documents, you've saved your loved ones countless hours of searching during stressful times.",
      value: timeSavedHours,
      valueType: 'time',
      impact: 'high',
      emotional_message: `Instead of hunting through boxes and files, your family will find everything they need in minutes.`,
    });
  }

  // Protection level insight
  const protectionLevel = calculateProtectionLevel(
    documents,
    familyMembersCount,
    willData
  );
  insights.push({
    id: 'protection-level',
    type: 'protection_level',
    title: 'Family Protection Level',
    description:
      'Your current level of family preparedness and document security.',
    value: protectionLevel.percentage,
    valueType: 'percentage',
    impact:
      protectionLevel.percentage > 70
        ? 'high'
        : protectionLevel.percentage > 40
          ? 'medium'
          : 'low',
    emotional_message: protectionLevel.message,
    action_suggestion:
      protectionLevel.percentage < 80
        ? {
            text: protectionLevel.nextAction,
            action: protectionLevel.actionType,
            urgent: protectionLevel.percentage < 40,
          }
        : undefined,
  });

  // Family impact statement
  const familyImpact = generateFamilyImpactStatement(
    documents.length,
    familyMembersCount,
    emergencyContactsCount
  );
  if (familyImpact) {
    insights.push(familyImpact);
  }

  // Document-specific insights
  const docInsights = generateDocumentSpecificInsights(documents);
  insights.push(...docInsights);

  // Next action recommendations
  const nextActionInsights = generateNextActionInsights(
    documents,
    familyMembersCount,
    emergencyContactsCount,
    willData
  );
  insights.push(...nextActionInsights);

  return insights.sort((a, b) => {
    const impactOrder = { high: 3, medium: 2, low: 1 };
    return impactOrder[b.impact] - impactOrder[a.impact];
  });
}

/**
 * Calculate time saved by having organized documents
 */
function calculateTimeSaved(
  documents: Document[],
  willData?: WillData
): number {
  let hours = 0;

  // Base time saved per document type
  const timePerDocument: Record<string, number> = {
    insurance: 2,
    legal: 4,
    financial: 3,
    medical: 1.5,
    property: 3,
    personal: 1,
    will: 8,
    power_of_attorney: 6,
  };

  documents.forEach(doc => {
    const docType = doc.category || 'personal';
    hours += timePerDocument[docType] || 1;
  });

  // Additional time saved for will completion
  if (willData) {
    if (willData.beneficiaries && willData.beneficiaries.length > 0) hours += 4;
    if (
      willData.executor_data &&
      Object.keys(willData.executor_data).length > 0
    )
      hours += 2;
    if (willData.assets && Object.keys(willData.assets).length > 0) hours += 6;
  }

  return Math.round(hours);
}

/**
 * Calculate overall family protection level
 */
function calculateProtectionLevel(
  documents: Document[],
  familyMembers: number,
  willData?: WillData
) {
  let score = 0;
  // const __maxScore = 100; // Unused

  // Document coverage (40 points)
  const docScore = Math.min(40, (documents.length / 10) * 40);
  score += docScore;

  // Will completeness (30 points)
  if (willData) {
    if (willData.testator_data?.fullName) score += 5;
    if (willData.beneficiaries && willData.beneficiaries.length > 0)
      score += 10;
    if (
      willData.executor_data &&
      Object.keys(willData.executor_data).length > 0
    )
      score += 8;
    if (willData.assets && Object.keys(willData.assets).length > 0) score += 7;
  }

  // Family setup (20 points)
  score += Math.min(20, familyMembers * 5);

  // Emergency preparedness (10 points)
  const essentialDocs = documents.filter(d =>
    ['insurance', 'legal', 'financial', 'medical'].includes(d.category || '')
  );
  score += Math.min(10, (essentialDocs.length / 4) * 10);

  const percentage = Math.round(score);

  let message: string;
  let nextAction: string;
  let actionType:
    | 'add_beneficiary'
    | 'complete_will'
    | 'request_review'
    | 'set_emergency_contact'
    | 'upload_document';

  if (percentage >= 80) {
    message = `${familyMembers ? `${familyMembers} family members` : 'Your family'} are excellently protected.`;
    nextAction = 'Request professional review for complete peace of mind';
    actionType = 'request_review';
  } else if (percentage >= 60) {
    message = `${familyMembers ? `${familyMembers} family members` : 'Your family'} have solid protection with room to strengthen.`;
    nextAction = 'Add more essential documents like insurance policies';
    actionType = 'upload_document';
  } else if (percentage >= 40) {
    message = `${familyMembers ? `${familyMembers} family members` : 'Your family'} have basic protection - let's build on this foundation.`;
    nextAction = 'Complete your will to dramatically increase protection';
    actionType = 'complete_will';
  } else {
    message = `${familyMembers ? `${familyMembers} family members` : 'Your family'} need stronger protection - every document helps.`;
    nextAction = 'Add emergency contact for immediate family access';
    actionType = 'set_emergency_contact';
  }

  return { percentage, message, nextAction, actionType };
}

/**
 * Generate family-focused impact statement
 */
function generateFamilyImpactStatement(
  documentCount: number,
  familyMembers: number,
  emergencyContacts: number
): null | QuickInsight {
  if (documentCount === 0) return null;

  const protectedPeople = familyMembers + emergencyContacts;

  return {
    id: 'family-impact',
    type: 'family_impact',
    title: `${protectedPeople > 0 ? protectedPeople : 'Your'} ${protectedPeople === 1 ? 'Person' : 'People'} Protected`,
    description:
      'Your organized documents create a safety net that extends beyond you.',
    value: protectedPeople || 'Family',
    valueType: protectedPeople > 0 ? 'people' : 'text',
    impact: 'high',
    emotional_message:
      protectedPeople > 0
        ? `${protectedPeople} people now have secure access to your important information when they need it most.`
        : 'Your thoughtful preparation creates security for everyone who depends on you.',
    action_suggestion:
      protectedPeople === 0
        ? {
            text: 'Add family member access',
            action: 'add_beneficiary',
            urgent: false,
          }
        : undefined,
  };
}

/**
 * Generate insights based on specific document types
 */
function generateDocumentSpecificInsights(
  documents: Document[]
): QuickInsight[] {
  const insights: QuickInsight[] = [];

  const categories = documents.reduce(
    (acc, doc) => {
      const category = doc.category || 'personal';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Insurance coverage insight
  if (categories.insurance && categories.insurance >= 2) {
    insights.push({
      id: 'insurance-coverage',
      type: 'risk_mitigation',
      title: 'Strong Insurance Foundation',
      description:
        'Multiple insurance policies secured - your family is well protected against financial risks.',
      value: categories.insurance,
      valueType: 'count',
      impact: 'high',
      emotional_message:
        "Your family won't face financial hardship during difficult times.",
    });
  }

  // Legal document completeness
  if (categories.legal && categories.legal >= 3) {
    insights.push({
      id: 'legal-preparedness',
      type: 'protection_level',
      title: 'Legal Documents Secured',
      description:
        'Important legal documents are organized and accessible when needed.',
      value: categories.legal,
      valueType: 'count',
      impact: 'medium',
      emotional_message:
        'Legal processes will be smoother for your loved ones.',
    });
  }

  return insights;
}

/**
 * Generate next action recommendations
 */
function generateNextActionInsights(
  documents: Document[],
  _familyMembers: number,
  emergencyContacts: number,
  willData?: WillData
): QuickInsight[] {
  const insights: QuickInsight[] = [];

  // Missing will insight
  if (
    !willData ||
    !willData.beneficiaries ||
    willData.beneficiaries.length === 0
  ) {
    insights.push({
      id: 'missing-will',
      type: 'next_action',
      title: 'Complete Your Will',
      description:
        'A will is the cornerstone of family protection - it ensures your wishes are honored.',
      value: '15 minutes',
      valueType: 'time',
      impact: 'high',
      emotional_message:
        'Give your family clarity and peace of mind about your wishes.',
      action_suggestion: {
        text: 'Start will creation wizard',
        action: 'complete_will',
        urgent: true,
      },
    });
  }

  // Missing emergency contacts
  if (emergencyContacts === 0) {
    insights.push({
      id: 'add-emergency-contact',
      type: 'next_action',
      title: 'Add Emergency Contact',
      description:
        "Emergency contacts can access your documents immediately when you can't.",
      value: '30 seconds',
      valueType: 'time',
      impact: 'medium',
      emotional_message: 'Ensure someone trusted can help in critical moments.',
      action_suggestion: {
        text: 'Add emergency contact',
        action: 'set_emergency_contact',
        urgent: false,
      },
    });
  }

  // Document gaps
  const hasInsurance = documents.some(d => d.category === 'insurance');
  // const __hasMedical = documents.some(d => d.category === 'medical'); // Unused

  if (!hasInsurance && documents.length >= 3) {
    insights.push({
      id: 'missing-insurance',
      type: 'next_action',
      title: 'Add Insurance Documents',
      description:
        "Insurance policies are crucial for your family's financial security.",
      value: 'High priority',
      valueType: 'text',
      impact: 'medium',
      emotional_message:
        'Protect your family from unexpected financial burdens.',
      action_suggestion: {
        text: 'Upload insurance documents',
        action: 'upload_document',
        urgent: false,
      },
    });
  }

  return insights;
}

/**
 * Format insight value for display
 */
export function formatInsightValue(insight: QuickInsight): string {
  switch (insight.valueType) {
    case 'time':
      return typeof insight.value === 'number'
        ? `${insight.value} hours`
        : insight.value.toString();
    case 'money':
      return typeof insight.value === 'number'
        ? `$${insight.value.toLocaleString()}`
        : insight.value.toString();
    case 'people':
      return typeof insight.value === 'number'
        ? `${insight.value} ${insight.value === 1 ? 'person' : 'people'}`
        : insight.value.toString();
    case 'percentage':
      return `${insight.value}%`;
    case 'count':
      return `${insight.value} items`;
    default:
      return insight.value.toString();
  }
}
