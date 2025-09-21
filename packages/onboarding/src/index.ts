// Onboarding package skeleton: domain types and a minimal plan generator.
// Code in English; UI copy in next-intl JSONs.

export type Persona =
  | 'starter'
  | 'planner'
  | 'guardian';

export type Answer = {
  key: 'familyStatus' | 'priority' | 'timeAvailable';
  value: string;
};

export type Milestone = {
  id: string;
  title: string;
  description: string;
  estimateMinutes: number;
};

export type Plan = {
  persona: Persona;
  milestones: Milestone[];
  nextBestAction: Milestone | null;
};

export function inferPersona(answers: Answer[]): Persona {
  const priority = answers.find(a => a.key === 'priority')?.value || 'safety';
  if (priority === 'organization') return 'planner';
  if (priority === 'family') return 'guardian';
  return 'starter';
}

export function generatePlan(answers: Answer[]): Plan {
  const persona = inferPersona(answers);
  const milestones: Milestone[] = [];

  // Minimal rules based on persona
  if (persona === 'starter') {
    milestones.push(
      { id: 'vault-basics', title: 'Secure your first documents', description: 'Add ID, insurance, and a key contact.', estimateMinutes: 8 },
      { id: 'guardian-add', title: 'Add a trusted guardian', description: 'Invite someone you trust as a guardian.', estimateMinutes: 6 },
    );
  } else if (persona === 'planner') {
    milestones.push(
      { id: 'organize-categories', title: 'Organize your categories', description: 'Create categories for documents and assets.', estimateMinutes: 10 },
      { id: 'checklist', title: 'Build your gentle checklist', description: 'Set reminders and next steps.', estimateMinutes: 7 },
    );
  } else {
    milestones.push(
      { id: 'family-contacts', title: 'Set up family contacts', description: 'Add spouse and children contacts.', estimateMinutes: 7 },
      { id: 'emergency-access', title: 'Prepare emergency access', description: 'Define how your family can access in emergencies.', estimateMinutes: 9 },
    );
  }

  const nextBestAction = milestones[0] ?? null;
  return { persona, milestones, nextBestAction };
}
