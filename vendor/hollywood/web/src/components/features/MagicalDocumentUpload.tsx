
/**
 * Magical Document Upload Enhancements
 * Adds delightful animations to make document uploading a magical experience
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, FileText, Hash, Sparkles, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimationSystem } from '@/lib/animation-system';
import type { PersonalityMode } from '@/lib/sofia-types';

interface MagicalDropZoneProps {
  children: React.ReactNode;
  className?: string;
  isDragOver: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  personalityMode?: PersonalityMode;
}

interface DocumentAnalysisAnimationProps {
  analysisProgress?: number;
  fileName?: string;
  isAnalyzing: boolean;
  onAnimationComplete?: () => void;
  personalityMode?: PersonalityMode;
}

interface SofiaFireflyWelcomeProps {
  containerBounds?: DOMRect;
  isVisible: boolean;
  message?: string;
  personalityMode?: PersonalityMode;
}

interface DataParticle {
  content: string;
  delay: number;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  type: 'date' | 'number' | 'other' | 'text';
}

/**
 * Sofia Firefly Welcome Animation
 * Shows a welcoming firefly when user drags files over the upload area
 */
export const SofiaFireflyWelcome: React.FC<SofiaFireflyWelcomeProps> = ({
  isVisible,
  personalityMode = 'adaptive',
  containerBounds: _containerBounds,
  message = "Welcome! I'll help you organize this document ✨",
}) => {
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();

  if (!isVisible || shouldReduceMotion) {
    return isVisible ? (
      <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
        <div className='bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm'>
          <Sparkles className='w-4 h-4 inline mr-2' />
          {message}
        </div>
      </div>
    ) : null;
  }

  const getPersonalityAnimation = () => {
    switch (personalityMode) {
      case 'empathetic':
        return {
          duration: 3,
          pathType: 'heart',
          intensity: 1.2,
          color: 'text-pink-400',
        };
      case 'pragmatic':
        return {
          duration: 1.5,
          pathType: 'direct',
          intensity: 0.8,
          color: 'text-blue-400',
        };
      default:
        return {
          duration: 2,
          pathType: 'organic',
          intensity: 1.0,
          color: 'text-yellow-400',
        };
    }
  };

  const animation = getPersonalityAnimation();

  return (
    <AnimatePresence>
      <motion.div
        className='absolute inset-0 flex items-center justify-center pointer-events-none'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-label="Sofia's welcome animation"
      >
        {/* Sofia Firefly */}
        <motion.div
          className='relative'
          initial={{ x: -50, y: -50, scale: 0 }}
          animate={{
            x:
              animation.pathType === 'heart'
                ? [0, 20, 0, -20, 0]
                : animation.pathType === 'direct'
                  ? [0, 10, 0]
                  : [0, 15, -10, 20, 0],
            y:
              animation.pathType === 'heart'
                ? [0, -15, -30, -15, 0]
                : animation.pathType === 'direct'
                  ? [0, -5, 0]
                  : [0, -10, -5, -15, 0],
            scale: 1,
            rotate: animation.pathType === 'heart' ? [0, -5, 0, 5, 0] : 0,
          }}
          transition={{
            duration: animation.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Glow effect */}
          <motion.div
            className={`absolute inset-0 ${animation.color} rounded-full blur-lg opacity-30`}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Firefly sparkle */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className={`w-6 h-6 ${animation.color}`} />
          </motion.div>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          className='absolute top-1/2 left-1/2 transform -translate-x-1/2 mt-12 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border'
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
        >
          <div className='text-sm text-gray-700 text-center max-w-xs'>
            {message}
          </div>

          {/* Message pointer */}
          <div className='absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-l border-t rotate-45' />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Document Analysis Animation
 * Shows document "breaking apart" into data particles that flow into form fields
 */
export const DocumentAnalysisAnimation: React.FC<
  DocumentAnalysisAnimationProps
> = ({
  isAnalyzing,
  fileName = 'Document',
  analysisProgress = 0,
  personalityMode = 'adaptive',
  onAnimationComplete,
}) => {
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const [particles, setParticles] = useState<DataParticle[]>([]);
  const [showDocument, setShowDocument] = useState(true);
  const [phase, setPhase] = useState<
    'complete' | 'extracting' | 'organizing' | 'scanning'
  >('scanning');

  // Generate data particles when analysis starts
  useEffect(() => {
    if (isAnalyzing && particles.length === 0) {
      const newParticles: DataParticle[] = [
        {
          id: 'text-1',
          type: 'text',
          icon: Type,
          startX: 50,
          startY: 40,
          targetX: 20,
          targetY: 80,
          delay: 0.5,
          content: 'Text content',
        },
        {
          id: 'date-1',
          type: 'date',
          icon: Calendar,
          startX: 45,
          startY: 50,
          targetX: 60,
          targetY: 85,
          delay: 0.8,
          content: 'Date information',
        },
        {
          id: 'number-1',
          type: 'number',
          icon: Hash,
          startX: 55,
          startY: 35,
          targetX: 80,
          targetY: 75,
          delay: 1.1,
          content: 'Numerical data',
        },
        {
          id: 'text-2',
          type: 'text',
          icon: Type,
          startX: 40,
          startY: 60,
          targetX: 40,
          targetY: 90,
          delay: 1.4,
          content: 'Document details',
        },
      ];
      setParticles(newParticles);
    }
  }, [isAnalyzing, particles.length]);

  // Handle analysis phases
  useEffect(() => {
    if (!isAnalyzing) {
      setPhase('scanning');
      setShowDocument(true);
      setParticles([]);
      return;
    }

    if (analysisProgress >= 25 && phase === 'scanning') {
      setPhase('extracting');
    } else if (analysisProgress >= 60 && phase === 'extracting') {
      setPhase('organizing');
      setShowDocument(false);
    } else if (analysisProgress >= 90 && phase === 'organizing') {
      setPhase('complete');
      setTimeout(() => onAnimationComplete?.(), 1000);
    }
  }, [analysisProgress, phase, isAnalyzing, onAnimationComplete]);

  if (!isAnalyzing) return null;

  const getPhaseMessage = () => {
    switch (phase) {
      case 'scanning':
        return personalityMode === 'empathetic'
          ? 'Gently examining your document...'
          : personalityMode === 'pragmatic'
            ? 'Scanning document structure...'
            : 'Analyzing your document...';
      case 'extracting':
        return personalityMode === 'empathetic'
          ? 'Carefully extracting important details...'
          : personalityMode === 'pragmatic'
            ? 'Processing data extraction...'
            : 'Extracting key information...';
      case 'organizing':
        return personalityMode === 'empathetic'
          ? 'Lovingly organizing everything for you...'
          : personalityMode === 'pragmatic'
            ? 'Optimizing data structure...'
            : 'Organizing extracted data...';
      case 'complete':
        return personalityMode === 'empathetic'
          ? 'All done! Your document is safely processed ✨'
          : personalityMode === 'pragmatic'
            ? 'Processing complete. Data indexed.'
            : 'Analysis complete!';
    }
  };

  if (shouldReduceMotion) {
    return (
      <div className='flex items-center justify-center p-8 bg-blue-50 rounded-lg'>
        <div className='text-center space-y-4'>
          <FileText className='w-12 h-12 mx-auto text-blue-500' />
          <div className='space-y-2'>
            <div className='text-lg font-medium'>{getPhaseMessage()}</div>
            <div className='text-sm text-gray-600'>
              {analysisProgress}% complete
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className='relative w-full h-64 bg-gradient-to-b from-blue-50 to-purple-50 rounded-lg overflow-hidden'
      role='progressbar'
      aria-valuenow={analysisProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Document analysis in progress: ${analysisProgress}% complete`}
    >
      {/* Document representation */}
      <AnimatePresence>
        {showDocument && (
          <motion.div
            className='absolute top-1/4 left-1/2 transform -translate-x-1/2'
            initial={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 0.3,
              opacity: 0.2,
              rotate:
                personalityMode === 'empathetic'
                  ? 15
                  : personalityMode === 'pragmatic'
                    ? 0
                    : 5,
            }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          >
            {/* Document icon with scanning effect */}
            <motion.div className='relative'>
              <FileText className='w-16 h-16 text-blue-600' />

              {/* Scanning line */}
              {phase === 'scanning' && (
                <motion.div
                  className='absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent'
                  animate={{
                    y: [-20, 80, -20],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}

              {/* File name */}
              <div className='absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 whitespace-nowrap'>
                {fileName}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data particles */}
      <AnimatePresence>
        {phase === 'extracting' &&
          particles.map(particle => (
            <motion.div
              key={particle.id}
              className='absolute'
              initial={{
                x: `${particle.startX}%`,
                y: `${particle.startY}%`,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: `${particle.targetX}%`,
                y: `${particle.targetY}%`,
                scale: 1,
                opacity: [0, 1, 0.8],
              }}
              exit={{
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 1.5,
                delay: particle.delay,
                ease: 'easeOut',
              }}
            >
              <div className='flex items-center space-x-2 bg-white/90 rounded-full px-3 py-1 shadow-sm'>
                <particle.icon className='w-4 h-4 text-blue-500' />
                <span className='text-xs text-gray-700'>
                  {particle.content}
                </span>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>

      {/* Sofia assistance indicator */}
      <motion.div
        className='absolute bottom-4 left-4 flex items-center space-x-2 bg-white/95 rounded-full px-3 py-2 shadow-sm'
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          animate={{
            rotate: phase === 'scanning' ? 360 : 0,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <Sparkles className='w-4 h-4 text-yellow-500' />
        </motion.div>
        <span className='text-sm text-gray-700'>{getPhaseMessage()}</span>
      </motion.div>

      {/* Progress indicator */}
      <div className='absolute bottom-0 left-0 right-0 h-1 bg-gray-200'>
        <motion.div
          className='h-full bg-gradient-to-r from-blue-500 to-purple-500'
          initial={{ width: '0%' }}
          animate={{ width: `${analysisProgress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

/**
 * Magical Drop Zone Wrapper
 * Enhances drag-and-drop area with firefly welcome and glow effects
 */
export const MagicalDropZone: React.FC<MagicalDropZoneProps> = ({
  isDragOver,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  personalityMode = 'adaptive',
  children,
  className,
}) => {
  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const [showFirefly, setShowFirefly] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Trigger the file input click
      const fileInput = document.getElementById(
        'file-input'
      ) as HTMLInputElement;
      fileInput?.click();
    }
  };

  useEffect(() => {
    if (isDragOver) {
      setShowFirefly(true);
    } else {
      // Delay hiding firefly to allow for smooth exit animation
      const timeout = setTimeout(() => setShowFirefly(false), 300);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [isDragOver]);

  const getPersonalityStyles = () => {
    switch (personalityMode) {
      case 'empathetic':
        return {
          border: isDragOver ? 'border-pink-400' : 'border-gray-300',
          bg: isDragOver ? 'bg-pink-50' : 'bg-transparent',
          glow: 'shadow-pink-200',
        };
      case 'pragmatic':
        return {
          border: isDragOver ? 'border-blue-500' : 'border-gray-300',
          bg: isDragOver ? 'bg-blue-50' : 'bg-transparent',
          glow: 'shadow-blue-200',
        };
      default:
        return {
          border: isDragOver ? 'border-purple-400' : 'border-gray-300',
          bg: isDragOver ? 'bg-purple-50' : 'bg-transparent',
          glow: 'shadow-purple-200',
        };
    }
  };

  const styles = getPersonalityStyles();

  return (
    <motion.div
      className={cn(
        'relative border-2 border-dashed rounded-lg transition-all duration-300',
        styles.border,
        styles.bg,
        isDragOver && !shouldReduceMotion && `${styles.glow} shadow-lg`,
        className
      )}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onKeyDown={handleKeyDown}
      animate={
        !shouldReduceMotion
          ? {
              scale: isDragOver ? 1.02 : 1,
              borderRadius: isDragOver ? '12px' : '8px',
            }
          : undefined
      }
      transition={{ duration: 0.2, ease: 'easeOut' }}
      role='button'
      tabIndex={0}
      aria-label='Drag and drop file upload area'
      aria-describedby='upload-instructions'
    >
      {children}

      {/* Sofia Firefly Welcome */}
      <SofiaFireflyWelcome
        isVisible={showFirefly}
        personalityMode={personalityMode}
        message={
          personalityMode === 'empathetic'
            ? "I'm here to help you with your precious document! 💖"
            : personalityMode === 'pragmatic'
              ? 'Ready to process your document efficiently.'
              : 'Welcome! Let me help organize this for you ✨'
        }
      />
    </motion.div>
  );
};

export default {
  MagicalDropZone,
  DocumentAnalysisAnimation,
  SofiaFireflyWelcome,
};
