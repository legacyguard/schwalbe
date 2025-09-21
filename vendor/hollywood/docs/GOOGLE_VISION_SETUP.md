# Google Cloud Vision API Setup Guide

## Current Issue

The Google Cloud Vision API requires billing to be enabled on your project. The error message indicates:

- Project ID: #207020946166
- Status: PERMISSION_DENIED - Billing not enabled

## Solution Options

### Option 1: Enable Billing (Recommended for Production)

1. **Enable Billing on Google Cloud**
   - Visit: <https://console.developers.google.com/billing/enable?project=207020946166>
   - Or go to: <https://console.cloud.google.com/>
   - Select your project
   - Navigate to "Billing" in the left menu
   - Link a billing account (you can use the free tier)

2. **Google Cloud Free Tier**
   - $300 free credit for new users
   - Cloud Vision API: 1,000 units free per month
   - No charges if you stay within limits

3. **Enable the Vision API**

   ```bash
   # If you have gcloud CLI installed:
   gcloud services enable vision.googleapis.com
   ```

   Or manually:
   - Go to: <https://console.cloud.google.com/apis/library>
   - Search for "Cloud Vision API"
   - Click "Enable"

4. **Verify Service Account Permissions**
   - Go to: <https://console.cloud.google.com/iam-admin/iam>
   - Find your service account
   - Ensure it has the role: "Cloud Vision API User" or "Editor"

### Option 2: Use Alternative OCR Services (Free Options)

#### A. Tesseract.js (Completely Free, Runs Locally)

```javascript
// Install: npm install tesseract.js
import Tesseract from 'tesseract.js';

const recognizeText = async (imageUrl) => {
  const result = await Tesseract.recognize(
    imageUrl,
    'eng+slk+ces', // English + Slovak + Czech
    { logger: m => console.log(m) }
  );
  return result.data.text;
};
```

#### B. Microsoft Azure Computer Vision (Free Tier Available)

- 5,000 transactions free per month
- No credit card required for free tier
- Good accuracy for documents

#### C. AWS Textract (Free Tier)

- 1,000 pages per month free
- Good for structured documents

### Option 3: Implement Fallback Strategy

Create a multi-provider OCR service that falls back to alternatives:

```typescript
// src/services/ocr-service.ts
class OCRService {
  async extractText(imageUrl: string): Promise<string> {
    try {
      // Try Google Vision first
      return await this.googleVisionOCR(imageUrl);
    } catch (error) {
      console.warn('Google Vision failed, trying Tesseract...');
      // Fallback to Tesseract.js
      return await this.tesseractOCR(imageUrl);
    }
  }
}
```

## Quick Fix for Development

For immediate development needs, you can:

1. **Mock the OCR functionality temporarily**
2. **Use Tesseract.js for local development**
3. **Enable billing when ready for production**

## Setting Up Billing (Step-by-Step)

1. **Go to Google Cloud Console**
   - <https://console.cloud.google.com/>

2. **Select Your Project**
   - Project ID: 207020946166

3. **Navigate to Billing**
   - Click the hamburger menu (☰)
   - Select "Billing"

4. **Link Billing Account**
   - Click "Link a billing account"
   - Create new or select existing
   - Add payment method (won't be charged within free tier)

5. **Set Budget Alerts (Recommended)**
   - Go to "Budgets & alerts"
   - Create budget: $1 (to prevent unexpected charges)
   - Set alert at 50%, 90%, 100%

6. **Wait for Propagation**
   - Takes 2-5 minutes for billing to activate
   - Then retry your OCR test

## Verify Setup

After enabling billing, test again:

```bash
npm run test:ocr
```

## Cost Estimates

For typical usage:

- **1,000 document scans/month**: Free (within free tier)
- **10,000 document scans/month**: ~$15
- **100,000 document scans/month**: ~$150

## Security Notes

- Never commit Google Cloud credentials to git
- Use environment variables for all sensitive data
- Rotate service account keys regularly
- Set up usage quotas to prevent abuse

## Support

If issues persist after enabling billing:

1. Check API quotas: <https://console.cloud.google.com/apis/api/vision.googleapis.com/quotas>
2. Verify service account: <https://console.cloud.google.com/iam-admin/serviceaccounts>
3. Check API dashboard: <https://console.cloud.google.com/apis/api/vision.googleapis.com/metrics>

## Alternative: Local-Only Solution

If you prefer not to use cloud services, we can implement a fully local OCR solution using Tesseract.js. This would be:

- Completely free
- No API limits
- Privacy-focused (no data leaves your server)
- Slightly lower accuracy than Google Vision

Let me know which approach you'd prefer!
