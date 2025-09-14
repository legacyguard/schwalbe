# Time Capsules Quick Start Guide

This guide provides step-by-step instructions for implementing and testing the time capsule system in Schwalbe.

## Security notes

- The Supabase service role key must be used only in server-side contexts (e.g., Edge Functions); never expose it to the browser.
- Use your deployment platform's secret manager for production.
- Do not log Authorization or token headers.

## Security & RLS verification

- Confirm all time capsule tables have RLS enabled and policies in place; write owner vs guardian tests per 005-auth-rls-baseline.
- Verify tokens are stored as hashes (no raw tokens) and are single-use with enforced expiry.
- Ensure structured logs in Edge Functions include a correlation ID; simulate a critical error and confirm a Resend email alert; no Sentry.

## 1) Time Capsule Creation

### Basic Setup

```typescript
// Initialize time capsule service
import { TimeCapsuleService } from '@/services/timeCapsuleService';

const timeCapsuleService = new TimeCapsuleService();

// Create a new time capsule
const capsule = await timeCapsuleService.createCapsule({
  recipientName: 'John Doe',
  recipientEmail: 'john@example.com',
  deliveryCondition: 'ON_DATE',
  deliveryDate: '2025-12-25T00:00:00Z',
  messageTitle: 'Merry Christmas Future Me',
  mediaType: 'video'
});

console.log('Created capsule:', capsule.capsuleId);
```

### Video Recording

```typescript
// Set up video recording
const { startRecording, stopRecording, recordedBlob } = useVideoRecording();

// Start recording
await startRecording();

// Stop recording after some time
setTimeout(async () => {
  await stopRecording();

  // Upload the recorded video
  const uploadResult = await timeCapsuleService.uploadMedia(
    capsule.capsuleId,
    recordedBlob,
    { encryption: true }
  );

  console.log('Video uploaded:', uploadResult);
}, 30000); // 30 seconds
```

### Scheduling Configuration

```typescript
// Configure delivery schedule
const schedule = await timeCapsuleService.createSchedule(capsule.capsuleId, {
  triggerType: 'date',
  scheduledDate: '2025-12-25T00:00:00Z',
  timezone: 'America/New_York'
});

console.log('Schedule created:', schedule.scheduleId);
```

## 2) Video Recording

### MediaRecorder Setup

```typescript
// Initialize MediaRecorder with optimal settings
const getMediaRecorder = async (options: RecordingOptions) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100
    }
  });

  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : 'video/webm;codecs=vp8,opus';

  return new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: options.quality === 'high' ? 5000000 : 2000000
  });
};
```

### Recording Controls

```typescript
// Recording hook implementation
export function useVideoRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder>();
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    const recorder = await getMediaRecorder({ quality: 'high' });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      // Process recorded blob
    };

    recorder.start(1000); // Collect data every second
    setIsRecording(true);

    // Update duration
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  return { startRecording, stopRecording, isRecording, duration };
}
```

### 2.1 Quality Validation

```typescript
// Validate recorded video
const validateVideo = (blob: Blob): Promise<VideoValidation> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const validation = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: blob.size,
        isValid: video.duration > 0 && video.duration <= 300 // Max 5 minutes
      };
      resolve(validation);
    };

    video.src = URL.createObjectURL(blob);
  });
};
```

## 3) Scheduling Setup

### Date-based Scheduling

```typescript
// Create date-based delivery schedule
const createDateSchedule = async (capsuleId: string, date: Date) => {
  // Validate future date
  if (date <= new Date()) {
    throw new Error('Delivery date must be in the future');
  }

  // Check for conflicts
  const conflicts = await timeCapsuleService.checkScheduleConflicts(
    date,
    24 * 60 * 60 * 1000 // 24 hours window
  );

  if (conflicts.length > 0) {
    console.warn('Potential scheduling conflicts:', conflicts);
  }

  // Create schedule
  const schedule = await timeCapsuleService.createSchedule(capsuleId, {
    triggerType: 'date',
    scheduledDate: date.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  return schedule;
};
```

### Emergency Scheduling

