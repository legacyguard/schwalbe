
/**
 * Professional Service Recommendation Engine
 * AI-powered matching system for legal services
 */

import _React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  MapPin,
  Search,
  Shield,
  Sliders,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ProfessionalReviewer } from '@/types/professional';

interface RecommendationCriteria {
  budget: {
    max: number;
    min: number;
  };
  communicationPreference: 'any' | 'in_person' | 'phone' | 'video';
  documentTypes: string[];
  experienceLevel: 'any' | 'expert' | 'junior' | 'senior';
  familyContext: {
    businessInterests: boolean;
    complexAssets: boolean;
    internationalAssets: boolean;
    minorChildren: boolean;
    multiState: boolean;
  };
  preferredLocation?: string;
  requiresSpecializations: string[];
  serviceType: 'consultation' | 'ongoing' | 'review';
  urgency: 'high' | 'low' | 'medium';
}

interface ProfessionalRecommendation {
  availability: 'immediate' | 'next_week' | 'same_day' | 'this_week';
  budgetFit: 'good' | 'perfect' | 'stretch';
  clientReviews: {
    count: number;
    rating: number;
    recentReviews: Array<{
      comment: string;
      date: string;
      rating: number;
      verified: boolean;
    }>;
  };
  estimatedCost: number;
  locationMatch: boolean;
  matchReasons: string[];
  matchScore: number;
  professional: ProfessionalReviewer;
  specialtyMatch: boolean;
  suggestedServices: Array<{
    description: string;
    estimatedCost: number;
    timeline: string;
    type: 'consultation' | 'retainer' | 'review';
  }>;
}

interface ProfessionalRecommendationEngineProps {
  className?: string;
  initialCriteria?: Partial<RecommendationCriteria>;
  onSelectProfessional: (
    professional: ProfessionalReviewer,
    service?: string
  ) => void;
}

// Document types will be translated, keys defined here
const DOCUMENT_TYPE_KEYS = [
  'lastWillTestament',
  'livingTrust',
  'powerOfAttorney',
  'healthcareDirective',
  'businessAgreement',
  'realEstateDocuments',
  'assetTransfer',
  'taxPlanning',
];

// Specializations will be translated, keys defined here
const SPECIALIZATION_KEYS = [
  'estatePlanning',
  'taxLaw',
  'businessLaw',
  'realEstateLaw',
  'familyLaw',
  'elderLaw',
  'assetProtection',
  'probateLaw',
];

