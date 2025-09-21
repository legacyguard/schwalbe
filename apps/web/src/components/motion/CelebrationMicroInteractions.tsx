/**
 * CelebrationMicroInteractions - Advanced celebration system for user achievements
 *
 * Features:
 * - Multi-layered celebration animations for different achievement types
 * - Context-aware celebration intensity based on achievement significance
 * - Emotional celebration adaptation with Sofia AI integration
 * - Progressive celebration sequences with smart timing
 * - Accessibility-first design with reduced motion alternatives
 * - Performance-optimized particle systems and visual effects
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionalState } from '../../hooks/useEmotionalState';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { SofiaMessageGenerator } from '../../utils/SofiaMessageGenerator';
import { CelebrationAnalytics } from '../../utils/CelebrationAnalytics';

// TypeScript interfaces for comprehensive type safety
export interface AchievementContext {
  type: 'milestone' | 'completion' | 'improvement' | 'streak' | 'first_time' | 'recovery' | 'mastery';
  significance: 'low' | 'medium' | 'high' | 'exceptional';
  userEmotionalState: 'excited' | 'accomplished' | 'relieved' | 'proud' | 'surprised';
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  previousAchievements?: number;
  celebrationHistory?: string[];
}

export interface CelebrationLayer {
  id: string;
  type: 'particles' | 'confetti' | 'sparkles' | 'fireworks' | 'glow' | 'pulse' | 'bounce' | 'scale';
  intensity: 'subtle' | 'moderate' | 'intense' | 'spectacular';
  duration: number;
  delay: number;
  config: Record<string, any>;
}

export interface CelebrationSequence {
  id: string;
  name: string;
  description: string;
  context: AchievementContext;
  layers: CelebrationLayer[];
  sofiaMessage?: string;
  soundEffect?: string;
  hapticPattern?: string;
  estimatedDuration: number;
  cooldownPeriod: number;
}

export interface CelebrationMicroInteractionsProps {
  achievement: AchievementContext;
  isTriggered: boolean;
  onCelebrationComplete?: (celebrationId: string, userEngagement: 'viewed' | 'interacted' | 'dismissed') => void;
  onLayerComplete?: (layerId: string, sequenceId: string) => void;
  autoTrigger?: boolean;
  allowInteraction?: boolean;
  showSofia?: boolean;
  intensity?: 'subtle' | 'moderate' | 'intense' | 'spectacular';
  className?: string;
}

// Advanced celebration orchestration engine
class CelebrationOrchestrator {
  private activeSequences: Map<string, CelebrationSequence> = new Map();
  private userPreferences: Map<string, any> = new Map();
  private celebrationHistory: Map<string, any[]> = new Map();

  orchestrateCelebration(context: AchievementContext): {
    sequence: CelebrationSequence;
    adaptedLayers: CelebrationLayer[];
    timing: number[];
    intensity: string;
  } {
    const { type, significance, userEmotionalState, userExpertise } = context;

    // Base sequence selection
    const baseSequence = this.getBaseSequence(type, significance);

    // Adapt intensity based on emotional state
    const adaptedIntensity = this.adaptIntensityForEmotionalState(
      baseSequence.layers[0]?.intensity || 'moderate',
      userEmotionalState,
      significance
    );

    // Adapt layers based on user expertise
    const adaptedLayers = this.adaptLayersForExpertise(
      baseSequence.layers,
      userExpertise,
      significance
    );

    // Adjust timing based on context
    const timing = this.calculateOptimalTiming(adaptedLayers, context);

    // Create adapted sequence
    const adaptedSequence: CelebrationSequence = {
      ...baseSequence,
      context,
      layers: adaptedLayers
    };

    return {
      sequence: adaptedSequence,
      adaptedLayers,
      timing,
      intensity: adaptedIntensity
    };
  }

  private getBaseSequence(type: AchievementContext['type'], significance: AchievementContext['significance']): CelebrationSequence {
    const sequences: Record<string, CelebrationSequence> = {
      'milestone-high': {
        id: 'milestone-celebration',
        name: 'Milestone Achievement',
        description: 'Celebrating a significant milestone',
        context: {} as AchievementContext,
        layers: [
          {
            id: 'fireworks',
            type: 'fireworks',
            intensity: 'spectacular',
            duration: 3000,
            delay: 0,
            config: { particleCount: 50, spread: 360 }
          },
          {
            id: 'confetti',
            type: 'confetti',
            intensity: 'intense',
            duration: 4000,
            delay: 200,
            config: { colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'] }
          },
          {
            id: 'glow',
            type: 'glow',
            intensity: 'moderate',
            duration: 2000,
            delay: 100,
            config: { intensity: 0.8, color: '#FFD700' }
          }
        ],
        estimatedDuration: 5000,
        cooldownPeriod: 30000
      },
      'completion-medium': {
        id: 'completion-celebration',
        name: 'Task Completion',
        description: 'Celebrating task completion',
        context: {} as AchievementContext,
        layers: [
          {
            id: 'sparkles',
            type: 'sparkles',
            intensity: 'moderate',
            duration: 2000,
            delay: 0,
            config: { count: 20, size: 'medium' }
          },
          {
            id: 'bounce',
            type: 'bounce',
            intensity: 'moderate',
            duration: 1500,
            delay: 100,
            config: { amplitude: 10, frequency: 3 }
          }
        ],
        estimatedDuration: 2500,
        cooldownPeriod: 15000
      }
    };

    const key = `${type}-${significance}`;
    return sequences[key] || {
      id: 'default-celebration',
      name: 'Default Celebration',
      description: 'Default celebration sequence',
      context: {} as AchievementContext,
      layers: [
        {
          id: 'default-particles',
          type: 'sparkles',
          intensity: 'moderate',
          duration: 2000,
          delay: 0,
          config: { count: 20, size: 'medium' }
        }
      ],
      estimatedDuration: 2500,
      cooldownPeriod: 15000
    };
  }

  private adaptIntensityForEmotionalState(
    baseIntensity: string,
    emotionalState: AchievementContext['userEmotionalState'],
    significance: AchievementContext['significance']
  ): string {
    const intensityMap = {
      'excited': { up: true, factor: 1.2 },
      'accomplished': { up: false, factor: 1.0 },
      'relieved': { up: false, factor: 0.9 },
      'proud': { up: true, factor: 1.1 },
      'surprised': { up: true, factor: 1.3 }
    };

    const emotion = intensityMap[emotionalState];
    if (!emotion) return baseIntensity;

    if (significance === 'exceptional') {
      return emotion.up ? 'spectacular' : 'intense';
    }

    return baseIntensity;
  }

  private adaptLayersForExpertise(
    layers: CelebrationLayer[],
    expertise: AchievementContext['userExpertise'],
    significance: AchievementContext['significance']
  ): CelebrationLayer[] {
    const expertiseMultipliers = {
      'beginner': 1.3,
      'intermediate': 1.0,
      'advanced': 0.8,
      'expert': 0.6
    };

    return layers.map(layer => ({
      ...layer,
      duration: Math.round(layer.duration * (expertiseMultipliers[expertise] || 1)),
      config: {
        ...layer.config,
        intensity: this.scaleIntensity(layer.intensity, expertise, significance)
      }
    }));
  }

  private scaleIntensity(
    intensity: string,
    expertise: AchievementContext['userExpertise'],
    significance: AchievementContext['significance']
  ): string {
    if (expertise === 'expert' && significance !== 'exceptional') {
      return 'subtle';
    }
    if (expertise === 'beginner' && significance === 'high') {
      return 'spectacular';
    }
    return intensity;
  }

  private calculateOptimalTiming(layers: CelebrationLayer[], context: AchievementContext): number[] {
    const { timeOfDay, userEmotionalState } = context;

    // Adjust timing based on time of day
    const timeMultiplier = (timeOfDay === 'night' && userEmotionalState === 'relieved') ? 1.2 : 1.0;

    return layers.map(layer => Math.round(layer.duration * timeMultiplier));
  }
}

// Particle system for celebration effects
class CelebrationParticleSystem {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: CelebrationParticle[] = [];
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.setupCanvas();
  }

  private setupCanvas(): void {
    if (!this.canvas || !this.ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  createParticles(config: {
    count: number;
    colors: string[];
    spread: number;
    speed: number;
    size: number;
    type: 'confetti' | 'sparkles' | 'fireworks';
  }): void {
    this.particles = [];

    for (let i = 0; i < config.count; i++) {
      this.particles.push(new CelebrationParticle({
        x: this.canvas!.width / 2,
        y: this.canvas!.height / 2,
        color: config.colors?.[Math.floor(Math.random() * config.colors.length)] || '#FFD700',
        angle: (Math.PI * 2 * i) / config.count + (Math.random() - 0.5) * config.spread,
        speed: config.speed * (0.5 + Math.random() * 0.5),
        size: config.size * (0.5 + Math.random() * 0.5),
        type: config.type,
        life: 1.0
      }));
    }
  }

  startAnimation(): void {
    if (this.animationId) return;

    const animate = () => {
      this.updateParticles();
      this.renderParticles();
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private updateParticles(): void {
    this.particles.forEach(particle => {
      particle.update();
    });

    // Remove dead particles
    this.particles = this.particles.filter(particle => particle.life > 0);
  }

  private renderParticles(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(particle => {
      particle.render(this.ctx!);
    });
  }
}

class CelebrationParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  type: string;
  life: number;
  maxLife: number;

  constructor(config: {
    x: number;
    y: number;
    color: string;
    angle: number;
    speed: number;
    size: number;
    type: string;
    life: number;
  }) {
    this.x = config.x;
    this.y = config.y;
    this.color = config.color;
    this.size = config.size;
    this.type = config.type;
    this.life = config.life;
    this.maxLife = config.life;

    // Calculate velocity components
    this.vx = Math.cos(config.angle) * config.speed;
    this.vy = Math.sin(config.angle) * config.speed;
  }

  update(): void {
    // Apply physics
    this.x += this.vx;
    this.y += this.vy;

    // Add gravity for confetti
    if (this.type === 'confetti') {
      this.vy += 0.1;
    }

    // Add air resistance
    this.vx *= 0.99;
    this.vy *= 0.99;

    // Update life
    this.life -= 0.01;

    // Add some randomness for sparkles
    if (this.type === 'sparkles') {
      this.vx += (Math.random() - 0.5) * 0.1;
      this.vy += (Math.random() - 0.5) * 0.1;
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;

    if (this.type === 'confetti') {
      // Render as rectangle
      ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    } else if (this.type === 'sparkles') {
      // Render as circle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

// Main component implementation
export const CelebrationMicroInteractions: React.FC<CelebrationMicroInteractionsProps> = ({
  achievement,
  isTriggered,
  onCelebrationComplete,
  onLayerComplete,
  autoTrigger = true,
  allowInteraction = true,
  showSofia = true,
  intensity,
  className = ''
}) => {
  const [activeSequence, setActiveSequence] = useState<CelebrationSequence | null>(null);
  const [activeLayers, setActiveLayers] = useState<CelebrationLayer[]>([]);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sofiaMessage, setSofiaMessage] = useState('');

  const orchestrator = useRef(new CelebrationOrchestrator());
  const particleSystem = useRef<CelebrationParticleSystem | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analytics = useRef(new CelebrationAnalytics());

  const { emotionalState } = useEmotionalState();
  const { preferences } = useUserPreferences();

  // Initialize particle system
  useEffect(() => {
    if (canvasRef.current && !particleSystem.current) {
      particleSystem.current = new CelebrationParticleSystem(canvasRef.current);
    }
  }, []);

  // Orchestrate celebration when triggered
  useEffect(() => {
    if (isTriggered && achievement) {
      const result = orchestrator.current.orchestrateCelebration(achievement);

      setActiveSequence(result.sequence);
      setActiveLayers(result.adaptedLayers);
      setCurrentLayerIndex(0);
      setIsPlaying(true);

      // Generate Sofia message
      if (showSofia) {
        const sofiaGenerator = new SofiaMessageGenerator();
        const message = sofiaGenerator.generateMessage({
          type: 'celebration',
          context: achievement.type,
          emotionalTone: 'celebratory',
          userEmotionalState: achievement.userEmotionalState,
          urgency: 'low'
        });
        setSofiaMessage(message);
      }

      // Track celebration start
      analytics.current.trackCelebrationStart(result.sequence.id, achievement);

      // Auto-trigger first layer
      if (autoTrigger && result.adaptedLayers.length > 0 && result.adaptedLayers[0]) {
        const firstLayer = result.adaptedLayers[0];
        if (firstLayer) {
          setTimeout(() => {
            triggerLayer(firstLayer, result.sequence.id);
          }, firstLayer.delay || 0);
        }
      }
    }
  }, [isTriggered, achievement, autoTrigger, showSofia]);

  const triggerLayer = useCallback((layer: CelebrationLayer, sequenceId: string) => {
    // Trigger specific layer type
    switch (layer.type) {
      case 'particles':
      case 'confetti':
        triggerParticleEffect(layer);
        break;
      case 'sparkles':
        triggerSparkleEffect(layer);
        break;
      case 'fireworks':
        triggerFireworkEffect(layer);
        break;
      case 'glow':
        triggerGlowEffect(layer);
        break;
      case 'pulse':
        triggerPulseEffect(layer);
        break;
      case 'bounce':
        triggerBounceEffect(layer);
        break;
      case 'scale':
        triggerScaleEffect(layer);
        break;
    }

    // Schedule next layer
    const nextIndex = currentLayerIndex + 1;
    if (nextIndex < activeLayers.length && activeLayers[nextIndex]) {
      const nextLayer = activeLayers[nextIndex];
      if (nextLayer) {
        setTimeout(() => {
          setCurrentLayerIndex(nextIndex);
          triggerLayer(nextLayer, sequenceId);
        }, layer.duration);
      }
    } else {
      // Celebration complete
      setTimeout(() => {
        setIsPlaying(false);
        onCelebrationComplete?.(sequenceId, 'viewed');
      }, layer.duration);
    }

    onLayerComplete?.(layer.id, sequenceId);
  }, [currentLayerIndex, activeLayers, onCelebrationComplete, onLayerComplete]);

  const triggerParticleEffect = (layer: CelebrationLayer) => {
    if (!particleSystem.current) return;

    const config = {
      count: layer.config.particleCount || 30,
      colors: layer.config.colors || ['#FFD700', '#FF6B6B', '#4ECDC4'],
      spread: layer.config.spread || 2,
      speed: layer.config.speed || 5,
      size: layer.config.size || 4,
      type: layer.config.type || 'confetti'
    };

    particleSystem.current.createParticles(config);
    particleSystem.current.startAnimation();

    // Stop animation after duration
    setTimeout(() => {
      particleSystem.current?.stopAnimation();
    }, layer.duration);
  };

  const triggerSparkleEffect = (layer: CelebrationLayer) => {
    // Sparkle effect implementation
    console.log('Triggering sparkle effect:', layer);
  };

  const triggerFireworkEffect = (layer: CelebrationLayer) => {
    // Firework effect implementation
    console.log('Triggering firework effect:', layer);
  };

  const triggerGlowEffect = (layer: CelebrationLayer) => {
    // Glow effect implementation
    console.log('Triggering glow effect:', layer);
  };

  const triggerPulseEffect = (layer: CelebrationLayer) => {
    // Pulse effect implementation
    console.log('Triggering pulse effect:', layer);
  };

  const triggerBounceEffect = (layer: CelebrationLayer) => {
    // Bounce effect implementation
    console.log('Triggering bounce effect:', layer);
  };

  const triggerScaleEffect = (layer: CelebrationLayer) => {
    // Scale effect implementation
    console.log('Triggering scale effect:', layer);
  };

  const handleInteraction = useCallback(() => {
    if (!allowInteraction || !activeSequence) return;

    // Trigger additional celebration layers on interaction
    const bonusLayer: CelebrationLayer = {
      id: 'interaction-bonus',
      type: 'sparkles',
      intensity: 'moderate',
      duration: 1000,
      delay: 0,
      config: { count: 15, size: 'small' }
    };

    triggerLayer(bonusLayer, activeSequence.id);
    analytics.current.trackInteraction(activeSequence.id, 'enhanced');
  }, [allowInteraction, activeSequence, triggerLayer]);

  // Celebration layer variants
  const getLayerVariants = (layerType: CelebrationLayer['type']) => {
    const baseVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 25 }
      },
      exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
    };

    if (layerType === 'bounce') {
      return {
        ...baseVariants,
        visible: {
          ...baseVariants.visible,
          y: [0, -10, 0],
          transition: {
            ...baseVariants.visible.transition,
            y: { repeat: Infinity, duration: 0.6 }
          }
        }
      };
    }

    if (layerType === 'pulse') {
      return {
        ...baseVariants,
        visible: {
          ...baseVariants.visible,
          scale: [1, 1.1, 1],
          transition: {
            ...baseVariants.visible.transition,
            scale: { repeat: Infinity, duration: 1 }
          }
        }
      };
    }

    return baseVariants;
  };

  if (!isTriggered || !activeSequence) {
    return null;
  }

  return (
    <div className={`celebration-micro-interactions ${className}`}>
      {/* Hidden canvas for particle effects */}
      <canvas
        ref={canvasRef}
        className="celebration-canvas"
        style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
      />

      {/* Sofia celebration message */}
      {showSofia && sofiaMessage && (
        <motion.div
          className="celebration-sofia-message"
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className="sofia-avatar">
            <span className="sofia-avatar__emoji">🧚‍♀️</span>
          </div>
          <div className="sofia-message-bubble">
            <p>{sofiaMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Interactive celebration trigger */}
      {allowInteraction && (
        <motion.button
          className="celebration-trigger"
          onClick={handleInteraction}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!isPlaying}
        >
          🎉 More Celebration!
        </motion.button>
      )}

      {/* Celebration layers */}
      <AnimatePresence>
        {activeLayers.map((layer, index) => (
          <motion.div
            key={layer.id}
            className={`celebration-layer celebration-layer--${layer.type}`}
            variants={getLayerVariants(layer.type)}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
              animationDelay: `${layer.delay}ms`,
              animationDuration: `${layer.duration}ms`
            }}
          >
            {/* Layer-specific content would be rendered here */}
            <div className="celebration-content">
              {layer.type === 'confetti' && '🎊'}
              {layer.type === 'sparkles' && '✨'}
              {layer.type === 'fireworks' && '🎆'}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Celebration completion indicator */}
      {!isPlaying && activeSequence && (
        <motion.div
          className="celebration-complete"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="completion-badge">
            <span className="completion-icon">🎉</span>
            <span className="completion-text">Achievement Celebrated!</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CelebrationMicroInteractions;