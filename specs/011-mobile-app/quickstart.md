# Mobile App Quick Start Guide

## Overview

This guide provides essential information for developers starting work on the LegacyGuard mobile application. It covers setup, development workflows, testing scenarios, and deployment procedures. The mobile app builds on the existing Hollywood mobile foundation, enhancing it with offline functionality, push notifications, and biometric security.

## Development Environment Setup

### Prerequisites

- **Node.js**: 18.17+ (use nvm for version management)
- **Expo CLI**: `npm install -g @expo/cli`
- **iOS Development**:
  - macOS with Xcode 14+
  - iOS Simulator or physical iOS device
- **Android Development**:
  - Android Studio with Android SDK
  - Android emulator or physical Android device
- **Git**: Latest version with LFS support

### Project Setup

```bash
# Clone the repository
git clone https://github.com/your-org/schwalbe.git
cd schwalbe

# Install dependencies
pnpm install

# Navigate to mobile app
cd apps/mobile

# Install mobile dependencies
pnpm install

# Start Expo development server
pnpm start
```

### Hollywood Mobile Integration

The mobile app leverages the existing Hollywood mobile foundation:

- **Existing Components**: Clerk auth, Tamagui UI, AsyncStorage, SecureStore
- **Enhancement Areas**: Push notifications, offline sync, biometric security
- **Migration Path**: Build upon existing Hollywood mobile structure
- **Dependencies**: 002-hollywood-migration provides core mobile packages

Reference: `/Users/luborfedak/Documents/Github/hollywood/mobile/` for existing implementation

### Environment Configuration

Create `.env.local` in `apps/mobile/`:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Stripe (for payments)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App Configuration
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Test Scenarios

### 1) Mobile Setup - install and configure app

- [ ] Download and install LegacyGuard mobile app from App Store/Google Play
- [ ] Launch app and complete initial setup wizard
- [ ] Grant necessary permissions (camera, storage, notifications)
- [ ] Configure biometric authentication if available
- [ ] Verify app connects to account and syncs data

### 2) Document Access - access documents on mobile

- [ ] Sign in to mobile app with existing credentials
- [ ] Navigate to Documents section
- [ ] View list of available documents
- [ ] Open and view document content
- [ ] Search for specific documents
- [ ] Verify document metadata is displayed correctly

### 3) Will Creation - create will on mobile

- [ ] Navigate to Will Creation section
- [ ] Start new will creation wizard
- [ ] Complete all required steps (personal info, beneficiaries, assets)
- [ ] Review and edit will content
- [ ] Save will to document vault
- [ ] Verify will appears in document list

### 4) Offline Functionality - test offline features

- [ ] Enable airplane mode or disconnect from internet
- [ ] Verify offline indicator appears in app
- [ ] Access previously synced documents
- [ ] Attempt to create new content (should queue for later sync)
- [ ] Reconnect to internet and verify automatic sync
- [ ] Check for any sync conflicts or errors

### 5) Push Notifications - test notifications

- [ ] Enable push notifications in app settings
- [ ] Grant notification permissions when prompted
- [ ] Trigger test notification from settings
- [ ] Verify notification appears on device
- [ ] Test different notification types (document ready, reminders)
- [ ] Check notification preferences and customization

### 6) Biometric Auth - test biometric security

- [ ] Enable biometric authentication in security settings
- [ ] Complete biometric enrollment process
- [ ] Test biometric unlock when accessing sensitive features
- [ ] Verify fallback to PIN/password works
- [ ] Test biometric timeout and re-authentication
- [ ] Disable biometric auth and verify proper cleanup

### 7) Sync Testing - test data synchronization

- [ ] Make changes to documents on web app
- [ ] Verify changes sync to mobile app automatically
- [ ] Make changes to documents on mobile app
- [ ] Verify changes sync to web app
- [ ] Test sync with multiple devices
- [ ] Verify sync status indicators work correctly

### 8) Performance Test - test mobile performance

- [ ] Launch app and measure cold start time (<2 seconds)
- [ ] Navigate between screens and verify smooth transitions
- [ ] Scroll through large document lists
- [ ] Test camera document scanning performance
- [ ] Verify app memory usage stays within limits
- [ ] Test app performance with low battery/network conditions

### 9) Security Test - test mobile security

- [ ] Attempt to access app with incorrect credentials
- [ ] Test session timeout and automatic logout
- [ ] Verify encrypted document storage
- [ ] Test secure data transmission
- [ ] Verify biometric security measures
- [ ] Check for proper data cleanup on logout

### 10) End-to-End Test - complete mobile workflow

- [ ] Sign up for new account on mobile
- [ ] Complete profile setup and preferences
- [ ] Scan and upload first document
- [ ] Create a basic will using mobile wizard
- [ ] Set up emergency access and guardians
- [ ] Configure notifications and security settings
- [ ] Test offline access to all created content
- [ ] Verify data syncs correctly across platforms

### Document Management

```typescript
// Document upload with offline support
import * as DocumentPicker from 'expo-document-picker';
import { uploadDocument } from '../services/documentService';

async function handleDocumentUpload() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      const document = await uploadDocument(result.uri, {
        title: result.name,
        type: 'document',
      });

      // Handle success
      console.log('Document uploaded:', document.id);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

### Offline Data Management

```typescript
// Offline document storage
import AsyncStorage from '@react-native-async-storage/async-storage';

class OfflineStorage {
  static async saveDocument(document: MobileDocument) {
    const key = `document_${document.id}`;
    await AsyncStorage.setItem(key, JSON.stringify(document));
  }

