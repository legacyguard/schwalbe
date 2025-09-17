
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  Star,
  Users,
  XCircle,
} from 'lucide-react';
import type { WillData } from '@/types/will';
import {
  type ConsultationOffer,
  type NotaryMatch,
  professionalNetwork,
  type ProfessionalProfile,
  type ReviewFeedback,
  type ReviewPriority,
  type ReviewRequest,
} from '@/lib/professional-review-network';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  EnhancedTrustSeal,
  type ProfessionalReview,
  type TrustSealLevel,
} from '@/components/trust/EnhancedTrustSeal';
import {
  professionalTrustIntegration,
  type TrustSealUpgrade,
} from '@/lib/professional-trust-integration';
import { toast } from 'sonner';

interface ProfessionalReviewNetworkProps {
  currentTrustLevel?: TrustSealLevel;
  jurisdiction: string;
  onReviewComplete?: (feedback: ReviewFeedback) => void;
  onTrustSealUpgrade?: (upgrade: TrustSealUpgrade) => void;
  professionalReviews?: ProfessionalReview[];
  validationScore?: number;
  willData: WillData;
}

export const ProfessionalReviewNetwork: React.FC<
  ProfessionalReviewNetworkProps
> = ({
  willData,
  jurisdiction,
  onReviewComplete,
  currentTrustLevel = 'basic',
  professionalReviews = [],
  onTrustSealUpgrade,
  validationScore = 0,
}) => {
  const { t } = useTranslation('ui/professional-review-network');
  const [activeTab, setActiveTab] = useState('attorney');
  const [reviewRequest, setReviewRequest] = useState<null | ReviewRequest>(
    null
  );
  const [consultationOffers, setConsultationOffers] = useState<
    ConsultationOffer[]
  >([]);
  const [notaryMatches, setNotaryMatches] = useState<NotaryMatch[]>([]);
  const [_selectedProfessional, _setSelectedProfessional] =
    useState<null | ProfessionalProfile>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<null | ReviewFeedback>(
    null
  );

  // Attorney Review Tab
  const [attorneyForm, setAttorneyForm] = useState({
    priority: 'standard' as ReviewPriority,
    specificConcerns: '',
    budgetMin: 200,
    budgetMax: 800,
    timeline: 'within_week',
    language: 'en',
  });

  // Estate Planner Tab
  const [_plannerLocation, _setPlannerLocation] = useState('');

  // Notary Tab
  const [notaryForm, setNotaryForm] = useState({
    location: '',
    serviceType: 'will_witnessing',
    language: 'en',
    timeframe: 'within_week',
  });

  const handleRequestAttorneyReview = async () => {
    setIsLoading(true);
    try {
      const request = await professionalNetwork.requestAttorneyReview(
        willData,
        jurisdiction,
        {
          priority: attorneyForm.priority,
          specificConcerns: attorneyForm.specificConcerns
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
          budget: {
            min: attorneyForm.budgetMin,
            max: attorneyForm.budgetMax,
            currency: 'EUR',
          },
          timeline: attorneyForm.timeline,
          preferredLanguage: attorneyForm.language,
        }
      );

      setReviewRequest(request);

      // If assigned, simulate review process
      if (request.status === 'assigned') {
        setTimeout(async () => {
          const feedback = await professionalNetwork.submitForReview(request);
          setReviewFeedback(feedback);

          // Process Trust Seal upgrade after review
          try {
            const upgrade =
              await professionalTrustIntegration.processReviewUpgrade(
                request,
                feedback,
                currentTrustLevel,
                professionalReviews
              );

            if (upgrade) {
              const notification =
                professionalTrustIntegration.createUpgradeNotification(upgrade);
              toast.success(notification.title, {
                description: notification.message,
                duration: 8000,
              });
              onTrustSealUpgrade?.(upgrade);
            }
          } catch (error) {
            console.error('Failed to process trust seal upgrade:', error);
          }

          onReviewComplete?.(feedback);
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to request attorney review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetConsultationOffers = async () => {
    setIsLoading(true);
    try {
      const offers =
        await professionalNetwork.getEstateplannerConsultation(willData);
      setConsultationOffers(offers);
    } catch (error) {
      console.error('Failed to get consultation offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindNotaries = async () => {
    setIsLoading(true);
    try {
      const matches = await professionalNetwork.connectWithNotary(
        notaryForm.location,
        willData,
        {
          serviceType: notaryForm.serviceType as any,
          language: notaryForm.language,
          timeframe: notaryForm.timeframe,
        }
      );
      setNotaryMatches(matches);
    } catch (error) {
      console.error('Failed to find notaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfessionalCard = (
    professional: ProfessionalProfile,
    onSelect?: () => void
  ) => (
    <Card
      key={professional.id}
      className='mb-4 hover:shadow-md transition-shadow'
    >
      <CardContent className='p-6'>
        <div className='flex items-start space-x-4'>
          <Avatar className='h-16 w-16'>
            <AvatarImage src={professional.profileImage} />
            <AvatarFallback>
              {professional.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>

          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold'>{professional.name}</h3>
                <p className='text-sm text-gray-600'>
                  {professional.title} at {professional.firm}
                </p>
              </div>
              <div className='flex items-center space-x-2'>
                <div className='flex items-center'>
                  <Star className='h-4 w-4 text-yellow-400 fill-current' />
                  <span className='ml-1 text-sm font-medium'>
                    {professional.rating}
                  </span>
                  <span className='ml-1 text-sm text-gray-500'>
                    ({professional.reviewCount})
                  </span>
                </div>
                <Badge
                  variant={
                    professional.availability === 'immediate'
                      ? 'default'
                      : professional.availability === 'within_24h'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {professional.availability.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className='mt-3 space-y-2'>
              <div className='flex items-center space-x-4 text-sm text-gray-600'>
                <div className='flex items-center'>
                  <MapPin className='h-4 w-4 mr-1' />
                  {professional.location.city}, {professional.location.country}
                </div>
                <div className='flex items-center'>
                  <Users className='h-4 w-4 mr-1' />
                  {professional.languages.join(', ')}
                </div>
              </div>

              <div className='flex flex-wrap gap-1'>
                {professional.specializations.slice(0, 3).map(spec => (
                  <Badge key={spec} variant='outline' className='text-xs'>
                    {spec.replace('_', ' ')}
                  </Badge>
                ))}
              </div>

              <p className='text-sm text-gray-700 line-clamp-2'>
                {professional.bio}
              </p>

              <div className='flex items-center justify-between pt-2'>
                <span className='text-lg font-semibold'>
                  €{professional.hourlyRate}/hour
                </span>
                {onSelect && (
                  <Button onClick={onSelect} variant='outline' size='sm'>
                    Select Professional
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderReviewStatus = () => {
    if (!reviewRequest) return null;

    const statusIcons = {
      pending: <Clock className='h-5 w-5 text-yellow-500' />,
      assigned: <RefreshCw className='h-5 w-5 text-blue-500 animate-spin' />,
      in_review: <RefreshCw className='h-5 w-5 text-blue-500 animate-spin' />,
      completed: <CheckCircle className='h-5 w-5 text-green-500' />,
      requires_revision: <XCircle className='h-5 w-5 text-red-500' />,
    };

    return (
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center space-x-2'>
            {statusIcons[reviewRequest.status]}
            <span>{t('status.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex justify-between items-center'>
              <span className='font-medium'>{t('status.status')}</span>
              <Badge
                variant={
                  reviewRequest.status === 'completed' ? 'default' : 'secondary'
                }
              >
                {reviewRequest.status.replace('_', ' ')}
              </Badge>
            </div>

            {reviewRequest.estimatedCompletion && (
              <div className='flex justify-between items-center'>
                <span className='font-medium'>{t('status.estimated')}</span>
                <span>
                  {reviewRequest.estimatedCompletion.toLocaleDateString()}
                </span>
              </div>
            )}

            <div className='flex justify-between items-center'>
              <span className='font-medium'>{t('status.priority')}</span>
              <Badge variant='outline'>{reviewRequest.priority}</Badge>
            </div>

            {reviewRequest.status === 'in_review' ||
            reviewRequest.status === 'assigned' ? (
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>{t('status.progress')}</span>
                  <span>{t('status.percent', { value: 75 })}</span>
                </div>
                <Progress value={75} className='w-full' />
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderReviewFeedback = () => {
    if (!reviewFeedback) return null;

    return (
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>{t('feedback.title')}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Overall Scores */}
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {reviewFeedback.overall.legalCompliance}%
              </div>
              <div className='text-sm text-gray-600'>{t('feedback.scores.legalCompliance')}</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {reviewFeedback.overall.clarity}%
              </div>
              <div className='text-sm text-gray-600'>{t('feedback.scores.clarity')}</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {reviewFeedback.overall.completeness}%
              </div>
              <div className='text-sm text-gray-600'>{t('feedback.scores.completeness')}</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {reviewFeedback.overall.recommendations}%
              </div>
              <div className='text-sm text-gray-600'>{t('feedback.scores.recommendations')}</div>
            </div>
          </div>

          <Separator />

          {/* Summary */}
          <div>
            <h4 className='font-semibold mb-2'>{t('feedback.summary')}</h4>
            <p className='text-gray-700'>{reviewFeedback.summary}</p>
          </div>

          {/* Specific Issues */}
          {reviewFeedback.specificIssues.length > 0 && (
            <div>
              <h4 className='font-semibold mb-3'>{t('feedback.issues')}</h4>
              <div className='space-y-3'>
                {reviewFeedback.specificIssues.map((issue, index) => (
                  <Alert
                    key={index}
                    variant={
                      issue.severity === 'critical' ? 'destructive' : 'default'
                    }
                  >
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      <div className='space-y-1'>
                        <div className='flex justify-between items-start'>
                          <span className='font-medium'>{issue.category}</span>
                          <Badge
                            variant={
                              issue.severity === 'critical'
                                ? 'destructive'
                                : issue.severity === 'high'
                                  ? 'default'
                                  : issue.severity === 'medium'
                                    ? 'secondary'
                                    : 'outline'
                            }
                          >
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className='text-sm'>{issue.description}</p>
                        <p className='text-sm font-medium'>
                          {t('feedback.recommendation')} {issue.recommendation}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {t('feedback.fixTime')} {issue.estimated_fix_time}
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div>
            <h4 className='font-semibold mb-2'>{t('feedback.nextSteps')}</h4>
            <ul className='list-disc list-inside space-y-1 text-sm text-gray-700'>
              {reviewFeedback.nextSteps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold mb-2'>{t('header.title')}</h2>
        <p className='text-gray-600'>
          {t('header.description')}
        </p>
      </div>

      {/* Current Trust Seal Display */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-1'>
          <EnhancedTrustSeal
            level={currentTrustLevel}
            jurisdiction={jurisdiction}
            lastUpdated={new Date()}
            professionalReviews={professionalReviews}
            validationScore={validationScore}
            className='h-fit'
          />

          {professionalReviews.length === 0 && (
            <Alert className='mt-4'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                <div className='font-medium mb-1'>{t('trust.enhance')}</div>
                <div className='text-sm'>
                  {t('trust.enhanceDesc')}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className='lg:col-span-2 space-y-6'>
          {renderReviewStatus()}
          {renderReviewFeedback()}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='attorney'>{t('tabs.attorney')}</TabsTrigger>
              <TabsTrigger value='planner'>{t('tabs.planner')}</TabsTrigger>
              <TabsTrigger value='notary'>{t('tabs.notary')}</TabsTrigger>
            </TabsList>

            <TabsContent value='attorney' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('attorney.title')}</CardTitle>
                  <CardDescription>
                    {t('attorney.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='priority'>{t('attorney.priority')}</Label>
                      <Select
                        value={attorneyForm.priority}
                        onValueChange={value =>
                          setAttorneyForm(prev => ({
                            ...prev,
                            priority: value as ReviewPriority,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='standard'>
                            {t('attorney.priorityOptions.standard')}
                          </SelectItem>
                          <SelectItem value='urgent'>
                            {t('attorney.priorityOptions.urgent')}
                          </SelectItem>
                          <SelectItem value='express'>
                            {t('attorney.priorityOptions.express')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='language'>{t('attorney.language')}</Label>
                      <Select
                        value={attorneyForm.language}
                        onValueChange={value =>
                          setAttorneyForm(prev => ({
                            ...prev,
                            language: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='en'>English</SelectItem>
                          <SelectItem value='cs'>Czech</SelectItem>
                          <SelectItem value='sk'>Slovak</SelectItem>
                          <SelectItem value='de'>German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='budget-min'>{t('attorney.budget')}</Label>
                      <div className='flex space-x-2'>
                        <Input
                          type='number'
                          placeholder={t('attorney.budgetMin')}
                          value={attorneyForm.budgetMin}
                          onChange={e =>
                            setAttorneyForm(prev => ({
                              ...prev,
                              budgetMin: parseInt(e.target.value),
                            }))
                          }
                        />
                        <Input
                          type='number'
                          placeholder={t('attorney.budgetMax')}
                          value={attorneyForm.budgetMax}
                          onChange={e =>
                            setAttorneyForm(prev => ({
                              ...prev,
                              budgetMax: parseInt(e.target.value),
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor='timeline'>{t('attorney.timeline')}</Label>
                      <Select
                        value={attorneyForm.timeline}
                        onValueChange={value =>
                          setAttorneyForm(prev => ({
                            ...prev,
                            timeline: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='within_week'>
                            {t('attorney.timelineOptions.within_week')}
                          </SelectItem>
                          <SelectItem value='within_month'>
                            {t('attorney.timelineOptions.within_month')}
                          </SelectItem>
                          <SelectItem value='flexible'>
                            {t('attorney.timelineOptions.flexible')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='concerns'>
                      {t('attorney.concerns')}
                    </Label>
                    <Textarea
                      placeholder={t('attorney.concernsPlaceholder')}
                      value={attorneyForm.specificConcerns}
                      onChange={e =>
                        setAttorneyForm(prev => ({
                          ...prev,
                          specificConcerns: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <Button
                    onClick={handleRequestAttorneyReview}
                    disabled={isLoading}
                    className='w-full'
                  >
                    {isLoading ? t('attorney.processing') : t('attorney.submit')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='planner' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('planner.title')}</CardTitle>
                  <CardDescription>
                    {t('planner.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Button
                    onClick={handleGetConsultationOffers}
                    disabled={isLoading}
                    className='w-full'
                  >
                    {isLoading ? t('planner.finding') : t('planner.find')}
                  </Button>
                </CardContent>
              </Card>

              {consultationOffers.map(offer => (
                <Card key={offer.id}>
                  <CardHeader>
                    <CardTitle className='flex justify-between items-start'>
                      <span>{t('planner.proposal')}</span>
                      <Badge variant='outline'>
                        {offer.willComplexityAssessment.complexity}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                      <div>
                        <span className='text-sm font-medium'>
                          {t('planner.estimatedHours')}
                        </span>
                        <div className='text-2xl font-bold'>
                          {offer.willComplexityAssessment.estimatedHours}h
                        </div>
                      </div>
                      <div>
                        <span className='text-sm font-medium'>
                          {t('planner.totalEstimate')}
                        </span>
                        <div className='text-2xl font-bold'>
                          €{offer.totalEstimate.min}-{offer.totalEstimate.max}
                        </div>
                      </div>
                      <div>
                        <span className='text-sm font-medium'>{t('planner.timeline')}</span>
                        <div className='text-lg font-semibold'>
                          {offer.proposedTimeline}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className='font-semibold mb-2'>
                        {t('planner.keyIssues')}
                      </h4>
                      <ul className='list-disc list-inside text-sm space-y-1'>
                        {offer.willComplexityAssessment.keyIssues.map(
                          (issue, index) => (
                            <li key={index}>{issue}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <div>
                      <h4 className='font-semibold mb-2'>
                        {t('planner.recommendedServices')}
                      </h4>
                      <div className='space-y-2'>
                        {offer.recommendedServices.map((service, index) => (
                          <div
                            key={index}
                            className='flex justify-between items-center p-3 bg-gray-50 rounded-lg'
                          >
                            <div>
                              <span className='font-medium'>
                                {service.service}
                              </span>
                              <p className='text-sm text-gray-600'>
                                {service.description}
                              </p>
                            </div>
                            <div className='text-right'>
                              <Badge
                                variant={
                                  service.priority === 'essential'
                                    ? 'default'
                                    : service.priority === 'recommended'
                                      ? 'secondary'
                                      : 'outline'
                                }
                              >
                                {t(`planner.priority.${service.priority}`)}
                              </Badge>
                              <div className='text-sm font-medium'>
                                €{service.estimatedCost}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className='flex justify-between items-center pt-4 border-t'>
                      <span className='text-sm text-gray-600'>
                        {t('planner.validUntil')} {offer.validUntil.toLocaleDateString()}
                      </span>
                      <Button>{t('planner.acceptProposal')}</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value='notary' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>{t('notary.title')}</CardTitle>
                  <CardDescription>
                    {t('notary.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='location'>{t('notary.location')}</Label>
                      <Input
                        placeholder={t('notary.locationPlaceholder')}
                        value={notaryForm.location}
                        onChange={e =>
                          setNotaryForm(prev => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor='service-type'>{t('notary.serviceType')}</Label>
                      <Select
                        value={notaryForm.serviceType}
                        onValueChange={value =>
                          setNotaryForm(prev => ({
                            ...prev,
                            serviceType: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='will_witnessing'>
                            {t('notary.serviceOptions.will_witnessing')}
                          </SelectItem>
                          <SelectItem value='document_certification'>
                            {t('notary.serviceOptions.document_certification')}
                          </SelectItem>
                          <SelectItem value='full_notarization'>
                            {t('notary.serviceOptions.full_notarization')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='notary-language'>{t('notary.language')}</Label>
                      <Select
                        value={notaryForm.language}
                        onValueChange={value =>
                          setNotaryForm(prev => ({ ...prev, language: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='en'>English</SelectItem>
                          <SelectItem value='cs'>Czech</SelectItem>
                          <SelectItem value='sk'>Slovak</SelectItem>
                          <SelectItem value='de'>German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='timeframe'>{t('notary.timeframe')}</Label>
                      <Select
                        value={notaryForm.timeframe}
                        onValueChange={value =>
                          setNotaryForm(prev => ({ ...prev, timeframe: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='within_week'>
                            {t('notary.timeframeOptions.within_week')}
                          </SelectItem>
                          <SelectItem value='within_month'>
                            {t('notary.timeframeOptions.within_month')}
                          </SelectItem>
                          <SelectItem value='flexible'>
                            {t('notary.timeframeOptions.flexible')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleFindNotaries}
                    disabled={isLoading || !notaryForm.location}
                    className='w-full'
                  >
                    {isLoading ? t('notary.finding') : t('notary.find')}
                  </Button>
                </CardContent>
              </Card>

              {notaryMatches.map(match => (
                <Card key={match.professional.id}>
                  <CardContent className='p-0'>
                    {renderProfessionalCard(match.professional)}

                    <div className='px-6 pb-6 space-y-4'>
                      <Separator />

                      <div>
                        <h4 className='font-semibold mb-3'>
                          {t('notary.availableServices')}
                        </h4>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                          {match.services.map((service, index) => (
                            <div
                              key={index}
                              className='flex justify-between items-center p-2 bg-gray-50 rounded'
                            >
                              <span className='text-sm'>{service.service}</span>
                              <div className='text-right'>
                                <div className='text-sm font-medium'>
                                  €{service.price}
                                </div>
                                <div className='text-xs text-gray-500'>
                                  {service.duration}min
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className='font-semibold mb-3'>
                          {t('notary.availableAppointments')}
                        </h4>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                          {match.availableSlots
                            .slice(0, 4)
                            .map((slot, index) => (
                              <div
                                key={index}
                                className='flex justify-between items-center p-2 border rounded'
                              >
                                <div>
                                  <div className='text-sm font-medium'>
                                    {slot.date.toLocaleDateString()} at{' '}
                                    {slot.time}
                                  </div>
                                  <div className='text-xs text-gray-500'>
                                    {slot.type} • {slot.duration}min
                                  </div>
                                </div>
                                <Button size='sm' variant='outline'>
                                  {t('notary.book')}
                                </Button>
                              </div>
                            ))}
                        </div>
                      </div>

                      {match.distanceFromUser && (
                        <div className='flex items-center text-sm text-gray-600'>
                          <MapPin className='h-4 w-4 mr-1' />
                          {t('notary.away', { km: match.distanceFromUser.toFixed(1) })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
