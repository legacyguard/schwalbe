
// Adaptive Legacy Tree - Advanced tree visualization with Sofia's personality adaptation
// A sophisticated tree that grows and changes based on user progress and personality mode

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePersonalityManager } from '@/components/sofia/SofiaContextProvider';
import { AnimationSystem } from '@/lib/animation-system';
import type { PersonalityMode } from '@/lib/sofia-types';
import { Heart, Leaf, Shield, Star, TreePine } from 'lucide-react';

interface TreeBranch {
  angle: number; // degrees from parent
  children: string[];
  documentCount: number; // documents represented by this branch
  hasFlowers: boolean;
  hasFruit: boolean;
  hasLeaves: boolean;
  id: string;
  length: number; // relative length
  level: number; // 0=trunk, 1=main branches, 2=sub-branches, 3=twigs
  milestoneType?: 'family' | 'foundation' | 'legacy' | 'protection';
  parentId?: string;
  thickness: number; // relative thickness
}

interface TreeLeaf {
  animate: boolean;
  branchId: string;
  color: string;
  id: string;
  milestone?: string;
  size: 'large' | 'medium' | 'small';
  type: 'flower' | 'fruit' | 'leaf';
  x: number;
  y: number;
}

interface AdaptiveLegacyTreeProps {
  className?: string;
  completedMilestones: number;
  // Progress data
  documentsCount: number;
  familyMembersCount: number;
  guardiansCount: number;
  interactive?: boolean;
  // Events
  onBranchClick?: (branch: TreeBranch) => void;

  onLeafClick?: (leaf: TreeLeaf) => void;
  // Customization
  personalityMode?: PersonalityMode;
  showProgress?: boolean;
  showTooltips?: boolean;
  size?: 'full' | 'large' | 'medium' | 'small';
  timeCapsules: number;

  totalMilestones: number;
  variant?: 'artistic' | 'detailed' | 'minimal';

  willProgress: number;
}

