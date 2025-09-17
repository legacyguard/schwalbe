
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  ArrowRight,
  Calendar,
  Check,
  Crown,
  FileText,
  Heart,
  Lock,
  Shield,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { FAMILY_PLANS, type FamilyPlan } from '@/types/family';
import { useTranslation } from 'react-i18next';

interface FamilyPlanUpgradeProps {
  currentMemberCount: number;
  currentPlan: 'family' | 'free' | 'premium';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onPlanSelect: (planType: 'family' | 'free' | 'premium') => void;
  trigger?: React.ReactNode;
}

const planColors = {
  free: 'border-gray-200 bg-white',
  family: 'border-blue-200 bg-blue-50 ring-2 ring-blue-200',
  premium: 'border-purple-200 bg-purple-50 ring-2 ring-purple-200',
};

// const __planBadgeColors = { // Unused
//   free: 'bg-gray-100 text-gray-800',
//   family: 'bg-blue-100 text-blue-800',
//   premium: 'bg-purple-100 text-purple-800',
// };

const featureIcons = {
  unlimitedDocuments: FileText,
  professionalReviews: Shield,
  emergencyAccess: Heart,
  familyCalendar: Calendar,
  advancedSharing: Users,
  prioritySupport: Zap,
  customBranding: Crown,
};