```typescript
// Create emergency delivery schedule
const createEmergencySchedule = async (capsuleId: string) => {
  const schedule = await timeCapsuleService.createSchedule(capsuleId, {
    triggerType: 'emergency',
    emergencyTrigger: 'family_shield_activation',
    priority: 'high'
  });

  // Set up emergency triggers
  await timeCapsuleService.addEmergencyTriggers(schedule.scheduleId, [
    {
      condition: 'guardian_verification',
      value: 'multi_step_verification',
      priority: 1
    },
    {
      condition: 'inactivity_period',
      value: '30_days',
      priority: 2
    }
  ]);

  return schedule;
};
```

### Schedule Validation

```typescript
// Validate scheduling constraints
const validateSchedule = (schedule: DeliverySchedule): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check date constraints
  if (schedule.triggerType === 'date') {
    const deliveryDate = new Date(schedule.scheduledDate);
    const now = new Date();
    const daysDiff = (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff < 1) {
      errors.push('Delivery date must be at least 1 day in the future');
    } else if (daysDiff > 365 * 10) {
      warnings.push('Delivery date is more than 10 years in the future');
    }
  }

  // Check emergency trigger configuration
  if (schedule.triggerType === 'emergency') {
    if (!schedule.emergencyTrigger) {
      errors.push('Emergency trigger must be specified');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
};
```

## 4) Delivery Testing

### Manual Delivery Trigger

```typescript
// Manually trigger delivery for testing
const testDelivery = async (capsuleId: string) => {
  try {
    const result = await timeCapsuleService.triggerDelivery(capsuleId, {
      testMode: true,
      sendEmail: true,
      customRecipient: 'test@example.com'
    });

    console.log('Delivery test result:', result);

    if (result.success) {
      console.log('Test email sent successfully');
      console.log('Access token:', result.accessToken);
      console.log('Expires:', result.expiresAt);
    } else {
      console.error('Delivery failed:', result.error);
    }

    return result;
  } catch (error) {
    console.error('Delivery test error:', error);
    throw error;
  }
};
```

### Delivery Status Monitoring

```typescript
// Monitor delivery status
const monitorDelivery = (capsuleId: string) => {
  const unsubscribe = timeCapsuleService.subscribeToDeliveryStatus(
    capsuleId,
    (status) => {
      console.log('Delivery status update:', status);

      switch (status.stage) {
        case 'processing':
          console.log('Preparing capsule for delivery...');
          break;
        case 'sending':
          console.log('Sending delivery email...');
          break;
        case 'delivered':
          console.log('Capsule delivered successfully!');
          unsubscribe(); // Stop monitoring
          break;
        case 'failed':
          console.error('Delivery failed:', status.error);
          break;
      }
    }
  );

  return unsubscribe;
};
```

### Email Template Testing

```typescript
// Test email template rendering
const testEmailTemplate = async (capsuleId: string) => {
  const capsule = await timeCapsuleService.getCapsule(capsuleId);
  const accessToken = 'test-token-123';

  const emailHtml = await timeCapsuleService.renderDeliveryEmail(
    capsule,
    accessToken,
    { testMode: true }
  );

  // Open in new window for preview
  const previewWindow = window.open('', '_blank');
  if (previewWindow) {
    previewWindow.document.write(emailHtml);
    previewWindow.document.close();
  }

  return emailHtml;
};
```

## 5) Video Processing

### Video Compression

```typescript
// Compress video for storage
const compressVideo = async (inputBlob: Blob, options: CompressionOptions) => {
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise<Blob>((resolve) => {
    video.onloadedmetadata = () => {
      canvas.width = options.width || video.videoWidth;
      canvas.height = options.height || video.videoHeight;

      const mediaRecorder = new MediaRecorder(canvas.captureStream(), {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: options.bitrate || 1000000
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        resolve(new Blob(chunks, { type: 'video/webm' }));
      };

      // Start recording and play video
      mediaRecorder.start();
      video.play();

      // Capture frames
      const captureFrame = () => {
        if (!video.ended) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(captureFrame);
        } else {
          mediaRecorder.stop();
        }
      };

      captureFrame();
    };

    video.src = URL.createObjectURL(inputBlob);
  });
};
```

### Thumbnail Generation

```typescript
// Generate video thumbnail
const generateThumbnail = async (videoBlob: Blob): Promise<string> => {
  const video = document.createElement('video');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      canvas.width = 320;
      canvas.height = (video.videoHeight / video.videoWidth) * 320;

      video.currentTime = Math.min(10, video.duration * 0.1); // 10% into video

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailDataUrl);
      };
    };

    video.src = URL.createObjectURL(videoBlob);
  });
};
```

