#!/usr/bin/env node

/**
 * LegacyGuard Performance Testing Automation
 * Runs automated performance tests and validates metrics
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class PerformanceTester {
  constructor() {
    this.config = {
      lighthouseConfig: {
        extends: 'lighthouse:default',
        settings: {
          onlyCategories: [
            'performance',
            'accessibility',
            'best-practices',
            'seo',
          ],
          formFactor: 'desktop',
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0,
          },
        },
      },
      thresholds: {
        performance: 90,
        accessibility: 90,
        bestPractices: 90,
        seo: 90,
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        fcp: 1800,
        ttfb: 600,
      },
      outputDir: path.join(projectRoot, 'performance-reports'),
      distDir: path.join(projectRoot, 'dist'),
    };

    this.results = {
      tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        averageScore: 0,
      },
    };
  }

  async run() {
    console.log('🧪 Starting LegacyGuard Performance Testing...\n');

    try {
      // Check if build exists
      await this.checkBuild();

      // Install dependencies if needed
      await this.checkDependencies();

      // Run performance tests
      await this.runPerformanceTests();

      // Generate test report
      await this.generateTestReport();

      // Update package.json scripts
      await this.updatePackageScripts();

      console.log('\n✅ Performance testing completed successfully!');
      console.log(`\n📊 Test Summary:`);
      console.log(`   Total tests: ${this.results.summary.total}`);
      console.log(`   Passed: ${this.results.summary.passed}`);
      console.log(`   Failed: ${this.results.summary.failed}`);
      console.log(
        `   Average score: ${this.results.summary.averageScore.toFixed(1)}%`
      );
    } catch (error) {
      console.error('❌ Performance testing failed:', error.message);
      process.exit(1);
    }
  }

  async checkBuild() {
    try {
      await fs.access(this.config.distDir);
      console.log('✅ Build directory found');
    } catch {
      console.log('📦 Building project...');
      execSync('npm run build', { stdio: 'inherit' });
    }
  }

  async checkDependencies() {
    const requiredPackages = ['lighthouse', 'puppeteer'];

    for (const pkg of requiredPackages) {
      try {
        require.resolve(pkg);
      } catch {
        console.log(`📦 Installing ${pkg}...`);
        execSync(`npm install --save-dev ${pkg} --legacy-peer-deps`, {
          stdio: 'inherit',
        });
      }
    }

    console.log('✅ All dependencies are available');
  }

  async runPerformanceTests() {
    console.log('\n🧪 Running performance tests...');

    // Create output directory
    await fs.mkdir(this.config.outputDir, { recursive: true });

    // Test scenarios
    const testScenarios = [
      { name: 'Homepage', path: '/', priority: 'high' },
      { name: 'Legal Pages', path: '/terms-of-service', priority: 'medium' },
      { name: 'Privacy Policy', path: '/privacy-policy', priority: 'medium' },
      { name: 'Security Policy', path: '/security-policy', priority: 'medium' },
    ];

    for (const scenario of testScenarios) {
      await this.runLighthouseTest(scenario);
    }
  }

  async runLighthouseTest(scenario) {
    try {
      console.log(`   Testing: ${scenario.name}`);

      const lighthouse = await import('lighthouse');
      const puppeteer = await import('puppeteer');

      // Launch browser
      const browser = await puppeteer.default.launch({ headless: true });
      const page = await browser.newPage();

      // Navigate to page
      const url = `http://localhost:4173${scenario.path}`;
      await page.goto(url, { waitUntil: 'networkidle0' });

      // Run Lighthouse
      const { lhr } = await lighthouse.default(page, {
        port: new URL(browser.wsEndpoint()).port,
        output: 'json',
        logLevel: 'info',
      });

      // Process results
      const testResult = this.processLighthouseResult(scenario, lhr);
      this.results.tests.push(testResult);

      // Save detailed report
      await this.saveDetailedReport(scenario, lhr);

      await browser.close();

      console.log(`     ✅ ${scenario.name}: ${testResult.score}%`);
    } catch (error) {
      console.log(`     ❌ ${scenario.name}: ${error.message}`);

      this.results.tests.push({
        name: scenario.name,
        score: 0,
        passed: false,
        errors: [error.message],
      });
    }
  }

  processLighthouseResult(scenario, lhr) {
    const score = Math.round(lhr.categories.performance.score * 100);
    const passed = score >= this.config.thresholds.performance;

    // Check Core Web Vitals
    const audits = lhr.audits;
    const metrics = {
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      fid: audits['max-potential-fid']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      fcp: audits['first-contentful-paint']?.numericValue || 0,
      ttfb: audits['server-response-time']?.numericValue || 0,
    };

    const metricChecks = {
      lcp: metrics.lcp <= this.config.thresholds.lcp,
      fid: metrics.fid <= this.config.thresholds.fid,
      cls: metrics.cls <= this.config.thresholds.cls,
      fcp: metrics.fcp <= this.config.thresholds.fcp,
      ttfb: metrics.ttfb <= this.config.thresholds.ttfb,
    };

    return {
      name: scenario.name,
      score,
      passed,
      priority: scenario.priority,
      metrics,
      metricChecks,
      timestamp: new Date().toISOString(),
    };
  }

  async saveDetailedReport(scenario, lhr) {
    const reportPath = path.join(
      this.config.outputDir,
      `${scenario.name.toLowerCase().replace(/\s+/g, '-')}-lighthouse.json`
    );

    await fs.writeFile(reportPath, JSON.stringify(lhr, null, 2));
  }

  async generateTestReport() {
    console.log('\n📊 Generating test report...');

    // Calculate summary
    this.results.summary.total = this.results.tests.length;
    this.results.summary.passed = this.results.tests.filter(
      t => t.passed
    ).length;
    this.results.summary.failed =
      this.results.summary.total - this.results.summary.passed;

    const totalScore = this.results.tests.reduce(
      (sum, test) => sum + test.score,
      0
    );
    this.results.summary.averageScore = totalScore / this.results.summary.total;

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results.summary,
      tests: this.results.tests,
      recommendations,
      nextSteps: this.getNextSteps(),
    };

    const reportPath = path.join(
      this.config.outputDir,
      'performance-test-report.json'
    );
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    await this.generateHTMLReport(report);

    console.log(`   ✅ Test report saved to: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];

    // Performance score recommendations
    if (this.results.summary.averageScore < 90) {
      recommendations.push('Overall performance score needs improvement');
    }

    // Metric-specific recommendations
    const failedTests = this.results.tests.filter(t => !t.passed);

    for (const test of failedTests) {
      if (!test.metricChecks.lcp) {
        recommendations.push(
          `${test.name}: LCP is too slow - optimize hero images and critical content`
        );
      }
      if (!test.metricChecks.fid) {
        recommendations.push(
          `${test.name}: FID is too high - reduce JavaScript execution time`
        );
      }
      if (!test.metricChecks.cls) {
        recommendations.push(
          `${test.name}: CLS is too high - fix layout shifts`
        );
      }
      if (!test.metricChecks.fcp) {
        recommendations.push(
          `${test.name}: FCP is too slow - optimize critical rendering path`
        );
      }
      if (!test.metricChecks.ttfb) {
        recommendations.push(
          `${test.name}: TTFB is too slow - optimize server response`
        );
      }
    }

    return recommendations;
  }

  getNextSteps() {
    return [
      'Address failed performance metrics',
      'Implement suggested optimizations',
      'Set up continuous performance monitoring',
      'Add performance budgets to CI/CD',
      'Monitor Core Web Vitals in production',
    ];
  }

  async generateHTMLReport(report) {
    const htmlContent = this.generateHTMLContent(report);
    const htmlPath = path.join(
      this.config.outputDir,
      'performance-report.html'
    );

    await fs.writeFile(htmlPath, htmlContent);
    console.log(`   ✅ HTML report saved to: ${htmlPath}`);
  }

  generateHTMLContent(report) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LegacyGuard Performance Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #495057; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .tests { margin-bottom: 30px; }
        .test-card { background: #f8f9fa; padding: 20px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .test-card.failed { border-left-color: #dc3545; }
        .test-card h4 { margin: 0 0 15px 0; color: #495057; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .metric { text-align: center; }
        .metric .label { font-size: 0.9em; color: #6c757d; margin-bottom: 5px; }
        .metric .value { font-weight: bold; }
        .metric .status { font-size: 0.8em; padding: 2px 8px; border-radius: 12px; }
        .status.pass { background: #d4edda; color: #155724; }
        .status.fail { background: #f8d7da; color: #721c24; }
        .recommendations { background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; }
        .recommendations h3 { margin: 0 0 15px 0; color: #856404; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        .recommendations li { margin-bottom: 8px; color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 LegacyGuard Performance Test Report</h1>
            <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>Total Tests</h3>
                <div class="value">${report.summary.total}</div>
            </div>
            <div class="summary-card">
                <h3>Passed</h3>
                <div class="value" style="color: #28a745;">${report.summary.passed}</div>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <div class="value" style="color: #dc3545;">${report.summary.failed}</div>
            </div>
            <div class="summary-card">
                <h3>Average Score</h3>
                <div class="value">${report.summary.averageScore.toFixed(1)}%</div>
            </div>
        </div>
        
        <div class="tests">
            <h2>Test Results</h2>
            ${report.tests
              .map(
                test => `
                <div class="test-card ${test.failed ? 'failed' : ''}">
                    <h4>${test.name}</h4>
                    <div style="margin-bottom: 15px;">
                        <strong>Score:</strong> ${test.score}% 
                        <span class="status ${test.passed ? 'pass' : 'fail'}">
                            ${test.passed ? 'PASS' : 'FAIL'}
                        </span>
                    </div>
                    <div class="metrics">
                        <div class="metric">
                            <div class="label">LCP</div>
                            <div class="value">${test.metrics.lcp.toFixed(0)}ms</div>
                            <div class="status ${test.metricChecks.lcp ? 'pass' : 'fail'}">
                                ${test.metricChecks.lcp ? 'PASS' : 'FAIL'}
                            </div>
                        </div>
                        <div class="metric">
                            <div class="label">FID</div>
                            <div class="value">${test.metrics.fid.toFixed(0)}ms</div>
                            <div class="status ${test.metricChecks.fid ? 'pass' : 'fail'}">
                                ${test.metricChecks.fid ? 'PASS' : 'FAIL'}
                            </div>
                        </div>
                        <div class="metric">
                            <div class="label">CLS</div>
                            <div class="value">${test.metrics.cls.toFixed(3)}</div>
                            <div class="status ${test.metricChecks.cls ? 'pass' : 'fail'}">
                                ${test.metricChecks.cls ? 'PASS' : 'FAIL'}
                            </div>
                        </div>
                        <div class="metric">
                            <div class="label">FCP</div>
                            <div class="value">${test.metrics.fcp.toFixed(0)}ms</div>
                            <div class="status ${test.metricChecks.fcp ? 'pass' : 'fail'}">
                                ${test.metricChecks.fcp ? 'PASS' : 'FAIL'}
                            </div>
                        </div>
                        <div class="metric">
                            <div class="label">TTFB</div>
                            <div class="value">${test.metrics.ttfb.toFixed(0)}ms</div>
                            <div class="status ${test.metricChecks.ttfb ? 'pass' : 'fail'}">
                                ${test.metricChecks.ttfb ? 'PASS' : 'FAIL'}
                            </div>
                        </div>
                    </div>
                </div>
            `
              )
              .join('')}
        </div>
        
        ${
          report.recommendations.length > 0
            ? `
            <div class="recommendations">
                <h3>🔧 Recommendations</h3>
                <ul>
                    ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `
            : ''
        }
        
        <div style="margin-top: 30px; padding: 20px; background: #e9ecef; border-radius: 8px;">
            <h3>📋 Next Steps</h3>
            <ul>
                ${report.nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  async updatePackageScripts() {
    try {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      // Add new scripts
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts['test:performance'] =
        'node scripts/performance-tester.js';
      packageJson.scripts['test:all'] =
        'npm run test:performance && npm run test';

      await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json with testing scripts');
    } catch (error) {
      console.log(`⚠️  Failed to update package.json: ${error.message}`);
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new PerformanceTester();
  tester.run();
}

export default PerformanceTester;
