import { QuestionnaireStep, OnboardingFlow, QuestionnaireResponse, Persona, Plan } from '../types';

export const QUESTIONNAIRE_STEPS: QuestionnaireStep[] = [
  {
    id: 'family-status',
    title: 'Family & Relationships',
    description: 'Tell us about your family situation',
    questions: [
      {
        id: 'family_composition',
        type: 'single-choice',
        question: 'What best describes your current family situation?',
        required: true,
        options: [
          {
            value: 'single',
            label: 'Single, no children',
            personaImpact: { familyStatus: 'single', riskTolerance: 'medium' }
          },
          {
            value: 'couple',
            label: 'Married or partnered, no children',
            personaImpact: { familyStatus: 'couple', riskTolerance: 'medium' }
          },
          {
            value: 'young_family',
            label: 'Young family with children under 12',
            personaImpact: { familyStatus: 'family', riskTolerance: 'low', priorities: ['guardians', 'education'] }
          },
          {
            value: 'teen_family',
            label: 'Family with teenagers',
            personaImpact: { familyStatus: 'family', riskTolerance: 'medium', priorities: ['education', 'communication'] }
          },
          {
            value: 'extended_family',
            label: 'Extended family with elderly parents',
            personaImpact: { familyStatus: 'extended', riskTolerance: 'low', priorities: ['healthcare', 'guardians'] }
          }
        ]
      }
    ],
    personaMapping: {}
  },
  {
    id: 'priorities',
    title: 'What Matters Most',
    description: 'Help us understand your priorities for legacy planning',
    questions: [
      {
        id: 'main_priorities',
        type: 'multiple-choice',
        question: 'What are your main concerns when thinking about your legacy? (Select all that apply)',
        required: true,
        options: [
          {
            value: 'financial_security',
            label: 'Financial security for loved ones',
            personaImpact: { priorities: ['financial'] }
          },
          {
            value: 'family_harmony',
            label: 'Ensuring family harmony and communication',
            personaImpact: { priorities: ['communication'] }
          },
          {
            value: 'child_protection',
            label: 'Protecting minor children',
            personaImpact: { priorities: ['guardians', 'education'] }
          },
          {
            value: 'business_continuation',
            label: 'Business or property management',
            personaImpact: { priorities: ['business', 'legal'] }
          },
          {
            value: 'charitable_giving',
            label: 'Supporting charitable causes',
            personaImpact: { priorities: ['charity'] }
          },
          {
            value: 'medical_decisions',
            label: 'Medical and end-of-life decisions',
            personaImpact: { priorities: ['healthcare', 'legal'] }
          }
        ]
      }
    ],
    personaMapping: {}
  },
  {
    id: 'experience',
    title: 'Your Experience',
    description: 'Tell us about your familiarity with legal and financial planning',
    questions: [
      {
        id: 'planning_experience',
        type: 'single-choice',
        question: 'How familiar are you with estate planning and legal documents?',
        required: true,
        options: [
          {
            value: 'beginner',
            label: 'This is completely new to me',
            personaImpact: { digitalLiteracy: 'beginner', riskTolerance: 'low' }
          },
          {
            value: 'some_experience',
            label: 'I have some basic knowledge',
            personaImpact: { digitalLiteracy: 'intermediate', riskTolerance: 'medium' }
          },
          {
            value: 'experienced',
            label: 'I have experience with legal documents',
            personaImpact: { digitalLiteracy: 'advanced', riskTolerance: 'high' }
          }
        ]
      }
    ],
    personaMapping: {}
  },
  {
    id: 'timeline',
    title: 'Timeline & Urgency',
    description: 'When would you like to complete your legacy planning?',
    questions: [
      {
        id: 'timeline_preference',
        type: 'single-choice',
        question: 'What is your preferred timeline for getting this organized?',
        required: true,
        options: [
          {
            value: 'asap',
            label: 'As soon as possible - I want to get this done quickly',
            personaImpact: { riskTolerance: 'high' }
          },
          {
            value: 'few_months',
            label: 'Within a few months',
            personaImpact: { riskTolerance: 'medium' }
          },
          {
            value: 'this_year',
            label: 'Sometime this year',
            personaImpact: { riskTolerance: 'medium' }
          },
          {
            value: 'thinking_ahead',
            label: 'I\'m just thinking ahead for the future',
            personaImpact: { riskTolerance: 'low' }
          }
        ]
      }
    ],
    personaMapping: {}
  },
  {
    id: 'assets',
    title: 'Assets & Complexity',
    description: 'Help us understand the scope of your planning needs',
    questions: [
      {
        id: 'asset_complexity',
        type: 'single-choice',
        question: 'Which of these best describes your situation?',
        required: true,
        options: [
          {
            value: 'simple',
            label: 'Simple situation - basic will and beneficiaries',
            personaImpact: { characteristics: ['simple'] }
          },
          {
            value: 'moderate',
            label: 'Moderate complexity - some investments or property',
            personaImpact: { characteristics: ['moderate'] }
          },
          {
            value: 'complex',
            label: 'Complex situation - business ownership, multiple properties, international assets',
            personaImpact: { characteristics: ['complex'] }
          }
        ]
      }
    ],
    personaMapping: {}
  },
  {
    id: 'communication',
    title: 'Communication Style',
    description: 'How would you prefer to work through this process?',
    questions: [
      {
        id: 'communication_preference',
        type: 'single-choice',
        question: 'What communication style works best for you?',
        required: true,
        options: [
          {
            value: 'guided_step_by_step',
            label: 'Guided step-by-step process with clear instructions',
            personaImpact: { characteristics: ['guided'] }
          },
          {
            value: 'overview_then_details',
            label: 'High-level overview first, then dive into details',
            personaImpact: { characteristics: ['overview'] }
          },
          {
            value: 'flexible_adaptable',
            label: 'Flexible approach that adapts to my needs',
            personaImpact: { characteristics: ['flexible'] }
          }
        ]
      }
    ],
    personaMapping: {}
  }
];

