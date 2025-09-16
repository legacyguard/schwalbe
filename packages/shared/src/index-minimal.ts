// Minimal exports for Dead Man Switch functionality
// Emergency system types and services

export { EmergencyService } from './services/emergency.service';
export * from './types/emergency';
export * from './supabase/client';

// Minimal config exports helpful for UI wiring
export * from './config/domains';
export * from './config/languages';
export * from './config/billing';

// Reminders (exposed for web UI)
export * from './services/reminders/reminder.service';

// Subscriptions (exposed for web UI)
export * from './services/subscription.service';

// Sharing service (exposed for web UI)
export { sharingService, SharingService } from './services/sharing/sharing.service';
