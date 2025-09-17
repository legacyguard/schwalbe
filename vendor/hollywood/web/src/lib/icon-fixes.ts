
/**
 * Icon Type Fixes and Mappings
 * This file provides proper type definitions for Lucide icons
 */

import type { LucideIcon } from 'lucide-react';

// Proper icon type mapping
export type IconName =
  | 'alert-circle'
  | 'alertCircle'
  | 'archive'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'baby'
  | 'book-open'
  | 'calendar'
  | 'card'
  | 'check-circle'
  | 'checkCircle'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'circle'
  | 'clock'
  | 'close'
  | 'copy'
  | 'crown'
  | 'download'
  | 'edit'
  | 'external-link'
  | 'file'
  | 'file-text'
  | 'filter'
  | 'grid'
  | 'headphones'
  | 'heart'
  | 'help'
  | 'home'
  | 'info'
  | 'key'
  | 'link'
  | 'list'
  | 'loading'
  | 'mail'
  | 'map-pin'
  | 'maximize'
  | 'maximize'
  | 'menu'
  | 'message-square'
  | 'minimize'
  | 'minus'
  | 'notifications'
  | 'pause'
  | 'phone'
  | 'play'
  | 'play-circle'
  | 'plus'
  | 'refresh'
  | 'save'
  | 'save'
  | 'scroll'
  | 'search'
  | 'send'
  | 'settings'
  | 'shield'
  | 'stop'
  | 'trash'
  | 'triangle-exclamation'
  | 'user'
  | 'video'
  | 'volume'
  | 'volume-2'
  | 'volume-x'
  | 'warning'
  | 'x';

// Icon component type
export type IconComponent = LucideIcon;

// Props for icon components
export interface IconProps {
  className?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
}

// Safe icon mapping
export const iconMap: Record<string, IconName> = {
  'check-circle': 'checkCircle',
  'alert-circle': 'alertCircle',
  'triangle-exclamation': 'triangle-exclamation',
  'play-circle': 'play-circle',
  'book-open': 'book-open',
  'external-link': 'external-link',
  'message-square': 'message-square',
  headphones: 'headphones',
  volume: 'volume',
  'volume-x': 'volume-x',
  'volume-2': 'volume-2',
  archive: 'archive',
  baby: 'baby',
  scroll: 'scroll',
  notifications: 'notifications',
  maximize: 'maximize',
};
