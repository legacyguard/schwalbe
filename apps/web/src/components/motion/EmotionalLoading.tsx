import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/utils';

export type EmotionalState =
  | 'anxious'
  | 'frustrated'
  | 'overwhelmed'
  | 'hopeful'
  | 'determined'
  | 'relieved'
  | 'confident'
  | 'calm'
  | 'excited'
  | 'neutral';

export type LoadingIntensity = 'gentle' | 'moderate' | 'intense';

interface EmotionalMessage {
  text: string;
  subtext: string;
  emoji: string;
  breathingPattern: 'slow' | 'normal' | 'quick';
  color: string;
  animation: 'pulse' | 'wave' | 'float' | 'breathe';
}

interface EmotionalLoadingProps {
  emotionalState?: EmotionalState;
  loadingIntensity?: LoadingIntensity;
  isLoading: boolean;
  progress?: number;
  context?: string;
  className?: string;
  showProgress?: boolean;
  autoDetectEmotion?: boolean;
  onEmotionDetected?: (emotion: EmotionalState) => void;
}

const emotionalMessageLibrary: Record<EmotionalState, Record<LoadingIntensity, EmotionalMessage[]>> = {
  anxious: {
    gentle: [
      {
        text: "Taking it slow and steady",
        subtext: "We're here with you, one step at a time",
        emoji: "🫂",
        breathingPattern: 'slow',
        color: 'text-blue-600',
        animation: 'breathe'
      },
      {
        text: "Creating a safe space",
        subtext: "Your comfort is our priority",
        emoji: "🛡️",
        breathingPattern: 'slow',
        color: 'text-green-600',
        animation: 'float'
      }
    ],
    moderate: [
      {
        text: "We're working through this together",
        subtext: "You don't have to face this alone",
        emoji: "🤝",
        breathingPattern: 'normal',
        color: 'text-purple-600',
        animation: 'wave'
      },
      {
        text: "Taking careful steps forward",
        subtext: "Progress at your own pace",
        emoji: "🐢",
        breathingPattern: 'normal',
        color: 'text-blue-600',
        animation: 'pulse'
      }
    ],
    intense: [
      {
        text: "We're right here with you",
        subtext: "Breathe with us - you're safe",
        emoji: "💙",
        breathingPattern: 'slow',
        color: 'text-indigo-600',
        animation: 'breathe'
      },
      {
        text: "This feeling will pass",
        subtext: "We're creating calm together",
        emoji: "🕊️",
        breathingPattern: 'slow',
        color: 'text-cyan-600',
        animation: 'float'
      }
    ]
  },
  frustrated: {
    gentle: [
      {
        text: "We understand this is tough",
        subtext: "Taking it slow to get it right",
        emoji: "😌",
        breathingPattern: 'slow',
        color: 'text-green-600',
        animation: 'breathe'
      },
      {
        text: "We're making this easier",
        subtext: "One careful improvement at a time",
        emoji: "🔧",
        breathingPattern: 'normal',
        color: 'text-blue-600',
        animation: 'pulse'
      }
    ],
    moderate: [
      {
        text: "We hear your frustration",
        subtext: "Working to make this smoother",
        emoji: "👂",
        breathingPattern: 'normal',
        color: 'text-orange-600',
        animation: 'wave'
      },
      {
        text: "Turning frustration into progress",
        subtext: "We're fixing this together",
        emoji: "🔄",
        breathingPattern: 'normal',
        color: 'text-purple-600',
        animation: 'pulse'
      }
    ],
    intense: [
      {
        text: "We feel this too",
        subtext: "Let's work through it together",
        emoji: "💪",
        breathingPattern: 'normal',
        color: 'text-red-600',
        animation: 'pulse'
      },
      {
        text: "This challenge won't last",
        subtext: "Better times are coming",
        emoji: "🌅",
        breathingPattern: 'slow',
        color: 'text-yellow-600',
        animation: 'wave'
      }
    ]
  },
  overwhelmed: {
    gentle: [
      {
        text: "Breaking it down into small steps",
        subtext: "You don't have to do it all at once",
        emoji: "🧩",
        breathingPattern: 'slow',
        color: 'text-blue-600',
        animation: 'float'
      },
      {
        text: "Taking the pressure off",
        subtext: "We're handling the complexity",
        emoji: "🎈",
        breathingPattern: 'slow',
        color: 'text-green-600',
        animation: 'breathe'
      }
    ],
    moderate: [
      {
        text: "Simplifying the complex",
        subtext: "Making sense of it all",
        emoji: "🗂️",
        breathingPattern: 'normal',
        color: 'text-purple-600',
        animation: 'wave'
      },
      {
        text: "Organizing the chaos",
        subtext: "Creating clarity from confusion",
        emoji: "🧹",
        breathingPattern: 'normal',
        color: 'text-indigo-600',
        animation: 'pulse'
      }
    ],
    intense: [
      {
        text: "You're not alone in this",
        subtext: "We're shouldering this together",
        emoji: "🤗",
        breathingPattern: 'slow',
        color: 'text-pink-600',
        animation: 'breathe'
      },
      {
        text: "One thing at a time",
        subtext: "We can handle this step by step",
        emoji: "👣",
        breathingPattern: 'slow',
        color: 'text-teal-600',
        animation: 'float'
      }
    ]
  },
  hopeful: {
    gentle: [
      {
        text: "Building something wonderful",
        subtext: "Your hope is becoming reality",
        emoji: "🌱",
        breathingPattern: 'normal',
        color: 'text-green-600',
        animation: 'wave'
      },
      {
        text: "Nurturing your vision",
        subtext: "Growing something beautiful",
        emoji: "🌸",
        breathingPattern: 'slow',
        color: 'text-pink-600',
        animation: 'float'
      }
    ],
    moderate: [
      {
        text: "Your hope is our inspiration",
        subtext: "Creating something meaningful",
        emoji: "✨",
        breathingPattern: 'normal',
        color: 'text-yellow-600',
        animation: 'pulse'
      },
      {
        text: "Turning possibility into reality",
        subtext: "Your dreams taking shape",
        emoji: "🎯",
        breathingPattern: 'normal',
        color: 'text-blue-600',
        animation: 'wave'
      }
    ],
    intense: [
      {
        text: "Amazing things are happening",
        subtext: "Your hope is creating magic",
        emoji: "🎉",
        breathingPattern: 'quick',
        color: 'text-purple-600',
        animation: 'pulse'
      },
      {
        text: "The future looks bright",
        subtext: "Your vision is coming to life",
        emoji: "🌟",
        breathingPattern: 'normal',
        color: 'text-orange-600',
        animation: 'wave'
      }
    ]
  },
  determined: {
    gentle: [
      {
        text: "Channeling your determination",
        subtext: "Your strength is our power",
        emoji: "💪",
        breathingPattern: 'normal',
        color: 'text-red-600',
        animation: 'pulse'
      },
      {
        text: "Focused and steady",
        subtext: "Progress through persistence",
        emoji: "🎯",
        breathingPattern: 'normal',
        color: 'text-blue-600',
        animation: 'wave'
      }
    ],
    moderate: [
      {
        text: "Your determination drives us",
        subtext: "Together we're unstoppable",
        emoji: "🚀",
        breathingPattern: 'normal',
        color: 'text-purple-600',
        animation: 'pulse'
      },
      {
        text: "Strength in every step",
        subtext: "Your resolve makes it happen",
        emoji: "⛰️",
        breathingPattern: 'normal',
        color: 'text-gray-600',
        animation: 'wave'
      }
    ],
    intense: [
      {
        text: "Unstoppable force",
        subtext: "Your determination moves mountains",
        emoji: "🌋",
        breathingPattern: 'quick',
        color: 'text-orange-600',
        animation: 'pulse'
      },
      {
        text: "Power and purpose",
        subtext: "Nothing can stand in your way",
        emoji: "⚡",
        breathingPattern: 'quick',
        color: 'text-yellow-600',
        animation: 'wave'
      }
    ]
  },
  relieved: {
    gentle: [
      {
        text: "A moment to breathe",
        subtext: "You've made it through",
        emoji: "😮‍💨",
        breathingPattern: 'slow',
        color: 'text-green-600',
        animation: 'breathe'
      },
      {
        text: "The weight is lifting",
        subtext: "You can relax now",
        emoji: "🕊️",
        breathingPattern: 'slow',
        color: 'text-blue-600',
        animation: 'float'
      }
    ],
    moderate: [
      {
        text: "You did it",
        subtext: "Time to celebrate your strength",
        emoji: "🎉",
        breathingPattern: 'normal',
        color: 'text-purple-600',
        animation: 'wave'
      },
      {
        text: "The hard part is over",
        subtext: "You handled it beautifully",
        emoji: "👏",
        breathingPattern: 'normal',
        color: 'text-pink-600',
        animation: 'pulse'
      }
    ],
    intense: [
      {
        text: "What a relief!",
        subtext: "You made it through the storm",
        emoji: "🌈",
        breathingPattern: 'slow',
        color: 'text-cyan-600',
        animation: 'wave'
      },
      {
        text: "Proud of you",
        subtext: "You faced it and prevailed",
        emoji: "🏆",
        breathingPattern: 'normal',
        color: 'text-yellow-600',
        animation: 'pulse'
      }
    ]
  },
  confident: {
    gentle: [
      {
        text: "You've got this",
        subtext: "Your confidence is well-placed",
        emoji: "😊",
        breathingPattern: 'normal',
        color: 'text-blue-600',
        animation: 'wave'
      },
      {
        text: "Steady and sure",
        subtext: "Moving forward with certainty",
        emoji: "🎯",
        breathingPattern: 'normal',
        color: 'text-green-600',
        animation: 'pulse'
      }
    ],
    moderate: [
      {
        text: "Confidence in action",
        subtext: "Your assurance inspires us",
        emoji: "💫",
        breathingPattern: 'normal',
        color: 'text-purple-600',
        animation: 'wave'
      },
      {
        text: "Strong and capable",
        subtext: "You know exactly what to do",
        emoji: "🦸",
        breathingPattern: 'normal',
        color: 'text-indigo-600',
        animation: 'pulse'
      }
    ],
    intense: [
      {
        text: "Absolute confidence",
        subtext: "Nothing can shake your certainty",
        emoji: "👑",
        breathingPattern: 'normal',
        color: 'text-yellow-600',
        animation: 'pulse'
      },
      {
        text: "Unwavering strength",
        subtext: "Your confidence lights the way",
        emoji: "🔥",
        breathingPattern: 'quick',
        color: 'text-orange-600',
        animation: 'wave'
      }
    ]
  },
  calm: {
    gentle: [
      {
        text: "Peaceful progress",
        subtext: "Everything is flowing smoothly",
        emoji: "🌊",
        breathingPattern: 'slow',
        color: 'text-blue-600',
        animation: 'float'
      },
      {
        text: "Tranquil moments",
        subtext: "Enjoying the gentle flow",
        emoji: "🧘",
        breathingPattern: 'slow',
        color: 'text-green-600',
        animation: 'breathe'
      }
    ],
    moderate: [
      {
        text: "Steady and peaceful",
        subtext: "Maintaining your calm center",
        emoji: "⚖️",
        breathingPattern: 'slow',
        color: 'text-indigo-600',
        animation: 'wave'
      },
      {
        text: "Balanced and serene",
        subtext: "Your peace guides the way",
        emoji: "☯️",
        breathingPattern: 'slow',
        color: 'text-purple-600',
        animation: 'float'
      }
    ],
    intense: [
      {
        text: "Deep inner peace",
        subtext: "Your calm is your superpower",
        emoji: "🧊",
        breathingPattern: 'slow',
        color: 'text-cyan-600',
        animation: 'breathe'
      },
      {
        text: "Unshakable tranquility",
        subtext: "Nothing disturbs your peace",
        emoji: "🕉️",
        breathingPattern: 'slow',
        color: 'text-teal-600',
        animation: 'float'
      }
    ]
  },
  excited: {
    gentle: [
      {
        text: "Something wonderful is happening",
        subtext: "Your excitement is contagious",
        emoji: "✨",
        breathingPattern: 'normal',
        color: 'text-yellow-600',
        animation: 'pulse'
      },
      {
        text: "Joy in progress",
        subtext: "Celebrating every moment",
        emoji: "🎈",
        breathingPattern: 'normal',
        color: 'text-pink-600',
        animation: 'wave'
      }
    ],
    moderate: [
      {
        text: "Energy and enthusiasm",
        subtext: "Your excitement fuels the magic",
        emoji: "⚡",
        breathingPattern: 'quick',
        color: 'text-orange-600',
        animation: 'pulse'
      },
      {
        text: "Vibrant and alive",
        subtext: "Your joy brings everything to life",
        emoji: "🌟",
        breathingPattern: 'normal',
        color: 'text-purple-600',
        animation: 'wave'
      }
    ],
    intense: [
      {
        text: "Pure exhilaration",
        subtext: "Your excitement is electric",
        emoji: "🎆",
        breathingPattern: 'quick',
        color: 'text-red-600',
        animation: 'pulse'
      },
      {
        text: "Bursting with joy",
        subtext: "Your happiness overflows",
        emoji: "🎊",
        breathingPattern: 'quick',
        color: 'text-pink-600',
        animation: 'wave'
      }
    ]
  },
  neutral: {
    gentle: [
      {
        text: "Steady progress",
        subtext: "Moving forward with purpose",
        emoji: "📈",
        breathingPattern: 'normal',
        color: 'text-gray-600',
        animation: 'pulse'
      },
      {
        text: "Consistent effort",
        subtext: "Reliable and steady",
        emoji: "🎯",
        breathingPattern: 'normal',
        color: 'text-blue-600',
        animation: 'wave'
      }
    ],
    moderate: [
      {
        text: "Balanced approach",
        subtext: "Thoughtful and measured",
        emoji: "⚖️",
        breathingPattern: 'normal',
        color: 'text-indigo-600',
        animation: 'wave'
      },
      {
        text: "Methodical progress",
        subtext: "Careful and considered",
        emoji: "📊",
        breathingPattern: 'normal',
        color: 'text-green-600',
        animation: 'pulse'
      }
    ],
    intense: [
      {
        text: "Focused determination",
        subtext: "Purposeful and driven",
        emoji: "🎯",
        breathingPattern: 'normal',
        color: 'text-purple-600',
        animation: 'pulse'
      },
      {
        text: "Committed effort",
        subtext: "Dedicated and persistent",
        emoji: "💪",
        breathingPattern: 'normal',
        color: 'text-red-600',
        animation: 'wave'
      }
    ]
  }
};

