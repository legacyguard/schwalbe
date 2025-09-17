#!/usr/bin/env node

/**
 * Simple OCR Test Script
 * Tests Google Cloud Vision API connectivity and basic OCR functionality
 */

const { ImageAnnotatorClient } = require('@google-cloud/vision');
require('dotenv').config({ path: '.env.local' });

async function testOCRSetup() {
  console.log('🧪 Testing OCR Setup...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  const requiredVars = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_CLIENT_EMAIL',
    'GOOGLE_CLOUD_PRIVATE_KEY',
    'GOOGLE_CLOUD_CLIENT_ID',
    'GOOGLE_CLOUD_PRIVATE_KEY_ID',
  ];

  let allVarsPresent = true;
  requiredVars.forEach(varName => {
    const isPresent = !!process.env[varName];
    console.log(
      `  ${isPresent ? '✅' : '❌'} ${varName}: ${isPresent ? 'Set' : 'Missing'}`
    );
    if (!isPresent) allVarsPresent = false;
  });

  if (!allVarsPresent) {
    console.log(
      '\n❌ Missing required environment variables. Please check .env.local'
    );
    process.exit(1);
  }

  // Test Google Cloud client initialization
  console.log('\n🔧 Initializing Google Cloud Vision client...');
  try {
    const client = new ImageAnnotatorClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
        client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
        private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
      },
    });
    console.log('✅ Google Cloud Vision client initialized successfully');

    // Test basic text detection with a simple text image
    console.log('\n🔍 Testing text detection...');

    // Create a simple test image (base64 encoded "Hello World" text)
    const testImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    );

    // Note: This is a minimal test. For a real test, you'd need an actual image with text
    console.log('  📄 Using minimal test image...');
    console.log(
      '  ⚠️  Note: For full testing, upload an actual document image'
    );

    const [result] = await client.textDetection({
      image: {
        content: testImage,
      },
    });

    console.log('✅ API call successful');

    if (result.textAnnotations && result.textAnnotations.length > 0) {
      console.log(
        `✅ Text detected: "${result.textAnnotations[0].description}"`
      );
    } else {
      console.log('ℹ️  No text detected (expected with minimal test image)');
    }
  } catch (error) {
    console.log('❌ Error testing Google Cloud Vision API:');
    console.error(error.message);

    if (error.code === 7) {
      console.log('\n💡 This might be a permission issue. Make sure:');
      console.log(
        '  1. The Cloud Vision API is enabled in your Google Cloud project'
      );
      console.log('  2. The service account has the correct roles');
      console.log('  3. The credentials are correctly formatted');
    }

    process.exit(1);
  }

  // Test project configuration
  console.log('\n📊 Project Configuration:');
  console.log(`  🆔 Project ID: ${process.env.GOOGLE_CLOUD_PROJECT_ID}`);
  console.log(`  📧 Service Account: ${process.env.GOOGLE_CLOUD_CLIENT_EMAIL}`);
  console.log(
    `  🔐 Private Key ID: ${process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID}`
  );

  // API pricing estimate
  console.log('\n💰 Pricing Information:');
  console.log('  📄 Text Detection: $1.50 per 1,000 requests');
  console.log('  📑 Document Text Detection: $3.00 per 1,000 requests');
  console.log('  🆓 Free tier: 1,000 requests per month');
  console.log(
    '  📊 Monitor usage: https://console.cloud.google.com/apis/api/vision.googleapis.com'
  );

  console.log('\n🎉 OCR setup test completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('  1. Start the development server: npm run dev');
  console.log('  2. Navigate to a page with document upload');
  console.log('  3. Upload a document image to test full OCR functionality');
  console.log('  4. Monitor Google Cloud Console for API usage');

  process.exit(0);
}

// Run the test
testOCRSetup().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
