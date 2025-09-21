import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

export type UserAction =
  | 'document-upload'
  | 'will-generation'
  | 'family-invitation'
  | 'professional-review'
  | 'document-analysis'
  | 'data-sync'
  | 'report-generation'
  | 'backup-creation';

export type PredictionConfidence = 'low' | 'medium' | 'high';

interface PredictedAction {
  action: UserAction;
  confidence: PredictionConfidence;
  estimatedTime: number; // in milliseconds
  priority: number; // 1-10, higher = more important
}

interface UserBehaviorPattern {
  action: UserAction;
  frequency: number;
  lastPerformed: Date;
  avgDuration: number;
  contextTriggers: string[];
}

interface PredictiveLoadingProps {
  userId?: string;
  currentContext?: string;
  isActive?: boolean;
  maxPredictions?: number;
  predictionThreshold?: number; // minimum confidence to show prediction
  className?: string;
  onPredictionReady?: (predictions: PredictedAction[]) => void;
  onActionPreloaded?: (action: UserAction) => void;
}

interface PreloadableContent {
  action: UserAction;
  content: React.ReactNode;
  priority: number;
  preloadFunction: () => Promise<void>;
}

const defaultPatterns: Record<string, UserBehaviorPattern[]> = {
  'document-upload': [
    {
      action: 'document-analysis',
      frequency: 0.8,
      lastPerformed: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      avgDuration: 5000,
      contextTriggers: ['document-upload', 'file-selection', 'drag-drop']
    },
    {
      action: 'will-generation',
      frequency: 0.3,
      lastPerformed: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      avgDuration: 15000,
      contextTriggers: ['document-upload', 'estate-planning', 'will-creation']
    }
  ],
  'will-generation': [
    {
      action: 'professional-review',
      frequency: 0.9,
      lastPerformed: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      avgDuration: 10000,
      contextTriggers: ['will-generation', 'legal-review', 'document-finalization']
    },
    {
      action: 'family-invitation',
      frequency: 0.6,
      lastPerformed: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      avgDuration: 3000,
      contextTriggers: ['will-generation', 'family-sharing', 'guardian-setup']
    }
  ],
  'document-analysis': [
    {
      action: 'report-generation',
      frequency: 0.7,
      lastPerformed: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      avgDuration: 8000,
      contextTriggers: ['document-analysis', 'content-review', 'summary-creation']
    }
  ]
};

