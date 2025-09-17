#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function fixConsoleStatements() {
  // Find all TypeScript and JavaScript files
  const files = await glob('**/*.{ts,tsx,js,jsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**', 'scripts/**'],
    cwd: process.cwd()
  });

  let filesModified = 0;
  let statementsFixed = 0;

  for (const file of files) {
    const filePath = path.join(process.cwd(), file);
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace console.log with console.error in development/debug contexts
    // But remove them in production code
    if (file.includes('test') || file.includes('spec') || file.includes('__tests__')) {
      // In test files, keep console statements but convert to console.error
      content = content.replace(/console\.log\(/g, 'console.error(');
    } else if (file.includes('debug') || file.includes('dev')) {
      // In debug/dev files, convert to console.error
      content = content.replace(/console\.log\(/g, 'console.error(');
    } else {
      // In production code, comment out console.log statements
      // But keep console.error and console.warn
      content = content.replace(/^(\s*)console\.log\(/gm, '$1// console.log(');
    }
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      filesModified++;
      const matches = (originalContent.match(/console\.log\(/g) || []).length;
      statementsFixed += matches;
      console.log(`✅ Fixed ${matches} console statements in: ${file}`);
    }
  }

  console.log(`\n📊 Summary: Fixed ${statementsFixed} console statements in ${filesModified} files`);
}

fixConsoleStatements().catch(console.error);
