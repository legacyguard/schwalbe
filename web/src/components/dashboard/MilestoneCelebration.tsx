
import type React from 'react';
import type { SerenityMilestone } from '@/lib/path-of-serenity';

// Legacy component interface for backward compatibility
// Now implemented using toast system - no longer renders UI
interface MilestoneCelebrationProps {
  isOpen: boolean;
  milestone: null | SerenityMilestone;
  onClose: () => void;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = () => {
  // This component is deprecated - use showMilestoneRecognition directly
  return null;
};

// Function is now exported from milestoneUtils.tsx