export function FamilyPlanUpgrade({
  currentPlan,
  currentMemberCount,
  onPlanSelect,
  trigger,
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: FamilyPlanUpgradeProps) {
  const { t } = useTranslation('ui/family-plan-upgrade');
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<
    'family' | 'free' | 'premium'
  >(currentPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'yearly'
  );

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  const handlePlanUpgrade = () => {
    onPlanSelect(selectedPlan);
    onOpenChange(false);
  };

  const getMemberLimitProgress = (plan: FamilyPlan) => {
    if (plan.maxMembers === -1) return 0; // Unlimited
    return Math.min((currentMemberCount / plan.maxMembers) * 100, 100);
  };

  const getSavings = (planType: 'family' | 'premium') => {
    const plan = FAMILY_PLANS[planType];
    const monthlyCost = plan.pricing.monthly * 12;
    const yearlyCost = plan.pricing.yearly;
    const savings = monthlyCost - yearlyCost;
    return Math.round((savings / monthlyCost) * 100);
  };

  const isLimitReached = (plan: FamilyPlan) => {
    return plan.maxMembers !== -1 && currentMemberCount >= plan.maxMembers;
  };

  const renderFeatureList = (plan: FamilyPlan) => {
    const features = [
      {
        key: 'maxMembers',
        label:
          plan.maxMembers === -1
            ? t('features.unlimitedMembers')
            : t('features.maxMembers', { count: plan.maxMembers }),
        enabled: true,
      },
      ...Object.entries(plan.features).map(([key, enabled]) => ({
        key,
        label: key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase()),
        enabled,
      })),
    ];

    return (
      <div className='space-y-3'>
        {features.map(({ key, label, enabled = true }) => {
          const IconComponent = featureIcons[key as keyof typeof featureIcons];

          return (
            <div key={key} className='flex items-center gap-3'>
              {enabled ? (
                <Check className='h-4 w-4 text-green-500 flex-shrink-0' />
              ) : (
                <X className='h-4 w-4 text-gray-400 flex-shrink-0' />
              )}
              <div className='flex items-center gap-2'>
                {IconComponent && (
                  <IconComponent className='h-4 w-4 text-muted-foreground' />
                )}
                <span
                  className={`text-sm ${enabled ? 'text-gray-900' : 'text-gray-500'}`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const PlanCard = ({
    planKey,
    plan,
  }: {
    plan: FamilyPlan;
    planKey: 'family' | 'free' | 'premium';
  }) => {
    const isCurrentPlan = planKey === currentPlan;
    const isSelected = planKey === selectedPlan;
    const isRecommended = planKey === 'family';
    const limitProgress = getMemberLimitProgress(plan);
    const limitReached = isLimitReached(plan);

    return (
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={`relative cursor-pointer transition-all duration-200 ${
            isSelected
              ? planColors[planKey]
              : 'border-gray-200 hover:border-gray-300'
          } ${limitReached && planKey !== 'premium' ? 'opacity-60' : ''}`}
          onClick={() => !limitReached && setSelectedPlan(planKey)}
        >
          {isRecommended && (
            <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
              <Badge className='bg-blue-600 text-white px-3 py-1 shadow-lg'>
                <Star className='h-3 w-3 mr-1' />
                {t('plans.mostPopular')}
              </Badge>
            </div>
          )}

          {isCurrentPlan && (
            <div className='absolute top-4 right-4'>
              <Badge variant='secondary'>Current</Badge>
            </div>
          )}

          <CardHeader className='text-center pb-4'>
            <div className='flex items-center justify-center mb-2'>
              {planKey === 'premium' && (
                <Crown className='h-6 w-6 text-purple-600 mr-2' />
              )}
              {planKey === 'family' && (
                <Users className='h-6 w-6 text-blue-600 mr-2' />
              )}
              {planKey === 'free' && (
                <Heart className='h-6 w-6 text-gray-600 mr-2' />
              )}
              <CardTitle className='capitalize'>{plan.type} Plan</CardTitle>
            </div>

            {plan.pricing.monthly > 0 ? (
              <div className='space-y-1'>
                <div className='text-3xl font-bold'>
                  $
                  {billingCycle === 'yearly'
                    ? plan.pricing.yearly / 12
                    : plan.pricing.monthly}
                  <span className='text-sm font-normal text-muted-foreground'>
                    /month
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className='text-sm text-green-600'>
                    Save {getSavings(planKey as 'family' | 'premium')}% with
                    yearly billing
                  </div>
                )}
              </div>
            ) : (
              <div className='text-3xl font-bold text-green-600'>Free</div>
            )}

            {plan.trialDays && !isCurrentPlan && (
              <Badge variant='outline' className='mt-2'>
                {plan.trialDays} days free trial
              </Badge>
            )}
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* Member limit progress */}
            {plan.maxMembers !== -1 && (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>Family Members</span>
                  <span
                    className={
                      limitProgress >= 90
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                    }
                  >
                    {currentMemberCount}/{plan.maxMembers}
                  </span>
                </div>
                <Progress
                  value={limitProgress}
                  className={limitProgress >= 90 ? 'bg-red-100' : ''}
                />
                {limitReached && (
                  <div className='flex items-center gap-1 text-sm text-red-600'>
                    <Lock className='h-3 w-3' />
                    Limit reached - upgrade to add more members
                  </div>
                )}
              </div>
            )}

            {renderFeatureList(plan)}

            {planKey !== 'free' && (
              <div className='pt-4 border-t'>
                <div className='text-center space-y-2'>
                  <div className='text-sm font-medium'>Total Cost</div>
                  <div className='text-lg font-bold'>
                    $
                    {billingCycle === 'yearly'
                      ? plan.pricing.yearly
                      : plan.pricing.monthly * 12}
                    <span className='text-sm font-normal text-muted-foreground'>
                      /{billingCycle === 'yearly' ? 'year' : '12 months'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const UpgradeButton = trigger || (
    <Button className='gap-2'>
      <Crown className='h-4 w-4' />
      Upgrade Plan
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <div onClick={() => onOpenChange(true)}>{UpgradeButton}</div>}

      <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-center text-2xl'>
            Choose Your Family Protection Plan
          </DialogTitle>
          <p className='text-center text-muted-foreground'>
            Secure your family's future with the right level of protection
          </p>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Billing Toggle */}
          <div className='flex justify-center'>
            <div className='flex items-center bg-gray-100 rounded-lg p-1'>
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setBillingCycle('yearly')}
                className='gap-2'
              >
                Yearly
                <Badge
                  variant='secondary'
                  className='bg-green-100 text-green-800'
                >
                  Save up to 20%
                </Badge>
              </Button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className='grid gap-6 md:grid-cols-3'>
            <AnimatePresence>
              {Object.entries(FAMILY_PLANS).map(([key, plan]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: key === 'family' ? 0.1 : key === 'premium' ? 0.2 : 0,
                  }}
                >
                  <PlanCard
                    planKey={key as 'family' | 'free' | 'premium'}
                    plan={plan}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Family Growth Benefits */}
          <Card className='bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'>
            <CardContent className='p-6'>
              <div className='text-center space-y-4'>
                <div className='flex items-center justify-center gap-2'>
                  <Sparkles className='h-6 w-6 text-purple-600' />
                  <h3 className='text-xl font-semibold'>
                    Family Protection Benefits
                  </h3>
                </div>

                <div className='grid gap-4 md:grid-cols-3 text-sm'>
                  <div className='text-center space-y-2'>
                    <Users className='h-8 w-8 text-blue-600 mx-auto' />
                    <div className='font-medium'>Stronger Together</div>
                    <div className='text-muted-foreground'>
                      Multiple family members create redundancy and shared
                      responsibility
                    </div>
                  </div>

                  <div className='text-center space-y-2'>
                    <Shield className='h-8 w-8 text-green-600 mx-auto' />
                    <div className='font-medium'>Emergency Ready</div>
                    <div className='text-muted-foreground'>
                      Designated emergency contacts can access critical
                      information when needed
                    </div>
                  </div>

                  <div className='text-center space-y-2'>
                    <Heart className='h-8 w-8 text-red-600 mx-auto' />
                    <div className='font-medium'>Peace of Mind</div>
                    <div className='text-muted-foreground'>
                      Know your family is protected and informed about important
                      matters
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className='flex justify-between items-center pt-6 border-t'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Maybe Later
            </Button>

            <div className='flex items-center gap-4'>
              {selectedPlan !== currentPlan && (
                <div className='text-sm text-muted-foreground'>
                  Selected:{' '}
                  <span className='font-medium capitalize'>
                    {selectedPlan} Plan
                  </span>
                </div>
              )}

              <Button
                onClick={handlePlanUpgrade}
                disabled={selectedPlan === currentPlan}
                size='lg'
                className='gap-2'
              >
                {selectedPlan === currentPlan ? (
                  <>
                    <Check className='h-4 w-4' />
                    Current Plan
                  </>
                ) : selectedPlan === 'free' ? (
                  <>
                    <ArrowRight className='h-4 w-4' />
                    Continue with Free
                  </>
                ) : (
                  <>
                    <Crown className='h-4 w-4' />
                    {FAMILY_PLANS[selectedPlan].trialDays
                      ? t('buttons.startTrial')
                      : t('buttons.upgradeNow')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
