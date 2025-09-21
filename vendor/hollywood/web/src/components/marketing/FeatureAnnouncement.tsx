
/**
 * Feature Announcement Campaign Component
 * Interactive announcement and onboarding for new features
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Award,
  BarChart3,
  Brain,
  ChevronRight,
  Play,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureAnnouncementProps {
  onDismiss?: () => void;
  onFeatureExplore?: (featureId: string) => void;
}

interface NewFeature {
  benefits: string[];
  category: 'analytics' | 'collaboration' | 'mobile' | 'professional';
  demoUrl?: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  isNew: boolean;
  isPremium?: boolean;
  title: string;
}

export const FeatureAnnouncement: React.FC<FeatureAnnouncementProps> = ({
  onFeatureExplore,
  onDismiss,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const newFeatures: NewFeature[] = [
    {
      id: 'ai-analytics',
      title: 'AI-Powered Family Analytics',
      description:
        "Get personalized insights into your family's protection level with smart recommendations and risk assessment.",
      icon: Brain,
      category: 'analytics',
      isNew: true,
      benefits: [
        'Personalized protection recommendations',
        'Risk level assessment and monitoring',
        'Progress tracking with family impact insights',
        'Automated milestone celebrations',
      ],
      demoUrl: '/analytics/demo',
    },
    {
      id: 'family-collaboration',
      title: 'Advanced Family Collaboration',
      description:
        'Collaborate seamlessly with family members on legacy planning, document sharing, and decision making.',
      icon: Users,
      category: 'collaboration',
      isNew: true,
      benefits: [
        'Real-time family member collaboration',
        'Shared family calendar and timeline',
        'Document co-editing and comments',
        'Family decision voting system',
      ],
    },
    {
      id: 'professional-network',
      title: 'Professional Review Network',
      description:
        'Connect with verified attorneys and legal professionals for document reviews and consultations.',
      icon: Shield,
      category: 'professional',
      isNew: true,
      isPremium: true,
      benefits: [
        'Access to verified legal professionals',
        'Professional document reviews',
        'Legal compliance checking',
        'Direct consultation booking',
      ],
    },
    {
      id: 'mobile-experience',
      title: 'Mobile-First Experience',
      description:
        'Optimized mobile interface with touch-friendly controls and progressive loading for better performance.',
      icon: BarChart3,
      category: 'mobile',
      isNew: true,
      benefits: [
        'Touch-optimized interface design',
        'Progressive loading for large datasets',
        'Mobile-specific analytics dashboard',
        'Improved performance and caching',
      ],
    },
  ];

  const categoryColors = {
    analytics: 'bg-blue-500',
    collaboration: 'bg-green-500',
    professional: 'bg-purple-500',
    mobile: 'bg-orange-500',
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % newFeatures.length);
    setHasInteracted(true);
  };

  const prevSlide = () => {
    setCurrentSlide(
      prev => (prev - 1 + newFeatures.length) % newFeatures.length
    );
    setHasInteracted(true);
  };

  const handleExplore = (featureId: string) => {
    setHasInteracted(true);
    onFeatureExplore?.(featureId);
  };

  const handleClose = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  // Auto-advance slides if user hasn't interacted
  useEffect(() => {
    if (!hasInteracted) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % newFeatures.length);
      }, 4000);

      return () => clearInterval(timer);
    }
  }, [hasInteracted, newFeatures.length]);
    return undefined;

  const currentFeature = newFeatures[currentSlide];

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden p-0'>
        <div className='relative bg-gradient-to-br from-blue-50 via-purple-50 to-green-50'>
          {/* Close button */}
          <Button
            variant='ghost'
            size='sm'
            className='absolute top-4 right-4 z-10'
            onClick={handleClose}
          >
            <X className='h-4 w-4' />
          </Button>

          {/* Header */}
          <DialogHeader className='p-6 pb-0'>
            <div className='flex items-center space-x-3 mb-4'>
              <div className='p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full'>
                <Sparkles className='h-6 w-6 text-white' />
              </div>
              <div>
                <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
                  New Features Available!
                </DialogTitle>
                <p className='text-gray-600 mt-1'>
                  We've added powerful new tools to enhance your family
                  protection journey
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className='p-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center'>
              {/* Feature Showcase */}
              <div className='space-y-6'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentFeature.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className='space-y-4'
                  >
                    <div className='flex items-center space-x-3'>
                      <div
                        className={cn(
                          'p-3 rounded-full text-white',
                          categoryColors[currentFeature.category]
                        )}
                      >
                        <currentFeature.icon className='h-6 w-6' />
                      </div>
                      <div className='flex items-center space-x-2'>
                        <h3 className='text-xl font-bold text-gray-900'>
                          {currentFeature.title}
                        </h3>
                        <Badge className='bg-green-100 text-green-800'>
                          <Star className='h-3 w-3 mr-1' />
                          New
                        </Badge>
                        {currentFeature.isPremium && (
                          <Badge className='bg-purple-100 text-purple-800'>
                            <Award className='h-3 w-3 mr-1' />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className='text-gray-600 text-lg leading-relaxed'>
                      {currentFeature.description}
                    </p>

                    <div className='space-y-3'>
                      <h4 className='font-semibold text-gray-900 flex items-center'>
                        <TrendingUp className='h-4 w-4 mr-2 text-green-500' />
                        Key Benefits:
                      </h4>
                      <ul className='space-y-2'>
                        {currentFeature.benefits.map((benefit, index) => (
                          <motion.li
                            key={benefit}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className='flex items-center text-gray-700'
                          >
                            <div className='w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0' />
                            {benefit}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className='flex space-x-3 pt-4'>
                      <Button
                        onClick={() => handleExplore(currentFeature.id)}
                        className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      >
                        <Target className='h-4 w-4 mr-2' />
                        Explore Feature
                      </Button>
                      {currentFeature.demoUrl && (
                        <Button variant='outline'>
                          <Play className='h-4 w-4 mr-2' />
                          Watch Demo
                        </Button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Feature Preview Cards */}
              <div className='space-y-4'>
                <h4 className='font-semibold text-gray-900 text-center mb-4'>
                  All New Features
                </h4>

                <div className='grid grid-cols-1 gap-3'>
                  {newFeatures.map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={cn(
                          'cursor-pointer transition-all hover:shadow-md border-2',
                          index === currentSlide
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                        onClick={() => setCurrentSlide(index)}
                      >
                        <CardContent className='p-4'>
                          <div className='flex items-center space-x-3'>
                            <div
                              className={cn(
                                'p-2 rounded-full text-white',
                                categoryColors[feature.category]
                              )}
                            >
                              <feature.icon className='h-5 w-5' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center space-x-2'>
                                <h5 className='font-medium text-gray-900 truncate'>
                                  {feature.title}
                                </h5>
                                {feature.isNew && (
                                  <Badge className='bg-green-100 text-green-800 text-xs'>
                                    New
                                  </Badge>
                                )}
                                {feature.isPremium && (
                                  <Badge className='bg-purple-100 text-purple-800 text-xs'>
                                    Premium
                                  </Badge>
                                )}
                              </div>
                              <p className='text-sm text-gray-600 truncate mt-1'>
                                {feature.description}
                              </p>
                            </div>
                            {index === currentSlide && (
                              <ChevronRight className='h-5 w-5 text-blue-500' />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slide indicators */}
            <div className='flex justify-center space-x-2 mt-6'>
              {newFeatures.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
                  )}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className='flex justify-between items-center mt-6 pt-6 border-t border-gray-200'>
              <Button
                variant='outline'
                onClick={prevSlide}
                disabled={currentSlide === 0}
              >
                Previous
              </Button>

              <div className='text-sm text-gray-500'>
                {currentSlide + 1} of {newFeatures.length}
              </div>

              <Button
                onClick={
                  currentSlide === newFeatures.length - 1
                    ? handleClose
                    : nextSlide
                }
              >
                {currentSlide === newFeatures.length - 1
                  ? 'Get Started'
                  : 'Next'}
                <ChevronRight className='h-4 w-4 ml-1' />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Feature announcement trigger component
interface FeatureAnnouncementTriggerProps {
  featureVersion: string;
  onShow?: () => void;
  userId: string;
}

export const FeatureAnnouncementTrigger: React.FC<
  FeatureAnnouncementTriggerProps
> = ({ userId, featureVersion, onShow }) => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if user has seen this version of features
    const lastSeenVersion = localStorage.getItem(
      `feature-announcement-${userId}`
    );

    if (lastSeenVersion !== featureVersion) {
      setShouldShow(true);
      onShow?.();
    }
  }, [userId, featureVersion, onShow]);

  const handleDismiss = () => {
    setShouldShow(false);
    localStorage.setItem(`feature-announcement-${userId}`, featureVersion);
  };

  const handleFeatureExplore = (featureId: string) => {
    // Navigate to specific feature
    // Exploring feature: ${featureId}

    // Mark as seen and close
    handleDismiss();

    // Navigate based on feature
    switch (featureId) {
      case 'ai-analytics':
        window.location.hash = '#/analytics';
        break;
      case 'family-collaboration':
        window.location.hash = '#/family';
        break;
      case 'professional-network':
        window.location.hash = '#/professional';
        break;
      case 'mobile-experience':
        // Reload page to show mobile optimizations
        window.location.reload();
        break;
    }
  };

  if (!shouldShow) return null;

  return (
    <FeatureAnnouncement
      onFeatureExplore={handleFeatureExplore}
      onDismiss={handleDismiss}
    />
  );
};