export const PredictiveLoading: React.FC<PredictiveLoadingProps> = ({
  userId,
  currentContext = 'default',
  isActive = true,
  maxPredictions = 3,
  predictionThreshold = 0.3,
  className,
  onPredictionReady,
  onActionPreloaded,
}) => {
  const [predictions, setPredictions] = useState<PredictedAction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preloadedActions, setPreloadedActions] = useState<Set<UserAction>>(new Set());
  const analysisTimeoutRef = useRef<NodeJS.Timeout>();
  const preloadCacheRef = useRef<Map<UserAction, any>>(new Map());

  // Analyze user behavior and predict next actions
  const analyzeBehavior = useCallback(async () => {
    if (!isActive) return;

    setIsAnalyzing(true);

    try {
      // Get user behavior patterns
      const patterns = defaultPatterns[currentContext] || [];

      // Calculate prediction confidence based on multiple factors
      const predictedActions: PredictedAction[] = patterns.map(pattern => {
        const timeSinceLastAction = Date.now() - pattern.lastPerformed.getTime();
        const recencyScore = Math.max(0, 1 - (timeSinceLastAction / (1000 * 60 * 60 * 24))); // Decay over 24 hours
        const frequencyScore = Math.min(1, pattern.frequency);
        const contextMatchScore = currentContext === pattern.action ? 0.5 : 0.2;

        const confidenceValue = recencyScore * 0.4 + frequencyScore * 0.4 + contextMatchScore * 0.2;

        return {
          action: pattern.action,
          confidence: confidenceValue > 0.7 ? 'high' : confidenceValue > 0.4 ? 'medium' : 'low',
          estimatedTime: pattern.avgDuration,
          priority: Math.round(confidenceValue * 10)
        };
      });

      // Filter by threshold and sort by priority
      const filteredPredictions = predictedActions
        .filter(p => {
          const confidenceValue = p.confidence === 'high' ? 1 : p.confidence === 'medium' ? 0.6 : 0.3;
          return confidenceValue >= predictionThreshold;
        })
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxPredictions);

      setPredictions(filteredPredictions);
      onPredictionReady?.(filteredPredictions);

    } catch (error) {
      console.error('Error analyzing user behavior:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isActive, currentContext, predictionThreshold, maxPredictions, onPredictionReady]);

  // Preload content for predicted actions
  const preloadAction = useCallback(async (action: UserAction) => {
    if (preloadedActions.has(action)) return;

    try {
      // Simulate preloading based on action type
      const preloadFunction = async () => {
        switch (action) {
          case 'document-analysis':
            // Preload AI analysis components
            await new Promise(resolve => setTimeout(resolve, 2000));
            break;
          case 'will-generation':
            // Preload legal document templates
            await new Promise(resolve => setTimeout(resolve, 3000));
            break;
          case 'professional-review':
            // Preload review interface
            await new Promise(resolve => setTimeout(resolve, 1500));
            break;
          case 'family-invitation':
            // Preload invitation templates
            await new Promise(resolve => setTimeout(resolve, 1000));
            break;
          case 'report-generation':
            // Preload reporting components
            await new Promise(resolve => setTimeout(resolve, 2500));
            break;
          default:
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
      };

      await preloadFunction();
      setPreloadedActions(prev => new Set([...prev, action]));
      onActionPreloaded?.(action);

    } catch (error) {
      console.error(`Error preloading action ${action}:`, error);
    }
  }, [preloadedActions, onActionPreloaded]);

  // Auto-analyze behavior when context changes
  useEffect(() => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    analysisTimeoutRef.current = setTimeout(() => {
      analyzeBehavior();
    }, 1000); // Debounce analysis

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [analyzeBehavior]);

  // Auto-preload high-confidence predictions
  useEffect(() => {
    predictions.forEach(prediction => {
      if (prediction.confidence === 'high' && !preloadedActions.has(prediction.action)) {
        // Delay preload slightly to not interfere with current action
        setTimeout(() => {
          preloadAction(prediction.action);
        }, 2000);
      }
    });
  }, [predictions, preloadedActions, preloadAction]);

  const getConfidenceColor = (confidence: PredictionConfidence) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceIcon = (confidence: PredictionConfidence) => {
    switch (confidence) {
      case 'high': return '🎯';
      case 'medium': return '🎲';
      case 'low': return '🔮';
    }
  };

  if (!isActive || predictions.length === 0) return null;

  return (
    <div className={cn('predictive-loading', className)}>
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
              <span className="text-sm text-blue-700">Analyzing your behavior patterns...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Predicted next actions:
        </div>

        {predictions.map((prediction, index) => (
          <motion.div
            key={`${prediction.action}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg border transition-all duration-200',
              getConfidenceColor(prediction.confidence),
              preloadedActions.has(prediction.action) && 'bg-green-100 border-green-300'
            )}
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg">{getConfidenceIcon(prediction.confidence)}</span>
              <div>
                <div className="font-medium capitalize">
                  {prediction.action.replace('-', ' ')}
                </div>
                <div className="text-xs opacity-75">
                  {prediction.confidence} confidence • ~{Math.round(prediction.estimatedTime / 1000)}s
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {preloadedActions.has(prediction.action) ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-1 text-green-600"
                >
                  <span className="text-sm">✓</span>
                  <span className="text-xs font-medium">Ready</span>
                </motion.div>
              ) : prediction.confidence === 'high' ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => preloadAction(prediction.action)}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Preload
                </motion.button>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Hook for using predictive loading in components
export const usePredictiveLoading = (userId?: string, currentContext?: string) => {
  const [predictions, setPredictions] = useState<PredictedAction[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeBehavior = useCallback(async (context: string) => {
    setIsAnalyzing(true);

    try {
      // This would typically call an API or service
      const patterns = defaultPatterns[context] || [];

      const predictedActions: PredictedAction[] = patterns.map(pattern => ({
        action: pattern.action,
        confidence: (pattern.frequency > 0.7 ? 'high' : pattern.frequency > 0.4 ? 'medium' : 'low') as PredictionConfidence,
        estimatedTime: pattern.avgDuration,
        priority: Math.round(pattern.frequency * 10)
      }));

      setPredictions(predictedActions);
    } catch (error) {
      console.error('Error in predictive analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (currentContext) {
      analyzeBehavior(currentContext);
    }
  }, [currentContext, analyzeBehavior]);

  return {
    predictions,
    isAnalyzing,
    analyzeBehavior
  };
};