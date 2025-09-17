
/**
 * Review Request Workflow Component
 * Email-based workflow for requesting professional document reviews
 */

import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Mail,
  Scale,
  Send,
  Star,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ProfessionalReviewer, ReviewRequest } from '@/types/professional';

interface ReviewRequestWorkflowProps {
  availableReviewers: ProfessionalReviewer[];
  className?: string;
  documentId: string;
  documentName: string;
  documentType: string;
  familyContext: {
    business_interests: boolean;
    complex_assets: boolean;
    family_members_count: number;
    minor_children: boolean;
  };
  onCancel?: () => void;
  onRequestSubmitted: (
    request: Omit<ReviewRequest, 'created_at' | 'id' | 'updated_at' | 'user_id'>
  ) => void;
}

interface RequestForm {
  budget_max?: number;
  deadline?: string;
  preferred_reviewer_id?: string;
  priority: 'high' | 'low' | 'medium' | 'urgent';
  required_specializations: string[];
  review_type: 'basic' | 'certified' | 'comprehensive';
  special_instructions?: string;
}

const REVIEW_TYPES = {
  basic: {
    name: 'Basic Review',
    description: 'Essential legal compliance check and basic recommendations',
    estimatedCost: '$150-250',
    turnaroundTime: '3-5 business days',
    features: [
      'Legal compliance verification',
      'Basic recommendations',
      'Format and structure review',
      'Email summary report',
    ],
  },
  comprehensive: {
    name: 'Comprehensive Review',
    description:
      'Thorough analysis with detailed recommendations and optimizations',
    estimatedCost: '$350-500',
    turnaroundTime: '5-7 business days',
    features: [
      'Complete legal analysis',
      'Detailed improvement recommendations',
      'Family protection optimization',
      'Tax implication review',
      'Comprehensive written report',
      'Follow-up consultation call',
    ],
  },
  certified: {
    name: 'Certified Review',
    description:
      'Attorney-certified review with legal opinion and documentation',
    estimatedCost: '$500-750',
    turnaroundTime: '7-10 business days',
    features: [
      'Full legal certification',
      'Attorney opinion letter',
      'Jurisdiction compliance verification',
      'Multi-attorney review (if needed)',
      'Legal documentation package',
      'Priority support and consultation',
    ],
  },
};

const SPECIALIZATIONS = [
  'estate_planning',
  'wills_trusts',
  'probate',
  'family_law',
  'elder_law',
  'tax_law',
  'business_law',
  'asset_protection',
];

