// src/screens/main/ScannerScreen.tsx
/* global __DEV__ */
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IntelligentDocumentScanner } from '@/components/scanner/IntelligentDocumentScanner';
import { api, ApiError } from '@/api/apiClient';
import * as FileSystem from 'expo-file-system';

export const ScannerScreen = () => {
  const [scannedImageUri, setScannedImageUri] = useState<null | string>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const handleScanComplete = (imageUri: string) => {
    if (__DEV__) console.log('Scan complete, image at:', imageUri);
    setScannedImageUri(`file://${imageUri}`); // file:// prefix is important for local files
    setIsScanning(false);
  };

  const handleUpload = async () => {
    if (!scannedImageUri) return;

    setIsUploading(true);
    try {
      // Read the file and convert to base64
      const base64 = await FileSystem.readAsStringAsync(scannedImageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Use the API client to upload the document
      const result = await api.documents.upload({
        base64,
        mimeType: 'image/jpeg',
        fileName: `scan_${Date.now()}.jpg`,
      });

      if (__DEV__) console.log('Upload successful:', result);

      // Show success message
      Alert.alert(
        'Success',
        'Document uploaded and analyzed successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset for new scan
              setScannedImageUri(null);
              setIsScanning(true);
            },
          },
        ]
      );
    } catch (error) {
      if (__DEV__) console.error('Upload error:', error);

      let errorMessage = 'Failed to upload document. Please try again.';

      if (error instanceof ApiError) {
        if (error.status === 401) {
          errorMessage = 'Please log in to upload documents.';
        } else if (error.status === 413) {
          errorMessage = 'Document is too large. Please try a smaller file.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setScannedImageUri(null);
    setIsScanning(true);
  };

  const handleCancel = () => {
    setIsScanning(false);
    setScannedImageUri(null);
    // Optionally navigate back or show empty state
  };

  if (isScanning && !scannedImageUri) {
    return (
      <IntelligentDocumentScanner
        onScanComplete={handleScanComplete}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Your Scan</Text>

      {scannedImageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: scannedImageUri }} style={styles.previewImage} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleRetake}
          disabled={isUploading}
        >
          <Text style={styles.secondaryButtonText}>Retake</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isUploading && styles.disabledButton]}
          onPress={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>Confirm & Upload</Text>
          )}
        </TouchableOpacity>
      </View>

      {!scannedImageUri && !isScanning && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No document scanned</Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setIsScanning(true)}
          >
            <Text style={styles.primaryButtonText}>Start Scanning</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    textAlign: 'center',
    color: '#333',
  },
  imageContainer: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
});
