// Minimal, stable public surface to avoid type collisions during 004 rollout
export * from './api-definitions';
export * from './services/legacyGarden';
export * from './services/textAnalyzer';
export * from './services/textManager';
export * from './utils/api-error-handler';
export * from './utils/api-versioning';
export * from './utils/date';

// Will engine (CZ/SK)
export * from './will/engine';
export * from './will/autoUpdate';

// Will business logic services
export {
  WillValidationService
} from './will/validation.service';
export type {
  ValidationResult as WillValidationResult
} from './will/validation.service';
export {
  WillService as WillBusinessService,
  willService as willBusinessService
} from './will/will.service';

// Output generation modules
export * from './output';

// Sofia AI types
export * from './sofia/sofia-types';

// i18n utilities
export * from './i18n/languages';
export * from './i18n/domains';
