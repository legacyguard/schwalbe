
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Guardian } from '@/types/guardian';
import type { RecipientOption } from '@/types/timeCapsule';

interface RecipientStepProps {
  guardians: Guardian[];
  onRecipientChange: (recipient: null | RecipientOption) => void;
  selectedRecipient: null | RecipientOption;
}

export function RecipientStep({
  guardians,
  selectedRecipient,
  onRecipientChange,
}: RecipientStepProps) {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customRecipient, setCustomRecipient] = useState({
    name: '',
    email: '',
  });

  // Convert guardians to recipient options
  const guardianOptions: RecipientOption[] = guardians.map(guardian => ({
    id: guardian.id,
    name: guardian.name,
    email: guardian.email,
    relationship: guardian.relationship || undefined,
    isGuardian: true,
  }));

  const handleGuardianSelect = (guardian: Guardian) => {
    const recipient: RecipientOption = {
      id: guardian.id,
      name: guardian.name,
      email: guardian.email,
      relationship: guardian.relationship || undefined,
      isGuardian: true,
    };
    onRecipientChange(recipient);
    setShowCustomForm(false);
  };

  const handleCustomRecipientSave = () => {
    if (!customRecipient.name.trim() || !customRecipient.email.trim()) {
      return;
    }

    const recipient: RecipientOption = {
      name: customRecipient.name.trim(),
      email: customRecipient.email.trim(),
      isGuardian: false,
    };

    onRecipientChange(recipient);
    setShowCustomForm(false);
    setCustomRecipient({ name: '', email: '' });
  };

  const handleCustomRecipientCancel = () => {
    setShowCustomForm(false);
    setCustomRecipient({ name: '', email: '' });
    if (!selectedRecipient?.isGuardian) {
      onRecipientChange(null);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <p className='text-muted-foreground'>
          Choose who will receive this Time Capsule. You can select from your
          existing guardians or add someone new.
        </p>
      </div>

      {/* Selected Recipient Display */}
      {selectedRecipient && (
        <Card className='border-green-200 bg-green-50'>
          <CardContent className='flex items-center justify-between p-4'>
            <div className='flex items-center space-x-3'>
              <Avatar>
                <AvatarFallback className='bg-green-100 text-green-700'>
                  {getInitials(selectedRecipient.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className='flex items-center gap-2'>
                  <span className='font-medium'>{selectedRecipient.name}</span>
                  {selectedRecipient.isGuardian && (
                    <Badge variant='secondary' className='text-xs'>
                      <Icon name="shield" className='w-3 h-3 mr-1' />
                      Guardian
                    </Badge>
                  )}
                </div>
                <div className='text-sm text-muted-foreground flex items-center gap-2'>
                  <Icon name="mail" className='w-3 h-3' />
                  {selectedRecipient.email}
                  {selectedRecipient.relationship && (
                    <>
                      <span>•</span>
                      <span>{selectedRecipient.relationship}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                onRecipientChange(null);
                setShowCustomForm(false);
              }}
            >
              <Icon name="x" className='w-4 h-4' />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Guardian Selection */}
      {!selectedRecipient && guardianOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Icon name="shield" className='w-5 h-5 text-primary' />
              Choose from Your Guardians
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='grid gap-3'>
              {guardianOptions.map(guardian => (
                <button
                  key={guardian.id}
                  onClick={() =>
                    handleGuardianSelect(
                      guardians.find(g => g.id === guardian.id)!
                    )
                  }
                  className='flex items-center space-x-3 p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left w-full'
                >
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(guardian.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='font-medium'>{guardian.name}</div>
                    <div className='text-sm text-muted-foreground flex items-center gap-2'>
                      <Icon name="mail" className='w-3 h-3' />
                      {guardian.email}
                      {guardian.relationship && (
                        <>
                          <span>•</span>
                          <span className='capitalize'>
                            {guardian.relationship}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Icon
                    name="chevron-right"
                    className='w-4 h-4 text-muted-foreground'
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Someone New */}
      {!selectedRecipient && !showCustomForm && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Icon
                name="user-plus"
                className='w-5 h-5 text-primary'
              />
              Add Someone New
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-muted-foreground mb-4'>
              Want to send a Time Capsule to someone who isn't in your Guardian
              Network? Add their details below.
            </p>
            <Button
              variant='outline'
              onClick={() => setShowCustomForm(true)}
              className='w-full'
            >
              <Icon name="plus" className='w-4 h-4 mr-2' />
              Add New Recipient
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Custom Recipient Form */}
      {showCustomForm && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg flex items-center gap-2'>
              <Icon
                name="user-plus"
                className='w-5 h-5 text-primary'
              />
              New Recipient Details
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <Label htmlFor='recipientName'>Full Name *</Label>
              <Input
                id='recipientName'
                value={customRecipient.name}
                onChange={e =>
                  setCustomRecipient(prev => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder='e.g., Sarah Johnson'
                className='mt-1'
              />
            </div>

            <div>
              <Label htmlFor='recipientEmail'>Email Address *</Label>
              <Input
                id='recipientEmail'
                type='email'
                value={customRecipient.email}
                onChange={e =>
                  setCustomRecipient(prev => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder='e.g., sarah@example.com'
                className='mt-1'
              />
              <p className='text-xs text-muted-foreground mt-1'>
                This email will be used to notify them when the Time Capsule is
                delivered.
              </p>
            </div>

            <div className='flex gap-2 pt-2'>
              <Button
                onClick={handleCustomRecipientSave}
                disabled={
                  !customRecipient.name.trim() || !customRecipient.email.trim()
                }
                className='flex-1'
              >
                <Icon name="check" className='w-4 h-4 mr-2' />
                Save Recipient
              </Button>
              <Button variant='outline' onClick={handleCustomRecipientCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {!selectedRecipient && (
        <div className='text-center text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg'>
          <Icon name="info" className='w-4 h-4 inline mr-2' />
          Your Time Capsule recipient will receive an email notification when
          it's time for delivery. Make sure their email address is current and
          accessible.
        </div>
      )}
    </div>
  );
}
