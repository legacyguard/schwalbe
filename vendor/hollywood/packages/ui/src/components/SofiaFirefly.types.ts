
import type { SofiaMode } from '@legacyguard/logic';

export interface SofiaFireflyProps {
  isActive?: boolean;
  message?: string;
  mode?: SofiaMode;
  onInteraction?: () => void;
  startPosition?: { x: number; y: number };
}
