
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/motion/FadeIn';
import { useTranslation } from 'react-i18next';

interface Scene1PromiseProps {
  onNext: () => void;
  onSkip?: () => void;
}

export default function Scene1Promise({ onNext, onSkip }: Scene1PromiseProps) {
  const { t } = useTranslation('ui/scene1-promise');

  const subtitle = useMemo(
    () => t('subtitle'),
    [t]
  );

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative'>
      {/* Skip button in top right corner */}
      {onSkip && (
        <motion.button
          onClick={onSkip}
          className='absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors z-10 bg-background/80 backdrop-blur px-3 py-1 rounded-full border border-border/50 hover:border-border'
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          {t('skipIntroduction')}
        </motion.button>
      )}

      <FadeIn duration={0.8}>
        <Card className='w-full max-w-2xl text-center border-primary/20 shadow-xl'>
          <CardHeader>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <CardTitle className='text-3xl font-heading bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
                {t('title')}
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent>
            <motion.p
              className='text-muted-foreground mb-8 text-lg leading-relaxed'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {subtitle}
            </motion.p>

            {/* Enhanced firefly animation scene */}
            <motion.div
              className='relative h-48 rounded-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-primary/30 mb-8 overflow-hidden'
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {/* Night sky background */}
              <div className='absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700' />

              {/* Stars */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className='absolute w-1 h-1 bg-white rounded-full opacity-60'
                  style={{
                    left: `${Math.random() * 100}}%`,
                    top: `${Math.random() * 60}%`,
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}

              {/* Firefly */}
              <motion.div
                className='absolute w-2 h-2 bg-yellow-300 rounded-full shadow-lg'
                style={{
                  boxShadow:
                    '0 0 10px #fde047, 0 0 20px #facc15, 0 0 30px #eab308',
                }}
                animate={{
                  x: [20, 280, 150, 200, 80, 20],
                  y: [100, 60, 120, 80, 140, 100],
                  opacity: [0.4, 1, 0.7, 1, 0.5, 0.4],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Firefly trail */}
              <motion.div
                className='absolute w-1 h-1 bg-yellow-200/50 rounded-full'
                animate={{
                  x: [15, 275, 145, 195, 75, 15],
                  y: [105, 65, 125, 85, 145, 105],
                  opacity: [0, 0.3, 0.2, 0.3, 0.1, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
              />

              {/* Gentle text overlay */}
              <div className='absolute inset-0 flex items-center justify-center'>
                <motion.p
                  className='text-white/70 text-sm font-medium tracking-wider'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                >
                  {t('storyBegins')}
                </motion.p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <Button
                size='lg'
                className='bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300'
                onClick={onNext}
              >
                {t('startWriting')}
              </Button>
              <p className='text-xs text-muted-foreground mt-3 opacity-70'>
                {t('footer')}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
