#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix Scene3Key.tsx - add return undefined in else branch
function fixScene3Key() {
  const filePath = path.resolve('web/src/pages/onboarding/Scene3Key.tsx');
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Find the useEffect on line 27-33
  for (let i = 26; i < 33; i++) {
    if (lines[i] && lines[i].includes('}, [name]);')) {
      // Insert return undefined before the closing brace
      lines.splice(i, 0, '    return undefined;');
      break;
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log('Fixed Scene3Key.tsx');
}

// Fix other useEffect files
function fixOtherFiles() {
  const filesToFix = [
    { 
      file: 'web/src/components/marketing/FeatureAnnouncement.tsx',
      searchLine: '  }, []) // Only run on mount',
      insertBefore: true 
    },
    {
      file: 'web/src/components/milestones/MilestoneCelebration.tsx',
      searchLine: '  }, []);',
      insertBefore: true
    },
    {
      file: 'web/src/components/onboarding/OnboardingTooltips.tsx',
      searchLine: '  }, [currentStep, isOnboardingActive]);',
      insertBefore: true
    },
    {
      file: 'web/src/components/ui/optimized-image.tsx',
      searchLine: '  }, [src, placeholder, fallback, priority]);',
      insertBefore: true
    },
    {
      file: 'web/src/hooks/encryption/useEncryption.tsx',
      searchLines: [
        '  }, [user?.id]);',
        '  }, [decryptionKeys]);'
      ],
      insertBefore: true
    },
    {
      file: 'web/src/lib/performance/mobile-optimization.tsx',
      searchLine: '  }, []);',
      insertBefore: true
    }
  ];
  
  for (const fix of filesToFix) {
    const filePath = path.resolve(fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (fix.searchLines) {
      // Multiple lines to fix
      for (const searchLine of fix.searchLines) {
        content = content.replace(searchLine, `    return undefined;\n${searchLine}`);
      }
    } else if (fix.searchLine) {
      // Single line to fix
      content = content.replace(fix.searchLine, `    return undefined;\n${fix.searchLine}`);
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${fix.file}`);
  }
}

// Fix OnboardingTooltips.tsx null checks
function fixOnboardingTooltips() {
  const filePath = path.resolve('web/src/components/onboarding/OnboardingTooltips.tsx');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix targetElement null checks
  content = content.replace(
    'targetElement.scrollIntoView({ behavior: \'smooth\', block: \'center\' });',
    'targetElement?.scrollIntoView({ behavior: \'smooth\', block: \'center\' });'
  );
  
  content = content.replace(
    'targetElement.classList.remove(\'onboarding-highlight\');',
    'targetElement?.classList.remove(\'onboarding-highlight\');'
  );
  
  // Fix createPopper call with null check
  content = content.replace(
    '          createPopper(\n            targetElement,\n            currentStep.position',
    '          if (targetElement) {\n            createPopper(\n              targetElement,\n              currentStep?.position || \'bottom\''
  );
  
  // Close the if block
  content = content.replace(
    '          );\n        }\n      }, 100);',
    '            );\n          }\n        }\n      }, 100);'
  );
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed OnboardingTooltips.tsx null checks');
}

console.log('Fixing remaining useEffect issues...');
fixScene3Key();
fixOtherFiles();
fixOnboardingTooltips();
console.log('Done!');
