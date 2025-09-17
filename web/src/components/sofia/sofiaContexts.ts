
import React from 'react';
import type { AdaptivePersonalityManager } from '@/lib/sofia-personality';

// Context for personality manager
export const PersonalityManagerContext =
  React.createContext<AdaptivePersonalityManager | null>(null);
