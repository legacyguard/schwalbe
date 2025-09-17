
/**
 * Will Wizard Component
 * Multi-step will creation interface with Sofia AI integration
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import {
  AlertCircle,
  Building,
  CheckCircle,
  Eye,
  FileText,
  Loader2,
  Scale,
  User,
  Users,
} from 'lucide-react';
import {
  CZ_SK_JURISDICTIONS,
  type Jurisdiction,
  type LanguageCode,
  type ValidationError,
  type WillTemplateType,
  type WillUserData,
} from '../../types/will-templates';
import { willApiService } from '../../services/willApiService';
import { templateLibrary } from '../../lib/templateLibrary';
import { willValidationService } from '../../lib/willValidation';

interface WillWizardProps {
  initialData?: Partial<WillUserData>;
  onCancel?: () => void;
  onComplete?: (willId: string) => void;
}

type WizardStep =
  | 'assets'
  | 'beneficiaries'
  | 'executors'
  | 'family'
  | 'generating'
  | 'personal'
  | 'review'
  | 'setup';

interface WizardState {
  currentStep: WizardStep;
  isLoading: boolean;
  isValid: boolean;
  jurisdiction: Jurisdiction;
  language: LanguageCode;
  userData: WillUserData;
  validationErrors: ValidationError[];
  willType: WillTemplateType;
}

export const WillWizard: React.FC<WillWizardProps> = ({
  onComplete,
  onCancel,
  initialData: _initialData,
}) => {
  const { t } = useTranslation('ui/will-wizard');
  const [state, setState] = useState<WizardState>({
    currentStep: 'setup',
    jurisdiction: 'CZ',
    language: 'cs',
    willType: 'holographic',
    userData: {
      personal: {
        fullName: '',
        dateOfBirth: '',
        placeOfBirth: '',
        citizenship: '',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: '',
        },
        maritalStatus: 'single',
      },
      family: {
        children: [],
      },
      assets: [],
      beneficiaries: [],
      executors: [],
      guardians: [],
      specialInstructions: [],
    },
    validationErrors: [],
    isValid: false,
    isLoading: false,
  });

  const steps: {
    icon: React.ComponentType<any>;
    key: WizardStep;
    title: string;
  }[] = [
    { key: 'setup', title: t('steps.setup'), icon: FileText },
    { key: 'personal', title: t('steps.personal'), icon: User },
    { key: 'family', title: t('steps.family'), icon: Users },
    { key: 'assets', title: t('steps.assets'), icon: Building },
    { key: 'beneficiaries', title: t('steps.beneficiaries'), icon: Users },
    { key: 'executors', title: t('steps.executors'), icon: Scale },
    { key: 'review', title: t('steps.review'), icon: Eye },
  ];

  const currentStepIndex = steps.findIndex(
    step => step.key === state.currentStep
  );
  const progress =
    state.currentStep === 'generating'
      ? 100
      : (currentStepIndex / (steps.length - 1)) * 100;

  /**
   * Update state helper
   */
  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  /**
   * Update user data helper
   */
  const updateUserData = (updates: Partial<WillUserData>) => {
    setState(prev => ({
      ...prev,
      userData: { ...prev.userData, ...updates },
    }));
  };

  /**
   * Validate current step
   */
  const validateCurrentStep = async (): Promise<boolean> => {
    updateState({ isLoading: true });

    try {
      const jurisdictionConfig = await templateLibrary.getJurisdictionConfig(
        state.jurisdiction
      );
      const template = await templateLibrary.getTemplate(
        state.jurisdiction,
        state.willType,
        state.language
      );

      const validationResult = await willValidationService.validateWillData(
        state.userData,
        template,
        jurisdictionConfig
      );

      updateState({
        validationErrors: validationResult.errors,
        isValid: validationResult.isValid,
        isLoading: false,
      });

      return validationResult.errors.length === 0;
    } catch (error) {
      console.error('Validation error:', error);
      updateState({ isLoading: false });
      return false;
    }
  };

  /**
   * Navigate to next step
   */
  const nextStep = async () => {
    if (state.currentStep === 'generating') return;

    const isValid = await validateCurrentStep();
    if (!isValid && state.currentStep !== 'review') return;

    const stepOrder: WizardStep[] = [
      'setup',
      'personal',
      'family',
      'assets',
      'beneficiaries',
      'executors',
      'review',
    ];
    const currentIndex = stepOrder.indexOf(state.currentStep);

    if (currentIndex < stepOrder.length - 1) {
      updateState({ currentStep: stepOrder[currentIndex + 1] });
    }
  };

  /**
   * Navigate to previous step
   */
  const prevStep = () => {
    const stepOrder: WizardStep[] = [
      'setup',
      'personal',
      'family',
      'assets',
      'beneficiaries',
      'executors',
      'review',
    ];
    const currentIndex = stepOrder.indexOf(state.currentStep);

    if (currentIndex > 0) {
      updateState({ currentStep: stepOrder[currentIndex - 1] });
    }
  };

  /**
   * Generate will
   */
  const generateWill = async () => {
    updateState({ currentStep: 'generating', isLoading: true });

    try {
      const willId = await willApiService.createWill(
        state.userData,
        state.jurisdiction,
        state.language,
        state.willType
      );

      if (onComplete) {
        onComplete(willId);
      }
    } catch (error) {
      console.error('Error generating will:', error);
      updateState({ isLoading: false });
      // Stay on generating step to show error
    }
  };

  /**
   * Add beneficiary
   */
  const addBeneficiary = () => {
    const newBeneficiary = {
      id: `beneficiary-${Date.now()}`,
      name: '',
      relationship: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: '',
      },
      share: {
        type: 'percentage' as const,
        value: 0,
      },
    };

    updateUserData({
      beneficiaries: [...state.userData.beneficiaries, newBeneficiary],
    });
  };

  /**
   * Remove beneficiary
   */
  const removeBeneficiary = (index: number) => {
    const beneficiaries = [...state.userData.beneficiaries];
    beneficiaries.splice(index, 1);
    updateUserData({ beneficiaries });
  };

  /**
   * Add executor
   */
  const addExecutor = () => {
    const newExecutor = {
      id: `executor-${Date.now()}`,
      type: 'primary' as const,
      name: '',
      relationship: '',
      address: {
        street: '',
        city: '',
        postalCode: '',
        country: '',
      },
      contactInfo: {
        email: '',
        phone: '',
      },
      isProfessional: false,
    };

    updateUserData({
      executors: [...(state.userData.executors || []), newExecutor],
    });
  };

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (state.currentStep) {
      case 'setup':
        return renderSetupStep();
      case 'personal':
        return renderPersonalStep();
      case 'family':
        return renderFamilyStep();
      case 'assets':
        return renderAssetsStep();
      case 'beneficiaries':
        return renderBeneficiariesStep();
      case 'executors':
        return renderExecutorsStep();
      case 'review':
        return renderReviewStep();
      case 'generating':
        return renderGeneratingStep();
      default:
        return null;
    }
  };

  /**
   * Setup step
   */
  const renderSetupStep = () => (
    <div className='space-y-6'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold mb-2'>Create Your Will</h2>
        <p className='text-muted-foreground mb-6'>
          Sofia will guide you through creating a legally compliant will for
          your jurisdiction.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label>Country/Jurisdiction</Label>
          <Select
            value={state.jurisdiction}
            onValueChange={(value: Jurisdiction) =>
              updateState({ jurisdiction: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='CZ'>🇨🇿 Czech Republic</SelectItem>
              <SelectItem value='SK'>🇸🇰 Slovakia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Language</Label>
          <Select
            value={state.language}
            onValueChange={(value: LanguageCode) =>
              updateState({ language: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CZ_SK_JURISDICTIONS[
                state.jurisdiction as keyof typeof CZ_SK_JURISDICTIONS
              ].supportedLanguages.map(lang => (
                <SelectItem key={lang} value={lang}>
                  {lang === 'cs' && 'Čeština'}
                  {lang === 'sk' && 'Slovenčina'}
                  {lang === 'en' && 'English'}
                  {lang === 'de' && 'Deutsch'}
                  {lang === 'uk' && 'Українська'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='md:col-span-2'>
          <Label>Will Type</Label>
          <Select
            value={state.willType}
            onValueChange={(value: WillTemplateType) =>
              updateState({ willType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='holographic'>
                Holographic Will - Written entirely in your handwriting
              </SelectItem>
              <SelectItem value='witnessed'>
                Witnessed Will - Signed in presence of witnesses
              </SelectItem>
            </SelectContent>
          </Select>
          <p className='text-sm text-muted-foreground mt-2'>
            Holographic wills are recommended for most situations in CZ/SK as
            they don't require witnesses.
          </p>
        </div>
      </div>
    </div>
  );

  /**
   * Personal information step
   */
  const renderPersonalStep = () => (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Personal Information</h3>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label>Full Name *</Label>
          <Input
            value={state.userData.personal.fullName}
            onChange={e =>
              updateUserData({
                personal: {
                  ...state.userData.personal,
                  fullName: e.target.value,
                },
              })
            }
            placeholder='Your full legal name'
          />
        </div>

        <div>
          <Label>Date of Birth *</Label>
          <Input
            type='date'
            value={state.userData.personal.dateOfBirth}
            onChange={e =>
              updateUserData({
                personal: {
                  ...state.userData.personal,
                  dateOfBirth: e.target.value,
                },
              })
            }
          />
        </div>

        <div>
          <Label>Place of Birth</Label>
          <Input
            value={state.userData.personal.placeOfBirth}
            onChange={e =>
              updateUserData({
                personal: {
                  ...state.userData.personal,
                  placeOfBirth: e.target.value,
                },
              })
            }
            placeholder='City, Country'
          />
        </div>

        <div>
          <Label>Citizenship *</Label>
          <Input
            value={state.userData.personal.citizenship}
            onChange={e =>
              updateUserData({
                personal: {
                  ...state.userData.personal,
                  citizenship: e.target.value,
                },
              })
            }
            placeholder='e.g., Czech, Slovak'
          />
        </div>

        <div className='md:col-span-2'>
          <Label>Marital Status</Label>
          <Select
            value={state.userData.personal.maritalStatus}
            onValueChange={value =>
              updateUserData({
                personal: {
                  ...state.userData.personal,
                  maritalStatus: value as any,
                },
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='single'>Single</SelectItem>
              <SelectItem value='married'>Married</SelectItem>
              <SelectItem value='divorced'>Divorced</SelectItem>
              <SelectItem value='widowed'>Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className='space-y-2'>
        <Label>Address *</Label>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
          <Input
            placeholder='Street address'
            value={state.userData.personal.address.street}
            onChange={e =>
              updateUserData({
                personal: {
                  ...state.userData.personal,
                  address: {
                    ...state.userData.personal.address,
                    street: e.target.value,
                  },
                },
              })
            }
          />
          <Input
            placeholder='City'
            value={state.userData.personal.address.city}
            onChange={e =>
              updateUserData({
                personal: {
                  ...state.userData.personal,
                  address: {
                    ...state.userData.personal.address,
                    city: e.target.value,
                  },
                },
              })
            }
          />
          <Input
            placeholder='Postal code'
            value={state.userData.personal.address.postalCode}
            onChange={e =>
              updateUserData({
                personal: {
                  ...state.userData.personal,
                  address: {
                    ...state.userData.personal.address,
                    postalCode: e.target.value,
                  },
                },
              })
            }
          />
          <Input
            placeholder='Country'
            value={state.userData.personal.address.country}
            onChange={e =>
              updateUserData({
                personal: {
                  ...state.userData.personal,
                  address: {
                    ...state.userData.personal.address,
                    country: e.target.value,
                  },
                },
              })
            }
          />
        </div>
      </div>
    </div>
  );

  /**
   * Family information step
   */
  const renderFamilyStep = () => (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Family Information</h3>

      {state.userData.personal.maritalStatus !== 'single' && (
        <div>
          <Label>Spouse Name</Label>
          <Input
            placeholder="Spouse's full name"
            value={state.userData.family.spouse?.fullName || ''}
            onChange={e =>
              updateUserData({
                family: {
                  ...state.userData.family,
                  spouse: {
                    fullName: e.target.value,
                    dateOfBirth: '',
                    placeOfBirth: '',
                    citizenship: '',
                    address: {
                      street: '',
                      city: '',
                      postalCode: '',
                      country: '',
                    },
                    maritalStatus: 'married',
                  },
                },
              })
            }
          />
        </div>
      )}

      <div>
        <Label>Children</Label>
        <p className='text-sm text-muted-foreground mb-2'>
          Add information about your children (this affects inheritance laws in
          CZ/SK)
        </p>

        {state.userData.family.children?.map((child, index) => (
          <div key={index} className='border p-3 rounded-md mb-2'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-2 mb-2'>
              <Input
                placeholder="Child's name"
                value={child.fullName}
                onChange={e => {
                  const children = [...(state.userData.family.children || [])];
                  children[index] = {
                    ...children[index],
                    fullName: e.target.value,
                  };
                  updateUserData({
                    family: { ...state.userData.family, children },
                  });
                }}
              />
              <Input
                type='date'
                value={child.dateOfBirth}
                onChange={e => {
                  const children = [...(state.userData.family.children || [])];
                  children[index] = {
                    ...children[index],
                    dateOfBirth: e.target.value,
                  };
                  updateUserData({
                    family: { ...state.userData.family, children },
                  });
                }}
              />
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                const children = [...(state.userData.family.children || [])];
                children.splice(index, 1);
                updateUserData({
                  family: { ...state.userData.family, children },
                });
              }}
            >
              Remove
            </Button>
          </div>
        ))}

        <Button
          variant='outline'
          onClick={() => {
            const newChild = {
              fullName: '',
              dateOfBirth: '',
              isMinor: true,
            };
            updateUserData({
              family: {
                ...state.userData.family,
                children: [
                  ...(state.userData.family.children || []),
                  newChild as any,
                ],
              },
            });
          }}
        >
          Add Child
        </Button>
      </div>
    </div>
  );

  /**
   * Assets step
   */
  const renderAssetsStep = () => (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Assets & Property</h3>
      <p className='text-muted-foreground'>
        List your major assets. This helps Sofia suggest fair distribution.
      </p>

      {/* Simplified asset input - full implementation would have detailed asset forms */}
      <div className='border p-4 rounded-md'>
        <Label>Asset Description</Label>
        <Textarea
          placeholder='Briefly describe your major assets (property, vehicles, bank accounts, investments, etc.)'
          className='mt-2'
        />
      </div>
    </div>
  );

  /**
   * Beneficiaries step
   */
  const renderBeneficiariesStep = () => (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-semibold'>Beneficiaries</h3>
        <Button onClick={addBeneficiary}>Add Beneficiary</Button>
      </div>

      {state.userData.beneficiaries.map((beneficiary, index) => (
        <Card key={beneficiary.id}>
          <CardContent className='pt-4'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              <div>
                <Label>Name *</Label>
                <Input
                  value={beneficiary.name}
                  onChange={e => {
                    const beneficiaries = [...state.userData.beneficiaries];
                    beneficiaries[index] = {
                      ...beneficiaries[index],
                      name: e.target.value,
                    };
                    updateUserData({ beneficiaries });
                  }}
                />
              </div>
              <div>
                <Label>Relationship *</Label>
                <Select
                  value={beneficiary.relationship}
                  onValueChange={value => {
                    const beneficiaries = [...state.userData.beneficiaries];
                    beneficiaries[index] = {
                      ...beneficiaries[index],
                      relationship: value,
                    };
                    updateUserData({ beneficiaries });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='spouse'>Spouse</SelectItem>
                    <SelectItem value='child'>Child</SelectItem>
                    <SelectItem value='parent'>Parent</SelectItem>
                    <SelectItem value='sibling'>Sibling</SelectItem>
                    <SelectItem value='friend'>Friend</SelectItem>
                    <SelectItem value='charity'>Charity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Share (%)</Label>
                <Input
                  type='number'
                  min='0'
                  max='100'
                  value={beneficiary.share.value}
                  onChange={e => {
                    const beneficiaries = [...state.userData.beneficiaries];
                    beneficiaries[index] = {
                      ...beneficiaries[index],
                      share: {
                        ...beneficiaries[index].share,
                        value: Number(e.target.value),
                      },
                    };
                    updateUserData({ beneficiaries });
                  }}
                />
              </div>
            </div>
            <Button
              variant='destructive'
              size='sm'
              onClick={() => removeBeneficiary(index)}
            >
              Remove
            </Button>
          </CardContent>
        </Card>
      ))}

      {state.userData.beneficiaries.length === 0 && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            You must specify at least one beneficiary. Sofia can suggest fair
            distribution based on your family situation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  /**
   * Executors step
   */
  const renderExecutorsStep = () => (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h3 className='text-lg font-semibold'>Executors</h3>
        <Button onClick={addExecutor}>Add Executor</Button>
      </div>
      <p className='text-muted-foreground'>
        Executors will carry out your will's instructions. Choose trusted
        people.
      </p>

      {state.userData.executors?.map((executor, index) => (
        <Card key={executor.id}>
          <CardContent className='pt-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label>Name *</Label>
                <Input
                  value={executor.name}
                  onChange={e => {
                    const executors = [...(state.userData.executors || [])];
                    executors[index] = {
                      ...executors[index],
                      name: e.target.value,
                    };
                    updateUserData({ executors });
                  }}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type='email'
                  value={executor.contactInfo.email || ''}
                  onChange={e => {
                    const executors = [...(state.userData.executors || [])];
                    executors[index] = {
                      ...executors[index],
                      contactInfo: {
                        ...executors[index].contactInfo,
                        email: e.target.value,
                      },
                    };
                    updateUserData({ executors });
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  /**
   * Review step
   */
  const renderReviewStep = () => (
    <div className='space-y-4'>
      <h3 className='text-lg font-semibold'>Review Your Will</h3>

      {state.validationErrors.length > 0 && (
        <Alert>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>
            Please fix the following issues before generating your will:
            <ul className='list-disc list-inside mt-2'>
              {state.validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Name:</strong> {state.userData.personal.fullName}
            </p>
            <p>
              <strong>Status:</strong> {state.userData.personal.maritalStatus}
            </p>
            <p>
              <strong>Citizenship:</strong>{' '}
              {state.userData.personal.citizenship}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Will Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Jurisdiction:</strong> {state.jurisdiction}
            </p>
            <p>
              <strong>Type:</strong> {state.willType}
            </p>
            <p>
              <strong>Language:</strong> {state.language}
            </p>
          </CardContent>
        </Card>
      </div>

      {state.userData.beneficiaries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-sm'>Beneficiaries</CardTitle>
          </CardHeader>
          <CardContent>
            {state.userData.beneficiaries.map((beneficiary, index) => (
              <div
                key={index}
                className='flex justify-between items-center py-1'
              >
                <span>
                  {beneficiary.name} ({beneficiary.relationship})
                </span>
                <Badge>{beneficiary.share.value}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );

  /**
   * Generating step
   */
  const renderGeneratingStep = () => (
    <div className='text-center space-y-4'>
      <Loader2 className='h-8 w-8 animate-spin mx-auto' />
      <h3 className='text-lg font-semibold'>Sofia is Creating Your Will</h3>
      <p className='text-muted-foreground'>
        Please wait while we generate your legally compliant will document...
      </p>
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <h1 className='text-3xl font-bold mb-2'>Will Creation Wizard</h1>
        <p className='text-muted-foreground'>
          Create your will with Sofia's AI assistance
        </p>
      </div>

      {/* Progress */}
      <div className='space-y-2'>
        <div className='flex justify-between text-sm'>
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className='h-2' />
      </div>

      {/* Steps indicator */}
      {state.currentStep !== 'generating' && (
        <div className='flex justify-center space-x-2 overflow-x-auto pb-2'>
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm whitespace-nowrap ${
                  isCompleted
                    ? 'bg-green-100 text-green-800'
                    : isCurrent
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                }`}
              >
                <IconComponent className='h-4 w-4' />
                <span>{step.title}</span>
                {isCompleted && <CheckCircle className='h-4 w-4' />}
              </div>
            );
          })}
        </div>
      )}

      {/* Main content */}
      <Card>
        <CardContent className='pt-6'>{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      {state.currentStep !== 'generating' && (
        <div className='flex justify-between'>
          <Button
            variant='outline'
            onClick={prevStep}
            disabled={currentStepIndex === 0}
          >
            Previous
          </Button>

          <div className='space-x-2'>
            {onCancel && (
              <Button variant='ghost' onClick={onCancel}>
                Cancel
              </Button>
            )}

            {state.currentStep === 'review' ? (
              <Button
                onClick={generateWill}
                disabled={state.validationErrors.length > 0 || state.isLoading}
              >
                {state.isLoading && (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                )}
                Generate Will
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={state.isLoading}>
                {state.isLoading && (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                )}
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
