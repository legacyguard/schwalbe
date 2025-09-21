
import { DashboardLayout } from '@/components/DashboardLayout';
import { IntelligentDocumentUploader } from '@/components/features/IntelligentDocumentUploader';
import { IntelligentDocumentTester } from '@/components/features/IntelligentDocumentTester';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon-library';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const IntelligentOrganizer = () => {
  usePageTitle('Intelligent Document Organizer');
  const [mode, setMode] = useState<'live' | 'test'>('test');

  return (
    <DashboardLayout>
      <div className='container mx-auto py-6 space-y-8'>
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Intelligent Document Organizer
          </h1>
          <p className='text-muted-foreground max-w-2xl mx-auto'>
            Experience the future of document management. Our AI-powered system
            analyzes your documents, suggests categories, and extracts key
            information automatically.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className='flex justify-center'>
          <Card className='p-2 bg-card border-card-border'>
            <div className='flex gap-2'>
              <Button
                variant={mode === 'test' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setMode('test')}
                className='gap-2'
              >
                <Icon name="play" className='w-4 h-4' />
                Demo Mode
              </Button>
              <Button
                variant={mode === 'live' ? 'default' : 'ghost'}
                size='sm'
                onClick={() => setMode('live')}
                className='gap-2'
              >
                <Icon name="upload" className='w-4 h-4' />
                Live Upload
              </Button>
            </div>
          </Card>
        </div>

        {mode === 'test' ? (
          <IntelligentDocumentTester />
        ) : (
          <IntelligentDocumentUploader />
        )}

        {/* Status Information */}
        <div className='max-w-4xl mx-auto'>
          <Card className='p-4 bg-card border-card-border'>
            <div className='flex items-start gap-3'>
              <Icon
                name="info"
                className='w-5 h-5 text-primary flex-shrink-0 mt-0.5'
              />
              <div className='space-y-2'>
                <h4 className='font-medium'>Implementation Status</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Icon
                        name="check"
                        className='w-4 h-4 text-green-500'
                      />
                      <span>Document confirmation UI</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Icon
                        name="check"
                        className='w-4 h-4 text-green-500'
                      />
                      <span>Supabase Edge Function</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Icon
                        name="check"
                        className='w-4 h-4 text-green-500'
                      />
                      <span>Database schema updates</span>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Icon
                        name="alert-triangle"
                        className='w-4 h-4 text-yellow-500'
                      />
                      <span>API authentication setup needed</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Icon
                        name="alert-triangle"
                        className='w-4 h-4 text-yellow-500'
                      />
                      <span>Environment variables required</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Icon
                        name="clock"
                        className='w-4 h-4 text-blue-500'
                      />
                      <span>Integration testing in progress</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IntelligentOrganizer;
