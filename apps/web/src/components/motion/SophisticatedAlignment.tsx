import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { config } from '@/lib/env';

// Sophisticated alignment configuration interface
export interface AlignmentConfig {
  id: string;
  name: string;
  description: string;
  type: 'optical' | 'mathematical' | 'contextual' | 'emotional' | 'adaptive' | 'hybrid';
  method: 'baseline' | 'center' | 'edge' | 'flow' | 'rhythm' | 'harmony' | 'contrast' | 'balance';
  precision: 'pixel' | 'subpixel' | 'fluid' | 'responsive' | 'adaptive';
  context: 'typography' | 'layout' | 'visual' | 'interactive' | 'emotional' | 'universal';
  adaptation: 'static' | 'reactive' | 'predictive' | 'intelligent' | 'emotional';
  constraints: {
    minAlignment?: number;
    maxAlignment?: number;
    preferredRatio?: number;
    avoidRatios?: number[];
    harmonyRatios?: number[];
  };
  aesthetics: {
    visualWeight: number;
    rhythm: number;
    balance: number;
    contrast: number;
    flow: number;
    harmony: number;
  };
}

export interface AlignmentElement {
  id: string;
  content: React.ReactNode;
  type: 'text' | 'icon' | 'image' | 'button' | 'card' | 'container' | 'decoration';
  priority: 'background' | 'supporting' | 'featured' | 'hero' | 'accent';
  size: 'compact' | 'normal' | 'prominent' | 'dominant' | 'adaptive';
  position: 'edge' | 'center' | 'offset' | 'corner' | 'floating' | 'contextual';
  alignment: {
    horizontal: 'left' | 'center' | 'right' | 'justify' | 'distributed' | 'optical';
    vertical: 'top' | 'center' | 'bottom' | 'baseline' | 'optical' | 'distributed';
    optical?: {
      xOffset?: number;
      yOffset?: number;
      rotation?: number;
      scale?: number;
    };
  };
  context: {
    importance: number;
    urgency: number;
    complexity: number;
    emotionalWeight: number;
    userPreference: number;
    situationalRelevance: number;
  };
  metadata?: Record<string, any>;
}

export interface SophisticatedAlignmentProps {
  config: AlignmentConfig;
  elements: AlignmentElement[];
  children?: React.ReactNode;
  containerWidth?: number;
  containerHeight?: number;
  enableOptical?: boolean;
  enableContextual?: boolean;
  enableEmotional?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onAlignmentChange?: (alignment: AlignmentResult, config: AlignmentConfig) => void;
  onOpticalAdjustment?: (adjustment: OpticalAdjustment, elementId: string) => void;
  onHarmonyChange?: (harmony: HarmonyScore, elements: string[]) => void;
}

export interface AlignmentResult {
  elements: Map<string, AlignmentPosition>;
  harmony: HarmonyScore;
  rhythm: RhythmScore;
  balance: BalanceScore;
  opticalAdjustments: OpticalAdjustment[];
  contextualFactors: ContextualFactors;
  recommendations: string[];
}

export interface AlignmentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  zIndex: number;
  opticalX?: number;
  opticalY?: number;
  baseline?: number;
  centerX?: number;
  centerY?: number;
}

export interface OpticalAdjustment {
  elementId: string;
  type: 'x-offset' | 'y-offset' | 'rotation' | 'scale' | 'baseline';
  value: number;
  reason: string;
  confidence: number;
  alternatives: Array<{ value: number; confidence: number; reason: string }>;
}

export interface HarmonyScore {
  overall: number;
  components: {
    visual: number;
    rhythm: number;
    balance: number;
    contrast: number;
    flow: number;
  };
  suggestions: string[];
  improvements: string[];
}

export interface RhythmScore {
  consistency: number;
  flow: number;
  predictability: number;
  naturalness: number;
  suggestions: string[];
}

export interface BalanceScore {
  visual: number;
  semantic: number;
  emotional: number;
  contextual: number;
  suggestions: string[];
}

export interface ContextualFactors {
  userExperience: number;
  contentComplexity: number;
  emotionalState: number;
  deviceCapabilities: number;
  accessibility: number;
}

// Optical profile interface
export interface OpticalProfile {
  id: string;
  baseline: number;
  xHeight: number;
  capHeight: number;
  ascenderHeight: number;
  descenderHeight: number;
  visualCenter: number;
  adjustments: OpticalAdjustment[];
}

// Advanced alignment engine
export class SophisticatedAlignmentEngine {
  private static alignmentHistory: Map<string, AlignmentResult[]> = new Map();
  private static opticalProfiles: Map<string, OpticalProfile> = new Map();

