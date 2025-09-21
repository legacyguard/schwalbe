import React from 'react';

export interface SofiaFireflyProps {
  onTouch?: () => void;
  isActive?: boolean;
  size?: 'mini' | 'small' | 'medium' | 'large' | 'hero';
  message?: string;
  variant?: 'floating' | 'interactive' | 'contextual';
  personality?: 'empathetic' | 'pragmatic' | 'celebratory' | 'comforting' | 'nurturing' | 'confident';
  context?: 'idle' | 'guiding' | 'celebrating' | 'helping' | 'waiting' | 'learning' | 'supporting' | 'encouraging';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  enableHaptics?: boolean;
  enableAdvancedAnimations?: boolean;
  glowIntensity?: number;
  className?: string;
}

export const SofiaFirefly: React.FC<SofiaFireflyProps> = ({
  isActive = true,
  size = 'medium',
  message = "Sofia's light guides your path",
  className = '',
}) => {
  if (!isActive) return null;

  return (
    <div className={`relative flex items-center ${className}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-yellow-900 text-lg">✨</span>
      </div>
    </div>
  );
};

export default SofiaFirefly;
