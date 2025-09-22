/**
 * Family Collaboration Invitation Dialog
 * Component for inviting family members and setting their permissions
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  Shield,
  Users,
  Heart,
  FileText,
  CreditCard,
  Activity,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { collaborationService, type InvitationRequest } from '@/services/collaborationService';

const invitationSchema = z.object({
  name: z.string().min(2, 'Meno musí mať aspoň 2 znaky'),
  email: z.string().email('Neplatná emailová adresa'),
  phone: z.string().optional(),
  relationship: z.string().min(1, 'Vyberte vzťah'),
  message: z.string().optional(),
  permissions: z.object({
    can_access_documents: z.boolean(),
    can_emergency_activate: z.boolean(),
    can_manage_family: z.boolean(),
    can_view_finances: z.boolean(),
    can_make_medical_decisions: z.boolean(),
  }),
  emergency_priority: z.number().min(1).max(10),
  trust_level: z.number().min(1).max(5),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface InvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userId: string;
}

const relationshipOptions = [
  { value: 'spouse', label: 'Manžel/ka', icon: Heart },
  { value: 'child', label: 'Dieťa', icon: Users },
  { value: 'parent', label: 'Rodič', icon: Users },
  { value: 'sibling', label: 'Súrodenec', icon: Users },
  { value: 'guardian', label: 'Opatrovník', icon: Shield },
  { value: 'friend', label: 'Priateľ', icon: Users },
  { value: 'other', label: 'Iný', icon: Users },
];

const permissionConfig = [
  {
    key: 'can_access_documents' as const,
    label: 'Prístup k dokumentom',
    description: 'Môže prezerať a stiahnuť dôležité dokumenty',
    icon: FileText,
    color: 'text-blue-600',
    riskLevel: 'medium',
  },
  {
    key: 'can_emergency_activate' as const,
    label: 'Núdzová aktivácia',
    description: 'Môže aktivovať núdzové protokoly a pristupovať k kritickým informáciám',
    icon: AlertCircle,
    color: 'text-red-600',
    riskLevel: 'high',
  },
  {
    key: 'can_manage_family' as const,
    label: 'Správa rodiny',
    description: 'Môže pridávať a upravovať údaje členov rodiny',
    icon: Users,
    color: 'text-green-600',
    riskLevel: 'medium',
  },
  {
    key: 'can_view_finances' as const,
    label: 'Finančné údaje',
    description: 'Môže prezerať finančné dokumenty a informácie',
    icon: CreditCard,
    color: 'text-purple-600',
    riskLevel: 'high',
  },
  {
    key: 'can_make_medical_decisions' as const,
    label: 'Zdravotné rozhodnutia',
    description: 'Môže robiť rozhodnutia o zdravotnej starostlivosti',
    icon: Activity,
    color: 'text-orange-600',
    riskLevel: 'high',
  },
];

export function InvitationDialog({
  open,
  onOpenChange,
  onSuccess,
  userId,
}: InvitationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      relationship: '',
      message: '',
      permissions: {
        can_access_documents: false,
        can_emergency_activate: false,
        can_manage_family: false,
        can_view_finances: false,
        can_make_medical_decisions: false,
      },
      emergency_priority: 5,
      trust_level: 3,
    },
  });

  const watchedPermissions = form.watch('permissions');
  const watchedRelationship = form.watch('relationship');

  // Auto-set permissions based on relationship
  const handleRelationshipChange = (relationship: string) => {
    let suggestedPermissions = {
      can_access_documents: false,
      can_emergency_activate: false,
      can_manage_family: false,
      can_view_finances: false,
      can_make_medical_decisions: false,
    };

    switch (relationship) {
      case 'spouse':
        suggestedPermissions = {
          can_access_documents: true,
          can_emergency_activate: true,
          can_manage_family: true,
          can_view_finances: true,
          can_make_medical_decisions: true,
        };
        form.setValue('emergency_priority', 1);
        form.setValue('trust_level', 5);
        break;
      case 'child':
        if (form.getValues('trust_level') >= 4) {
          suggestedPermissions = {
            can_access_documents: true,
            can_emergency_activate: true,
            can_manage_family: false,
            can_view_finances: true,
            can_make_medical_decisions: false,
          };
        }
        form.setValue('emergency_priority', 2);
        break;
      case 'parent':
        suggestedPermissions = {
          can_access_documents: true,
          can_emergency_activate: true,
          can_manage_family: true,
          can_view_finances: false,
          can_make_medical_decisions: true,
        };
        form.setValue('emergency_priority', 2);
        form.setValue('trust_level', 4);
        break;
      case 'guardian':
        suggestedPermissions = {
          can_access_documents: true,
          can_emergency_activate: true,
          can_manage_family: false,
          can_view_finances: false,
          can_make_medical_decisions: true,
        };
        form.setValue('emergency_priority', 3);
        form.setValue('trust_level', 4);
        break;
      case 'sibling':
      case 'friend':
        suggestedPermissions = {
          can_access_documents: false,
          can_emergency_activate: true,
          can_manage_family: false,
          can_view_finances: false,
          can_make_medical_decisions: false,
        };
        form.setValue('emergency_priority', 4);
        form.setValue('trust_level', 3);
        break;
    }

    form.setValue('permissions', suggestedPermissions);
  };

  const onSubmit = async (data: InvitationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const request: InvitationRequest = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        relationship: data.relationship,
        message: data.message,
        permissions: data.permissions,
        emergency_priority: data.emergency_priority,
        trust_level: data.trust_level,
      };

      await collaborationService.sendInvitation(userId, request);

      setSubmitSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
        form.reset();
        setSubmitSuccess(false);
      }, 2000);

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Nepodarilo sa odoslať pozvánku');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPermissionsCount = Object.values(watchedPermissions).filter(Boolean).length;
  const highRiskPermissions = permissionConfig.filter(
    p => p.riskLevel === 'high' && watchedPermissions[p.key]
  ).length;

  if (submitSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-md'>
          <div className='text-center py-6'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>Pozvánka odoslaná!</h3>
            <p className='text-muted-foreground'>
              Pozvánka bola úspešne odoslaná na {form.getValues('email')}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <UserPlus className='h-5 w-5' />
            Pozvať člena rodiny
          </DialogTitle>
          <DialogDescription>
            Pozrite člena rodiny do systému ochrany a nastavte mu oprávnenia
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className='text-sm flex items-center gap-2'>
                  <Users className='h-4 w-4' />
                  Základné údaje
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celé meno *</FormLabel>
                      <FormControl>
                        <Input placeholder='Zadajte celé meno' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Mail className='h-4 w-4' />
                          Email *
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='email@example.com'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2'>
                          <Phone className='h-4 w-4' />
                          Telefón
                        </FormLabel>
                        <FormControl>
                          <Input
                            type='tel'
                            placeholder='+421 900 000 000'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name='relationship'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vzťah *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleRelationshipChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Vyberte vzťah' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {relationshipOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className='flex items-center gap-2'>
                                  <Icon className='h-4 w-4' />
                                  {option.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='message'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Osobná správa (voliteľné)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Napíšte osobnú správu, ktorá sa pošle s pozvánkou...'
                          className='resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Táto správa sa pošle spolu s pozvánkou
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-sm flex items-center gap-2'>
                    <Shield className='h-4 w-4' />
                    Oprávnenia
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Badge variant='outline'>
                      {selectedPermissionsCount} vybraných
                    </Badge>
                    {highRiskPermissions > 0 && (
                      <Badge variant='destructive'>
                        {highRiskPermissions} vysoké riziko
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {permissionConfig.map((permission) => {
                  const Icon = permission.icon;
                  return (
                    <FormField
                      key={permission.key}
                      control={form.control}
                      name={`permissions.${permission.key}`}
                      render={({ field }) => (
                        <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className='space-y-1 leading-none flex-1'>
                            <div className='flex items-center gap-2'>
                              <Icon className={`h-4 w-4 ${permission.color}`} />
                              <FormLabel className='text-sm font-medium'>
                                {permission.label}
                              </FormLabel>
                              {permission.riskLevel === 'high' && (
                                <Badge variant='destructive' className='text-xs'>
                                  Vysoké riziko
                                </Badge>
                              )}
                            </div>
                            <FormDescription className='text-xs'>
                              {permission.description}
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  );
                })}
              </CardContent>
            </Card>

            {/* Priority and Trust */}
            {watchedRelationship && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>Nastavenia priority</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <FormField
                      control={form.control}
                      name='emergency_priority'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Núdzová priorita (1-10)</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              max={10}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription className='text-xs'>
                            1 = najvyššia priorita v núdzových situáciách
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='trust_level'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Úroveň dôvery (1-5)</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={1}
                              max={5}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription className='text-xs'>
                            5 = najvyššia úroveň dôvery
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Warning */}
            {highRiskPermissions > 0 && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>
                  Pozor: Vybrali ste {highRiskPermissions} oprávnení s vysokým rizikom.
                  Uistite sa, že tejto osobe dôverujete a že má prístup len k potrebným informáciám.
                </AlertDescription>
              </Alert>
            )}

            {submitError && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <Separator />

            {/* Actions */}
            <div className='flex justify-end space-x-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Zrušiť
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Odosielam...
                  </>
                ) : (
                  <>
                    <Mail className='mr-2 h-4 w-4' />
                    Odoslať pozvánku
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}