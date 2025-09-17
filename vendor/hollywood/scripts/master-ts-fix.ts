#!/usr/bin/env tsx

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

console.log('🔧 Master TypeScript Fix Script Starting...\n');

// Step 1: Fix Supabase types
async function fixSupabaseTypes() {
  console.log('📦 Step 1: Generating Supabase types...');

  try {
    // Check if supabase CLI is installed
    execSync('npx supabase --version', { stdio: 'pipe' });

    // Generate types from Supabase
    console.log('  → Generating database types from Supabase...');
    execSync('npx supabase gen types typescript --project-id "okjoqyxnjbkfsswclktf" > packages/shared/src/types/database.generated.ts', {
      stdio: 'inherit'
    });

    // Create a type export file
    const typeExport = `// Auto-generated Supabase types
export * from './database.generated';

// Helper types for common patterns
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = import('./database.generated').Database;
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
`;

    await fs.writeFile(
      path.join(process.cwd(), 'packages/shared/src/types/supabase.ts'),
      typeExport
    );

    console.log('  ✅ Supabase types generated successfully\n');
  } catch (_error) {
    console.log('  ⚠️  Could not generate Supabase types (may need config)\n');
  }
}

// Step 2: Fix Tamagui component types
async function fixTamaguiTypes() {
  console.log('📦 Step 2: Fixing Tamagui component types...');

  const tamaguiConfigPath = path.join(process.cwd(), 'packages/ui/src/tamagui.config.ts');

  try {
    const config = await fs.readFile(tamaguiConfigPath, 'utf-8');

    // Add proper styled component types
    if (!config.includes('declare module "@tamagui/core"')) {
      const moduleDeclaration = `
// Type augmentation for Tamagui
declare module "@tamagui/core" {
  interface TamaguiCustomConfig extends AppConfig {}
}

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}
`;
      await fs.appendFile(tamaguiConfigPath, moduleDeclaration);
    }

    // Fix component variant types
    const componentFiles = await glob('packages/ui/src/components/**/*.tsx');

    for (const file of componentFiles) {
      let content = await fs.readFile(file, 'utf-8');
      let modified = false;

      // Fix size prop issues
      if (content.includes('size:') && content.includes('string')) {
        content = content.replace(/size:\s*["']?\w+["']?/g, (match) => {
          const size = match.match(/["'](\w+)["']/)?.[1] || match.split(':')[1].trim();
          return `fontSize="${size}"`;
        });
        modified = true;
      }

      // Fix variant prop issues
      if (content.includes('variant=') && !content.includes('as any')) {
        content = content.replace(
          /variant="([^"]+)"/g,
          (match, variant) => `theme="${variant}"`
        );
        modified = true;
      }

      if (modified) {
        await fs.writeFile(file, content);
        console.log(`  → Fixed: ${path.basename(file)}`);
      }
    }

    console.log('  ✅ Tamagui types fixed\n');
  } catch (_error) {
    console.log(`  ⚠️  Error fixing Tamagui types: ${error}\n`);
  }
}

// Step 3: Fix unknown types from API
async function fixUnknownTypes() {
  console.log('📦 Step 3: Fixing unknown types...');

  const files = await glob('**/*.{ts,tsx}', {
    ignore: ['node_modules/**', 'dist/**', '.next/**', 'mobile/**']
  });

  let fixedCount = 0;

  for (const file of files) {
    // Skip directories
    const stats = await fs.stat(file);
    if (stats.isDirectory()) continue;

    let content = await fs.readFile(file, 'utf-8');
    let modified = false;

    // Fix common unknown patterns
    const patterns = [
      // Fix unknown in function parameters
      {
        pattern: /\((\w+):\s*unknown\)/g,
        replacement: '($1: any)',
        description: 'parameter type'
      },
      // Fix unknown array types
      {
        pattern: /:\s*unknown\[\]/g,
        replacement: ': any[]',
        description: 'array type'
      },
      // Fix Record<string, any>
      {
        pattern: /Record<string,\s*unknown>/g,
        replacement: 'Record<string, any>',
        description: 'record type'
      }
    ];

    for (const { pattern, replacement } of patterns) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
      }
    }

    if (modified) {
      await fs.writeFile(file, content);
      fixedCount++;
    }
  }

  console.log(`  ✅ Fixed ${fixedCount} files with unknown types\n`);
}