export const AdaptiveLegacyTree: React.FC<AdaptiveLegacyTreeProps> = ({
  documentsCount = 0,
  guardiansCount = 0,
  familyMembersCount = 0,
  willProgress = 0,
  timeCapsules = 0,
  personalityMode,
  size = 'medium',
  interactive = true,
  showProgress = true,
  showTooltips = true,
  onBranchClick,
  onLeafClick,
  className = '',
}) => {
  const personalityManager = usePersonalityManager();

  // Get effective personality mode
  const detectedMode = personalityManager?.getCurrentStyle() || 'adaptive';
  const effectiveMode =
    personalityMode ||
    (detectedMode === 'balanced' ? 'adaptive' : detectedMode);

  const shouldReduceMotion = AnimationSystem.shouldReduceMotion();
  const animConfig = AnimationSystem.getConfig(effectiveMode);

  // State
  const [branches, setBranches] = useState<TreeBranch[]>([]);
  const [leaves, setLeaves] = useState<TreeLeaf[]>([]);
  const [hoveredElement, setHoveredElement] = useState<null | string>(null);
  const [treeHealth, setTreeHealth] = useState<
    'dormant' | 'flourishing' | 'growing' | 'thriving'
  >('dormant');

  // Size configurations
  const sizeConfigs = {
    small: { width: 200, height: 150, strokeWidth: 2 },
    medium: { width: 300, height: 250, strokeWidth: 3 },
    large: { width: 400, height: 350, strokeWidth: 4 },
    full: { width: 500, height: 450, strokeWidth: 5 },
  };

  const config = sizeConfigs[size];

  // Calculate tree health based on overall progress
  useEffect(() => {
    const totalProgress =
      documentsCount +
      guardiansCount * 2 +
      familyMembersCount +
      Math.floor(willProgress / 20) +
      timeCapsules * 1.5;

    if (totalProgress >= 15) setTreeHealth('flourishing');
    else if (totalProgress >= 8) setTreeHealth('thriving');
    else if (totalProgress >= 3) setTreeHealth('growing');
    else setTreeHealth('dormant');
  }, [
    documentsCount,
    guardiansCount,
    familyMembersCount,
    willProgress,
    timeCapsules,
  ]);

  // Generate tree structure based on progress and personality
  const generateTreeStructure = useCallback(() => {
    const newBranches: TreeBranch[] = [];
    const newLeaves: TreeLeaf[] = [];

    // Trunk (always present)
    newBranches.push({
      id: 'trunk',
      level: 0,
      angle: 90, // straight up
      length: 1,
      thickness: 1,
      children: [],
      hasLeaves: treeHealth !== 'dormant',
      hasFlowers: treeHealth === 'thriving' || treeHealth === 'flourishing',
      hasFruit: treeHealth === 'flourishing',
      documentCount: Math.min(documentsCount, 3), // trunk represents first 3 documents
      milestoneType: 'foundation',
    });

    // Main branches based on major categories
    if (documentsCount > 0) {
      // Foundation branch (documents)
      const foundationBranch: TreeBranch = {
        id: 'foundation',
        level: 1,
        angle:
          effectiveMode === 'empathetic'
            ? 45
            : effectiveMode === 'pragmatic'
              ? 30
              : 35,
        length: 0.6 + Math.min(documentsCount / 10, 0.4),
        thickness: 0.7 + Math.min(documentsCount / 15, 0.3),
        parentId: 'trunk',
        children: [],
        hasLeaves: documentsCount > 2,
        hasFlowers: documentsCount > 5,
        hasFruit: documentsCount > 8,
        documentCount: documentsCount,
        milestoneType: 'foundation',
      };
      newBranches.push(foundationBranch);
    }

    if (familyMembersCount > 0) {
      // Family branch
      const familyBranch: TreeBranch = {
        id: 'family',
        level: 1,
        angle:
          effectiveMode === 'empathetic'
            ? -60
            : effectiveMode === 'pragmatic'
              ? -40
              : -50,
        length: 0.5 + Math.min(familyMembersCount / 5, 0.4),
        thickness: 0.6 + Math.min(familyMembersCount / 8, 0.3),
        parentId: 'trunk',
        children: [],
        hasLeaves: true,
        hasFlowers: effectiveMode === 'empathetic',
        hasFruit: familyMembersCount > 3,
        documentCount: 0,
        milestoneType: 'family',
      };
      newBranches.push(familyBranch);
    }

    if (guardiansCount > 0) {
      // Protection branch
      const protectionBranch: TreeBranch = {
        id: 'protection',
        level: 1,
        angle:
          effectiveMode === 'pragmatic'
            ? 15
            : effectiveMode === 'empathetic'
              ? 25
              : 20,
        length: 0.4 + Math.min(guardiansCount / 4, 0.5),
        thickness: 0.5 + Math.min(guardiansCount / 6, 0.4),
        parentId: 'trunk',
        children: [],
        hasLeaves: guardiansCount > 1,
        hasFlowers: false,
        hasFruit: guardiansCount > 2,
        documentCount: 0,
        milestoneType: 'protection',
      };
      newBranches.push(protectionBranch);
    }

    if (timeCapsules > 0) {
      // Legacy branch
      const legacyBranch: TreeBranch = {
        id: 'legacy',
        level: 1,
        angle:
          effectiveMode === 'empathetic'
            ? -30
            : effectiveMode === 'pragmatic'
              ? -20
              : -25,
        length: 0.3 + Math.min(timeCapsules / 3, 0.4),
        thickness: 0.4 + Math.min(timeCapsules / 5, 0.3),
        parentId: 'trunk',
        children: [],
        hasLeaves: timeCapsules > 0,
        hasFlowers: timeCapsules > 1,
        hasFruit: timeCapsules > 2,
        documentCount: 0,
        milestoneType: 'legacy',
      };
      newBranches.push(legacyBranch);
    }

    // Generate leaves for branches with leaves
    let leafId = 0;
    newBranches.forEach(branch => {
      if (branch.hasLeaves && branch.level === 1) {
        const leafCount =
          effectiveMode === 'empathetic'
            ? Math.floor(3 + Math.random() * 4)
            : effectiveMode === 'pragmatic'
              ? Math.floor(2 + Math.random() * 2)
              : Math.floor(2 + Math.random() * 3);

        for (let i = 0; i < leafCount; i++) {
          const leafType = branch.hasFruit
            ? 'fruit'
            : branch.hasFlowers
              ? 'flower'
              : 'leaf';
          newLeaves.push({
            id: `leaf-${leafId++}`,
            branchId: branch.id,
            x: Math.random() * 20 - 10, // offset from branch end
            y: Math.random() * 15 - 7.5,
            size: effectiveMode === 'empathetic' ? 'large' : 'medium',
            color: getLeafColor(leafType, branch.milestoneType, effectiveMode),
            type: leafType,
            milestone: getLeafMilestone(branch.milestoneType, i),
            animate: true,
          });
        }
      }
    });

    setBranches(newBranches);
    setLeaves(newLeaves);
  }, [
    documentsCount,
    guardiansCount,
    familyMembersCount,
    timeCapsules,
    treeHealth,
    effectiveMode,
  ]);

  useEffect(() => {
    generateTreeStructure();
  }, [generateTreeStructure]);

  // Helper functions
  const getLeafColor = (
    type: TreeLeaf['type'],
    milestoneType?: TreeBranch['milestoneType'],
    mode: PersonalityMode = 'adaptive'
  ) => {
    if (type === 'flower') {
      switch (mode) {
        case 'empathetic':
          return 'text-pink-400';
        case 'pragmatic':
          return 'text-purple-500';
        default:
          return 'text-rose-400';
      }
    }
    if (type === 'fruit') {
      return milestoneType === 'family' ? 'text-red-500' : 'text-orange-500';
    }
    // Regular leaf colors based on milestone type
    switch (milestoneType) {
      case 'foundation':
        return mode === 'empathetic' ? 'text-green-400' : 'text-green-600';
      case 'family':
        return mode === 'empathetic' ? 'text-emerald-300' : 'text-emerald-500';
      case 'protection':
        return mode === 'pragmatic' ? 'text-blue-600' : 'text-blue-500';
      case 'legacy':
        return 'text-violet-500';
      default:
        return 'text-green-500';
    }
  };

  const getLeafMilestone = (
    milestoneType?: TreeBranch['milestoneType'],
    index: number = 0
  ) => {
    switch (milestoneType) {
      case 'foundation':
        return `Document protection ${index + 1}`;
      case 'family':
        return `Family member ${index + 1} protected`;
      case 'protection':
        return `Guardian ${index + 1} assigned`;
      case 'legacy':
        return `Time capsule ${index + 1} created`;
      default:
        return 'Growth milestone';
    }
  };

  // Calculate branch position
  const getBranchPath = (branch: TreeBranch) => {
    const centerX = config.width / 2;
    const centerY = config.height - 20; // bottom margin

    if (branch.id === 'trunk') {
      return `M ${centerX} ${centerY} L ${centerX} ${centerY - config.height * 0.4}`;
    }

    // For main branches, calculate from trunk top
    const trunkHeight = config.height * 0.4;
    const startX = centerX;
    const startY = centerY - trunkHeight;

    const angleRad = (branch.angle * Math.PI) / 180;
    const branchLength = config.height * 0.3 * branch.length;

    const endX = startX + Math.sin(angleRad) * branchLength;
    const endY = startY - Math.cos(angleRad) * branchLength;

    return `M ${startX} ${startY} L ${endX} ${endY}`;
  };

  // Render branch
  const renderBranch = (branch: TreeBranch) => {
    const pathD = getBranchPath(branch);
    const strokeWidth = config.strokeWidth * branch.thickness;

    return (
      <motion.path
        key={branch.id}
        d={pathD}
        stroke={getBranchColor(branch)}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        fill='none'
        initial={
          !shouldReduceMotion ? { pathLength: 0, opacity: 0 } : false
        }
        animate={
          !shouldReduceMotion ? { pathLength: 1, opacity: 1 } : false
        }
        transition={
          !shouldReduceMotion
            ? {
                duration: animConfig.duration * (branch.level + 1),
                delay: branch.level * animConfig.delay * 2,
                ease: animConfig.ease as any,
              }
            : undefined
        }
        style={{ cursor: interactive ? 'pointer' : 'default' }}
        onClick={() => interactive && onBranchClick?.(branch)}
        onMouseEnter={() => interactive && setHoveredElement(branch.id)}
        onMouseLeave={() => setHoveredElement(null)}
      />
    );
  };

  const getBranchColor = (branch: TreeBranch) => {
    if (branch.id === 'trunk') {
      return effectiveMode === 'empathetic' ? '#92400e' : '#8b5a2b'; // brown variations
    }

    switch (branch.milestoneType) {
      case 'foundation':
        return effectiveMode === 'pragmatic' ? '#059669' : '#10b981';
      case 'family':
        return effectiveMode === 'empathetic' ? '#ec4899' : '#f59e0b';
      case 'protection':
        return effectiveMode === 'pragmatic' ? '#2563eb' : '#3b82f6';
      case 'legacy':
        return '#8b5cf6';
      default:
        return '#10b981';
    }
  };

  // Render leaf
  const renderLeaf = (leaf: TreeLeaf) => {
    // Find the branch this leaf belongs to
    const branch = branches.find(b => b.id === leaf.branchId);
    if (!branch) return null;

    // Calculate leaf position based on branch end
    const branchPath = getBranchPath(branch);
    const pathParts = branchPath.split(' ');
    const endX = parseFloat(pathParts[pathParts.length - 2] || '0');
    const endY = parseFloat(pathParts[pathParts.length - 1] || '0');

    const leafX = endX + leaf.x;
    const leafY = endY + leaf.y;

    const LeafIcon =
      leaf.type === 'flower' ? Heart : leaf.type === 'fruit' ? Star : Leaf;

    return (
      <motion.g key={leaf.id}>
        <motion.foreignObject
          x={leafX - 8}
          y={leafY - 8}
          width={16}
          height={16}
          initial={!shouldReduceMotion ? { scale: 0, opacity: 0 } : false}
          animate={!shouldReduceMotion ? { scale: 1, opacity: 1 } : false}
          transition={
            !shouldReduceMotion
              ? {
                  duration: animConfig.duration,
                  delay: Math.random() * 1.5 + 0.5,
                  ease: animConfig.ease as any,
                }
              : undefined
          }
          whileHover={
            interactive && !shouldReduceMotion ? { scale: 1.3 } : undefined
          }
          style={{ cursor: interactive ? 'pointer' : 'default' }}
          onClick={() => interactive && onLeafClick?.(leaf)}
          onMouseEnter={() =>
            interactive && showTooltips && setHoveredElement(leaf.id)
          }
          onMouseLeave={() => setHoveredElement(null)}
        >
          <LeafIcon className={`w-4 h-4 ${leaf.color}`} />
        </motion.foreignObject>

        {/* Leaf animation for empathetic mode */}
        {effectiveMode === 'empathetic' &&
          !shouldReduceMotion &&
          leaf.animate && (
            <motion.foreignObject
              x={leafX - 8}
              y={leafY - 8}
              width={16}
              height={16}
              animate={{
                rotate: [-2, 2, -2],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: Math.random() * 3,
              }}
            >
              <LeafIcon className={`w-4 h-4 ${leaf.color} opacity-30`} />
            </motion.foreignObject>
          )}
      </motion.g>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <svg
        width={config.width}
        height={config.height}
        className='overflow-visible'
        style={{
          filter:
            effectiveMode === 'empathetic'
              ? 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
              : 'none',
        }}
      >
        {/* Tree branches */}
        {branches.map(renderBranch)}

        {/* Tree leaves */}
        <AnimatePresence>{leaves.map(renderLeaf)}</AnimatePresence>

        {/* Tree crown glow for flourishing state */}
        {treeHealth === 'flourishing' &&
          effectiveMode === 'empathetic' &&
          !shouldReduceMotion && (
            <motion.circle
              cx={config.width / 2}
              cy={config.height * 0.3}
              r='60'
              fill='rgba(34, 197, 94, 0.1)'
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0.1, 0.3, 0.1], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
      </svg>

      {/* Progress indicator */}
      {showProgress && (
        <motion.div
          className='absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <div className='flex items-center gap-2 text-sm'>
            <TreePine className='w-4 h-4 text-green-600' />
            <span className='font-medium text-gray-700'>
              {treeHealth === 'flourishing'
                ? 'Flourishing'
                : treeHealth === 'thriving'
                  ? 'Thriving'
                  : treeHealth === 'growing'
                    ? 'Growing'
                    : 'Beginning'}
            </span>
            {effectiveMode === 'empathetic' && (
              <Heart className='w-3 h-3 text-pink-400' />
            )}
            {effectiveMode === 'pragmatic' && (
              <Shield className='w-3 h-3 text-blue-500' />
            )}
          </div>
        </motion.div>
      )}

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredElement && showTooltips && (
          <motion.div
            className='absolute bg-black/80 text-white text-xs px-3 py-2 rounded-lg pointer-events-none whitespace-nowrap z-10'
            style={{
              left: '50%',
              top: '20px',
              transform: 'translateX(-50%)',
            }}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {hoveredElement.startsWith('leaf-')
              ? leaves.find(l => l.id === hoveredElement)?.milestone
              : branches.find(b => b.id === hoveredElement)?.milestoneType}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdaptiveLegacyTree;
