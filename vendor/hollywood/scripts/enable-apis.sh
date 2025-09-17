#!/bin/bash

# Google Cloud APIs Setup Script
# Automatically enables required APIs for LegacyGuard OCR functionality

echo "🚀 Enabling Google Cloud APIs for LegacyGuard OCR..."
echo

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI (gcloud) is not installed."
    echo "📥 Install it from: https://cloud.google.com/sdk/docs/install"
    echo "🔧 Or run: curl https://sdk.cloud.google.com | bash"
    exit 1
fi

# Set the project ID
PROJECT_ID="splendid-light-216311"
echo "🆔 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

echo
echo "🔧 Enabling required APIs..."

# Enable Cloud Vision API
echo "📄 Enabling Cloud Vision API..."
gcloud services enable vision.googleapis.com

# Enable Document AI API (optional, for advanced processing)
echo "📑 Enabling Document AI API..."
gcloud services enable documentai.googleapis.com

# Enable Cloud Resource Manager API (often needed)
echo "🔧 Enabling Cloud Resource Manager API..."
gcloud services enable cloudresourcemanager.googleapis.com

# Enable IAM API (for service account management)
echo "👤 Enabling IAM API..."
gcloud services enable iam.googleapis.com

echo
echo "⏳ Waiting for APIs to propagate (30 seconds)..."
sleep 30

echo
echo "✅ API enablement completed!"
echo
echo "📊 Checking API status..."
gcloud services list --enabled --filter="name:(vision.googleapis.com OR documentai.googleapis.com)"

echo
echo "🧪 Testing OCR setup..."
cd "$(dirname "$0")/.."
npm run test:ocr

echo
echo "🎉 Setup completed! Your OCR functionality should now be ready."
echo "📝 Next steps:"
echo "  1. Start development server: npm run dev"
echo "  2. Upload a document to test OCR functionality"
echo "  3. Monitor API usage: https://console.cloud.google.com/apis/dashboard?project=$PROJECT_ID"