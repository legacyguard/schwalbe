
import React from 'react';
import { MetaTags } from '@/components/common/MetaTags';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LegacyGuardLogo } from '@/components/LegacyGuardLogo';
import { Link } from 'react-router-dom';

interface LegalPageLayoutProps {
  children: React.ReactNode;
  description: string;
  title: string;
}

export const LegalPageLayout = ({
  children,
  title,
  description,
}: LegalPageLayoutProps) => {
  return (
    <div className='min-h-screen bg-background text-foreground font-sans'>
      <MetaTags title={title} description={description} />

      {/* Header */}
      <header className='sticky top-0 z-50 bg-content-background/90 backdrop-blur-lg border-b border-card-border'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <Link
              to='/'
              className='flex items-center gap-3 hover:opacity-80 transition-opacity'
            >
              <LegacyGuardLogo />
              <span className='text-2xl font-bold text-foreground font-heading'>
                LegacyGuard
              </span>
            </Link>
            <Link to='/'>
              <Button
                variant='ghost'
                className='text-muted-foreground hover:text-foreground'
              >
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className='container mx-auto px-4 py-12 max-w-4xl'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className='text-4xl lg:text-5xl font-bold text-foreground mb-4'>
            {title}
          </h1>
          <p className='text-xl text-muted-foreground mb-8'>
            Last updated:{' '}
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          {/* Legal content with consistent styling */}
          <div className='prose prose-lg max-w-none text-foreground prose-headings:text-primary prose-strong:text-foreground prose-p:text-foreground prose-li:text-foreground'>
            {children}
          </div>
        </motion.div>
      </main>
    </div>
  );
};
