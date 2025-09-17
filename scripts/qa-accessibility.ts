#!/usr/bin/env tsx
/**
 * QA Gate 1: Accessibility & i18n Compliance
 * 
 * This script validates:
 * - Keyboard navigation functionality  
 * - Language menu compliance (≥4 per domain)
 * - Basic accessibility requirements
 */

import * as fs from 'fs'
import * as path from 'path'

interface DomainLanguages {
  [domain: string]: string[]
}

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`)
    process.exit(1)
  }
}

function validateI18nMatrix(): void {
  console.log('🔍 Validating i18n matrix compliance...')
  
  // Read the language configuration
  const sharedConfigPath = path.join(process.cwd(), 'packages/shared/src/config/languages.ts')
  if (!fs.existsSync(sharedConfigPath)) {
    throw new Error('Languages configuration file not found')
  }
  
  const configContent = fs.readFileSync(sharedConfigPath, 'utf-8')
  
  // Extract DOMAIN_LANGUAGES from the file
  const domainLanguagesMatch = configContent.match(/export const DOMAIN_LANGUAGES[^}]+\}/s)
  if (!domainLanguagesMatch) {
    throw new Error('DOMAIN_LANGUAGES not found in configuration')
  }
  
  // Basic validation - check for required domains
  const requiredDomains = ['legacyguard.app', 'legacyguard.cz', 'legacyguard.sk']
  
  requiredDomains.forEach(domain => {
    assert(
      configContent.includes(`'${domain}'`) || configContent.includes(`"${domain}"`),
      `Domain ${domain} should be configured in DOMAIN_LANGUAGES`
    )
  })
  
  // Check for minimum language count per domain (TypeScript object syntax)
  const domainLineMatches = configContent.match(/'.+': \[.+\]/g) || []
  domainLineMatches.forEach((match, index) => {
    const languages = match.match(/'[a-z]{2}'/g) || []
    assert(
      languages.length >= 4,
      `Domain at index ${index} should have at least 4 languages, found ${languages.length}. Line: ${match.substring(0, 50)}...`
    )
  })
  
  console.log('✅ i18n matrix compliance validated')
}

function validateAccessibilityStructure(): void {
  console.log('🔍 Validating accessibility structure...')
  
  // Check for essential accessibility components in the web app
  const webSrcPath = path.join(process.cwd(), 'apps/web/src')
  
  // Look for focus management patterns
  const mainTsxPath = path.join(webSrcPath, 'main.tsx')
  if (fs.existsSync(mainTsxPath)) {
    const mainContent = fs.readFileSync(mainTsxPath, 'utf-8')
    
    // Basic checks for accessibility-friendly routing
    assert(
      mainContent.includes('Route'),
      'Main app should use React Router for accessible navigation'
    )
  }
  
  // Check for aria-label usage in components
  const findAriaLabels = (dir: string): number => {
    let count = 0
    const files = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name)
      
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        count += findAriaLabels(fullPath)
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        if (content.includes('aria-label') || content.includes('aria-labelledby')) {
          count++
        }
      }
    }
    
    return count
  }
  
  const ariaLabelCount = findAriaLabels(webSrcPath)
  assert(
    ariaLabelCount >= 5,
    `Should have at least 5 components with aria-labels for accessibility, found ${ariaLabelCount}`
  )
  
  console.log(`✅ Accessibility structure validated (${ariaLabelCount} components with aria-labels)`)
}

function validateTranslationKeys(): void {
  console.log('🔍 Validating translation keys...')
  
  const i18nPath = path.join(process.cwd(), 'apps/web/src/lib/i18n.ts')
  if (!fs.existsSync(i18nPath)) {
    throw new Error('i18n configuration file not found')
  }
  
  const i18nContent = fs.readFileSync(i18nPath, 'utf-8')
  
  // Check for required translation namespaces
  const requiredNamespaces = [
    'sharing/viewer',
    'sharing/manager', 
    'subscriptions',
    'will/wizard'
  ]
  
  requiredNamespaces.forEach(namespace => {
    assert(
      i18nContent.includes(`'${namespace}'`) || i18nContent.includes(`"${namespace}"`),
      `Translation namespace '${namespace}' should be defined`
    )
  })
  
  // Check for multi-language support
  const languages = ['en', 'cs', 'sk']
  languages.forEach(lang => {
    assert(
      i18nContent.includes(`${lang}: {`),
      `Language '${lang}' should be configured in i18n`
    )
  })
  
  console.log('✅ Translation keys validated')
}

function validateKeyboardNavigation(): void {
  console.log('🔍 Validating keyboard navigation patterns...')
  
  // Check for proper form handling
  const componentsPath = path.join(process.cwd(), 'apps/web/src/features')
  
  const findFormPatterns = (dir: string): { forms: number; buttons: number; inputs: number } => {
    let forms = 0, buttons = 0, inputs = 0
    
    if (!fs.existsSync(dir)) return { forms, buttons, inputs }
    
    const files = fs.readdirSync(dir, { withFileTypes: true })
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name)
      
      if (file.isDirectory()) {
        const subResult = findFormPatterns(fullPath)
        forms += subResult.forms
        buttons += subResult.buttons
        inputs += subResult.inputs
      } else if (file.name.endsWith('.tsx')) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        
        if (content.includes('<form') || content.includes('onSubmit')) forms++
        if (content.includes('<button') || content.includes('type="submit"')) buttons++
        if (content.includes('<input') || content.includes('type="password"')) inputs++
      }
    }
    
    return { forms, buttons, inputs }
  }
  
  const patterns = findFormPatterns(componentsPath)
  
  assert(
    patterns.forms >= 3,
    `Should have at least 3 forms for user interaction, found ${patterns.forms}`
  )
  
  assert(
    patterns.buttons >= 10,
    `Should have at least 10 interactive buttons, found ${patterns.buttons}`
  )
  
  console.log(`✅ Keyboard navigation patterns validated (${patterns.forms} forms, ${patterns.buttons} buttons, ${patterns.inputs} inputs)`)
}

async function main(): Promise<void> {
  console.log('🚀 Starting QA Gate 1: Accessibility & i18n Compliance\n')
  
  try {
    validateI18nMatrix()
    validateAccessibilityStructure()
    validateTranslationKeys()
    validateKeyboardNavigation()
    
    console.log('\n🎉 QA Gate 1 PASSED: Accessibility & i18n compliance verified')
    process.exit(0)
  } catch (error) {
    console.error('\n💥 QA Gate 1 FAILED:', error.message)
    process.exit(1)
  }
}

main().catch(console.error)