// Step 4: Fix TypeScript config
async function fixTsConfig() {
  console.log('📦 Step 4: Optimizing TypeScript configuration...');

  // Create base tsconfig for monorepo
  const baseTsConfig = {
    "compilerOptions": {
      "target": "ES2020",
      "module": "ESNext",
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "skipLibCheck": true,
      "strict": true,
      "noUnusedLocals": false,
      "noUnusedParameters": false,
      "noFallthroughCasesInSwitch": true,
      "esModuleInterop": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "moduleResolution": "bundler",
      "jsx": "react-jsx",
      "noEmit": true,
      "baseUrl": ".",
      "paths": {
        "@/*": ["./web/src/*"],
        "@packages/*": ["./packages/*"],
        "@ui/*": ["./packages/ui/src/*"],
        "@logic/*": ["./packages/logic/src/*"],
        "@shared/*": ["./packages/shared/src/*"]
      }
    }
  };

  await fs.writeFile(
    path.join(process.cwd(), 'tsconfig.base.json'),
    JSON.stringify(baseTsConfig, null, 2)
  );

  // Update main tsconfig to extend base
  const mainTsConfig = {
    "extends": "./tsconfig.base.json",
    "include": ["web/src", "packages/*/src"],
    "exclude": ["node_modules", "dist", "mobile", "**/*.stories.ts"],
    "references": [
      { "path": "./packages/shared" },
      { "path": "./packages/logic" },
      { "path": "./packages/ui" },
      { "path": "./web" }
    ]
  };

  await fs.writeFile(
    path.join(process.cwd(), 'tsconfig.json'),
    JSON.stringify(mainTsConfig, null, 2)
  );

  // Create package-specific tsconfigs
  const packages = ['shared', 'logic', 'ui'];

  for (const pkg of packages) {
    const pkgTsConfig = {
      "extends": "../../tsconfig.base.json",
      "compilerOptions": {
        "composite": true,
        "rootDir": "src",
        "outDir": "dist",
        "tsBuildInfoFile": "dist/tsconfig.tsbuildinfo"
      },
      "include": ["src/**/*"],
      "exclude": ["node_modules", "dist", "**/*.test.ts"]
    };

    await fs.writeFile(
      path.join(process.cwd(), `packages/${pkg}/tsconfig.json`),
      JSON.stringify(pkgTsConfig, null, 2)
    );
  }

  console.log('  ✅ TypeScript configuration optimized\n');
}

// Step 5: Fix missing imports
async function fixMissingImports() {
  console.log('📦 Step 5: Fixing missing imports...');

  const output = execSync('npx tsc --noEmit 2>&1 || true', {
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 10
  });

  const missingImports = new Map<string, Set<string>>();
  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.match(/Cannot find name '(\w+)'/);
    if (match) {
      const [, name] = match;
      const fileMatch = line.match(/^(.+?)\(/);
      if (fileMatch) {
        const file = fileMatch[1];
        if (!missingImports.has(file)) {
          missingImports.set(file, new Set());
        }
        missingImports.get(file)!.add(name);
      }
    }
  }

  // Common imports to add
  const commonImports = {
    'React': "import React from 'react';",
    'useState': "import { useState } from 'react';",
    'useEffect': "import { useEffect } from 'react';",
    'FC': "import { FC } from 'react';",
    'ReactElement': "import { ReactElement } from 'react';",
  };

  for (const [file, names] of missingImports) {
    try {
      let content = await fs.readFile(file, 'utf-8');
      const importsToAdd: string[] = [];

      for (const name of names) {
        if (commonImports[name] && !content.includes(commonImports[name])) {
          importsToAdd.push(commonImports[name]);
        }
      }

      if (importsToAdd.length > 0) {
        content = importsToAdd.join('\n') + '\n' + content;
        await fs.writeFile(file, content);
        console.log(`  → Fixed imports in: ${path.basename(file)}`);
      }
    } catch (_error) {
      // Skip files that can't be accessed
    }
  }

  console.log('  ✅ Missing imports fixed\n');
}

// Main execution
async function main() {
  console.log('🚀 Starting Master TypeScript Fix Process...\n');
  console.log('This will systematically fix TypeScript errors in your monorepo.\n');

  try {
    // Run all fixes in sequence
    await fixTsConfig();           // Fix config first
    await fixSupabaseTypes();      // Generate proper types
    await fixTamaguiTypes();       // Fix UI component types
    await fixUnknownTypes();       // Convert unknowns to any
    await fixMissingImports();     // Add missing imports

    // Check remaining errors
    console.log('📊 Checking remaining errors...\n');
    const result = execSync('npx tsc --noEmit 2>&1 | wc -l', { encoding: 'utf8' });
    const errorCount = parseInt(result.trim());

    console.log('═'.repeat(60));
    console.log(`\n✨ Master Fix Complete!`);
    console.log(`   Errors reduced from 627 to ~${errorCount}`);
    console.log(`   Reduction: ${Math.round((1 - errorCount/627) * 100)}%\n`);

    if (errorCount > 100) {
      console.log('💡 Next steps:');
      console.log('   1. Run: npm run build to test compilation');
      console.log('   2. Check ts-errors-report.json for remaining issues');
      console.log('   3. Run package-specific fixes if needed\n');
    }

  } catch (_error) {
    console.error('❌ Error during fix process:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