  static async getDocument(id: string): Promise<MobileDocument | null> {
    const key = `document_${id}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  static async getAllDocuments(): Promise<MobileDocument[]> {
    const keys = await AsyncStorage.getAllKeys();
    const documentKeys = keys.filter(key => key.startsWith('document_'));

    const documents = await AsyncStorage.multiGet(documentKeys);
    return documents.map(([_, value]) => JSON.parse(value));
  }
}
```

### Biometric Authentication

```typescript
// Biometric authentication setup
import * as LocalAuthentication from 'expo-local-authentication';

async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    // Fallback to PIN/password
    return fallbackAuthentication();
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Authenticate to access your documents',
    fallbackLabel: 'Use PIN',
  });

  if (result.success) {
    // Authentication successful
    return { success: true };
  } else {
    // Handle authentication failure
    return { success: false, error: result.error };
  }
}
```

## Testing Scenarios

### Unit Testing

```typescript
// Example unit test for document service
import { renderHook, act } from '@testing-library/react-native';
import { useDocumentUpload } from '../hooks/useDocumentUpload';

describe('useDocumentUpload', () => {
  it('should upload document successfully', async () => {
    const { result } = renderHook(() => useDocumentUpload());

    const mockFile = {
      uri: 'file://test.pdf',
      name: 'test.pdf',
      type: 'application/pdf',
    };

    await act(async () => {
      await result.current.uploadDocument(mockFile);
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.document).toBeDefined();
  });
});
```

### Integration Testing

```typescript
// API integration test
describe('DocumentAPI', () => {
  it('should fetch user documents', async () => {
    const documents = await DocumentAPI.listDocuments({
      userId: 'test-user-id',
    });

    expect(Array.isArray(documents)).toBe(true);
    expect(documents[0]).toHaveProperty('id');
    expect(documents[0]).toHaveProperty('title');
  });
});
```

### E2E Testing with Maestro

```yaml
# .maestro/auth-flow.yaml
appId: com.legacyguard.mobile
---
- launchApp
- tapOn: "Sign In"
- inputText: "test@example.com"
- tapOn: "Continue"
- inputText: "password123"
- tapOn: "Sign In"
- assertVisible: "Welcome back"
```

## Common Development Tasks

### Adding a New Screen

1. Create screen component in `src/screens/`
2. Add route to navigation configuration
3. Update TypeScript types
4. Add to app navigation structure

```typescript
// screens/NewScreen.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export function NewScreen() {
  const navigation = useNavigation();

  return (
    <View>
      <Text>New Screen</Text>
    </View>
  );
}
```

### Implementing Offline Support

1. Identify data that needs offline access
2. Implement local storage schema
3. Add sync logic for online/offline states
4. Handle conflicts and data merging

```typescript
// Offline sync hook
function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingChanges, setPendingChanges] = useState([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
      if (state.isConnected) {
        syncPendingChanges();
      }
    });

    return unsubscribe;
  }, []);

  const syncPendingChanges = async () => {
    // Implement sync logic
  };

  return { isOnline, pendingChanges };
}
```

### Push Notifications

```typescript
// Notification setup
import * as Notifications from 'expo-notifications';

async function setupNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status === 'granted') {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }
}

// Schedule notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Document Ready',
    body: 'Your will has been processed successfully',
  },
  trigger: { seconds: 1 },
});
```

## Debugging & Troubleshooting

### Common Issues

**Metro Bundler Issues:**

```bash
# Clear Metro cache
npx expo start --clear

# Reset project
npx expo install --fix
```

**iOS Simulator Problems:**

```bash
# Reset simulator
xcrun simctl erase all

# Clean build
cd ios && rm -rf build && cd ..
```

**Android Build Issues:**

```bash
# Clean Gradle
cd android && ./gradlew clean && cd ..

# Clear Android cache
rm -rf node_modules && npm install
```

### Performance Monitoring

```typescript
// Performance monitoring
import { PerformanceMonitor } from '../utils/performance';

const monitor = new PerformanceMonitor();

function App() {
  useEffect(() => {
    monitor.startTracking('app_startup');

    // App initialization code

    monitor.endTracking('app_startup');
  }, []);

  return <AppNavigator />;
}
```

## Deployment

### Development Builds

```bash
# iOS development build
eas build --platform ios --profile development

# Android development build
eas build --platform android --profile development
```

### Production Builds

```bash
# iOS production build
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Key Development Principles

### Code Organization

- Feature-based folder structure
- Shared components in `components/` directory
- Business logic in `services/` directory
- Custom hooks in `hooks/` directory
- Utility functions in `utils/` directory

### State Management

- Local component state for UI-only data
- Zustand stores for global app state
- React Query for server state management
- AsyncStorage for persistent local data

### Error Handling

- Try-catch blocks for async operations
- Error boundaries for React components
- User-friendly error messages
- Logging for debugging and monitoring

### Performance

- Memoization for expensive computations
- Lazy loading for screens and components
- Image optimization and caching
- Bundle splitting for code optimization

## Testing Checklist

### Pre-Commit Checks

- [ ] TypeScript compilation passes
- [ ] ESLint rules pass
- [ ] Unit tests pass
- [ ] Build succeeds

### Pre-Release Checks

- [ ] Integration tests pass
- [ ] E2E tests pass on target devices
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Accessibility audit completed

### Device Testing Matrix

- [ ] iPhone SE (small screen)
- [ ] iPhone 12 (standard screen)
- [ ] iPad Pro (tablet)
- [ ] Android Pixel 5 (standard)
- [ ] Android Samsung Galaxy S21 (large screen)

This quick start guide provides the foundation for mobile app development. Refer to the detailed specification documents for comprehensive implementation guidance.
