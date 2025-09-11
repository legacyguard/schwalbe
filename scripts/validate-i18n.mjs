#!/usr/bin/env node
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const LOCALES_ROOT = path.resolve(process.cwd(), 'apps/web/public/locales');

function isJsonFile(name) {
  return name.toLowerCase().endsWith('.json');
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

async function readJson(filePath) {
  const data = await readFile(filePath, 'utf8');
  try {
    return JSON.parse(data);
  } catch (e) {
    throw new Error(`Invalid JSON: ${filePath}: ${e.message}`);
  }
}

async function walk(dir, acc = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, acc);
    } else if (entry.isFile() && isJsonFile(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function groupByBase(files) {
  // Group files by base name before the locale suffix, handling both
  // name.en.json and en.json patterns.
  const groups = new Map();
  for (const f of files) {
    const bn = path.basename(f);
    const dir = path.dirname(f);
    let base = null;
    let locale = null;
    if (bn === 'en.json') {
      base = 'en';
      locale = 'en';
    } else {
      const m = bn.match(/^(.*)\.([a-z]{2}(?:-[A-Z]{2})?)\.json$/);
      if (m) {
        base = m[1];
        locale = m[2];
      }
    }
    if (!base || !locale) continue;
    const key = path.join(dir, base);
    const arr = groups.get(key) || [];
    arr.push({ file: f, base, locale });
    groups.set(key, arr);
  }
  return groups;
}

async function main() {
  try {
    // Ensure root exists
    try {
      await stat(LOCALES_ROOT);
    } catch {
      console.log(`No locales directory at ${LOCALES_ROOT}. Skipping.`);
      return;
    }

    const files = await walk(LOCALES_ROOT);
    const groups = groupByBase(files);
    let hasErrors = false;

    for (const [baseKey, entries] of groups.entries()) {
      const enEntry = entries.find(e => e.locale === 'en' || e.file.endsWith('.en.json'));
      if (!enEntry) continue; // Only compare where we have an English baseline

      const enObj = await readJson(enEntry.file);
      const enFlat = flatten(enObj);

      for (const e of entries) {
        if (e.file === enEntry.file) continue;
        const other = await readJson(e.file);
        const otherFlat = flatten(other);
        const missing = Object.keys(enFlat).filter(k => !(k in otherFlat));
        const extra = Object.keys(otherFlat).filter(k => !(k in enFlat));
        if (missing.length || extra.length) {
          hasErrors = true;
          console.log(`\nLocale mismatch for base ${baseKey} → ${path.basename(e.file)}:`);
          if (missing.length) console.log(`  Missing keys (${missing.length}):`, missing.slice(0, 20).join(', ') + (missing.length > 20 ? '…' : ''));
          if (extra.length) console.log(`  Extra keys (${extra.length}):`, extra.slice(0, 20).join(', ') + (extra.length > 20 ? '…' : ''));
        }
      }
    }

    if (hasErrors) {
      console.error('\n❌ i18n health check failed: some locales are missing or have extra keys compared to English.');
      process.exit(1);
    } else {
      console.log('✅ i18n health check passed.');
    }
  } catch (err) {
    console.error('i18n check error:', err.message);
    process.exit(1);
  }
}

await main();
