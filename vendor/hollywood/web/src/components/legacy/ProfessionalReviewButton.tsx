
/**
 * Professional Review Button Component
 * Button to request professional review from will wizard and other document contexts
 */

import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Scale,
  Shield,
  Sparkles,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ReviewRequestWorkflow } from '@/components/professional/ReviewRequestWorkflow';
import { useProfessionalReviewTracking } from '@/hooks/useConversionTracking';
import { useABTest } from '@/lib/ab-testing/ab-testing-system';
import type { ProfessionalReviewer, ReviewRequest } from '@/types/professional';

interface ProfessionalReviewButtonProps {
  className?: string;
  documentId: string;
  documentName: string;
  documentType: string;
  familyContext?: {
    business_interests: boolean;
    complex_assets: boolean;
    family_members_count: number;
    minor_children: boolean;
  };
  onReviewRequested?: (
    request: Omit<ReviewRequest, 'created_at' | 'id' | 'updated_at' | 'user_id'>
  ) => void;
  showBenefits?: boolean;
  size?: 'lg' | 'md' | 'sm';
  trustScore?: number;
  variant?: 'banner' | 'button' | 'card';
}

const PROFESSIONAL_BENEFITS = [
  {
    icon: Shield,
    title: 'Legal Compliance',
    description: 'Ensure your documents meet all legal requirements',
  },
  {
    icon: Star,
    title: 'Expert Analysis',
    description: 'Get insights from licensed estate planning attorneys',
  },
  {
    icon: CheckCircle,
    title: 'Peace of Mind',
    description: "Professional validation for your family's protection",
  },
];