  static calculateOptimalAlignment(
    config: AlignmentConfig,
    containerWidth: number,
    containerHeight: number,
    elements: AlignmentElement[]
  ): AlignmentResult {
    // Calculate base positions
    const basePositions = this.calculateBasePositions(
      config,
      containerWidth,
      containerHeight,
      elements
    );

    // Apply optical adjustments
    const opticalPositions = this.applyOpticalAdjustments(
      basePositions,
      elements,
      config
    );

    // Apply contextual alignment
    const contextualPositions = this.applyContextualAlignment(
      opticalPositions,
      elements,
      config
    );

    // Calculate harmony scores
    const harmony = this.calculateHarmonyScore(
      contextualPositions,
      elements,
      config
    );

    // Calculate rhythm scores
    const rhythm = this.calculateRhythmScore(
      contextualPositions,
      elements,
      config
    );

    // Calculate balance scores
    const balance = this.calculateBalanceScore(
      contextualPositions,
      elements,
      config
    );

    // Generate optical adjustments
    const opticalAdjustments = this.generateOpticalAdjustments(
      elements,
      config
    );

    // Analyze contextual factors
    const contextualFactors = this.analyzeContextualFactors(
      elements,
      config
    );

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      harmony,
      rhythm,
      balance,
      config
    );

