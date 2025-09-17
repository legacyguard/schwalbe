#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function removeNoCheck() {
  // Find all TypeScript files
  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', 'build/**', '.next/**'],
    cwd: process.cwd()
  });

  let filesModified = 0;

  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file starts with @ts-nocheck
    if (content.startsWith('// @ts-nocheck\n')) {
      // Remove the @ts-nocheck line
      const newContent = content.replace(/^\/\/ @ts-nocheck\n/, '');
      fs.writeFileSync(filePath, newContent);
      filesModified++;
      console.log(`✅ Removed @ts-nocheck from: ${file}`);
    }
  });

  console.log(`\n📊 Summary: Removed @ts-nocheck from ${filesModified} files`);
}

removeNoCheck().catch(console.error);
