#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function fixUnusedVars() {
  console.log('🔍 Finding unused variables...');
  
  try {
    // Get ESLint output as JSON
    const output = execSync('npx eslint . --ext .js,.jsx,.ts,.tsx --format json', {
      encoding: 'utf8',
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    const results = JSON.parse(output);
    let totalFixed = 0;
    
    results.forEach(result => {
      if (result.messages.length === 0) return;
      
      const filePath = result.filePath;
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      // Process messages in reverse order to avoid offset issues
      const unusedVarMessages = result.messages
        .filter(msg => msg.ruleId === '@typescript-eslint/no-unused-vars')
        .reverse();
        
      unusedVarMessages.forEach(message => {
        const match = message.message.match(/'([^']+)' is defined but never used/);
        if (match) {
          const varName = match[1];
          
          // Special handling for caught errors - rename to _err or _error
          if (message.message.includes('Allowed unused caught errors')) {
            const regex = new RegExp(`\\bcatch\\s*\\(\\s*${varName}\\b`, 'g');
            content = content.replace(regex, `catch (_${varName}`);
            modified = true;
            totalFixed++;
          }
          // For regular unused vars, prefix with underscore
          else if (!varName.startsWith('_')) {
            // Handle function parameters
            const funcParamRegex = new RegExp(`(function[^(]*\\([^)]*\\b)(${varName})(\\b[^)]*\\))`, 'g');
            content = content.replace(funcParamRegex, `$1_$2$3`);
            
            // Handle arrow function parameters
            const arrowParamRegex = new RegExp(`(\\([^)]*\\b)(${varName})(\\b[^)]*\\)\\s*=>)`, 'g');
            content = content.replace(arrowParamRegex, `$1_$2$3`);
            
            // Handle const/let/var declarations
            const varDeclRegex = new RegExp(`^(\\s*(?:const|let|var)\\s+)(${varName})\\b`, 'gm');
            content = content.replace(varDeclRegex, `$1_$2`);
            
            if (content.includes(`_${varName}`)) {
              modified = true;
              totalFixed++;
            }
          }
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed unused variables in: ${path.relative(process.cwd(), filePath)}`);
      }
    });
    
    console.log(`\n📊 Summary: Fixed ${totalFixed} unused variables`);
    
  } catch (error) {
    // ESLint exits with non-zero when there are linting errors, which is expected
    if (error.stdout) {
      const results = JSON.parse(error.stdout);
      let totalFixed = 0;
      
      results.forEach(result => {
        if (result.messages.length === 0) return;
        
        const filePath = result.filePath;
        if (!fs.existsSync(filePath)) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Process messages in reverse order to avoid offset issues
        const unusedVarMessages = result.messages
          .filter(msg => msg.ruleId === '@typescript-eslint/no-unused-vars')
          .reverse();
          
        unusedVarMessages.forEach(message => {
          const match = message.message.match(/'([^']+)' is defined but never used/);
          if (match) {
            const varName = match[1];
            
            // Special handling for caught errors - rename to _err or _error
            if (message.message.includes('caught errors')) {
              const regex = new RegExp(`\\bcatch\\s*\\(\\s*${varName}\\b`, 'g');
              const newContent = content.replace(regex, `catch (_${varName}`);
              if (newContent !== content) {
                content = newContent;
                modified = true;
                totalFixed++;
              }
            }
          }
        });
        
        if (modified) {
          fs.writeFileSync(filePath, content);
          console.log(`✅ Fixed unused variables in: ${path.relative(process.cwd(), filePath)}`);
        }
      });
      
      console.log(`\n📊 Summary: Fixed ${totalFixed} unused variables`);
    } else {
      console.error('Error running ESLint:', error.message);
    }
  }
}

fixUnusedVars();