export function ProfessionalReviewButton({
  documentId,
  documentType,
  documentName,
  trustScore = 0,
  familyContext = {
    family_members_count: 0,
    minor_children: false,
    complex_assets: false,
    business_interests: false,
  },
  variant = 'button',
  size = 'md',
  showBenefits = false,
  onReviewRequested,
  className,
}: ProfessionalReviewButtonProps) {
  const { variant: _abTestVariant, trackConversion } = useABTest(
    'professional_review_cta_v1'
  );
  const {
    trackReviewButtonViewed: _trackReviewButtonViewed,
    trackReviewButtonClicked,
    trackReviewFlowStarted,
  } = useProfessionalReviewTracking();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [availableReviewers] = useState<ProfessionalReviewer[]>([]); // Mock for now

  const getRecommendedReviewType = () => {
    if (familyContext.complex_assets || familyContext.business_interests) {
      return 'certified';
    } else if (
      familyContext.family_members_count > 2 ||
      familyContext.minor_children
    ) {
      return 'comprehensive';
    }
    return 'basic';
  };

  const getEstimatedCost = () => {
    const recommendedType = getRecommendedReviewType();
    const baseCosts = { basic: 200, comprehensive: 425, certified: 625 };

    let cost = baseCosts[recommendedType];
    if (familyContext.complex_assets) cost += 50;
    if (familyContext.business_interests) cost += 75;
    if (familyContext.minor_children) cost += 25;

    return cost;
  };

  const getTrustScoreBoost = () => {
    const recommendedType = getRecommendedReviewType();
    const boosts = { basic: 15, comprehensive: 25, certified: 35 };
    return boosts[recommendedType];
  };

  const handleReviewRequest = (
    request: Omit<ReviewRequest, 'created_at' | 'id' | 'updated_at' | 'user_id'>
  ) => {
    trackReviewFlowStarted(request.review_type, getEstimatedCost());
    trackConversion('review_flow_started', 1, {
      variant,
      estimatedCost: getEstimatedCost(),
    });
    onReviewRequested?.(request);
    setIsDialogOpen(false);
  };

  const handleButtonClick = () => {
    trackReviewButtonClicked(trustScore, variant);
    trackConversion('button_clicked', 1, { variant, trustScore });
    setIsDialogOpen(true);
  };

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('', className)}
      >
        <Card className='bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <div className='h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center'>
                  <Scale className='h-6 w-6' />
                </div>
                <div>
                  <h3 className='font-semibold text-lg mb-1'>
                    Professional Review Available
                  </h3>
                  <p className='text-blue-100 text-sm'>
                    Get your {documentType.toLowerCase()} reviewed by licensed
                    attorneys
                  </p>
                </div>
              </div>

              <div className='text-right'>
                <div className='text-2xl font-bold mb-1'>
                  +{getTrustScoreBoost()}
                </div>
                <p className='text-blue-100 text-sm'>Trust Score Boost</p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size='lg'
                    className='bg-white text-blue-600 border-white hover:bg-blue-50'
                    onClick={handleButtonClick}
                  >
                    Get Professional Review
                    <ArrowRight className='h-4 w-4 ml-2' />
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
                  <ReviewRequestWorkflow
                    documentId={documentId}
                    documentType={documentType}
                    documentName={documentName}
                    familyContext={familyContext}
                    availableReviewers={availableReviewers}
                    onRequestSubmitted={handleReviewRequest}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('', className)}
      >
        <Card className='border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors'>
          <CardContent className='p-6'>
            <div className='flex items-start gap-4'>
              <div className='h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0'>
                <Scale className='h-6 w-6 text-white' />
              </div>

              <div className='flex-1 space-y-3'>
                <div>
                  <h3 className='font-semibold text-lg text-gray-900 mb-1'>
                    Professional Review
                  </h3>
                  <p className='text-gray-600 text-sm leading-relaxed'>
                    Have your {documentType.toLowerCase()} reviewed by licensed
                    estate planning attorneys. Boost your trust score by +
                    {getTrustScoreBoost()} points and ensure legal compliance.
                  </p>
                </div>

                <div className='flex items-center gap-4 text-sm'>
                  <div className='flex items-center gap-1 text-green-600'>
                    <CheckCircle className='h-4 w-4' />
                    <span>From ${getEstimatedCost()}</span>
                  </div>
                  <div className='flex items-center gap-1 text-blue-600'>
                    <Clock className='h-4 w-4' />
                    <span>3-7 business days</span>
                  </div>
                  <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
                    +{getTrustScoreBoost()} Trust Score
                  </Badge>
                </div>

                {showBenefits && (
                  <div className='grid grid-cols-3 gap-3 pt-3 border-t border-blue-200'>
                    {PROFESSIONAL_BENEFITS.map((benefit, _index) => (
                      <div key={benefit.title} className='text-center'>
                        <benefit.icon className='h-5 w-5 text-blue-600 mx-auto mb-1' />
                        <p className='text-xs font-medium text-gray-700'>
                          {benefit.title}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className='w-full bg-blue-600 hover:bg-blue-700'>
                      Request Professional Review
                      <Sparkles className='h-4 w-4 ml-2' />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
                    <ReviewRequestWorkflow
                      documentId={documentId}
                      documentType={documentType}
                      documentName={documentName}
                      familyContext={familyContext}
                      availableReviewers={availableReviewers}
                      onRequestSubmitted={handleReviewRequest}
                      onCancel={() => setIsDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default button variant
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            'bg-blue-600 hover:bg-blue-700 flex items-center gap-2 relative overflow-hidden',
            sizeClasses[size],
            className
          )}
        >
          {/* Subtle shine effect */}
          <motion.div
            className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'linear',
            }}
          />

          <Scale
            className={cn(
              size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
            )}
          />

          <span className='relative'>Get Professional Review</span>

          {trustScore < 80 && (
            <Badge className='ml-2 bg-yellow-500 text-yellow-900 text-xs px-1.5 py-0.5 h-5'>
              +{getTrustScoreBoost()}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className='max-w-6xl max-h-[90vh] overflow-y-auto'>
        <ReviewRequestWorkflow
          documentId={documentId}
          documentType={documentType}
          documentName={documentName}
          familyContext={familyContext}
          availableReviewers={availableReviewers}
          onRequestSubmitted={handleReviewRequest}
          onCancel={() => setIsDialogOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// Additional component for use in will wizard specifically
export function WillWizardProfessionalReview({
  willData,
  onReviewRequested,
  className,
}: {
  className?: string;
  onReviewRequested?: (
    request: Omit<ReviewRequest, 'created_at' | 'id' | 'updated_at' | 'user_id'>
  ) => void;
  willData: any;
}) {
  const familyContext = {
    family_members_count: willData?.beneficiaries?.length || 0,
    minor_children:
      willData?.beneficiaries?.some((b: any) => b.isMinor) || false,
    complex_assets:
      willData?.assets?.some(
        (a: any) => a.type === 'business' || a.type === 'investment'
      ) || false,
    business_interests:
      willData?.assets?.some((a: any) => a.type === 'business') || false,
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className='bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4'>
        <div className='flex items-start gap-3'>
          <Scale className='h-6 w-6 text-amber-600 mt-0.5' />
          <div>
            <h4 className='font-semibold text-amber-800 mb-2'>
              Consider Professional Review
            </h4>
            <p className='text-amber-700 text-sm leading-relaxed mb-3'>
              Your will contains important provisions for your family's future.
              A professional review by a licensed attorney can ensure everything
              is legally sound and optimized for your family's protection.
            </p>

            {(familyContext.complex_assets ||
              familyContext.business_interests ||
              familyContext.minor_children) && (
              <div className='mb-3'>
                <p className='text-amber-700 text-sm font-medium mb-2'>
                  Recommended because you have:
                </p>
                <ul className='text-xs text-amber-600 space-y-1'>
                  {familyContext.minor_children && (
                    <li>
                      • Minor children requiring special guardianship provisions
                    </li>
                  )}
                  {familyContext.complex_assets && (
                    <li>• Complex assets that may need specialized handling</li>
                  )}
                  {familyContext.business_interests && (
                    <li>• Business interests requiring succession planning</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfessionalReviewButton
        documentId='will-draft'
        documentType='Will'
        documentName='Your Will'
        familyContext={familyContext}
        variant="card"
        showBenefits
        onReviewRequested={onReviewRequested}
        className='border-amber-200 bg-amber-50/50'
      />
    </div>
  );
}
