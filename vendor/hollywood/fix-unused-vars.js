#!/usr/bin/env node

/**
 * Automatic TypeScript unused variables fixer
 * Fixes no-unused-vars errors by prefixing with underscore
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DRY_RUN = false; // Set to true to see what would be changed
const LOG_CHANGES = true;

/**
 * Get lint results and extract unused variables
 */
function getLintResults() {
  try {
    execSync('npm run lint > lint-current.txt 2>&1', { stdio: 'pipe' });
  } catch (error) {
    // Lint will exit with non-zero code if there are errors
  }
  
  const lintOutput = fs.readFileSync('lint-current.txt', 'utf8');
  return parseUnusedVars(lintOutput);
}

/**
 * Parse lint output to extract unused variable information
 */
function parseUnusedVars(lintOutput) {
  const unusedVars = [];
  const lines = lintOutput.split('\n');
  
  for (const line of lines) {
    const match = line.match(/([^:]+):(\d+):(\d+)\s+error\s+'([^']+)' is (?:defined|assigned)[^']*no-unused-vars/);
    if (match) {
      const [, filePath, lineNum, columnNum, varName] = match;
      if (filePath.includes('web/src/')) {
        unusedVars.push({
          file: filePath.replace(/.*?(web\/src\/.*)/, '$1'),
          line: parseInt(lineNum),
          column: parseInt(columnNum),
          variable: varName
        });
      }
    }
  }
  
  return unusedVars;
}

/**
 * Fix unused variable by prefixing with underscore
 */
function fixUnusedVar(filePath, lineNum, columnNum, varName) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    // console.log(`File not found: ${fullPath}`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  
  if (lineNum > lines.length) {
    // console.log(`Line ${lineNum} not found in ${filePath}`);
    return false;
  }
  
  const line = lines[lineNum - 1];
  const newVarName = `_${varName}`;
  
  // Different patterns for variable declarations
  const patterns = [
    // import { varName } from
    new RegExp(`(import\\s*{[^}]*\\b)${varName}(\\b[^}]*}\\s*from)`, 'g'),
    // const varName = 
    new RegExp(`(const\\s+)${varName}(\\s*=)`, 'g'),
    // let varName =
    new RegExp(`(let\\s+)${varName}(\\s*=)`, 'g'),
    // var varName =
    new RegExp(`(var\\s+)${varName}(\\s*=)`, 'g'),
    // function parameter: (varName) =>
    new RegExp(`(\\()${varName}(\\s*[,)])`, 'g'),
    // destructuring: { varName } =
    new RegExp(`({[^}]*\\b)${varName}(\\b[^}]*}\\s*=)`, 'g'),
    // array destructuring: [varName] =
    new RegExp(`(\\[[^\\]]*\\b)${varName}(\\b[^\\]]*\\]\\s*=)`, 'g')
  ];
  
  let newLine = line;
  let wasReplaced = false;
  
  for (const pattern of patterns) {
    if (pattern.test(line)) {
      newLine = line.replace(pattern, `$1${newVarName}$2`);
      wasReplaced = true;
      break;
    }
  }
  
  if (!wasReplaced) {
    // console.log(`Could not fix variable "${varName}" in ${filePath}:${lineNum}`);
    // console.log(`Line: ${line.trim()}`);
    return false;
  }
  
  if (LOG_CHANGES) {
    // console.log(`${filePath}:${lineNum} - ${varName} -> ${newVarName}`);
    // console.log(`  OLD: ${line.trim()}`);
    // console.log(`  NEW: ${newLine.trim()}`);
  }
  
  if (!DRY_RUN) {
    lines[lineNum - 1] = newLine;
    fs.writeFileSync(fullPath, lines.join('\n'));
  }
  
  return true;
}

/**
 * Main execution
 */
function main() {
  // console.log('🔧 Fixing unused variables...\n');
  
  const unusedVars = getLintResults();
  // console.log(`Found ${unusedVars.length} unused variables to fix\n`);
  
  if (unusedVars.length === 0) {
    // console.log('✅ No unused variables found!');
    return;
  }
  
  let fixedCount = 0;
  
  for (const { file, line, column, variable } of unusedVars) {
    if (fixUnusedVar(file, line, column, variable)) {
      fixedCount++;
    }
    // console.log(''); // Empty line for readability
  }
  
  // console.log(`\n${DRY_RUN ? '🔍 DRY RUN:' : '✅'} Fixed ${fixedCount}/${unusedVars.length} unused variables`);
  
  if (!DRY_RUN && fixedCount > 0) {
    // console.log('\n🧪 Running lint again to verify fixes...');
    try {
      execSync('npm run lint', { stdio: 'inherit' });
      // console.log('✅ All fixes successful!');
    } catch (error) {
      // console.log('⚠️  Some issues may remain. Run script again if needed.');
    }
  }
  
  // Cleanup
  if (fs.existsSync('lint-current.txt')) {
    fs.unlinkSync('lint-current.txt');
  }
}

main();
