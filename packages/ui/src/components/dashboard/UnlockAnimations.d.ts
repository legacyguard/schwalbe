/**
 * Progressive Unlock Animations
 * Pillar and feature unlock animations for emotional impact
 */
import React from 'react';
export interface UnlockEvent {
    id: string;
    type: 'pillar' | 'feature' | 'achievement' | 'milestone';
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    gradient: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    triggerCondition: string;
    celebrationMessage: string;
    rewards?: UnlockReward[];
}
export interface UnlockReward {
    id: string;
    type: 'feature' | 'customization' | 'content' | 'access';
    title: string;
    description: string;
    icon: React.ReactNode;
}
interface UnlockAnimationsProps {
    unlockEvent: UnlockEvent | null;
    onUnlockComplete: (eventId: string) => void;
    onSkip?: () => void;
    className?: string;
}
export declare function UnlockAnimations({ unlockEvent, onUnlockComplete, onSkip, className }: UnlockAnimationsProps): import("react/jsx-runtime").JSX.Element | null;
export declare const createPillarUnlockEvent: (pillarId: "zajtra" | "navzdy") => UnlockEvent;
export {};
//# sourceMappingURL=UnlockAnimations.d.ts.map