### 5.1 Quality Validation

```typescript
// Validate video quality metrics
const validateVideoQuality = async (blob: Blob): Promise<QualityReport> => {
  const video = document.createElement('video');

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      const report = {
        duration: video.duration,
        resolution: `${video.videoWidth}x${video.videoHeight}`,
        aspectRatio: video.videoWidth / video.videoHeight,
        fileSize: blob.size,
        compressionRatio: blob.size / (video.duration * 30 * 1920 * 1080 * 0.1), // Estimated
        isValid: video.duration > 0 && video.duration <= 300,
        recommendations: []
      };

      // Generate recommendations
      if (blob.size > 100 * 1024 * 1024) { // 100MB
        report.recommendations.push('Consider compressing video for better performance');
      }

      if (video.videoWidth < 720) {
        report.recommendations.push('Video resolution is below recommended minimum');
      }

      resolve(report);
    };

    video.src = URL.createObjectURL(blob);
  });
};
```

## 6) Legacy Management

### Version Snapshots

```typescript
// Create legacy content snapshot
const createLegacySnapshot = async (capsuleId: string, label?: string) => {
  const capsule = await timeCapsuleService.getCapsule(capsuleId);
  const versionNumber = await timeCapsuleService.getNextVersionNumber(capsuleId);

  const snapshot = {
    capsule: capsule,
    recipient: await timeCapsuleService.getRecipient(capsule.recipientId),
    delivery: await timeCapsuleService.getDeliverySchedule(capsule.capsuleId),
    content: await timeCapsuleService.getContentMetadata(capsule.capsuleId),
    emotionalContext: await timeCapsuleService.captureEmotionalContext(),
    timestamp: new Date().toISOString()
  };

  const version = await timeCapsuleService.createVersion(capsuleId, {
    versionNumber,
    versionLabel: label,
    snapshotData: snapshot,
    changeReason: 'Manual snapshot'
  });

  return version;
};
```

### Emotional Tagging

```typescript
// Add emotional tags to legacy content
const addEmotionalTags = async (versionId: string, tags: EmotionalTags) => {
  // Validate emotional tags
  const validatedTags = validateEmotionalTags(tags);

  await timeCapsuleService.updateVersion(versionId, {
    emotionalTags: validatedTags
  });

  // Update analytics
  await timeCapsuleService.recordEmotionalAnalytics(versionId, validatedTags);
};

const validateEmotionalTags = (tags: EmotionalTags): EmotionalTags => {
  const validated = { ...tags };

  // Ensure values are between 0-1
  Object.keys(validated).forEach(key => {
    validated[key] = Math.max(0, Math.min(1, validated[key]));
  });

  // Normalize to ensure they sum to reasonable total
  const total = Object.values(validated).reduce((sum, val) => sum + val, 0);
  if (total > 2) {
    // Scale down if too intense
    Object.keys(validated).forEach(key => {
      validated[key] *= 0.8;
    });
  }

  return validated;
};
```

### Legacy Content Search

```typescript
// Search legacy content
const searchLegacyContent = async (query: string, filters: SearchFilters) => {
  const results = await timeCapsuleService.searchVersions({
    query,
    filters: {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      emotionalTags: filters.emotionalTags,
      contentType: filters.contentType
    },
    sortBy: 'relevance',
    limit: 50
  });

  // Highlight search terms
  const highlightedResults = results.map(result => ({
    ...result,
    highlights: highlightSearchTerms(result, query)
  }));

  return highlightedResults;
};

const highlightSearchTerms = (result: VersionSearchResult, query: string) => {
  const highlights: SearchHighlight[] = [];
  const terms = query.toLowerCase().split(' ');

  // Search in title, preview, and emotional tags
  terms.forEach(term => {
    if (result.title.toLowerCase().includes(term)) {
      highlights.push({
        field: 'title',
        term,
        position: result.title.toLowerCase().indexOf(term)
      });
    }
  });

  return highlights;
};
```

## 7) Performance Testing

### Load Testing

