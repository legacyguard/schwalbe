
/**
 * Professional Profile Dashboard
 * Attorney credential verification and profile management
 */

import _React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Award,
  Briefcase,
  Camera,
  CheckCircle,
  Clock,
  DollarSign,
  Edit3,
  FileText,
  Mail,
  MessageSquare,
  Save,
  Shield,
  Star,
  TrendingUp,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
  DocumentReview,
  ProfessionalPartnership,
  ProfessionalReviewer,
} from '@/types/professional';
import { useTranslation } from 'react-i18next';

interface ProfessionalProfileDashboardProps {
  className?: string;
  onUpdatePartnership?: (updates: Partial<ProfessionalPartnership>) => void;
  onUpdateProfile: (updates: Partial<ProfessionalReviewer>) => void;
  partnership?: ProfessionalPartnership;
  recentReviews?: DocumentReview[];
  reviewer: ProfessionalReviewer;
}

export function ProfessionalProfileDashboard({
  reviewer,
  partnership,
  recentReviews = [],
  onUpdateProfile,
  onUpdatePartnership,
  className,
}: ProfessionalProfileDashboardProps) {
  const { t } = useTranslation('ui/professional-profile-dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(reviewer);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    completionRate: 0,
    averageTime: 0,
    earnings: 0,
  });

  useEffect(() => {
    // Calculate performance stats
    const totalReviews = recentReviews.length;
    const completedReviews = recentReviews.filter(
      r => r.status === 'completed'
    );
    const completionRate =
      totalReviews > 0 ? (completedReviews.length / totalReviews) * 100 : 0;

    // Mock calculations - in real app, these would come from the backend
    setStats({
      totalReviews,
      averageRating: 4.8,
      completionRate,
      averageTime: 2.5,
      earnings: completedReviews.length * 250, // Average fee
    });
  }, [recentReviews]);

  const handleSaveProfile = () => {
    onUpdateProfile(editedProfile);
    setIsEditing(false);
  };

  const getVerificationIcon = (
    status: ProfessionalReviewer['verification_status']
  ) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className='h-5 w-5 text-green-600' />;
      case 'pending':
        return <Clock className='h-5 w-5 text-yellow-600' />;
      case 'rejected':
        return <XCircle className='h-5 w-5 text-red-600' />;
      default:
        return <AlertCircle className='h-5 w-5 text-gray-400' />;
    }
  };

  const getStatusColor = (status: ProfessionalReviewer['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateProfileCompleteness = () => {
    const fields = [
      reviewer.full_name,
      reviewer.professional_title,
      reviewer.bar_number,
      (reviewer.licensed_states?.length || 0) > 0,
      reviewer.specializations?.length > 0,
      reviewer.bio,
      reviewer.hourly_rate,
      reviewer.profile_image_url,
    ];

    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const profileCompleteness = calculateProfileCompleteness();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Profile Header */}
      <Card className='relative overflow-hidden'>
        <div className='absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-600 to-purple-600' />

        <CardContent className='pt-8'>
          <div className='relative flex flex-col md:flex-row items-start md:items-center gap-6'>
            <div className='relative'>
              <Avatar className='w-24 h-24 border-4 border-white shadow-lg'>
                <AvatarImage src={reviewer.profile_image_url} />
                <AvatarFallback className='text-2xl font-semibold'>
                  {reviewer.full_name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>

              <Button
                size='sm'
                variant='outline'
                className='absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white'
              >
                <Camera className='h-4 w-4' />
              </Button>
            </div>

            <div className='flex-1 space-y-2'>
              <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div>
                  <h1 className='text-2xl font-bold text-white'>
                    {reviewer.full_name}
                  </h1>
                  <p className='text-blue-100'>{reviewer.professional_title}</p>
                  {reviewer.law_firm_name && (
                    <p className='text-blue-200 text-sm'>
                      {reviewer.law_firm_name}
                    </p>
                  )}
                </div>

                <div className='flex items-center gap-3'>
                  <Badge
                    className={cn('text-sm', getStatusColor(reviewer.status))}
                  >
                    {reviewer.status}
                  </Badge>

                  <div className='flex items-center gap-1 bg-white/20 rounded-full px-3 py-1'>
                    {getVerificationIcon(reviewer.verification_status)}
                    <span className='text-white text-sm font-medium'>
                      {reviewer.verification_status}
                    </span>
                  </div>

                  <Button
                    variant={isEditing ? 'default' : 'outline'}
                    size='sm'
                    onClick={
                      isEditing ? handleSaveProfile : () => setIsEditing(true)
                    }
                    className={
                      isEditing
                        ? ''
                        : 'bg-white/20 border-white/30 text-white hover:bg-white/30'
                    }
                  >
                    {isEditing ? (
                      <>
                        <Save className='h-4 w-4 mr-2' />
                        {t('buttons.save')}
                      </>
                    ) : (
                      <>
                        <Edit3 className='h-4 w-4 mr-2' />
                        {t('buttons.edit')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completeness Alert */}
      {profileCompleteness < 100 && (
        <Alert className='border-yellow-200 bg-yellow-50'>
          <AlertCircle className='h-4 w-4 text-yellow-600' />
          <AlertTitle className='text-yellow-800'>
            {t('profileCompleteness.title')}
          </AlertTitle>
          <AlertDescription className='text-yellow-700'>
            {t('profileCompleteness.description', { percent: profileCompleteness })}
            <Progress value={profileCompleteness} className='mt-2 h-2' />
          </AlertDescription>
        </Alert>
      )}

      {/* Performance Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>{t('stats.totalReviews')}</p>
                <p className='text-2xl font-bold'>{stats.totalReviews}</p>
              </div>
              <FileText className='h-8 w-8 text-blue-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>{t('stats.averageRating')}</p>
                <div className='flex items-center gap-1'>
                  <p className='text-2xl font-bold'>{stats.averageRating}</p>
                  <Star className='h-5 w-5 text-yellow-500 fill-current' />
                </div>
              </div>
              <Award className='h-8 w-8 text-yellow-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>{t('stats.completionRate')}</p>
                <p className='text-2xl font-bold'>
                  {Math.round(stats.completionRate)}%
                </p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  {t('stats.averageReviewTime')}
                </p>
                <p className='text-2xl font-bold'>{stats.averageTime}h</p>
              </div>
              <Clock className='h-8 w-8 text-purple-600' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>{t('stats.earnings')}</p>
                <p className='text-2xl font-bold'>
                  ${stats.earnings.toLocaleString()}
                </p>
              </div>
              <TrendingUp className='h-8 w-8 text-green-600' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='profile'>{t('tabs.profile')}</TabsTrigger>
          <TabsTrigger value='credentials'>{t('tabs.credentials')}</TabsTrigger>
          <TabsTrigger value='reviews'>{t('tabs.reviews')}</TabsTrigger>
          <TabsTrigger value='settings'>{t('tabs.settings')}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value='profile' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <User className='h-5 w-5' />
                  {t('personalInfo.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {isEditing ? (
                  <>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='full_name'>{t('personalInfo.labels.fullName')}</Label>
                        <Input
                          id='full_name'
                          value={editedProfile.full_name}
                          onChange={e =>
                            setEditedProfile(prev => ({
                              ...prev,
                              full_name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='professional_title'>{t('personalInfo.labels.title')}</Label>
                        <Input
                          id='professional_title'
                          value={editedProfile.professional_title}
                          onChange={e =>
                            setEditedProfile(prev => ({
                              ...prev,
                              professional_title: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='law_firm_name'>{t('personalInfo.labels.lawFirm')}</Label>
                      <Input
                        id='law_firm_name'
                        value={editedProfile.law_firm_name || ''}
                        onChange={e =>
                          setEditedProfile(prev => ({
                            ...prev,
                            law_firm_name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='bio'>{t('personalInfo.labels.professionalBio')}</Label>
                      <Textarea
                        id='bio'
                        value={editedProfile.bio || ''}
                        onChange={e =>
                          setEditedProfile(prev => ({
                            ...prev,
                            bio: e.target.value,
                          }))
                        }
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-muted-foreground' />
                      <span>{reviewer.email}</span>
                    </div>
                    {reviewer.bio && (
                      <div>
                        <h4 className='font-medium mb-2'>{t('personalInfo.labels.bio')}</h4>
                        <p className='text-muted-foreground'>{reviewer.bio}</p>
                      </div>
                    )}
                    <div className='flex items-center gap-2'>
                      <Briefcase className='h-4 w-4 text-muted-foreground' />
                      <span>
                        {t('personalInfo.experience', { years: reviewer.experience_years })}
                      </span>
                    </div>
                    {reviewer.hourly_rate && (
                      <div className='flex items-center gap-2'>
                        <DollarSign className='h-4 w-4 text-muted-foreground' />
                        <span>{t('personalInfo.hourlyRate', { rate: reviewer.hourly_rate })}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Award className='h-5 w-5' />
                  {t('specializations.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap gap-2'>
                  {reviewer.specializations?.map(spec => (
                    <Badge
                      key={spec.id}
                      variant='secondary'
                      className='text-sm'
                    >
                      {spec.name}
                    </Badge>
                  ))}
                </div>
                {reviewer.specializations?.length === 0 && (
                  <p className='text-muted-foreground'>
                    {t('specializations.noSpecializations')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value='credentials' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Shield className='h-5 w-5' />
                {t('credentials.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <Label className='text-base font-medium'>{t('credentials.labels.barNumber')}</Label>
                  <p className='text-muted-foreground'>{reviewer.bar_number}</p>
                </div>

                <div>
                  <Label className='text-base font-medium'>
                    {t('credentials.labels.verificationStatus')}
                  </Label>
                  <div className='flex items-center gap-2 mt-1'>
                    {getVerificationIcon(reviewer.verification_status)}
                    <span className='capitalize'>
                      {reviewer.verification_status}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className='text-base font-medium mb-3 block'>
                  {t('credentials.labels.licensedStates')}
                </Label>
                <div className='flex flex-wrap gap-2'>
                  {reviewer.licensed_states?.map(state => (
                    <Badge key={state} variant='outline' className='text-sm'>
                      {state}
                    </Badge>
                  ))}
                </div>
              </div>

              {reviewer.verification_status === 'pending' && (
                <Alert className='border-yellow-200 bg-yellow-50'>
                  <Clock className='h-4 w-4 text-yellow-600' />
                  <AlertTitle className='text-yellow-800'>
                    {t('credentials.verification.title')}
                  </AlertTitle>
                  <AlertDescription className='text-yellow-700'>
                    {t('credentials.verification.description')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value='reviews' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageSquare className='h-5 w-5' />
                {t('reviews.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentReviews.length > 0 ? (
                <div className='space-y-4'>
                  {recentReviews.slice(0, 5).map(review => (
                    <div
                      key={review.id}
                      className='border rounded-lg p-4 space-y-2'
                    >
                      <div className='flex items-center justify-between'>
                        <Badge variant='outline'>{review.review_type}</Badge>
                        <Badge
                          className={cn(
                            review.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : review.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                          )}
                        >
                          {review.status}
                        </Badge>
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        {t('reviews.requested')} {new Date(review.requested_at).toLocaleDateString()}
                        {review.completed_at && (
                          <>
                            {' '}
                            • {t('reviews.completed')} {new Date(review.completed_at).toLocaleDateString()}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8 text-muted-foreground'>
                  <FileText className='h-12 w-12 mx-auto mb-4 opacity-50' />
                  <p>{t('reviews.noReviews')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value='settings' className='space-y-6'>
          {partnership && onUpdatePartnership && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Users className='h-5 w-5' />
                  {t('partnershipSettings.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <Label className='text-base font-medium'>
                      {t('partnershipSettings.autoAssign.title')}
                    </Label>
                    <p className='text-sm text-muted-foreground'>
                      {t('partnershipSettings.autoAssign.description')}
                    </p>
                  </div>
                  <Switch
                    checked={partnership.auto_assign_enabled}
                    onCheckedChange={checked =>
                      onUpdatePartnership({ auto_assign_enabled: checked })
                    }
                  />
                </div>

                <Separator />

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='max_reviews'>{t('partnershipSettings.labels.maxConcurrentReviews')}</Label>
                    <Input
                      id='max_reviews'
                      type='number'
                      min='1'
                      max='20'
                      value={partnership.max_concurrent_reviews}
                      onChange={e =>
                        onUpdatePartnership({
                          max_concurrent_reviews: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='min_fee'>{t('partnershipSettings.labels.minimumReviewFee')}</Label>
                    <Input
                      id='min_fee'
                      type='number'
                      min='50'
                      step='25'
                      value={partnership.minimum_review_fee}
                      onChange={e =>
                        onUpdatePartnership({
                          minimum_review_fee: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
