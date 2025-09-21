export interface PersonalityPreset {
  mode: 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting' | 'nurturing' | 'confident';
  confidence: number;
  context: 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting' | 'learning' | 'supporting' | 'encouraging' | 'trust' | 'processing' | 'analyzing' | 'synthesizing' | 'validating' | 'monitoring' | 'inviting' | 'consulting' | 'emergency' | 'onboarding';
  mood: 'neutral' | 'encouraging' | 'celebrating' | 'comforting';
}

export const personalityPresets = {
  default: {
    mode: 'empathetic' as const,
    confidence: 0.8,
    context: 'idle' as const,
    mood: 'neutral' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'empathetic' as const,
      responseSpeed: 'normal' as const,
      emotionalIntensity: 'medium' as const,
      detailLevel: 'normal' as const,
      formality: 'warm' as const,
    },
    consistencyScore: 0.7,
  },
  professional: {
    mode: 'pragmatic' as const,
    confidence: 0.9,
    context: 'consulting' as const,
    mood: 'neutral' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'pragmatic' as const,
      responseSpeed: 'normal' as const,
      emotionalIntensity: 'low' as const,
      detailLevel: 'detailed' as const,
      formality: 'professional' as const,
    },
    consistencyScore: 0.8,
  },
  supportive: {
    mode: 'nurturing' as const,
    confidence: 0.7,
    context: 'supporting' as const,
    mood: 'encouraging' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'empathetic' as const,
      responseSpeed: 'slow' as const,
      emotionalIntensity: 'high' as const,
      detailLevel: 'normal' as const,
      formality: 'warm' as const,
    },
    consistencyScore: 0.9,
  },
  celebrating: {
    mode: 'celebratory' as const,
    confidence: 0.9,
    context: 'celebrating' as const,
    mood: 'celebrating' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'celebratory' as const,
      responseSpeed: 'fast' as const,
      emotionalIntensity: 'high' as const,
      detailLevel: 'brief' as const,
      formality: 'casual' as const,
    },
    consistencyScore: 0.8,
  },
  analyticalUser: {
    mode: 'pragmatic' as const,
    confidence: 0.9,
    context: 'analyzing' as const,
    mood: 'neutral' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'pragmatic' as const,
      responseSpeed: 'normal' as const,
      emotionalIntensity: 'low' as const,
      detailLevel: 'detailed' as const,
      formality: 'professional' as const,
    },
    consistencyScore: 0.9,
  },
  professionalUser: {
    mode: 'confident' as const,
    confidence: 0.9,
    context: 'consulting' as const,
    mood: 'neutral' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'pragmatic' as const,
      responseSpeed: 'normal' as const,
      emotionalIntensity: 'low' as const,
      detailLevel: 'detailed' as const,
      formality: 'professional' as const,
    },
    consistencyScore: 0.9,
  },
  encouragingUser: {
    mode: 'nurturing' as const,
    confidence: 0.8,
    context: 'encouraging' as const,
    mood: 'encouraging' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'empathetic' as const,
      responseSpeed: 'normal' as const,
      emotionalIntensity: 'high' as const,
      detailLevel: 'normal' as const,
      formality: 'warm' as const,
    },
    consistencyScore: 0.8,
  },
  analytical: {
    mode: 'pragmatic' as const,
    confidence: 0.9,
    context: 'analyzing' as const,
    mood: 'neutral' as const,
    interactionCount: 0,
    componentMemory: {},
    globalPreferences: {
      communicationStyle: 'pragmatic' as const,
      responseSpeed: 'normal' as const,
      emotionalIntensity: 'low' as const,
      detailLevel: 'detailed' as const,
      formality: 'professional' as const,
    },
    consistencyScore: 0.9,
  }
};

export default personalityPresets;