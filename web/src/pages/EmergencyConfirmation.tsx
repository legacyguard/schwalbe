
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon-library';
import { FadeIn } from '@/components/motion/FadeIn';

interface LocationState {
  activationType: string;
  response: 'confirmed' | 'rejected';
  userName: string;
}

/**
 * Confirmation page shown after guardian responds to emergency activation
 * URL: /emergency/confirmation
 */
export default function EmergencyConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as LocationState;

  React.useEffect(() => {
    if (!state) {
      // Redirect to home if accessed directly without state
      navigate('/');
    }
  }, [navigate, state]);

  if (!state) {
    return null;
  }

  const { response, userName, activationType } = state;
  const isConfirmed = response === 'confirmed';

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-4 flex items-center justify-center'>
      <FadeIn duration={0.8}>
        <Card className='p-8 max-w-lg text-center'>
          <div className='mb-6'>
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isConfirmed
                  ? 'bg-green-100 dark:bg-green-900/50'
                  : 'bg-amber-100 dark:bg-amber-900/50'
              }`}
            >
              <Icon
                name={isConfirmed ? 'check-circle' : 'x-circle'}
                className={`w-8 h-8 ${
                  isConfirmed ? 'text-green-600' : 'text-amber-600'
                }`}
              />
            </div>

            <h1 className='text-2xl font-bold mb-2'>
              {isConfirmed
                ? 'Emergency Activation Confirmed'
                : 'Emergency Activation Rejected'}
            </h1>

            <p className='text-muted-foreground mb-6'>
              {isConfirmed
                ? `The Family Shield for ${userName} has been successfully activated. Emergency protocols are now in effect.`
                : `You have rejected the emergency activation for ${userName}. The Family Shield remains in its current state.`}
            </p>
          </div>

          <div className='space-y-4 mb-6'>
            <div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <h3 className='font-medium mb-2'>What happens next?</h3>

              {isConfirmed ? (
                <ul className='text-sm text-muted-foreground space-y-2 text-left'>
                  <li className='flex items-start gap-2'>
                    <Icon
                      name={'check'}
                      className='w-4 h-4 mt-0.5 text-green-600'
                    />
                    <span>
                      Family members can now access emergency resources
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Icon
                      name={'check'}
                      className='w-4 h-4 mt-0.5 text-green-600'
                    />
                    <span>
                      Time capsules scheduled for emergency delivery are
                      available
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Icon
                      name={'check'}
                      className='w-4 h-4 mt-0.5 text-green-600'
                    />
                    <span>
                      Other guardians have been notified of the activation
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Icon
                      name={'check'}
                      className='w-4 h-4 mt-0.5 text-green-600'
                    />
                    <span>All access is logged and audited for security</span>
                  </li>
                </ul>
              ) : (
                <ul className='text-sm text-muted-foreground space-y-2 text-left'>
                  <li className='flex items-start gap-2'>
                    <Icon
                      name={'info'}
                      className='w-4 h-4 mt-0.5 text-amber-600'
                    />
                    <span>
                      The system will continue monitoring for emergency
                      conditions
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Icon
                      name={'info'}
                      className='w-4 h-4 mt-0.5 text-amber-600'
                    />
                    <span>
                      Other guardians may still respond to this activation
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <Icon
                      name={'info'}
                      className='w-4 h-4 mt-0.5 text-amber-600'
                    />
                    <span>Your response has been recorded and logged</span>
                  </li>
                </ul>
              )}
            </div>

            <div className='text-xs text-muted-foreground'>
              <p>
                <strong>Activation Type:</strong>{' '}
                {activationType.replace('_', ' ').toUpperCase()}
              </p>
              <p>
                <strong>Responded:</strong> {new Date().toLocaleString()}
              </p>
            </div>
          </div>

          <div className='flex gap-3 justify-center'>
            <Button onClick={() => navigate('/')} variant={'outline'}>
              Return Home
            </Button>

            {isConfirmed && (
              <Button
                onClick={() =>
                  navigate('/emergency/resources', {
                    state: { userName, activationType },
                  })
                }
                className='bg-green-600 hover:bg-green-700'
              >
                <Icon name={'shield'} className='w-4 h-4 mr-2' />
                View Emergency Resources
              </Button>
            )}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
