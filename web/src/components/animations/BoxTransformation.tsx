
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GardenSeed } from './GardenSeed';

interface BoxTransformationProps {
  duration?: number;
  isVisible: boolean;
  onComplete?: () => void;
  seedDestination?: { x: number; y: number }; // Target position for seed
}

export const BoxTransformation: React.FC<BoxTransformationProps> = ({
  isVisible,
  onComplete,
  seedDestination = { x: 0, y: 0 },
  duration = 3000,
}) => {
  const [stage, setStage] = useState<
    'box' | 'complete' | 'opening' | 'revealing' | 'transforming'
  >('box');
  const [showSeed, setShowSeed] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const stageTransitions = [
      { stage: 'opening', delay: 500 },
      { stage: 'revealing', delay: 1000 },
      { stage: 'transforming', delay: 1500 },
      { stage: 'complete', delay: 2500 },
    ];

    const timeouts = stageTransitions.map(({ stage, delay }) =>
      setTimeout(() => setStage(stage as 'box' | 'complete' | 'opening' | 'revealing' | 'transforming'), delay)
    );

    // Show seed during revealing stage
    setTimeout(() => setShowSeed(true), 1000);

    // Call onComplete callback
    setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isVisible, onComplete, duration]);

  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'>
      <div className='relative w-64 h-64'>
        {/* Box of Certainty */}
        <AnimatePresence>
          {stage !== 'complete' && (
            <motion.div
              className='absolute inset-0 flex items-center justify-center'
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotateY: stage === 'opening' ? 15 : 0,
              }}
              exit={{ scale: 0.3, opacity: 0, y: 20 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Box container */}
              <div className='relative w-32 h-32 perspective-1000'>
                {/* Box base */}
                <motion.div
                  className='absolute inset-0 bg-gradient-to-br from-amber-200 to-amber-400 rounded-lg shadow-2xl border border-amber-300'
                  animate={{
                    boxShadow: [
                      '0 10px 30px rgba(245, 158, 11, 0.3)',
                      '0 10px 40px rgba(245, 158, 11, 0.5)',
                      '0 10px 30px rgba(245, 158, 11, 0.3)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Box lid */}
                <motion.div
                  className='absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg border border-amber-400 origin-bottom'
                  animate={{
                    rotateX:
                      stage === 'opening' || stage === 'revealing' ? -120 : 0,
                    transformOrigin: 'bottom center',
                  }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Lid decorative elements */}
                  <div className='absolute inset-2 border-2 border-amber-200 rounded opacity-60' />
                  <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-2 bg-amber-600 rounded-full' />
                </motion.div>

                {/* Inner glow when opening */}
                <AnimatePresence>
                  {(stage === 'opening' || stage === 'revealing') && (
                    <motion.div
                      className='absolute inset-0 bg-gradient-radial from-yellow-200/80 via-yellow-300/40 to-transparent rounded-lg'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                    />
                  )}
                </AnimatePresence>

                {/* Light rays */}
                <AnimatePresence>
                  {stage === 'revealing' && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className='absolute top-1/2 left-1/2 w-1 bg-gradient-to-t from-yellow-400 to-transparent origin-bottom'
                          style={{
                            height: '200px',
                            transform: `translate(-50%, -50%) rotate(${i * 60}}deg)`,
                          }}
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={{ scaleY: 1, opacity: 0.8 }}
                          exit={{ scaleY: 0, opacity: 0 }}
                          transition={{
                            duration: 1,
                            delay: i * 0.1,
                            ease: 'easeOut',
                          }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>

                {/* Floating seed inside box */}
                <AnimatePresence>
                  {showSeed && stage === 'revealing' && (
                    <motion.div
                      className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      initial={{ scale: 0, y: 10, opacity: 0 }}
                      animate={{ scale: 1, y: [-5, 5, -5], opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{
                        scale: { duration: 0.8, ease: 'easeOut' },
                        y: {
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        },
                        opacity: { duration: 0.5 },
                      }}
                    >
                      <GardenSeed size='small' progress={10} showPulse={true} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transforming seed that moves to destination */}
        <AnimatePresence>
          {stage === 'transforming' && (
            <motion.div
              className='absolute top-1/2 left-1/2'
              initial={{
                x: -12, // Half width of small seed
                y: -12, // Half height of small seed
                scale: 0.8,
              }}
              animate={{
                x: seedDestination.x - 12,
                y: seedDestination.y - 12,
                scale: 1,
              }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            >
              <GardenSeed size='small' progress={15} showPulse={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completion particles */}
        <AnimatePresence>
          {stage === 'transforming' && (
            <>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className='absolute w-2 h-2 bg-yellow-300 rounded-full'
                  style={{ top: '50%', left: '50%' }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / 12) * 150,
                    y: Math.sin((i * Math.PI * 2) / 12) * 150,
                    opacity: 0,
                    scale: [0, 1, 0],
                  }}
                  transition={{ duration: 2, ease: 'easeOut', delay: i * 0.05 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Transformation text */}
        <AnimatePresence>
          {stage === 'transforming' && (
            <motion.div
              className='absolute -bottom-16 left-1/2 -translate-x-1/2 text-center'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8 }}
            >
              <p className='text-white font-medium text-lg'>
                Your garden is taking root...
              </p>
              <p className='text-white/80 text-sm mt-1'>
                Watch it grow with every step you take
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BoxTransformation;
