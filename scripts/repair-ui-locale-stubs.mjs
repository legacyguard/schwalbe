#!/usr/bin/env node
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const LOCALES_ROOT = path.join(ROOT, 'apps/web/public/locales')
const UI_BASE = path.join(LOCALES_ROOT, 'ui/landing-page.en.json')

const LANGS = [
  'cs','sk','en','de','uk','pl','da','sv','fi','fr','it','es','pt','el','nl','lt','lv','et','hu','ro','sl','hr','sr','sq','mk','me','bg','ga','mt','is','no','tr','ru','bs'
]

async function main() {
  const base = JSON.parse(await fs.readFile(UI_BASE, 'utf8'))
  const results = []
  for (const lang of LANGS) {
    if (lang === 'en') continue
    const target = path.join(LOCALES_ROOT, `ui/landing-page.${lang}.json`)
    let needsFix = false
    let reason = ''
    try {
      const data = await fs.readFile(target, 'utf8')
      try {
        JSON.parse(data)
      } catch (e) {
        needsFix = true
        reason = 'invalid JSON'
      }
    } catch {
      needsFix = true
      reason = 'missing'
    }

    if (needsFix) {
      await fs.mkdir(path.dirname(target), { recursive: true })
      await fs.writeFile(target, JSON.stringify(base, null, 2) + '\n', 'utf8')
      results.push({ lang, reason })
    }
  }
  console.log(`Repaired/created ${results.length} UI locale files`)
  if (results.length) {
    for (const r of results) console.log(` - ${r.lang} (${r.reason})`)
  }
}

main().catch((e) => {
  console.error('repair error:', e)
  process.exit(1)
})
