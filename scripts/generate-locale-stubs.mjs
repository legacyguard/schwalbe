#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const LOCALES_ROOT = path.join(ROOT, 'apps/web/public/locales')

const LANGS = [
  'cs','sk','en','de','uk','pl','da','sv','fi','fr','it','es','pt','el','nl','lt','lv','et','hu','ro','sl','hr','sr','sq','mk','me','bg','ga','mt','is','no','tr','ru','bs'
]

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function readJson(p) {
  const data = await fs.readFile(p, 'utf8')
  return JSON.parse(data)
}

async function writeJsonIfMissing(p, obj) {
  try {
    await fs.stat(p)
    return false // exists
  } catch {
    await ensureDir(path.dirname(p))
    await fs.writeFile(p, JSON.stringify(obj, null, 2) + '\n', 'utf8')
    return true
  }
}

async function main() {
  const landingBase = await readJson(path.join(LOCALES_ROOT, 'ui/landing-page.en.json'))
  const pricingBase = await readJson(path.join(LOCALES_ROOT, 'landing/pricing.en.json'))
  const securityBase = await readJson(path.join(LOCALES_ROOT, 'landing/security-promise.en.json'))

  let created = []
  for (const lang of LANGS) {
    if (lang === 'en') continue

    const maps = [
      { rel: `ui/landing-page.${lang}.json`, base: landingBase },
      { rel: `landing/pricing.${lang}.json`, base: pricingBase },
      { rel: `landing/security-promise.${lang}.json`, base: securityBase },
    ]

    for (const m of maps) {
      const target = path.join(LOCALES_ROOT, m.rel)
      const ok = await writeJsonIfMissing(target, m.base)
      if (ok) created.push(m.rel)
    }
  }

  console.log(`Created ${created.length} locale files`) // non-sensitive
  if (created.length) {
    console.log(created.map((p) => ` - ${p}`).join('\n'))
  }
}

main().catch((e) => {
  console.error('stub generation error:', e)
  process.exit(1)
})
