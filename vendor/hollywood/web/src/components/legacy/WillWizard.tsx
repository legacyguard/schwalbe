
import React, { useCallback, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import type { WillType } from './WillTypeSelector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LiveWillPreview } from './LiveWillPreview';
import { SofiaCorrectnessCheck } from './SofiaCorrectnessCheck';
import { FocusModeWrapper } from './FocusModeWrapper';
import { FocusModeToggle } from './FocusModeToggle';
import { VaultAssetSelector } from './VaultAssetSelector';
import { useFocusMode } from '@/contexts/FocusModeContext';
import { useTranslation } from 'react-i18next';

// Types based on our database schema
export interface WillData {
  assets: {
    bankAccounts?: Array<{
      accountNumber: string;
      bank: string;
      type: 'checking' | 'investment' | 'savings';
    }>;
    investments?: Array<{
      accountType: string;
      company: string;
      value?: number;
    }>;
    personalProperty?: Array<{
      description: string;
      recipient?: string;
      value?: number;
    }>;
    realEstate?: Array<{
      address: string;
      description: string;
      value?: number;
    }>;
    vehicles?: Array<{
      description: string;
      make: string;
      model: string;
      value?: number;
      vin?: string;
      year: number;
    }>;
  };
  beneficiaries: Array<{
    conditions?: string;
    id: string;
    name: string;
    percentage: number;
    relationship:
      | 'charity'
      | 'child'
      | 'friend'
      | 'grandchild'
      | 'other'
      | 'parent'
      | 'sibling'
      | 'spouse';
    specificGifts?: string[];
  }>;
  completeness_score: number;
  executor_data: {
    backupExecutor?: {
      name: string;
      phone?: string;
      relationship: string;
    };
    executorPowers?: string[];
    primaryExecutor?: {
      name: string;
      phone?: string;
      relationship: string;
    };
  };
  family_protection_level: 'basic' | 'comprehensive' | 'premium' | 'standard';
  guardianship_data: {
    backupGuardian?: {
      name: string;
      relationship: string;
    };
    guardianInstructions?: string;
    minorChildren?: Array<{
      dateOfBirth: string;
      name: string;
    }>;
    primaryGuardian?: {
      name: string;
      relationship: string;
    };
  };
  legal_data: {
    jurisdiction?: string;
    notarization?: boolean;
    previousWills?: string;
    revocationClause?: boolean;
    witnessRequirements?: number;
  };

  // Additional properties for compatibility with main WillData interface
  review_eligibility: boolean;
  special_instructions: {
    charitableBequests?: Array<{
      amount: number;
      charity: string;
    }>;
    digitalAssets?: string;
    funeralWishes?: string;
    organDonation?: boolean;
    personalMessages?: Array<{
      message: string;
      recipient: string;
    }>;
    petCare?: string;
  };
  testator_data: {
    address?: string;
    citizenship?: string;
    dateOfBirth?: string;
    fullName?: string;
    maritalStatus?: 'divorced' | 'married' | 'single' | 'widowed';
  };
}

interface WillWizardProps {
  initialData?: null | WillData;
  onBack?: () => void;
  onClose: () => void;
  onComplete: (willData: WillData) => void;
  willType: WillType;
}

// Steps will be translated in the component
const getSteps = (t: any) => [
  { id: 'personal', title: t('steps.personal.title'), description: t('steps.personal.description') },
  { id: 'beneficiaries', title: t('steps.beneficiaries.title'), description: t('steps.beneficiaries.description') },
  { id: 'assets', title: t('steps.assets.title'), description: t('steps.assets.description') },
  { id: 'executor', title: t('steps.executor.title'), description: t('steps.executor.description') },
  {
    id: 'guardianship',
    title: t('steps.guardianship.title'),
    description: t('steps.guardianship.description'),
  },
  { id: 'wishes', title: t('steps.wishes.title'), description: t('steps.wishes.description') },
  {
    id: 'sofia_check',
    title: t('steps.sofiaCheck.title'),
    description: t('steps.sofiaCheck.description'),
  },
  { id: 'review', title: t('steps.review.title'), description: t('steps.review.description') },
];

  // const __JURISDICTIONS = [ // Unused
//   { value: 'US-General', label: 'United States (General)' },
//   { value: 'US-California', label: 'California, USA' },
//   { value: 'US-Texas', label: 'Texas, USA' },
//   { value: 'US-Florida', label: 'Florida, USA' },
//   { value: 'US-NewYork', label: 'New York, USA' },
//   { value: 'Slovakia', label: 'Slovakia' },
//   { value: 'Czech-Republic', label: 'Czech Republic' },
//   { value: 'UK', label: 'United Kingdom' },
//   { value: 'Canada', label: 'Canada' },
//   { value: 'Australia', label: 'Australia' },
// ];

// Relationships will be translated in the component
const getRelationships = (t: any) => [
  { value: 'spouse', label: t('relationships.spouse') },
  { value: 'child', label: t('relationships.child') },
  { value: 'parent', label: t('relationships.parent') },
  { value: 'sibling', label: t('relationships.sibling') },
  { value: 'grandchild', label: t('relationships.grandchild') },
  { value: 'friend', label: t('relationships.friend') },
  { value: 'charity', label: t('relationships.charity') },
  { value: 'other', label: t('relationships.other') },
];

export const WillWizard: React.FC<WillWizardProps> = ({
  onClose,
  onComplete,
  onBack,
  willType,
  initialData,
}) => {
  const { t } = useTranslation('ui/will-wizard');
  useAuth();
  const { user } = useUser();
  const { isFocusMode } = useFocusMode();
  const [currentStep, setCurrentStep] = useState(0);

  const STEPS = getSteps(t);
  const RELATIONSHIPS = getRelationships(t);
  const [showVaultSelector, setShowVaultSelector] = useState(false);
  const [vaultSelectorType, setVaultSelectorType] = useState<
    'all' | 'bankAccounts' | 'personalProperty' | 'realEstate' | 'vehicles'
  >('all');

  // Initialize with draft data if provided, otherwise use empty data
  const [willData, setWillData] = useState<WillData>(
    initialData || {
      testator_data: {
        fullName: user?.fullName || '',
      },
      beneficiaries: [],
      assets: {},
      executor_data: {},
      guardianship_data: {},
      special_instructions: {},
      legal_data: {},
      review_eligibility: true,
      family_protection_level: 'standard' as const,
      completeness_score: 0,
    }
  );

  const currentStepId = STEPS[currentStep].id;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateWillData = useCallback(
    (section: keyof WillData, data: Partial<WillData[keyof WillData]>) => {
      setWillData(prev => ({
        ...prev,
        [section]: { ...(prev[section] as any), ...(data as any) },
      }));
    },
    []
  );

  const handleComplete = useCallback(() => {
    onComplete(willData);
  }, [willData, onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  }, [currentStep, onBack]);

  const goToStep = useCallback((stepId: string) => {
    const stepIndex = STEPS.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStep(stepIndex);
    }
  }, []);

  const handleOpenVaultSelector = (
    assetType:
      | 'all'
      | 'bankAccounts'
      | 'personalProperty'
      | 'realEstate'
      | 'vehicles'
  ) => {
    setVaultSelectorType(assetType);
    setShowVaultSelector(true);
  };

  const handleVaultAssetsSelected = (selectedAssets: string[]) => {
    // Add selected assets to the appropriate category
    if (vaultSelectorType === 'all') {
      // Distribute to a default category when 'all' is selected
      const currentAssets = willData.assets.personalProperty || [];
      const newAssets = selectedAssets.map(asset => ({
        description: asset,
        value: 0, // User can edit this later
      }));
      updateWillData('assets', {
        personalProperty: [...currentAssets, ...newAssets],
      });
      setShowVaultSelector(false);
      toast.success(
        t('toast.assetsAdded', {
          count: selectedAssets.length,
          plural: selectedAssets.length > 1 ? t('toast.assetsPlural') : t('toast.assetsSingular')
        })
      );
      return;
    }
    const currentAssets = (willData.assets as any)[vaultSelectorType] || [];
    const newAssets = selectedAssets.map(asset => ({
      description: asset,
      value: 0, // User can edit this later
    }));

    updateWillData('assets', {
      [vaultSelectorType]: [...currentAssets, ...newAssets],
    });

    setShowVaultSelector(false);
    toast.success(
      t('toast.assetsAdded', {
        count: selectedAssets.length,
        plural: selectedAssets.length > 1 ? t('toast.assetsPlural') : t('toast.assetsSingular')
      })
    );
  };

  const addBeneficiary = useCallback(() => {
    const newBeneficiary = {
      id: crypto.randomUUID(),
      name: '',
      relationship: 'child' as const,
      percentage: 0,
      specificGifts: [],
      conditions: '',
    };
    setWillData(prev => ({
      ...prev,
      beneficiaries: [...prev.beneficiaries, newBeneficiary],
    }));
  }, []);

  const updateBeneficiary = useCallback(
    (id: string, field: string, value: number | string | string[]) => {
      setWillData(prev => ({
        ...prev,
        beneficiaries: prev.beneficiaries.map(b =>
          b.id === id ? { ...b, [field]: value } : b
        ),
      }));
    },
    []
  );

  const removeBeneficiary = useCallback((id: string) => {
    setWillData(prev => ({
      ...prev,
      beneficiaries: prev.beneficiaries.filter(b => b.id !== id),
    }));
  }, []);

  const renderStepContent = () => {
    switch (currentStepId) {
      case 'personal':
        return (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='fullName'>{t('personal.fullName.label')}</Label>
                <Input
                  id='fullName'
                  value={willData.testator_data.fullName || ''}
                  onChange={e =>
                    updateWillData('testator_data', {
                      fullName: e.target.value,
                    })
                  }
                  placeholder={t('personal.fullName.placeholder')}
                />
              </div>
              <div>
                <Label htmlFor='dateOfBirth'>{t('personal.dateOfBirth.label')}</Label>
                <Input
                  id='dateOfBirth'
                  type='date'
                  value={willData.testator_data.dateOfBirth || ''}
                  onChange={e =>
                    updateWillData('testator_data', {
                      dateOfBirth: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor='address'>{t('personal.address.label')}</Label>
              <Textarea
                id='address'
                value={willData.testator_data.address || ''}
                onChange={e =>
                  updateWillData('testator_data', { address: e.target.value })
                }
                placeholder={t('personal.address.placeholder')}
                rows={3}
              />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='citizenship'>{t('personal.citizenship.label')}</Label>
                <Input
                  id='citizenship'
                  value={willData.testator_data.citizenship || ''}
                  onChange={e =>
                    updateWillData('testator_data', {
                      citizenship: e.target.value,
                    })
                  }
                  placeholder={t('personal.citizenship.placeholder')}
                />
              </div>
              <div>
                <Label htmlFor='maritalStatus'>{t('personal.maritalStatus.label')}</Label>
                <Select
                  value={willData.testator_data.maritalStatus}
                  onValueChange={value =>
                    updateWillData('testator_data', {
                      maritalStatus: value as
                        | 'divorced'
                        | 'married'
                        | 'single'
                        | 'widowed',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('personal.maritalStatus.placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='single'>{t('personal.maritalStatus.options.single')}</SelectItem>
                    <SelectItem value='married'>{t('personal.maritalStatus.options.married')}</SelectItem>
                    <SelectItem value='divorced'>{t('personal.maritalStatus.options.divorced')}</SelectItem>
                    <SelectItem value='widowed'>{t('personal.maritalStatus.options.widowed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'beneficiaries':
        return (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>{t('beneficiaries.title')}</h3>
              <Button onClick={addBeneficiary} variant='outline' size='sm'>
                <Icon name='add' className='w-4 h-4 mr-2' />
                {t('beneficiaries.addButton')}
              </Button>
            </div>

            {willData.beneficiaries.length === 0 ? (
              <Card className='p-8 text-center'>
                <Icon
                  name='users'
                  className='w-12 h-12 text-muted-foreground mx-auto mb-4'
                />
                <p className='text-muted-foreground'>
                  {t('beneficiaries.emptyState.title')}
                </p>
                <p className='text-sm text-muted-foreground mt-2'>
                  {t('beneficiaries.emptyState.description')}
                </p>
              </Card>
            ) : (
              <div className='space-y-4'>
                {willData.beneficiaries.map((beneficiary, index) => (
                  <Card key={beneficiary.id} className='p-4'>
                    <div className='flex items-center justify-between mb-4'>
                      <Badge variant='secondary'>{t('beneficiaries.beneficiaryCard.title', { index: index + 1 })}</Badge>
                      <Button
                        onClick={() => removeBeneficiary(beneficiary.id)}
                        variant='ghost'
                        size='sm'
                        className='text-red-600 hover:text-red-700'
                      >
                        <Icon name='trash' className='w-4 h-4' />
                      </Button>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                      <div>
                        <Label>{t('beneficiaries.beneficiaryCard.fields.name.label')}</Label>
                        <Input
                          value={beneficiary.name}
                          onChange={e =>
                            updateBeneficiary(
                              beneficiary.id,
                              'name',
                              e.target.value
                            )
                          }
                          placeholder={t('beneficiaries.beneficiaryCard.fields.name.placeholder')}
                        />
                      </div>
                      <div>
                        <Label>{t('beneficiaries.beneficiaryCard.fields.relationship.label')}</Label>
                        <Select
                          value={beneficiary.relationship}
                          onValueChange={value =>
                            updateBeneficiary(
                              beneficiary.id,
                              'relationship',
                              value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RELATIONSHIPS.map(rel => (
                              <SelectItem key={rel.value} value={rel.value}>
                                {rel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t('beneficiaries.beneficiaryCard.fields.percentage.label')}</Label>
                        <Input
                          type='number'
                          min='0'
                          max='100'
                          value={beneficiary.percentage}
                          onChange={e =>
                            updateBeneficiary(
                              beneficiary.id,
                              'percentage',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder={t('beneficiaries.beneficiaryCard.fields.percentage.placeholder')}
                        />
                      </div>
                    </div>
                    <div className='mt-4'>
                      <Label>{t('beneficiaries.beneficiaryCard.fields.conditions.label')}</Label>
                      <Input
                        value={beneficiary.conditions || ''}
                        onChange={e =>
                          updateBeneficiary(
                            beneficiary.id,
                            'conditions',
                            e.target.value
                          )
                        }
                        placeholder={t('beneficiaries.beneficiaryCard.fields.conditions.placeholder')}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'assets':
        return (
          <div className='space-y-6'>
            <div className='text-center p-6'>
              <Icon
                name="building-office"
                className='w-12 h-12 text-primary mx-auto mb-4'
              />
              <h3 className='text-lg font-semibold mb-2'>
                Document Your Assets
              </h3>
              <p className='text-muted-foreground mb-4'>
                Add your assets manually or import them from your LegacyGuard
                vault for convenience.
              </p>
              <Button
                onClick={() => handleOpenVaultSelector('all')}
                variant='outline'
                className='bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary'
              >
                <Icon name="vault" className='w-4 h-4 mr-2' />
                Import from My Vault
              </Button>
            </div>

            {/* Real Estate */}
            <Card className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='font-semibold flex items-center gap-2'>
                  <Icon name="home" className='w-4 h-4' />
                  {t('assets.realEstate.title')}
                </h4>
                <div className='flex items-center gap-2'>
                  <Button
                    onClick={() => handleOpenVaultSelector('realEstate')}
                    variant='ghost'
                    size='sm'
                    className='text-primary hover:text-primary-hover'
                  >
                    <Icon name="vault" className='w-3 h-3 mr-1' />
                    {t('assets.realEstate.fromVaultButton')}
                  </Button>
                  <Button
                    onClick={() => {
                      const newAsset = {
                        description: '',
                        address: '',
                        value: 0,
                      };
                      updateWillData('assets', {
                        realEstate: [
                          ...(willData.assets.realEstate || []),
                          newAsset,
                        ],
                      });
                    }}
                    variant='outline'
                    size='sm'
                  >
                    <Icon name="add" className='w-3 h-3 mr-1' />
                    {t('assets.realEstate.addButton')}
                  </Button>
                </div>
              </div>
              {willData.assets.realEstate?.length ? (
                <div className='space-y-3'>
                  {willData.assets.realEstate.map((property, index) => (
                    <div
                      key={index}
                      className='grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-muted/50 rounded'
                    >
                      <Input
                        placeholder={t('assets.realEstate.fields.description')}
                        value={property.description}
                        onChange={e => {
                          const updated = [...willData.assets.realEstate!];
                          updated[index] = {
                            ...updated[index],
                            description: e.target.value,
                          };
                          updateWillData('assets', { realEstate: updated });
                        }}
                      />
                      <Input
                        placeholder={t('assets.realEstate.fields.address')}
                        value={property.address}
                        onChange={e => {
                          const updated = [...willData.assets.realEstate!];
                          updated[index] = {
                            ...updated[index],
                            address: e.target.value,
                          };
                          updateWillData('assets', { realEstate: updated });
                        }}
                      />
                      <div className='flex gap-2'>
                        <Input
                          type='number'
                          placeholder={t('assets.realEstate.fields.value')}
                          value={property.value || ''}
                          onChange={e => {
                            const updated = [...willData.assets.realEstate!];
                            updated[index] = {
                              ...updated[index],
                              value: parseFloat(e.target.value) || 0,
                            };
                            updateWillData('assets', { realEstate: updated });
                          }}
                        />
                        <Button
                          onClick={() => {
                            const updated = willData.assets.realEstate!.filter(
                              (_, i) => i !== index
                            );
                            updateWillData('assets', { realEstate: updated });
                          }}
                          variant='ghost'
                          size='sm'
                          className='text-red-600 hover:text-red-700'
                        >
                          <Icon name='trash' className='w-3 h-3' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  {t('assets.realEstate.emptyState')}
                </p>
              )}
            </Card>

            {/* Vehicles */}
            <Card className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='font-semibold flex items-center gap-2'>
                  <Icon name="car" className='w-4 h-4' />
                  {t('assets.vehicles.title')}
                </h4>
                <div className='flex items-center gap-2'>
                  <Button
                    onClick={() => handleOpenVaultSelector('vehicles')}
                    variant='ghost'
                    size='sm'
                    className='text-primary hover:text-primary-hover'
                  >
                    <Icon name="vault" className='w-3 h-3 mr-1' />
                    {t('assets.vehicles.fromVaultButton')}
                  </Button>
                  <Button
                    onClick={() => {
                      const newVehicle = {
                        description: '',
                        make: '',
                        model: '',
                        year: new Date().getFullYear(),
                        value: 0,
                        vin: '',
                      };
                      updateWillData('assets', {
                        vehicles: [
                          ...(willData.assets.vehicles || []),
                          newVehicle,
                        ],
                      });
                    }}
                    variant='outline'
                    size='sm'
                  >
                    <Icon name="add" className='w-3 h-3 mr-1' />
                    {t('assets.vehicles.addButton')}
                  </Button>
                </div>
              </div>
              {willData.assets.vehicles?.length ? (
                <div className='space-y-3'>
                  {willData.assets.vehicles.map((vehicle, index) => (
                    <div
                      key={index}
                      className='grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded'
                    >
                      <Input
                        placeholder={t('assets.vehicles.fields.make')}
                        value={vehicle.make}
                        onChange={e => {
                          const updated = [...willData.assets.vehicles!];
                          updated[index] = {
                            ...updated[index],
                            make: e.target.value,
                          };
                          updateWillData('assets', { vehicles: updated });
                        }}
                      />
                      <Input
                        placeholder={t('assets.vehicles.fields.model')}
                        value={vehicle.model}
                        onChange={e => {
                          const updated = [...willData.assets.vehicles!];
                          updated[index] = {
                            ...updated[index],
                            model: e.target.value,
                          };
                          updateWillData('assets', { vehicles: updated });
                        }}
                      />
                      <Input
                        type='number'
                        placeholder={t('assets.vehicles.fields.year')}
                        value={vehicle.year}
                        onChange={e => {
                          const updated = [...willData.assets.vehicles!];
                          updated[index] = {
                            ...updated[index],
                            year:
                              parseInt(e.target.value) ||
                              new Date().getFullYear(),
                          };
                          updateWillData('assets', { vehicles: updated });
                        }}
                      />
                      <div className='flex gap-2'>
                        <Input
                          placeholder={t('assets.vehicles.fields.vin')}
                          value={vehicle.vin || ''}
                          onChange={e => {
                            const updated = [...willData.assets.vehicles!];
                            updated[index] = {
                              ...updated[index],
                              vin: e.target.value,
                            };
                            updateWillData('assets', { vehicles: updated });
                          }}
                        />
                        <Button
                          onClick={() => {
                            const updated = willData.assets.vehicles!.filter(
                              (_, i) => i !== index
                            );
                            updateWillData('assets', { vehicles: updated });
                          }}
                          variant='ghost'
                          size='sm'
                          className='text-red-600 hover:text-red-700'
                        >
                          <Icon name='trash' className='w-3 h-3' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  {t('assets.vehicles.emptyState')}
                </p>
              )}
            </Card>

            {/* Bank Accounts */}
            <Card className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='font-semibold flex items-center gap-2'>
                  <Icon name="credit-card" className='w-4 h-4' />
                  {t('assets.bankAccounts.title')}
                </h4>
                <div className='flex items-center gap-2'>
                  <Button
                    onClick={() => handleOpenVaultSelector('bankAccounts')}
                    variant='ghost'
                    size='sm'
                    className='text-primary hover:text-primary-hover'
                  >
                    <Icon name="vault" className='w-3 h-3 mr-1' />
                    {t('assets.bankAccounts.fromVaultButton')}
                  </Button>
                  <Button
                    onClick={() => {
                      const newAccount = {
                        bank: '',
                        accountNumber: '',
                        type: 'checking' as
                          | 'checking'
                          | 'investment'
                          | 'savings',
                      };
                      updateWillData('assets', {
                        bankAccounts: [
                          ...(willData.assets.bankAccounts || []),
                          newAccount,
                        ],
                      });
                    }}
                    variant='outline'
                    size='sm'
                  >
                    <Icon name="add" className='w-3 h-3 mr-1' />
                    {t('assets.bankAccounts.addButton')}
                  </Button>
                </div>
              </div>
              {willData.assets.bankAccounts?.length ? (
                <div className='space-y-3'>
                  {willData.assets.bankAccounts.map((account, index) => (
                    <div
                      key={index}
                      className='grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-muted/50 rounded'
                    >
                      <Input
                        placeholder={t('assets.bankAccounts.fields.bankName')}
                        value={account.bank}
                        onChange={e => {
                          const updated = [...willData.assets.bankAccounts!];
                          updated[index] = {
                            ...updated[index],
                            bank: e.target.value,
                          };
                          updateWillData('assets', { bankAccounts: updated });
                        }}
                      />
                      <Select
                        value={account.type}
                        onValueChange={value => {
                          const updated = [...willData.assets.bankAccounts!];
                          updated[index] = {
                            ...updated[index],
                            type: value as
                              | 'checking'
                              | 'investment'
                              | 'savings',
                          };
                          updateWillData('assets', { bankAccounts: updated });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='checking'>{t('assets.bankAccounts.fields.type.checking')}</SelectItem>
                          <SelectItem value='savings'>{t('assets.bankAccounts.fields.type.savings')}</SelectItem>
                          <SelectItem value='investment'>{t('assets.bankAccounts.fields.type.investment')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className='flex gap-2'>
                        <Input
                          placeholder={t('assets.bankAccounts.fields.accountNumber')}
                          value={account.accountNumber}
                          onChange={e => {
                            const updated = [...willData.assets.bankAccounts!];
                            updated[index] = {
                              ...updated[index],
                              accountNumber: e.target.value,
                            };
                            updateWillData('assets', { bankAccounts: updated });
                          }}
                        />
                        <Button
                          onClick={() => {
                            const updated =
                              willData.assets.bankAccounts!.filter(
                                (_, i) => i !== index
                              );
                            updateWillData('assets', { bankAccounts: updated });
                          }}
                          variant='ghost'
                          size='sm'
                          className='text-red-600 hover:text-red-700'
                        >
                          <Icon name='trash' className='w-3 h-3' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  {t('assets.bankAccounts.emptyState')}
                </p>
              )}
            </Card>

            {/* Personal Property */}
            <Card className='p-4'>
              <div className='flex items-center justify-between mb-4'>
                <h4 className='font-semibold flex items-center gap-2'>
                  <Icon name="star" className='w-4 h-4' />
                  {t('assets.personalProperty.title')}
                </h4>
                <div className='flex items-center gap-2'>
                  <Button
                    onClick={() => handleOpenVaultSelector('personalProperty')}
                    variant='ghost'
                    size='sm'
                    className='text-primary hover:text-primary-hover'
                  >
                    <Icon name="vault" className='w-3 h-3 mr-1' />
                    {t('assets.personalProperty.fromVaultButton')}
                  </Button>
                  <Button
                    onClick={() => {
                      const newItem = {
                        description: '',
                        value: 0,
                        recipient: '',
                      };
                      updateWillData('assets', {
                        personalProperty: [
                          ...(willData.assets.personalProperty || []),
                          newItem,
                        ],
                      });
                    }}
                    variant='outline'
                    size='sm'
                  >
                    <Icon name="add" className='w-3 h-3 mr-1' />
                    {t('assets.personalProperty.addButton')}
                  </Button>
                </div>
              </div>
              {willData.assets.personalProperty?.length ? (
                <div className='space-y-3'>
                  {willData.assets.personalProperty.map((item, index) => (
                    <div
                      key={index}
                      className='grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-muted/50 rounded'
                    >
                      <Input
                        placeholder={t('assets.personalProperty.fields.description')}
                        value={item.description}
                        onChange={e => {
                          const updated = [
                            ...willData.assets.personalProperty!,
                          ];
                          updated[index] = {
                            ...updated[index],
                            description: e.target.value,
                          };
                          updateWillData('assets', {
                            personalProperty: updated,
                          });
                        }}
                      />
                      <Input
                        type='number'
                        placeholder={t('assets.personalProperty.fields.value')}
                        value={item.value || ''}
                        onChange={e => {
                          const updated = [
                            ...willData.assets.personalProperty!,
                          ];
                          updated[index] = {
                            ...updated[index],
                            value: parseFloat(e.target.value) || 0,
                          };
                          updateWillData('assets', {
                            personalProperty: updated,
                          });
                        }}
                      />
                      <div className='flex gap-2'>
                        <Input
                          placeholder={t('assets.personalProperty.fields.recipient')}
                          value={item.recipient || ''}
                          onChange={e => {
                            const updated = [
                              ...willData.assets.personalProperty!,
                            ];
                            updated[index] = {
                              ...updated[index],
                              recipient: e.target.value,
                            };
                            updateWillData('assets', {
                              personalProperty: updated,
                            });
                          }}
                        />
                        <Button
                          onClick={() => {
                            const updated =
                              willData.assets.personalProperty!.filter(
                                (_, i) => i !== index
                              );
                            updateWillData('assets', {
                              personalProperty: updated,
                            });
                          }}
                          variant='ghost'
                          size='sm'
                          className='text-red-600 hover:text-red-700'
                        >
                          <Icon name='trash' className='w-3 h-3' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground text-center py-4'>
                  {t('assets.personalProperty.emptyState')}
                </p>
              )}
            </Card>
          </div>
        );

      case 'executor':
        return (
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-semibold mb-4'>{t('executor.primary.title')}</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='primaryExecutorName'>{t('executor.primary.fields.name.label')}</Label>
                  <Input
                    id='primaryExecutorName'
                    value={willData.executor_data.primaryExecutor?.name || ''}
                    onChange={e =>
                      updateWillData('executor_data', {
                        primaryExecutor: {
                          name: e.target.value,
                          relationship:
                            willData.executor_data.primaryExecutor
                              ?.relationship || '',
                          phone:
                            willData.executor_data.primaryExecutor?.phone || '',
                        },
                      })
                    }
                    placeholder={t('executor.primary.fields.name.placeholder')}
                  />
                </div>
                <div>
                  <Label htmlFor='primaryExecutorRelationship'>
                    {t('executor.primary.fields.relationship.label')}
                  </Label>
                  <Input
                    id='primaryExecutorRelationship'
                    value={
                      willData.executor_data.primaryExecutor?.relationship || ''
                    }
                    onChange={e =>
                      updateWillData('executor_data', {
                        primaryExecutor: {
                          name:
                            willData.executor_data.primaryExecutor?.name || '',
                          relationship: e.target.value,
                          phone:
                            willData.executor_data.primaryExecutor?.phone || '',
                        },
                      })
                    }
                    placeholder={t('executor.primary.fields.relationship.placeholder')}
                  />
                </div>
              </div>
              <div className='mt-4'>
                <Label htmlFor='primaryExecutorPhone'>{t('executor.primary.fields.phone.label')}</Label>
                <Input
                  id='primaryExecutorPhone'
                  value={willData.executor_data.primaryExecutor?.phone || ''}
                  onChange={e =>
                    updateWillData('executor_data', {
                      primaryExecutor: {
                        name:
                          willData.executor_data.primaryExecutor?.name || '',
                        relationship:
                          willData.executor_data.primaryExecutor
                            ?.relationship || '',
                        phone: e.target.value,
                      },
                    })
                  }
                  placeholder={t('executor.primary.fields.phone.placeholder')}
                />
              </div>
            </div>

            <div>
              <h3 className='text-lg font-semibold mb-4'>
                {t('executor.backup.title')}
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='backupExecutorName'>{t('executor.backup.fields.name.label')}</Label>
                  <Input
                    id='backupExecutorName'
                    value={willData.executor_data.backupExecutor?.name || ''}
                    onChange={e =>
                      updateWillData('executor_data', {
                        backupExecutor: {
                          name: e.target.value,
                          relationship:
                            willData.executor_data.backupExecutor
                              ?.relationship || '',
                          phone:
                            willData.executor_data.backupExecutor?.phone || '',
                        },
                      })
                    }
                    placeholder={t('executor.backup.fields.name.placeholder')}
                  />
                </div>
                <div>
                  <Label htmlFor='backupExecutorRelationship'>
                    {t('executor.backup.fields.relationship.label')}
                  </Label>
                  <Input
                    id='backupExecutorRelationship'
                    value={
                      willData.executor_data.backupExecutor?.relationship || ''
                    }
                    onChange={e =>
                      updateWillData('executor_data', {
                        backupExecutor: {
                          name:
                            willData.executor_data.backupExecutor?.name || '',
                          relationship: e.target.value,
                          phone:
                            willData.executor_data.backupExecutor?.phone || '',
                        },
                      })
                    }
                    placeholder={t('executor.backup.fields.relationship.placeholder')}
                  />
                </div>
              </div>
            </div>

            <Card className='p-4 bg-amber-50 dark:bg-amber-900/20'>
              <div className='flex gap-3'>
                <Icon
                  name="info"
                  className='w-5 h-5 text-amber-600 flex-shrink-0 mt-1'
                />
                <div>
                  <h4 className='font-semibold text-amber-900 dark:text-amber-200'>
                    {t('executor.responsibilities.title')}
                  </h4>
                  <p className='text-sm text-amber-700 dark:text-amber-300 mt-1'>
                    {t('executor.responsibilities.description')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      case 'wishes':
        return (
          <div className='space-y-6'>
            <div>
              <Label htmlFor='funeralWishes'>{t('wishes.funeral.label')}</Label>
              <Textarea
                id='funeralWishes'
                value={willData.special_instructions.funeralWishes || ''}
                onChange={e =>
                  updateWillData('special_instructions', {
                    funeralWishes: e.target.value,
                  })
                }
                placeholder={t('wishes.funeral.placeholder')}
                rows={4}
              />
            </div>

            <div className='flex items-center space-x-3'>
              <input
                type='checkbox'
                id='organDonation'
                checked={willData.special_instructions.organDonation || false}
                onChange={e =>
                  updateWillData('special_instructions', {
                    organDonation: e.target.checked,
                  })
                }
                className='rounded'
              />
              <Label htmlFor='organDonation'>{t('wishes.organDonation.label')}</Label>
            </div>

            <div>
              <Label htmlFor='petCare'>
                {t('wishes.petCare.label')}
              </Label>
              <Textarea
                id='petCare'
                value={willData.special_instructions.petCare || ''}
                onChange={e =>
                  updateWillData('special_instructions', {
                    petCare: e.target.value,
                  })
                }
                placeholder={t('wishes.petCare.placeholder')}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor='digitalAssets'>{t('wishes.digitalAssets.label')}</Label>
              <Textarea
                id='digitalAssets'
                value={willData.special_instructions.digitalAssets || ''}
                onChange={e =>
                  updateWillData('special_instructions', {
                    digitalAssets: e.target.value,
                  })
                }
                placeholder={t('wishes.digitalAssets.placeholder')}
                rows={3}
              />
            </div>
          </div>
        );

      case 'sofia_check':
        return (
          <SofiaCorrectnessCheck
            willData={willData}
            willType={willType}
            onContinue={() => setCurrentStep(prev => prev + 1)}
            onGoToStep={goToStep}
          />
        );

      case 'review':
        return (
          <div className='space-y-6'>
            <div className='text-center mb-8'>
              <Icon
                name="documents"
                className='w-12 h-12 text-primary mx-auto mb-4'
              />
              <h3 className='text-2xl font-semibold mb-2'>{t('review.header.title')}</h3>
              <p className='text-muted-foreground'>
                {t('review.header.description')}
              </p>
            </div>

            {/* Summary cards for each section */}
            <div className='grid gap-4'>
              <Card className='p-4'>
                <h4 className='font-semibold mb-2 flex items-center gap-2'>
                  <Icon name="user" className='w-4 h-4' />
                  {t('review.sections.personalInfo.title')}
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {willData.testator_data.fullName} •{' '}
                  {willData.legal_data.jurisdiction}
                </p>
              </Card>

              <Card className='p-4'>
                <h4 className='font-semibold mb-2 flex items-center gap-2'>
                  <Icon name="users" className='w-4 h-4' />
                  {t('review.sections.beneficiaries.title')}
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {t('review.sections.beneficiaries.summary', { count: willData.beneficiaries.length })}
                </p>
              </Card>

              <Card className='p-4'>
                <h4 className='font-semibold mb-2 flex items-center gap-2'>
                  <Icon name="shield-check" className='w-4 h-4' />
                  {t('review.sections.executor.title')}
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {willData.executor_data.primaryExecutor?.name ||
                    t('review.sections.executor.notSpecified')}
                </p>
              </Card>
            </div>

            <Card className='p-4 bg-green-50 dark:bg-green-900/20'>
              <div className='flex gap-3'>
                <Icon
                  name="shield-check"
                  className='w-5 h-5 text-green-600 flex-shrink-0 mt-1'
                />
                <div>
                  <h4 className='font-semibold text-green-900 dark:text-green-200'>
                    {t('review.readyToCreate.title')}
                  </h4>
                  <p className='text-sm text-green-700 dark:text-green-300 mt-1'>
                    {t('review.readyToCreate.description')}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return <div>{t('common.stepNotImplemented')}</div>;
    }
  };

  return (
    <FocusModeWrapper
      currentStepTitle={STEPS[currentStep].title}
      currentStepIndex={currentStep}
      totalSteps={STEPS.length}
      onExitWizard={onClose}
    >
      <div className='min-h-screen bg-background flex flex-col'>
        {/* Header - Hidden in Focus Mode */}
        {!isFocusMode && (
          <header className='bg-card border-b border-card-border sticky top-0 z-50'>
            <div className='max-w-4xl mx-auto px-6 py-4'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <Button
                    onClick={onClose}
                    variant='ghost'
                    size='sm'
                    className='flex items-center gap-2'
                  >
                    <Icon name="arrow-left" className='w-4 h-4' />
                    {t('header.backButton')}
                  </Button>
                </div>
                <div className='text-center'>
                  <h1 className='text-xl font-semibold'>{t('header.title')}</h1>
                  <p className='text-sm text-muted-foreground'>
                    {t('header.stepIndicator', { current: currentStep + 1, total: STEPS.length, title: STEPS[currentStep].title })}
                  </p>
                </div>
                <div className='flex items-center gap-2'>
                  <FocusModeToggle />
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Progress Bar - Hidden in Focus Mode */}
        {!isFocusMode && (
          <div className='bg-card border-b border-card-border'>
            <div className='max-w-4xl mx-auto px-6 py-4'>
              <Progress value={progress} className='h-2' />
              <div className='flex justify-between mt-2 text-xs text-muted-foreground'>
                {STEPS.map((step, index) => (
                  <span
                    key={step.id}
                    className={
                      index <= currentStep ? 'text-primary font-medium' : ''
                    }
                  >
                    {step.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Draft Data Indicator */}
        {initialData && !isFocusMode && (
          <div className='bg-primary/5 border-b border-primary/20'>
            <div className='max-w-4xl mx-auto px-6 py-3'>
              <div className='flex items-center gap-3 text-sm'>
                <Icon
                  name="sparkles"
                  className='w-4 h-4 text-primary'
                />
                <span className='text-primary font-medium'>
                  {t('draftData.indicator')}
                </span>
                <span className='text-muted-foreground'>
                  {t('draftData.description')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content - Conditional Layout */}
        <main className='flex-1 flex overflow-hidden'>
          {currentStepId === 'sofia_check' || currentStepId === 'review' ? (
            /* Full Width for Sofia Check and Review */
            <div className='flex-1 flex flex-col'>
              <div className='p-6 overflow-y-auto max-w-4xl mx-auto w-full'>
                <FadeIn key={currentStep} duration={0.3}>
                  <div className='mb-6'>
                    <h2 className='text-2xl font-semibold mb-2'>
                      {STEPS[currentStep].title}
                    </h2>
                    <p className='text-muted-foreground'>
                      {STEPS[currentStep].description}
                    </p>
                  </div>

                  {renderStepContent()}
                </FadeIn>
              </div>
            </div>
          ) : (
            /* Dual Panel Layout for Form Steps */
            <>
              {/* Left Panel - Form (40% width) */}
              <div className='w-2/5 flex flex-col border-r border-card-border'>
                <div className='p-6 overflow-y-auto'>
                  <FadeIn key={currentStep} duration={0.3}>
                    <div className='mb-6'>
                      <h2 className='text-2xl font-semibold mb-2'>
                        {STEPS[currentStep].title}
                      </h2>
                      <p className='text-muted-foreground'>
                        {STEPS[currentStep].description}
                      </p>
                    </div>

                    {renderStepContent()}
                  </FadeIn>
                </div>
              </div>

              {/* Right Panel - Live Preview (60% width) */}
              <div className='w-3/5 flex flex-col'>
                <LiveWillPreview
                  willData={willData}
                  willType={willType}
                  currentStep={currentStepId}
                />
              </div>
            </>
          )}
        </main>

        {/* Navigation */}
        <footer className='bg-card border-t border-card-border'>
          <div className='px-6 py-4'>
            <div className='flex justify-between items-center'>
              <Button
                onClick={handleBack}
                variant='outline'
                disabled={currentStep === 0 && !onBack}
              >
                <Icon name="arrow-left" className='w-4 h-4 mr-2' />
                {currentStep === 0 ? t('navigation.changeWillType') : t('navigation.back')}
              </Button>

              <div className='flex items-center gap-4'>
                {!isFocusMode && (
                  <div className='text-sm text-muted-foreground'>
                    {t('navigation.stepCounter', { current: currentStep + 1, total: STEPS.length })}
                  </div>
                )}
                <Button
                  onClick={handleNext}
                  className='bg-primary hover:bg-primary-hover text-primary-foreground'
                >
                  {currentStep === STEPS.length - 1
                    ? t('navigation.createWill')
                    : t('navigation.continue')}
                  {currentStep !== STEPS.length - 1 && (
                    <Icon
                      name="arrow-right"
                      className='w-4 h-4 ml-2'
                    />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Vault Asset Selector Modal */}
      {showVaultSelector && (
        <VaultAssetSelector
          onAssetsSelected={handleVaultAssetsSelected}
          onClose={() => setShowVaultSelector(false)}
          assetType={vaultSelectorType}
        />
      )}
    </FocusModeWrapper>
  );
};
