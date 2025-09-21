import React from 'react';

export interface SofiaFireflySVGProps {
  size: number;
  personality?: 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting' | 'nurturing' | 'confident';
  context?: 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting' | 'learning' | 'supporting' | 'encouraging';
  glowIntensity?: number;
  wingAnimation?: number; // 0-1 for wing position
}

export const SofiaFireflySVG: React.FC<SofiaFireflySVGProps> = ({
  size,
  personality = 'empathetic',
  context = 'idle',
  glowIntensity = 0.3,
  wingAnimation = 0,
}) => {
  // Personality-based color variations
  const getPersonalityColors = () => {
    const base = '#fbbf24';

    switch (personality) {
      case 'empathetic':
        return {
          primary: base,
          secondary: '#fef3c7',
          glow: `rgba(251, 191, 36, ${glowIntensity})`,
        };
      case 'pragmatic':
        return {
          primary: '#f59e0b',
          secondary: '#fbbf24',
          glow: `rgba(245, 158, 11, ${glowIntensity})`,
        };
      case 'celebratory':
        return {
          primary: '#fbbf24',
          secondary: '#fef3c7',
          glow: `rgba(251, 191, 36, ${glowIntensity * 1.5})`,
        };
      case 'comforting':
        return {
          primary: '#d97706',
          secondary: '#f59e0b',
          glow: `rgba(217, 119, 6, ${glowIntensity * 0.8})`,
        };
      case 'nurturing':
        return {
          primary: '#f59e0b',
          secondary: '#fbbf24',
          glow: `rgba(245, 158, 11, ${glowIntensity * 0.9})`,
        };
      case 'confident':
        return {
          primary: '#d97706',
          secondary: '#f59e0b',
          glow: `rgba(217, 119, 6, ${glowIntensity * 1.1})`,
        };
      default:
        return {
          primary: base,
          secondary: '#fef3c7',
          glow: `rgba(251, 191, 36, ${glowIntensity})`,
        };
    }
  };

  const colors = getPersonalityColors();

  // Context-based visual effects
  const getContextEffects = () => {
    switch (context) {
      case 'celebrating':
        return {
          sparkleCount: 6,
          wingSpread: 1.2,
          glowPulse: 1.3,
        };
      case 'guiding':
        return {
          sparkleCount: 3,
          wingSpread: 1.1,
          glowPulse: 1.1,
        };
      case 'helping':
        return {
          sparkleCount: 4,
          wingSpread: 1.0,
          glowPulse: 1.2,
        };
      case 'waiting':
        return {
          sparkleCount: 2,
          wingSpread: 0.9,
          glowPulse: 0.8,
        };
      case 'learning':
        return {
          sparkleCount: 5,
          wingSpread: 1.15,
          glowPulse: 1.25,
        };
      case 'supporting':
        return {
          sparkleCount: 4,
          wingSpread: 1.05,
          glowPulse: 1.15,
        };
      case 'encouraging':
        return {
          sparkleCount: 6,
          wingSpread: 1.25,
          glowPulse: 1.4,
        };
      default:
        return {
          sparkleCount: 3,
          wingSpread: 1.0,
          glowPulse: 1.0,
        };
    }
  };

  const effects = getContextEffects();

  // Wing animation interpolation
  const wingRotation = wingAnimation * 25; // Max 25 degrees
  const wingScale = 0.8 + (wingAnimation * 0.4); // Scale between 0.8 and 1.2

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block' }}
    >
      <defs>
        {/* Main glow gradient */}
        <radialGradient id="fireflyGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={colors.glow} stopOpacity={glowIntensity * effects.glowPulse} />
          <stop offset="70%" stopColor={colors.primary} stopOpacity={0.3} />
          <stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
        </radialGradient>

        {/* Body gradient */}
        <radialGradient id="fireflyBody" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={colors.secondary} stopOpacity={1} />
          <stop offset="70%" stopColor={colors.primary} stopOpacity={0.9} />
          <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
        </radialGradient>

        {/* Wing gradient */}
        <radialGradient id="fireflyWing" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" stopOpacity={1} />
          <stop offset="100%" stopColor="rgba(255, 255, 255, 0.4)" stopOpacity={0.6} />
        </radialGradient>
      </defs>

      <g>
        {/* Glow effect */}
        <circle
          cx={50}
          cy={50}
          r={45}
          fill="url(#fireflyGlow)"
        />

        {/* Main body */}
        <circle
          cx={50}
          cy={50}
          r={18}
          fill="url(#fireflyBody)"
          style={{
            filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
          }}
        />

        {/* Inner glow */}
        <circle
          cx={50}
          cy={50}
          r={12}
          fill={colors.secondary}
          opacity={0.8}
        />

        {/* Left wing */}
        <g transform={`translate(25, 35) rotate(${-30 + wingRotation}) scale(${wingScale * effects.wingSpread})`}>
          <path
            d="M0,0 Q-8,-3 Q-12,0 Q-8,3 Q0,0"
            fill="url(#fireflyWing)"
          />
        </g>

        {/* Right wing */}
        <g transform={`translate(75, 35) rotate(${30 - wingRotation}) scale(${wingScale * effects.wingSpread})`}>
          <path
            d="M0,0 Q8,-3 Q12,0 Q8,3 Q0,0"
            fill="url(#fireflyWing)"
          />
        </g>

        {/* Antennae */}
        <g>
          <path
            d="M45,35 Q42,25 Q45,20"
            stroke={colors.primary}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M55,35 Q58,25 Q55,20"
            stroke={colors.primary}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          {/* Antenna tips */}
          <circle cx={45} cy={20} r={2} fill={colors.secondary} />
          <circle cx={55} cy={20} r={2} fill={colors.secondary} />
        </g>

        {/* Sparkle effects based on context */}
        {Array.from({ length: effects.sparkleCount }).map((_, i) => (
          <g key={i}>
            <path
              d={`M${35 + i * 8},45 L${37 + i * 8},47 L${35 + i * 8},49 L${33 + i * 8},47 Z`}
              fill={colors.secondary}
              opacity={0.8 - i * 0.1}
            />
          </g>
        ))}

        {/* Center sparkle */}
        <path
          d="M50,50 L52,52 L50,54 L48,52 Z"
          fill={colors.secondary}
          opacity={0.9}
        />
      </g>
    </svg>
  );
};

export default SofiaFireflySVG;