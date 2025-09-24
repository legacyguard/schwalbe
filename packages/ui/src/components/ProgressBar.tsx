
import React from 'react';
import { type GetProps, Paragraph, Stack, styled, View } from '@tamagui/core';

// Styled components for ProgressBar
const ProgressBarContainer = React.memo(styled(Stack, {
  name: 'ProgressBarContainer',
  width: '100%',
  space: '$2',
}));

const ProgressTrack = React.memo(styled(View, {
  name: 'ProgressTrack',
  width: '100%',
  height: 8,
  backgroundColor: '$gray3',
  borderRadius: '$10',
  overflow: 'hidden',
  position: 'relative',
}));

const ProgressFill = React.memo(styled(View, {
  name: 'ProgressFill',
  height: '100%',
  borderRadius: '$10',
  position: 'absolute',
  left: 0,
  top: 0,

  variants: {
    variant: {
      primary: {
        backgroundColor: '$primaryBlue',
      },
      success: {
        backgroundColor: '$primaryGreen',
      },
      warning: {
        backgroundColor: '$accentGold',
      },
      danger: {
        backgroundColor: '$error',
      },
      premium: {
        backgroundColor: '$accentGold',
        backgroundImage:
          'linear-gradient(90deg, $accentGold 0%, $accentGoldLight 50%, $accentGold 100%)',
      },
    },
    animated: {
      true: {
        animation: 'medium',
      },
    },
  },
}));

const ProgressLabel = React.memo(styled(Stack, {
  name: 'ProgressLabel',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
}));

export interface ProgressBarProps
  extends GetProps<typeof ProgressBarContainer> {
  /** Enable animation for smooth transitions */
  animated?: boolean;
  /** Custom label formatting function */
  formatLabel?: (value: number, maxValue: number) => string;
  /** Height of the progress bar in pixels */
  height?: number;
  /** Label text to display above the progress bar */
  label?: string;
  /** Maximum value for progress calculation */
  maxValue?: number;
  /** Show/hide the label section */
  showLabel?: boolean;
  /** Show/hide percentage in label */
  showPercentage?: boolean;
  /** Current progress value (0-100) */
  value: number;
  /** Color variant for the progress bar */
  variant?: 'danger' | 'premium' | 'primary' | 'success' | 'warning';
}

export const ProgressBar = React.memo(({
  value,
  maxValue = 100,
  label,
  showPercentage = true,
  variant = 'primary',
  animated = true,
  height = 8,
  showLabel = true,
  formatLabel,
  ...props
}: ProgressBarProps) => {
  // Ensure value is between 0 and maxValue
  const normalizedValue = Math.min(Math.max(0, value), maxValue);
  const percentage = (normalizedValue / maxValue) * 100;

  const displayLabel = formatLabel
    ? formatLabel(normalizedValue, maxValue)
    : showPercentage
      ? `${Math.round(percentage)}%`
      : `${normalizedValue} / ${maxValue}`;

  return (
    <ProgressBarContainer {...props}>
      {showLabel && (label || showPercentage) && (
        <ProgressLabel>
          {label && (
            <Paragraph size='$3' color='$gray8' fontWeight='500'>
              {label}
            </Paragraph>
          )}
          <Paragraph size='$2' color='$gray6'>
            {displayLabel}
          </Paragraph>
        </ProgressLabel>
      )}

      <ProgressTrack height={height}>
        <ProgressFill
          backgroundColor={
            variant === 'primary' ? '$primaryBlue' :
            variant === 'success' ? '$primaryGreen' :
            variant === 'warning' ? '$accentGold' :
            variant === 'danger' ? '$error' :
            variant === 'premium' ? '$accentGold' : '$primaryBlue'
          }
          width={`${percentage}%`}
          animation={animated ? 'medium' : undefined}
          enterStyle={animated ? { width: 0 } : undefined}
        />
      </ProgressTrack>
    </ProgressBarContainer>
  );
});

ProgressBar.displayName = 'ProgressBar';

