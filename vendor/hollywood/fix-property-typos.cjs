#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const fixes = [
  { file: 'web/src/lib/emergency/emergency-service.ts', line: 38, propertyName: '__baseUrl', correctName: '___baseUrl' },
  { file: 'web/src/lib/emergency/emergency-service.ts', line: 116, propertyName: '__isInitialized', correctName: '___isInitialized' },
  { file: 'web/src/lib/emergency/guardian-notifier.ts', line: 42, propertyName: '__emailService', correctName: '___emailService' },
  { file: 'web/src/lib/emergency/guardian-notifier.ts', line: 43, propertyName: '__smsService', correctName: '___smsService' },
  { file: 'web/src/lib/enterprise/apiEcosystem.ts', line: 1194, propertyName: '__developerPortal', correctName: '___developerPortal' },
  { file: 'web/src/lib/professional-review-network.ts', line: 133, propertyName: '__apiKey', correctName: '___apiKey' },
  { file: 'web/src/lib/professional/email-notification-service.ts', line: 36, propertyName: '__apiKey', correctName: '___apiKey' },
  { file: 'web/src/lib/security/env-config.ts', line: 107, propertyName: '__validationErrors', correctName: '___validationErrors' },
  { file: 'web/src/lib/sofia-memory.ts', line: 32, propertyName: '__userId', correctName: '___userId' },
  { file: 'web/src/lib/sofia-proactive.ts', line: 79, propertyName: '__interventionCallback', correctName: '___interventionCallback' },
  { file: 'web/src/services/ocrService.ts', line: 68, propertyName: '__projectId', correctName: '___projectId' },
];

function fixPropertyTypos() {
  for (const fix of fixes) {
    const filePath = path.resolve(fix.file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }
    
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Fix the specific line
    if (lines[fix.line - 1]) {
      const originalLine = lines[fix.line - 1];
      const fixedLine = originalLine.replace(fix.propertyName, fix.correctName);
      
      if (originalLine !== fixedLine) {
        lines[fix.line - 1] = fixedLine;
        console.log(`Fixed ${fix.file}:${fix.line} - ${fix.propertyName} → ${fix.correctName}`);
        
        // Write back the fixed content
        fs.writeFileSync(filePath, lines.join('\n'));
      } else {
        console.log(`No change needed for ${fix.file}:${fix.line}`);
      }
    }
  }
}

console.log('Fixing property name typos...');
fixPropertyTypos();
console.log('Done!');
