
import { useCallback, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { Progress } from '@/components/ui/progress';
import { FadeIn } from '@/components/motion/FadeIn';
import { toast } from 'sonner';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import type {
  DeliveryCondition,
  TimeCapsule,
  TimeCapsuleFormData,
} from '@/types/timeCapsule';
import type { Guardian } from '@/types/guardian';
import { RecipientStep } from './wizard-steps/RecipientStep';
import { DeliveryStep } from './wizard-steps/DeliveryStep';
import { RecordingStep } from './wizard-steps/RecordingStep';
import { ReviewStep } from './wizard-steps/ReviewStep';
import { useTranslation } from 'react-i18next';

interface TimeCapsuleWizardProps {
  guardians: Guardian[];
  isOpen: boolean;
  onCapsuleCreated: (capsule: TimeCapsule) => void;
  onClose: () => void;
}


export function TimeCapsuleWizard({
  isOpen,
  onClose,
  guardians,
  onCapsuleCreated,
}: TimeCapsuleWizardProps) {
  const { t } = useTranslation('ui/time-capsule-wizard');

  const WIZARD_STEPS = [
    {
      id: 1,
      title: t('steps.recipient.title'),
      description: t('steps.recipient.description'),
      icon: 'user-plus',
    },
    {
      id: 2,
      title: t('steps.delivery.title'),
      description: t('steps.delivery.description'),
      icon: 'calendar',
    },
    {
      id: 3,
      title: t('steps.recording.title'),
      description: t('steps.recording.description'),
      icon: 'video',
    },
    {
      id: 4,
      title: t('steps.review.title'),
      description: t('steps.review.description'),
      icon: 'check-circle',
    },
  ];

  const { userId } = useAuth();
  const createSupabaseClient = useSupabaseWithClerk();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<TimeCapsuleFormData>({
    recipient: null,
    deliveryCondition: 'ON_DATE' as DeliveryCondition,
    deliveryDate: null,
    messageTitle: '',
    messagePreview: '',
    recording: null,
  });

  // Reset form when dialog closes
  const handleClose = useCallback(() => {
    setCurrentStep(1);
    setFormData({
      recipient: null,
      deliveryCondition: 'ON_DATE',
      deliveryDate: null,
      messageTitle: '',
      messagePreview: '',
      recording: null,
    });
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  // Navigate between steps
  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep < WIZARD_STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Update form data
  const updateFormData = (updates: Partial<TimeCapsuleFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Validate current step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return (
          formData.recipient !== null &&
          formData.recipient.name.trim() !== '' &&
          formData.recipient.email.trim() !== ''
        );
      case 2:
        return (
          formData.deliveryCondition === 'ON_DEATH' ||
          (formData.deliveryCondition === 'ON_DATE' &&
            formData.deliveryDate !== null)
        );
      case 3:
        return (
          formData.recording !== null &&
          formData.messageTitle.trim() !== ''
        );
      case 4:
        return true; // Review step is always valid if we reach it
      default:
        return false;
    }
  };

  // Submit the time capsule
  const handleSubmit = async () => {
    if (!userId || !formData.recipient || !formData.recording) return;

    setIsSubmitting(true);

    try {
      const supabase = await createSupabaseClient();

      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension =
        formData.recording.fileType === 'video' ? 'webm' : 'ogg';
      const filename = `${userId}/${timestamp}.${fileExtension}`;

      // Upload the recording to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('time-capsules')
        .upload(filename, formData.recording.blob, {
          contentType:
            formData.recording.fileType === 'video'
              ? 'video/webm'
              : 'audio/ogg',
          cacheControl: '3600',
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Upload thumbnail if it exists (for videos)
      let thumbnailPath = null;
      if (formData.recording.thumbnail) {
        const thumbnailFilename = `${userId}/${timestamp}_thumbnail.jpg`;
        const { error: thumbnailError } = await supabase.storage
          .from('time-capsules')
          .upload(thumbnailFilename, formData.recording.thumbnail, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
          });

        if (!thumbnailError) {
          thumbnailPath = thumbnailFilename;
        }
      }

      // Create the time capsule record (only include fields that exist in database schema)
      const capsuleData = {
        user_id: userId,
        message_title: formData.messageTitle,
        message_preview: formData.messagePreview || null,
        message_content: `${formData.recording.fileType.toUpperCase()} Recording: ${formData.messageTitle}\n\nRecipient: ${formData.recipient.name} (${formData.recipient.email})\nDelivery: ${formData.deliveryCondition}${formData.deliveryDate ? ` on ${formData.deliveryDate.toLocaleDateString()}` : ' upon death'}\nFile: ${uploadData.path}\nDuration: ${Math.round(formData.recording.duration)}s\n${formData.messagePreview ? `\nPreview: ${formData.messagePreview}` : ''}`,
        delivery_condition: formData.deliveryCondition,
        delivery_date: formData.deliveryDate
          ? formData.deliveryDate.toISOString()
          : null,
      };

      const { data: capsule, error: insertError } = await supabase
        .from('time_capsules')
        .insert(capsuleData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Success! Transform database result to match expected TimeCapsule type
      const transformedCapsule: TimeCapsule = {
        id: capsule.id,
        user_id: capsule.user_id,
        message_title: capsule.message_title,
        message_preview: capsule.message_preview,

        delivery_condition: capsule.delivery_condition as DeliveryCondition,
        delivery_date: capsule.delivery_date,
        created_at: capsule.created_at,
        updated_at: capsule.updated_at,
        recipient_id: formData.recipient.id || null,
        recipient_name: formData.recipient.name,
        recipient_email: formData.recipient.email,
        storage_path: uploadData.path,
        file_type: formData.recording.fileType,
        file_size_bytes: formData.recording.blob.size,
        duration_seconds: Math.round(formData.recording.duration),
        thumbnail_path: thumbnailPath,
        access_token: crypto.randomUUID(),
        status: 'PENDING' as const,
        is_delivered: false,
        delivered_at: null,
        delivery_attempts: 0,
        last_delivery_attempt: null,
        delivery_error: null,
      };

      onCapsuleCreated(transformedCapsule);
      handleClose();
    } catch (error) {
      console.error('Error creating time capsule:', error);
      toast.error(t('errors.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = (currentStep / WIZARD_STEPS.length) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-hidden'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3 text-xl'>
            <div className='w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center'>
              <Icon name="heart" className='w-4 h-4 text-purple-600' />
            </div>
            Create Time Capsule
          </DialogTitle>
        </DialogHeader>

        {/* Progress Header */}
        <div className='space-y-4'>
          <Progress value={progressPercentage} className='w-full' />

          <div className='flex justify-between items-center'>
            {WIZARD_STEPS.map((step, index) => (
              <div key={step.id} className='flex items-center'>
                <button
                  onClick={() => goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.id < currentStep
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {step.id < currentStep ? (
                    <Icon name="check" className='w-4 h-4' />
                  ) : (
                    step.id
                  )}
                </button>
                {index < WIZARD_STEPS.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step.id < currentStep ? 'bg-green-200' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className='text-center'>
            <h3 className='text-lg font-semibold'>
              {WIZARD_STEPS[currentStep - 1]?.title || ''}
            </h3>
            <p className='text-sm text-muted-foreground'>
              {WIZARD_STEPS[currentStep - 1]?.description || ''}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className='flex-1 overflow-y-auto py-4'>
          <FadeIn key={currentStep} duration={0.3}>
            {currentStep === 1 && (
              <RecipientStep
                guardians={guardians}
                selectedRecipient={formData.recipient}
                onRecipientChange={recipient => updateFormData({ recipient })}
              />
            )}

            {currentStep === 2 && (
              <DeliveryStep
                deliveryCondition={formData.deliveryCondition}
                deliveryDate={formData.deliveryDate}
                onDeliveryConditionChange={deliveryCondition =>
                  updateFormData({ deliveryCondition })
                }
                onDeliveryDateChange={deliveryDate =>
                  updateFormData({ deliveryDate })
                }
              />
            )}

            {currentStep === 3 && (
              <RecordingStep
                messageTitle={formData.messageTitle}
                messagePreview={formData.messagePreview}
                recording={formData.recording}
                onMessageTitleChange={messageTitle =>
                  updateFormData({ messageTitle })
                }
                onMessagePreviewChange={messagePreview =>
                  updateFormData({ messagePreview })
                }
                onRecordingChange={recording => updateFormData({ recording })}
              />
            )}

            {currentStep === 4 && (
              <ReviewStep formData={formData} onEdit={step => goToStep(step)} />
            )}
          </FadeIn>
        </div>

        {/* Navigation Buttons */}
        <div className='flex justify-between pt-4 border-t'>
          <Button
            variant='outline'
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <Icon name="chevron-left" className='w-4 h-4 mr-2' />
            Previous
          </Button>

          <div className='flex gap-2'>
            <Button variant='ghost' onClick={handleClose}>
              Cancel
            </Button>

            {currentStep < WIZARD_STEPS.length ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              >
                Continue
                <Icon name="chevron-right" className='w-4 h-4 ml-2' />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid(currentStep) || isSubmitting}
                className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              >
                {isSubmitting ? (
                  <>
                    <Icon
                      name="loader"
                      className='w-4 h-4 mr-2 animate-spin'
                    />
                    Sealing Capsule...
                  </>
                ) : (
                  <>
                    <Icon name="archive" className='w-4 h-4 mr-2' />
                    Seal Time Capsule
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
