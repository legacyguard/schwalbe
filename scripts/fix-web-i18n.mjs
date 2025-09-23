#!/usr/bin/env node

/**
 * @description Fix web i18n issues - add missing policy section and fill empty values
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const LOCALES_DIR = join(ROOT, 'apps/web/public/locales/landing');

async function fixPricingFiles() {
  console.log('🔧 Fixing web i18n pricing files...\n');

  const pricingFiles = await readdir(LOCALES_DIR).then(files =>
    files.filter(file => file.startsWith('pricing.') && file.endsWith('.json'))
  );

  const englishFile = join(LOCALES_DIR, 'pricing.en.json');
  const englishContent = JSON.parse(await readFile(englishFile, 'utf-8'));

  let fixed = 0;

  for (const file of pricingFiles) {
    if (file === 'pricing.en.json') continue;

    const filePath = join(LOCALES_DIR, file);
    const content = JSON.parse(await readFile(filePath, 'utf-8'));

    let needsUpdate = false;

    // Add missing policy section
    if (!content.policy) {
      content.policy = {
        cancel_anytime: "Cancel anytime",
        trial: "Free trial available",
        grace: "Grace period applies"
      };
      needsUpdate = true;
    }

    // Fill empty badge values
    if (content.tiers?.free?.badge === "") {
      content.tiers.free.badge = "Free Forever";
      needsUpdate = true;
    }

    if (content.tiers?.free?.period === "") {
      content.tiers.free.period = "forever";
      needsUpdate = true;
    }

    if (content.tiers?.family?.badge === "") {
      content.tiers.family.badge = "Best Value";
      needsUpdate = true;
    }

    if (needsUpdate) {
      await writeFile(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8');
      console.log(`✅ Fixed ${file}`);
      fixed++;
    }
  }

  console.log(`\n🎉 Fixed ${fixed} pricing files`);
}

async function fixPagesLandingFiles() {
  console.log('🔧 Fixing web i18n pages/landing files...\n');

  const pagesDir = join(ROOT, 'apps/web/public/locales/pages');
  const landingFiles = await readdir(pagesDir).then(files =>
    files.filter(file => file.startsWith('landing.') && file.endsWith('.json'))
  );

  const englishFile = join(pagesDir, 'landing.en.json');
  const englishContent = JSON.parse(await readFile(englishFile, 'utf-8'));

  let fixed = 0;

  for (const file of landingFiles) {
    if (file === 'landing.en.json') continue;

    const filePath = join(pagesDir, file);
    const content = JSON.parse(await readFile(filePath, 'utf-8'));

    let needsUpdate = false;

    // Add missing sections from English version
    if (!content.demo) {
      content.demo = englishContent.demo;
      needsUpdate = true;
    }

    if (!content.value) {
      content.value = englishContent.value;
      needsUpdate = true;
    }

    if (!content.cta) {
      content.cta = englishContent.cta;
      needsUpdate = true;
    }

    if (!content.footer) {
      content.footer = englishContent.footer;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await writeFile(filePath, JSON.stringify(content, null, 2) + '\n', 'utf-8');
      console.log(`✅ Fixed ${file}`);
      fixed++;
    }
  }

  console.log(`\n🎉 Fixed ${fixed} landing page files`);
}

// Run the fixes
async function main() {
  await fixPricingFiles();
  await fixPagesLandingFiles();
}

main().catch(console.error);