#!/usr/bin/env node

/**
 * Will Wizard Language-Jurisdiction Combination Tester
 * 
 * This script tests all 8 combinations of language and jurisdiction
 * for the will wizard and generates HTML snapshots.
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

const COMBINATIONS = [
  { language: 'sk', jurisdiction: 'SK', label: 'Slovenčina (Slovensko)' },
  { language: 'cs', jurisdiction: 'SK', label: 'Čeština (Slovensko)' },
  { language: 'en', jurisdiction: 'SK', label: 'English (Slovakia)' },
  { language: 'de', jurisdiction: 'SK', label: 'Deutsch (Slowakei)' },
  { language: 'sk', jurisdiction: 'CZ', label: 'Slovenčina (Česko)' },
  { language: 'cs', jurisdiction: 'CZ', label: 'Čeština (Česko)' },
  { language: 'en', jurisdiction: 'CZ', label: 'English (Czech Republic)' },
  { language: 'de', jurisdiction: 'CZ', label: 'Deutsch (Tschechien)' },
];

const BASE_URL = 'http://localhost:8082';
const TEST_PAGE_URL = `${BASE_URL}/test/will-wizard-combinations`;
const SNAPSHOTS_DIR = path.join(__dirname, '../test-snapshots');

async function ensureSnapshotsDirectory() {
  try {
    await fs.access(SNAPSHOTS_DIR);
  } catch {
    await fs.mkdir(SNAPSHOTS_DIR, { recursive: true });
    console.log(`📁 Created snapshots directory: ${SNAPSHOTS_DIR}`);
  }
}

async function testCombination(browser, combination) {
  console.log(`\n🧪 Testing: ${combination.language}-${combination.jurisdiction} (${combination.label})`);
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });
  
  try {
    // Navigate to test page
    await page.goto(TEST_PAGE_URL, { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Click the test button for this combination
    const testButtonSelector = `[data-testid="${combination.language}-${combination.jurisdiction}"]`;
    const alternativeSelector = `button:has-text("Test ${combination.language}-${combination.jurisdiction}")`;
    
    // Try to find and click the test button
    try {
      await page.waitForSelector('button', { timeout: 5000 });
      
      // Click the specific test button
      const buttons = await page.$$('button');
      let targetButton = null;
      
      for (let button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text.includes(`Test ${combination.language}-${combination.jurisdiction}`)) {
          targetButton = button;
          break;
        }
      }
      
      if (targetButton) {
        await targetButton.click();
        console.log(`  ✓ Clicked test button for ${combination.language}-${combination.jurisdiction}`);
        
        // Wait for wizard to load
        await page.waitForTimeout(2000);
        
        // Take screenshot of the wizard
        const screenshotPath = path.join(SNAPSHOTS_DIR, `${combination.language}-${combination.jurisdiction}-wizard.png`);
        await page.screenshot({ 
          path: screenshotPath,
          fullPage: true 
        });
        console.log(`  📸 Screenshot saved: ${screenshotPath}`);
        
        // Get HTML content
        const htmlContent = await page.content();
        const htmlPath = path.join(SNAPSHOTS_DIR, `${combination.language}-${combination.jurisdiction}-wizard.html`);
        await fs.writeFile(htmlPath, htmlContent);
        console.log(`  📄 HTML saved: ${htmlPath}`);
        
        // Try to navigate through first few steps
        const nextButtonSelectors = [
          'button:has-text("Start Creating Will")',
          'button:has-text("Continue")',
          'button:has-text("Next")',
          'button[type="submit"]'
        ];
        
        for (let selector of nextButtonSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 2000 });
            await page.click(selector);
            await page.waitForTimeout(1000);
            console.log(`  ✓ Clicked: ${selector}`);
            break;
          } catch (e) {
            // Continue to next selector
          }
        }
        
        // Take another screenshot after navigation
        const step2ScreenshotPath = path.join(SNAPSHOTS_DIR, `${combination.language}-${combination.jurisdiction}-step2.png`);
        await page.screenshot({ 
          path: step2ScreenshotPath,
          fullPage: true 
        });
        console.log(`  📸 Step 2 screenshot: ${step2ScreenshotPath}`);
        
        return {
          combination,
          success: true,
          screenshots: [screenshotPath, step2ScreenshotPath],
          htmlFile: htmlPath
        };
        
      } else {
        throw new Error('Test button not found');
      }
      
    } catch (error) {
      console.log(`  ⚠️  Could not interact with wizard: ${error.message}`);
      
      // Still take a screenshot of the test page
      const errorScreenshotPath = path.join(SNAPSHOTS_DIR, `${combination.language}-${combination.jurisdiction}-error.png`);
      await page.screenshot({ 
        path: errorScreenshotPath,
        fullPage: true 
      });
      
      return {
        combination,
        success: false,
        error: error.message,
        screenshots: [errorScreenshotPath]
      };
    }
    
  } catch (error) {
    console.log(`  ❌ Failed to load test page: ${error.message}`);
    return {
      combination,
      success: false,
      error: error.message
    };
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('🚀 Starting Will Wizard Language-Jurisdiction Combination Tests');
  console.log(`📍 Testing ${COMBINATIONS.length} combinations`);
  console.log(`🌐 Base URL: ${BASE_URL}`);
  
  await ensureSnapshotsDirectory();
  
  const browser = await puppeteer.launch({ 
    headless: false, // Set to true for headless testing
    defaultViewport: { width: 1200, height: 800 }
  });
  
  const results = [];
  
  try {
    // Test server availability
    const testPage = await browser.newPage();
    try {
      await testPage.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
      console.log('✅ Server is running and accessible');
    } catch (error) {
      console.log('❌ Server not accessible. Please ensure dev server is running on port 8082');
      process.exit(1);
    }
    await testPage.close();
    
    // Test each combination
    for (let i = 0; i < COMBINATIONS.length; i++) {
      const combination = COMBINATIONS[i];
      console.log(`\n📊 Progress: ${i + 1}/${COMBINATIONS.length}`);
      
      const result = await testCombination(browser, combination);
      results.push(result);
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
  } finally {
    await browser.close();
  }
  
  // Generate summary report
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successfulTests.length}/${COMBINATIONS.length}`);
  console.log(`❌ Failed: ${failedTests.length}/${COMBINATIONS.length}`);
  
  if (successfulTests.length > 0) {
    console.log('\n✅ SUCCESSFUL TESTS:');
    successfulTests.forEach(result => {
      console.log(`  • ${result.combination.language}-${result.combination.jurisdiction}: ${result.combination.label}`);
    });
  }
  
  if (failedTests.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failedTests.forEach(result => {
      console.log(`  • ${result.combination.language}-${result.combination.jurisdiction}: ${result.error}`);
    });
  }
  
  // Save detailed results
  const reportPath = path.join(SNAPSHOTS_DIR, 'test-results.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed results saved to: ${reportPath}`);
  console.log(`📁 All snapshots saved to: ${SNAPSHOTS_DIR}`);
  
  console.log('\n🎯 EXPECTED FILE ROUTING:');
  COMBINATIONS.forEach(combo => {
    console.log(`  • ${combo.language}-${combo.jurisdiction} → /public/locales/content/wills/${combo.language}_${combo.jurisdiction}.json`);
  });
  
  process.exit(failedTests.length > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}