// Circular Progress variant
const CircularProgressContainer = styled(View, {
  name: 'CircularProgress',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

// Cleaned up unused component references

const CircularProgressText = styled(View, {
  name: 'CircularProgressText',
  alignItems: 'center',
  justifyContent: 'center',
});

export interface CircularProgressProps {
  label?: string;
  showPercentage?: boolean;
  size?: number;
  strokeWidth?: number;
  value: number;
  variant?: 'danger' | 'premium' | 'primary' | 'success' | 'warning';
}

export const CircularProgress = React.memo(({
  value,
  size = 120,
  strokeWidth = 8,
  variant = 'primary',
  showPercentage = true,
  label,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const colors = {
    primary: '#1e40af',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#dc2626',
    premium: '#f59e0b',
  };

  return (
    <CircularProgressContainer width={size} height={size}>
      <svg
        width={size}
        height={size}
        style={
          {
            position: 'absolute',
            transform: 'rotate(-90deg)',
          } as React.CSSProperties
        }
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='#e5e7eb'
          strokeWidth={strokeWidth}
          fill='none'
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[variant]}
          strokeWidth={strokeWidth}
          fill='none'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>

      <CircularProgressText>
        {showPercentage && (
          <Paragraph size='$6' fontWeight='700' color='$color'>
            {Math.round(value)}%
          </Paragraph>
        )}
        {label && (
          <Paragraph size='$2' color='$gray6' marginTop='$1'>
            {label}
          </Paragraph>
        )}
      </CircularProgressText>
    </CircularProgressContainer>
  );
});

CircularProgress.displayName = 'CircularProgress';

// Segmented Progress for multi-step processes
const SegmentedProgressContainer = styled(Stack, {
  name: 'SegmentedProgress',
  flexDirection: 'row',
  width: '100%',
  space: '$1',
});

const ProgressSegment = styled(View, {
  name: 'ProgressSegment',
  flex: 1,
  height: 6,
  backgroundColor: '$gray3',

  variants: {
    isActive: {
      true: {
        backgroundColor: '$primaryBlue',
      },
    },
    isCompleted: {
      true: {
        backgroundColor: '$primaryGreen',
      },
    },
    segmentPosition: {
      first: {
        borderTopLeftRadius: '$10',
        borderBottomLeftRadius: '$10',
      },
      last: {
        borderTopRightRadius: '$10',
        borderBottomRightRadius: '$10',
      },
      middle: {},
    },
  },
});

export interface SegmentedProgressProps
  extends GetProps<typeof SegmentedProgressContainer> {
  currentSegment: number;
  labels?: string[];
  segments: number;
  showLabels?: boolean;
}

export const SegmentedProgress = React.memo(({
  segments,
  currentSegment,
  showLabels = false,
  labels = [],
  ...props
}: SegmentedProgressProps) => {
  return (
    <Stack space='$2' width='100%'>
      <SegmentedProgressContainer {...props}>
        {Array.from({ length: segments }, (_, index) => {
          const isCompleted = index < currentSegment;
          const isActive = index === currentSegment;
          const segmentPosition =
            index === 0 ? 'first' : index === segments - 1 ? 'last' : 'middle';

          return (
            <ProgressSegment
              key={index}
              data-completed={isCompleted}
              data-active={isActive}
              data-position={segmentPosition}
              animation="medium"
            />
          );
        })}
      </SegmentedProgressContainer>

      {showLabels && labels.length > 0 && (
        <Stack flexDirection='row' justifyContent='space-between'>
          {labels.map((label, index) => (
            <Paragraph
              key={index}
              size='$1'
              color={index <= currentSegment ? '$primaryBlue' : '$gray5'}
              fontWeight={index === currentSegment ? '600' : '400'}
            >
              {label}
            </Paragraph>
          ))}
        </Stack>
      )}
    </Stack>
  );
});

SegmentedProgress.displayName = 'SegmentedProgress';

// Export all progress components
export default ProgressBar;
export { ProgressBarContainer, ProgressFill, ProgressTrack };
