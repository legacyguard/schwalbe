/**
 * Video Storage and Compression Service
 * Handles video processing, compression, storage, and retrieval with advanced optimization
 */

import { config } from '@/lib/env';

import { logger } from '@schwalbe/shared/lib/logger';

interface VideoFile {
  id: string;
  originalBlob: Blob;
  compressedBlob?: Blob;
  metadata: VideoMetadata;
  storageLocation: string;
  compressionSettings: CompressionSettings;
  processingStatus: 'pending' | 'compressing' | 'uploading' | 'completed' | 'failed';
  uploadProgress: number;
  error?: string;
}

interface VideoMetadata {
  title: string;
  description?: string;
  duration: number;
  originalSize: number;
  compressedSize?: number;
  compressionRatio?: number;
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
  bitrate: number;
  format: string;
  codecs: {
    video: string;
    audio: string;
  };
  thumbnail?: string;
  createdAt: Date;
  lastModified: Date;
}

interface CompressionSettings {
  quality: 'low' | 'medium' | 'high' | 'original';
  targetSize?: number; // Target size in bytes
  maxBitrate: number;
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
  audioQuality: number; // 1-10 scale
  enableHardwareAcceleration: boolean;
  preserveMetadata: boolean;
}

interface StorageProvider {
  name: string;
  type: 'local' | 'cloud' | 'cdn';
  endpoint?: string;
  credentials?: {
    accessKey?: string;
    secretKey?: string;
    region?: string;
    bucket?: string;
  };
  features: {
    streaming: boolean;
    transcoding: boolean;
    thumbnails: boolean;
    analytics: boolean;
  };
}

interface VideoAccessLog {
  id: string;
  videoId: string;
  userId: string;
  action: 'upload' | 'view' | 'download' | 'share' | 'delete';
  timestamp: Date;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    duration?: number;
  };
}

class VideoStorageService {
  private storageProviders: Map<string, StorageProvider> = new Map();
  private videoFiles: Map<string, VideoFile> = new Map();
  private compressionWorker: Worker | null = null;
  private accessLogs: VideoAccessLog[] = [];
  private quotaUsed: number = 0;
  private quotaLimit: number = 10 * 1024 * 1024 * 1024; // 10GB default

  constructor() {
    this.initializeStorageProviders();
    this.initializeCompressionWorker();
    this.loadStorageQuota();
  }

  /**
   * Initialize storage providers
   */
  private initializeStorageProviders(): void {
    // Local storage provider
    this.storageProviders.set('local', {
      name: 'Local Storage',
      type: 'local',
      features: {
        streaming: false,
        transcoding: false,
        thumbnails: true,
        analytics: false
      }
    });

    // Simulated cloud storage provider
    this.storageProviders.set('cloud', {
      name: 'Cloud Storage',
      type: 'cloud',
      endpoint: 'https://api.videostorage.example.com',
      credentials: {
        accessKey: config.videoStorage.accessKey,
        secretKey: config.videoStorage.secretKey,
        region: config.videoStorage.region,
        bucket: config.videoStorage.bucket
      },
      features: {
        streaming: true,
        transcoding: true,
        thumbnails: true,
        analytics: true
      }
    });

    // CDN provider
    this.storageProviders.set('cdn', {
      name: 'CDN Storage',
      type: 'cdn',
      endpoint: 'https://cdn.videostorage.example.com',
      features: {
        streaming: true,
        transcoding: false,
        thumbnails: true,
        analytics: true
      }
    });
  }

