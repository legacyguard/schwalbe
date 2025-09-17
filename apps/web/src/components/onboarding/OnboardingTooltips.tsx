/**
 * Onboarding Tooltips System
 * Interactive guided tour for new features with smart positioning and progressive disclosure
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '@schwalbe/shared/lib/logger';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Play,
  Sparkles,
  X,
} from 'lucide-react';

interface TooltipStep {
  action?: {
    callback?: () => void;
    text: string;
    type: 'click' | 'focus' | 'hover';
  };
  content: string;
  delay?: number;
  highlight?: boolean;
  id: string;
  position?: 'auto' | 'bottom' | 'left' | 'right' | 'top';
  showSkip?: boolean;
  targetSelector: string;
  title: string;
}

interface OnboardingFlow {
  description: string;
  id: string;
  name: string;
  steps: TooltipStep[];
  trigger: 'auto' | 'feature-first-use' | 'manual';
  version: string;
}

interface OnboardingTooltipsProps {
  currentFlowId?: string;
  flows: OnboardingFlow[];
  onComplete?: (flowId: string) => void;
  onSkip?: (flowId: string, stepIndex: number) => void;
  userId: string;
}

export const OnboardingTooltips: React.FC<OnboardingTooltipsProps> = ({
  flows,
  currentFlowId,
  userId,
  onComplete,
  onSkip,
}) => {
  const [activeFlow, setActiveFlow] = useState<null | OnboardingFlow>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const currentStep = activeFlow?.steps[currentStepIndex];

  // Calculate tooltip position
  const calculatePosition = useCallback(
    (targetElement: Element, position: string = 'auto') => {
      const targetRect = targetElement.getBoundingClientRect();
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();

      if (!tooltipRect) return { x: 0, y: 0 };

      let x = 0;
      let y = 0;
      const offset = 12;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      switch (position) {
        case 'top':
          x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          y = targetRect.top - tooltipRect.height - offset;
          break;
        case 'bottom':
          x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          y = targetRect.bottom + offset;
          break;
        case 'left':
          x = targetRect.left - tooltipRect.width - offset;
          y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          break;
        case 'right':
          x = targetRect.right + offset;
          y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          break;
        default: // auto
          // Smart positioning based on viewport space
          if (targetRect.top > tooltipRect.height + offset) {
            // Top
            x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
            y = targetRect.top - tooltipRect.height - offset;
          } else if (
            viewportHeight - targetRect.bottom >
            tooltipRect.height + offset
          ) {
            // Bottom
            x = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
            y = targetRect.bottom + offset;
          } else if (targetRect.left > tooltipRect.width + offset) {
            // Left
            x = targetRect.left - tooltipRect.width - offset;
            y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          } else {
            // Right
            x = targetRect.right + offset;
            y = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
          }
          break;
      }

      // Keep tooltip in viewport
      x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8));
      y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8));

      return { x, y };
    },
    []
  );

  // Initialize flow
  useEffect(() => {
    if (currentFlowId) {
      const flow = flows.find(f => f.id === currentFlowId);
      if (flow) {
        setActiveFlow(flow);
        setCurrentStepIndex(0);
        setIsVisible(true);
      }
    }
  }, [currentFlowId, flows]);

  // Update tooltip position when step changes
  useEffect(() => {
    if (currentStep && isVisible) {
      const targetElement = document.querySelector(currentStep.targetSelector);
      if (targetElement) {
        // Add highlight effect
        if (currentStep.highlight) {
          targetElement.classList.add('onboarding-highlight');
        }

        // Calculate position after a brief delay to ensure DOM is ready
        setTimeout(() => {
          if (targetElement) {
            const position = calculatePosition(
              targetElement,
              currentStep?.position || 'auto'
            );
            setTooltipPosition(position);
          }
        }, 100);

        // Scroll target into view
        targetElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });

        return () => {
          targetElement?.classList.remove('onboarding-highlight');
        };
      }
    }
    return undefined;
  }, [currentStep, isVisible, calculatePosition]);

  const nextStep = () => {
    if (!activeFlow || currentStepIndex >= activeFlow.steps.length - 1) {
      completeFlow();
      return;
    }

    setCurrentStepIndex(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const skipFlow = () => {
    if (activeFlow) {
      onSkip?.(activeFlow.id, currentStepIndex);
      closeFlow();
    }
  };

  const completeFlow = () => {
    if (activeFlow) {
      // Mark flow as completed for this user
      const completedFlows = JSON.parse(
        localStorage.getItem(`onboarding-completed-${userId}`) || '[]'
      );
      completedFlows.push({
        flowId: activeFlow.id,
        version: activeFlow.version,
        completedAt: new Date().toISOString(),
      });
      localStorage.setItem(
        `onboarding-completed-${userId}`,
        JSON.stringify(completedFlows)
      );

      onComplete?.(activeFlow.id);
      closeFlow();
    }
  };

  const closeFlow = () => {
    setIsVisible(false);
    setActiveFlow(null);
    setCurrentStepIndex(0);

    // Remove any highlights
    document.querySelectorAll('.onboarding-highlight').forEach(el => {
      el.classList.remove('onboarding-highlight');
    });
  };

  const handleStepAction = () => {
    if (currentStep?.action?.callback) {
      currentStep.action.callback();
    }

    // Auto-advance after action
    setTimeout(nextStep, 500);
  };

  if (!isVisible || !activeFlow || !currentStep) return null;

  const progress = ((currentStepIndex + 1) / activeFlow.steps.length) * 100;

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 bg-black bg-opacity-20 z-40' />

      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          className='fixed z-50 max-w-sm'
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <Card className='shadow-2xl border-2 border-blue-200 bg-white'>
            {/* Header */}
            <div className='p-4 pb-0'>
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center space-x-2'>
                  <div className='p-1 bg-blue-100 rounded-full'>
                    <Lightbulb className='h-4 w-4 text-blue-600' />
                  </div>
                  <Badge variant='secondary' className='text-xs'>
                    {currentStepIndex + 1} of {activeFlow.steps.length}
                  </Badge>
                </div>
                <Button variant='ghost' size='sm' onClick={closeFlow}>
                  <X className='h-4 w-4' />
                </Button>
              </div>

              <Progress value={progress} className='h-1 mb-4' />
            </div>

            {/* Content */}
            <CardContent className='p-4 pt-0'>
              <div className='space-y-3'>
                <h3 className='font-semibold text-gray-900 flex items-center'>
                  <Sparkles className='h-4 w-4 mr-2 text-blue-500' />
                  {currentStep.title}
                </h3>

                <p className='text-sm text-gray-600 leading-relaxed'>
                  {currentStep.content}
                </p>

                {/* Action button if specified */}
                {currentStep.action && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={handleStepAction}
                    className='w-full'
                  >
                    <Play className='h-3 w-3 mr-2' />
                    {currentStep.action.text}
                  </Button>
                )}

                {/* Navigation */}
                <div className='flex items-center justify-between pt-2 border-t border-gray-100'>
                  <div className='flex space-x-2'>
                    {currentStepIndex > 0 && (
                      <Button size='sm' variant='ghost' onClick={prevStep}>
                        <ChevronLeft className='h-4 w-4 mr-1' />
                        Back
                      </Button>
                    )}

                    {currentStep.showSkip !== false && (
                      <Button size='sm' variant='ghost' onClick={skipFlow}>
                        Skip Tour
                      </Button>
                    )}
                  </div>

                  <Button size='sm' onClick={nextStep}>
                    {currentStepIndex === activeFlow.steps.length - 1 ? (
                      <>
                        <CheckCircle className='h-4 w-4 mr-1' />
                        Finish
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className='h-4 w-4 ml-1' />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pointer/Arrow */}
          <div
            className='absolute w-3 h-3 bg-white border-2 border-blue-200 transform rotate-45 -z-10'
            style={{
              left: '50%',
              top:
                tooltipPosition.y < window.innerHeight / 2
                  ? '-6px'
                  : 'calc(100% - 6px)',
              marginLeft: '-6px',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Global styles for highlighting */}
      <style>{`
        .onboarding-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          animation: pulse-highlight 2s infinite;
        }

        @keyframes pulse-highlight {
          0%, 100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.7), 0 0 0 12px rgba(59, 130, 246, 0.3); }
        }
      `}</style>
    </>
  );
};

