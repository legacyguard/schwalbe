#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Find all TypeScript files in the web directory
const files = await glob('web/src/**/*.tsx', { cwd: import.meta.url.replace('file://', '').replace('/fix-motion-components.js', '') });

const fixes = [
  // Fix motion component initial/animate/exit properties
  {
    pattern: /initial=\{\s*([^}]+)\s*\?\s*\{[^}]+\}\s*:\s*undefined\s*\}/g,
    replacement: 'initial={$1 ? $1 : false}'
  },
  {
    pattern: /animate=\{\s*([^}]+)\s*\?\s*\{[^}]+\}\s*:\s*undefined\s*\}/g,
    replacement: 'animate={$1 ? $1 : false}'
  },
  {
    pattern: /exit=\{\s*([^}]+)\s*\?\s*\{[^}]+\}\s*:\s*undefined\s*\}/g,
    replacement: 'exit={$1 ? $1 : false}'
  },
  {
    pattern: /whileHover=\{\s*([^}]+)\s*\?\s*\{[^}]+\}\s*:\s*undefined\s*\}/g,
    replacement: 'whileHover={$1 ? $1 : false}'
  },
  {
    pattern: /whileTap=\{\s*([^}]+)\s*\?\s*\{[^}]+\}\s*:\s*undefined\s*\}/g,
    replacement: 'whileTap={$1 ? $1 : false}'
  },
  {
    pattern: /transition=\{\s*([^}]+)\s*\?\s*\{[^}]+\}\s*:\s*undefined\s*\}/g,
    replacement: 'transition={$1 ? $1 : false}'
  },
  // Fix onAnimationComplete
  {
    pattern: /onAnimationComplete=\{\s*([^}]+)\s*\}/g,
    replacement: 'onAnimationComplete={$1 || (() => {})}'
  },
  // Fix other optional properties
  {
    pattern: /onFireflyClick=\{\s*([^}]+)\s*\}/g,
    replacement: 'onFireflyClick={$1 || (() => {})}'
  },
  {
    pattern: /onUpgrade=\{\s*([^}]+)\s*\}/g,
    replacement: 'onUpgrade={$1 || (() => {})}'
  },
  {
    pattern: /onReviewRequested=\{\s*([^}]+)\s*\}/g,
    replacement: 'onReviewRequested={$1 || (() => {})}'
  },
  {
    pattern: /onDelete=\{\s*([^}]+)\s*\}/g,
    replacement: 'onDelete={$1 || (() => {})}'
  },
  {
    pattern: /onEdit=\{\s*([^}]+)\s*\}/g,
    replacement: 'onEdit={$1 || (() => {})}'
  },
  {
    pattern: /onViewDetails=\{\s*([^}]+)\s*\}/g,
    replacement: 'onViewDetails={$1 || (() => {})}'
  },
  {
    pattern: /onMessage=\{\s*([^}]+)\s*\}/g,
    replacement: 'onMessage={$1 || (() => {})}'
  }
];

let totalFiles = 0;
let modifiedFiles = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  fixes.forEach(fix => {
    const newContent = content.replace(fix.pattern, fix.replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    modifiedFiles++;
    // console.log(`Fixed: ${file}`);
  }
  
  totalFiles++;
});

// console.log(`\nProcessed ${totalFiles} files, modified ${modifiedFiles} files.`);
