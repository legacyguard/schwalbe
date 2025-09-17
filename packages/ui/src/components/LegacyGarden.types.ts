
export interface LegacyGardenProps {
  daysActive?: number;
  documentsCreated?: number;
  interactive?: boolean;
  milestonesUnlocked: number;
  onMilestoneClick?: (milestone: {
    achieved: boolean;
    id: string;
    name: string;
  }) => void;
  showLabels?: boolean;
}
