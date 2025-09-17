#!/usr/bin/env node
/**
 * Script to replace all console.* calls with structured logger
 * Run: npx tsx scripts/replace-console-logs.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDED_DIRS = ['node_modules', '.git', 'dist', 'build', '.next', '.turbo'];
const EXCLUDED_FILES = ['logger.ts', 'logger.js', 'replace-console-logs.ts'];

interface Replacement {
  pattern: RegExp;
  replacement: string;
  importNeeded: string;
}

const replacements: Replacement[] = [
  {
    pattern: /console\.log\s*\(/g,
    replacement: 'logger.info(',
    importNeeded: 'info'
  },
  {
    pattern: /console\.debug\s*\(/g,
    replacement: 'logger.debug(',
    importNeeded: 'debug'
  },
  {
    pattern: /console\.info\s*\(/g,
    replacement: 'logger.info(',
    importNeeded: 'info'
  },
  {
    pattern: /console\.warn\s*\(/g,
    replacement: 'logger.warn(',
    importNeeded: 'warn'
  },
  {
    pattern: /console\.error\s*\(/g,
    replacement: 'logger.error(',
    importNeeded: 'error'
  }
];

function shouldProcessFile(filePath: string): boolean {
  const ext = path.extname(filePath);
  const basename = path.basename(filePath);
  
  return EXTENSIONS.includes(ext) && !EXCLUDED_FILES.includes(basename);
}

function shouldProcessDirectory(dirPath: string): boolean {
  const dirname = path.basename(dirPath);
  return !EXCLUDED_DIRS.includes(dirname);
}

function getImportPath(fromFile: string): string {
  const fromDir = path.dirname(fromFile);
  const loggerPath = path.join(__dirname, '../packages/shared/src/lib/logger');
  
  // Calculate relative path
  let relativePath = path.relative(fromDir, loggerPath);
  
  // Ensure it starts with ./ or ../
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  // For packages, use the package name
  if (fromFile.includes('/packages/') && !fromFile.includes('/packages/shared/')) {
    return '@schwalbe/shared/lib/logger';
  }
  
  // For apps, use the package name
  if (fromFile.includes('/apps/')) {
    return '@schwalbe/shared/lib/logger';
  }
  
  return relativePath.replace(/\\/g, '/');
}

function processFile(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let modified = false;
  const neededImports = new Set<string>();

  // Apply replacements
  for (const { pattern, replacement, importNeeded } of replacements) {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      neededImports.add(importNeeded);
      modified = true;
    }
  }

  if (!modified) {
    return false;
  }

  // Add import statement if not present
  const importPath = getImportPath(filePath);
  const importStatement = `import { logger } from '${importPath}';`;
  
  // Check if logger is already imported
  if (!content.includes("from '@schwalbe/shared/lib/logger'") && 
      !content.includes('from "@schwalbe/shared/lib/logger"') &&
      !content.includes(`from '${importPath}'`) &&
      !content.includes(`from "${importPath}"`)) {
    
    // Find the right place to add the import
    const importRegex = /^import\s+.*?;?\s*$/m;
    const match = content.match(importRegex);
    
    if (match) {
      // Add after the last import
      const lastImportIndex = content.lastIndexOf(match[0]) + match[0].length;
      content = content.slice(0, lastImportIndex) + '\n' + importStatement + content.slice(lastImportIndex);
    } else {
      // Add at the beginning of the file
      content = importStatement + '\n\n' + content;
    }
  }

  // Write back the modified content
  fs.writeFileSync(filePath, content, 'utf8');
  
  console.log(`✅ Processed: ${filePath}`);
  return true;
}

function processDirectory(dirPath: string): { processed: number; total: number } {
  let processed = 0;
  let total = 0;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory() && shouldProcessDirectory(fullPath)) {
      const result = processDirectory(fullPath);
      processed += result.processed;
      total += result.total;
    } else if (entry.isFile() && shouldProcessFile(fullPath)) {
      total++;
      if (processFile(fullPath)) {
        processed++;
      }
    }
  }

  return { processed, total };
}

function main() {
  console.log('🔍 Scanning for console.* calls...\n');

  const directories = [
    path.join(__dirname, '../apps'),
    path.join(__dirname, '../packages')
  ];

  let totalProcessed = 0;
  let totalFiles = 0;

  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Processing directory: ${dir}`);
      const result = processDirectory(dir);
      totalProcessed += result.processed;
      totalFiles += result.total;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`Total files scanned: ${totalFiles}`);
  console.log(`Files modified: ${totalProcessed}`);
  console.log('\n✨ Console.* replacement complete!');
  
  if (totalProcessed > 0) {
    console.log('\n⚠️  Please review the changes and ensure the logger import paths are correct.');
    console.log('💡 You may need to run "npm install" in affected packages.');
  }
}

// Run the script
main();