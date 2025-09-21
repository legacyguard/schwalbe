/**
 * Screen Reader Types - Shared TypeScript interfaces for screen reader accessibility
 * 
 * This file contains all the shared types used by both AdvancedScreenReaderSupport
 * and ScreenReaderAnalytics to avoid circular imports.
 */

// Core screen reader context interface
export interface ScreenReaderContext {
  id: string;
  type: 'navigation' | 'content' | 'interaction' | 'feedback' | 'error' | 'loading' | 'celebration' | 'instruction';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userIntent: 'informational' | 'navigational' | 'confirmational' | 'educational' | 'cautionary';
  emotionalTone: 'neutral' | 'positive' | 'encouraging' | 'urgent' | 'apologetic' | 'celebratory';
  complexity: 'simple' | 'moderate' | 'complex' | 'expert';
  contentType: 'text' | 'image' | 'interactive' | 'decorative' | 'structural' | 'live';
  userExpertise: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  previousInteractions?: number;
  userFrustration?: number; // 0-1 scale
}

// Screen reader description interface
export interface ScreenReaderDescription {
  id: string;
  context: ScreenReaderContext;
  shortDescription: string;
  longDescription: string;
  ariaLabel: string;
  ariaDescribedBy?: string;
  ariaDetails?: string;
  role: string;
  liveRegion?: 'off' | 'assertive' | 'polite';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  hidden?: boolean;
  expanded?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  pressed?: boolean;
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  invalid?: boolean;
  describedBy?: string[];
  labelledBy?: string[];
  controls?: string[];
  owns?: string[];
  flowTo?: string[];
  posInSet?: number;
  setSize?: number;
  level?: number;
  placeholder?: string;
  valueText?: string;
  autoComplete?: string;
  hasPopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  keyShortcuts?: string;
  orientation?: 'horizontal' | 'vertical';
  sort?: 'ascending' | 'descending' | 'other' | 'none';
  readOnly?: boolean;
  required?: boolean;
  valueMin?: number;
  valueMax?: number;
  valueNow?: number;
  colCount?: number;
  colIndex?: number;
  rowCount?: number;
  rowIndex?: number;
  rowSpan?: number;
  colSpan?: number;
}

// Screen reader announcement interface
export interface ScreenReaderAnnouncement {
  id: string;
  type: 'status' | 'alert' | 'progress' | 'completion' | 'error' | 'warning' | 'info' | 'success';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  politeness: 'assertive' | 'polite' | 'off';
  duration?: number;
  autoClose?: boolean;
  actions?: ScreenReaderAction[];
  context?: ScreenReaderContext;
  timestamp: number;
}

// Screen reader action interface
export interface ScreenReaderAction {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  type: 'button' | 'link' | 'menuitem' | 'tab' | 'treeitem' | 'option' | 'input' | 'select' | 'textarea';
  disabled?: boolean;
  checked?: boolean;
  expanded?: boolean;
  selected?: boolean;
  onAction: () => void;
}

// Cognitive accessibility interface
export interface CognitiveAccessibility {
  id: string;
  simplifiedLanguage: boolean;
  shortSentences: boolean;
  commonWords: boolean;
  clearStructure: boolean;
  reducedCognitiveLoad: boolean;
  breakComplexTasks: boolean;
  provideExamples: boolean;
  avoidJargon: boolean;
  consistentTerminology: boolean;
  logicalSequence: boolean;
  userControl: boolean;
  errorPrevention: boolean;
  clearFeedback: boolean;
  reversibleActions: boolean;
  predictableBehavior: boolean;
}
