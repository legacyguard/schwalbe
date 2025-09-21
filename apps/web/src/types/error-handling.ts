/**
 * Shared types for error handling and emotional error responses
 * Extracted to prevent circular dependencies
 */

export interface EmotionalError {
  id: string;
  type: 'validation' | 'network' | 'permission' | 'data' | 'user_input' | 'system' | 'timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  emotionalImpact: 'frustrating' | 'confusing' | 'blocking' | 'disappointing' | 'anxiety_inducing';
  userContext: {
    taskImportance: 'low' | 'medium' | 'high' | 'critical';
    userExperience: 'beginner' | 'intermediate' | 'advanced';
    timeInvested: number;
    previousAttempts: number;
    emotionalState: 'calm' | 'frustrated' | 'anxious' | 'determined' | 'overwhelmed';
  };
  recoveryPath: {
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    timeEstimate: number;
    requiredActions: string[];
    alternativeApproaches: string[];
  };
}

export interface EmotionalStrategy {
  id: string;
  name: string;
  errorTypes: EmotionalError['type'][];
  emotionalImpacts: EmotionalError['emotionalImpact'][];
  approach: 'empathetic' | 'solution_focused' | 'educational' | 'reassuring' | 'step_by_step';
  communicationStyle: 'warm' | 'professional' | 'encouraging' | 'direct' | 'supportive';
  visualDesign: {
    colorScheme: 'calm' | 'warm' | 'professional' | 'gentle';
    iconStyle: 'supportive' | 'solution' | 'guide' | 'shield';
    animationStyle: 'subtle' | 'gentle' | 'confident' | 'none';
  };
}

export interface EmotionalErrorResponse {
  id: string;
  error: EmotionalError;
  strategy: EmotionalStrategy;
  personalizedMessage: {
    primary: string;
    explanation: string;
    actionSteps: string[];
    encouragement: string;
    alternativeOptions?: string[];
  };
  emotionalSupport: {
    acknowledgment: string;
    reassurance: string;
    empowerment: string;
  };
  visualElements: {
    animation: 'breathing' | 'gentle_pulse' | 'supportive_glow' | 'none';
    illustration?: string;
    colorTreatment: 'warm' | 'calm' | 'professional';
  };
  accessibility: {
    screenReaderText: string;
    reducedMotion: boolean;
    highContrast: boolean;
    keyboardNavigation: string[];
  };
}