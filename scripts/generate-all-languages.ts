#!/usr/bin/env node
/**
 * Generate i18n files for all 34 supported languages
 * Run: npx tsx scripts/generate-all-languages.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All 34 supported languages
const LANGUAGES = {
  en: 'English',
  bg: 'Bulgarian',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  et: 'Estonian',
  fi: 'Finnish',
  fr: 'French',
  de: 'German',
  el: 'Greek',
  hu: 'Hungarian',
  ga: 'Irish',
  it: 'Italian',
  lv: 'Latvian',
  lt: 'Lithuanian',
  mt: 'Maltese',
  pl: 'Polish',
  pt: 'Portuguese',
  ro: 'Romanian',
  sk: 'Slovak',
  sl: 'Slovenian',
  es: 'Spanish',
  sv: 'Swedish',
  no: 'Norwegian',
  is: 'Icelandic',
  tr: 'Turkish',
  sr: 'Serbian',
  sq: 'Albanian',
  mk: 'Macedonian',
  me: 'Montenegrin',
  bs: 'Bosnian',
  ru: 'Russian',
  uk: 'Ukrainian',
};

// Template structure for common translations
const commonTemplate = {
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
    documents: 'Documents',
    assets: 'Assets',
    will: 'Will',
    settings: 'Settings',
    support: 'Support',
    signIn: 'Sign In',
    signOut: 'Sign Out',
  },
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    continueWith: 'Continue with',
    rememberMe: 'Remember me',
    name: 'Name',
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    submit: 'Submit',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    finish: 'Finish',
    close: 'Close',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    share: 'Share',
    copy: 'Copy',
    copied: 'Copied!',
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.',
    unauthorized: 'You are not authorized to perform this action.',
    notFound: 'The requested resource was not found.',
    validation: 'Please check your input and try again.',
    emailRequired: 'Email is required',
    passwordRequired: 'Password is required',
    invalidEmail: 'Invalid email address',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordMismatch: 'Passwords do not match',
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome back',
    overview: 'Overview',
    recentActivity: 'Recent Activity',
    quickActions: 'Quick Actions',
    statistics: 'Statistics',
    documents: 'Documents',
    assets: 'Assets',
    reminders: 'Reminders',
    notifications: 'Notifications',
  },
  documents: {
    title: 'Documents',
    upload: 'Upload Document',
    browse: 'Browse',
    dragAndDrop: 'Drag and drop files here',
    noDocuments: 'No documents yet',
    uploadFirst: 'Upload your first document to get started',
    fileType: 'File Type',
    uploadDate: 'Upload Date',
    size: 'Size',
    actions: 'Actions',
    preview: 'Preview',
    download: 'Download',
    share: 'Share',
    delete: 'Delete',
    categories: {
      all: 'All',
      personal: 'Personal',
      financial: 'Financial',
      legal: 'Legal',
      medical: 'Medical',
      property: 'Property',
      insurance: 'Insurance',
      other: 'Other',
    },
  },
  pricing: {
    title: 'Choose Your Plan',
    monthly: 'Monthly',
    yearly: 'Yearly',
    save: 'Save',
    mostPopular: 'Most Popular',
    features: 'Features',
    getStarted: 'Get Started',
    currentPlan: 'Current Plan',
    upgradePlan: 'Upgrade Plan',
    cancelAnytime: 'Cancel anytime',
    moneyBack: '30-day money-back guarantee',
  },
  footer: {
    company: 'Company',
    about: 'About',
    careers: 'Careers',
    blog: 'Blog',
    press: 'Press',
    legal: 'Legal',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie Policy',
    support: 'Support',
    help: 'Help Center',
    contact: 'Contact Us',
    faq: 'FAQ',
    status: 'Status',
    followUs: 'Follow Us',
    allRightsReserved: 'All rights reserved',
  },
};

// Language-specific overrides (for demonstration, using English for all)
// In production, these would be properly translated
function getTranslationsForLanguage(langCode: string): any {
  // For now, return the English template for all languages
  // In production, this would return properly translated content
  const translations = JSON.parse(JSON.stringify(commonTemplate));
  
  // Add language-specific metadata
  translations._metadata = {
    language: langCode,
    languageName: LANGUAGES[langCode as keyof typeof LANGUAGES],
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
  };

  // Add a note that this is a placeholder
  if (langCode !== 'en') {
    translations._note = `This is a placeholder translation file for ${LANGUAGES[langCode as keyof typeof LANGUAGES]}. Professional translation required.`;
  }

  return translations;
}

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateLanguageFiles() {
  const localesDir = path.join(__dirname, '../apps/web/public/locales');
  
  console.log('🌍 Generating language files for 34 languages...\n');
  
  let generated = 0;
  let skipped = 0;
  
  // Generate files for each language
  Object.keys(LANGUAGES).forEach(langCode => {
    const langDir = path.join(localesDir, langCode);
    ensureDirectoryExists(langDir);
    
    // Generate common.json
    const commonFile = path.join(langDir, 'common.json');
    if (!fs.existsSync(commonFile)) {
      const translations = getTranslationsForLanguage(langCode);
      fs.writeFileSync(commonFile, JSON.stringify(translations, null, 2));
      console.log(`✅ Created ${langCode}/common.json (${LANGUAGES[langCode as keyof typeof LANGUAGES]})`);
      generated++;
    } else {
      console.log(`⏭️  Skipped ${langCode}/common.json (already exists)`);
      skipped++;
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`   Generated: ${generated} files`);
  console.log(`   Skipped: ${skipped} files`);
  console.log(`   Total languages: ${Object.keys(LANGUAGES).length}`);
  
  // Update middleware.ts with all language codes
  updateMiddleware();
  
  console.log('\n✨ Language generation complete!');
}

function updateMiddleware() {
  const middlewarePath = path.join(__dirname, '../apps/web/src/middleware.ts');
  
  if (!fs.existsSync(middlewarePath)) {
    console.log('⚠️  Middleware file not found, skipping update');
    return;
  }
  
  let middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
  
  // Generate the language list
  const langCodes = Object.keys(LANGUAGES);
  const langList = langCodes.join('|');
  
  // Update the matcher pattern
  const oldPattern = /matcher: \['\/', '\((cs\|sk\|en)\)\/:path\*'\]/;
  const newPattern = `matcher: ['/', '(${langList})/:path*']`;
  
  if (oldPattern.test(middlewareContent)) {
    middlewareContent = middlewareContent.replace(oldPattern, newPattern);
    fs.writeFileSync(middlewarePath, middlewareContent);
    console.log('✅ Updated middleware.ts with all 34 language codes');
  } else {
    console.log('⚠️  Could not update middleware.ts - pattern not found');
  }
}

function createI18nConfig() {
  const configPath = path.join(__dirname, '../apps/web/src/i18n-config.ts');
  
  const configContent = `/**
 * i18n configuration for all 34 supported languages
 */

export const languages = ${JSON.stringify(Object.keys(LANGUAGES), null, 2)} as const;

export type Language = typeof languages[number];

export const languageNames: Record<Language, string> = ${JSON.stringify(LANGUAGES, null, 2)};

export const defaultLanguage: Language = 'en';

export function getLanguageName(code: Language): string {
  return languageNames[code] || code;
}

export const locales = languages;
export type Locale = Language;
`;

  fs.writeFileSync(configPath, configContent);
  console.log('✅ Created i18n-config.ts');
}

// Main execution
function main() {
  try {
    generateLanguageFiles();
    createI18nConfig();
    
    console.log('\n📝 Next steps:');
    console.log('   1. Update translations in each language file');
    console.log('   2. Configure domain-specific language settings');
    console.log('   3. Test language switching functionality');
    console.log('   4. Add professional translations');
  } catch (error) {
    console.error('❌ Error generating language files:', error);
    process.exit(1);
  }
}

main();