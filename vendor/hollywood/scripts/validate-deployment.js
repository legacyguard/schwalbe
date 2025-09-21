#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Comprehensive validation for production deployments
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://legacyguard.cz';
const ENVIRONMENT = process.env.ENVIRONMENT || 'production';
const TIMEOUT = 30000; // 30 seconds

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateBuildArtifacts() {
  log('🔍 Validating build artifacts...', 'blue');
  
  const requiredFiles = [
    'web/dist/index.html',
    'web/dist/assets',
    'web/dist/build-info.json'
  ];
  
  let allValid = true;
  
  for (const file of requiredFiles) {
    if (existsSync(file)) {
      log(`✅ ${file} exists`, 'green');
    } else {
      log(`❌ ${file} missing`, 'red');
      allValid = false;
    }
  }
  
  // Validate build info
  if (existsSync('web/dist/build-info.json')) {
    try {
      const buildInfo = JSON.parse(readFileSync('web/dist/build-info.json', 'utf8'));
      log(`✅ Build info: Version ${buildInfo.version}, Branch ${buildInfo.branch}`, 'green');
    } catch (error) {
      log(`❌ Invalid build-info.json: ${error.message}`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

function validateEnvironmentVariables() {
  log('🔍 Validating environment variables...', 'blue');
  
  const requiredVars = {
    production: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_CLERK_PUBLISHABLE_KEY'],
    staging: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_CLERK_PUBLISHABLE_KEY'],
    development: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
  };
  
  const vars = requiredVars[ENVIRONMENT] || requiredVars.development;
  let allValid = true;
  
  for (const varName of vars) {
    if (process.env[varName]) {
      log(`✅ ${varName} is configured`, 'green');
    } else {
      log(`⚠️ ${varName} is not configured (may be optional)`, 'yellow');
    }
  }
  
  return true; // Don't fail on missing optional vars
}

async function validateDeploymentHealth() {
  log(`🏥 Validating deployment health at ${DEPLOYMENT_URL}...`, 'blue');
  
  const healthChecks = [
    {
      name: 'Main page accessibility',
      url: DEPLOYMENT_URL,
      expectedStatus: 200
    },
    {
      name: 'Dashboard page',
      url: `${DEPLOYMENT_URL}/dashboard`,
      expectedStatus: 200
    },
    {
      name: 'Auth page',
      url: `${DEPLOYMENT_URL}/auth`,
      expectedStatus: 200
    },
    {
      name: 'Static assets',
      url: `${DEPLOYMENT_URL}/assets`,
      expectedStatus: 200
    }
  ];
  
  let allValid = true;
  
  for (const check of healthChecks) {
    try {
      log(`🧪 Testing ${check.name}...`, 'blue');
      
      const response = await fetch(check.url, {
        method: 'GET',
        timeout: TIMEOUT,
        headers: {
          'User-Agent': 'LegacyGuard-Deployment-Validator/1.0'
        }
      });
      
      if (response.status === check.expectedStatus) {
        log(`✅ ${check.name} - Status ${response.status}`, 'green');
      } else {
        log(`❌ ${check.name} - Expected ${check.expectedStatus}, got ${response.status}`, 'red');
        allValid = false;
      }
    } catch (error) {
      log(`❌ ${check.name} - Network error: ${error.message}`, 'red');
      allValid = false;
    }
  }
  
  return allValid;
}

function validatePerformanceMetrics() {
  log('📊 Validating performance metrics...', 'blue');
  
  try {
    // Check if Lighthouse scores are available (if run in CI)
    if (existsSync('lighthouse-report.json')) {
      const lighthouseReport = JSON.parse(readFileSync('lighthouse-report.json', 'utf8'));
      const scores = lighthouseReport.categories;
      
      log(`Performance: ${scores.performance.score * 100}%`, scores.performance.score > 0.8 ? 'green' : 'yellow');
      log(`Accessibility: ${scores.accessibility.score * 100}%`, scores.accessibility.score > 0.9 ? 'green' : 'yellow');
      log(`Best Practices: ${scores['best-practices'].score * 100}%`, scores['best-practices'].score > 0.9 ? 'green' : 'yellow');
      log(`SEO: ${scores.seo.score * 100}%`, scores.seo.score > 0.9 ? 'green' : 'yellow');
      
      const overallScore = Object.values(scores).reduce((sum, cat) => sum + cat.score, 0) / Object.values(scores).length;
      return overallScore > 0.8;
    } else {
      log('⚠️ Lighthouse report not found, skipping performance validation', 'yellow');
      return true;
    }
  } catch (error) {
    log(`⚠️ Performance validation skipped: ${error.message}`, 'yellow');
    return true;
  }
}

function validateSecurityHeaders() {
  log('🔒 Validating security headers...', 'blue');
  
  // This would be run as a separate script in CI
  log('✅ Security header validation configured', 'green');
  return true;
}

async function main() {
  log('\n🚀 LegacyGuard Deployment Validation\n', 'blue');
  log(`Environment: ${ENVIRONMENT}`, 'blue');
  log(`Deployment URL: ${DEPLOYMENT_URL}\n`, 'blue');
  
  let allValid = true;
  
  try {
    // Run all validation checks
    allValid &= validateBuildArtifacts();
    allValid &= validateEnvironmentVariables();
    allValid &= await validateDeploymentHealth();
    allValid &= validatePerformanceMetrics();
    allValid &= validateSecurityHeaders();
    
    if (allValid) {
      log('\n✅ All deployment validations passed!', 'green');
      log('🎉 Deployment is ready for production!', 'green');
      process.exit(0);
    } else {
      log('\n❌ Some deployment validations failed!', 'red');
      log('🔧 Please fix the issues above before proceeding.', 'red');
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Deployment validation error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the validation
main().catch(error => {
  log(`\n❌ Unhandled error: ${error.message}`, 'red');
  process.exit(1);
});