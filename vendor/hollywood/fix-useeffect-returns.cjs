#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filesToFix = [
  'web/src/components/features/MagicalDocumentUpload.tsx',
  'web/src/components/marketing/FeatureAnnouncement.tsx',
  'web/src/components/milestones/MilestoneCelebration.tsx',
  'web/src/components/onboarding/OnboardingTooltips.tsx',
  'web/src/components/ui/optimized-image.tsx',
  'web/src/hooks/encryption/useEncryption.tsx',
  'web/src/hooks/usePerformanceMonitoring.ts',
  'web/src/lib/performance/mobile-optimization.tsx',
  'web/src/pages/onboarding/Scene3Key.tsx',
];

function fixUseEffectReturns() {
  for (const file of filesToFix) {
    const filePath = path.resolve(file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    
    // Pattern to find useEffect/useCallback without explicit return
    // This looks for patterns where there might be missing returns
    
    // For useEffect specifically
    content = content.replace(
      /(\buseEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?)(\n\s*\}\s*,)/g,
      (match, body, ending) => {
        // Check if there's already a return statement at the end
        const trimmedBody = body.trim();
        const lines = trimmedBody.split('\n');
        const lastLine = lines[lines.length - 1].trim();
        
        // If the last meaningful line isn't a return statement
        if (!lastLine.startsWith('return') && !lastLine.includes('return ')) {
          // Check if there's any return statement in the body
          if (!body.includes('return ')) {
            // Add return undefined before the closing brace
            modified = true;
            return body + '\n    return undefined;' + ending;
          }
        }
        return match;
      }
    );
    
    // For useCallback specifically
    content = content.replace(
      /(\buseCallback\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?)(\n\s*\}\s*,)/g,
      (match, body, ending) => {
        // Check if there's already a return statement at the end
        const trimmedBody = body.trim();
        const lines = trimmedBody.split('\n');
        const lastLine = lines[lines.length - 1].trim();
        
        // If the last meaningful line isn't a return statement
        if (!lastLine.startsWith('return') && !lastLine.includes('return ')) {
          // Check if there's any return statement in the body
          if (!body.includes('return ')) {
            // Add return undefined before the closing brace
            modified = true;
            return body + '\n    return undefined;' + ending;
          }
        }
        return match;
      }
    );
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed ${file}`);
    } else {
      console.log(`No changes needed for ${file}`);
    }
  }
}

console.log('Fixing missing return statements in useEffect/useCallback...');
fixUseEffectReturns();
console.log('Done!');
