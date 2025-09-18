// Minimal onboarding planner used by Dashboard V2
export type Answer = { key: 'priority' | 'timeAvailable'; value: string };

export type Action = {
  title: string;
  description: string;
  estimateMinutes: number;
};

export type Milestone = Action & { id: string };

export type Plan = {
  nextBestAction?: Action;
  milestones: Milestone[];
};

export function generatePlan(answers: Answer[]): Plan {
  const priority = (answers.find(a => a.key === 'priority')?.value || 'safety').toLowerCase();
  const time = (answers.find(a => a.key === 'timeAvailable')?.value || '10m').toLowerCase();

  const quick = (min: number) => Math.min(min, time.includes('m') ? parseInt(time) || min : min);

  if (priority.startsWith('org')) {
    return {
      nextBestAction: {
        title: 'Organize important documents',
        description: 'Upload and tag your key documents so your family can find them fast.',
        estimateMinutes: quick(10),
      },
      milestones: [
        { id: 'doc-vault', title: 'Set up document vault', description: 'Create folders for IDs, insurance, and wills', estimateMinutes: quick(8) },
        { id: 'share', title: 'Share with trusted contact', description: 'Add one family member as a viewer', estimateMinutes: quick(5) },
      ],
    };
  }

  if (priority.startsWith('fam')) {
    return {
      nextBestAction: {
        title: 'Add a trusted contact',
        description: 'Designate someone who can access essentials in an emergency.',
        estimateMinutes: quick(5),
      },
      milestones: [
        { id: 'guardian', title: 'Set guardianship preferences', description: 'Choose primary and backup guardians', estimateMinutes: quick(12) },
        { id: 'notify', title: 'Set emergency notifications', description: 'Configure who gets notified and when', estimateMinutes: quick(6) },
      ],
    };
  }

  // default: safety
  return {
    nextBestAction: {
      title: 'Enable emergency access',
      description: 'Turn on emergency mode so first responders can reach critical info.',
      estimateMinutes: quick(3),
    },
    milestones: [
      { id: 'ice', title: 'Add ICE card', description: 'Add In-Case-of-Emergency details to your profile', estimateMinutes: quick(4) },
      { id: 'backup', title: 'Backup recovery key', description: 'Store your recovery key in a safe place', estimateMinutes: quick(3) },
    ],
  };
}