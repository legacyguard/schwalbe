import type { FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Global teardown for Guardian Journey tests
 * Cleans up test artifacts and generates reports
 */
async function globalTeardown(_config: FullConfig) {
  // console.error('🧹 Starting Guardian Journey test cleanup...');

  try {
    // Create reports directory if it doesn't exist
    const reportsDir = 'playwright-report/guardian';
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Create screenshots directory summary
    const screenshotsDir = 'tests/screenshots';
    if (fs.existsSync(screenshotsDir)) {
      const screenshots = fs
        .readdirSync(screenshotsDir)
        .filter(file => file.startsWith('guardian-'))
        .sort();

      if (screenshots.length > 0) {
        // console.error('📸 Screenshots captured:');
        screenshots.forEach(screenshot => {
          // console.error(`  - ${screenshot}`);
        });

        // Create an index of screenshots
        const screenshotIndex = {
          testRun: new Date().toISOString(),
          screenshots: screenshots.map(filename => ({
            filename,
            step: filename.replace('guardian-', '').replace('.png', ''),
            path: path.join(screenshotsDir, filename),
          })),
        };

        fs.writeFileSync(
          path.join(reportsDir, 'screenshot-index.json'),
          JSON.stringify(screenshotIndex, null, 2)
        );

        // console.error(`✅ Screenshot index created: ${screenshots.length} screenshots`);
      }
    }

    // Create videos directory summary
    const videosDir = 'tests/videos/guardian-journey';
    if (fs.existsSync(videosDir)) {
      const videos = fs
        .readdirSync(videosDir)
        .filter(file => file.endsWith('.webm'));

      if (videos.length > 0) {
        // console.error('🎥 Videos recorded:');
        videos.forEach(video => {
          // console.error(`  - ${video}`);
        });

        // console.error(`✅ Video recordings available: ${videos.length} videos`);
      }
    }

    // Optional: Clean up temporary test data
    // You could add cleanup of test users, uploaded files, etc.
  } catch (_error) {
    // console.error('⚠️ Error during cleanup:', error);
    // Don't throw - cleanup failures shouldn't fail the entire test run
  }

  // console.error('✅ Global teardown complete');
}

export default globalTeardown;
