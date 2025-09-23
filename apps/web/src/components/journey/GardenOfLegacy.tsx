/**
 * Garden of Legacy Visualization Component
 * Premium liquid glass design with progressive growth animation
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SofiaFirefly } from '../sofia/SofiaFirefly';

interface Milestone {
  id: string;
  title: string;
  type: 'seed' | 'sprout' | 'leaf' | 'flower' | 'fruit' | 'guardian' | 'root';
  completed: boolean;
  description: string;
  position: { x: number; y: number };
  delay?: number;
}

interface GardenOfLegacyProps {
  milestones: Milestone[];
  protectionScore: number;
  className?: string;
  onMilestoneClick?: (milestone: Milestone) => void;
  showSofia?: boolean;
  animated?: boolean;
}

export function GardenOfLegacy({
  milestones,
  protectionScore,
  className = '',
  onMilestoneClick,
  showSofia = true,
  animated = true
}: GardenOfLegacyProps) {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const completed = milestones.filter(m => m.completed).length;
    setCompletedCount(completed);
  }, [milestones]);

  // Calculate garden maturity level
  const maturityLevel = Math.min(Math.floor(protectionScore / 20), 5);

  // Background gradient based on maturity
  const getBackgroundGradient = () => {
    const gradients = [
      'from-slate-900 via-slate-800 to-indigo-900', // Night (0-20%)
      'from-slate-800 via-indigo-900 to-purple-900', // Early dawn (20-40%)
      'from-indigo-900 via-purple-800 to-blue-800', // Dawn (40-60%)
      'from-purple-800 via-blue-700 to-emerald-800', // Morning (60-80%)
      'from-blue-700 via-emerald-700 to-green-700', // Day (80-100%)
      'from-emerald-600 via-green-600 to-teal-600', // Full bloom (100%)
    ];
    return gradients[maturityLevel] || gradients[0];
  };

  // Milestone component renderers
  const renderMilestone = (milestone: Milestone, index: number) => {
    const isHovered = hoveredMilestone === milestone.id;

    const baseVariants = {
      hidden: { scale: 0, opacity: 0, rotate: -180 },
      visible: {
        scale: 1,
        opacity: 1,
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20,
          delay: animated ? (milestone.delay || index * 0.2) : 0
        }
      },
      hover: {
        scale: 1.2,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }
    };

    return (
      <motion.div
        key={milestone.id}
        variants={baseVariants}
        initial="hidden"
        animate={milestone.completed ? "visible" : "hidden"}
        whileHover="hover"
        className="absolute cursor-pointer group"
        style={{
          left: `${milestone.position.x}%`,
          top: `${milestone.position.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onMouseEnter={() => setHoveredMilestone(milestone.id)}
        onMouseLeave={() => setHoveredMilestone(null)}
        onClick={() => onMilestoneClick?.(milestone)}
      >
        {renderMilestoneElement(milestone, isHovered)}

        {/* Milestone tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
            >
              <div
                className="px-3 py-2 rounded-xl text-xs font-medium text-white whitespace-nowrap shadow-2xl"
                style={{
                  background: `
                    linear-gradient(135deg,
                      rgba(15, 23, 42, 0.95) 0%,
                      rgba(30, 41, 59, 0.9) 100%
                    )
                  `,
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="font-semibold">{milestone.title}</div>
                <div className="text-slate-300 text-xs">{milestone.description}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connecting roots/branches */}
        {milestone.completed && renderConnections(milestone, milestones)}
      </motion.div>
    );
  };

  const renderMilestoneElement = (milestone: Milestone, isHovered: boolean) => {
    const glassStyle = {
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
      `
    };

    switch (milestone.type) {
      case 'seed':
        return (
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              ...glassStyle
            }}
          />
        );

      case 'sprout':
        return (
          <div className="relative">
            <div
              className="w-6 h-8 rounded-t-full"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                ...glassStyle
              }}
            />
            <div
              className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #92400E 0%, #78350F 100%)',
                ...glassStyle
              }}
            />
          </div>
        );

      case 'leaf':
        return (
          <motion.div
            className="relative"
            animate={isHovered ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            <div
              className="w-8 h-12 rounded-t-full rounded-bl-full"
              style={{
                background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                ...glassStyle
              }}
            />
          </motion.div>
        );

      case 'flower':
        return (
          <motion.div
            className="relative"
            animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
          >
            {/* Petals */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-6 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
                  transform: `rotate(${i * 60}deg) translateY(-8px)`,
                  transformOrigin: 'center bottom',
                  ...glassStyle
                }}
              />
            ))}
            {/* Center */}
            <div
              className="w-3 h-3 rounded-full relative z-10"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                ...glassStyle
              }}
            />
          </motion.div>
        );

      case 'fruit':
        return (
          <div
            className="w-10 h-12 rounded-b-full"
            style={{
              background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
              ...glassStyle
            }}
          />
        );

      case 'guardian':
        return (
          <div className="relative">
            <div
              className="w-12 h-16 rounded-t-full"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)',
                ...glassStyle
              }}
            />
            <motion.div
              className="absolute -top-2 left-1/2 transform -translate-x-1/2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #A855F7 0%, transparent 70%)',
                  filter: 'blur(2px)'
                }}
              />
            </motion.div>
          </div>
        );

      case 'root':
        return (
          <div className="relative">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: 2,
                  height: 20 + i * 5,
                  background: 'linear-gradient(180deg, #92400E 0%, #451A03 100%)',
                  borderRadius: '0 0 4px 4px',
                  transform: `translateX(${(i - 1) * 8}px) translateY(4px)`,
                  ...glassStyle
                }}
                animate={{
                  scaleY: [1, 1.1, 1],
                  transition: { duration: 3, repeat: Infinity, delay: i * 0.5 }
                }}
              />
            ))}
          </div>
        );

      default:
        return <div className="w-4 h-4 rounded-full bg-slate-400" />;
    }
  };

  const renderConnections = (milestone: Milestone, allMilestones: Milestone[]) => {
    // Simple connection lines between related milestones
    return null; // Implement if needed
  };

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-3xl ${className}`}>
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient()}`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)
          `
        }}
      />

      {/* Stars/particles in background */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.4
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Ground/soil layer */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20"
        style={{
          background: `
            linear-gradient(180deg,
              transparent 0%,
              rgba(41, 37, 36, 0.4) 40%,
              rgba(41, 37, 36, 0.8) 100%
            )
          `,
          backdropFilter: 'blur(8px)'
        }}
      />

      {/* Milestones */}
      <div className="absolute inset-0">
        {milestones.map((milestone, index) => renderMilestone(milestone, index))}
      </div>

      {/* Sofia firefly */}
      {showSofia && (
        <SofiaFirefly
          size="md"
          position={{ x: 85, y: 25 }}
          message={completedCount > 0 ? `Beautiful! ${completedCount} milestones completed.` : "Welcome to your Garden of Legacy."}
          showDialog={completedCount > 0}
          className="z-20"
        />
      )}

      {/* Progress indicator */}
      <div className="absolute top-4 left-4 z-20">
        <div
          className="px-4 py-2 rounded-full text-sm font-medium text-white"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(15, 23, 42, 0.9) 0%,
                rgba(30, 41, 59, 0.8) 100%
              )
            `,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          Protection Score: {protectionScore}%
        </div>
      </div>

      {/* Maturity level indicator */}
      <div className="absolute top-4 right-4 z-20">
        <div
          className="px-3 py-1 rounded-full text-xs font-medium text-white"
          style={{
            background: `
              linear-gradient(135deg,
                rgba(15, 23, 42, 0.9) 0%,
                rgba(30, 41, 59, 0.8) 100%
              )
            `,
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {['Night', 'Dawn', 'Morning', 'Day', 'Bloom', 'Eternal'][maturityLevel]}
        </div>
      </div>
    </div>
  );
}

// Predefined milestone configurations for the Guardian's Journey
export const GuardianMilestones: Milestone[] = [
  {
    id: 'seed',
    title: 'Foundation Stone',
    type: 'seed',
    completed: false,
    description: 'First document uploaded',
    position: { x: 50, y: 85 }
  },
  {
    id: 'sprout',
    title: 'First Growth',
    type: 'sprout',
    completed: false,
    description: 'Guardian added',
    position: { x: 45, y: 70 },
    delay: 0.5
  },
  {
    id: 'leaf1',
    title: 'Protection Leaf',
    type: 'leaf',
    completed: false,
    description: 'Will wizard completed',
    position: { x: 40, y: 55 },
    delay: 1.0
  },
  {
    id: 'flower1',
    title: 'Trust Blossom',
    type: 'flower',
    completed: false,
    description: 'Family shield configured',
    position: { x: 55, y: 50 },
    delay: 1.5
  },
  {
    id: 'guardian1',
    title: 'Guardian Tree',
    type: 'guardian',
    completed: false,
    description: 'Emergency contacts set',
    position: { x: 35, y: 40 },
    delay: 2.0
  },
  {
    id: 'fruit1',
    title: 'Legacy Fruit',
    type: 'fruit',
    completed: false,
    description: 'Time capsule created',
    position: { x: 60, y: 35 },
    delay: 2.5
  },
  {
    id: 'root1',
    title: 'Deep Roots',
    type: 'root',
    completed: false,
    description: 'Annual reflection completed',
    position: { x: 45, y: 75 },
    delay: 3.0
  }
];