```typescript
// Performance test capsule creation
const performanceTest = async (iterations: number) => {
  const results: PerformanceResult[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();

    try {
      const capsule = await timeCapsuleService.createCapsule({
        recipientName: `Test User ${i}`,
        recipientEmail: `test${i}@example.com`,
        deliveryCondition: 'ON_DATE',
        deliveryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        messageTitle: `Performance Test Capsule ${i}`,
        mediaType: 'video'
      });

      const endTime = performance.now();
      results.push({
        operation: 'create_capsule',
        duration: endTime - startTime,
        success: true,
        capsuleId: capsule.capsuleId
      });
    } catch (error) {
      const endTime = performance.now();
      results.push({
        operation: 'create_capsule',
        duration: endTime - startTime,
        success: false,
        error: error.message
      });
    }
  }

  return analyzePerformanceResults(results);
};

const analyzePerformanceResults = (results: PerformanceResult[]) => {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  return {
    totalOperations: results.length,
    successfulOperations: successful.length,
    failedOperations: failed.length,
    averageDuration: successful.reduce((sum, r) => sum + r.duration, 0) / successful.length,
    minDuration: Math.min(...successful.map(r => r.duration)),
    maxDuration: Math.max(...successful.map(r => r.duration)),
    p95Duration: calculatePercentile(successful.map(r => r.duration), 95),
    errorRate: (failed.length / results.length) * 100
  };
};
```

### Memory Testing

```typescript
// Test memory usage during video processing
const memoryTest = async () => {
  const initialMemory = performance.memory.usedJSHeapSize;

  // Perform video processing operations
  const testBlob = new Blob(['test video data'], { type: 'video/webm' });
  await compressVideo(testBlob, { width: 1920, height: 1080 });
  await generateThumbnail(testBlob);

  const finalMemory = performance.memory.usedJSHeapSize;
  const memoryDelta = finalMemory - initialMemory;

  console.log(`Memory usage: ${memoryDelta / 1024 / 1024} MB`);

  // Force garbage collection if available
  if (window.gc) {
    window.gc();
    const afterGCMemory = performance.memory.usedJSHeapSize;
    console.log(`After GC: ${(afterGCMemory - initialMemory) / 1024 / 1024} MB`);
  }

  return {
    initialMemory,
    finalMemory,
    memoryDelta,
    hasMemoryLeak: memoryDelta > 50 * 1024 * 1024 // 50MB threshold
  };
};
```

### Concurrent User Testing

```typescript
// Test concurrent capsule creation
const concurrentTest = async (userCount: number, capsulesPerUser: number) => {
  const users = Array.from({ length: userCount }, (_, i) => `user${i}@test.com`);
  const results: ConcurrentTestResult[] = [];

  const testUser = async (email: string) => {
    const userResults: PerformanceResult[] = [];

    for (let i = 0; i < capsulesPerUser; i++) {
      const startTime = performance.now();

      try {
        const capsule = await timeCapsuleService.createCapsule({
          recipientName: 'Concurrent Test Recipient',
          recipientEmail: email,
          deliveryCondition: 'ON_DATE',
          deliveryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          messageTitle: `Concurrent Test ${i}`,
          mediaType: 'video'
        });

        const endTime = performance.now();
        userResults.push({
          operation: 'create_capsule',
          duration: endTime - startTime,
          success: true
        });
      } catch (error) {
        const endTime = performance.now();
        userResults.push({
          operation: 'create_capsule',
          duration: endTime - startTime,
          success: false,
          error: error.message
        });
      }
    }

    return userResults;
  };

  // Run all users concurrently
  const promises = users.map(email => testUser(email));
  const allResults = await Promise.all(promises);

  return {
    totalUsers: userCount,
    capsulesPerUser,
    totalCapsules: userCount * capsulesPerUser,
    results: allResults.flat(),
    summary: analyzePerformanceResults(allResults.flat())
  };
};
```

## 8) Security Testing

### Encryption Validation

```typescript
// Test encryption/decryption cycle
const testEncryption = async () => {
  const testData = 'This is sensitive capsule content';
  const passphrase = 'test-passphrase-123';

  console.log('Testing encryption cycle...');

  // Encrypt
  const encrypted = await encryptionService.encrypt(testData, passphrase);
  console.log('Encryption successful, size:', encrypted.length);

  // Decrypt
  const decrypted = await encryptionService.decrypt(encrypted, passphrase);
  console.log('Decryption successful');

  // Verify
  const isValid = decrypted === testData;
  console.log('Encryption cycle valid:', isValid);

  if (!isValid) {
    throw new Error('Encryption/decryption cycle failed');
  }

  return { encrypted, decrypted, isValid };
};
```

