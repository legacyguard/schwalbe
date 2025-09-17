
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@clerk/clerk-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';
import { usePageTitle } from '@/hooks/usePageTitle';
import { toast } from 'sonner';
import { useSupabaseWithClerk } from '@/integrations/supabase/client';
import type {
  CreateGuidanceEntryRequest,
  FamilyGuidanceEntry,
  Guardian,
  ManualEntryType,
} from '@/types/guardian';

const getEntryTypes = (t: any) => [
  {
    value: 'important_contacts',
    label: t('entryTypes.important_contacts.label'),
    description: t('entryTypes.important_contacts.description'),
    icon: 'phone',
    color: 'blue',
  },
  {
    value: 'financial_access',
    label: t('entryTypes.financial_access.label'),
    description: t('entryTypes.financial_access.description'),
    icon: 'credit-card',
    color: 'green',
  },
  {
    value: 'property_management',
    label: t('entryTypes.property_management.label'),
    description: t('entryTypes.property_management.description'),
    icon: 'home',
    color: 'purple',
  },
  {
    value: 'funeral_wishes',
    label: t('entryTypes.funeral_wishes.label'),
    description: t('entryTypes.funeral_wishes.description'),
    icon: 'heart',
    color: 'pink',
  },
  {
    value: 'document_locations',
    label: t('entryTypes.document_locations.label'),
    description: t('entryTypes.document_locations.description'),
    icon: 'file-text',
    color: 'amber',
  },
  {
    value: 'child_care_instructions',
    label: t('entryTypes.child_care_instructions.label'),
    description: t('entryTypes.child_care_instructions.description'),
    icon: 'baby',
    color: 'cyan',
  },
  {
    value: 'emergency_procedure',
    label: t('entryTypes.emergency_procedure.label'),
    description: t('entryTypes.emergency_procedure.description'),
    icon: 'alert-triangle',
    color: 'red',
  },
  {
    value: 'custom_instruction',
    label: t('entryTypes.custom_instruction.label'),
    description: t('entryTypes.custom_instruction.description'),
    icon: 'edit',
    color: 'gray',
  },
] as const;

