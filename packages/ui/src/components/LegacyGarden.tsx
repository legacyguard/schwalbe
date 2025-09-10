
import React, { useEffect, useState } from 'react';
import { styled, View } from 'tamagui';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import {
  LegacyGarden as LegacyGardenLogic,
  type TreeState,
} from '@schwalbe/logic';
import { EVENTS, useEventBus } from '../utils/eventBus';
import type { LegacyGardenProps } from './LegacyGarden.types';

const GardenContainer = styled(View, {
  name: 'LGGardenContainer',
  width: '100%',
  height: 400,
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'transparent',
});

// Web/React version with Framer Motion
const LegacyGardenWeb: React.FC<LegacyGardenProps> = ({
  milestonesUnlocked = 0,
  documentsCreated = 0,
  daysActive = 0,
  interactive = true,
  showLabels = true,
}) => {
  const controls = useAnimation();
  const [treeState, setTreeState] = useState<TreeState>();
  const gardenLogic = React.useMemo(() => new LegacyGardenLogic(), []);

  // Calculate tree state based on props
  useEffect(() => {
    const state = gardenLogic.calculateGrowth({
      documentsCreated,
      daysActive,
      documentsShared: 0,
      lastUpdateDays: 0,
      categoriesUsed: Math.min(3, milestonesUnlocked),
      completionRate: milestonesUnlocked / 10,
    });
    setTreeState(state);
  }, [milestonesUnlocked, documentsCreated, daysActive, gardenLogic]);

  // Listen for milestone events
  useEventBus(EVENTS.MILESTONE_UNLOCKED, _milestone => {
    controls.start('celebrate');
  });


  const renderBranch = (index: number, x: number, y: number, angle: number) => {
    const shouldShow = treeState && index < treeState.branches;

    return (
      <motion.g
        key={`branch-${index}`}
        initial={{ opacity: 0, scale: 0 }}
        animate={
          shouldShow ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
        }
        transition={{ delay: index * 0.2, duration: 0.8 }}
      >
        <motion.line
          x1={x}
          y1={y}
          x2={x + Math.cos(angle) * 40}
          y2={y + Math.sin(angle) * 40}
          stroke='#8B7355'
          strokeWidth='3'
          strokeLinecap='round'
        />
        {/* Leaves */}
        {shouldShow && treeState && index < treeState.leaves / 3 && (
          <>
            <motion.circle
              cx={x + Math.cos(angle) * 30}
              cy={y + Math.sin(angle) * 30}
              r='8'
              fill='#4a7c4e'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.2 + 0.3 }}
            />
            <motion.circle
              cx={x + Math.cos(angle) * 45}
              cy={y + Math.sin(angle) * 45}
              r='10'
              fill='#5a8d5e'
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.2 + 0.4 }}
            />
          </>
        )}
        {/* Fruits */}
        {shouldShow && treeState && index < treeState.fruits && (
          <motion.circle
            cx={x + Math.cos(angle) * 40}
            cy={y + Math.sin(angle) * 40}
            r='6'
            fill='#ff6b6b'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.2 + 0.5 }}
          />
        )}
      </motion.g>
    );
  };

  if (!treeState) return null;

  return (
    <GardenContainer>
      <svg width='300' height='400' viewBox='0 0 300 400'>
        {/* Ground */}
        <motion.ellipse
          cx='150'
          cy='380'
          rx='100'
          ry='20'
          fill='#8B7355'
          opacity={0.3}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Roots */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Array.from({ length: treeState.roots }).map((_, i) => (
            <motion.path
              key={`root-${i}`}
              d={`M150,380 Q${130 + i * 20},390 ${120 + i * 25},400`}
              stroke='#654321'
              strokeWidth='2'
              fill='none'
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
            />
          ))}
        </motion.g>

        {/* Trunk */}
        <motion.rect
          x='140'
          y={380 - treeState.height * 2}
          width='20'
          height={treeState.height * 2}
          fill='#8B7355'
          initial={{ height: 0 }}
          animate={{ height: treeState.height * 2 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Branches */}
        {treeState.stage !== 'seed' && (
          <motion.g>
            {renderBranch(
              0,
              150,
              380 - treeState.height * 2 + 20,
              -Math.PI / 4
            )}
            {renderBranch(
              1,
              150,
              380 - treeState.height * 2 + 20,
              (-3 * Math.PI) / 4
            )}
            {renderBranch(
              2,
              150,
              380 - treeState.height * 2 + 40,
              -Math.PI / 3
            )}
            {renderBranch(
              3,
              150,
              380 - treeState.height * 2 + 40,
              (-2 * Math.PI) / 3
            )}
            {renderBranch(
              4,
              150,
              380 - treeState.height * 2 + 60,
              -Math.PI / 6
            )}
            {renderBranch(
              5,
              150,
              380 - treeState.height * 2 + 60,
              (-5 * Math.PI) / 6
            )}
          </motion.g>
        )}

        {/* Crown/Canopy for mature trees */}
        {(treeState.stage === 'mature-tree' ||
          treeState.stage === 'ancient-tree') && (
          <motion.ellipse
            cx='150'
            cy={380 - treeState.height * 2 - 20}
            rx={treeState.height * 0.8}
            ry={treeState.height * 0.6}
            fill='#4a7c4e'
            opacity={0.7}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          />
        )}

        {/* Stage label */}
        {showLabels && (
          <motion.text
            x='150'
            y='30'
            textAnchor='middle'
            fontSize='16'
            fill='#333'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {gardenLogic.getStageInfo().name}
          </motion.text>
        )}

        {/* Health indicator */}
        <motion.rect
          x='50'
          y='350'
          width='200'
          height='8'
          fill='#e0e0e0'
          rx='4'
        />
        <motion.rect
          x='50'
          y='350'
          width={treeState.health * 2}
          height='8'
          fill={
            treeState.health > 60
              ? '#4caf50'
              : treeState.health > 30
                ? '#ff9800'
                : '#f44336'
          }
          rx='4'
          initial={{ width: 0 }}
          animate={{ width: treeState.health * 2 }}
          transition={{ duration: 0.5 }}
        />

        {/* Milestone indicators */}
        <AnimatePresence>
          {gardenLogic.getMilestones().map((milestone, index) => {
            if (!milestone.achieved) return null;

            return (
              <motion.g
                key={milestone.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{ cursor: interactive ? 'pointer' : 'default' }}
              >
                <motion.circle
                  cx={50 + index * 25}
                  cy={50}
                  r='12'
                  fill='#ffd700'
                  whileHover={interactive ? { scale: 1.2 } : {}}
                  whileTap={interactive ? { scale: 0.9 } : {}}
                />
                <motion.text
                  x={50 + index * 25}
                  y={55}
                  textAnchor='middle'
                  fontSize='14'
                >
                  {milestone.icon}
                </motion.text>
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>
    </GardenContainer>
  );
};

// Native version (simplified without Framer Motion)
const LegacyGardenNative: React.FC<LegacyGardenProps> = ({
  milestonesUnlocked = 0,
  documentsCreated = 0,
  daysActive = 0,
}) => {
  const [treeState, setTreeState] = useState<TreeState>();
  const gardenLogic = React.useMemo(() => new LegacyGardenLogic(), []);

  useEffect(() => {
    const state = gardenLogic.calculateGrowth({
      documentsCreated,
      daysActive,
      documentsShared: 0,
      lastUpdateDays: 0,
      categoriesUsed: Math.min(3, milestonesUnlocked),
      completionRate: milestonesUnlocked / 10,
    });
    setTreeState(state);
  }, [milestonesUnlocked, documentsCreated, daysActive, gardenLogic]);

  if (!treeState) return null;

  return (
    <GardenContainer>
      <View
        style={{
          width: 300,
          height: 400,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Simplified tree visualization for React Native */}
        <View
          style={{
            width: 20,
            height: treeState.height * 2,
            backgroundColor: '#8B7355',
            position: 'absolute',
            bottom: 20,
          }}
        />
        {/* Add more native elements as needed */}
      </View>
    </GardenContainer>
  );
};

// Export a component wrapper for fast-refresh compatibility
export const LegacyGarden: React.FC<LegacyGardenProps> = props => {
  const isWeb = typeof window !== 'undefined';
  return isWeb ? (
    <LegacyGardenWeb {...props} />
  ) : (
    <LegacyGardenNative {...props} />
  );
};