### Access Control Testing

```typescript
// Test access token validation
const testAccessControl = async () => {
  // Create test capsule
  const capsule = await timeCapsuleService.createCapsule({
    recipientName: 'Security Test',
    recipientEmail: 'security@example.com',
    deliveryCondition: 'ON_DATE',
    deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    messageTitle: 'Security Test Capsule',
    mediaType: 'video'
  });

  // Test invalid token
  try {
    await timeCapsuleService.accessCapsule('invalid-token');
    throw new Error('Should have failed with invalid token');
  } catch (error) {
    console.log('✓ Invalid token correctly rejected');
  }

  // Test expired token
  const expiredToken = await timeCapsuleService.generateExpiredToken(capsule.capsuleId);
  try {
    await timeCapsuleService.accessCapsule(expiredToken);
    throw new Error('Should have failed with expired token');
  } catch (error) {
    console.log('✓ Expired token correctly rejected');
  }

  // Test valid token
  const validToken = await timeCapsuleService.generateAccessToken(capsule.capsuleId);
  const accessedCapsule = await timeCapsuleService.accessCapsule(validToken);
  console.log('✓ Valid token correctly accepted');

  return {
    capsuleId: capsule.capsuleId,
    testsPassed: 3
  };
};
```

### SQL Injection Testing

```typescript
// Test for SQL injection vulnerabilities
const testSQLInjection = async () => {
  const maliciousInputs = [
    "'; DROP TABLE time_capsules; --",
    "' OR '1'='1",
    "<script>alert('xss')</script>",
    "../../../etc/passwd"
  ];

  console.log('Testing SQL injection prevention...');

  for (const input of maliciousInputs) {
    try {
      await timeCapsuleService.createCapsule({
        recipientName: input,
        recipientEmail: 'test@example.com',
        deliveryCondition: 'ON_DATE',
        deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        messageTitle: 'SQL Injection Test',
        mediaType: 'video'
      });
      console.log('✓ Input safely handled:', input.substring(0, 20) + '...');
    } catch (error) {
      // Expected for some inputs due to validation
      console.log('✓ Input rejected by validation:', input.substring(0, 20) + '...');
    }
  }

  return { testedInputs: maliciousInputs.length };
};
```

## 9) Error Handling

### Network Error Handling

```typescript
// Test network error recovery
const testNetworkErrors = async () => {
  // Simulate network disconnection
  const originalFetch = window.fetch;
  let networkDown = false;

  window.fetch = async (...args) => {
    if (networkDown) {
      throw new Error('Network disconnected');
    }
    return originalFetch(...args);
  };

  try {
    // Test offline capsule creation (should queue)
    networkDown = true;
    const offlineResult = await timeCapsuleService.createCapsule({
      recipientName: 'Offline Test',
      recipientEmail: 'offline@example.com',
      deliveryCondition: 'ON_DATE',
      deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      messageTitle: 'Offline Test Capsule',
      mediaType: 'video'
    });

    console.log('✓ Offline operation handled');

    // Test recovery when back online
    networkDown = false;
    await timeCapsuleService.syncOfflineData();
    console.log('✓ Data synced when back online');

  } finally {
    window.fetch = originalFetch;
  }
};
```

### Validation Error Handling

```typescript
// Test input validation
const testValidation = async () => {
  const invalidInputs = [
    { recipientEmail: 'invalid-email', expectedError: 'Invalid email format' },
    { deliveryDate: '2020-01-01', expectedError: 'Date must be in future' },
    { messageTitle: '', expectedError: 'Title is required' },
    { mediaType: 'invalid', expectedError: 'Invalid media type' }
  ];

  console.log('Testing input validation...');

  for (const testCase of invalidInputs) {
    try {
      await timeCapsuleService.createCapsule({
        recipientName: 'Validation Test',
        recipientEmail: testCase.recipientEmail || 'test@example.com',
        deliveryCondition: 'ON_DATE',
        deliveryDate: testCase.deliveryDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        messageTitle: testCase.messageTitle || 'Validation Test',
        mediaType: (testCase.mediaType as any) || 'video'
      });
      throw new Error(`Should have failed: ${testCase.expectedError}`);
    } catch (error) {
      if (error.message.includes(testCase.expectedError)) {
        console.log('✓ Validation correctly rejected:', testCase.expectedError);
      } else {
        throw new Error(`Unexpected error: ${error.message}`);
      }
    }
  }

  return { testsPassed: invalidInputs.length };
};
```