    return {
      elements: contextualPositions,
      harmony,
      rhythm,
      balance,
      opticalAdjustments,
      contextualFactors,
      recommendations,
    };
  }

  private static calculateBasePositions(
    config: AlignmentConfig,
    containerWidth: number,
    containerHeight: number,
    elements: AlignmentElement[]
  ): Map<string, AlignmentPosition> {
    const positions = new Map<string, AlignmentPosition>();
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    elements.forEach((element, index) => {
      const baseX = this.getBaseX(element, containerWidth, config, elements, index);
      const baseY = this.getBaseY(element, containerHeight, config, elements, index);

      positions.set(element.id, {
        x: baseX,
        y: baseY,
        width: this.getElementWidth(element, config),
        height: this.getElementHeight(element, config),
        rotation: 0,
        scale: 1.0,
        zIndex: index + 1,
      });
    });

    return positions;
  }

  private static getBaseX(
    element: AlignmentElement,
    containerWidth: number,
    config: AlignmentConfig,
    elements: AlignmentElement[],
    index: number
  ): number {
    switch (element.alignment.horizontal) {
      case 'left': return 0;
      case 'center': return containerWidth / 2;
      case 'right': return containerWidth;
      case 'justify': return 0; // Will be distributed
      case 'distributed': return (containerWidth / (elements.length + 1)) * (index + 1);
      case 'optical': return this.calculateOpticalX(element, containerWidth, config);
      default: return 0;
    }
  }

  private static getBaseY(
    element: AlignmentElement,
    containerHeight: number,
    config: AlignmentConfig,
    elements: AlignmentElement[],
    index: number
  ): number {
    switch (element.alignment.vertical) {
      case 'top': return 0;
      case 'center': return containerHeight / 2;
      case 'bottom': return containerHeight;
      case 'baseline': return this.calculateBaseline(element, config);
      case 'optical': return this.calculateOpticalY(element, containerHeight, config);
      case 'distributed': return (containerHeight / (elements.length + 1)) * (index + 1);
      default: return 0;
    }
  }

  private static calculateOpticalX(
    element: AlignmentElement,
    containerWidth: number,
    config: AlignmentConfig
  ): number {
    // Optical alignment considers visual weight and content
    const visualWeight = this.getVisualWeight(element);
    const centerBias = element.context.importance * 0.3;
    const contentBias = element.type === 'text' ? 0.1 : 0.2;

    return (containerWidth * (0.5 + centerBias + contentBias)) * visualWeight;
  }

  private static calculateOpticalY(
    element: AlignmentElement,
    containerHeight: number,
    config: AlignmentConfig
  ): number {
    // Optical alignment considers baseline and visual center
    const baseline = this.calculateBaseline(element, config);
    const visualCenter = this.getVisualCenter(element);

    return baseline + visualCenter;
  }

  private static calculateBaseline(
    element: AlignmentElement,
    config: AlignmentConfig
  ): number {
    // Calculate typographic baseline
    const fontSize = this.getFontSize(element);
    const lineHeight = fontSize * 1.2; // Standard line height
    const baselineShift = fontSize * 0.15; // Typical baseline offset

    return baselineShift;
  }

  private static getVisualWeight(element: AlignmentElement): number {
    // Calculate visual weight based on element properties
    let weight = 0.5; // Base weight

    // Size contribution
    switch (element.size) {
      case 'compact': weight *= 0.7; break;
      case 'normal': weight *= 1.0; break;
      case 'prominent': weight *= 1.3; break;
      case 'dominant': weight *= 1.6; break;
      case 'adaptive': weight *= 1.2; break;
    }

    // Priority contribution
    switch (element.priority) {
      case 'background': weight *= 0.3; break;
      case 'supporting': weight *= 0.7; break;
      case 'featured': weight *= 1.2; break;
      case 'hero': weight *= 1.5; break;
      case 'accent': weight *= 1.1; break;
    }

    // Context contribution
    weight *= (1 + element.context.importance * 0.5);

    return Math.max(0.1, Math.min(2.0, weight));
  }

  private static getVisualCenter(element: AlignmentElement): number {
    // Calculate visual center based on element type
    switch (element.type) {
      case 'text': return 0; // Text aligns to baseline
      case 'icon': return 0.1; // Icons are slightly above center
      case 'image': return 0; // Images align to center
      case 'button': return -0.05; // Buttons slightly below center
      case 'card': return 0; // Cards align to center
      case 'container': return 0; // Containers align to center
      case 'decoration': return 0.2; // Decorations above center
      default: return 0;
    }
  }

  private static getElementWidth(
    element: AlignmentElement,
    config: AlignmentConfig
  ): number {
    // Calculate element width based on type and context
    const baseWidth = 100; // Base unit

    switch (element.size) {
      case 'compact': return baseWidth * 0.7;
      case 'normal': return baseWidth;
      case 'prominent': return baseWidth * 1.4;
      case 'dominant': return baseWidth * 2.0;
      case 'adaptive': return baseWidth * 1.2;
      default: return baseWidth;
    }
  }

  private static getElementHeight(
    element: AlignmentElement,
    config: AlignmentConfig
  ): number {
    // Calculate element height based on type and context
    const baseHeight = 40; // Base unit

    switch (element.size) {
      case 'compact': return baseHeight * 0.7;
      case 'normal': return baseHeight;
      case 'prominent': return baseHeight * 1.4;
      case 'dominant': return baseHeight * 2.0;
      case 'adaptive': return baseHeight * 1.2;
      default: return baseHeight;
    }
  }

  private static getFontSize(element: AlignmentElement): number {
    // Get font size based on element type and importance
    const baseSize = 16; // Base font size

    if (element.type !== 'text') return baseSize;

    const importance = element.context.importance;
    const urgency = element.context.urgency;

    return baseSize * (1 + importance * 0.5 + urgency * 0.3);
  }

  private static applyOpticalAdjustments(
    positions: Map<string, AlignmentPosition>,
    elements: AlignmentElement[],
    config: AlignmentConfig
  ): Map<string, AlignmentPosition> {
    const adjustedPositions = new Map(positions);

    elements.forEach(element => {
      const position = adjustedPositions.get(element.id);
      if (!position) return;

      if (element.alignment.optical) {
        const optical = element.alignment.optical;

        position.x += optical.xOffset || 0;
        position.y += optical.yOffset || 0;
        position.rotation = optical.rotation || 0;
        position.scale = optical.scale || 1.0;
      }
    });

    return adjustedPositions;
  }

  private static applyContextualAlignment(
    positions: Map<string, AlignmentPosition>,
    elements: AlignmentElement[],
    config: AlignmentConfig
  ): Map<string, AlignmentPosition> {
    const adjustedPositions = new Map(positions);

    // Apply contextual adjustments based on element relationships
    elements.forEach(element => {
      const position = adjustedPositions.get(element.id);
      if (!position) return;

      // Adjust based on neighboring elements
      const neighbors = this.findNeighboringElements(element, elements, positions);
      if (neighbors.length > 0) {
        const neighborPositions = neighbors.map(n => positions.get(n.id)).filter(Boolean) as AlignmentPosition[];
        const avgNeighborX = neighborPositions.length > 0
          ? neighborPositions.reduce((sum, pos) => sum + pos.x, 0) / neighborPositions.length
          : 0;
        const avgNeighborY = neighborPositions.length > 0
          ? neighborPositions.reduce((sum, pos) => sum + pos.y, 0) / neighborPositions.length
          : 0;

        // Apply subtle alignment to neighbors
        position.x = position.x * 0.7 + avgNeighborX * 0.3;
        position.y = position.y * 0.7 + avgNeighborY * 0.3;
      }
    });

    return adjustedPositions;
  }

  private static findNeighboringElements(
    element: AlignmentElement,
    allElements: AlignmentElement[],
    positions: Map<string, AlignmentPosition>
  ): AlignmentElement[] {
    const elementPos = positions.get(element.id);
    if (!elementPos) return [];

    const neighbors: AlignmentElement[] = [];
    const threshold = 150; // Distance threshold

    allElements.forEach(other => {
      if (other.id === element.id) return;

      const otherPos = positions.get(other.id);
      if (!otherPos) return;

      const distance = Math.sqrt(
        Math.pow(elementPos.x - otherPos.x, 2) +
        Math.pow(elementPos.y - otherPos.y, 2)
      );

      if (distance < threshold) {
        neighbors.push(other);
      }
    });

    return neighbors;
  }

  private static calculateHarmonyScore(
    positions: Map<string, AlignmentPosition>,
    elements: AlignmentElement[],
    config: AlignmentConfig
  ): HarmonyScore {
    // Calculate overall harmony based on alignment quality
    const visualScore = this.calculateVisualHarmony(positions, elements);
    const rhythmScore = this.calculateRhythmHarmony(positions, elements);
    const balanceScore = this.calculateBalanceHarmony(positions, elements);
    const contrastScore = this.calculateContrastHarmony(positions, elements);
    const flowScore = this.calculateFlowHarmony(positions, elements);

    const overall = (visualScore + rhythmScore + balanceScore + contrastScore + flowScore) / 5;

    const suggestions = this.generateHarmonySuggestions(
      visualScore, rhythmScore, balanceScore, contrastScore, flowScore
    );

    const improvements = this.generateHarmonyImprovements(
      visualScore, rhythmScore, balanceScore, contrastScore, flowScore
    );

    return {
      overall,
      components: {
        visual: visualScore,
        rhythm: rhythmScore,
        balance: balanceScore,
        contrast: contrastScore,
        flow: flowScore,
      },
      suggestions,
      improvements,
    };
  }

  private static calculateVisualHarmony(
    positions: Map<string, AlignmentPosition>,
    elements: AlignmentElement[]
  ): number {
    // Calculate visual harmony based on alignment consistency
    let harmony = 1.0;

    // Check for consistent spacing
    const xPositions = Array.from(positions.values()).map(p => p.x);
    const yPositions = Array.from(positions.values()).map(p => p.y);

    const xVariance = this.calculateVariance(xPositions);
    const yVariance = this.calculateVariance(yPositions);

    harmony *= (1 - Math.min(xVariance, yVariance) / 1000);

    return Math.max(0, Math.min(1, harmony));
  }

  private static calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private static calculateRhythmHarmony(
    positions: Map<string, AlignmentPosition>,
    elements: AlignmentElement[]
  ): number {
    // Calculate rhythm harmony based on spacing patterns
    const sortedX = Array.from(positions.values())
      .map(p => p.x)
      .sort((a, b) => a - b);

    const sortedY = Array.from(positions.values())
      .map(p => p.y)
      .sort((a, b) => a - b);

    const xRhythm = this.analyzeRhythm(sortedX);
    const yRhythm = this.analyzeRhythm(sortedY);

    return (xRhythm + yRhythm) / 2;
  }

  private static analyzeRhythm(positions: number[]): number {
    if (positions.length < 2) return 1.0;

    const intervals: number[] = [];
    for (let i = 1; i < positions.length; i++) {
      const current = positions[i];
      const previous = positions[i - 1];
      if (current !== undefined && previous !== undefined) {
        intervals.push(current - previous);
      }
    }

    const avgInterval = intervals.reduce((sum, int) => sum + int, 0) / intervals.length;
    const intervalVariance = this.calculateVariance(intervals);

    // Lower variance indicates better rhythm
    const rhythmScore = 1 - (intervalVariance / (avgInterval * avgInterval));

    return Math.max(0, Math.min(1, rhythmScore));
  }

  private static calculateBalanceHarmony(
    positions: Map<string, AlignmentPosition>,
    elements: AlignmentElement[]
  ): number {
    // Calculate balance harmony based on visual weight distribution
    const centerX = positions.size > 0 ?
      Array.from(positions.values()).reduce((sum, p) => sum + p.x, 0) / positions.size : 0;
    const centerY = positions.size > 0 ?
      Array.from(positions.values()).reduce((sum, p) => sum + p.y, 0) / positions.size : 0;

    let balanceScore = 1.0;

    elements.forEach(element => {
      const position = positions.get(element.id);
      if (!position) return;

      const visualWeight = this.getVisualWeight(element);
      const distanceFromCenter = Math.sqrt(
        Math.pow(position.x - centerX, 2) + Math.pow(position.y - centerY, 2)
      );

      // Heavily weighted elements should be closer to center
      const expectedDistance = visualWeight * 50;
      const distanceScore = 1 - Math.min(distanceFromCenter / expectedDistance, 1);

      balanceScore *= distanceScore;
    });

    return Math.max(0, balanceScore);
  }

  private static calculateContrastHarmony(
    positions: Map<string, AlignmentPosition>,
    elements: AlignmentElement[]
  ): number {
    // Calculate contrast harmony based on element spacing and size differences
    let contrastScore = 1.0;

    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const pos1 = positions.get(elements[i]!.id);
        const pos2 = positions.get(elements[j]!.id);

        if (!pos1 || !pos2) continue;

        const distance = Math.sqrt(
          Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
        );

        const size1 = pos1.width * pos1.height;
        const size2 = pos2.width * pos2.height;
        const sizeRatio = Math.max(size1, size2) / Math.min(size1, size2);

        // Optimal contrast when elements are neither too close nor too far
        const optimalDistance = Math.sqrt(size1) + Math.sqrt(size2);
        const distanceScore = 1 - Math.abs(distance - optimalDistance) / optimalDistance;

        // Size contrast should be moderate
        const sizeContrastScore = 1 - Math.min(sizeRatio - 1, 2) / 2;

        contrastScore *= (distanceScore + sizeContrastScore) / 2;
      }
    }

    return Math.max(0, contrastScore);
  }

  private static calculateFlowHarmony(
    positions: Map<string, AlignmentPosition>,
    elements: AlignmentElement[]
  ): number {
    // Calculate flow harmony based on reading patterns and visual hierarchy
    const sortedByY = Array.from(positions.entries())
      .sort(([,a], [,b]) => a.y - b.y);

    const sortedByX = Array.from(positions.entries())
      .sort(([,a], [,b]) => a.x - b.x);

    // Check for logical reading order
    const yOrderScore = this.calculateReadingOrderScore(sortedByY, elements);
    const xOrderScore = this.calculateReadingOrderScore(sortedByX, elements);

    return (yOrderScore + xOrderScore) / 2;
  }

  private static calculateReadingOrderScore(
    sortedPositions: Array<[string, AlignmentPosition]>,
    elements: AlignmentElement[]
  ): number {
    // Calculate how well elements follow reading order
    let score = 1.0;

    for (let i = 0; i < sortedPositions.length - 1; i++) {
      const currentElement = elements.find(e => e.id === sortedPositions[i]![0]);
      const nextElement = elements.find(e => e.id === sortedPositions[i + 1]![0]);

      if (!currentElement || !nextElement) continue;

      // Higher priority elements should come first
      if (currentElement.priority !== nextElement.priority) {
        const priorityOrder = ['background', 'supporting', 'featured', 'hero', 'accent'];
        const currentIndex = priorityOrder.indexOf(currentElement.priority);
        const nextIndex = priorityOrder.indexOf(nextElement.priority);

        if (currentIndex > nextIndex) {
          score *= 0.9; // Penalty for wrong priority order
        }
      }
    }

    return score;
  }

  private static generateHarmonySuggestions(
    visual: number,
    rhythm: number,
    balance: number,
    contrast: number,
    flow: number
  ): string[] {
    const suggestions: string[] = [];

    if (visual < 0.7) {
      suggestions.push('Improve visual alignment consistency');
    }

    if (rhythm < 0.7) {
      suggestions.push('Establish more consistent spacing rhythm');
    }

    if (balance < 0.7) {
      suggestions.push('Balance visual weight distribution');
    }

    if (contrast < 0.7) {
      suggestions.push('Adjust element spacing and sizing for better contrast');
    }

    if (flow < 0.7) {
      suggestions.push('Improve reading flow and visual hierarchy');
    }

    return suggestions;
  }

  private static generateHarmonyImprovements(
    visual: number,
    rhythm: number,
    balance: number,
    contrast: number,
    flow: number
  ): string[] {
    const improvements: string[] = [];

    if (visual < 0.5) {
      improvements.push('Apply optical alignment adjustments');
    }

    if (rhythm < 0.5) {
      improvements.push('Use consistent grid system');
    }

    if (balance < 0.5) {
      improvements.push('Redistribute visual weight');
    }

    if (contrast < 0.5) {
      improvements.push('Increase spacing between elements');
    }

    if (flow < 0.5) {
      improvements.push('Reorder elements for better hierarchy');
    }

    return improvements;
  }

  private static calculateRhythmScore(
    positions: Map<string, AlignmentPosition>,
    elements: AlignmentElement[],
    config: AlignmentConfig
  ): RhythmScore {
    // Calculate rhythm based on spacing patterns
    const consistency = this.calculateRhythmHarmony(positions, elements);
    const flow = this.calculateFlowHarmony(positions, elements);
    const predictability = consistency * 0.8 + flow * 0.2;
    const naturalness = consistency * 0.6 + flow * 0.4;

    const suggestions = this.generateRhythmSuggestions(consistency, flow, predictability, naturalness);

    return {
      consistency,
      flow,
      predictability,
      naturalness,
      suggestions,
    };
  }

  private static generateRhythmSuggestions(
    consistency: number,
    flow: number,
    predictability: number,
    naturalness: number
  ): string[] {
    const suggestions: string[] = [];

    if (consistency < 0.7) {
      suggestions.push('Establish consistent vertical spacing');
    }

    if (flow < 0.7) {
      suggestions.push('Create better visual flow between elements');
    }

    if (predictability < 0.7) {
      suggestions.push('Use predictable spacing patterns');
    }

    if (naturalness < 0.7) {
      suggestions.push('Apply natural reading rhythm');
    }

    return suggestions;
  }

  private static calculateBalanceScore(
    positions: Map<string, AlignmentPosition>,
    elements: AlignmentElement[],
    config: AlignmentConfig
  ): BalanceScore {
    // Calculate balance based on visual weight distribution
    const visual = this.calculateBalanceHarmony(positions, elements);
    const semantic = this.calculateSemanticBalance(elements);
    const emotional = this.calculateEmotionalBalance(elements);
    const contextual = this.calculateContextualBalance(elements, config);

    const suggestions = this.generateBalanceSuggestions(visual, semantic, emotional, contextual);

    return {
      visual,
      semantic,
      emotional,
      contextual,
      suggestions,
    };
  }

  private static calculateSemanticBalance(elements: AlignmentElement[]): number {
    // Calculate semantic balance based on content importance
    const priorityWeights = {
      'background': 0.1,
      'supporting': 0.3,
      'featured': 0.6,
      'hero': 0.9,
      'accent': 0.5,
    };

    let totalWeight = 0;
    let weightedSum = 0;

    elements.forEach(element => {
      const weight = priorityWeights[element.priority] || 0.5;
      totalWeight += weight;
      weightedSum += weight * element.context.importance;
    });

    const averageImportance = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    return 1 - Math.abs(averageImportance - 0.5) * 2; // Optimal at 0.5
  }

  private static calculateEmotionalBalance(elements: AlignmentElement[]): number {
    // Calculate emotional balance based on emotional weight distribution
    const totalEmotionalWeight = elements.reduce((sum, el) => sum + el.context.emotionalWeight, 0);
    const averageEmotionalWeight = totalEmotionalWeight / elements.length;

    // Balance is best when emotional weights are moderately distributed
    return 1 - Math.abs(averageEmotionalWeight - 0.5) * 2;
  }

  private static calculateContextualBalance(
    elements: AlignmentElement[],
    config: AlignmentConfig
  ): number {
    // Calculate contextual balance based on situational relevance
    const totalRelevance = elements.reduce((sum, el) => sum + el.context.situationalRelevance, 0);
    const averageRelevance = totalRelevance / elements.length;

    return 1 - Math.abs(averageRelevance - 0.6) * 2; // Optimal at 0.6
  }

  private static generateBalanceSuggestions(
    visual: number,
    semantic: number,
    emotional: number,
    contextual: number
  ): string[] {
    const suggestions: string[] = [];

    if (visual < 0.7) {
      suggestions.push('Redistribute visual weight for better balance');
    }

    if (semantic < 0.7) {
      suggestions.push('Balance content importance hierarchy');
    }

    if (emotional < 0.7) {
      suggestions.push('Distribute emotional weight more evenly');
    }

    if (contextual < 0.7) {
      suggestions.push('Adjust situational relevance distribution');
    }

    return suggestions;
  }

  private static generateOpticalAdjustments(
    elements: AlignmentElement[],
    config: AlignmentConfig
  ): OpticalAdjustment[] {
    const adjustments: OpticalAdjustment[] = [];

    elements.forEach(element => {
      if (element.type === 'text') {
        // Text elements benefit from baseline optical adjustments
        adjustments.push({
          elementId: element.id,
          type: 'baseline',
          value: -2, // Slight baseline adjustment
          reason: 'Text baseline optical alignment',
          confidence: 0.8,
          alternatives: [
            { value: -1, confidence: 0.6, reason: 'Minimal baseline adjustment' },
            { value: -3, confidence: 0.7, reason: 'Stronger baseline adjustment' },
          ],
        });
      }

      if (element.priority === 'hero' || element.priority === 'featured') {
        // Important elements benefit from center optical adjustments
        adjustments.push({
          elementId: element.id,
          type: 'x-offset',
          value: 1, // Slight center adjustment
          reason: 'Hero element optical centering',
          confidence: 0.7,
          alternatives: [
            { value: 0, confidence: 0.5, reason: 'No center adjustment' },
            { value: 2, confidence: 0.6, reason: 'Stronger center adjustment' },
          ],
        });
      }
    });

    return adjustments;
  }

  private static analyzeContextualFactors(
    elements: AlignmentElement[],
    config: AlignmentConfig
  ): ContextualFactors {
    // Analyze various contextual factors affecting alignment
    const userExperience = this.calculateUserExperienceFactor(elements);
    const contentComplexity = this.calculateContentComplexityFactor(elements);
    const emotionalState = this.calculateEmotionalStateFactor(elements);
    const deviceCapabilities = this.calculateDeviceCapabilitiesFactor();
    const accessibility = this.calculateAccessibilityFactor(elements);

    return {
      userExperience,
      contentComplexity,
      emotionalState,
      deviceCapabilities,
      accessibility,
    };
  }

  private static calculateUserExperienceFactor(elements: AlignmentElement[]): number {
    // Calculate user experience factor based on element complexity
    const complexity = elements.reduce((sum, el) => sum + el.context.complexity, 0) / elements.length;
    return 1 - (complexity - 0.5) * 0.5; // Optimal at moderate complexity
  }

  private static calculateContentComplexityFactor(elements: AlignmentElement[]): number {
    // Calculate content complexity factor
    const textElements = elements.filter(el => el.type === 'text').length;
    const complexElements = elements.filter(el => el.context.complexity > 0.7).length;

    return Math.min(1, (textElements * 0.1 + complexElements * 0.2) / elements.length);
  }

  private static calculateEmotionalStateFactor(elements: AlignmentElement[]): number {
    // Calculate emotional state factor based on emotional weight
    const emotionalWeight = elements.reduce((sum, el) => sum + el.context.emotionalWeight, 0) / elements.length;
    return 1 - Math.abs(emotionalWeight - 0.5) * 2; // Optimal at moderate emotional weight
  }

  private static calculateDeviceCapabilitiesFactor(): number {
    // Calculate device capabilities factor
    const hasTouch = 'ontouchstart' in window;
    const hasHighDPI = window.devicePixelRatio > 1;
    const hasAdvancedCSS = CSS.supports('display', 'grid');

    let score = 0.5; // Base score

    if (hasTouch) score += 0.1;
    if (hasHighDPI) score += 0.2;
    if (hasAdvancedCSS) score += 0.2;

    return Math.min(1, score);
  }

  private static calculateAccessibilityFactor(elements: AlignmentElement[]): number {
    // Calculate accessibility factor based on element properties
    const hasText = elements.some(el => el.type === 'text');
    const hasIcons = elements.some(el => el.type === 'icon');
    const hasButtons = elements.some(el => el.type === 'button');

    let score = 0.5; // Base score

    if (hasText) score += 0.2;
    if (hasIcons) score += 0.1;
    if (hasButtons) score += 0.2;

    return score;
  }

  private static generateRecommendations(
    harmony: HarmonyScore,
    rhythm: RhythmScore,
    balance: BalanceScore,
    config: AlignmentConfig
  ): string[] {
    const recommendations: string[] = [];

    // Overall recommendations
    if (harmony.overall < 0.7) {
      recommendations.push('Consider applying optical alignment adjustments for better harmony');
    }

    if (rhythm.consistency < 0.7) {
      recommendations.push('Establish consistent spacing rhythm using a grid system');
    }

    if (balance.visual < 0.7) {
      recommendations.push('Redistribute visual weight to achieve better balance');
    }

    // Type-specific recommendations
    if (config.type === 'optical') {
      recommendations.push('Use subpixel precision for smoother optical alignment');
    }

    if (config.type === 'emotional') {
      recommendations.push('Consider emotional context when adjusting element positions');
    }

    if (config.type === 'contextual') {
      recommendations.push('Adapt alignment based on user context and preferences');
    }

    return recommendations;
  }
}