const SAMPLE_PROFESSIONALS: ProfessionalRecommendation[] = [
  {
    professional: {
      id: '1',
      userId: 'user1',
      email: 'sarah.johnson@law.com',
      fullName: 'Sarah Johnson',
      full_name: 'Sarah Johnson',
      professional_title: 'Estate Planning Attorney',
      law_firm_name: 'Johnson & Associates',
      bar_number: '123456',
      licensed_states: ['California', 'Nevada'],
      type: 'attorney',
      licenseNumber: '123456',
      jurisdiction: 'California',
      specializations: [
        { id: '1', name: 'Estate Planning', category: 'estate_planning' },
        { id: '2', name: 'Tax Law', category: 'tax_law' },
      ],
      experience: 15,
      experience_years: 15,
      verified: true,
      onboardingStatus: 'approved',
      createdAt: '2024-01-01',
      created_at: '2024-01-01',
      updatedAt: '2024-01-01',
      updated_at: '2024-01-01',
    },
    matchScore: 95,
    matchReasons: [
      'Perfect specialization match',
      'Extensive experience with complex estates',
      'Excellent client reviews',
      'Available this week',
    ],
    estimatedCost: 2800,
    availability: 'this_week',
    specialtyMatch: true,
    locationMatch: true,
    budgetFit: 'good',
    clientReviews: {
      rating: 4.9,
      count: 127,
      recentReviews: [
        {
          rating: 5,
          comment:
            'Exceptional service and attention to detail. Made the estate planning process smooth and understandable.',
          date: '2024-01-10',
          verified: true,
        },
        {
          rating: 5,
          comment:
            'Sarah helped us navigate complex tax implications with our family trust. Highly recommended.',
          date: '2024-01-05',
          verified: true,
        },
      ],
    },
    suggestedServices: [
      {
        type: 'consultation',
        description: 'Initial estate planning consultation (90 minutes)',
        estimatedCost: 525,
        timeline: 'This week',
      },
      {
        type: 'review',
        description: 'Comprehensive document review with recommendations',
        estimatedCost: 1200,
        timeline: '3-5 business days',
      },
    ],
  },
  {
    professional: {
      id: '2',
      userId: 'user2',
      email: 'michael.chen@legalgroup.com',
      fullName: 'Michael Chen',
      full_name: 'Michael Chen',
      professional_title: 'Senior Partner',
      law_firm_name: 'Pacific Legal Group',
      bar_number: '789012',
      licensed_states: ['California', 'Washington', 'Oregon'],
      type: 'attorney',
      licenseNumber: '789012',
      jurisdiction: 'California',
      specializations: [
        { id: '3', name: 'Business Law', category: 'business_law' },
        { id: '4', name: 'Asset Protection', category: 'estate_planning' },
      ],
      experience: 22,
      experience_years: 22,
      verified: true,
      onboardingStatus: 'approved',
      createdAt: '2024-01-01',
      created_at: '2024-01-01',
      updatedAt: '2024-01-01',
      updated_at: '2024-01-01',
    },
    matchScore: 88,
    matchReasons: [
      'Strong business law expertise',
      'Multi-state licensing',
      'Proven track record with business families',
      'Available for urgent matters',
    ],
    estimatedCost: 3600,
    availability: 'same_day',
    specialtyMatch: true,
    locationMatch: true,
    budgetFit: 'stretch',
    clientReviews: {
      rating: 4.8,
      count: 89,
      recentReviews: [
        {
          rating: 5,
          comment:
            'Michael provided excellent guidance for our business succession plan. Very thorough and professional.',
          date: '2024-01-08',
          verified: true,
        },
      ],
    },
    suggestedServices: [
      {
        type: 'consultation',
        description: 'Business succession planning consultation (120 minutes)',
        estimatedCost: 900,
        timeline: 'Same day',
      },
      {
        type: 'retainer',
        description: 'Ongoing legal counsel retainer',
        estimatedCost: 5000,
        timeline: 'Monthly',
      },
    ],
  },
];

