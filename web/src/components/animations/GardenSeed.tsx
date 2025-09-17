
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';

interface GardenSeedProps {
  className?: string;
  onSeedClick?: () => void;
  progress?: number; // 0-100 percentage of completion
  showPulse?: boolean;
  size?: 'large' | 'medium' | 'small';
}

export const GardenSeed: React.FC<GardenSeedProps> = ({
  progress = 0,
  size = 'medium',
  showPulse = true,
  onSeedClick,
  className = '',
}) => {
  const { userId: _userId } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ delay: number; id: number; x: number; y: number }>
  >([]);

  // Generate floating particles based on progress
  useEffect(() => {
    if (progress > 0) {
      const particleCount = Math.min(Math.floor(progress / 10), 8);
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        delay: Math.random() * 2,
      }));
      setParticles(newParticles);
    }
  }, [progress]);

  // Size configuration
  const sizeConfig = {
    small: {
      container: 'w-16 h-16',
      seed: 'w-4 h-4',
      glow: '0 0 8px',
      text: 'text-xs',
    },
    medium: {
      container: 'w-24 h-24',
      seed: 'w-6 h-6',
      glow: '0 0 12px',
      text: 'text-sm',
    },
    large: {
      container: 'w-32 h-32',
      seed: 'w-8 h-8',
      glow: '0 0 16px',
      text: 'text-base',
    },
  };

  const config = sizeConfig[size];

  // Determine seed state based on progress
  const getSeedState = () => {
    if (progress === 0) return 'dormant';
    if (progress < 25) return 'sprouting';
    if (progress < 50) return 'growing';
    if (progress < 75) return 'flourishing';
    return 'blooming';
  };

  const seedState = getSeedState();

  // Color transitions based on progress
  const getColors = () => {
    switch (seedState) {
      case 'dormant':
        return {
          seed: 'from-stone-400 to-stone-600',
          glow: 'rgba(168, 162, 158, 0.3)',
          particles: 'rgba(168, 162, 158, 0.5)',
        };
      case 'sprouting':
        return {
          seed: 'from-amber-300 to-amber-500',
          glow: 'rgba(251, 191, 36, 0.4)',
          particles: 'rgba(251, 191, 36, 0.6)',
        };
      case 'growing':
        return {
          seed: 'from-lime-300 to-lime-500',
          glow: 'rgba(132, 204, 22, 0.4)',
          particles: 'rgba(132, 204, 22, 0.6)',
        };
      case 'flourishing':
        return {
          seed: 'from-emerald-300 to-emerald-500',
          glow: 'rgba(16, 185, 129, 0.4)',
          particles: 'rgba(16, 185, 129, 0.6)',
        };
      case 'blooming':
        return {
          seed: 'from-violet-300 to-violet-500',
          glow: 'rgba(139, 92, 246, 0.5)',
          particles: 'rgba(139, 92, 246, 0.7)',
        };
      default:
        return {
          seed: 'from-stone-400 to-stone-600',
          glow: 'rgba(168, 162, 158, 0.3)',
          particles: 'rgba(168, 162, 158, 0.5)',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`relative flex items-center justify-center ${config.container} ${className}`}
    >
      {/* Background glow */}
      <motion.div
        className='absolute inset-0 rounded-full'
        animate={{
          boxShadow: showPulse
            ? [
                `${config.glow}} ${colors.glow}`,
                `${config.glow.replace(/\d+px/g, m => `${parseInt(m) * 1.5}px`)} ${colors.glow}`,
                `${config.glow} ${colors.glow}`,
              ]
            : `${config.glow} ${colors.glow}`,
        }}
        transition={{
          duration: seedState === 'dormant' ? 4 : 2,
          repeat: showPulse ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      {/* Main seed */}
      <motion.div
        className={`relative ${config.seed} rounded-full bg-gradient-to-br ${colors.seed} shadow-lg cursor-pointer`}
        animate={{
          scale: isHovered ? 1.1 : 1,
          rotate: progress > 0 ? [0, 5, -5, 0] : 0,
        }}
        transition={{
          scale: { duration: 0.2 },
          rotate: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onSeedClick}
      >
        {/* Inner seed details based on state */}
        <AnimatePresence>
          {seedState !== 'dormant' && (
            <motion.div
              className='absolute inset-1 rounded-full opacity-60'
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Sprouting indicator */}
              {(seedState === 'sprouting' || seedState === 'growing') && (
                <div className='absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0.5 h-2 bg-green-400 rounded-full' />
              )}

              {/* Growth rings for flourishing state */}
              {seedState === 'flourishing' && (
                <>
                  <div className='absolute inset-0 rounded-full border border-emerald-300/50' />
                  <div className='absolute inset-1 rounded-full border border-emerald-400/30' />
                </>
              )}

              {/* Blooming petals */}
              {seedState === 'blooming' && (
                <>
                  {[0, 60, 120, 180, 240, 300].map((rotation, index) => (
                    <motion.div
                      key={index}
                      className='absolute top-1/2 left-1/2 w-1 h-3 bg-gradient-to-t from-violet-400 to-pink-300 rounded-full origin-bottom'
                      style={{
                        transform: `translate(-50%, -100%) rotate(${rotation}}deg)`,
                      }}
                      animate={{ scale: [0.8, 1, 0.8], opacity: [0.6, 1, 0.6] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Progress particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className='absolute w-1 h-1 rounded-full'
            style={{
              backgroundColor: colors.particles,
              left: '50%',
              top: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: particle.x,
              y: particle.y,
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Progress tooltip on hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded-lg whitespace-nowrap ${config.text}`}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {progress === 0
              ? 'Plant your first seed'
              : `Garden progress: ${Math.round(progress)}%`}
            <div className='absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/80' />
          </motion.div>
        )}
      </AnimatePresence>

      {/* State indicator text */}
      {seedState !== 'dormant' && (
        <motion.div
          className={`absolute -bottom-8 left-1/2 -translate-x-1/2 ${config.text} font-medium text-center`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <span className='capitalize text-gray-600 dark:text-gray-400'>
            {seedState}
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default GardenSeed;
