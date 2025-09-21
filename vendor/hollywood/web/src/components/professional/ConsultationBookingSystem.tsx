
/**
 * Legal Consultation Booking System
 * Professional consultation scheduling with premium UX
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Calendar,
  CheckCircle,
  Info,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
  Star,
  Timer,
  User,
  Video,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ProfessionalReviewer } from '@/types/professional';

interface TimeSlot {
  available: boolean;
  id: string;
  price?: number;
  time: string;
}

interface ConsultationBookingSystemProps {
  className?: string;
  onBookConsultation: (booking: ConsultationBooking) => void;
  onCancel: () => void;
  reviewer: ProfessionalReviewer;
}

interface ConsultationBooking {
  clientInfo: {
    backgroundInfo: string;
    consultationTopic: string;
    email: string;
    name: string;
    phone: string;
    urgencyLevel: 'high' | 'low' | 'medium';
  };
  consultationType: 'in_person' | 'phone' | 'video';
  date: string;
  duration: number;
  reviewerId: string;
  specialRequests?: string;
  time: string;
  totalCost: number;
}

type BookingStep = 'confirmation' | 'details' | 'review' | 'schedule' | 'type';

const CONSULTATION_TYPES = [
  {
    id: 'phone',
    name: 'Phone Consultation',
    description: 'Professional advice over a secure phone call',
    icon: Phone,
    duration: [30, 60],
    priceMultiplier: 1.0,
    features: [
      'Secure phone line',
      'Call recording available',
      'Follow-up summary email',
    ],
  },
  {
    id: 'video',
    name: 'Video Consultation',
    description: 'Face-to-face consultation via secure video call',
    icon: Video,
    duration: [30, 60, 90],
    priceMultiplier: 1.1,
    features: [
      'HD video call',
      'Screen sharing',
      'Session recording',
      'Digital document review',
    ],
  },
  {
    id: 'in_person',
    name: 'In-Person Meeting',
    description: 'Traditional office consultation',
    icon: MapPin,
    duration: [60, 90, 120],
    priceMultiplier: 1.3,
    features: [
      'Office meeting',
      'Document review',
      'Comprehensive discussion',
      'Follow-up materials',
    ],
  },
];

const SAMPLE_AVAILABILITY = {
  '2024-01-15': [
    { id: '1', time: '09:00', available: true },
    { id: '2', time: '10:30', available: true },
    { id: '3', time: '14:00', available: false },
    { id: '4', time: '15:30', available: true },
    { id: '5', time: '17:00', available: true },
  ],
  '2024-01-16': [
    { id: '6', time: '09:00', available: true },
    { id: '7', time: '11:00', available: true },
    { id: '8', time: '13:30', available: true },
    { id: '9', time: '15:00', available: false },
    { id: '10', time: '16:30', available: true },
  ],
  '2024-01-17': [
    { id: '11', time: '08:30', available: true },
    { id: '12', time: '10:00', available: true },
    { id: '13', time: '14:30', available: true },
    { id: '14', time: '16:00', available: true },
  ],
};

export function ConsultationBookingSystem({
  reviewer,
  onBookConsultation,
  onCancel,
  className,
}: ConsultationBookingSystemProps) {
  const { t } = useTranslation('ui/consultation-booking');
  const [currentStep, setCurrentStep] = useState<BookingStep>('type');
  const [booking, setBooking] = useState<Partial<ConsultationBooking>>({
    reviewerId: reviewer.id,
    duration: 60,
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      consultationTopic: '',
      backgroundInfo: '',
      urgencyLevel: 'medium',
    },
  });
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const steps: {
    icon: React.ComponentType<{ className?: string }>;
    key: BookingStep;
    title: string;
  }[] = [
    { key: 'type', title: t('steps.type'), icon: MessageSquare },
    { key: 'schedule', title: t('steps.schedule'), icon: Calendar },
    { key: 'details', title: t('steps.details'), icon: User },
    { key: 'review', title: t('steps.review'), icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (selectedDate && selectedDate in SAMPLE_AVAILABILITY) {
      setAvailableSlots(
        SAMPLE_AVAILABILITY[selectedDate as keyof typeof SAMPLE_AVAILABILITY]
      );
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate]);

  const calculateTotalCost = () => {
    if (!booking.consultationType || !booking.duration) return 0;

    const consultationType = CONSULTATION_TYPES.find(
      t => t.id === booking.consultationType
    );
    const baseRate = 150; // Default hourly rate
    const multiplier = consultationType?.priceMultiplier || 1;
    const hours = booking.duration / 60;

    return Math.round(baseRate * hours * multiplier);
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleBooking = async () => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (
      !booking.consultationType ||
      !booking.date ||
      !booking.time ||
      !booking.duration ||
      !booking.clientInfo
    ) {
      console.error('Missing required booking fields');
      return;
    }

    const finalBooking: ConsultationBooking = {
      reviewerId: booking.reviewerId!,
      consultationType: booking.consultationType,
      date: booking.date,
      time: booking.time,
      duration: booking.duration,
      clientInfo: booking.clientInfo,
      specialRequests: booking.specialRequests,
      totalCost: calculateTotalCost(),
    };

    onBookConsultation(finalBooking);
    setCurrentStep('confirmation');
    setIsLoading(false);
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      });
    }

    return dates;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className='space-y-6'
          >
            <div className='text-center mb-8'>
              <h3 className='text-xl font-semibold mb-2'>
                {t('type.title')}
              </h3>
              <p className='text-muted-foreground'>
                {t('type.subtitle')}
              </p>
            </div>

            <RadioGroup
              value={booking.consultationType}
              onValueChange={(value: 'in_person' | 'phone' | 'video') =>
                setBooking(
                  prev =>
                    ({
                      ...prev,
                      consultationType: value,
                    }) as Partial<ConsultationBooking>
                )
              }
              className='space-y-4'
            >
              {CONSULTATION_TYPES.map(type => {
                const Icon = type.icon;
                const isSelected = booking.consultationType === type.id;

                return (
                  <div key={type.id} className='relative'>
                    <RadioGroupItem
                      value={type.id}
                      id={type.id}
                      className='sr-only'
                    />
                    <label
                      htmlFor={type.id}
                      className={cn(
                        'block p-6 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-300',
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      )}
                    >
                      <div className='flex items-start gap-4'>
                        <div
                          className={cn(
                            'w-12 h-12 rounded-full flex items-center justify-center',
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          )}
                        >
                          <Icon className='h-6 w-6' />
                        </div>

                        <div className='flex-1'>
                          <div className='flex items-center justify-between mb-2'>
                            <h4 className='font-semibold'>{type.name}</h4>
                            <Badge variant='outline'>
                              {t('type.priceLabel', { amount: Math.round(150 * type.priceMultiplier) })}
                            </Badge>
                          </div>

                          <p className='text-muted-foreground mb-3'>
                            {type.description}
                          </p>

                          <div className='space-y-2'>
                            <div className='flex items-center gap-4'>
                              <span className='text-sm text-muted-foreground'>
                                {t('type.availableDurations')}
                              </span>
                              <div className='flex gap-2'>
                                {type.duration.map(duration => (
                                  <Badge
                                    key={duration}
                                    variant='secondary'
                                    className='text-xs'
                                  >
                                    {t('type.min', { value: duration })}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className='text-sm text-muted-foreground'>
                                {t('type.includes')}
                              </span>
                              <ul className='flex flex-wrap gap-x-4 gap-y-1 mt-1'>
                                {type.features.map(feature => (
                                  <li
                                    key={feature}
                                    className='text-sm text-muted-foreground'
                                  >
                                    • {feature}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className='absolute top-4 right-4'>
                          <CheckCircle className='h-6 w-6 text-blue-500' />
                        </div>
                      )}
                    </label>
                  </div>
                );
              })}
            </RadioGroup>

            {booking.consultationType && (
              <Card className='bg-blue-50 border-blue-200'>
                <CardContent className='p-4'>
                  <div className='grid grid-cols-3 gap-4 text-center'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Duration Options
                      </p>
                      <div className='flex flex-wrap justify-center gap-1 mt-1'>
                        {CONSULTATION_TYPES.find(
                          t => t.id === booking.consultationType
                        )?.duration.map(duration => (
                          <Button
                            key={duration}
                            size='sm'
                            variant={
                              booking.duration === duration
                                ? 'default'
                                : 'outline'
                            }
                            onClick={() =>
                              setBooking(
                                prev =>
                                  ({
                                    ...prev,
                                    duration,
                                  }) as Partial<ConsultationBooking>
                              )
                            }
                            className='text-xs h-7'
                          >
                            {duration}min
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Hourly Rate
                      </p>
                      <p className='font-semibold'>
                        $
                        {Math.round(
                          150 *
                            (CONSULTATION_TYPES.find(
                              t => t.id === booking.consultationType
                            )?.priceMultiplier || 1)
                        )}
                        /hour
                      </p>
                    </div>

                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Total Cost
                      </p>
                      <p className='font-bold text-lg'>
                        ${calculateTotalCost()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        );

      case 'schedule':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className='space-y-6'
          >
            <div className='text-center mb-8'>
              <h3 className='text-xl font-semibold mb-2'>{t('schedule.title')}</h3>
              <p className='text-muted-foreground'>
                {t('schedule.subtitle', { name: reviewer.fullName })}
              </p>
            </div>

            {/* Date Selection */}
            <div className='space-y-4'>
              <Label className='text-base font-medium'>{t('schedule.availableDates')}</Label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                {getNextWeekDates().map(dateInfo => (
                  <Button
                    key={dateInfo.date}
                    variant={
                      selectedDate === dateInfo.date ? 'default' : 'outline'
                    }
                    onClick={() => setSelectedDate(dateInfo.date)}
                    className='h-auto p-3 flex flex-col gap-1'
                  >
                    <span className='font-semibold'>
                      {dateInfo.display.split(',')[0]}
                    </span>
                    <span className='text-xs opacity-75'>
                      {dateInfo.display.split(' ').slice(-2).join(' ')}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='space-y-4'
              >
                <Label className='text-base font-medium'>{t('schedule.availableTimes')}</Label>
                <div className='grid grid-cols-3 md:grid-cols-5 gap-3'>
                  {availableSlots.map(slot => (
                    <Button
                      key={slot.id}
                      variant={
                        booking.time === slot.time ? 'default' : 'outline'
                      }
                      disabled={!slot.available}
                      onClick={() =>
                        setBooking(
                          prev =>
                            ({
                              ...prev,
                              time: slot.time,
                              date: selectedDate,
                            }) as Partial<ConsultationBooking>
                        )
                      }
                      className='h-auto p-3 flex flex-col gap-1'
                    >
                      <span className='font-semibold'>{slot.time}</span>
                      {!slot.available && (
                        <span className='text-xs text-red-500'>{t('schedule.booked')}</span>
                      )}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            {booking.date && booking.time && (
              <Alert className='border-green-200 bg-green-50'>
                <CheckCircle className='h-4 w-4 text-green-600' />
                <AlertTitle className='text-green-800'>
                  {t('schedule.selectedTime')}
                </AlertTitle>
                <AlertDescription className='text-green-700'>
                  {t('schedule.selectedTimeDesc', {
                    type: booking.consultationType,
                    date: new Date(booking.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                    time: booking.time,
                    minutes: booking.duration,
                    cost: calculateTotalCost(),
                  })}
                </AlertDescription>
              </Alert>
            )}
          </motion.div>
        );

      case 'details':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className='space-y-6'
          >
            <div className='text-center mb-8'>
              <h3 className='text-xl font-semibold mb-2'>{t('details.title')}</h3>
              <p className='text-muted-foreground'>
                {t('details.subtitle')}
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>{t('details.name')}</Label>
                  <Input
                    id='name'
                    value={booking.clientInfo?.name || ''}
                    onChange={e =>
                      setBooking(
                        prev =>
                          ({
                            ...prev,
                            clientInfo: {
                              ...prev.clientInfo,
                              name: e.target.value,
                            },
                          }) as Partial<ConsultationBooking>
                      )
                    }
                    placeholder={t('details.namePlaceholder')}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>{t('details.email')}</Label>
                  <Input
                    id='email'
                    type='email'
                    value={booking.clientInfo?.email || ''}
                    onChange={e =>
                      setBooking(
                        prev =>
                          ({
                            ...prev,
                            clientInfo: {
                              ...prev.clientInfo,
                              email: e.target.value,
                            },
                          }) as Partial<ConsultationBooking>
                      )
                    }
                    placeholder={t('details.emailPlaceholder')}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone'>{t('details.phone')}</Label>
                  <Input
                    id='phone'
                    type='tel'
                    value={booking.clientInfo?.phone || ''}
                    onChange={e =>
                      setBooking(
                        prev =>
                          ({
                            ...prev,
                            clientInfo: {
                              ...prev.clientInfo,
                              phone: e.target.value,
                            },
                          }) as Partial<ConsultationBooking>
                      )
                    }
                    placeholder={t('details.phonePlaceholder')}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='urgency'>{t('details.urgency')}</Label>
                  <Select
                    value={booking.clientInfo?.urgencyLevel}
                    onValueChange={(value: 'high' | 'low' | 'medium') =>
                      setBooking(
                        prev =>
                          ({
                            ...prev,
                            clientInfo: {
                              ...prev.clientInfo,
                              urgencyLevel: value,
                            },
                          }) as Partial<ConsultationBooking>
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='low'>
                        {t('details.urgencyLow')}
                      </SelectItem>
                      <SelectItem value='medium'>
                        {t('details.urgencyMedium')}
                      </SelectItem>
                      <SelectItem value='high'>
                        {t('details.urgencyHigh')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='topic'>{t('details.topic')}</Label>
                  <Textarea
                    id='topic'
                    value={booking.clientInfo?.consultationTopic || ''}
                    onChange={e =>
                      setBooking(
                        prev =>
                          ({
                            ...prev,
                            clientInfo: {
                              ...prev.clientInfo,
                              consultationTopic: e.target.value,
                            },
                          }) as Partial<ConsultationBooking>
                      )
                    }
                    placeholder={t('details.topicPlaceholder')}
                    rows={3}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='background'>{t('details.background')}</Label>
                  <Textarea
                    id='background'
                    value={booking.clientInfo?.backgroundInfo || ''}
                    onChange={e =>
                      setBooking(
                        prev =>
                          ({
                            ...prev,
                            clientInfo: {
                              ...prev.clientInfo,
                              backgroundInfo: e.target.value,
                            },
                          }) as Partial<ConsultationBooking>
                      )
                    }
                    placeholder={t('details.backgroundPlaceholder')}
                    rows={4}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='requests'>{t('details.requests')}</Label>
                  <Textarea
                    id='requests'
                    value={booking.specialRequests || ''}
                    onChange={e =>
                      setBooking(
                        prev =>
                          ({
                            ...prev,
                            specialRequests: e.target.value,
                          }) as Partial<ConsultationBooking>
                      )
                    }
                    placeholder={t('details.requestsPlaceholder')}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'review':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className='space-y-6'
          >
            <div className='text-center mb-8'>
              <h3 className='text-xl font-semibold mb-2'>{t('review.title')}</h3>
              <p className='text-muted-foreground'>
                {t('review.subtitle')}
              </p>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Attorney Info */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>{t('review.attorney')}</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center gap-4'>
                    <Avatar className='w-16 h-16'>
                      <AvatarImage src={undefined} />
                      <AvatarFallback>
                        {reviewer.fullName
                          .split(' ')
                          .map((n: string) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h4 className='font-semibold'>{reviewer.fullName}</h4>
                      <p className='text-muted-foreground'>{reviewer.type}</p>
                      <p className='text-sm text-muted-foreground'>
                        {reviewer.jurisdiction}
                      </p>
                      <div className='flex items-center gap-1 mt-1'>
                        <Star className='h-4 w-4 text-yellow-500 fill-current' />
                        <span className='text-sm'>4.9 (127 reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2 text-sm'>
                    <div className='flex items-center gap-2'>
                      <Award className='h-4 w-4 text-muted-foreground' />
                      <span>{t('review.experience', { years: reviewer.experience })}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Briefcase className='h-4 w-4 text-muted-foreground' />
                      <span>{reviewer.specializations?.join(', ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Details */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>
                    {t('review.details')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>{t('review.type')}</span>
                      <Badge variant='outline'>
                        {
                          CONSULTATION_TYPES.find(
                            t => t.id === booking.consultationType
                          )?.name
                        }
                      </Badge>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>{t('review.date')}</span>
                      <span className='font-medium'>
                        {booking.date &&
                          new Date(booking.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}
                      </span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>{t('review.time')}</span>
                      <span className='font-medium'>{booking.time}</span>
                    </div>

                    <div className='flex items-center justify-between'>
                      <span className='text-muted-foreground'>{t('review.duration')}</span>
                      <span className='font-medium'>
                        {t('review.minutes', { value: booking.duration })}
                      </span>
                    </div>

                    <Separator />

                    <div className='flex items-center justify-between text-lg font-semibold'>
                      <span>{t('review.total')}</span>
                      <span>${calculateTotalCost()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Client Information Summary */}
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>{t('review.clientInfo')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  <div>
                    <strong>{t('review.name')}</strong> {booking.clientInfo?.name}
                  </div>
                  <div>
                    <strong>{t('review.email')}</strong> {booking.clientInfo?.email}
                  </div>
                  <div>
                    <strong>{t('review.phone')}</strong> {booking.clientInfo?.phone}
                  </div>
                  <div>
                    <strong>{t('review.urgency')}</strong> {booking.clientInfo?.urgencyLevel}
                  </div>
                </div>

                <Separator className='my-3' />

                <div>
                  <strong>{t('review.topic')}</strong>
                  <p className='text-muted-foreground mt-1'>
                    {booking.clientInfo?.consultationTopic}
                  </p>
                </div>

                {booking.clientInfo?.backgroundInfo && (
                  <div>
                    <strong>{t('review.background')}</strong>
                    <p className='text-muted-foreground mt-1'>
                      {booking.clientInfo.backgroundInfo}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Alert className='border-blue-200 bg-blue-50'>
              <Info className='h-4 w-4 text-blue-600' />
              <AlertTitle className='text-blue-800'>
                {t('review.nextTitle')}
              </AlertTitle>
              <AlertDescription className='text-blue-700'>
                {t('review.nextDesc')}
              </AlertDescription>
            </Alert>
          </motion.div>
        );

      case 'confirmation':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='text-center space-y-6 py-8'
          >
            <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto'>
              <CheckCircle className='h-10 w-10 text-green-600' />
            </div>

            <div>
              <h3 className='text-2xl font-bold text-green-800 mb-2'>
                {t('confirmation.title')}
              </h3>
              <p className='text-muted-foreground'>
                {t('confirmation.subtitle', { name: reviewer.fullName })}
              </p>
            </div>

            <Card className='max-w-md mx-auto'>
              <CardContent className='p-6 space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>{t('confirmation.dateTime')}</span>
                  <span className='font-medium'>
                    {booking.date &&
                      new Date(booking.date).toLocaleDateString()}{' '}
                    at {booking.time}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>{t('confirmation.type')}</span>
                  <span className='font-medium'>
                    {
                      CONSULTATION_TYPES.find(
                        t => t.id === booking.consultationType
                      )?.name
                    }
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>{t('confirmation.duration')}</span>
                  <span className='font-medium'>
                    {booking.duration} minutes
                  </span>
                </div>
              </CardContent>
            </Card>

            <Alert className='max-w-md mx-auto'>
              <Shield className='h-4 w-4' />
              <AlertDescription>
                {t('confirmation.emailSent', { email: booking.clientInfo?.email })}
              </AlertDescription>
            </Alert>

            <div className='flex gap-4 justify-center'>
              <Button onClick={onCancel}>{t('confirmation.done')}</Button>
              <Button variant='outline'>{t('confirmation.addToCalendar')}</Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 'type':
        return !!booking.consultationType && !!booking.duration;
      case 'schedule':
        return !!booking.date && !!booking.time;
      case 'details':
        return !!(
          booking.clientInfo?.name &&
          booking.clientInfo?.email &&
          booking.clientInfo?.phone &&
          booking.clientInfo?.consultationTopic
        );
      case 'review':
        return true;
      default:
        return false;
    }
  };

  if (currentStep === 'confirmation') {
    return (
      <div className={cn('max-w-2xl mx-auto', className)}>
        {renderStepContent()}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('max-w-4xl mx-auto', className)}
    >
      <Card className='border-2'>
        <CardHeader className='pb-4'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <CardTitle className='text-2xl font-bold'>
                {t('header.title')}
              </CardTitle>
              <p className='text-muted-foreground'>
                {t('header.subtitle', { name: reviewer.fullName })}
              </p>
            </div>
            <Badge variant='outline' className='bg-blue-50 text-blue-700'>
              {t('header.step', { current: currentStepIndex + 1, total: steps.length })}
            </Badge>
          </div>

          <div className='space-y-4'>
            <Progress value={progress} className='h-2' />

            <div className='flex items-center justify-between'>
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div
                    key={step.key}
                    className='flex flex-col items-center flex-1'
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors',
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                      )}
                    >
                      <Icon className='h-5 w-5' />
                    </div>
                    <span
                      className={cn(
                        'text-xs text-center font-medium',
                        isCompleted || isCurrent
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      )}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <div className='p-6 pt-0'>
          <Separator className='mb-6' />

          <div className='flex items-center justify-between'>
            <div className='flex gap-3'>
              {currentStepIndex > 0 && (
                <Button variant='outline' onClick={handleBack}>
                  <ArrowLeft className='h-4 w-4 mr-2' />
                  {t('actions.back')}
                </Button>
              )}
              <Button variant='outline' onClick={onCancel}>
                {t('actions.cancel')}
              </Button>
            </div>

            <div className='flex gap-3 items-center'>
              {booking.consultationType && booking.duration && (
                <span className='text-sm text-muted-foreground'>
                  {t('actions.total')}{' '}
                  <span className='font-semibold'>${calculateTotalCost()}</span>
                </span>
              )}

              {currentStep !== 'review' ? (
                <Button onClick={handleNext} disabled={!isStepValid()}>
                  {t('actions.next')}
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              ) : (
                <Button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className='bg-green-600 hover:bg-green-700'
                >
                  {isLoading ? (
                    <>
                      <Timer className='h-4 w-4 mr-2 animate-spin' />
                      {t('actions.booking')}
                    </>
                  ) : (
                    <>
                      <Zap className='h-4 w-4 mr-2' />
                      {t('actions.confirmPay', { amount: calculateTotalCost() })}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
