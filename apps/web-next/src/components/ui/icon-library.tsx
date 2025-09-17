import React from 'react';

// Simple icon library component
interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = '' }) => {
  // Simple icon mapping - you can expand this with actual icons
  const iconMap: Record<string, string> = {
    check: '✓',
    close: '✕',
    arrow: '→',
    star: '★',
    heart: '♥',
    shield: '🛡️',
    lock: '🔒',
    user: '👤',
    settings: '⚙️',
    bell: '🔔',
    calendar: '📅',
    document: '📄',
    folder: '📁',
    search: '🔍',
    plus: '+',
    minus: '-',
    edit: '✏️',
    trash: '🗑️',
    share: '📤',
    download: '📥',
    upload: '📤',
    home: '🏠',
    mail: '✉️',
    phone: '📞',
    map: '🗺️',
    clock: '🕐',
    warning: '⚠️',
    info: 'ℹ️',
    success: '✅',
    error: '❌',
  };

  const icon = iconMap[name] || '?';

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: size, width: size, height: size }}
      role="img"
      aria-label={name}
    >
      {icon}
    </span>
  );
};

export default Icon;