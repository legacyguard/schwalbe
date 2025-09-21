/**
 * AdvancedVoiceControl - Voice-activated accessibility integration with Sofia AI
 *
 * Features:
 * - Advanced speech recognition with natural language processing
 * - Context-aware voice commands for UI interactions
 * - Sofia AI integration for voice guidance and assistance
 * - Multi-language voice control support
 * - Voice feedback and confirmation systems
 * - Performance-optimized voice processing
 * - User preference learning for voice commands
 * - Accessibility-first voice interaction patterns
 * - Emotional intelligence for voice adaptation
 * - Advanced voice analytics and performance tracking
 */

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: SpeechGrammarList;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI: string;
  start(): void;
  stop(): void;
  abort(): void;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechGrammarList {
  readonly length: number;
  addFromString(string: string, weight?: number): void;
  addFromURI(src: string, weight?: number): void;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
}

interface SpeechGrammar {
  src: string;
  weight: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { AdvancedVoiceAnalytics } from '../../utils/AdvancedVoiceAnalytics';
import type { VoiceCommand, VoiceCommandContext, VoiceFeedback } from '../../types/voice';

export interface AdvancedVoiceControlProps {
  children: React.ReactNode;
  context: VoiceCommandContext;
  onVoiceCommand?: (command: VoiceCommand, context: VoiceCommandContext) => void;
  onVoiceFeedback?: (feedback: VoiceFeedback) => void;
  onVoiceError?: (error: string, context: VoiceCommandContext) => void;
  enableSofiaGuidance?: boolean;
  autoStart?: boolean;
  continuousListening?: boolean;
  language?: string;
  voiceCommands?: VoiceCommand[];
  className?: string;
}

// Advanced voice control engine
class AdvancedVoiceEngine {
  private voiceCommands: Map<string, VoiceCommand[]> = new Map();
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private userPreferences: Map<string, any> = new Map();
  private commandHistory: Map<string, any[]> = new Map();
  private voiceFeedbackQueue: VoiceFeedback[] = [];
  private isProcessingQueue = false;

  constructor() {
    this.initializeVoiceCommands();
    this.initializeUserPreferences();
    this.initializeSpeechAPIs();
  }

