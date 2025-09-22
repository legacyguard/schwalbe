/**
 * Three Pillars Design - Dashboard "Centrum Pokoja"
 * DNES (Today) | ZAJTRA (Tomorrow) | NAVŽDY (Forever) pillars
 */
import React from 'react';
export interface PillarData {
    id: 'dnes' | 'zajtra' | 'navzdy';
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    gradient: string;
    unlocked: boolean;
    progress: number;
    actions: PillarAction[];
    achievements: Achievement[];
}
export interface PillarAction {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    completed: boolean;
    urgent?: boolean;
    estimatedTime?: number;
}
export interface Achievement {
    id: string;
    title: string;
    description: string;
    unlockedAt?: Date;
    icon: React.ReactNode;
}
interface ThreePillarsProps {
    pillars: PillarData[];
    onPillarClick: (pillarId: string) => void;
    onActionClick: (pillarId: string, actionId: string) => void;
    className?: string;
    userName?: string;
}
export declare function ThreePillars({ pillars, onPillarClick, onActionClick, className, userName }: ThreePillarsProps): import("react/jsx-runtime").JSX.Element;
export declare const createDefaultPillars: (userProgress: {
    documentsCount: number;
    categoriesCompleted: string[];
    guardiansSet: boolean;
    willCreated: boolean;
}) => PillarData[];
export {};
//# sourceMappingURL=ThreePillars.d.ts.map