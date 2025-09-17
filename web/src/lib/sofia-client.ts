
// Sofia AI Client - Lightweight wrapper for dynamic imports
// This file can be dynamically imported to reduce bundle size if needed

import { sofiaAI } from './sofia-ai';

// Re-export the main Sofia AI instance
export { sofiaAI };

// Export types for external use
export type { SofiaContext, SofiaMessage } from './sofia-ai';

// Utility function for dynamic imports
export async function getSofiaAI() {
  // Dynamic import example (uncomment if needed for code splitting)
  // const { sofiaAI } = await import('./sofia-ai')
  return sofiaAI;
}

// Example usage with dynamic import:
// const { default: getSofiaAI } = await import('./sofia-client')
// const sofia = await getSofiaAI()
// const response = await sofia.generateResponse("Hello", context)