export const ONBOARDING_FLOW: OnboardingFlow = {
  id: 'hollywood-onboarding',
  name: 'Legacy Planning Onboarding',
  description: 'Personalized onboarding to create your legacy protection plan',
  steps: QUESTIONNAIRE_STEPS,
  estimatedDuration: 15
};

export function generatePersona(responses: QuestionnaireResponse): Persona {
  const answers = responses.answers;
  const persona: Partial<Persona> = {
    id: `persona_${Date.now()}`,
    name: 'Personalized Plan',
    description: 'Customized based on your responses',
    characteristics: [],
    priorities: [],
    riskTolerance: 'medium',
    familyStatus: 'single',
    digitalLiteracy: 'intermediate'
  };

  // Process answers to build persona
  answers.forEach(answer => {
    const question = QUESTIONNAIRE_STEPS
      .flatMap(step => step.questions)
      .find(q => q.id === answer.questionId);

    if (question?.options) {
      const selectedOption = question.options.find(opt =>
        Array.isArray(answer.answer)
          ? answer.answer.includes(opt.value)
          : answer.answer === opt.value
      );

      if (selectedOption?.personaImpact) {
        Object.assign(persona, selectedOption.personaImpact);
      }
    }
  });

  // Ensure required fields
  return {
    id: persona.id ?? `persona_${Date.now()}`,
    name: persona.name ?? 'Personalized Plan',
    description: persona.description ?? 'Customized based on your responses',
    characteristics: persona.characteristics ?? [],
    priorities: persona.priorities ?? [],
    riskTolerance: persona.riskTolerance ?? 'medium',
    familyStatus: persona.familyStatus ?? 'single',
    digitalLiteracy: persona.digitalLiteracy ?? 'intermediate'
  };
}

export function generateMilestones(persona: Persona): import('../types').Milestone[] {
  const milestones: import('../types').Milestone[] = [];

  // Base milestones for everyone
  milestones.push({
    id: 'create_will',
    title: 'Create Your Will',
    description: 'Set up your basic legal will document',
    priority: 'high',
    category: 'legal',
    estimatedMinutes: 30
  });

  // Family-specific milestones
  if (persona.familyStatus === 'family' || persona.familyStatus === 'extended') {
    milestones.push({
      id: 'designate_guardians',
      title: 'Designate Guardians',
      description: 'Choose guardians for minor children',
      priority: 'high',
      category: 'guardians',
      estimatedMinutes: 20
    });
  }

  // Priority-based milestones
  if (persona.priorities.includes('financial')) {
    milestones.push({
      id: 'inventory_assets',
      title: 'Inventory Your Assets',
      description: 'List and organize your financial assets',
      priority: 'medium',
      category: 'planning',
      estimatedMinutes: 45
    });
  }

  if (persona.priorities.includes('communication')) {
    milestones.push({
      id: 'create_communication_plan',
      title: 'Create Communication Plan',
      description: 'Plan how to discuss your wishes with family',
      priority: 'medium',
      category: 'communication',
      estimatedMinutes: 25
    });
  }

  // Experience-based milestones
  if (persona.digitalLiteracy === 'beginner') {
    milestones.unshift({
      id: 'learn_basics',
      title: 'Learn the Basics',
      description: 'Understand key concepts in estate planning',
      priority: 'high',
      category: 'planning',
      estimatedMinutes: 15
    });
  }

  return milestones;
}

export function generatePlan(responses: QuestionnaireResponse): Plan {
  const persona = generatePersona(responses);
  const milestones = generateMilestones(persona);

  // Find the highest priority incomplete milestone as next best action
  const nextBestAction = milestones
    .filter(m => !m.completed)
    .sort((a, b) => {
      // Sort by priority first, then by estimated time
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.estimatedMinutes - b.estimatedMinutes;
    })[0] || milestones[0];

  const completionPercentage = Math.round(
    (milestones.filter(m => m.completed).length / milestones.length) * 100
  );

  return {
    id: `plan_${Date.now()}`,
    persona,
    milestones,
    nextBestAction,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionPercentage
  };
}