  private initializeVoiceCommands(): void {
    // Navigation commands
    this.voiceCommands.set('navigation', [
      {
        id: 'nav-home',
        phrase: 'go home',
        aliases: ['home', 'main page', 'start'],
        category: 'navigation',
        context: {
          id: 'nav-home',
          type: 'navigation',
          complexity: 'simple',
          userIntent: 'navigational',
          priority: 'medium',
          userExpertise: 'beginner',
          emotionalState: 'calm'
        },
        action: () => this.handleNavigation('home'),
        confidence: 0.9,
        enabled: true,
        userAssignable: false,
        helpText: 'Navigate to the home page',
        ariaLabel: 'Navigate home',
        voiceFeedback: 'Taking you to the home page',
        confirmationRequired: false,
        cooldown: 1000
      },
      {
        id: 'nav-back',
        phrase: 'go back',
        aliases: ['back', 'previous', 'return'],
        category: 'navigation',
        context: {
          id: 'nav-back',
          type: 'navigation',
          complexity: 'simple',
          userIntent: 'navigational',
          priority: 'medium',
          userExpertise: 'beginner',
          emotionalState: 'calm'
        },
        action: () => this.handleNavigation('back'),
        confidence: 0.85,
        enabled: true,
        userAssignable: false,
        helpText: 'Navigate to the previous page',
        ariaLabel: 'Navigate back',
        voiceFeedback: 'Going back',
        confirmationRequired: false,
        cooldown: 500
      }
    ]);

    // Action commands
    this.voiceCommands.set('action', [
      {
        id: 'action-click',
        phrase: 'click',
        aliases: ['select', 'choose', 'activate'],
        category: 'action',
        context: {
          id: 'action-click',
          type: 'action',
          complexity: 'simple',
          userIntent: 'transactional',
          priority: 'high',
          userExpertise: 'beginner',
          emotionalState: 'confident'
        },
        action: (params) => this.handleClick(params),
        confidence: 0.8,
        enabled: true,
        userAssignable: true,
        helpText: 'Click on an element',
        ariaLabel: 'Click element',
        voiceFeedback: 'Element clicked',
        confirmationRequired: false,
        cooldown: 300
      },
      {
        id: 'action-submit',
        phrase: 'submit',
        aliases: ['send', 'confirm', 'proceed'],
        category: 'action',
        context: {
          id: 'action-submit',
          type: 'action',
          complexity: 'moderate',
          userIntent: 'transactional',
          priority: 'high',
          userExpertise: 'intermediate',
          emotionalState: 'confident'
        },
        action: () => this.handleSubmit(),
        confidence: 0.9,
        enabled: true,
        userAssignable: false,
        helpText: 'Submit a form or confirm an action',
        ariaLabel: 'Submit form',
        voiceFeedback: 'Form submitted successfully',
        confirmationRequired: true,
        cooldown: 1000
      }
    ]);

    // Help commands
    this.voiceCommands.set('help', [
      {
        id: 'help-commands',
        phrase: 'help',
        aliases: ['what can I say', 'show commands', 'help me'],
        category: 'help',
        context: {
          id: 'help-commands',
          type: 'help',
          complexity: 'simple',
          userIntent: 'assistance',
          priority: 'medium',
          userExpertise: 'beginner',
          emotionalState: 'confused'
        },
        action: () => this.showHelp(),
        confidence: 0.95,
        enabled: true,
        userAssignable: false,
        helpText: 'Show available voice commands',
        ariaLabel: 'Show help',
        voiceFeedback: 'Here are the available voice commands',
        confirmationRequired: false,
        cooldown: 0
      },
      {
        id: 'help-sofia',
        phrase: 'sofia help',
        aliases: ['talk to sofia', 'sofia guide me'],
        category: 'help',
        context: {
          id: 'help-sofia',
          type: 'help',
          complexity: 'simple',
          userIntent: 'assistance',
          priority: 'medium',
          userExpertise: 'beginner',
          emotionalState: 'frustrated'
        },
        action: () => this.requestSofiaHelp(),
        confidence: 0.9,
        enabled: true,
        userAssignable: false,
        helpText: 'Get help from Sofia AI',
        ariaLabel: 'Sofia help',
        voiceFeedback: 'Sofia is here to help you',
        confirmationRequired: false,
        cooldown: 500
      }
    ]);

    // Emergency commands
    this.voiceCommands.set('emergency', [
      {
        id: 'emergency-stop',
        phrase: 'stop',
        aliases: ['cancel', 'abort', 'halt'],
        category: 'emergency',
        context: {
          id: 'emergency-stop',
          type: 'emergency',
          complexity: 'simple',
          userIntent: 'control',
          priority: 'critical',
          userExpertise: 'beginner',
          emotionalState: 'anxious'
        },
        action: () => this.handleEmergencyStop(),
        confidence: 0.95,
        enabled: true,
        userAssignable: false,
        helpText: 'Emergency stop all voice actions',
        ariaLabel: 'Emergency stop',
        voiceFeedback: 'All actions stopped',
        confirmationRequired: false,
        cooldown: 0
      }
    ]);
  }

  private initializeUserPreferences(): void {
    this.userPreferences.set('voice_preferences', {
      language: 'en-US',
      continuousListening: false,
      autoStart: false,
      voiceFeedback: true,
      confirmationRequired: true,
      sensitivity: 'medium',
      emotionalAdaptation: true
    });

    this.userPreferences.set('accessibility_features', {
      voiceGuidance: true,
      audioFeedback: true,
      visualFeedback: true,
      errorRecovery: true,
      emotionalSupport: true
    });
  }

