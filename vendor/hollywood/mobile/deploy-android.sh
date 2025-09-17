#!/bin/bash

# Android Deployment Script for LegacyGuard Mobile App
# This script guides you through the complete Android deployment process

set -e

echo "🚀 LegacyGuard Android Deployment Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    print_error "EAS CLI is not installed. Please run: npm install -g eas-cli"
    exit 1
fi

print_success "EAS CLI is installed: $(eas --version)"

# Check if user is logged in
if ! eas whoami &> /dev/null; then
    print_warning "You are not logged in to Expo. Please run: eas login"
    print_status "You can create an account at: https://expo.dev/signup"
    exit 1
fi

print_success "Logged in as: $(eas whoami)"

# Initialize EAS project if needed
print_status "Configuring EAS project..."
eas project:init --non-interactive || true

# Build development APK for testing
print_status "Building development APK for testing..."
eas build --platform android --profile development

print_success "Development build completed! You can download the APK from the Expo dashboard."

# Ask if user wants to build production version
echo ""
read -p "Do you want to build the production version (AAB for Google Play Store)? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Building production AAB for Google Play Store..."
    eas build --platform android --profile production
    
    print_success "Production build completed!"
    print_status "You can now upload the AAB file to Google Play Console"
    print_status "Download link will be available in the Expo dashboard"
fi

echo ""
print_success "🎉 Android deployment process completed!"
echo ""
print_status "Next steps:"
echo "1. Download your APK/AAB from the Expo dashboard"
echo "2. Test the APK on Android devices"
echo "3. Upload the AAB to Google Play Console for production release"
echo ""
print_status "Expo Dashboard: https://expo.dev/accounts/legacyguard/projects/legacyguard-mobile"
