
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { DeliveryCondition } from '@/types/timeCapsule';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DeliveryStepProps {
  deliveryCondition: DeliveryCondition;
  deliveryDate: Date | null;
  onDeliveryConditionChange: (condition: DeliveryCondition) => void;
  onDeliveryDateChange: (date: Date | null) => void;
}

export function DeliveryStep({
  deliveryCondition,
  deliveryDate,
  onDeliveryConditionChange,
  onDeliveryDateChange,
}: DeliveryStepProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onDeliveryDateChange(date ?? null);
    setIsCalendarOpen(false);
  };

  const today = new Date();
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Tomorrow

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <p className='text-muted-foreground'>
          Choose when this Time Capsule should be delivered to your recipient.
          You can schedule it for a specific date or have it delivered as part
          of your Family Shield activation.
        </p>
      </div>

      {/* Delivery Options */}
      <div className='space-y-4'>
        <Label className='text-base font-medium'>
          When should this message be delivered?
        </Label>

        <div className='grid gap-4'>
          {/* On Specific Date */}
          <Card
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              deliveryCondition === 'ON_DATE'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'hover:border-primary/50'
            )}
            onClick={() => onDeliveryConditionChange('ON_DATE')}
          >
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      deliveryCondition === 'ON_DATE'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-blue-100 text-blue-600'
                    )}
                  >
                    <Icon name="calendar" className='w-5 h-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>
                      On a Specific Date
                    </CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      Perfect for birthdays, anniversaries, graduations, or
                      special milestones
                    </p>
                  </div>
                </div>
                {deliveryCondition === 'ON_DATE' && (
                  <Icon
                    name="check-circle"
                    className='w-6 h-6 text-primary'
                  />
                )}
              </div>
            </CardHeader>
          </Card>

          {/* After Passing */}
          <Card
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              deliveryCondition === 'ON_DEATH'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'hover:border-primary/50'
            )}
            onClick={() => onDeliveryConditionChange('ON_DEATH')}
          >
            <CardHeader className='pb-3'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      deliveryCondition === 'ON_DEATH'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-purple-100 text-purple-600'
                    )}
                  >
                    <Icon name="shield" className='w-5 h-5' />
                  </div>
                  <div>
                    <CardTitle className='text-lg'>After My Passing</CardTitle>
                    <p className='text-sm text-muted-foreground'>
                      Delivered when your Family Shield is activated - your
                      final words of love and guidance
                    </p>
                  </div>
                </div>
                {deliveryCondition === 'ON_DEATH' && (
                  <Icon
                    name="check-circle"
                    className='w-6 h-6 text-primary'
                  />
                )}
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Date Selection for ON_DATE */}
      {deliveryCondition === 'ON_DATE' && (
        <Card className='border-primary/20'>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              <Label className='text-base font-medium'>
                Choose Delivery Date
              </Label>
              <p className='text-sm text-muted-foreground'>
                Select the exact date when you want this Time Capsule to be
                delivered. The message will be sent via email on that day.
              </p>

              <div className='flex items-center space-x-4'>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-[240px] justify-start text-left font-normal',
                        !deliveryDate && 'text-muted-foreground'
                      )}
                    >
                      <Icon name="calendar" className='mr-2 h-4 w-4' />
                      {deliveryDate
                        ? format(deliveryDate, 'PPP')
                        : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0' align='start'>
                    <Calendar
                      mode='single'
                      selected={deliveryDate}
                      onSelect={handleDateSelect}
                      disabled={date => date < minDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {deliveryDate && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDateSelect(undefined)}
                  >
                    <Icon name="x" className='w-4 h-4' />
                  </Button>
                )}
              </div>

              {deliveryDate && (
                <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                  <div className='flex items-center space-x-2 text-green-800'>
                    <Icon name="calendar-check" className='w-4 h-4' />
                    <span className='text-sm font-medium'>
                      Scheduled for{' '}
                      {format(deliveryDate, 'EEEE, MMMM do, yyyy')}
                    </span>
                  </div>
                  <p className='text-xs text-green-700 mt-1'>
                    Your Time Capsule will be delivered via email on this date.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Family Shield Integration for ON_DEATH */}
      {deliveryCondition === 'ON_DEATH' && (
        <Card className='border-purple-200'>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              <Label className='text-base font-medium'>
                Family Shield Integration
              </Label>
              <p className='text-sm text-muted-foreground'>
                This Time Capsule is connected to your Family Shield system. It
                will be automatically delivered when your Family Shield detects
                your passing and activates the emergency protocols.
              </p>

              <div className='space-y-3'>
                <div className='flex items-start space-x-3 p-3 bg-purple-50 rounded-lg'>
                  <Icon
                    name="shield"
                    className='w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0'
                  />
                  <div>
                    <p className='text-sm font-medium text-purple-900'>
                      Automatic Activation
                    </p>
                    <p className='text-xs text-purple-700'>
                      Your Family Shield monitors your activity and will trigger
                      delivery when appropriate.
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3 p-3 bg-blue-50 rounded-lg'>
                  <Icon
                    name="users"
                    className='w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0'
                  />
                  <div>
                    <p className='text-sm font-medium text-blue-900'>
                      Guardian Verification
                    </p>
                    <p className='text-xs text-blue-700'>
                      Multiple trusted guardians must confirm the situation
                      before delivery.
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-3 p-3 bg-green-50 rounded-lg'>
                  <Icon
                    name="heart"
                    className='w-5 h-5 text-green-600 mt-0.5 flex-shrink-0'
                  />
                  <div>
                    <p className='text-sm font-medium text-green-900'>
                      Final Messages
                    </p>
                    <p className='text-xs text-green-700'>
                      Your most important words will reach your loved ones when
                      they need them most.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <div className='text-center text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg'>
        <Icon name="info" className='w-4 h-4 inline mr-2' />
        {deliveryCondition === 'ON_DATE'
          ? "Date-based Time Capsules are delivered via email at 9:00 AM in the recipient's timezone."
          : 'Family Shield Time Capsules are part of your legacy protection system and will be delivered with the highest care and dignity.'}
      </div>
    </div>
  );
}
