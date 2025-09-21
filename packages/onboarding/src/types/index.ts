export interface QuestionnaireAnswer {
  questionId: string;
  answer: string | string[] | number;
  metadata?: Record<string, any>;
}

export interface QuestionnaireResponse {
  answers: QuestionnaireAnswer[];
  completedAt: string;
  sessionId: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  priorities: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  familyStatus: 'single' | 'couple' | 'family' | 'extended';
  digitalLiteracy: 'beginner' | 'intermediate' | 'advanced';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'documents' | 'guardians' | 'planning' | 'legal' | 'communication';
  estimatedMinutes: number;
  dependencies?: string[];
  completed?: boolean;
  dueDate?: string;
}

export interface Plan {
  id: string;
  persona: Persona;
  milestones: Milestone[];
  nextBestAction: Milestone;
  createdAt: string;
  updatedAt: string;
  completionPercentage: number;
}

export interface Question {
  id: string;
  type: 'single-choice' | 'multiple-choice' | 'scale' | 'text' | 'number';
  question: string;
  description?: string;
  options?: Array<{
    value: string;
    label: string;
    personaImpact?: Partial<Persona>;
  }>;
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface QuestionnaireStep {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  personaMapping: Record<string, Partial<Persona>>;
}

export interface OnboardingFlow {
  id: string;
  name: string;
  description: string;
  steps: QuestionnaireStep[];
  estimatedDuration: number; // in minutes
}

export type OnboardingProgress = {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  responses: QuestionnaireResponse;
  persona?: Partial<Persona>;
};