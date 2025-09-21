# 📄 OCR & AI Document Processing Setup Guide

This guide explains how to set up and configure the comprehensive OCR functionality with Google Cloud Vision AI for LegacyGuard.

## 🔧 Google Cloud Console Setup

### 1. Create/Setup Google Cloud Project

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project or select existing one**
3. **Enable required APIs:**
   - Cloud Vision API
   - Document AI API (for advanced processing)

```bash
gcloud services enable vision.googleapis.com
gcloud services enable documentai.googleapis.com
```text

### 2. Create Service Account

1. **Navigate to IAM & Admin > Service Accounts**
2. **Click "Create Service Account"**
3. **Fill in details:**
   - Name: `legacyguard-ocr-service`
   - Description: `Service account for OCR processing`
4. **Grant roles:**
   - `Cloud Vision AI Service Agent`
   - `Document AI API User`
5. **Create and download JSON key file**

### 3. Environment Variables Setup

Add these environment variables to your `.env.local`:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_ID=your-client-id
GOOGLE_CLOUD_PRIVATE_KEY_ID=your-key-id

# Optional: For client-side processing (less secure)
NEXT_PUBLIC_GOOGLE_CLOUD_API_KEY=your-api-key
NEXT_PUBLIC_GOOGLE_CLOUD_PROJECT_ID=your-project-id
```text

**⚠️ Security Notes:**
- Never commit the `.env.local` file
- Use server-side processing for production
- The private key should have all `\n` properly escaped

### 4. Vercel Deployment Setup

For Vercel deployment, add environment variables in the dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add all the environment variables listed above

## 🚀 Features Implemented

### 📱 **Document Scanner Component**
- **File Upload**: Drag & drop or click to upload
- **Format Support**: Images (PNG, JPG, GIF, WebP) and PDFs up to 10MB
- **Live Preview**: Visual preview of uploaded documents
- **Processing Options**: Configurable AI processing settings

### 🤖 **AI Processing Capabilities**

#### **Text Extraction (OCR)**
- High-accuracy text recognition using Google Cloud Vision
- Multi-language support with auto-detection
- Confidence scoring for extracted text
- Bounding box coordinates for text positioning

#### **Smart Document Classification**
Automatically categorizes documents into:
- **Legal**: Wills, trusts, power of attorney, contracts
- **Financial**: Bank statements, tax returns, investment accounts
- **Medical**: Medical records, prescriptions, health insurance
- **Insurance**: Life, auto, home, disability insurance
- **Personal**: Birth certificates, passports, driver's licenses
- **Property**: Deeds, tax records, appraisals
- **Business**: Licenses, contracts, tax documents
- **Government**: Tax documents, benefits, voter registration

#### **Entity Extraction**
Automatically extracts:
- **Personal Info**: Names, addresses, phone numbers
- **Financial Data**: Account numbers, amounts, dates
- **Identification**: SSNs, policy numbers, ID numbers
- **Dates**: Expiration dates, birth dates, issue dates
- **Contact Info**: Email addresses, phone numbers

#### **Metadata Extraction**
Document-specific metadata:
- **Banking**: Account numbers, institution names, balances
- **Insurance**: Policy numbers, coverage amounts, deductibles
- **Legal**: Legal entities, jurisdictions, witness requirements
- **Medical**: Patient names, doctors, diagnoses, medications

### 📊 **Enhanced Document Management**

#### **Smart Search**
- **Full-text search** through OCR-extracted content
- **Metadata search** across all extracted fields
- **Category and tag filtering**
- **Advanced sorting** by importance, confidence, date

#### **Importance Scoring**
Automatic calculation based on:
- User-marked important flag (+50 points)
- Expiration urgency (up to +40 points)
- Classification confidence (+20 points)
- Content-based tags (+10-30 points)

#### **Visual Indicators**
- **AI Processing badges** showing processing status
- **Confidence scores** for OCR and classification
- **Expiration warnings** with color-coded alerts
- **Category-specific icons** for quick identification

## 🛠️ Usage Examples

### Basic Document Upload with OCR
```jsx
import DocumentScanner from '@/components/features/DocumentScanner';

function MyComponent() {
  const handleDocumentProcessed = (processedDoc) => {
    console.log('OCR Text:', processedDoc.ocrResult.text);
    console.log('Document Type:', processedDoc.classification.type);
    console.log('Extracted Entities:', processedDoc.ocrResult.metadata.extractedEntities);
  };

  return (
    <DocumentScanner 
      onDocumentProcessed={handleDocumentProcessed}
    />
  );
}
```text

### Enhanced Document Uploader
```jsx
import EnhancedDocumentUploader from '@/components/features/EnhancedDocumentUploader';

