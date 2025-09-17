#!/usr/bin/env tsx

/**
 * Script to fix TypeScript strict mode issues by replacing 'as any' with proper types
 */

import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import * as path from 'path';

interface FixOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

class TypeScriptStrictFixer {
  private fixes: Array<{
    file: string;
    line: number;
    original: string;
    replacement: string;
  }> = [];

  async fixFile(filePath: string, content: string): Promise<string> {
    let modifiedContent = content;
    let lineNumber = 1;

    // Common patterns to fix
    const patterns = [
      // Icon name assertions
      {
        regex: /name=\{('[^']+' as any)\}/g,
        replacement: (match: string, iconName: string) => {
          const cleanIconName = iconName.replace(/ as any/, '').replace(/['{}]/g, '');
          return `name="${cleanIconName}"`;
        }
      },
      // Variant assertions
      {
        regex: /variant=\{('[^']+' as any)\}/g,
        replacement: (match: string, variant: string) => {
          const cleanVariant = variant.replace(/ as any/, '').replace(/['{}]/g, '');
          return `variant="${cleanVariant}"`;
        }
      },
      // Size assertions
      {
        regex: /size=\{('[^']+' as any)\}/g,
        replacement: (match: string, size: string) => {
          const cleanSize = size.replace(/ as any/, '').replace(/['{}]/g, '');
          return `size="${cleanSize}"`;
        }
      },
      // Color assertions
      {
        regex: /color=\{('[^']+' as any)\}/g,
        replacement: (match: string, color: string) => {
          const cleanColor = color.replace(/ as any/, '').replace(/['{}]/g, '');
          return `color="${cleanColor}"`;
        }
      }
    ];

    for (const pattern of patterns) {
      modifiedContent = modifiedContent.replace(pattern.regex, pattern.replacement);
    }

    return modifiedContent;
  }

  async processFiles(pattern: string, options: FixOptions = {}): Promise<void> {
    const files = await glob(pattern, { ignore: ['node_modules/**', 'dist/**'] });
    
    console.log(`Processing ${files.length} files...`);

    for (const file of files) {
      try {
        const content = await readFile(file, 'utf-8');
        const fixedContent = await this.fixFile(file, content);
        
        if (content !== fixedContent) {
          if (options.dryRun) {
            console.log(`Would fix: ${file}`);
          } else {
            await writeFile(file, fixedContent, 'utf-8');
            console.log(`Fixed: ${file}`);
          }
        }
      } catch (error) {
        console.error(`Error processing ${file}:`, error);
      }
    }
  }
}

// Run the fixer
async function main() {
  const fixer = new TypeScriptStrictFixer();
  
  console.log('🔧 Fixing TypeScript strict mode issues...');
  
  // Process TypeScript files
  await fixer.processFiles('web/src/**/*.{ts,tsx}', { 
    dryRun: false, 
    verbose: true 
  });
  
  console.log('✅ TypeScript strict mode fixes completed!');
}

// Run the script
main().catch(console.error);

export { TypeScriptStrictFixer };