// Pre-defined onboarding flows
export const defaultOnboardingFlows: OnboardingFlow[] = [
  {
    id: 'analytics-tour',
    name: 'Analytics Dashboard Tour',
    description: 'Learn about your new AI-powered analytics features',
    version: '1.0.0',
    trigger: 'manual',
    steps: [
      {
        id: 'analytics-header',
        targetSelector: '[data-tour="analytics-header"]',
        title: 'Welcome to Analytics!',
        content:
          "Your new AI-powered analytics dashboard gives you personalized insights into your family's protection level.",
        position: 'bottom',
        highlight: true,
      },
      {
        id: 'protection-score',
        targetSelector: '[data-tour="protection-score"]',
        title: 'Family Protection Score',
        content:
          'This score shows how well your family is protected. Watch it improve as you complete more tasks!',
        position: 'auto',
        highlight: true,
      },
      {
        id: 'smart-insights',
        targetSelector: '[data-tour="smart-insights"]',
        title: 'AI-Powered Insights',
        content:
          "Get personalized recommendations based on your family's specific needs and risk factors.",
        position: 'auto',
        highlight: true,
        action: {
          type: 'click',
          text: 'View Insights',
          callback: () => logger.info('Showing insights panel'),
        },
      },
    ],
  },
  {
    id: 'family-collaboration-tour',
    name: 'Family Collaboration Tour',
    description: 'Discover new ways to collaborate with family members',
    version: '1.0.0',
    trigger: 'feature-first-use',
    steps: [
      {
        id: 'invite-family',
        targetSelector: '[data-tour="invite-family"]',
        title: 'Invite Family Members',
        content:
          'Add family members to collaborate on legacy planning and share important documents.',
        position: 'bottom',
        highlight: true,
      },
      {
        id: 'family-timeline',
        targetSelector: '[data-tour="family-timeline"]',
        title: 'Shared Family Timeline',
        content:
          'View and manage important family dates and milestones together.',
        position: 'auto',
        highlight: true,
      },
      {
        id: 'document-sharing',
        targetSelector: '[data-tour="document-sharing"]',
        title: 'Document Collaboration',
        content:
          'Share documents with family members and collaborate on important decisions.',
        position: 'auto',
        highlight: true,
      },
    ],
  },
];