function VaultPage() {
  const handleUploadComplete = (document) => {
    // Document saved to database with OCR data
    console.log('Document saved:', document);
  };

  return (
    <EnhancedDocumentUploader 
      onUploadComplete={handleUploadComplete}
    />
  );
}
```text

### Document List with Search
```jsx
import EnhancedDocumentList from '@/components/features/EnhancedDocumentList';

function DocumentsPage() {
  const [documents, setDocuments] = useState([]);

  return (
    <EnhancedDocumentList 
      documents={documents}
      onDocumentSelect={(doc) => console.log('Selected:', doc)}
    />
  );
}
```text

## 🗄️ Database Schema

The OCR system extends the existing documents table with these fields:

```sql
-- Core document info
category TEXT                    -- Document category (legal, financial, etc.)
title TEXT                      -- Human-readable title
description TEXT                -- Document description
tags TEXT[]                     -- Array of tags
is_important BOOLEAN            -- Important flag

-- OCR data
ocr_text TEXT                   -- Full extracted text
ocr_confidence DECIMAL(3,2)     -- OCR accuracy (0-1)
extracted_entities JSONB        -- Extracted entities (names, dates, etc.)
classification_confidence DECIMAL(3,2) -- Classification confidence
extracted_metadata JSONB        -- Document-specific metadata
processing_status TEXT          -- Processing status
```text

## 🔍 API Endpoints

### `/api/process-document`
Processes documents with Google Cloud Vision AI.

**Request:**
```json
{
  "fileData": "base64_encoded_file_data",
  "fileName": "document.pdf",
  "config": {
    "enableEntityExtraction": true,
    "enableDocumentClassification": true,
    "enableMetadataExtraction": true,
    "confidenceThreshold": 0.7,
    "processingMode": "accurate"
  }
}
```text

**Response:**
```json
{
  "success": true,
  "processedDocument": {
    "id": "ocr_12345_abc",
    "ocrResult": {
      "text": "Extracted text content...",
      "confidence": 0.95,
      "detectedLanguage": "en",
      "metadata": {
        "extractedEntities": [
          {
            "type": "email",
            "value": "john@example.com",
            "confidence": 0.9
          }
        ]
      }
    },
    "classification": {
      "category": "financial",
      "type": "bank_statement",
      "confidence": 0.87,
      "suggestedTags": ["financial", "important"]
    },
    "extractedMetadata": {
      "accountNumber": "****1234",
      "institutionName": "Example Bank"
    }
  }
}
```text

## 🔐 Security Considerations

1. **Server-side Processing**: All OCR processing happens server-side for security
2. **Environment Variables**: Store credentials securely, never in client code
3. **RLS Policies**: Database-level security ensures users only see their documents
4. **File Size Limits**: 10MB limit prevents abuse
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints

## 🧪 Testing

To test the OCR functionality:

1. **Upload test documents** of different types (bank statements, legal docs, etc.)
2. **Verify text extraction** accuracy for your document types
3. **Check classification results** for proper categorization
4. **Test entity extraction** for your specific use cases
5. **Validate metadata extraction** for document-specific fields

## 📈 Performance Optimization

1. **Client-side Resizing**: Resize large images before upload
2. **Background Processing**: Consider queue-based processing for large files
3. **Caching**: Cache frequently accessed OCR results
4. **Chunking**: Split large documents into smaller chunks
5. **Preprocessing**: Enhance image quality before OCR

## 🚨 Error Handling

The system includes comprehensive error handling for:
- **Invalid file formats** or sizes
- **Google Cloud API errors** (rate limits, authentication)
- **Network connectivity issues**
- **Processing timeouts**
- **Database storage errors**

## 💰 Cost Considerations

Google Cloud Vision API pricing (as of 2024):
- **Text Detection**: $1.50 per 1,000 requests
- **Document Text Detection**: $3.00 per 1,000 requests
- **Free tier**: 1,000 requests per month

Monitor usage in Google Cloud Console to track costs.

## 🎯 Next Steps

1. **Set up Google Cloud project** and credentials
2. **Configure environment variables** in your deployment
3. **Run database migrations** to add OCR support
4. **Test with sample documents** to verify functionality
5. **Integrate with existing document upload flows**

The OCR system is now ready to significantly enhance LegacyGuard's document management capabilities with intelligent text extraction and automatic categorization! 🚀