export function ReviewRequestWorkflow({
  documentId,
  documentType,
  documentName,
  familyContext,
  availableReviewers,
  onRequestSubmitted,
  onCancel,
  className,
}: ReviewRequestWorkflowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<RequestForm>({
    review_type: 'comprehensive',
    priority: 'medium',
    required_specializations: ['estate_planning'],
    deadline: undefined,
    budget_max: undefined,
    special_instructions: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (updates: Partial<RequestForm>) => {
    setForm(prev => ({ ...prev, ...updates }));
  };

  const getRecommendedReviewers = () => {
    return availableReviewers
      .filter(
        reviewer =>
          reviewer.status === 'active' &&
          form.required_specializations.some(spec =>
            reviewer.specializations.some(s =>
              s.name.toLowerCase().includes(spec)
            )
          )
      )
      .slice(0, 3);
  };

  const calculateEstimatedCost = () => {
    const basePrice = {
      basic: 200,
      comprehensive: 425,
      certified: 625,
    };

    let cost = basePrice[form.review_type];

    // Priority adjustments
    if (form.priority === 'urgent') cost *= 1.5;
    else if (form.priority === 'high') cost *= 1.25;

    // Family complexity adjustments
    if (familyContext.complex_assets) cost += 50;
    if (familyContext.business_interests) cost += 75;
    if (familyContext.minor_children) cost += 25;

    return Math.round(cost);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const request: Omit<
        ReviewRequest,
        'created_at' | 'id' | 'updated_at' | 'user_id'
      > = {
        document_id: documentId,
        review_type: form.review_type,
        priority: form.priority,
        preferred_reviewer_id: form.preferred_reviewer_id,
        required_specializations: form.required_specializations,
        deadline: form.deadline,
        budget_max: form.budget_max,
        special_instructions: form.special_instructions,
        family_context: familyContext,
        status: 'pending',
      };

      await onRequestSubmitted(request);
    } catch (error) {
      console.error('Error submitting review request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key='step1'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='space-y-6'
          >
            <div>
              <h3 className='text-xl font-semibold mb-4'>Choose Review Type</h3>
              <div className='space-y-4'>
                {(
                  Object.entries(REVIEW_TYPES) as Array<
                    [
                      keyof typeof REVIEW_TYPES,
                      (typeof REVIEW_TYPES)[keyof typeof REVIEW_TYPES],
                    ]
                  >
                ).map(([key, type]) => (
                  <Card
                    key={key}
                    className={cn(
                      'cursor-pointer transition-all border-2',
                      form.review_type === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() => updateForm({ review_type: key })}
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h4 className='font-semibold text-lg'>{type.name}</h4>
                          <p className='text-gray-600 text-sm'>
                            {type.description}
                          </p>
                        </div>
                        <div className='text-right'>
                          <div className='font-semibold text-green-600'>
                            {type.estimatedCost}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {type.turnaroundTime}
                          </div>
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        {type.features.map((feature, index) => (
                          <div key={index} className='flex items-center gap-2'>
                            <CheckCircle className='h-4 w-4 text-green-500 flex-shrink-0' />
                            <span className='text-gray-700'>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor='priority'>Review Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value: any) => updateForm({ priority: value })}
              >
                <SelectTrigger className='mt-1'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='low'>
                    Low Priority - Standard timeline
                  </SelectItem>
                  <SelectItem value='medium'>
                    Medium Priority - Slightly expedited
                  </SelectItem>
                  <SelectItem value='high'>
                    High Priority - Expedited (+25% fee)
                  </SelectItem>
                  <SelectItem value='urgent'>
                    Urgent - Rush service (+50% fee)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key='step2'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='space-y-6'
          >
            <div>
              <h3 className='text-xl font-semibold mb-4'>
                Reviewer Preferences
              </h3>

              <div className='space-y-4'>
                <div>
                  <Label>Required Specializations</Label>
                  <div className='mt-2 space-y-2'>
                    {SPECIALIZATIONS.map(spec => (
                      <div key={spec} className='flex items-center space-x-2'>
                        <Checkbox
                          id={spec}
                          checked={form.required_specializations.includes(spec)}
                          onCheckedChange={checked => {
                            if (checked) {
                              updateForm({
                                required_specializations: [
                                  ...form.required_specializations,
                                  spec,
                                ],
                              });
                            } else {
                              updateForm({
                                required_specializations:
                                  form.required_specializations.filter(
                                    s => s !== spec
                                  ),
                              });
                            }
                          }}
                        />
                        <Label
                          htmlFor={spec}
                          className='font-normal capitalize'
                        >
                          {spec.replace('_', ' ')}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor='deadline'>
                    Preferred Deadline (Optional)
                  </Label>
                  <Input
                    id='deadline'
                    type='date'
                    value={form.deadline || ''}
                    onChange={e =>
                      updateForm({ deadline: e.target.value || undefined })
                    }
                    min={new Date().toISOString().split('T')[0]}
                    className='mt-1'
                  />
                </div>

                <div>
                  <Label htmlFor='budget_max'>Maximum Budget (Optional)</Label>
                  <Input
                    id='budget_max'
                    type='number'
                    value={form.budget_max || ''}
                    onChange={e =>
                      updateForm({
                        budget_max: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder='e.g., 500'
                    className='mt-1'
                  />
                  <p className='text-sm text-gray-600 mt-1'>
                    Estimated cost: ${calculateEstimatedCost()}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommended Reviewers */}
            <div>
              <h4 className='font-semibold mb-3'>Recommended Attorneys</h4>
              <div className='space-y-3'>
                {getRecommendedReviewers().map(reviewer => (
                  <Card
                    key={reviewer.id}
                    className={cn(
                      'cursor-pointer transition-all border-2',
                      form.preferred_reviewer_id === reviewer.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                    onClick={() =>
                      updateForm({ preferred_reviewer_id: reviewer.id })
                    }
                  >
                    <CardContent className='p-4'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <h5 className='font-semibold'>
                            {reviewer.full_name}
                          </h5>
                          <p className='text-sm text-gray-600'>
                            {reviewer.professional_title}
                          </p>
                          {reviewer.law_firm_name && (
                            <p className='text-sm text-gray-500'>
                              {reviewer.law_firm_name}
                            </p>
                          )}
                        </div>
                        <div className='text-right'>
                          <div className='flex items-center gap-1 mb-1'>
                            <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                            <span className='text-sm font-medium'>4.9</span>
                          </div>
                          {reviewer.hourly_rate && (
                            <p className='text-sm text-green-600'>
                              ${reviewer.hourly_rate}/hr
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='mt-2 flex flex-wrap gap-1'>
                        {reviewer.specializations.slice(0, 3).map(spec => (
                          <Badge
                            key={spec.id}
                            variant='secondary'
                            className='text-xs'
                          >
                            {spec.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card
                  className={cn(
                    'cursor-pointer transition-all border-2 border-dashed',
                    !form.preferred_reviewer_id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  )}
                  onClick={() =>
                    updateForm({ preferred_reviewer_id: undefined })
                  }
                >
                  <CardContent className='p-4 text-center'>
                    <Users className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                    <p className='text-sm font-medium'>
                      Auto-assign best match
                    </p>
                    <p className='text-xs text-gray-600'>
                      Let us find the perfect attorney for your needs
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key='step3'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className='space-y-6'
          >
            <div>
              <h3 className='text-xl font-semibold mb-4'>Additional Details</h3>

              <div>
                <Label htmlFor='special_instructions'>
                  Special Instructions or Questions
                </Label>
                <Textarea
                  id='special_instructions'
                  value={form.special_instructions || ''}
                  onChange={e =>
                    updateForm({ special_instructions: e.target.value })
                  }
                  placeholder="Any specific concerns, questions, or areas you'd like the attorney to focus on..."
                  rows={4}
                  className='mt-1'
                />
              </div>
            </div>

            {/* Review Summary */}
            <div className='bg-gray-50 rounded-lg p-6'>
              <h4 className='font-semibold mb-4'>Review Summary</h4>
              <div className='space-y-3 text-sm'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Document:</span>
                  <span className='font-medium'>{documentName}</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Review Type:</span>
                  <span className='font-medium'>
                    {REVIEW_TYPES[form.review_type].name}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Priority:</span>
                  <Badge
                    className={cn(
                      form.priority === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : form.priority === 'high'
                          ? 'bg-orange-100 text-orange-800'
                          : form.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                    )}
                  >
                    {form.priority}
                  </Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Estimated Cost:</span>
                  <span className='font-medium text-green-600'>
                    ${calculateEstimatedCost()}
                  </span>
                </div>
                {form.deadline && (
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>Deadline:</span>
                    <span className='font-medium'>
                      {new Date(form.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Turnaround Time:</span>
                  <span className='font-medium'>
                    {REVIEW_TYPES[form.review_type].turnaroundTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className='bg-blue-50 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <Mail className='h-5 w-5 text-blue-600 mt-0.5' />
                <div>
                  <h5 className='font-semibold text-blue-900 mb-1'>
                    What happens next?
                  </h5>
                  <ol className='text-sm text-blue-700 space-y-1 list-decimal list-inside'>
                    <li>
                      We'll match you with a qualified attorney within 2 hours
                    </li>
                    <li>
                      You'll receive an email with attorney details and
                      confirmation
                    </li>
                    <li>
                      The attorney will begin their review within 24 hours
                    </li>
                    <li>
                      You'll get progress updates throughout the review process
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('max-w-2xl mx-auto', className)}>
      {/* Header */}
      <div className='text-center mb-8'>
        <div className='flex items-center justify-center gap-3 mb-4'>
          <Scale className='h-8 w-8 text-blue-600' />
          <h1 className='text-3xl font-bold text-gray-900'>
            Request Professional Review
          </h1>
        </div>
        <p className='text-gray-600'>
          Get your {documentType.toLowerCase()} professionally reviewed by
          licensed attorneys
        </p>
      </div>

      {/* Progress Steps */}
      <div className='flex justify-center mb-8'>
        <div className='flex items-center space-x-4'>
          {[1, 2, 3].map(step => (
            <div key={step} className='flex items-center'>
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  step < currentStep
                    ? 'bg-green-100 border-green-500 text-green-700'
                    : step === currentStep
                      ? 'bg-blue-100 border-blue-500 text-blue-700'
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                )}
              >
                {step < currentStep ? (
                  <CheckCircle className='h-5 w-5' />
                ) : (
                  <span className='font-medium'>{step}</span>
                )}
              </div>
              {step < 3 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-2 transition-all',
                    step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className='shadow-lg'>
        <CardContent className='p-8'>
          <AnimatePresence mode='wait'>{renderStepContent()}</AnimatePresence>

          {/* Navigation */}
          <div className='flex justify-between mt-8 pt-6 border-t'>
            <div>
              {currentStep > 1 && (
                <Button
                  variant='outline'
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className='flex items-center gap-2'
                >
                  Back
                </Button>
              )}
              {onCancel && currentStep === 1 && (
                <Button
                  variant='outline'
                  onClick={onCancel}
                  className='text-gray-600'
                >
                  Cancel
                </Button>
              )}
            </div>

            <div>
              {currentStep < 3 ? (
                <Button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className='flex items-center gap-2'
                >
                  Continue
                  <ArrowRight className='h-4 w-4' />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className='flex items-center gap-2 bg-green-600 hover:bg-green-700'
                >
                  {isSubmitting ? (
                    <>
                      <Clock className='h-4 w-4 animate-spin' />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className='h-4 w-4' />
                      Submit Request
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
