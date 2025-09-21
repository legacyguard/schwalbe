#!/usr/bin/env tsx
/**
 * JSON File Validator
 * Validates all JSON files in the docs/Will/JSON directory for proper syntax and structure
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  error?: string;
  file: string;
  lines: number;
  size: number;
  valid: boolean;
}

class JSONValidator {
  private results: ValidationResult[] = [];

  async validateDirectory(dirPath: string): Promise<ValidationResult[]> {
    console.log(`🔍 Validating JSON files in: ${dirPath}\n`);

    if (!fs.existsSync(dirPath)) {
      console.error(`❌ Directory not found: ${dirPath}`);
      return [];
    }

    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const result = await this.validateFile(filePath);
      this.results.push(result);

      if (result.valid) {
        console.log(`✅ ${file}: Valid JSON (${result.lines} lines, ${result.size} bytes)`);
      } else {
        console.log(`❌ ${file}: Invalid JSON`);
        console.log(`   Error: ${result.error}`);
      }
    }

    this.printSummary();
    return this.results;
  }

  private async validateFile(filePath: string): Promise<ValidationResult> {
    const fileName = path.basename(filePath);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      const size = Buffer.byteLength(content, 'utf8');

      // Try to parse JSON
      JSON.parse(content);

      return {
        file: fileName,
        valid: true,
        size,
        lines,
      };
    } catch (error) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').length;
      const size = Buffer.byteLength(content, 'utf8');

      return {
        file: fileName,
        valid: false,
        error: error instanceof Error ? error.message : String(error),
        size,
        lines,
      };
    }
  }

  private printSummary(): void {
    console.log('\n📊 Validation Summary:');
    console.log('='.repeat(50));

    const validFiles = this.results.filter(r => r.valid);
    const invalidFiles = this.results.filter(r => !r.valid);

    console.log(`Total files: ${this.results.length}`);
    console.log(`Valid files: ${validFiles.length}`);
    console.log(`Invalid files: ${invalidFiles.length}`);

    if (invalidFiles.length > 0) {
      console.log('\n❌ Invalid files:');
      invalidFiles.forEach(result => {
        console.log(`  - ${result.file}: ${result.error}`);
      });
    }

    if (validFiles.length > 0) {
      const totalLines = validFiles.reduce((sum, r) => sum + r.lines, 0);
      const totalSize = validFiles.reduce((sum, r) => sum + r.size, 0);
      const avgLines = Math.round(totalLines / validFiles.length);

      console.log('\n📈 Statistics for valid files:');
      console.log(`  Total lines: ${totalLines}`);
      console.log(`  Total size: ${(totalSize / 1024).toFixed(1)} KB`);
      console.log(`  Average lines per file: ${avgLines}`);

      const largeFiles = validFiles.filter(r => r.lines > 500);
      if (largeFiles.length > 0) {
        console.log('\n⚠️  Large files (>500 lines):');
        largeFiles.forEach(result => {
          console.log(`  - ${result.file}: ${result.lines} lines`);
        });
      }
    }

    console.log('\n' + '='.repeat(50));
  }
}

async function main() {
  const validator = new JSONValidator();
  const docsDir = path.join(process.cwd(), 'docs', 'Will', 'JSON');

  const results = await validator.validateDirectory(docsDir);

  // Exit with error code if any files are invalid
  const hasErrors = results.some(r => !r.valid);
  if (hasErrors) {
    console.log('\n❌ Some JSON files are invalid. Please fix them before proceeding.');
    process.exit(1);
  } else {
    console.log('\n✅ All JSON files are valid!');
    process.exit(0);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}

export { JSONValidator };
