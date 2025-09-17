
/**
 * Family Impact Statement Generator
 * Creates emotional, family-focused messaging for user actions
 */

export interface FamilyImpactStatement {
  benefit_details: string[];
  call_to_action?: string;
  celebration_message?: string;
  emotional_hook: string;
  family_context: string;
  primary_message: string;
  urgency_level: 'high' | 'low' | 'medium';
}

export interface FamilyContext {
  documentsCount: number;
  emergencyContactsCount: number;
  familyMembersCount: number;
  hasInsurance: boolean;
  hasWill: boolean;
  protectionLevel: 'basic' | 'comprehensive' | 'premium' | 'standard';
}

/**
 * Generate family impact statement based on user action
 */
export function generateFamilyImpactStatement(
  action:
    | 'emergency_contact'
    | 'family_added'
    | 'first_document'
    | 'insurance_added'
    | 'milestone_reached'
    | 'will_completed',
  context: FamilyContext
): FamilyImpactStatement {
  const familySize = context.familyMembersCount;
  const familyTerm = getFamilyTerm(familySize);

  switch (action) {
    case 'first_document':
      return {
        primary_message:
          "You've placed the first stone in your family's mosaic of certainty",
        emotional_hook: `${familyTerm} can now breathe easier knowing you're thinking of their future`,
        benefit_details: [
          'Your document is encrypted and secure',
          'Accessible to trusted family members in emergencies',
          'No more searching through boxes and drawers',
          'Legal protection starts immediately',
        ],
        call_to_action:
          'Add an emergency contact so someone can access this right away',
        celebration_message:
          "This is the beginning of your family's security journey! 🌟",
        urgency_level: 'medium',
        family_context: `${familySize > 0 ? `${familySize} family members` : 'Your loved ones'} are now one step safer`,
      };

    case 'will_completed':
      return {
        primary_message:
          'Your family now has the ultimate gift: clarity about your wishes',
        emotional_hook: `${familyTerm} won't have to guess what you wanted - they'll know for certain`,
        benefit_details: [
          'Your assets will go exactly where you intended',
          'No family disputes over your wishes',
          'Legal proceedings will be faster and cheaper',
          'Your loved ones can focus on grieving, not legal battles',
        ],
        celebration_message:
          "You've given your family the most precious gift: peace of mind! 🎉",
        urgency_level: 'low',
        family_context: `${familyTerm} are now completely protected by your clear intentions`,
      };

    case 'family_added':
      return {
        primary_message: `Welcome to the circle of protection - ${context.familyMembersCount} people can now access what matters most`,
        emotional_hook:
          'Every person you add multiplies the security net around your family',
        benefit_details: [
          'Multiple people can help in emergencies',
          'Shared responsibility means nothing gets missed',
          'Your legacy reaches more hearts',
          'Stronger family bonds through shared trust',
        ],
        call_to_action:
          context.familyMembersCount < 3
            ? 'Consider adding one more trusted person'
            : undefined,
        urgency_level: 'low',
        family_context: `${context.familyMembersCount} trusted people now guard your family's future`,
      };

    case 'emergency_contact':
      return {
        primary_message:
          'Someone trusted now holds the key to help your family immediately',
        emotional_hook:
          "In critical moments, your emergency contact becomes your family's hero",
        benefit_details: [
          'Instant access to vital documents during crises',
          'Medical decisions can be made faster',
          'Financial accounts remain accessible',
          'Your wishes are communicated immediately',
        ],
        urgency_level: 'low',
        family_context: `${familyTerm} now have immediate help available when seconds count`,
      };

    case 'insurance_added':
      return {
        primary_message: "Your family's financial fortress just got stronger",
        emotional_hook: `${familyTerm} won't face financial hardship while dealing with loss`,
        benefit_details: [
          'Bills and expenses will be covered',
          "Mortgage and debts won't burden your family",
          "Children's education remains secure",
          'Your spouse can focus on healing, not finances',
        ],
        urgency_level: 'low',
        family_context: `${familyTerm} are now financially protected from life's uncertainties`,
      };

    case 'milestone_reached':
      return {
        primary_message: getProtectionMilestoneMessage(context.protectionLevel),
        emotional_hook: `${familyTerm} can sleep peacefully knowing you've thought of everything`,
        benefit_details: getProtectionBenefits(context.protectionLevel),
        celebration_message: getProtectionCelebration(context.protectionLevel),
        urgency_level:
          context.protectionLevel === 'comprehensive' ? 'low' : 'medium',
        family_context: `${familyTerm} now enjoy ${context.protectionLevel} protection`,
      };

    default:
      return {
        primary_message: 'Every step you take makes your family more secure',
        emotional_hook: `${familyTerm} are lucky to have someone who thinks ahead`,
        benefit_details: [
          'Your thoughtful preparation creates lasting peace of mind',
        ],
        urgency_level: 'low',
        family_context: `${familyTerm} benefit from your careful planning`,
      };
  }
}

/**
 * Get family-appropriate term based on size
 */