const SophisticatedAlignment: React.FC<SophisticatedAlignmentProps> = ({
  config,
  elements,
  children,
  containerWidth = 800,
  containerHeight = 600,
  enableOptical = true,
  enableContextual = true,
  enableEmotional = true,
  className = '',
  style = {},
  onAlignmentChange,
  onOpticalAdjustment,
  onHarmonyChange,
}) => {
  const [alignment, setAlignment] = useState<AlignmentResult | null>(null);
  const [isAligning, setIsAligning] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Calculate sophisticated alignment
  const calculateAlignment = useCallback(() => {
    if (!containerRef.current) return;

    const result = SophisticatedAlignmentEngine.calculateOptimalAlignment(
      config,
      containerWidth,
      containerHeight,
      elements
    );

    setAlignment(result);

    // Notify parent components
    onAlignmentChange?.(result, config);

    result.opticalAdjustments.forEach(adjustment => {
      onOpticalAdjustment?.(adjustment, adjustment.elementId);
    });

    if (result.harmony.overall < 0.7) {
      onHarmonyChange?.(result.harmony, Array.from(result.elements.keys()));
    }

    setIsAligning(true);
    setTimeout(() => setIsAligning(false), 300);
  }, [
    config,
    containerWidth,
    containerHeight,
    elements,
    onAlignmentChange,
    onOpticalAdjustment,
    onHarmonyChange,
  ]);

  // Responsive updates
  useEffect(() => {
    const handleResize = () => {
      calculateAlignment();
    };

    // Initial calculation
    calculateAlignment();

    // Set up event listeners
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateAlignment]);

  return (
    <div
      ref={containerRef}
      className={`sophisticated-alignment-container ${className} ${isAligning ? 'aligning' : ''}`}
      style={{
        position: 'relative',
        width: containerWidth,
        height: containerHeight,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Alignment elements */}
      {elements.map((element, index) => {
        const position = alignment?.elements.get(element.id);
        if (!position) return null;

        return (
          <motion.div
            key={element.id}
            className={`alignment-element ${element.type} ${element.priority}`}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              transformOrigin: 'center',
            }}
            animate={{
              x: position.x,
              y: position.y,
              width: position.width,
              height: position.height,
              rotate: position.rotation,
              scale: position.scale,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.4,
              ease: 'easeInOut',
              delay: index * 0.02,
            }}
          >
            {/* Element content */}
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                overflow: 'hidden',
                background: `linear-gradient(135deg,
                  ${element.priority === 'hero' ? 'rgba(139, 92, 246, 0.15)' :
                    element.priority === 'featured' ? 'rgba(59, 130, 246, 0.1)' :
                    'rgba(107, 114, 128, 0.05)'} 0%,
                  transparent 100%)`,
                border: `1px solid ${element.priority === 'hero' ? 'rgba(139, 92, 246, 0.2)' :
                  element.priority === 'featured' ? 'rgba(59, 130, 246, 0.15)' :
                  'rgba(107, 114, 128, 0.1)'}`,
              }}
            >
              {element.content}

              {/* Optical alignment indicator */}
              {enableOptical && element.alignment.optical && (
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    left: '-4px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#f59e0b',
                    border: '2px solid white',
                    boxShadow: '0 0 4px rgba(245, 158, 11, 0.5)',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>
          </motion.div>
        );
      })}

      {/* Alignment indicators */}
      <AnimatePresence>
        {isAligning && alignment && (
          <motion.div
            style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              padding: '8px 12px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              borderRadius: '20px',
              fontSize: '12px',
              backdropFilter: 'blur(10px)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            Aligning: {config.method} • {Math.round(alignment.harmony.overall * 100)}% harmony
          </motion.div>
        )}
      </AnimatePresence>

      {/* Harmony indicator */}
      {alignment && alignment.harmony.overall < 0.8 && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            padding: '8px 12px',
            background: 'rgba(245, 158, 11, 0.8)',
            color: 'white',
            borderRadius: '20px',
            fontSize: '12px',
            backdropFilter: 'blur(10px)',
          }}
          animate={{
            backgroundColor: alignment.harmony.overall > 0.7 ? 'rgba(34, 197, 94, 0.8)' : 'rgba(245, 158, 11, 0.8)',
          }}
        >
          Harmony: {Math.round(alignment.harmony.overall * 100)}%
        </motion.div>
      )}

      {/* Development info */}
      {config.isDev && alignment && (
        <div
          className="absolute top-4 right-4 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded"
          style={{ fontSize: '10px' }}
        >
          {config.name} • {config.type} • {elements.length} elements
        </div>
      )}

      {children}
    </div>
  );
};