export const EmotionalLoading: React.FC<EmotionalLoadingProps> = ({
  emotionalState = 'neutral',
  loadingIntensity = 'moderate',
  isLoading,
  progress = 0,
  context = 'general',
  className,
  showProgress = true,
  autoDetectEmotion = false,
  onEmotionDetected,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [detectedEmotion, setDetectedEmotion] = useState<EmotionalState>(emotionalState);

  const messages = emotionalMessageLibrary[detectedEmotion]?.[loadingIntensity] || [];
  const currentMessage = messages[currentMessageIndex] || {
    text: 'Loading...',
    subtext: 'Please wait',
    emoji: '⏳',
    breathingPattern: 'normal',
    color: 'text-gray-600',
    animation: 'pulse'
  };

  // Auto-detect emotion based on context and user behavior
  const detectEmotion = useCallback(() => {
    if (!autoDetectEmotion) return;

    // Simple emotion detection based on context
    const contextLower = context.toLowerCase();

    if (contextLower.includes('error') || contextLower.includes('failed')) {
      setDetectedEmotion('frustrated');
    } else if (contextLower.includes('success') || contextLower.includes('complete')) {
      setDetectedEmotion('relieved');
    } else if (contextLower.includes('important') || contextLower.includes('critical')) {
      setDetectedEmotion('anxious');
    } else if (contextLower.includes('celebration') || contextLower.includes('achievement')) {
      setDetectedEmotion('excited');
    } else if (contextLower.includes('planning') || contextLower.includes('strategy')) {
      setDetectedEmotion('determined');
    } else if (contextLower.includes('meditation') || contextLower.includes('peace')) {
      setDetectedEmotion('calm');
    } else {
      setDetectedEmotion('neutral');
    }

    onEmotionDetected?.(detectedEmotion);
  }, [autoDetectEmotion, context, detectedEmotion, onEmotionDetected]);

  useEffect(() => {
    detectEmotion();
  }, [detectEmotion]);

  // Rotate messages periodically
  useEffect(() => {
    if (!isLoading || messages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLoading, messages.length]);

  if (!isLoading) return null;

  const getBreathingDuration = (pattern: string) => {
    switch (pattern) {
      case 'slow': return 4;
      case 'quick': return 1;
      default: return 2;
    }
  };

  const getAnimationVariants = (animation: string) => {
    switch (animation) {
      case 'breathe':
        return {
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7]
        };
      case 'wave':
        return {
          x: [-5, 5, -5],
          rotate: [-1, 1, -1]
        };
      case 'float':
        return {
          y: [-3, 3, -3],
          opacity: [0.8, 1, 0.8]
        };
      default:
        return {
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8]
        };
    }
  };

  return (
    <motion.div
      className={cn(
        'emotional-loading flex flex-col items-center justify-center p-6',
        'bg-white rounded-xl shadow-lg border border-gray-100',
        className
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* Progress Circle with Emotional Color */}
      {showProgress && (
        <div className="relative mb-4">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <motion.path
              className={currentMessage.color}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${progress}, 100`}
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${progress}, 100` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}

      {/* Emotional Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessageIndex}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="flex items-center justify-center mb-2"
            animate={getAnimationVariants(currentMessage.animation)}
            transition={{
              duration: getBreathingDuration(currentMessage.breathingPattern),
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="text-2xl mr-2">{currentMessage.emoji}</span>
            <h3 className={cn("text-lg font-semibold", currentMessage.color)}>
              {currentMessage.text}
            </h3>
          </motion.div>
          <p className="text-sm text-gray-600 max-w-xs">
            {currentMessage.subtext}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Breathing Indicator */}
      <div className="flex items-center space-x-2 mt-4 text-xs text-gray-500">
        <span>Breathing:</span>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-current rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: getBreathingDuration(currentMessage.breathingPattern),
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
        <span className="capitalize">{currentMessage.breathingPattern}</span>
      </div>
    </motion.div>
  );
};

// Specialized emotional loading components
export const AnxiousLoading: React.FC<Omit<EmotionalLoadingProps, 'emotionalState'>> = (props) => (
  <EmotionalLoading {...props} emotionalState="anxious" />
);

export const FrustratedLoading: React.FC<Omit<EmotionalLoadingProps, 'emotionalState'>> = (props) => (
  <EmotionalLoading {...props} emotionalState="frustrated" />
);

export const HopefulLoading: React.FC<Omit<EmotionalLoadingProps, 'emotionalState'>> = (props) => (
  <EmotionalLoading {...props} emotionalState="hopeful" />
);

export const CalmLoading: React.FC<Omit<EmotionalLoadingProps, 'emotionalState'>> = (props) => (
  <EmotionalLoading {...props} emotionalState="calm" />
);