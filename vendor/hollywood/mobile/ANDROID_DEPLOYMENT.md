# Android Deployment Guide for LegacyGuard Mobile App

This guide will walk you through deploying your LegacyGuard mobile app to Android devices and the Google Play Store.

## Prerequisites

- ✅ EAS CLI installed (`npm install -g eas-cli`)
- ✅ Expo account (create at https://expo.dev/signup)
- ✅ Android development environment (optional, for local testing)

## Quick Start

1. **Login to Expo:**
   ```bash
   eas login
   ```

2. **Run the deployment script:**
   ```bash
   ./deploy-android.sh
   ```

## Manual Deployment Steps

### Step 1: Login to Expo

```bash
eas login
```

If you don't have an account, create one at https://expo.dev/signup

### Step 2: Configure Project

The project is already configured with:
- **App ID:** `com.legacyguard.app`
- **Project ID:** `legacyguard-mobile`
- **Owner:** `legacyguard`

### Step 3: Build Development APK (for testing)

```bash
eas build --platform android --profile development
```

This creates an APK file that you can install directly on Android devices for testing.

### Step 4: Build Production AAB (for Google Play Store)

```bash
eas build --platform android --profile production
```

This creates an Android App Bundle (AAB) file required for Google Play Store submission.

## Build Profiles Explained

### Development Profile
- **Build Type:** APK
- **Purpose:** Testing and development
- **Distribution:** Internal
- **Signing:** Debug keystore

### Preview Profile
- **Build Type:** APK
- **Purpose:** Internal testing
- **Distribution:** Internal
- **Signing:** Release keystore

### Production Profile
- **Build Type:** App Bundle (AAB)
- **Purpose:** Google Play Store
- **Distribution:** Store
- **Signing:** Release keystore

## App Configuration

### Android Permissions
The app requests the following permissions:
- `CAMERA` - For document scanning
- `RECORD_AUDIO` - For audio messages
- `READ_EXTERNAL_STORAGE` - For file access
- `WRITE_EXTERNAL_STORAGE` - For file saving
- `USE_FINGERPRINT` - For biometric authentication
- `USE_BIOMETRIC` - For biometric authentication

### App Features
- **Package Name:** `com.legacyguard.app`
- **Version Code:** 1
- **Version Name:** 1.0.0
- **Target SDK:** Latest
- **Min SDK:** 21 (Android 5.0)
- **Edge-to-Edge:** Enabled

## Google Play Store Submission

### 1. Create Google Play Console Account
- Go to https://play.google.com/console
- Pay the $25 registration fee
- Complete developer profile

### 2. Create New App
- Click "Create app"
- Fill in app details:
  - **App name:** LegacyGuard
  - **Default language:** English
  - **App or game:** App
  - **Free or paid:** Free

### 3. Upload AAB File
- Go to "Release" → "Production"
- Click "Create new release"
- Upload the AAB file from your EAS build
- Fill in release notes
- Submit for review

### 4. App Store Listing
Complete the following sections:
- **Main store listing:** App description, screenshots, icons
- **Content rating:** Complete questionnaire
- **Target audience:** Set age ranges
- **App content:** Declare sensitive content
- **Ads:** Declare if app contains ads
- **Data safety:** Declare data collection practices

## Testing Your App

### 1. Install APK on Device
```bash
# Download APK from Expo dashboard
# Enable "Install from unknown sources" on Android device
# Install APK via ADB or file manager
```

### 2. Test Core Features
- [ ] User authentication (Clerk)
- [ ] Document scanning
- [ ] File upload/download
- [ ] Biometric authentication
- [ ] Offline functionality
- [ ] Multi-language support

### 3. Performance Testing
- [ ] App startup time
- [ ] Memory usage
- [ ] Battery consumption
- [ ] Network usage

## Troubleshooting

### Common Issues

1. **Build Fails:**
   ```bash
   # Check build logs in Expo dashboard
   # Verify all dependencies are compatible
   # Check for TypeScript errors
   ```

2. **App Crashes on Startup:**
   ```bash
   # Check device logs: adb logcat
   # Verify all native dependencies are properly linked
   # Test on different Android versions
   ```

3. **Permission Issues:**
   ```bash
   # Verify permissions in app.json
   # Test permission requests in app
   # Check Android manifest
   ```

### Getting Help

- **Expo Documentation:** https://docs.expo.dev/
- **EAS Build Documentation:** https://docs.expo.dev/build/introduction/
- **Google Play Console Help:** https://support.google.com/googleplay/android-developer/

## Security Considerations

### App Signing
- EAS automatically manages your app signing keys
- Keys are stored securely in Expo's infrastructure
- Never share your signing keys

### Data Protection
- All sensitive data is encrypted
- Biometric authentication is used for app access
- Secure storage for user credentials

### Privacy Compliance
- GDPR compliant data handling
- Clear privacy policy required
- User consent for data collection

## Monitoring and Analytics

### Crash Reporting
Consider integrating:
- **Sentry** for crash reporting
- **Firebase Crashlytics** for detailed crash analytics

### Performance Monitoring
- **Expo Analytics** for basic usage stats
- **Firebase Performance** for detailed performance metrics

## Next Steps After Deployment

1. **Monitor app performance** in Google Play Console
2. **Respond to user reviews** and feedback
3. **Plan regular updates** with new features
4. **Monitor crash reports** and fix issues
5. **Track download and usage statistics**

## Support

For technical support:
- Check Expo documentation
- Join Expo Discord community
- Create GitHub issues for bugs
- Contact development team

---

**Last Updated:** $(date)
**App Version:** 1.0.0
**Build Configuration:** EAS Build
