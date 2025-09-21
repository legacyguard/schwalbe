#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'web/src/components/features/MagicalDocumentUpload.tsx',
    line: 491,  // Before the last closing brace of useEffect
    insertBefore: '    }',
    insert: '    return undefined;'
  },
  {
    file: 'web/src/components/marketing/FeatureAnnouncement.tsx',
    searchPattern: /useEffect\(\(\) => \{[\s\S]*?\n  \}, \[/,
    fixFunction: (match) => {
      // Add return undefined before the closing brace
      const lines = match.split('\n');
      const lastLine = lines[lines.length - 1];
      lines.splice(lines.length - 1, 0, '    return undefined;');
      return lines.join('\n');
    }
  }
];

function fixFile(filePath, lineNumber, insertBefore, insertText) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Find the line that matches insertBefore
  if (lines[lineNumber - 1] && lines[lineNumber - 1].trim() === insertBefore.trim()) {
    // Insert the new line before this line
    lines.splice(lineNumber - 1, 0, insertText);
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Fixed ${filePath} at line ${lineNumber}`);
    return true;
  }
  
  return false;
}

// Manual approach - let me directly edit the problematic files
const filesToFix = [
  {
    file: 'web/src/components/features/MagicalDocumentUpload.tsx',
    lineToFind: '  }, [isDragOver]);',
    insertBefore: true,
    textToInsert: '    return undefined;'
  },
  {
    file: 'web/src/components/marketing/FeatureAnnouncement.tsx',
    lineNumber: 163,
    textToInsert: '    return undefined;'
  },
  {
    file: 'web/src/components/milestones/MilestoneCelebration.tsx',
    lineNumber: 63,
    textToInsert: '    return undefined;'
  },
  {
    file: 'web/src/components/onboarding/OnboardingTooltips.tsx',
    lineNumber: 158,
    textToInsert: '    return undefined;'
  },
  {
    file: 'web/src/components/ui/optimized-image.tsx',
    lineNumber: 102,
    textToInsert: '    return undefined;'
  },
  {
    file: 'web/src/hooks/encryption/useEncryption.tsx',
    lineNumbers: [81, 378],
    textToInsert: '    return undefined;'
  },
  {
    file: 'web/src/lib/performance/mobile-optimization.tsx',
    lineNumber: 249,
    textToInsert: '    return undefined;'
  },
  {
    file: 'web/src/pages/onboarding/Scene3Key.tsx',
    lineNumber: 36,
    textToInsert: '    return undefined;'
  }
];

// For useCallback in usePerformanceMonitoring.ts
const callbackFixes = [
  {
    file: 'web/src/hooks/usePerformanceMonitoring.ts',
    lineNumbers: [41, 57, 77, 95, 111],
    textToInsert: '    return undefined;'
  }
];

function applyFixes() {
  // Fix useEffect issues
  for (const fix of filesToFix) {
    const filePath = path.resolve(fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    if (fix.lineNumbers) {
      // Multiple lines to fix in the same file
      let offset = 0;
      for (const lineNum of fix.lineNumbers) {
        lines.splice(lineNum - 1 + offset, 0, fix.textToInsert);
        offset++;
      }
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`Fixed ${fix.file} at lines ${fix.lineNumbers.join(', ')}`);
    } else if (fix.lineNumber) {
      // Single line to fix
      lines.splice(fix.lineNumber - 1, 0, fix.textToInsert);
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`Fixed ${fix.file} at line ${fix.lineNumber}`);
    } else if (fix.lineToFind) {
      // Find the line and insert before it
      const index = lines.findIndex(line => line.includes(fix.lineToFind));
      if (index !== -1) {
        lines.splice(index, 0, fix.textToInsert);
        fs.writeFileSync(filePath, lines.join('\n'));
        console.log(`Fixed ${fix.file} before line containing "${fix.lineToFind}"`);
      }
    }
  }
  
  // Fix useCallback issues
  for (const fix of callbackFixes) {
    const filePath = path.resolve(fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let offset = 0;
    for (const lineNum of fix.lineNumbers) {
      lines.splice(lineNum - 1 + offset, 0, fix.textToInsert);
      offset++;
    }
    
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Fixed ${fix.file} at lines ${fix.lineNumbers.join(', ')}`);
  }
}

console.log('Fixing useEffect/useCallback return statements...');
applyFixes();
console.log('Done!');
