/**
 * Progress & Motivation Elements
 * Dashboard motivation and progress tracking components
 */
import React from 'react';
export interface ProgressData {
    documentsCount: number;
    categoriesCompleted: number;
    totalCategories: number;
    guardiansSet: number;
    willProgress: number;
    overallCompletion: number;
    streak: number;
    lastActivity: Date;
}
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    unlockedAt: Date;
    category: 'documents' | 'milestones' | 'engagement' | 'protection';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
export interface SuggestedAction {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedTime: number;
    category: string;
    motivationalMessage: string;
}
interface ProgressMotivationProps {
    progress: ProgressData;
    achievements: Achievement[];
    suggestedActions: SuggestedAction[];
    onActionClick: (actionId: string) => void;
    onAchievementClick: (achievementId: string) => void;
    userName?: string;
    className?: string;
}
export declare function ProgressMotivation({ progress, achievements, suggestedActions, onActionClick, onAchievementClick, userName, className }: ProgressMotivationProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ProgressMotivation.d.ts.map