  /**
   * Initialize web worker for video compression
   */
  private initializeCompressionWorker(): void {
    try {
      // In a real implementation, this would load a separate worker file
      const workerCode = `
        self.onmessage = function(e) {
          const { videoBlob, settings } = e.data;

          // Simulate compression process
          const compressionSteps = [
            'Analyzing video format',
            'Extracting frames',
            'Compressing video stream',
            'Compressing audio stream',
            'Optimizing metadata',
            'Finalizing output'
          ];

          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);

              // Simulate compressed blob (in reality, this would be actual compression)
              const compressedSize = Math.floor(videoBlob.size * (settings.quality === 'high' ? 0.7 : settings.quality === 'medium' ? 0.5 : 0.3));
              const compressedBlob = new Blob([videoBlob.slice(0, compressedSize)], { type: videoBlob.type });

              self.postMessage({
                type: 'completed',
                compressedBlob,
                originalSize: videoBlob.size,
                compressedSize: compressedBlob.size,
                compressionRatio: (1 - compressedBlob.size / videoBlob.size) * 100
              });
            } else {
              self.postMessage({
                type: 'progress',
                progress: Math.floor(progress),
                step: compressionSteps[Math.floor(progress / 16.67)] || 'Processing...'
              });
            }
          }, 200);
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.compressionWorker = new Worker(URL.createObjectURL(blob));
    } catch (error) {
      logger.warn('Video compression worker not available', {
        action: 'compression_worker_init_failed',
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Load storage quota information
   */
  private async loadStorageQuota(): Promise<void> {
    try {
      if ('navigator' in globalThis && 'storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        this.quotaLimit = estimate.quota || this.quotaLimit;
        this.quotaUsed = estimate.usage || 0;
      }
    } catch (error) {
      logger.warn('Could not load storage quota', {
        action: 'storage_quota_load_failed',
        metadata: { error: error instanceof Error ? error.message : String(error) }
      });
    }
  }

  /**
   * Store and process a video file
   */
  async storeVideo(
    videoBlob: Blob,
    metadata: Omit<VideoMetadata, 'originalSize' | 'createdAt' | 'lastModified'>,
    compressionSettings?: Partial<CompressionSettings>,
    storageProvider: string = 'local'
  ): Promise<string> {
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check storage quota
    if (this.quotaUsed + videoBlob.size > this.quotaLimit) {
      throw new Error('Storage quota exceeded. Please free up space or upgrade your plan.');
    }

    // Create video file record
    const videoFile: VideoFile = {
      id: videoId,
      originalBlob: videoBlob,
      metadata: {
        ...metadata,
        originalSize: videoBlob.size,
        createdAt: new Date(),
        lastModified: new Date()
      },
      storageLocation: '',
      compressionSettings: this.getCompressionSettings(compressionSettings),
      processingStatus: 'pending',
      uploadProgress: 0
    };

    this.videoFiles.set(videoId, videoFile);

    // Log access
    this.logAccess(videoId, 'current_user', 'upload');

    try {
      // Start processing
      await this.processVideo(videoId, storageProvider);
      return videoId;
    } catch (error) {
      videoFile.processingStatus = 'failed';
      videoFile.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Process video (compression and upload)
   */
  private async processVideo(videoId: string, storageProvider: string): Promise<void> {
    const videoFile = this.videoFiles.get(videoId);
    if (!videoFile) throw new Error('Video file not found');

    const provider = this.storageProviders.get(storageProvider);
    if (!provider) throw new Error('Storage provider not found');

    try {
      // Step 1: Compress video
      videoFile.processingStatus = 'compressing';
      const compressedBlob = await this.compressVideo(videoFile);
      videoFile.compressedBlob = compressedBlob || undefined;

      // Update metadata
      if (compressedBlob) {
        videoFile.metadata.compressedSize = compressedBlob.size;
        videoFile.metadata.compressionRatio =
          ((videoFile.metadata.originalSize - compressedBlob.size) / videoFile.metadata.originalSize) * 100;
      }

      // Step 2: Upload to storage
      videoFile.processingStatus = 'uploading';
      const storageLocation = await this.uploadToProvider(
        videoFile,
        provider,
        compressedBlob || videoFile.originalBlob
      );

      videoFile.storageLocation = storageLocation;
      videoFile.processingStatus = 'completed';
      videoFile.uploadProgress = 100;

      // Update quota usage
      this.quotaUsed += (compressedBlob || videoFile.originalBlob).size;

      // Generate thumbnail if not provided
      if (!videoFile.metadata.thumbnail) {
        videoFile.metadata.thumbnail = await this.generateThumbnail(videoFile.originalBlob);
      }

    } catch (error) {
      videoFile.processingStatus = 'failed';
      videoFile.error = error instanceof Error ? error.message : 'Processing failed';
      throw error;
    }
  }

  /**
   * Compress video using web worker
   */
  private async compressVideo(videoFile: VideoFile): Promise<Blob | null> {
    if (!this.compressionWorker || videoFile.compressionSettings.quality === 'original') {
      return null;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Compression timeout'));
      }, 300000); // 5 minutes timeout

      this.compressionWorker!.onmessage = (event) => {
        const { type, compressedBlob, progress, step, originalSize, compressedSize, compressionRatio } = event.data;

        if (type === 'progress') {
          videoFile.uploadProgress = progress * 0.7; // Compression is 70% of total progress
          logger.debug('Compression progress', {
            action: 'video_compression_progress',
            metadata: { videoId: videoFile.id, progress, step }
          });
        } else if (type === 'completed') {
          clearTimeout(timeout);

          // Update metadata
          videoFile.metadata.compressedSize = compressedSize;
          videoFile.metadata.compressionRatio = compressionRatio;

          resolve(compressedBlob);
        } else if (type === 'error') {
          clearTimeout(timeout);
          reject(new Error(event.data.message));
        }
      };

      this.compressionWorker!.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      // Start compression
      this.compressionWorker!.postMessage({
        videoBlob: videoFile.originalBlob,
        settings: videoFile.compressionSettings
      });
    });
  }

  /**
   * Upload video to storage provider
   */
  private async uploadToProvider(
    videoFile: VideoFile,
    provider: StorageProvider,
    blob: Blob
  ): Promise<string> {
    const fileName = `${videoFile.id}.${this.getFileExtension(videoFile.metadata.format)}`;

    switch (provider.type) {
      case 'local':
        return this.uploadToLocalStorage(videoFile, blob, fileName);
      case 'cloud':
        return this.uploadToCloudStorage(videoFile, blob, fileName, provider);
      case 'cdn':
        return this.uploadToCDN(videoFile, blob, fileName, provider);
      default:
        throw new Error('Unsupported storage provider type');
    }
  }

  /**
   * Upload to local storage (IndexedDB)
   */
  private async uploadToLocalStorage(videoFile: VideoFile, blob: Blob, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('VideoStorage', 1);

      request.onerror = () => reject(new Error('Failed to open local storage'));

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('videos')) {
          db.createObjectStore('videos', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');

        const videoData = {
          id: videoFile.id,
          fileName,
          blob,
          metadata: videoFile.metadata,
          uploadedAt: new Date()
        };

        const addRequest = store.add(videoData);

        addRequest.onsuccess = () => {
          resolve(`local://${fileName}`);
        };

        addRequest.onerror = () => {
          reject(new Error('Failed to store video locally'));
        };

        // Simulate upload progress
        let progress = 70; // Start from where compression left off
        const progressInterval = setInterval(() => {
          progress += Math.random() * 10;
          if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
          }
          videoFile.uploadProgress = progress;
        }, 100);
      };
    });
  }

  /**
   * Upload to cloud storage (simulated)
   */
  private async uploadToCloudStorage(
    videoFile: VideoFile,
    blob: Blob,
    fileName: string,
    provider: StorageProvider
  ): Promise<string> {
    // Simulate cloud upload with progress tracking
    return new Promise((resolve, reject) => {
      let progress = 70; // Start from where compression left off
      const uploadInterval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(uploadInterval);

          const cloudUrl = `${provider.endpoint}/${provider.credentials?.bucket}/${fileName}`;
          resolve(cloudUrl);
        }
        videoFile.uploadProgress = progress;
      }, 200);

      // Simulate potential upload failure
      setTimeout(() => {
        if (Math.random() < 0.05) { // 5% chance of failure
          clearInterval(uploadInterval);
          reject(new Error('Network error during upload'));
        }
      }, 1000);
    });
  }

  /**
   * Upload to CDN (simulated)
   */
  private async uploadToCDN(
    videoFile: VideoFile,
    blob: Blob,
    fileName: string,
    provider: StorageProvider
  ): Promise<string> {
    // Simulate CDN upload
    return new Promise((resolve) => {
      let progress = 70;
      const uploadInterval = setInterval(() => {
        progress += Math.random() * 8;
        if (progress >= 100) {
          progress = 100;
          clearInterval(uploadInterval);

          const cdnUrl = `${provider.endpoint}/videos/${fileName}`;
          resolve(cdnUrl);
        }
        videoFile.uploadProgress = progress;
      }, 150);
    });
  }

  /**
   * Retrieve video file
   */
  async getVideo(videoId: string): Promise<VideoFile | null> {
    const videoFile = this.videoFiles.get(videoId);
    if (videoFile) {
      this.logAccess(videoId, 'current_user', 'view');
    }
    return videoFile || null;
  }

  /**
   * Get video stream URL for playback
   */
  async getVideoStreamUrl(videoId: string, quality?: 'original' | 'compressed'): Promise<string | null> {
    const videoFile = this.videoFiles.get(videoId);
    if (!videoFile || videoFile.processingStatus !== 'completed') {
      return null;
    }

    // For cloud/CDN storage, return the direct URL
    if (videoFile.storageLocation.startsWith('http')) {
      return videoFile.storageLocation;
    }

    // For local storage, create a blob URL
    if (videoFile.storageLocation.startsWith('local://')) {
      const blob = quality === 'original' ? videoFile.originalBlob :
                   (videoFile.compressedBlob || videoFile.originalBlob);
      return URL.createObjectURL(blob);
    }

    return null;
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    const videoFile = this.videoFiles.get(videoId);
    if (!videoFile) return false;

    try {
      // Delete from storage provider
      await this.deleteFromStorage(videoFile);

      // Update quota
      const size = videoFile.compressedBlob?.size || videoFile.originalBlob.size;
      this.quotaUsed = Math.max(0, this.quotaUsed - size);

      // Remove from memory
      this.videoFiles.delete(videoId);

      // Log access
      this.logAccess(videoId, 'current_user', 'delete');

      return true;
    } catch (error) {
      logger.error('Failed to delete video', {
        action: 'video_deletion_failed',
        metadata: {
          videoId,
          error: error instanceof Error ? error.message : String(error)
        }
      });
      return false;
    }
  }

  /**
   * Delete from storage provider
   */
  private async deleteFromStorage(videoFile: VideoFile): Promise<void> {
    if (videoFile.storageLocation.startsWith('local://')) {
      // Delete from IndexedDB
      const request = indexedDB.open('VideoStorage', 1);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(['videos'], 'readwrite');
        const store = transaction.objectStore('videos');
        store.delete(videoFile.id);
      };
    } else if (videoFile.storageLocation.startsWith('http')) {
      // In a real implementation, make API call to delete from cloud/CDN
      logger.info('Cloud storage deletion requested', {
        action: 'cloud_storage_deletion',
        metadata: { location: videoFile.storageLocation }
      });
    }
  }

  /**
   * Generate video thumbnail
   */
  private async generateThumbnail(videoBlob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = 320;
        canvas.height = 180;
        video.currentTime = video.duration / 2; // Middle frame
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        }
      };

      video.src = URL.createObjectURL(videoBlob);
    });
  }

  /**
   * Get compression settings with defaults
   */
  private getCompressionSettings(settings?: Partial<CompressionSettings>): CompressionSettings {
    const defaults: CompressionSettings = {
      quality: 'medium',
      maxBitrate: 2500000, // 2.5 Mbps
      resolution: { width: 1920, height: 1080 },
      frameRate: 30,
      audioQuality: 7,
      enableHardwareAcceleration: true,
      preserveMetadata: true
    };

    return { ...defaults, ...settings };
  }

  /**
   * Get file extension from format
   */
  private getFileExtension(format: string): string {
    const extensions: Record<string, string> = {
      'video/webm': 'webm',
      'video/mp4': 'mp4',
      'video/ogg': 'ogv',
      'video/avi': 'avi',
      'video/mov': 'mov'
    };
    return extensions[format] || 'webm';
  }

  /**
   * Log video access
   */
  private logAccess(videoId: string, userId: string, action: VideoAccessLog['action']): void {
    const logEntry: VideoAccessLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      videoId,
      userId,
      action,
      timestamp: new Date(),
      metadata: {
        userAgent: navigator.userAgent,
        ipAddress: 'unknown' // Would be set server-side
      }
    };

    this.accessLogs.push(logEntry);

    // Keep only last 1000 log entries
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-1000);
    }
  }

  /**
   * Get video statistics
   */
  getVideoStats(videoId: string): {
    views: number;
    downloads: number;
    shares: number;
    lastAccessed?: Date;
    accessHistory: VideoAccessLog[];
  } {
    const logs = this.accessLogs.filter(log => log.videoId === videoId);

    return {
      views: logs.filter(log => log.action === 'view').length,
      downloads: logs.filter(log => log.action === 'download').length,
      shares: logs.filter(log => log.action === 'share').length,
      lastAccessed: logs.length > 0 ? logs[logs.length - 1]?.timestamp : undefined,
      accessHistory: logs.slice(-10) // Last 10 access logs
    };
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): {
    used: number;
    limit: number;
    available: number;
    usagePercentage: number;
    videoCount: number;
  } {
    return {
      used: this.quotaUsed,
      limit: this.quotaLimit,
      available: this.quotaLimit - this.quotaUsed,
      usagePercentage: (this.quotaUsed / this.quotaLimit) * 100,
      videoCount: this.videoFiles.size
    };
  }

  /**
   * Get all videos with optional filtering
   */
  getAllVideos(filter?: {
    status?: VideoFile['processingStatus'];
    createdAfter?: Date;
    createdBefore?: Date;
    minDuration?: number;
    maxDuration?: number;
  }): VideoFile[] {
    let videos = Array.from(this.videoFiles.values());

    if (filter) {
      if (filter.status) {
        videos = videos.filter(v => v.processingStatus === filter.status);
      }
      if (filter.createdAfter) {
        videos = videos.filter(v => v.metadata.createdAt >= filter.createdAfter!);
      }
      if (filter.createdBefore) {
        videos = videos.filter(v => v.metadata.createdAt <= filter.createdBefore!);
      }
      if (filter.minDuration) {
        videos = videos.filter(v => v.metadata.duration >= filter.minDuration!);
      }
      if (filter.maxDuration) {
        videos = videos.filter(v => v.metadata.duration <= filter.maxDuration!);
      }
    }

    return videos.sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime());
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
      this.compressionWorker = null;
    }

    // Revoke blob URLs to free memory
    this.videoFiles.forEach(videoFile => {
      if (videoFile.storageLocation.startsWith('blob:')) {
        URL.revokeObjectURL(videoFile.storageLocation);
      }
    });
  }
}

export const videoStorageService = new VideoStorageService();
export type {
  VideoFile,
  VideoMetadata,
  CompressionSettings,
  StorageProvider,
  VideoAccessLog
};