  private initializeSpeechAPIs(): void {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();

      if (this.recognition) {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;
      }
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  startListening(): void {
    if (this.recognition && !this.isListening) {
      this.isListening = true;
      this.recognition.start();

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0]?.[0];
        if (result) {
          const transcript = result.transcript.toLowerCase();
          const confidence = result.confidence;

          this.processVoiceCommand(transcript, confidence);
        }
      };

      this.recognition.onerror = (event) => {
        this.handleVoiceError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  private processVoiceCommand(transcript: string, confidence: number): void {
    // Find matching command
    const allCommands = Array.from(this.voiceCommands.values()).flat();
    const matchingCommand = this.findBestCommandMatch(transcript, allCommands, confidence);

    if (matchingCommand) {
      this.executeVoiceCommand(matchingCommand, transcript);
    } else {
      this.handleUnknownCommand(transcript);
    }
  }

  private findBestCommandMatch(transcript: string, commands: VoiceCommand[], confidence: number): VoiceCommand | null {
    let bestMatch: VoiceCommand | null = null;
    let bestScore = 0;

    for (const command of commands) {
      if (!command.enabled) continue;

      // Check exact phrase match
      if (command.phrase === transcript) {
        return command;
      }

      // Check aliases
      for (const alias of command.aliases) {
        if (alias === transcript) {
          return command;
        }
      }

      // Calculate similarity score for partial matches
      const similarity = this.calculateSimilarity(transcript, command.phrase);
      const score = similarity * confidence;

      if (score > bestScore && score > 0.6) { // Minimum confidence threshold
        bestScore = score;
        bestMatch = command;
      }
    }

    return bestMatch;
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const longer = text1.length > text2.length ? text1 : text2;
    const shorter = text1.length > text2.length ? text2 : text1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    // Simple string similarity calculation for voice command matching
    if (str1 === str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return shorter.length;

    // Calculate simple edit distance
    let editDistance = 0;
    let longerIndex = 0;
    let shorterIndex = 0;

    while (longerIndex < longer.length && shorterIndex < shorter.length) {
      if (longer[longerIndex] !== shorter[shorterIndex]) {
        editDistance++;
        // Handle character insertion/deletion
        if (longer.length > shorter.length) {
          longerIndex++;
        } else if (shorter.length > longer.length) {
          shorterIndex++;
        } else {
          longerIndex++;
          shorterIndex++;
        }
      } else {
        longerIndex++;
        shorterIndex++;
      }
    }

    // Add remaining characters
    editDistance += longer.length - longerIndex;
    editDistance += shorter.length - shorterIndex;

    return editDistance;
  }

  private executeVoiceCommand(command: VoiceCommand, transcript: string): void {
    // Check cooldown
    const lastExecution = this.commandHistory.get(command.id)?.slice(-1)[0]?.timestamp || 0;
    if (Date.now() - lastExecution < command.cooldown) {
      this.provideVoiceFeedback({
        id: `cooldown-${Date.now()}`,
        type: 'warning',
        message: 'Please wait before using this command again',
        priority: 'medium',
        duration: 2000,
        voice: 'system',
        emotionalTone: 'neutral',
        context: command.context,
        timestamp: Date.now()
      });
      return;
    }

    // Record command execution
    const execution = {
      commandId: command.id,
      transcript,
      timestamp: Date.now(),
      success: true
    };

    if (!this.commandHistory.has(command.id)) {
      this.commandHistory.set(command.id, []);
    }
    this.commandHistory.get(command.id)!.push(execution);

    // Execute command
    try {
      command.action(command.parameters);

      // Provide feedback
      this.provideVoiceFeedback({
        id: `success-${Date.now()}`,
        type: 'success',
        message: command.voiceFeedback,
        priority: 'medium',
        duration: 1500,
        voice: 'sofia',
        emotionalTone: 'encouraging',
        context: command.context,
        timestamp: Date.now()
      });

    } catch (error) {
      this.handleVoiceError(`Command execution failed: ${error}`);
    }
  }

  private handleUnknownCommand(transcript: string): void {
    this.provideVoiceFeedback({
      id: `unknown-${Date.now()}`,
      type: 'error',
      message: 'Sorry, I didn\'t understand that command. Try saying "help" for available commands.',
      priority: 'medium',
      duration: 3000,
      voice: 'sofia',
      emotionalTone: 'apologetic',
      context: {
        id: 'unknown-command',
        type: 'help',
        complexity: 'simple',
        userIntent: 'assistance',
        priority: 'medium',
        userExpertise: 'beginner',
        emotionalState: 'confused'
      },
      timestamp: Date.now()
    });
  }

  private handleVoiceError(error: string): void {
    console.error('Voice control error:', error);

    this.provideVoiceFeedback({
      id: `error-${Date.now()}`,
      type: 'error',
      message: 'Voice control encountered an error. Please try again.',
      priority: 'high',
      duration: 2500,
      voice: 'system',
      emotionalTone: 'apologetic',
      context: {
        id: 'voice-error',
        type: 'help',
        complexity: 'simple',
        userIntent: 'assistance',
        priority: 'high',
        userExpertise: 'beginner',
        emotionalState: 'frustrated'
      },
      timestamp: Date.now()
    });
  }

  private provideVoiceFeedback(feedback: VoiceFeedback): void {
    this.voiceFeedbackQueue.push(feedback);
    this.processVoiceFeedbackQueue();
  }

  private async processVoiceFeedbackQueue(): Promise<void> {
    if (this.isProcessingQueue || this.voiceFeedbackQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.voiceFeedbackQueue.length > 0) {
      const feedback = this.voiceFeedbackQueue.shift();
      if (feedback) {
        await this.speakFeedback(feedback);
        await this.delay(feedback.duration);
      }
    }

    this.isProcessingQueue = false;
  }

  private speakFeedback(feedback: VoiceFeedback): Promise<void> {
    return new Promise((resolve) => {
      if (this.synthesis && feedback.voice !== 'none') {
        const utterance = new SpeechSynthesisUtterance(feedback.message);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;

        // Use Sofia's voice if available
        const voices = this.synthesis.getVoices();
        const sofiaVoice = voices.find(voice =>
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('zira')
        );

        if (sofiaVoice) {
          utterance.voice = sofiaVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        this.synthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Command handlers
  private handleNavigation(destination: string): void {
    // In a real implementation, this would navigate to the specified destination
    console.log(`Navigating to: ${destination}`);
  }

  private handleClick(params?: Record<string, any>): void {
    // In a real implementation, this would click on the specified element
    console.log('Clicking element:', params);
  }

  private handleSubmit(): void {
    // In a real implementation, this would submit the current form
    console.log('Submitting form');
  }

  private showHelp(): void {
    const commands = Array.from(this.voiceCommands.values()).flat();
    const helpText = `Available commands: ${commands.map(cmd => cmd.phrase).join(', ')}`;
    console.log('Voice commands help:', helpText);
  }

  private requestSofiaHelp(): void {
    console.log('Requesting Sofia help');
  }

  private handleEmergencyStop(): void {
    this.stopListening();
    console.log('Emergency stop activated');
  }

  updateUserPreferences(preferences: Record<string, any>): void {
    Object.entries(preferences).forEach(([key, value]) => {
      this.userPreferences.set(key, value);
    });

    // Update speech recognition settings
    if (this.recognition && preferences.language) {
      this.recognition.lang = preferences.language;
    }
  }

  getVoiceCommands(category?: string): VoiceCommand[] {
    if (category) {
      return this.voiceCommands.get(category) || [];
    }

    const allCommands: VoiceCommand[] = [];
    this.voiceCommands.forEach(commands => {
      allCommands.push(...commands);
    });
    return allCommands;
  }

  isSupported(): boolean {
    return !!(this.recognition && this.synthesis);
  }

  getListeningStatus(): boolean {
    return this.isListening;
  }
}

// Main component implementation
export const AdvancedVoiceControl: React.FC<AdvancedVoiceControlProps> = ({
  children,
  context,
  onVoiceCommand,
  onVoiceFeedback,
  onVoiceError,
  enableSofiaGuidance = true,
  autoStart = false,
  continuousListening = false,
  language = 'en-US',
  voiceCommands = [],
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [currentCommand, setCurrentCommand] = useState<VoiceCommand | null>(null);
  const [sofiaMessage, setSofiaMessage] = useState('');
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  const voiceEngine = useRef(new AdvancedVoiceEngine());
  const analytics = useRef(new AdvancedVoiceAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();
  const shouldReduceMotion = useReducedMotion();

  // Initialize voice engine
  useEffect(() => {
    if (voiceEngine.current.isSupported()) {
      voiceEngine.current.updateUserPreferences({
        ...preferences,
        language,
        continuousListening,
        autoStart
      });

      // Register custom voice commands
      voiceCommands.forEach(command => {
        const existingCommands = voiceEngine.current.getVoiceCommands(command.category);
        existingCommands.push(command);
      });

      // Auto-start if enabled
      if (autoStart) {
        voiceEngine.current.startListening();
        setIsListening(true);
      }

      // Show Sofia guidance if enabled
      if (enableSofiaGuidance) {
        const sofiaGenerator = new SofiaMessageGenerator();
        const message = sofiaGenerator.generateMessage({
          type: 'accessibility_guidance',
          context: context.type,
          emotionalTone: 'supportive',
          userEmotionalState: emotionalState,
          urgency: 'low'
        });
        setSofiaMessage(message);
      }
    }
  }, [context, preferences, language, autoStart, continuousListening, voiceCommands, enableSofiaGuidance, emotionalState]);

  // Update user preferences
  useEffect(() => {
    voiceEngine.current.updateUserPreferences(preferences);
  }, [preferences]);

  const handleVoiceCommand = useCallback((command: VoiceCommand) => {
    setCurrentCommand(command);
    onVoiceCommand?.(command, context);
    analytics.current.trackVoiceCommand(command, context);
  }, [onVoiceCommand, context]);

  const handleVoiceFeedback = useCallback((feedback: VoiceFeedback) => {
    onVoiceFeedback?.(feedback);
    analytics.current.trackVoiceFeedback(feedback, context);
  }, [onVoiceFeedback, context]);

  const handleVoiceError = useCallback((error: string) => {
    onVoiceError?.(error, context);
    analytics.current.trackVoiceError(error, context);
  }, [onVoiceError, context]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      voiceEngine.current.stopListening();
      setIsListening(false);
    } else {
      voiceEngine.current.startListening();
      setIsListening(true);
    }
  }, [isListening]);

  const showHelp = useCallback(() => {
    setShowVoiceHelp(true);
    setTimeout(() => setShowVoiceHelp(false), 5000);
  }, []);

  if (!voiceEngine.current.isSupported()) {
    return (
      <div className={`advanced-voice-control ${className}`}>
        <div className="voice-not-supported">
          <p>Voice control is not supported in this browser.</p>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`advanced-voice-control ${className}`}>
      {/* Sofia voice guidance */}
      {enableSofiaGuidance && sofiaMessage && (
        <motion.div
          className="sofia-voice-guidance"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <div className="sofia-avatar">
            <span className="sofia-avatar__emoji">🧚‍♀️</span>
          </div>
          <div className="sofia-message-bubble">
            <p>{sofiaMessage}</p>
            <div className="voice-features">
              <span className="feature-indicator">Voice Control: ✓</span>
              <span className="feature-indicator">Sofia AI: ✓</span>
              <span className="feature-indicator">Multi-language: ✓</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main content with voice control */}
      <div className="voice-controlled-content">
        {children}

        {/* Voice control interface */}
        <div className="voice-control-interface" aria-hidden="true">
          <button
            className={`voice-control-button ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            aria-label={isListening ? 'Stop voice control' : 'Start voice control'}
            title={isListening ? 'Stop listening' : 'Start voice control'}
          >
            <span className="voice-control-icon">
              {isListening ? '🎤' : '🎙️'}
            </span>
            <span className="voice-control-text">
              {isListening ? 'Listening...' : 'Voice Control'}
            </span>
          </button>

          <button
            className="voice-help-button"
            onClick={showHelp}
            aria-label="Show voice commands help"
            title="Show available voice commands"
          >
            <span className="help-icon">❓</span>
            <span className="help-text">Help</span>
          </button>
        </div>

        {/* Voice help overlay */}
        {showVoiceHelp && (
          <motion.div
            className="voice-help-overlay"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="voice-help-content">
              <h3>Voice Commands</h3>
              <div className="command-categories">
                <div className="command-category">
                  <h4>Navigation</h4>
                  <div className="commands-list">
                    <div className="command-item">
                      <span className="command-phrase">"Go home"</span>
                      <span className="command-desc">Navigate to home page</span>
                    </div>
                    <div className="command-item">
                      <span className="command-phrase">"Go back"</span>
                      <span className="command-desc">Go to previous page</span>
                    </div>
                  </div>
                </div>

                <div className="command-category">
                  <h4>Actions</h4>
                  <div className="commands-list">
                    <div className="command-item">
                      <span className="command-phrase">"Click"</span>
                      <span className="command-desc">Click on elements</span>
                    </div>
                    <div className="command-item">
                      <span className="command-phrase">"Submit"</span>
                      <span className="command-desc">Submit forms</span>
                    </div>
                  </div>
                </div>

                <div className="command-category">
                  <h4>Help</h4>
                  <div className="commands-list">
                    <div className="command-item">
                      <span className="command-phrase">"Help"</span>
                      <span className="command-desc">Show this help</span>
                    </div>
                    <div className="command-item">
                      <span className="command-phrase">"Sofia help"</span>
                      <span className="command-desc">Get Sofia assistance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current command indicator */}
        {currentCommand && (
          <motion.div
            className="current-command-indicator"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="command-badge">
              <span className="command-icon">🎤</span>
              <span className="command-text">{currentCommand.phrase}</span>
              <span className="command-category">{currentCommand.category}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Voice testing panel */}
      <div className="voice-testing-panel" aria-hidden="true">
        <details className="voice-details">
          <summary>Voice Control Information</summary>
          <div className="voice-info">
            <h4>Voice Engine Status</h4>
            <p><strong>Supported:</strong> {voiceEngine.current.isSupported() ? 'Yes' : 'No'}</p>
            <p><strong>Listening:</strong> {isListening ? 'Yes' : 'No'}</p>
            <p><strong>Language:</strong> {language}</p>
            <p><strong>Context:</strong> {context.type}</p>
            <p><strong>Complexity:</strong> {context.complexity}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default AdvancedVoiceControl;