import type { SupabaseClient } from '@supabase/supabase-js';
export declare function hasDeviceAccepted(tag: string): boolean;
export declare function markDeviceConsentAccepted(tag: string): void;
export declare function ensureConsentRow(supabase: SupabaseClient, forceUpdate?: boolean): Promise<boolean>;
//# sourceMappingURL=consent.service.d.ts.map