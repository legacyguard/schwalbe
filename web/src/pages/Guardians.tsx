
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useTranslation } from 'react-i18next';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import {
  type ProfileData,
  ProfileGrid,
} from '@/components/enhanced/ProfileCard';
import { MetricsGrid } from '@/components/enhanced/MetricCard';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';

// Guardian interface (simplified for localStorage)
interface Guardian {
  can_access_financial_docs: boolean;
  can_access_health_docs: boolean;
  can_trigger_emergency: boolean;
  created_at: string;
  email: string;
  emergency_contact_priority: number;
  id: string;
  is_active: boolean;
  is_child_guardian: boolean;
  is_will_executor: boolean;
  name: string;
  notes?: string;
  phone?: string;
  relationship?: string;
}

interface GuardianFormData {
  can_access_financial_docs: boolean;
  can_access_health_docs: boolean;
  can_trigger_emergency: boolean;
  email: string;
  emergency_contact_priority: number;
  is_child_guardian: boolean;
  is_will_executor: boolean;
  name: string;
  notes: string;
  phone: string;
  relationship: string;
}

const GUARDIAN_RELATIONSHIPS = [
  'spouse',
  'parent',
  'sibling',
  'child',
  'friend',
  'attorney',
  'financialAdvisor',
  'other',
];

