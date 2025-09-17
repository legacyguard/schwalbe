#!/usr/bin/env node

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
config({ path: join(dirname(__dirname), '.env.local') });

console.log('🔐 Environment Variables Check:\n');

const requiredEnvVars = [
  'VITE_CLERK_PUBLISHABLE_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

let allPresent = true;

for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`  ✅ ${envVar} is set`);
  } else {
    console.log(`  ❌ ${envVar} is NOT set`);
    allPresent = false;
  }
}

if (allPresent) {
  console.log('\n✨ All required environment variables are configured!');
} else {
  console.log('\n⚠️  Some environment variables are missing.');
  console.log('   Please check your .env.local file.');
  process.exit(1);
}