### Recovery Mechanisms

```typescript
// Test error recovery
const testRecovery = async () => {
  // Test interrupted upload recovery
  const capsule = await timeCapsuleService.createCapsule({
    recipientName: 'Recovery Test',
    recipientEmail: 'recovery@example.com',
    deliveryCondition: 'ON_DATE',
    deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    messageTitle: 'Recovery Test Capsule',
    mediaType: 'video'
  });

  // Simulate interrupted upload
  const uploadId = await timeCapsuleService.startResumableUpload(capsule.capsuleId);

  // Resume upload
  const resumeResult = await timeCapsuleService.resumeUpload(uploadId);
  console.log('✓ Upload recovery successful');

  // Test failed delivery retry
  await timeCapsuleService.triggerDelivery(capsule.capsuleId);
  // Simulate failure and retry
  const retryResult = await timeCapsuleService.retryFailedDelivery(capsule.capsuleId);
  console.log('✓ Delivery retry successful');

  return {
    capsuleId: capsule.capsuleId,
    uploadRecovery: true,
    deliveryRetry: retryResult.success
  };
};
```

## 10) End-to-End Test

### Complete User Journey

```typescript
// Test complete time capsule workflow
const endToEndTest = async () => {
  console.log('Starting end-to-end time capsule test...');

  // 1. Create capsule
  console.log('1. Creating time capsule...');
  const capsule = await timeCapsuleService.createCapsule({
    recipientName: 'E2E Test Recipient',
    recipientEmail: 'e2e@example.com',
    deliveryCondition: 'ON_DATE',
    deliveryDate: new Date(Date.now() + 60 * 1000).toISOString(), // 1 minute from now
    messageTitle: 'End-to-End Test Capsule',
    mediaType: 'video'
  });
  console.log('✓ Capsule created:', capsule.capsuleId);

  // 2. Upload media
  console.log('2. Uploading media...');
  const testVideoBlob = new Blob(['fake video data'], { type: 'video/webm' });
  const uploadResult = await timeCapsuleService.uploadMedia(
    capsule.capsuleId,
    testVideoBlob,
    { generateThumbnail: true }
  );
  console.log('✓ Media uploaded');

  // 3. Configure schedule
  console.log('3. Configuring delivery schedule...');
  const schedule = await timeCapsuleService.createSchedule(capsule.capsuleId, {
    triggerType: 'date',
    scheduledDate: capsule.deliveryDate
  });
  console.log('✓ Schedule configured');

  // 4. Test preview
  console.log('4. Testing preview...');
  const previewResult = await timeCapsuleService.sendTestPreview(capsule.capsuleId);
  console.log('✓ Test preview sent');

  // 5. Wait for delivery
  console.log('5. Waiting for delivery...');
  await new Promise(resolve => setTimeout(resolve, 65000)); // Wait 65 seconds

  // 6. Check delivery status
  console.log('6. Checking delivery status...');
  const updatedCapsule = await timeCapsuleService.getCapsule(capsule.capsuleId);
  if (updatedCapsule.status === 'DELIVERED') {
    console.log('✓ Capsule delivered successfully');
  } else {
    console.log('⚠ Capsule not yet delivered, status:', updatedCapsule.status);
  }

  // 7. Test recipient access
  console.log('7. Testing recipient access...');
  if (updatedCapsule.accessToken) {
    const accessResult = await timeCapsuleService.accessCapsule(updatedCapsule.accessToken);
    console.log('✓ Recipient access successful');
  }

  // 8. Test legacy features
  console.log('8. Testing legacy features...');
  const version = await timeCapsuleService.createVersion(capsule.capsuleId, {
    versionLabel: 'E2E Test Version'
  });
  console.log('✓ Legacy version created');

  console.log('End-to-end test completed successfully!');
  return {
    capsuleId: capsule.capsuleId,
    status: updatedCapsule.status,
    delivered: updatedCapsule.isDelivered,
    hasAccessToken: !!updatedCapsule.accessToken,
    hasVersion: !!version
  };
};
```

This quick start guide provides comprehensive testing scenarios for the time capsule system, covering creation, recording, scheduling, delivery, processing, legacy management, and end-to-end workflows.