function getFamilyTerm(familySize: number): string {
  if (familySize === 0) return 'Your loved ones';
  if (familySize === 1) return 'Your family member';
  if (familySize <= 3) return 'Your family';
  return `Your ${familySize} family members`;
}

/**
 * Generate protection milestone messages
 */
function getProtectionMilestoneMessage(
  level: FamilyContext['protectionLevel']
): string {
  switch (level) {
    case 'comprehensive':
      return 'Your family fortress is complete - comprehensive protection achieved!';
    case 'premium':
      return 'Your family enjoys premium-level protection and security';
    case 'standard':
      return 'Your family has solid, reliable protection in place';
    case 'basic':
      return "Your family's foundation of security is taking shape";
    default:
      return 'Your family protection journey continues to grow stronger';
  }
}

/**
 * Get protection-level specific benefits
 */
function getProtectionBenefits(
  level: FamilyContext['protectionLevel']
): string[] {
  const baseBenefits = [
    'Important documents are secure and accessible',
    'Legal wishes are clearly documented',
    'Emergency contacts can act immediately',
  ];

  switch (level) {
    case 'comprehensive':
      return [
        ...baseBenefits,
        'Professional legal review ensures everything is correct',
        'Multiple family members have appropriate access',
        'Complete asset protection and distribution planning',
        'Advanced emergency protocols are in place',
      ];
    case 'premium':
      return [
        ...baseBenefits,
        'Most assets and wishes are properly documented',
        'Strong family access and emergency protocols',
        'Insurance and financial protection in place',
      ];
    case 'standard':
      return [
        ...baseBenefits,
        'Basic will and asset planning completed',
        'Key insurance documents secured',
      ];
    default:
      return baseBenefits;
  }
}

/**
 * Get celebration message for protection level
 */
function getProtectionCelebration(
  level: FamilyContext['protectionLevel']
): string {
  switch (level) {
    case 'comprehensive':
      return 'Outstanding! Your family has the highest level of protection possible! 🏆';
    case 'premium':
      return 'Excellent work! Your family is very well protected! 🌟';
    case 'standard':
      return 'Great progress! Your family has solid protection! ✨';
    case 'basic':
      return "Well done! You're building a strong foundation! 🌱";
    default:
      return 'Keep going! Every step makes your family safer! 💪';
  }
}

/**
 * Generate time-sensitive family impact for urgent actions
 */
export function generateUrgentFamilyImpact(
  missingAction: 'beneficiary' | 'emergency_contact' | 'insurance' | 'will',
  context: FamilyContext
): FamilyImpactStatement {
  const familyTerm = getFamilyTerm(context.familyMembersCount);

  switch (missingAction) {
    case 'will':
      return {
        primary_message: `${familyTerm} need to know your wishes - a will is their roadmap through difficult times`,
        emotional_hook:
          'Without clear instructions, your family might struggle to honor what you really wanted',
        benefit_details: [
          'Prevents family disputes and confusion',
          'Ensures your assets go to the right people',
          'Makes legal processes faster and less expensive',
          'Gives your family confidence in their decisions',
        ],
        call_to_action: 'Create your will now - it only takes 15 minutes',
        urgency_level: 'high',
        family_context: `${familyTerm} are counting on your guidance`,
      };

    case 'emergency_contact':
      return {
        primary_message:
          'In a crisis, every second counts - give someone the power to help immediately',
        emotional_hook: `${familyTerm} might need instant access to your information when you can't provide it`,
        benefit_details: [
          'Medical decisions can be made without delay',
          'Financial accounts remain accessible',
          'Important documents are immediately available',
          "Your family won't be locked out when they need help most",
        ],
        call_to_action: 'Add emergency contact now - takes 30 seconds',
        urgency_level: 'high',
        family_context: `${familyTerm} need someone who can act when you can't`,
      };

    default:
      return generateFamilyImpactStatement('milestone_reached', context);
  }
}

/**
 * Generate celebration message for completed family milestone
 */
export function generateMilestoneCelebration(
  milestone: string,
  context: FamilyContext
): { emoji: string; message: string; title: string } {
  const familyTerm = getFamilyTerm(context.familyMembersCount);

  const celebrations = {
    first_document: {
      title: 'First Stone Placed! 🏗️',
      message: `You've started building ${familyTerm.toLowerCase()}'s foundation of security`,
      emoji: '🌟',
    },
    will_complete: {
      title: 'Legacy Locked In! 📋',
      message: `${familyTerm} now know exactly what you want for them`,
      emoji: '🎉',
    },
    family_circle: {
      title: 'Circle of Trust Complete! 👨‍👩‍👧‍👦',
      message: `${context.familyMembersCount} people now guard your family's future`,
      emoji: '💪',
    },
    protection_premium: {
      title: 'Premium Protection Achieved! 🛡️',
      message: `${familyTerm} enjoy top-tier security and peace of mind`,
      emoji: '🏆',
    },
  };

  return (
    celebrations[milestone as keyof typeof celebrations] ||
    celebrations['first_document']
  );
}