// Preset sophisticated alignment configurations
export const TypographyAlignment: React.FC<Omit<SophisticatedAlignmentProps, 'config'>> = (props) => (
  <SophisticatedAlignment
    {...props}
    config={{
      id: 'typography-alignment',
      name: 'Typography Alignment',
      description: 'Sophisticated alignment optimized for typography with optical adjustments',
      type: 'optical',
      method: 'baseline',
      precision: 'subpixel',
      context: 'typography',
      adaptation: 'reactive',
      constraints: {
        minAlignment: 0.1,
        maxAlignment: 10,
        preferredRatio: 1.618,
        avoidRatios: [1.0, 1.5],
        harmonyRatios: [1.414, 1.618, 1.732],
      },
      aesthetics: {
        visualWeight: 0.8,
        rhythm: 0.9,
        balance: 0.7,
        contrast: 0.6,
        flow: 0.8,
        harmony: 0.9,
      },
    }}
  />
);

export const LayoutAlignment: React.FC<Omit<SophisticatedAlignmentProps, 'config'>> = (props) => (
  <SophisticatedAlignment
    {...props}
    config={{
      id: 'layout-alignment',
      name: 'Layout Alignment',
      description: 'Sophisticated alignment for complex layouts with contextual awareness',
      type: 'contextual',
      method: 'harmony',
      precision: 'fluid',
      context: 'layout',
      adaptation: 'intelligent',
      constraints: {
        minAlignment: 0.5,
        maxAlignment: 20,
        preferredRatio: 1.414,
        avoidRatios: [1.2, 1.8],
        harmonyRatios: [1.414, 1.618, 2.0],
      },
      aesthetics: {
        visualWeight: 0.7,
        rhythm: 0.8,
        balance: 0.9,
        contrast: 0.7,
        flow: 0.8,
        harmony: 0.8,
      },
    }}
  />
);

export const EmotionalAlignment: React.FC<Omit<SophisticatedAlignmentProps, 'config'>> = (props) => (
  <SophisticatedAlignment
    {...props}
    config={{
      id: 'emotional-alignment',
      name: 'Emotional Alignment',
      description: 'Sophisticated alignment that adapts to emotional context and user state',
      type: 'emotional',
      method: 'balance',
      precision: 'adaptive',
      context: 'emotional',
      adaptation: 'emotional',
      constraints: {
        minAlignment: 0.2,
        maxAlignment: 15,
        preferredRatio: 1.5,
        avoidRatios: [1.0, 2.5],
        harmonyRatios: [1.2, 1.5, 1.8],
      },
      aesthetics: {
        visualWeight: 0.6,
        rhythm: 0.7,
        balance: 0.8,
        contrast: 0.8,
        flow: 0.9,
        harmony: 0.7,
      },
    }}
  />
);

export default SophisticatedAlignment;