// Hook for managing onboarding state
export function useOnboarding(userId: string) {
  const [activeFlowId, setActiveFlowId] = useState<null | string>(null);

  const startFlow = (flowId: string) => {
    setActiveFlowId(flowId);
  };

  const hasCompletedFlow = (flowId: string, version: string) => {
    const completed = JSON.parse(
      localStorage.getItem(`onboarding-completed-${userId}`) || '[]'
    );
    return completed.some(
      (c: any) => c.flowId === flowId && c.version === version
    );
  };

  const resetFlow = (flowId: string) => {
    const completed = JSON.parse(
      localStorage.getItem(`onboarding-completed-${userId}`) || '[]'
    );
    const filtered = completed.filter((c: any) => c.flowId !== flowId);
    localStorage.setItem(
      `onboarding-completed-${userId}`,
      JSON.stringify(filtered)
    );
  };

  const handleComplete = (flowId: string) => {
    setActiveFlowId(null);
    logger.info(`Onboarding flow ${flowId} completed`);
  };

  const handleSkip = (flowId: string, stepIndex: number) => {
    setActiveFlowId(null);
    logger.info(`Onboarding flow ${flowId} skipped at step ${stepIndex}`);
  };

  return {
    activeFlowId,
    startFlow,
    hasCompletedFlow,
    resetFlow,
    handleComplete,
    handleSkip,
  };
}