export function ProfessionalRecommendationEngine({
  onSelectProfessional,
  initialCriteria,
  className,
}: ProfessionalRecommendationEngineProps) {
  const { t } = useTranslation('ui/professional-recommendations');
  const [criteria, setCriteria] = useState<RecommendationCriteria>({
    serviceType: 'consultation',
    documentTypes: [],
    urgency: 'medium',
    budget: { min: 200, max: 2000 },
    requiresSpecializations: [],
    familyContext: {
      complexAssets: false,
      businessInterests: false,
      minorChildren: false,
      multiState: false,
      internationalAssets: false,
    },
    communicationPreference: 'any',
    experienceLevel: 'any',
    ...initialCriteria,
  });

  const [recommendations, setRecommendations] = useState<
    ProfessionalRecommendation[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [_selectedRecommendation, setSelectedRecommendation] =
    useState<null | ProfessionalRecommendation>(null);

  useEffect(() => {
    generateRecommendations();
  }, [criteria]);

  const generateRecommendations = async () => {
    setIsLoading(true);

    // Simulate API call to recommendation engine
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Apply filtering and scoring logic to sample data
    const scored = SAMPLE_PROFESSIONALS.map(prof => ({
      ...prof,
      matchScore: calculateMatchScore(prof, criteria),
    })).sort((a, b) => b.matchScore - a.matchScore);

    setRecommendations(scored);
    setIsLoading(false);
  };

  const calculateMatchScore = (
    professional: ProfessionalRecommendation,
    criteria: RecommendationCriteria
  ): number => {
    let score = 0;

    // Specialization match
    const profSpecs =
      professional.professional.specializations?.map(s =>
        s.name.toLowerCase()
      ) || [];
    const requiredSpecs = criteria.requiresSpecializations.map(s =>
      s.toLowerCase()
    );
    const specMatch = requiredSpecs.filter(spec =>
      profSpecs.some(
        profSpec => profSpec.includes(spec) || spec.includes(profSpec)
      )
    ).length;

    if (requiredSpecs.length > 0) {
      score += (specMatch / requiredSpecs.length) * 40;
    } else {
      score += 20; // Base score for verified professional
    }

    // Experience level match
    const expYears = professional.professional.experience_years;
    if (criteria.experienceLevel === 'expert' && expYears >= 20) score += 20;
    else if (criteria.experienceLevel === 'senior' && expYears >= 10)
      score += 15;
    else if (criteria.experienceLevel === 'junior' && expYears < 10)
      score += 10;
    else if (criteria.experienceLevel === 'any') score += 10;

    // Budget fit
    const hourlyRate = professional.professional.hourly_rate || 0;
    if (
      hourlyRate >= criteria.budget.min &&
      hourlyRate <= criteria.budget.max
    ) {
      score += 15;
    } else if (hourlyRate <= criteria.budget.max * 1.2) {
      score += 10; // Slight stretch is okay
    }

    // Urgency and availability
    if (
      criteria.urgency === 'high' &&
      professional.availability === 'same_day'
    ) {
      score += 15;
    } else if (
      criteria.urgency === 'medium' &&
      ['same_day', 'this_week'].includes(professional.availability)
    ) {
      score += 10;
    } else if (criteria.urgency === 'low') {
      score += 5;
    }

    // Client reviews
    score += Math.min(professional.clientReviews.rating * 2, 10);

    return Math.min(Math.max(score, 0), 100);
  };

  const getBudgetFitColor = (fit: ProfessionalRecommendation['budgetFit']) => {
    switch (fit) {
      case 'perfect':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'stretch':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityColor = (
    availability: ProfessionalRecommendation['availability']
  ) => {
    switch (availability) {
      case 'immediate':
        return 'text-green-600 bg-green-100';
      case 'same_day':
        return 'text-green-600 bg-green-100';
      case 'this_week':
        return 'text-blue-600 bg-blue-100';
      case 'next_week':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Header */}
      <div className='text-center space-y-4'>
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium'>
          <Sparkles className='h-4 w-4' />
          {t('header.aiPowered')}
        </div>
        <h2 className='text-3xl font-bold'>
          {t('header.title')}
        </h2>
        <p className='text-muted-foreground max-w-2xl mx-auto'>
          {t('header.description')}
        </p>
      </div>

      {/* Criteria Form */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-2'>
              <Target className='h-5 w-5' />
              {t('criteria.title')}
            </CardTitle>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowFilters(!showFilters)}
            >
              <Sliders className='h-4 w-4 mr-2' />
              {showFilters ? t('criteria.hideFilters') : t('criteria.advancedFilters')}
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='space-y-2'>
              <Label>{t('criteria.serviceType.label')}</Label>
              <Select
                value={criteria.serviceType}
                onValueChange={(value: 'consultation' | 'ongoing' | 'review') =>
                  setCriteria(prev => ({ ...prev, serviceType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='review'>{t('criteria.serviceType.review')}</SelectItem>
                  <SelectItem value='consultation'>
                    {t('criteria.serviceType.consultation')}
                  </SelectItem>
                  <SelectItem value='ongoing'>
                    {t('criteria.serviceType.ongoing')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{t('criteria.urgency.label')}</Label>
              <Select
                value={criteria.urgency}
                onValueChange={(value: 'high' | 'low' | 'medium') =>
                  setCriteria(prev => ({ ...prev, urgency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='low'>{t('criteria.urgency.low')}</SelectItem>
                  <SelectItem value='medium'>{t('criteria.urgency.medium')}</SelectItem>
                  <SelectItem value='high'>{t('criteria.urgency.high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label>{t('criteria.experienceLevel.label')}</Label>
              <Select
                value={criteria.experienceLevel}
                onValueChange={(
                  value: 'any' | 'expert' | 'junior' | 'senior'
                ) => setCriteria(prev => ({ ...prev, experienceLevel: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='any'>{t('criteria.experienceLevel.any')}</SelectItem>
                  <SelectItem value='junior'>{t('criteria.experienceLevel.junior')}</SelectItem>
                  <SelectItem value='senior'>{t('criteria.experienceLevel.senior')}</SelectItem>
                  <SelectItem value='expert'>{t('criteria.experienceLevel.expert')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className='space-y-6 border-t pt-6'
              >
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <div>
                      <Label className='text-base font-medium mb-3'>
                        {t('criteria.specializations.label')}
                      </Label>
                      <div className='grid grid-cols-2 gap-2'>
                        {SPECIALIZATION_KEYS.map(specKey => {
                          const specName = t(`specializations.${specKey}`);
                          return (
                            <Button
                              key={specKey}
                              variant={
                                criteria.requiresSpecializations.includes(specName)
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={() => {
                                setCriteria(prev => ({
                                  ...prev,
                                  requiresSpecializations:
                                    prev.requiresSpecializations.includes(specName)
                                      ? prev.requiresSpecializations.filter(
                                          s => s !== specName
                                        )
                                      : [...prev.requiresSpecializations, specName],
                                }));
                              }}
                              className='text-xs h-8'
                            >
                              {specName}
                            </Button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className='text-base font-medium mb-3'>
                        {t('criteria.documentTypes.label')}
                      </Label>
                      <div className='grid grid-cols-2 gap-2'>
                        {DOCUMENT_TYPE_KEYS.slice(0, 4).map(typeKey => {
                          const typeName = t(`documentTypes.${typeKey}`);
                          return (
                            <Button
                              key={typeKey}
                              variant={
                                criteria.documentTypes.includes(typeName)
                                  ? 'default'
                                  : 'outline'
                              }
                              size='sm'
                              onClick={() => {
                                setCriteria(prev => ({
                                  ...prev,
                                  documentTypes: prev.documentTypes.includes(typeName)
                                    ? prev.documentTypes.filter(t => t !== typeName)
                                    : [...prev.documentTypes, typeName],
                                }));
                              }}
                              className='text-xs h-8'
                            >
                              {typeName}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div>
                      <Label className='text-base font-medium mb-3'>
                        {t('criteria.budgetRange.label')}
                      </Label>
                      <div className='space-y-3'>
                        <Slider
                          value={[criteria.budget.min, criteria.budget.max]}
                          onValueChange={(value: number[]) =>
                            setCriteria(prev => ({
                              ...prev,
                              budget: { min: value[0], max: value[1] },
                            }))
                          }
                          max={5000}
                          min={100}
                          step={50}
                          className='w-full'
                        />
                        <div className='flex justify-between text-sm text-muted-foreground'>
                          <span>${criteria.budget.min}</span>
                          <span>${criteria.budget.max}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className='text-base font-medium mb-3'>
                        {t('criteria.familyContext.label')}
                      </Label>
                      <div className='space-y-3'>
                        {[
                          'complexAssets',
                          'businessInterests',
                          'minorChildren',
                          'multiState',
                          'internationalAssets',
                        ].map(key => (
                          <div
                            key={key}
                            className='flex items-center justify-between'
                          >
                            <Label className='text-sm'>
                              {t(`criteria.familyContext.${key}`)}
                            </Label>
                            <Switch
                              checked={
                                criteria.familyContext[
                                  key as keyof typeof criteria.familyContext
                                ]
                              }
                              onCheckedChange={checked =>
                                setCriteria(prev => ({
                                  ...prev,
                                  familyContext: {
                                    ...prev.familyContext,
                                    [key]: checked,
                                  },
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className='p-12 text-center'>
            <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse'>
              <Sparkles className='h-8 w-8 text-purple-600 animate-spin' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>
              {t('loading.title')}
            </h3>
            <p className='text-muted-foreground'>
              {t('loading.description')}
            </p>
            <Progress value={60} className='mt-4 max-w-xs mx-auto' />
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {!isLoading && recommendations.length > 0 && (
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h3 className='text-xl font-semibold'>
              {t('recommendations.title', { count: recommendations.length })}
            </h3>
            <Badge variant='outline' className='bg-green-50 text-green-700'>
              <CheckCircle className='h-3 w-3 mr-1' />
              {t('recommendations.allVerified')}
            </Badge>
          </div>

          <div className='grid grid-cols-1 gap-6'>
            {recommendations.map((recommendation, index) => {
              const { professional } = recommendation;

              return (
                <motion.div
                  key={professional.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className='hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200'>
                    <CardContent className='p-6'>
                      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        {/* Professional Info */}
                        <div className='lg:col-span-2 space-y-4'>
                          <div className='flex items-start gap-4'>
                            <Avatar className='w-16 h-16'>
                              <AvatarImage
                                src={professional.profile_image_url}
                              />
                              <AvatarFallback className='text-lg'>
                                {professional.full_name
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>

                            <div className='flex-1'>
                              <div className='flex items-start justify-between mb-2'>
                                <div>
                                  <h4 className='text-xl font-semibold'>
                                    {professional.full_name}
                                  </h4>
                                  <p className='text-muted-foreground'>
                                    {professional.professional_title}
                                  </p>
                                  {professional.law_firm_name && (
                                    <p className='text-sm text-muted-foreground'>
                                      {professional.law_firm_name}
                                    </p>
                                  )}
                                </div>

                                <div className='flex items-center gap-2'>
                                  <Badge className='bg-green-100 text-green-800'>
                                    {t('recommendations.matchPercentage', { score: recommendation.matchScore })}
                                  </Badge>
                                  {index === 0 && (
                                    <Badge className='bg-purple-100 text-purple-800'>
                                      <Heart className='h-3 w-3 mr-1' />
                                      {t('recommendations.topPick')}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className='flex items-center gap-4 text-sm text-muted-foreground mb-3'>
                                <span className='flex items-center gap-1'>
                                  <Award className='h-4 w-4' />
                                  {t('recommendations.years', { years: professional.experience_years })}
                                </span>
                                <span className='flex items-center gap-1'>
                                  <Star className='h-4 w-4 text-yellow-500 fill-current' />
                                  {t('recommendations.reviews', {
                                    rating: recommendation.clientReviews.rating,
                                    count: recommendation.clientReviews.count
                                  })}
                                </span>
                                <span className='flex items-center gap-1'>
                                  <MapPin className='h-4 w-4' />
                                  {professional.licensed_states?.[0]}
                                  {professional.licensed_states &&
                                    professional.licensed_states.length > 1 &&
                                    ` ${t('recommendations.moreStates', { count: professional.licensed_states.length - 1 })}`}
                                </span>
                              </div>

                              <div className='mb-4'>
                                <Label className='text-sm font-medium mb-2 block'>
                                  {t('recommendations.specializations')}
                                </Label>
                                <div className='flex flex-wrap gap-1'>
                                  {professional.specializations?.map(spec => (
                                    <Badge
                                      key={spec.id}
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      {spec.name}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className='mb-4'>
                                <Label className='text-sm font-medium mb-2 block'>
                                  {t('recommendations.whyMatch')}
                                </Label>
                                <div className='flex flex-wrap gap-1'>
                                  {recommendation.matchReasons.map(
                                    (reason, idx) => (
                                      <Badge
                                        key={idx}
                                        variant='outline'
                                        className='text-xs'
                                      >
                                        {reason}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>

                              {professional.bio && (
                                <p className='text-sm text-muted-foreground'>
                                  {professional.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Service Options & Booking */}
                        <div className='space-y-4'>
                          <div className='grid grid-cols-2 gap-2 text-center'>
                            <div className='p-3 bg-gray-50 rounded-lg'>
                              <p className='text-xs text-muted-foreground'>
                                {t('recommendations.availability')}
                              </p>
                              <Badge
                                className={cn(
                                  'text-xs mt-1',
                                  getAvailabilityColor(
                                    recommendation.availability
                                  )
                                )}
                              >
                                {t(`availability.${recommendation.availability}`)}
                              </Badge>
                            </div>
                            <div className='p-3 bg-gray-50 rounded-lg'>
                              <p className='text-xs text-muted-foreground'>
                                {t('recommendations.budgetFit')}
                              </p>
                              <Badge
                                className={cn(
                                  'text-xs mt-1',
                                  getBudgetFitColor(recommendation.budgetFit)
                                )}
                              >
                                {t(`budgetFit.${recommendation.budgetFit}`)}
                              </Badge>
                            </div>
                          </div>

                          <Separator />

                          <div className='space-y-3'>
                            <Label className='font-medium'>
                              {t('recommendations.suggestedServices')}
                            </Label>
                            {recommendation.suggestedServices.map(
                              (service, idx) => (
                                <div
                                  key={idx}
                                  className='border rounded-lg p-3 hover:border-blue-200 transition-colors'
                                >
                                  <div className='flex items-center justify-between mb-2'>
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      {t(`serviceTypes.${service.type}`)}
                                    </Badge>
                                    <span className='font-semibold'>
                                      ${service.estimatedCost}
                                    </span>
                                  </div>
                                  <p className='text-sm text-muted-foreground mb-1'>
                                    {service.description}
                                  </p>
                                  <p className='text-xs text-muted-foreground flex items-center gap-1'>
                                    <Clock className='h-3 w-3' />
                                    {service.timeline}
                                  </p>
                                </div>
                              )
                            )}
                          </div>

                          <div className='space-y-2'>
                            <Button
                              onClick={() =>
                                onSelectProfessional(
                                  professional,
                                  'consultation'
                                )
                              }
                              className='w-full'
                            >
                              <Calendar className='h-4 w-4 mr-2' />
                              {t('recommendations.bookConsultation')}
                            </Button>
                            <Button
                              variant='outline'
                              onClick={() =>
                                onSelectProfessional(professional, 'review')
                              }
                              className='w-full'
                            >
                              <FileText className='h-4 w-4 mr-2' />
                              {t('recommendations.requestReview')}
                            </Button>
                          </div>

                          <div className='text-center'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() =>
                                setSelectedRecommendation(recommendation)
                              }
                            >
                              {t('recommendations.viewProfile')}
                              <ArrowRight className='h-4 w-4 ml-2' />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Recent Reviews Preview */}
                      {recommendation.clientReviews.recentReviews.length >
                        0 && (
                        <div className='mt-6 pt-6 border-t'>
                          <Label className='font-medium mb-3 block'>
                            {t('recommendations.recentReviews')}
                          </Label>
                          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {recommendation.clientReviews.recentReviews.map(
                              (review, idx) => (
                                <div
                                  key={idx}
                                  className='bg-gray-50 rounded-lg p-3'
                                >
                                  <div className='flex items-center gap-2 mb-2'>
                                    <div className='flex'>
                                      {[...Array(review.rating)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className='h-3 w-3 text-yellow-500 fill-current'
                                        />
                                      ))}
                                    </div>
                                    {review.verified && (
                                      <Badge
                                        variant='outline'
                                        className='text-xs'
                                      >
                                        <Shield className='h-2 w-2 mr-1' />
                                        {t('recommendations.verified')}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className='text-sm text-muted-foreground'>
                                    {review.comment}
                                  </p>
                                  <p className='text-xs text-muted-foreground mt-1'>
                                    {new Date(review.date).toLocaleDateString()}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && recommendations.length === 0 && (
        <Card>
          <CardContent className='p-12 text-center'>
            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <Search className='h-8 w-8 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>{t('noResults.title')}</h3>
            <p className='text-muted-foreground mb-4'>
              {t('noResults.description')}
            </p>
            <Button variant='outline' onClick={() => setShowFilters(true)}>
              <Sliders className='h-4 w-4 mr-2' />
              {t('noResults.adjustFilters')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trust Indicators */}
      <div className='bg-blue-50 rounded-lg p-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 text-center'>
          <div className='space-y-2'>
            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto'>
              <Shield className='h-6 w-6 text-blue-600' />
            </div>
            <h4 className='font-semibold'>{t('trustIndicators.verified.title')}</h4>
            <p className='text-sm text-muted-foreground'>
              {t('trustIndicators.verified.description')}
            </p>
          </div>

          <div className='space-y-2'>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
              <Sparkles className='h-6 w-6 text-green-600' />
            </div>
            <h4 className='font-semibold'>{t('trustIndicators.aiPowered.title')}</h4>
            <p className='text-sm text-muted-foreground'>
              {t('trustIndicators.aiPowered.description')}
            </p>
          </div>

          <div className='space-y-2'>
            <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto'>
              <TrendingUp className='h-6 w-6 text-purple-600' />
            </div>
            <h4 className='font-semibold'>{t('trustIndicators.guarantee.title')}</h4>
            <p className='text-sm text-muted-foreground'>
              {t('trustIndicators.guarantee.description')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
