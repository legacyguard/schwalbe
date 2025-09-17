
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/motion/FadeIn';

interface Scene3KeyProps {
  initialTrustedName?: string;
  onBack: () => void;
  onNext: (trustedName: string) => void;
  onSkip?: () => void;
}

export default function Scene3Key({
  initialTrustedName = '',
  onBack,
  onNext,
  onSkip,
}: Scene3KeyProps) {
  const [name, setName] = useState(initialTrustedName);
  const [isEngraving, setIsEngraving] = useState(false);

  useEffect(() => setName(initialTrustedName), [initialTrustedName]);

  useEffect(() => {
    if (name.trim()) {
      setIsEngraving(true);
      const timer = setTimeout(() => setIsEngraving(false), 800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [name]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative'>
      {/* Skip button in top right corner */}
      {onSkip && (
        <motion.button
          onClick={onSkip}
          className='absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-border/50 hover:border-border'
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          Skip introduction
        </motion.button>
      )}

      <FadeIn duration={0.8}>
        <Card className='w-full max-w-3xl border-primary/20 shadow-xl'>
          <CardHeader>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <CardTitle className='text-2xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                The Key of Trust
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <p className='text-muted-foreground mb-6 text-lg leading-relaxed'>
                Who is the one person you would entrust with the key to this
                box? Enter only the name of someone you trust completely.
              </p>
              <p className='text-sm text-muted-foreground/80 mb-6 italic'>
                🔐 Choose someone who knows your heart and will honor your
                wishes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder='e.g., Martina, John, Mom, Sarah...'
                className='mb-6 text-base h-12 border-primary/20 focus:border-primary/50 bg-background/50'
              />
            </motion.div>

            {/* Enhanced key engraving visualization */}
            <motion.div
              className='relative h-44 mb-6 rounded-lg border-2 border-primary/30 bg-gradient-to-br from-amber-50/20 to-amber-100/10 dark:from-amber-900/10 dark:to-amber-800/5 overflow-hidden'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              {/* Key background glow */}
              <div className='absolute inset-0 bg-gradient-radial from-yellow-200/20 via-transparent to-transparent' />

              {/* Ornate key illustration */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <motion.div
                  className='relative'
                  animate={{ rotateY: isEngraving ? [0, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Key shaft */}
                  <div className='w-32 h-4 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-full shadow-lg relative'>
                    {/* Key teeth */}
                    <div className='absolute right-0 top-0 w-6 h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-r-full'>
                      <div className='absolute right-1 top-1 w-1 h-2 bg-yellow-600 rounded'></div>
                      <div className='absolute right-1 bottom-1 w-1 h-1 bg-yellow-600 rounded'></div>
                    </div>

                    {/* Key head */}
                    <div className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full shadow-lg border-2 border-yellow-400'>
                      {/* Inner circle */}
                      <div className='absolute inset-2 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full'></div>
                    </div>

                    {/* Engraving area */}
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <AnimatePresence mode='wait'>
                        {name.trim() ? (
                          <motion.div
                            key={name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className='text-yellow-900 dark:text-yellow-100 font-serif text-sm font-bold tracking-wider text-center'
                          >
                            {isEngraving && (
                              <motion.div
                                className='absolute inset-0 bg-yellow-200/50 rounded'
                                animate={{ opacity: [0, 0.8, 0] }}
                                transition={{ duration: 0.8, repeat: 1 }}
                              />
                            )}
                            For {name}
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className='text-yellow-700/60 dark:text-yellow-300/60 font-serif text-sm italic'
                          >
                            For ___
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Key sparkle effects */}
                  <AnimatePresence>
                    {name.trim() && (
                      <>
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className='absolute w-1 h-1 bg-yellow-300 rounded-full'
                            style={{
                              left: `${20 + Math.random() * 60}}%`,
                              top: `${20 + Math.random() * 60}%`,
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: Math.random() * 2,
                            }}
                          />
                        ))}
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Engraving effect overlay */}
              <AnimatePresence>
                {isEngraving && (
                  <motion.div
                    className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent'
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  />
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              className='flex gap-3 justify-between'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <Button
                variant='outline'
                onClick={onBack}
                className='border-primary/20 hover:border-primary/40'
              >
                ← Back
              </Button>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  onClick={() => setName('')}
                  className='border-muted hover:border-muted-foreground/40'
                >
                  Clear
                </Button>
                <Button
                  onClick={() => onNext(name)}
                  disabled={!name.trim()}
                  className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300'
                >
                  Continue →
                </Button>
              </div>
            </motion.div>

            {/* Validation message */}
            <motion.div
              className='mt-4 text-center'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <p className='text-xs text-muted-foreground/70'>
                {name.trim()
                  ? `Key will be engraved for ${name}`
                  : 'Enter a name to engrave the key'}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
