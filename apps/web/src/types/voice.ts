/**
 * Voice Control Types - Shared interfaces for voice control systems
 * 
 * This file contains all shared interfaces and types used by voice control
 * components and analytics to avoid circular dependencies.
 */

// TypeScript interfaces for comprehensive type safety
export interface VoiceCommandContext {
  id: string;
  type: 'navigation' | 'action' | 'input' | 'search' | 'help' | 'settings' | 'feedback' | 'emergency';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  userIntent: 'informational' | 'navigational' | 'transactional' | 'communicative' | 'assistance' | 'control';
  priority: 'low' | 'medium' | 'high' | 'critical';
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  emotionalState: 'calm' | 'frustrated' | 'confused' | 'confident' | 'anxious' | 'tired';
  previousCommands?: string[];
  commandHistory?: number;
  userFrustration?: number; // 0-1 scale
}

export interface VoiceCommand {
  id: string;
  phrase: string;
  aliases: string[];
  category: 'navigation' | 'action' | 'input' | 'search' | 'help' | 'settings' | 'feedback' | 'emergency';
  context: VoiceCommandContext;
  action: (parameters?: Record<string, any>) => void;
  parameters?: Record<string, any>;
  confidence: number;
  enabled: boolean;
  userAssignable: boolean;
  helpText: string;
  ariaLabel: string;
  voiceFeedback: string;
  confirmationRequired: boolean;
  cooldown: number; // milliseconds
}

export interface VoiceFeedback {
  id: string;
  type: 'confirmation' | 'error' | 'guidance' | 'success' | 'warning' | 'information';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  duration: number;
  voice: 'sofia' | 'system' | 'none';
  emotionalTone: 'supportive' | 'encouraging' | 'apologetic' | 'celebratory' | 'neutral' | 'urgent';
  context: VoiceCommandContext;
  timestamp: number;
}
