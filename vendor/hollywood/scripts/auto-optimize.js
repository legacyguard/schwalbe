#!/usr/bin/env node

/**
 * LegacyGuard Master Performance Automation
 * Runs all performance optimizations automatically
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class MasterAutomation {
  constructor() {
    this.steps = [
      {
        name: 'Image Optimization',
        script: 'image-optimizer.js',
        required: true,
      },
      {
        name: 'Performance Automation',
        script: 'performance-automation.js',
        required: true,
      },
      {
        name: 'Performance Testing',
        script: 'performance-tester.js',
        required: false,
      },
      { name: 'Bundle Analysis', script: 'analyze-bundle.js', required: false },
    ];

    this.results = {
      completed: [],
      failed: [],
      warnings: [],
      startTime: new Date(),
      endTime: null,
    };
  }

  async run() {
    console.log('🚀 Starting LegacyGuard Master Performance Automation...\n');
    console.log('This will run all performance optimizations automatically.\n');

    try {
      // Check prerequisites
      await this.checkPrerequisites();

      // Run each optimization step
      for (const step of this.steps) {
        await this.runStep(step);
      }

      // Generate master report
      await this.generateMasterReport();

      // Update package.json with automation scripts
      await this.updatePackageScripts();

      // Display final summary
      this.displaySummary();
    } catch (error) {
      console.error('❌ Master automation failed:', error.message);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('🔍 Checking prerequisites...');

    // Check if scripts directory exists
    const scriptsDir = path.join(projectRoot, 'scripts');
    try {
      await fs.access(scriptsDir);
    } catch {
      throw new Error(
        'Scripts directory not found. Please run this from the project root.'
      );
    }

    // Check if package.json exists
    const packagePath = path.join(projectRoot, 'package.json');
    try {
      await fs.access(packagePath);
    } catch {
      throw new Error(
        'package.json not found. Please run this from the project root.'
      );
    }

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    if (majorVersion < 16) {
      throw new Error(`Node.js 16+ required. Current version: ${nodeVersion}`);
    }

    console.log('✅ All prerequisites met');
  }

  async runStep(step) {
    console.log(`\n🔄 Running: ${step.name}`);

    try {
      const scriptPath = path.join(projectRoot, 'scripts', step.script);

      // Check if script exists
      try {
        await fs.access(scriptPath);
      } catch {
        if (step.required) {
          throw new Error(`Required script not found: ${step.script}`);
        } else {
          console.log(`   ⚠️  Script not found: ${step.script} (skipping)`);
          this.results.warnings.push(`${step.name}: Script not found`);
          return;
        }
      }

      // Run the script
      const startTime = Date.now();
      execSync(`node ${scriptPath}`, {
        stdio: 'inherit',
        cwd: projectRoot,
        env: { ...process.env, NODE_ENV: 'production' },
      });
      const duration = Date.now() - startTime;

      console.log(`   ✅ ${step.name} completed in ${duration}ms`);
      this.results.completed.push({
        name: step.name,
        duration,
        script: step.script,
      });
    } catch (error) {
      console.log(`   ❌ ${step.name} failed: ${error.message}`);

      if (step.required) {
        this.results.failed.push({
          name: step.name,
          error: error.message,
          script: step.script,
        });
      } else {
        this.results.warnings.push(`${step.name}: ${error.message}`);
      }
    }
  }

  async generateMasterReport() {
    console.log('\n📊 Generating master automation report...');

    this.results.endTime = new Date();
    const totalDuration = this.results.endTime - this.results.startTime;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSteps: this.steps.length,
        completed: this.results.completed.length,
        failed: this.results.failed.length,
        warnings: this.results.warnings.length,
        totalDuration: totalDuration,
        successRate: (
          (this.results.completed.length / this.steps.length) *
          100
        ).toFixed(1),
      },
      steps: this.steps.map(step => ({
        name: step.name,
        script: step.script,
        required: step.required,
        status: this.getStepStatus(step.name),
      })),
      results: {
        completed: this.results.completed,
        failed: this.results.failed,
        warnings: this.results.warnings,
      },
      recommendations: this.generateRecommendations(),
      nextSteps: this.getNextSteps(),
    };

    const reportPath = path.join(projectRoot, 'master-automation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    await this.generateHTMLReport(report);

    console.log(`   ✅ Master report saved to: ${reportPath}`);
  }

  getStepStatus(stepName) {
    if (this.results.completed.find(r => r.name === stepName)) {
      return 'completed';
    } else if (this.results.failed.find(r => r.name === stepName)) {
      return 'failed';
    } else {
      return 'skipped';
    }
  }

  generateRecommendations() {
    const recommendations = [];

    if (this.results.failed.length > 0) {
      recommendations.push(
        'Address failed optimization steps before deployment'
      );
    }

    if (this.results.warnings.length > 0) {
      recommendations.push('Review warnings and consider addressing them');
    }

    if (this.results.completed.length === this.steps.length) {
      recommendations.push(
        'All optimizations completed successfully - ready for production'
      );
    }

    return recommendations;
  }

  getNextSteps() {
    const nextSteps = [
      'Review generated reports for detailed insights',
      'Test the optimized application thoroughly',
      'Deploy with confidence knowing performance is optimized',
      'Set up continuous performance monitoring',
      'Schedule regular optimization runs',
    ];

    if (this.results.failed.length > 0) {
      nextSteps.unshift('Fix failed optimization steps and re-run automation');
    }

    return nextSteps;
  }

  async generateHTMLReport(report) {
    const htmlContent = this.generateHTMLContent(report);
    const htmlPath = path.join(projectRoot, 'master-automation-report.html');

    await fs.writeFile(htmlPath, htmlContent);
    console.log(`   ✅ HTML report saved to: ${htmlPath}`);
  }

  generateHTMLContent(report) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LegacyGuard Master Automation Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { margin: 0 0 10px 0; color: #495057; }
        .summary-card .value { font-size: 2em; font-weight: bold; }
        .summary-card.success .value { color: #28a745; }
        .summary-card.warning .value { color: #ffc107; }
        .summary-card.danger .value { color: #dc3545; }
        .steps { margin-bottom: 30px; }
        .step-card { background: #f8f9fa; padding: 20px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #007bff; }
        .step-card.completed { border-left-color: #28a745; }
        .step-card.failed { border-left-color: #dc3545; }
        .step-card.skipped { border-left-color: #6c757d; }
        .step-card h4 { margin: 0 0 15px 0; color: #495057; }
        .status { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
        .status.completed { background: #d4edda; color: #155724; }
        .status.failed { background: #f8d7da; color: #721c24; }
        .status.skipped { background: #e2e3e5; color: #383d41; }
        .recommendations { background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px; }
        .recommendations h3 { margin: 0 0 15px 0; color: #856404; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        .recommendations li { margin-bottom: 8px; color: #856404; }
        .next-steps { background: #e9ecef; padding: 20px; border-radius: 8px; }
        .next-steps h3 { margin: 0 0 15px 0; color: #495057; }
        .next-steps ul { margin: 0; padding-left: 20px; }
        .next-steps li { margin-bottom: 8px; color: #495057; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 LegacyGuard Master Automation Report</h1>
            <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card success">
                <h3>Success Rate</h3>
                <div class="value">${report.summary.successRate}%</div>
            </div>
            <div class="summary-card success">
                <h3>Completed</h3>
                <div class="value">${report.summary.completed}</div>
            </div>
            <div class="summary-card ${report.summary.failed > 0 ? 'danger' : 'success'}">
                <h3>Failed</h3>
                <div class="value">${report.summary.failed}</div>
            </div>
            <div class="summary-card ${report.summary.warnings > 0 ? 'warning' : 'success'}">
                <h3>Warnings</h3>
                <div class="value">${report.summary.warnings}</div>
            </div>
            <div class="summary-card">
                <h3>Duration</h3>
                <div class="value">${Math.round(report.summary.totalDuration / 1000)}s</div>
            </div>
        </div>
        
        <div class="steps">
            <h2>Optimization Steps</h2>
            ${report.steps
              .map(
                step => `
                <div class="step-card ${step.status}">
                    <h4>${step.name}</h4>
                    <div style="margin-bottom: 10px;">
                        <strong>Script:</strong> ${step.script}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong>Required:</strong> ${step.required ? 'Yes' : 'No'}
                    </div>
                    <div>
                        <span class="status ${step.status}">${step.status.toUpperCase()}</span>
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
        
        <div class="next-steps">
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
      packageJson.scripts['auto:optimize'] = 'node scripts/auto-optimize.js';
      packageJson.scripts['auto:performance'] =
        'node scripts/performance-automation.js';
      packageJson.scripts['auto:images'] = 'node scripts/image-optimizer.js';
      packageJson.scripts['auto:test'] = 'node scripts/performance-tester.js';
      packageJson.scripts['build:auto'] =
        'npm run auto:optimize && npm run build';

      await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Updated package.json with automation scripts');
    } catch (error) {
      console.log(`⚠️  Failed to update package.json: ${error.message}`);
    }
  }

  displaySummary() {
    console.log('\n🎉 Master Performance Automation Complete!');
    console.log('='.repeat(50));

    const totalDuration = this.results.endTime - this.results.startTime;
    const successRate = (
      (this.results.completed.length / this.steps.length) *
      100
    ).toFixed(1);

    console.log(`📊 Summary:`);
    console.log(`   Total Steps: ${this.steps.length}`);
    console.log(`   Completed: ${this.results.completed.length}`);
    console.log(`   Failed: ${this.results.failed.length}`);
    console.log(`   Warnings: ${this.results.warnings.length}`);
    console.log(`   Success Rate: ${successRate}%`);
    console.log(`   Total Duration: ${Math.round(totalDuration / 1000)}s`);

    if (this.results.completed.length === this.steps.length) {
      console.log('\n🎯 All optimizations completed successfully!');
      console.log('Your application is now fully optimized for performance.');
    } else if (this.results.failed.length > 0) {
      console.log(
        '\n⚠️  Some optimizations failed. Please review the failed steps.'
      );
    }

    console.log('\n📁 Reports generated:');
    console.log('   - master-automation-report.json');
    console.log('   - master-automation-report.html');
    console.log('   - performance-report.json (if performance automation ran)');
    console.log(
      '   - image-optimization-report.json (if image optimization ran)'
    );

    console.log('\n🚀 Next steps:');
    console.log('   - Review the generated reports');
    console.log('   - Test your optimized application');
    console.log('   - Deploy with confidence');
    console.log('   - Set up continuous monitoring');

    console.log('\n💡 Automation scripts added to package.json:');
    console.log('   - npm run auto:optimize (runs all optimizations)');
    console.log(
      '   - npm run auto:performance (performance optimization only)'
    );
    console.log('   - npm run auto:images (image optimization only)');
    console.log('   - npm run build:auto (optimize then build)');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const automation = new MasterAutomation();
  automation.run();
}

export default MasterAutomation;