export default function SurvivorManualPage() {
  const { t } = useTranslation('pages/survivor-manual');
  usePageTitle(t('pageTitle'));
  const { userId } = useAuth();
  const createSupabaseClient = useSupabaseWithClerk();

  const [entries, setEntries] = useState<FamilyGuidanceEntry[]>([]);
  const [_guardians, _setGuardians] = useState<Guardian[]>([]);
  const [isLoading, _setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FamilyGuidanceEntry | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState<CreateGuidanceEntryRequest>({
    entry_type: 'important_contacts',
    title: '',
    content: '',
    priority: 1,
    tags: [],
    related_document_ids: [],
  });

  // Generate initial entries based on user's guardians and documents
  const generateInitialEntries = useCallback(
    async (supabase: any, userGuardians: Guardian[]) => {
      const initialEntries: Omit<
        FamilyGuidanceEntry,
        'created_at' | 'id' | 'updated_at'
      >[] = [];

      // Important Contacts - auto-filled with guardians
      if (userGuardians.length > 0) {
        const contactsList = userGuardians
          .map(
            g =>
              `${g.name} (${g.relationship}): ${g.email}${g.phone ? `, ${g.phone}` : ''}`
          )
          .join('\n');
        initialEntries.push({
          user_id: userId!,
          entry_type: 'important_contacts',
          title: t('templates.emergencyContacts.title'),
          content: `${t('templates.emergencyContacts.content')}\n\n${contactsList}`,
          is_completed: false,
          priority: 1,
          tags: ['contacts', 'guardians'],
          related_document_ids: [],
          is_auto_generated: true,
        });
      }

      // Financial Access - template
      initialEntries.push({
        user_id: userId!,
        entry_type: 'financial_access',
        title: t('templates.bankAccess.title'),
        content: t('templates.bankAccess.content'),
        is_completed: false,
        priority: 2,
        tags: ['finances', 'banks'],
        related_document_ids: [],
        is_auto_generated: true,
      });

      // Document Locations - template
      initialEntries.push({
        user_id: userId!,
        entry_type: 'document_locations',
        title: t('templates.documentLocations.title'),
        content: t('templates.documentLocations.content'),
        is_completed: false,
        priority: 3,
        tags: ['documents', 'legal'],
        related_document_ids: [],
        is_auto_generated: true,
      });

      try {
        const { data, error } = await supabase
          .from('family_guidance_entries')
          .insert(initialEntries)
          .select();

        if (error) throw error;

        const mappedEntries = (data || []).map((entry: any) => ({
          ...entry,
          is_auto_generated: (entry as any).is_auto_generated ?? true,
          tags: (entry as any).tags || [],
          related_document_ids: entry.related_document_ids || [],
        }));
        setEntries(mappedEntries as FamilyGuidanceEntry[]);
        toast.success(
          t('messages.initialManualCreated')
        );
      } catch (error) {
        console.error('Error generating initial entries:', error);
      }
    },
    [userId]
  );

  // Fetch data
  const fetchData = useCallback(async () => {
    // ... existing code ...
  }, [userId, createSupabaseClient, generateInitialEntries]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // Validation
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error(t('validation.titleAndContentRequired'));
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = await createSupabaseClient();

      if (editingEntry) {
        // Update existing entry
        const { data, error } = await supabase
          .from('family_guidance_entries')
          .update({
            entry_type: formData.entry_type,
            title: formData.title.trim(),
            content: formData.content.trim(),
            priority: formData.priority || 1,
            tags: formData.tags || [],
          })
          .eq('id', editingEntry.id)
          .select()
          .single();

        if (error) throw error;

        const mappedData = {
          ...data,
          is_auto_generated: (data as any).is_auto_generated ?? false,
          tags: (data as any).tags || [],
        } as FamilyGuidanceEntry;
        setEntries(prev =>
          prev.map(entry => (entry.id === editingEntry.id ? mappedData : entry))
        );
        toast.success('Manual entry updated successfully!');
      } else {
        // Create new entry
        const { data, error } = await supabase
          .from('family_guidance_entries')
          .insert({
            user_id: userId,
            entry_type: formData.entry_type,
            title: formData.title.trim(),
            content: formData.content.trim(),
            priority: formData.priority || 1,
            tags: formData.tags || [],
            is_auto_generated: false,
          })
          .select()
          .single();

        if (error) throw error;

        const mappedNewEntry = {
          ...data,
          is_auto_generated: (data as any).is_auto_generated ?? false,
          tags: (data as any).tags || [],
        } as FamilyGuidanceEntry;
        setEntries(prev =>
          [...prev, mappedNewEntry].sort((a, b) => a.priority - b.priority)
        );
        toast.success('Manual entry added successfully!');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Failed to save entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      entry_type: 'important_contacts',
      title: '',
      content: '',
      priority: 1,
      tags: [],
      related_document_ids: [],
    });
    setEditingEntry(null);
    setIsDialogOpen(false);
  };

  // Handle edit
  const handleEdit = (entry: FamilyGuidanceEntry) => {
    setFormData({
      entry_type: entry.entry_type,
      title: entry.title,
      content: entry.content,
      priority: entry.priority,
      tags: entry.tags,
      related_document_ids: entry.related_document_ids,
    });
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  // Toggle completion
  const toggleCompletion = async (entry: FamilyGuidanceEntry) => {
    try {
      const supabase = await createSupabaseClient();

      const { data, error } = await supabase
        .from('family_guidance_entries')
        .update({ is_completed: !entry.is_completed })
        .eq('id', entry.id)
        .select()
        .single();

      if (error) throw error;

      const mappedData = {
        ...data,
        is_auto_generated: (data as any).is_auto_generated ?? false,
        tags: (data as any).tags || [],
      } as FamilyGuidanceEntry;
      setEntries(prev => prev.map(e => (e.id === entry.id ? mappedData : e)));
      toast.success(
        data.is_completed ? t('messages.entryMarkedCompleted') : t('messages.entryMarkedIncomplete')
      );
    } catch (error) {
      console.error('Error updating completion:', error);
      toast.error(t('messages.failedToUpdate'));
    }
  };

  // Handle form input changes
  const handleInputChange = (
    field: keyof CreateGuidanceEntryRequest,
    value: any
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get completion percentage
  const completionPercentage =
    entries.length > 0
      ? Math.round(
          (entries.filter(e => e.is_completed).length / entries.length) * 100
        )
      : 0;

  // Group entries by type
  const entriesByType = entries.reduce(
    (acc, entry) => {
      if (!acc[entry.entry_type]) {
        acc[entry.entry_type] = [];
      }
      acc[entry.entry_type].push(entry);
      return acc;
    },
    {} as Record<ManualEntryType, FamilyGuidanceEntry[]>
  );

  // const __getTypeConfig = (type: ManualEntryType) => // Unused
    ENTRY_TYPES[0];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className='min-h-screen bg-background flex items-center justify-center'>
          <Icon name='loader' className='w-8 h-8 animate-spin text-primary' />
          <span className='ml-3 text-muted-foreground'>
            {t('loading')}
          </span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className='min-h-screen bg-background'>
        {/* Header */}
        <header className='bg-card border-b border-card-border'>
          <div className='max-w-6xl mx-auto px-6 lg:px-8 py-8'>
            <div className='flex items-start justify-between'>
              <div>
                <FadeIn duration={0.5} delay={0.2}>
                  <div className='flex items-center gap-3 mb-3'>
                    <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center'>
                      <Icon name='file-text' className='w-6 h-6 text-primary' />
                    </div>
                    <h1 className='text-3xl lg:text-4xl font-bold font-heading text-card-foreground'>
                      {t('header.title')}
                    </h1>
                  </div>
                </FadeIn>
                <FadeIn duration={0.5} delay={0.4}>
                  <p
                    className='text-lg leading-relaxed max-w-3xl mb-4'
                    style={{ color: 'hsl(var(--muted-text))' }}
                  >
                    {t('header.description')}
                  </p>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                      <div className='w-4 h-4 bg-primary rounded-full'></div>
                      <span className='text-sm text-muted-foreground'>
                        {t('header.completionStatus', { percentage: completionPercentage })}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Icon
                        name='check-circle'
                        className='w-4 h-4 text-green-600'
                      />
                      <span className='text-sm text-muted-foreground'>
                        {t('header.entriesCompleted', {
                          completed: entries.filter(e => e.is_completed).length,
                          total: entries.length
                        })}
                      </span>
                    </div>
                  </div>
                </FadeIn>
              </div>
              <FadeIn duration={0.5} delay={0.6}>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className='bg-primary hover:bg-primary-hover text-primary-foreground shadow-md'
                      size='lg'
                      onClick={() => setEditingEntry(null)}
                    >
                      <Icon name='plus' className='w-5 h-5 mr-2' />
                      {t('buttons.addEntry')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[700px]'>
                    <DialogHeader>
                      <DialogTitle>
                        {editingEntry
                          ? t('dialog.editTitle')
                          : t('dialog.addTitle')}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='entry_type'>{t('dialog.category')}</Label>
                          <Select
                            value={formData.entry_type}
                            onValueChange={value =>
                              handleInputChange(
                                'entry_type',
                                value as ManualEntryType
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getEntryTypes(t).map(type => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className='flex items-center gap-2'>
                                    <Icon
                                      name={type.icon as any}
                                      className='w-4 h-4'
                                    />
                                    {type.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor='priority'>
                            {t('dialog.priority')}
                          </Label>
                          <Input
                            id='priority'
                            type='number'
                            min='1'
                            max='10'
                            value={formData.priority}
                            onChange={e =>
                              handleInputChange(
                                'priority',
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='title'>{t('dialog.title')}</Label>
                        <Input
                          id='title'
                          value={formData.title}
                          onChange={e =>
                            handleInputChange('title', e.target.value)
                          }
                          placeholder={t('dialog.titlePlaceholder')}
                          required
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='content'>{t('dialog.instructions')}</Label>
                        <Textarea
                          id='content'
                          value={formData.content}
                          onChange={e =>
                            handleInputChange('content', e.target.value)
                          }
                          placeholder={t('dialog.instructionsPlaceholder')}
                          rows={6}
                          required
                        />
                      </div>

                      <div className='flex justify-end gap-3 pt-4'>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={resetForm}
                        >
                          {t('buttons.cancel')}
                        </Button>
                        <Button type='submit' disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Icon
                                name='loader'
                                className='w-4 h-4 mr-2 animate-spin'
                              />
                              {editingEntry ? t('buttons.updatingEntry') : t('buttons.addingEntry')}
                            </>
                          ) : (
                            <>
                              <Icon name='check' className='w-4 h-4 mr-2' />
                              {editingEntry ? t('buttons.updateEntry') : t('buttons.addEntry')}
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </FadeIn>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className='max-w-6xl mx-auto px-6 lg:px-8 py-12'>
          {entries.length === 0 ? (
            <FadeIn duration={0.5} delay={0.8}>
              <Card className='p-12 text-center'>
                <div className='w-16 h-16 bg-primary/10 rounded-full mx-auto mb-6 flex items-center justify-center'>
                  <Icon name='file-text' className='w-8 h-8 text-primary' />
                </div>
                <h3 className='text-2xl font-bold mb-4'>
                  {t('emptyState.title')}
                </h3>
                <p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>
                  {t('emptyState.description')}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Icon name='plus' className='w-4 h-4 mr-2' />
                  {t('buttons.startCreating')}
                </Button>
              </Card>
            </FadeIn>
          ) : (
            <div className='space-y-8'>
              {/* Progress Overview */}
              <FadeIn duration={0.5} delay={0.8}>
                <Card className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-xl font-semibold'>{t('progress.title')}</h3>
                    <span className='text-2xl font-bold text-primary'>
                      {completionPercentage}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-3 mb-4'>
                    <div
                      className='bg-primary h-3 rounded-full transition-all duration-300'
                      style={{ width: `${completionPercentage}}%` }}
                    />
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {completionPercentage === 100
                      ? t('progress.complete')
                      : t('progress.incomplete', { remaining: entries.filter(e => !e.is_completed).length })}
                  </p>
                </Card>
              </FadeIn>

              {/* Entries by Category */}
              {getEntryTypes(t).map((typeConfig, typeIndex) => {
                const typeEntries = entriesByType[typeConfig.value] || [];
                if (typeEntries.length === 0) return null;

                return (
                  <FadeIn
                    key={typeConfig.value}
                    duration={0.5}
                    delay={1.0 + typeIndex * 0.1}
                  >
                    <Card className='p-6'>
                      <div className='flex items-center gap-3 mb-6'>
                        <div
                          className={`w-10 h-10 bg-${typeConfig.color}-100 rounded-lg flex items-center justify-center`}
                        >
                          <Icon
                            name={typeConfig.icon as any}
                            className={`w-5 h-5 text-${typeConfig.color}-600`}
                          />
                        </div>
                        <div>
                          <h3 className='text-lg font-semibold'>
                            {typeConfig.label}
                          </h3>
                          <p className='text-sm text-muted-foreground'>
                            {typeConfig.description}
                          </p>
                        </div>
                        <Badge variant='secondary' className='ml-auto'>
                          {t('entries.completeStatus', {
                            completed: typeEntries.filter(e => e.is_completed).length,
                            total: typeEntries.length
                          })}
                        </Badge>
                      </div>

                      <div className='space-y-4'>
                        {typeEntries.map(entry => (
                          <div
                            key={entry.id}
                            className='border border-border rounded-lg p-4'
                          >
                            <div className='flex items-start justify-between mb-3'>
                              <div className='flex items-start gap-3'>
                                <Checkbox
                                  checked={entry.is_completed}
                                  onCheckedChange={() =>
                                    toggleCompletion(entry)
                                  }
                                />
                                <div className='flex-1'>
                                  <h4
                                    className={`font-medium ${entry.is_completed ? 'line-through text-muted-foreground' : ''}`}
                                  >
                                    {entry.title}
                                  </h4>
                                  {entry.tags.length > 0 && (
                                    <div className='flex gap-1 mt-1'>
                                      {entry.tags.map(tag => (
                                        <Badge
                                          key={tag}
                                          variant='outline'
                                          className='text-xs'
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className='flex gap-2'>
                                <Button
                                  size='sm'
                                  variant='outline'
                                  onClick={() => handleEdit(entry)}
                                >
                                  <Icon name='pencil' className='w-4 h-4' />
                                </Button>
                              </div>
                            </div>
                            <div
                              className={`text-sm leading-relaxed pl-7 ${entry.is_completed ? 'text-muted-foreground' : ''}`}
                            >
                              <pre className='whitespace-pre-wrap font-sans'>
                                {entry.content}
                              </pre>
                            </div>
                            {entry.is_auto_generated && (
                              <div className='pl-7 mt-2'>
                                <Badge variant='secondary' className='text-xs'>
                                  <Icon
                                    name='sparkles'
                                    className='w-3 h-3 mr-1'
                                  />
                                  {t('entries.autoGenerated')}
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </FadeIn>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
