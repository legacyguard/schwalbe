import { useTranslation } from 'react-i18next';

interface LegacyGuardLogoProps {
  className?: string;
  color?: string;
}

export function LegacyGuardLogo({
  className = 'w-8 h-8',
  color = '#facc15', // Yellow-400 color
}: LegacyGuardLogoProps) {
  const { t } = useTranslation('ui/legacy-guard-logo');
  return (
    <div className={className}>
      <svg
        viewBox='0 0 256 256'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-label={t('ariaLabel')}
      >
        <g
          fill='none'
          stroke={color}
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          {/* Shield */}
          <path
            strokeWidth='14'
            d='M128 20 48 56v64c0 60 44 100 80 116 36-16 80-56 80-116V56Z'
          />

          {/* Left side of book */}
          <path
            strokeWidth='12'
            d='M128 96 h-40 a12 12 0 0 0 -12 12 v52 a12 12 0 0 0 12 12 h40 Z'
          />

          {/* Right side of book */}
          <path
            strokeWidth='12'
            d='M128 96 h40 a12 12 0 0 1 12 12 v52 a12 12 0 0 1 -12 12 h-40 Z'
          />

          {/* Center - book spine */}
          <line x1='128' y1='96' x2='128' y2='172' strokeWidth='8' />
        </g>
      </svg>
    </div>
  );
}