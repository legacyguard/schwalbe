
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TimeCapsuleFormData } from '@/types/timeCapsule';
import { format } from 'date-fns';

interface ReviewStepProps {
  formData: TimeCapsuleFormData;
  onEdit: (step: number) => void;
}

export function ReviewStep({ formData, onEdit }: ReviewStepProps) {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h3 className='text-lg font-semibold mb-2'>Review Your Time Capsule</h3>
        <p className='text-muted-foreground'>
          Please review all details carefully. Once sealed, your Time Capsule
          cannot be modified, but it can be deleted if needed before delivery.
        </p>
      </div>

      {/* Recipient Information */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Icon name="user" className='w-5 h-5 text-primary' />
            Recipient
          </CardTitle>
          <Button variant='ghost' size='sm' onClick={() => onEdit(1)}>
            <Icon name="edit-2" className='w-4 h-4 mr-2' />
            Edit
          </Button>
        </CardHeader>
        <CardContent className='pt-0'>
          {formData.recipient && (
            <div className='flex items-center space-x-3'>
              <Avatar>
                <AvatarFallback>
                  {getInitials(formData.recipient.name)}
                </AvatarFallback>
              </Avatar>
              <div className='flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>{formData.recipient.name}</span>
                  {formData.recipient.isGuardian && (
                    <Badge variant='secondary' className='text-xs'>
                      <Icon name="shield" className='w-3 h-3 mr-1' />
                      Guardian
                    </Badge>
                  )}
                </div>
                <div className='text-sm text-muted-foreground flex items-center gap-2'>
                  <Icon name="mail" className='w-3 h-3' />
                  {formData.recipient.email}
                  {formData.recipient.relationship && (
                    <>
                      <span>•</span>
                      <span className='capitalize'>
                        {formData.recipient.relationship}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery Information */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Icon name="calendar" className='w-5 h-5 text-primary' />
            Delivery Details
          </CardTitle>
          <Button variant='ghost' size='sm' onClick={() => onEdit(2)}>
            <Icon name="edit-2" className='w-4 h-4 mr-2' />
            Edit
          </Button>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-3'>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  formData.deliveryCondition === 'ON_DATE'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-purple-100 text-purple-600'
                }`}
              >
                <Icon
                  name={
                    formData.deliveryCondition === 'ON_DATE'
                      ? 'calendar'
                      : 'shield'
                  }
                  className='w-4 h-4'
                />
              </div>
              <div>
                <p className='font-medium'>
                  {formData.deliveryCondition === 'ON_DATE'
                    ? 'Scheduled Delivery'
                    : 'Family Shield Activation'}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {formData.deliveryCondition === 'ON_DATE' &&
                  formData.deliveryDate
                    ? `${format(formData.deliveryDate, 'EEEE, MMMM do, yyyy')} at 9:00 AM`
                    : 'Will be delivered when your Family Shield is activated after your passing'}
                </p>
              </div>
            </div>

            {formData.deliveryCondition === 'ON_DATE' &&
              formData.deliveryDate && (
                <div className='p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                  <div className='flex items-center space-x-2 text-blue-800'>
                    <Icon name="calendar-check" className='w-4 h-4' />
                    <span className='text-sm font-medium'>
                      Delivery in{' '}
                      {Math.ceil(
                        (formData.deliveryDate.getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )}{' '}
                      days
                    </span>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Message Information */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
          <CardTitle className='text-lg flex items-center gap-2'>
            <Icon name="video" className='w-5 h-5 text-primary' />
            Your Message
          </CardTitle>
          <Button variant='ghost' size='sm' onClick={() => onEdit(3)}>
            <Icon name="edit-2" className='w-4 h-4 mr-2' />
            Edit
          </Button>
        </CardHeader>
        <CardContent className='pt-0 space-y-4'>
          <div>
            <p className='font-medium text-lg'>{formData.messageTitle}</p>
            {formData.messagePreview && (
              <p className='text-sm text-muted-foreground mt-1'>
                {formData.messagePreview}
              </p>
            )}
          </div>

          {formData.recording && (
            <div className='space-y-3'>
              <div className='flex items-center space-x-4 p-3 bg-gray-50 rounded-lg'>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    formData.recording.fileType === 'video'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}
                >
                  <Icon
                    name={
                      formData.recording.fileType === 'video' ? 'video' : 'mic'
                    }
                    className='w-5 h-5'
                  />
                </div>
                <div className='flex-1'>
                  <p className='font-medium capitalize'>
                    {formData.recording.fileType} Message
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Duration: {formatDuration(formData.recording.duration)} •
                    Size: {formatFileSize(formData.recording.blob.size)}
                  </p>
                </div>
                <Badge variant='secondary' className='text-xs'>
                  Ready
                </Badge>
              </div>

              <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                <div className='flex items-center space-x-2 text-green-800'>
                  <Icon name="check-circle" className='w-4 h-4' />
                  <span className='text-sm font-medium'>
                    Recording Complete
                  </span>
                </div>
                <p className='text-xs text-green-700 mt-1'>
                  Your {formData.recording.fileType} message has been recorded
                  and is ready to be sealed in the Time Capsule.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Final Confirmation */}
      <Card className='border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50'>
        <CardContent className='p-6'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto'>
              <Icon name="heart" className='w-8 h-8 text-white' />
            </div>

            <div>
              <h3 className='text-lg font-semibold text-purple-900'>
                Ready to Seal Your Time Capsule
              </h3>
              <p className='text-sm text-purple-700 mt-2'>
                Once sealed, this Time Capsule will be safely stored and
                delivered exactly as you've specified. Your message will be a
                precious gift that brings comfort and joy when it's needed most.
              </p>
            </div>

            <div className='grid grid-cols-3 gap-4 text-center'>
              <div className='space-y-1'>
                <Icon
                  name="lock"
                  className='w-5 h-5 text-purple-600 mx-auto'
                />
                <p className='text-xs text-purple-700'>Securely Encrypted</p>
              </div>
              <div className='space-y-1'>
                <Icon
                  name="clock"
                  className='w-5 h-5 text-purple-600 mx-auto'
                />
                <p className='text-xs text-purple-700'>Precisely Timed</p>
              </div>
              <div className='space-y-1'>
                <Icon
                  name="heart"
                  className='w-5 h-5 text-purple-600 mx-auto'
                />
                <p className='text-xs text-purple-700'>Made with Love</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <div className='text-center text-xs text-muted-foreground bg-yellow-50 p-3 rounded-lg border border-yellow-200'>
        <Icon
          name="alert-triangle"
          className='w-4 h-4 inline mr-2 text-yellow-600'
        />
        <strong>Important:</strong> Once sealed, your Time Capsule cannot be
        edited. You can delete it before delivery if needed, but we recommend
        keeping it as your heartfelt message may become even more precious over
        time.
      </div>
    </div>
  );
}
