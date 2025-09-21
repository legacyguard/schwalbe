
export interface ActivityItem {
  action: string;
  color?: 'danger' | 'info' | 'primary' | 'success' | 'warning';
  description: string;
  icon?: string;
  id: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  type: 'document' | 'family' | 'guardian' | 'security' | 'system' | 'will';
  user?: {
    avatar?: string;
    name: string;
  };
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
  maxHeight?: string;
  onViewAll?: () => void;
  showViewAll?: boolean;
  title?: string;
}
