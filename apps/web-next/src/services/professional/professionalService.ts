/**
 * Professional Service Implementation
 * 
 * Imports the base professional service from shared package and configures it with
 * environment-specific settings.
 */

import { ProfessionalService, createProfessionalService } from '@schwalbe/shared/services/professional/professionalService';
import { createServerComponentClient } from '@/lib/supabase-client';

// Create a new instance with server-side configuration
export const professionalService = createProfessionalService({
  auth: {
    getUser: async () => {
      const supabase = createServerComponentClient();
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  }
});

// Re-export types
export type { ProfessionalService };