export default function GuardiansEnhanced() {
  const { t } = useTranslation('features.family.guardians');
  const { t: tCommon } = useTranslation('common.ui');
  usePageTitle(t('title'));
  const { userId: _userId } = useAuth();

  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState<Guardian | null>(null);

  // Confirmation dialog state
  const [_isConfirmDialogOpen, _setIsConfirmDialogOpen] = useState(false);
  const [_guardianToDelete, setGuardianToDelete] = useState<null | ProfileData>(
    null
  );

  // Form state
  const [formData, setFormData] = useState<GuardianFormData>({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    notes: '',
    can_trigger_emergency: false,
    can_access_health_docs: false,
    can_access_financial_docs: false,
    is_child_guardian: false,
    is_will_executor: false,
    emergency_contact_priority: 1,
  });

  // Load guardians from localStorage
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedGuardians = localStorage.getItem('guardians_data');
      if (storedGuardians) {
        setGuardians(JSON.parse(storedGuardians));
      } else {
        // Initialize with sample data
        const sampleGuardians: Guardian[] = [
          {
            id: '1',
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            phone: '+1 234 567 8900',
            relationship: 'Spouse',
            notes:
              'Primary emergency contact with full access to all documents',
            can_trigger_emergency: true,
            can_access_health_docs: true,
            can_access_financial_docs: true,
            is_child_guardian: false,
            is_will_executor: true,
            emergency_contact_priority: 1,
            is_active: true,
            created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
          },
          {
            id: '2',
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '+1 234 567 8901',
            relationship: 'Brother',
            notes: 'Designated guardian for children',
            can_trigger_emergency: true,
            can_access_health_docs: true,
            can_access_financial_docs: false,
            is_child_guardian: true,
            is_will_executor: false,
            emergency_contact_priority: 2,
            is_active: true,
            created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
          },
          {
            id: '3',
            name: 'Mary Johnson',
            email: 'mary.j@example.com',
            relationship: 'Attorney',
            can_trigger_emergency: false,
            can_access_health_docs: false,
            can_access_financial_docs: true,
            is_child_guardian: false,
            is_will_executor: true,
            emergency_contact_priority: 3,
            is_active: true,
            created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          },
        ];
        setGuardians(sampleGuardians);
        localStorage.setItem('guardians_data', JSON.stringify(sampleGuardians));
      }
    } catch (error) {
      console.error('Error loading guardians:', error);
      toast.error('Failed to load guardians');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save guardians to localStorage whenever they change
  useEffect(() => {
    if (guardians.length > 0 || localStorage.getItem('guardians_data')) {
      localStorage.setItem('guardians_data', JSON.stringify(guardians));
    }
  }, [guardians]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingGuardian) {
        // Update existing guardian
        const updated = {
          ...editingGuardian,
          ...formData,
        };
        setGuardians(prev =>
          prev.map(g => (g.id === editingGuardian.id ? updated : g))
        );
        toast.success(`${formData.name} has been updated!`);
      } else {
        // Create new guardian
        const newGuardian: Guardian = {
          id: Date.now().toString(),
          ...formData,
          is_active: true,
          created_at: new Date().toISOString(),
        };
        setGuardians(prev => [...prev, newGuardian]);
        toast.success(`${formData.name} was successfully added as a guardian!`);
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        relationship: '',
        notes: '',
        can_trigger_emergency: false,
        can_access_health_docs: false,
        can_access_financial_docs: false,
        is_child_guardian: false,
        is_will_executor: false,
        emergency_contact_priority: 1,
      });

      setIsDialogOpen(false);
      setEditingGuardian(null);
    } catch (error) {
      console.error('Error saving guardian:', error);
      toast.error('Failed to save guardian. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert Guardian to ProfileData
  const convertToProfileData = (guardian: Guardian): ProfileData => {
    const roles = [];
    if (guardian.is_will_executor) roles.push('Executor');
    if (guardian.is_child_guardian) roles.push('Child Guardian');
    if (guardian.can_trigger_emergency) roles.push('Emergency Contact');

    const completionPercentage =
      [
        guardian.name,
        guardian.email,
        guardian.phone,
        guardian.relationship,
        roles.length > 0,
      ].filter(Boolean).length * 20;

    return {
      id: guardian.id,
      name: guardian.name,
      email: guardian.email,
      phone: guardian.phone,
      relationship: guardian.relationship,
      roles,
      status: guardian.is_active ? 'active' : 'inactive',
      completionPercentage,
      metadata: {
        Access:
          guardian.can_access_financial_docs && guardian.can_access_health_docs
            ? 'Full Access'
            : guardian.can_access_health_docs
              ? 'Health Only'
              : guardian.can_access_financial_docs
                ? 'Financial Only'
                : 'Limited',
        Priority: `Level ${guardian.emergency_contact_priority}`,
        Added: new Date(guardian.created_at).toLocaleDateString(),
      },
    };
  };

  // Handle edit
  const handleEdit = (profile: ProfileData) => {
    const guardian = guardians.find(g => g.id === profile.id);
    if (guardian) {
      setEditingGuardian(guardian);
      setFormData({
        name: guardian.name,
        email: guardian.email,
        phone: guardian.phone || '',
        relationship: guardian.relationship || '',
        notes: guardian.notes || '',
        can_trigger_emergency: guardian.can_trigger_emergency,
        can_access_health_docs: guardian.can_access_health_docs,
        can_access_financial_docs: guardian.can_access_financial_docs,
        is_child_guardian: guardian.is_child_guardian,
        is_will_executor: guardian.is_will_executor,
        emergency_contact_priority: guardian.emergency_contact_priority,
      });
      setIsDialogOpen(true);
    }
  };

  // Handle delete confirmation
  const _handleDeleteClick = (profile: ProfileData) => {
    setGuardianToDelete(profile);
    _setIsConfirmDialogOpen(true);
  };

  // Handle delete after confirmation
  // const __handleDeleteConfirm = async () => { // Unused
  // if (!guardianToDelete) return;
  //
  // setGuardians(prev => prev.filter(g => g.id !== guardianToDelete.id));
  // toast.success(`${guardianToDelete.name} has been removed as a guardian`);
  //
    // Close dialog and reset state
  // _setIsConfirmDialogOpen(false);
  // setGuardianToDelete(null);
  // }; // Unused

  // Handle delete cancellation
  // const __handleDeleteCancel = () => { // Unused
  // _setIsConfirmDialogOpen(false);
  // setGuardianToDelete(null);
  // }; // Unused

  // Handle delete - using the delete confirmation flow
  const handleDelete = (profile: ProfileData) => {
    _handleDeleteClick(profile);
  };

  // Handle view details
  const handleViewDetails = (profile: ProfileData) => {
    const guardian = guardians.find(g => g.id === profile.id);
    if (guardian && guardian.notes) {
      toast.info(guardian.notes, {
        description: `Notes for ${guardian.name}`,
        duration: 5000,
      });
    }
  };

  // Calculate metrics
  const metrics = useMemo(
    () => [
      {
        title: 'Total Guardians',
        value: guardians.length.toString(),
        icon: 'shield' as const,
        color: 'primary' as const,
        trend: guardians.length > 0 ? 'up' as const : 'neutral' as const,
        onClick: () => {},
      },
      {
        title: 'Executors',
        value: guardians.filter(g => g.is_will_executor).length.toString(),
        icon: 'user' as const,
        color: 'success' as const,
        changeLabel: 'Appointed',
      },
      {
        title: 'Child Guardians',
        value: guardians.filter(g => g.is_child_guardian).length.toString(),
        icon: 'users' as const,
        color: 'info' as const,
        changeLabel: 'Designated',
      },
      {
        title: 'Emergency Contacts',
        value: guardians.filter(g => g.can_trigger_emergency).length.toString(),
        icon: 'alert-circle' as const,
        color: 'warning' as const,
        changeLabel: 'Ready',
      },
    ],
    [guardians]
  );

  // Handle form input changes
  const handleInputChange = (
    field: keyof GuardianFormData,
    value: boolean | number | string
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-background'>
        {/* Header */}
        <header className='bg-card border-b border-card-border'>
          <div className='max-w-7xl mx-auto px-6 lg:px-8 py-8'>
            <div className='flex items-start justify-between'>
              <div>
                <FadeIn duration={0.5} delay={0.2}>
                  <h1 className='text-3xl lg:text-4xl font-bold font-heading text-card-foreground mb-3'>
                    My Guardians
                  </h1>
                </FadeIn>
                <FadeIn duration={0.5} delay={0.4}>
                  <p
                    className='text-lg leading-relaxed max-w-2xl mb-4'
                    style={{ color: 'hsl(var(--muted-text))' }}
                  >
                    Your Circle of Trust. These trusted people can help your
                    family access important information when needed.
                  </p>
                  <p className='text-sm text-muted-foreground/80 max-w-2xl italic'>
                    💙 Just like the key you engraved during onboarding, these
                    guardians represent the people you trust most completely -
                    those who understand your heart and will honor your wishes.
                  </p>
                </FadeIn>
              </div>
              <FadeIn duration={0.5} delay={0.6}>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className='bg-primary hover:bg-primary-hover text-primary-foreground shadow-md'
                      size='lg'
                    >
                      <Icon name="add" className='w-5 h-5 mr-2' />
                      {t('actions.addGuardian')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
                    <DialogHeader>
                      <DialogTitle>
                        {editingGuardian ? 'Edit Guardian' : 'Add New Guardian'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='name'>
                            {t('form.labels.fullName')} *
                          </Label>
                          <Input
                            id='name'
                            value={formData.name}
                            onChange={e =>
                              handleInputChange('name', e.target.value)
                            }
                            placeholder={t('form.placeholders.fullName')}
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='email'>
                            {t('form.labels.email')} *
                          </Label>
                          <Input
                            id='email'
                            type='email'
                            value={formData.email}
                            onChange={e =>
                              handleInputChange('email', e.target.value)
                            }
                            placeholder={t('form.placeholders.email')}
                            required
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='phone'>
                            {t('form.labels.phone')}
                          </Label>
                          <Input
                            id='phone'
                            type='tel'
                            value={formData.phone}
                            onChange={e =>
                              handleInputChange('phone', e.target.value)
                            }
                            placeholder='+1 234 567 8900'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='relationship'>
                            {t('form.labels.relationship')}
                          </Label>
                          <Select
                            value={formData.relationship}
                            onValueChange={value =>
                              handleInputChange('relationship', value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'form.placeholders.relationship'
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {GUARDIAN_RELATIONSHIPS.map(rel => (
                                <SelectItem key={rel} value={rel}>
                                  {t(`relationships.${rel}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='notes'>Notes</Label>
                        <Textarea
                          id='notes'
                          value={formData.notes}
                          onChange={e =>
                            handleInputChange('notes', e.target.value)
                          }
                          placeholder={t('form.placeholders.instructions')}
                          rows={3}
                        />
                      </div>

                      <div className='space-y-4'>
                        <h4 className='font-medium'>
                          Family Shield Protocol Permissions
                        </h4>

                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <Label htmlFor='emergency' className='text-sm'>
                              Can trigger emergency protocol
                            </Label>
                            <Switch
                              id='emergency'
                              checked={formData.can_trigger_emergency}
                              onCheckedChange={checked =>
                                handleInputChange(
                                  'can_trigger_emergency',
                                  checked
                                )
                              }
                            />
                          </div>

                          <div className='flex items-center justify-between'>
                            <Label htmlFor='health' className='text-sm'>
                              Can access health documents
                            </Label>
                            <Switch
                              id='health'
                              checked={formData.can_access_health_docs}
                              onCheckedChange={checked =>
                                handleInputChange(
                                  'can_access_health_docs',
                                  checked
                                )
                              }
                            />
                          </div>

                          <div className='flex items-center justify-between'>
                            <Label htmlFor='financial' className='text-sm'>
                              Can access financial documents
                            </Label>
                            <Switch
                              id='financial'
                              checked={formData.can_access_financial_docs}
                              onCheckedChange={checked =>
                                handleInputChange(
                                  'can_access_financial_docs',
                                  checked
                                )
                              }
                            />
                          </div>

                          <div className='flex items-center justify-between'>
                            <Label htmlFor='child' className='text-sm'>
                              Is designated child guardian
                            </Label>
                            <Switch
                              id='child'
                              checked={formData.is_child_guardian}
                              onCheckedChange={checked =>
                                handleInputChange('is_child_guardian', checked)
                              }
                            />
                          </div>

                          <div className='flex items-center justify-between'>
                            <Label htmlFor='executor' className='text-sm'>
                              Is will executor
                            </Label>
                            <Switch
                              id='executor'
                              checked={formData.is_will_executor}
                              onCheckedChange={checked =>
                                handleInputChange('is_will_executor', checked)
                              }
                            />
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='priority'>
                            Emergency Contact Priority
                          </Label>
                          <Select
                            value={formData.emergency_contact_priority.toString()}
                            onValueChange={value =>
                              handleInputChange(
                                'emergency_contact_priority',
                                parseInt(value)
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(priority => (
                                <SelectItem
                                  key={priority}
                                  value={priority.toString()}
                                >
                                  Priority {priority}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className='flex justify-end space-x-2'>
                        <Button
                          type='button'
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            setEditingGuardian(null);
                          }}
                        >
                          {t('actions.cancel')}
                        </Button>
                        <Button type='submit' disabled={isSubmitting}>
                          {isSubmitting
                            ? tCommon('message.saving')
                            : editingGuardian
                              ? t('actions.editGuardian')
                              : t('actions.addGuardian')}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </FadeIn>
            </div>
          </div>
        </header>

        <main className='max-w-7xl mx-auto px-6 lg:px-8 py-12'>
          <div className='space-y-8'>
            {/* Metrics Overview */}
            <FadeIn duration={0.5} delay={0.8}>
              <MetricsGrid metrics={metrics} columns={4} />
            </FadeIn>

            {/* Guardians Grid */}
            <FadeIn duration={0.5} delay={1}>
              {isLoading ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='text-center'>
                    <Icon
                      name="loader"
                      className='w-8 h-8 animate-spin mx-auto mb-4 text-primary'
                    />
                    <p className='text-muted-foreground'>
                      Loading guardians...
                    </p>
                  </div>
                </div>
              ) : guardians.length === 0 ? (
                <Card className='p-12'>
                  <div className='text-center'>
                    <Icon
                      name="shield"
                      className='w-16 h-16 mx-auto mb-4 text-muted-foreground/50'
                    />
                    <h3 className='text-xl font-semibold mb-2'>
                      No Guardians Yet
                    </h3>
                    <p className='text-muted-foreground mb-6 max-w-md mx-auto'>
                      Add your first guardian to ensure your family has access
                      to important information when needed.
                    </p>
                    <Button size='lg' onClick={() => setIsDialogOpen(true)}>
                      <Icon name="add" className='w-5 h-5 mr-2' />
                      Add Your First Guardian
                    </Button>
                  </div>
                </Card>
              ) : (
                <div>
                  <h2 className='text-xl font-semibold mb-6 text-card-foreground'>
                    Your Trusted Circle
                  </h2>
                  <ProfileGrid
                    profiles={guardians.map(convertToProfileData)}
                    columns={3}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                    onMessage={profile => {
                      toast.info(
                        `Messaging feature coming soon for ${profile.name}`
                      );
                    }}
                  />
                </div>
              )}
            </FadeIn>

            {/* Information Section */}
            {guardians.length > 0 && (
              <FadeIn duration={0.5} delay={1.2}>
                <Card className='p-8 bg-primary/5 border-primary/20'>
                  <div className='flex items-start gap-4'>
                    <Icon
                      name="info"
                      className='w-6 h-6 text-primary flex-shrink-0 mt-1'
                    />
                    <div>
                      <h4 className='font-semibold text-primary mb-2'>
                        The Trust Behind Your Guardians
                      </h4>
                      <p className='text-muted-foreground mb-4'>
                        Your guardians represent the deepest level of trust -
                        people who would protect your family's interests just as
                        you would. They're not just emergency contacts; they're
                        the extension of your care and wisdom when your loved
                        ones need guidance most.
                      </p>
                      <p className='text-sm text-muted-foreground/80 italic'>
                        ✨ Every guardian you add strengthens your family's
                        safety net, giving you peace of mind that someone who
                        truly understands your values will be there to help.
                      </p>
                    </div>
                  </div>
                </Card>
              </FadeIn>
            )}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
