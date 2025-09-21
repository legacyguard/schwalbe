
/**
 * Import Celebration Component
 * Celebrates successful document imports with family protection messaging
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Clock,
  Heart,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { BulkImportResult } from '@/types/gmail';

interface ImportCelebrationProps {
  className?: string;
  onContinue: () => void;
  result: BulkImportResult;
}

/**
 * ImportCelebration Component
 * Celebrates successful document imports with family protection messaging
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const ImportCelebration = React.memo(function ImportCelebration({
  result,
  onContinue,
  className,
}: ImportCelebrationProps) {
  const { documents, timeSaved, protectionIncrease } = result;

  // Generate celebration message based on import results
  const getCelebrationMessage = () => {
    const docCount = documents.length;
    if (docCount >= 10) {
      return "Outstanding! Your family's protection fortress just got significantly stronger.";
    } else if (docCount >= 5) {
      return "Excellent work! Your family's safety net is expanding beautifully.";
    } else if (docCount >= 3) {
      return 'Great progress! Every document brings more peace of mind to your family.';
    } else {
      return "Well done! You've taken another important step in protecting your family.";
    }
  };

  // Generate family impact statement
  const getFamilyImpactStatement = () => {
    const docCount = documents.length;
    const familyMembers = 3; // Would come from user data

    if (docCount >= 5) {
      return `${familyMembers} family members can now access ${docCount} more critical documents when they need them most.`;
    } else {
      return `Your family now has secure access to ${docCount} additional important document${docCount !== 1 ? 's' : ''}.`;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className={cn('max-w-2xl mx-auto', className)}
      variants={containerVariants}
      initial='hidden'
      animate='visible'
    >
      <Card className='relative overflow-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 border-green-200'>
        {/* Background decorations */}
        <div className='absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-full -translate-y-16 translate-x-16 opacity-40' />
        <div className='absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-40' />

        {/* Floating sparkles */}
        <div className='absolute top-6 left-6'>
          <motion.div
            animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className='h-6 w-6 text-yellow-500' />
          </motion.div>
        </div>

        <div className='absolute top-8 right-8'>
          <motion.div
            animate={{ rotate: [360, 0], scale: [1, 1.3, 1] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
          >
            <Sparkles className='h-4 w-4 text-blue-500' />
          </motion.div>
        </div>

        <CardContent className='p-8 relative z-10'>
          <motion.div className='text-center space-y-6' variants={itemVariants}>
            {/* Success Icon */}
            <motion.div
              className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Shield className='h-10 w-10 text-green-600' />
            </motion.div>

            {/* Main celebration message */}
            <div>
              <motion.h2
                className='text-2xl font-bold text-green-900 mb-3'
                variants={itemVariants}
              >
                🎉 Documents Successfully Protected!
              </motion.h2>
              <motion.p
                className='text-green-800 text-lg'
                variants={itemVariants}
              >
                {getCelebrationMessage()}
              </motion.p>
            </div>

            {/* Impact metrics */}
            <motion.div
              className='grid grid-cols-3 gap-4'
              variants={itemVariants}
            >
              <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center'>
                <div className='text-2xl font-bold text-blue-600 mb-1'>
                  {documents.length}
                </div>
                <div className='text-xs text-muted-foreground'>Documents</div>
                <div className='text-xs text-muted-foreground'>Protected</div>
              </div>
              <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center'>
                <div className='text-2xl font-bold text-purple-600 mb-1'>
                  {timeSaved}min
                </div>
                <div className='text-xs text-muted-foreground'>Time</div>
                <div className='text-xs text-muted-foreground'>Saved</div>
              </div>
              <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 text-center'>
                <div className='text-2xl font-bold text-green-600 mb-1'>
                  +{protectionIncrease}%
                </div>
                <div className='text-xs text-muted-foreground'>Family</div>
                <div className='text-xs text-muted-foreground'>Protection</div>
              </div>
            </motion.div>

            {/* Family impact statement */}
            <motion.div
              className='bg-white/40 backdrop-blur-sm rounded-xl p-4 border border-white/20'
              variants={itemVariants}
            >
              <div className='flex items-start gap-3'>
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1'>
                  <Heart className='h-4 w-4 text-blue-600' />
                </div>
                <div className='flex-1 text-left'>
                  <h4 className='font-medium text-blue-900 mb-1'>
                    Family Impact
                  </h4>
                  <p className='text-sm text-blue-800'>
                    {getFamilyImpactStatement()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Achievement badges */}
            <motion.div
              className='flex flex-wrap justify-center gap-2'
              variants={itemVariants}
            >
              <Badge className='bg-yellow-100 text-yellow-800 border-yellow-200'>
                <Award className='h-3 w-3 mr-1' />
                Organizer
              </Badge>
              <Badge className='bg-blue-100 text-blue-800 border-blue-200'>
                <Shield className='h-3 w-3 mr-1' />
                Protector
              </Badge>
              <Badge className='bg-green-100 text-green-800 border-green-200'>
                <TrendingUp className='h-3 w-3 mr-1' />
                Progress Maker
              </Badge>
            </motion.div>

            {/* Next steps encouragement */}
            <motion.div
              className='bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4'
              variants={itemVariants}
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center'>
                  <Users className='h-4 w-4 text-purple-600' />
                </div>
                <div className='flex-1 text-left'>
                  <h4 className='font-medium text-purple-900'>What's Next?</h4>
                  <p className='text-sm text-purple-800'>
                    Consider sharing key documents with family members and
                    scheduling professional reviews for maximum protection.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action button */}
            <motion.div variants={itemVariants}>
              <Button
                onClick={onContinue}
                size='lg'
                className='bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all'
              >
                Continue Building Your Legacy
                <ArrowRight className='h-4 w-4 ml-2' />
              </Button>
            </motion.div>

            {/* Time saved celebration */}
            <motion.div
              className='flex items-center justify-center gap-2 text-sm text-muted-foreground'
              variants={itemVariants}
            >
              <Clock className='h-4 w-4' />
              <span>
                You just saved {timeSaved} minutes of manual organization work!
              </span>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Display name for debugging
ImportCelebration.displayName = 'ImportCelebration';
