
/**
 * Upgrade Prompts and Messaging System
 * Smart upgrade prompts that trigger at optimal moments with compelling value propositions
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Crown,
  Lock,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface UpgradePromptProps {
  currentPlan: 'family' | 'free' | 'premium' | 'professional';
  onDismiss?: () => void;
  onUpgrade?: (plan: string) => void;
  trigger:
    | 'analytics-limit'
    | 'family-limit'
    | 'priority-support'
    | 'professional-review'
    | 'time-capsule';
  userId: string;
}

interface PlanFeature {
  highlight?: boolean;
  included: boolean;
  name: string;
}

interface UpgradePlan {
  description: string;
  features: PlanFeature[];
  id: string;
  name: string;
  period: string;
  popular?: boolean;
  price: string;
  recommended?: boolean;
}

export const UpgradePrompts: React.FC<UpgradePromptProps> = ({
  trigger,
  currentPlan,
  userId,
  onUpgrade,
  onDismiss,
}) => {
  const { t } = useTranslation('ui/upgrade-prompts');
  const [isVisible, setIsVisible] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<null | string>(null);

  const getPromptContent = () => {
    switch (trigger) {
      case 'family-limit':
        return {
          title: t('triggers.familyLimit.title'),
          subtitle: t('triggers.familyLimit.subtitle'),
          description: t('triggers.familyLimit.description'),
          icon: Users,
          urgency: 'high',
          benefits: t('triggers.familyLimit.benefits', { returnObjects: true }) as string[],
        };

      case 'professional-review':
        return {
          title: t('triggers.professionalReview.title'),
          subtitle: t('triggers.professionalReview.subtitle'),
          description: t('triggers.professionalReview.description'),
          icon: Shield,
          urgency: 'medium',
          benefits: t('triggers.professionalReview.benefits', { returnObjects: true }) as string[],
        };

      case 'analytics-limit':
        return {
          title: t('triggers.analyticsLimit.title'),
          subtitle: t('triggers.analyticsLimit.subtitle'),
          description: t('triggers.analyticsLimit.description'),
          icon: TrendingUp,
          urgency: 'low',
          benefits: t('triggers.analyticsLimit.benefits', { returnObjects: true }) as string[],
        };

      case 'time-capsule':
        return {
          title: t('triggers.timeCapsule.title'),
          subtitle: t('triggers.timeCapsule.subtitle'),
          description: t('triggers.timeCapsule.description'),
          icon: Clock,
          urgency: 'medium',
          benefits: t('triggers.timeCapsule.benefits', { returnObjects: true }) as string[],
        };

      case 'priority-support':
        return {
          title: t('triggers.prioritySupport.title'),
          subtitle: t('triggers.prioritySupport.subtitle'),
          description: t('triggers.prioritySupport.description'),
          icon: Crown,
          urgency: 'low',
          benefits: t('triggers.prioritySupport.benefits', { returnObjects: true }) as string[],
        };

      default:
        return {
          title: t('triggers.default.title'),
          subtitle: t('triggers.default.subtitle'),
          description: t('triggers.default.description'),
          icon: Star,
          urgency: 'low',
          benefits: [],
        };
    }
  };

  const plans: UpgradePlan[] = [
    {
      id: 'premium',
      name: t('plans.premium.name'),
      price: t('plans.premium.price'),
      period: t('plans.premium.period'),
      description: t('plans.premium.description'),
      features: (t('plans.premium.features', { returnObjects: true }) as string[]).map((feature, index) => ({
        name: feature,
        included: true,
        highlight: index === 1, // Professional document reviews
      })),
    },
    {
      id: 'family',
      name: t('plans.family.name'),
      price: t('plans.family.price'),
      period: t('plans.family.period'),
      description: t('plans.family.description'),
      popular: true,
      recommended: trigger === 'family-limit',
      features: (t('plans.family.features', { returnObjects: true }) as string[]).map((feature, index) => ({
        name: feature,
        included: true,
        highlight: index === 0 || index === 1, // Unlimited family members and Advanced collaboration tools
      })),
    },
    {
      id: 'professional',
      name: t('plans.professional.name'),
      price: t('plans.professional.price'),
      period: t('plans.professional.period'),
      description: t('plans.professional.description'),
      recommended: trigger === 'professional-review',
      features: (t('plans.professional.features', { returnObjects: true }) as string[]).map((feature, index) => ({
        name: feature,
        included: true,
        highlight: index === 0 || index === 1, // Unlimited attorney consultations and Legal compliance monitoring
      })),
    },
  ];

  const promptContent = getPromptContent();
  const IconComponent = promptContent.icon;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-orange-500 bg-orange-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    onUpgrade?.(planId);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();

    // Track dismissal for smart timing
    const dismissals = JSON.parse(
      localStorage.getItem(`upgrade-dismissals-${userId}`) || '[]'
    );
    dismissals.push({
      trigger,
      dismissedAt: new Date().toISOString(),
      currentPlan,
    });
    localStorage.setItem(
      `upgrade-dismissals-${userId}`,
      JSON.stringify(dismissals)
    );
  };

  if (!isVisible) return null;

  return (
    <Dialog open={isVisible} onOpenChange={setIsVisible}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto p-0'>
        <div className={cn('relative', getUrgencyColor(promptContent.urgency))}>
          {/* Close button */}
          <Button
            variant='ghost'
            size='sm'
            className='absolute top-4 right-4 z-10'
            onClick={handleDismiss}
          >
            <X className='h-4 w-4' />
          </Button>

          {/* Header */}
          <DialogHeader className='p-6 pb-4'>
            <div className='flex items-center space-x-4'>
              <div className='p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full'>
                <IconComponent className='h-8 w-8 text-white' />
              </div>
              <div>
                <DialogTitle className='text-2xl font-bold text-gray-900'>
                  {promptContent.title}
                </DialogTitle>
                <p className='text-lg text-gray-600 mt-1'>
                  {promptContent.subtitle}
                </p>
                <p className='text-gray-600 mt-2'>
                  {promptContent.description}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Benefits */}
          <div className='px-6 pb-4'>
            <Card className='bg-white/70 backdrop-blur-sm'>
              <CardContent className='p-4'>
                <h3 className='font-semibold text-gray-900 mb-3 flex items-center'>
                  <Sparkles className='h-4 w-4 mr-2 text-yellow-500' />
                  {t('benefits.title')}
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                  {promptContent.benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className='flex items-center text-sm text-gray-700'
                    >
                      <CheckCircle className='h-4 w-4 text-green-500 mr-2 flex-shrink-0' />
                      {benefit}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Plans */}
          <div className='p-6 bg-white'>
            <div className='text-center mb-6'>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>
                {t('plans.header.title')}
              </h3>
              <p className='text-gray-600'>
                {t('plans.header.subtitle')}
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'relative',
                    plan.popular || plan.recommended
                      ? 'transform scale-105'
                      : ''
                  )}
                >
                  <Card
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-lg border-2',
                      selectedPlan === plan.id
                        ? 'border-blue-500 bg-blue-50'
                        : plan.popular || plan.recommended
                          ? 'border-purple-500'
                          : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {(plan.popular || plan.recommended) && (
                      <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                        <Badge className='bg-gradient-to-r from-purple-500 to-blue-500 text-white'>
                          <Crown className='h-3 w-3 mr-1' />
                          {plan.popular ? t('plans.badges.mostPopular') : t('plans.badges.recommended')}
                        </Badge>
                      </div>
                    )}

                    <CardHeader className='text-center p-6'>
                      <CardTitle className='text-lg font-bold text-gray-900'>
                        {plan.name}
                      </CardTitle>
                      <div className='text-3xl font-bold text-gray-900 mb-1'>
                        {plan.price}
                        <span className='text-base font-normal text-gray-500'>
                          /{plan.period}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600'>
                        {plan.description}
                      </p>
                    </CardHeader>

                    <CardContent className='px-6 pb-6'>
                      <ul className='space-y-3 mb-6'>
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className='flex items-start text-sm'>
                            <CheckCircle
                              className={cn(
                                'h-4 w-4 mr-3 mt-0.5 flex-shrink-0',
                                feature.highlight
                                  ? 'text-green-500'
                                  : 'text-gray-400'
                              )}
                            />
                            <span
                              className={cn(
                                feature.highlight
                                  ? 'font-medium text-gray-900'
                                  : 'text-gray-600'
                              )}
                            >
                              {feature.name}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={cn(
                          'w-full',
                          plan.popular || plan.recommended
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                            : ''
                        )}
                        onClick={() => handleUpgrade(plan.id)}
                      >
                        {currentPlan === 'free'
                          ? t('buttons.startFreeTrial')
                          : t('buttons.upgradeNow')}
                        <ArrowRight className='h-4 w-4 ml-2' />
                      </Button>

                      {currentPlan === 'free' && (
                        <p className='text-center text-xs text-gray-500 mt-2'>
                          {t('footer.noCardRequired')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className='text-center mt-6 pt-6 border-t border-gray-200'>
              <div className='flex items-center justify-center space-x-6 text-sm text-gray-600'>
                <div className='flex items-center'>
                  <CheckCircle className='h-4 w-4 text-green-500 mr-1' />
                  {t('footer.freeTrial')}
                </div>
                <div className='flex items-center'>
                  <CheckCircle className='h-4 w-4 text-green-500 mr-1' />
                  {t('footer.cancelAnytime')}
                </div>
                <div className='flex items-center'>
                  <CheckCircle className='h-4 w-4 text-green-500 mr-1' />
                  {t('footer.moneyBack')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Smart upgrade trigger component
interface SmartUpgradeTriggerProps {
  currentPlan: 'family' | 'free' | 'premium' | 'professional';
  onUpgrade?: (plan: string) => void;
  userId: string;
}

export const SmartUpgradeTrigger: React.FC<SmartUpgradeTriggerProps> = ({
  userId,
  currentPlan,
  onUpgrade,
}) => {
  const [activeTrigger, setActiveTrigger] = useState<null | string>(null);

  useEffect(() => {
    // Smart trigger logic based on user behavior
    const checkTriggers = () => {
      // Family limit trigger
      if (currentPlan === 'free') {
        const familyMembers = JSON.parse(
          localStorage.getItem(`family-members-${userId}`) || '[]'
        );
        if (familyMembers.length >= 2) {
          setActiveTrigger('family-limit');
          return;
        }
      }

      // Professional review trigger
      const documentsUploaded = JSON.parse(
        localStorage.getItem(`documents-${userId}`) || '[]'
      );
      if (documentsUploaded.length >= 3 && currentPlan === 'free') {
        setActiveTrigger('professional-review');
        return;
      }

      // Analytics limit trigger
      const analyticsViews = parseInt(
        localStorage.getItem(`analytics-views-${userId}`) || '0'
      );
      if (analyticsViews >= 5 && currentPlan === 'free') {
        setActiveTrigger('analytics-limit');
        return;
      }
    };

    // Check triggers after a delay to avoid immediate popup
    const timer = setTimeout(checkTriggers, 2000);
    return () => clearTimeout(timer);
  }, [userId, currentPlan]);

  const shouldShowTrigger = (trigger: string) => {
    // Check dismissal history to avoid spam
    const dismissals = JSON.parse(
      localStorage.getItem(`upgrade-dismissals-${userId}`) || '[]'
    );
    const recentDismissals = dismissals.filter(
      (d: any) =>
        d.trigger === trigger &&
        new Date(d.dismissedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours
    );

    return recentDismissals.length === 0;
  };

  const handleDismiss = () => {
    setActiveTrigger(null);
  };

  if (!activeTrigger || !shouldShowTrigger(activeTrigger)) {
    return null;
  }

  return (
    <UpgradePrompts
      trigger={activeTrigger as any}
      currentPlan={currentPlan}
      userId={userId}
      onUpgrade={onUpgrade}
      onDismiss={handleDismiss}
    />
  );
};

// Inline upgrade prompts for specific features
interface FeatureUpgradePromptProps {
  className?: string;
  currentPlan: string;
  feature: string;
  onUpgrade?: () => void;
}

export const FeatureUpgradePrompt: React.FC<FeatureUpgradePromptProps> = ({
  feature,
  currentPlan: _currentPlan,
  className,
  onUpgrade,
}) => {
  const { t } = useTranslation('ui/upgrade-prompts');

  const getFeatureInfo = () => {
    switch (feature) {
      case 'professional-review':
        return {
          title: t('featurePrompts.professionalReview.title'),
          description: t('featurePrompts.professionalReview.description'),
          requiredPlan: t('featurePrompts.professionalReview.requiredPlan'),
          icon: Shield,
        };
      case 'advanced-analytics':
        return {
          title: t('featurePrompts.advancedAnalytics.title'),
          description: t('featurePrompts.advancedAnalytics.description'),
          requiredPlan: t('featurePrompts.advancedAnalytics.requiredPlan'),
          icon: TrendingUp,
        };
      case 'family-collaboration':
        return {
          title: t('featurePrompts.familyCollaboration.title'),
          description: t('featurePrompts.familyCollaboration.description'),
          requiredPlan: t('featurePrompts.familyCollaboration.requiredPlan'),
          icon: Users,
        };
      default:
        return {
          title: t('featurePrompts.default.title'),
          description: t('featurePrompts.default.description'),
          requiredPlan: t('featurePrompts.default.requiredPlan'),
          icon: Lock,
        };
    }
  };

  const featureInfo = getFeatureInfo();
  const IconComponent = featureInfo.icon;

  return (
    <Card
      className={cn(
        'border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50',
        className
      )}
    >
      <CardContent className='p-6 text-center'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full'>
            <IconComponent className='h-8 w-8 text-white' />
          </div>

          <div>
            <h3 className='text-lg font-bold text-gray-900 mb-2'>
              {featureInfo.title}
            </h3>
            <p className='text-gray-600 mb-4'>{featureInfo.description}</p>
            <Badge className='bg-purple-100 text-purple-800 mb-4'>
              <Crown className='h-3 w-3 mr-1' />
              {featureInfo.requiredPlan} {t('featurePrompts.requiredSuffix')}
            </Badge>
          </div>

          <Button
            onClick={onUpgrade}
            className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          >
            <Star className='h-4 w-4 mr-2' />
            {t('featurePrompts.upgradePrefix')} {featureInfo.requiredPlan}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
