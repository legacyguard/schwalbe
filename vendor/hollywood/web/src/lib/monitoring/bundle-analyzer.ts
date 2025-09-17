/**
 * Bundle Analysis Monitoring
 * Tracks bundle size changes and performance metrics over time
 */

interface BundleMetrics {
  timestamp: number;
  totalSize: number;
  gzipSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzipSize: number;
    modules: string[];
  }>;
  assets: Array<{
    name: string;
    size: number;
    type: 'script' | 'style' | 'image' | 'font';
  }>;
  performance: {
    loadTime: number;
    parseTime: number;
    executionTime: number;
  };
}

interface BundleAnalysisConfig {
  enabled: boolean;
  threshold: {
    warning: number; // KB
    error: number; // KB
  };
  trackOverTime: boolean;
  endpoint: string;
}

class BundleAnalyzer {
  private config: BundleAnalysisConfig;
  private metrics: BundleMetrics[] = [];
  private initialMetrics: BundleMetrics | null = null;

  constructor(config: BundleAnalysisConfig) {
    this.config = config;
    
    if (this.config.enabled) {
      this.initialize();
    }
  }

  private initialize(): void {
    // Measure initial bundle metrics
    this.measureInitialMetrics();
    
    // Monitor bundle loading performance
    this.monitorBundlePerformance();
    
    // Track size changes over time
    if (this.config.trackOverTime) {
      this.startPeriodicTracking();
    }
  }

  private measureInitialMetrics(): void {
    if (typeof performance === 'undefined') return;

    // Wait for all resources to load
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.captureMetrics();
      }, 1000); // Wait 1 second after load for stability
    });
  }

  public captureMetrics(): BundleMetrics {
    const resources = performance.getEntriesByType('resource');
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    const scripts = resources.filter(r => r.name.endsWith('.js'));
    const styles = resources.filter(r => r.name.endsWith('.css'));
    const images = resources.filter(r => /.(png|jpg|jpeg|gif|svg|webp)$/i.test(r.name));
    const fonts = resources.filter(r => /.(woff|woff2|ttf|otf|eot)$/i.test(r.name));

    const metrics: BundleMetrics = {
      timestamp: Date.now(),
      totalSize: this.calculateTotalSize(resources),
      gzipSize: this.estimateGzipSize(resources),
      chunks: this.analyzeChunks(scripts),
      assets: [
        ...scripts.map(r => ({ name: r.name, size: r.transferSize || 0, type: 'script' as const })),
        ...styles.map(r => ({ name: r.name, size: r.transferSize || 0, type: 'style' as const })),
        ...images.map(r => ({ name: r.name, size: r.transferSize || 0, type: 'image' as const })),
        ...fonts.map(r => ({ name: r.name, size: r.transferSize || 0, type: 'font' as const })),
      ],
      performance: {
        loadTime: navigation?.loadEventEnd - navigation?.fetchStart || 0,
        parseTime: navigation?.domContentLoadedEventEnd - navigation?.responseEnd || 0,
        executionTime: navigation?.loadEventEnd - navigation?.domContentLoadedEventEnd || 0,
      },
    };

    this.metrics.push(metrics);

    if (!this.initialMetrics) {
      this.initialMetrics = metrics;
      this.checkThresholds(metrics);
    }

    return metrics;
  }

  private calculateTotalSize(resources: PerformanceResourceTiming[]): number {
    return resources.reduce((total, resource) => {
      return total + (resource.transferSize || resource.decodedBodySize || 0);
    }, 0);
  }

  private estimateGzipSize(resources: PerformanceResourceTiming[]): number {
    // Rough estimation: gzip typically reduces size by 60-80%
    return Math.floor(this.calculateTotalSize(resources) * 0.3);
  }

  private analyzeChunks(scripts: PerformanceResourceTiming[]): BundleMetrics['chunks'] {
    const chunks: BundleMetrics['chunks'] = [];

    scripts.forEach(script => {
      const url = new URL(script.name);
      const filename = url.pathname.split('/').pop() || 'unknown';
      
      // Extract chunk name from filename
      const chunkName = this.extractChunkName(filename);
      
      chunks.push({
        name: chunkName,
        size: script.transferSize || script.decodedBodySize || 0,
        gzipSize: Math.floor((script.transferSize || script.decodedBodySize || 0) * 0.3),
        modules: this.extractModulesFromChunk(filename),
      });
    });

    return chunks;
  }

  private extractChunkName(filename: string): string {
    // Extract meaningful name from chunk filename
    // e.g., "assets/js/react-vendor-abc123.js" -> "react-vendor"
    const match = filename.match(/([^-]+)-[a-f0-9]+\.js$/);
    return match ? match[1] : filename.replace('.js', '');
  }

  private extractModulesFromChunk(filename: string): string[] {
    // This would ideally come from webpack stats
    // For now, we'll use the filename as a proxy
    return [filename];
  }

  private monitorBundlePerformance(): void {
    // Monitor for new resources being loaded (lazy loading)
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.entryType === 'resource' && entry.name.includes('.js')) {
            this.analyzeNewResource(entry);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  private analyzeNewResource(resource: PerformanceResourceTiming): void {
    const size = resource.transferSize || resource.decodedBodySize || 0;
    
    if (size > this.config.threshold.warning * 1024) {
      console.warn(`⚠️ Large resource loaded: ${resource.name} (${Math.round(size / 1024)}KB)`);
      
      if (size > this.config.threshold.error * 1024) {
        console.error(`🚨 Critical large resource: ${resource.name} (${Math.round(size / 1024)}KB)`);
      }
    }
  }

  private startPeriodicTracking(): void {
    // Track metrics every 5 minutes
    setInterval(() => {
      this.captureMetrics();
      this.analyzeTrends();
    }, 5 * 60 * 1000);
  }

  private analyzeTrends(): void {
    if (this.metrics.length < 2) return;

    const recent = this.metrics.slice(-10); // Last 10 measurements
    const averageSize = recent.reduce((sum, m) => sum + m.totalSize, 0) / recent.length;
    const initialSize = this.initialMetrics!.totalSize;

    const sizeChange = ((averageSize - initialSize) / initialSize) * 100;

    if (Math.abs(sizeChange) > 10) {
      console.warn(`📊 Bundle size changed by ${sizeChange.toFixed(1)}% over time`);
      
      // Send to analytics
      this.sendToAnalytics({
        type: 'bundle_size_trend',
        change: sizeChange,
        currentAverage: averageSize,
        initialSize: initialSize,
      });
    }
  }

  private checkThresholds(metrics: BundleMetrics): void {
    const sizeInKB = metrics.totalSize / 1024;

    if (sizeInKB > this.config.threshold.error) {
      console.error(`🚨 Bundle size critical: ${sizeInKB.toFixed(1)}KB exceeds error threshold`);
    } else if (sizeInKB > this.config.threshold.warning) {
      console.warn(`⚠️ Bundle size warning: ${sizeInKB.toFixed(1)}KB exceeds warning threshold`);
    }

    // Check individual chunk sizes
    metrics.chunks.forEach(chunk => {
      const chunkSizeKB = chunk.size / 1024;
      if (chunkSizeKB > 500) { // 500KB per chunk warning
        console.warn(`⚠️ Large chunk detected: ${chunk.name} (${chunkSizeKB.toFixed(1)}KB)`);
      }
    });
  }

  private sendToAnalytics(data: any): void {
    if (import.meta.env.PROD) {
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).catch(console.error);
    }
  }

  public getMetrics(): BundleMetrics[] {
    return [...this.metrics];
  }

  public getCurrentMetrics(): BundleMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  public getBundleSizeReport(): {
    totalSize: number;
    gzipSize: number;
    chunkCount: number;
    largestChunk: string;
    largestChunkSize: number;
  } {
    const current = this.getCurrentMetrics();
    if (!current) {
      return {
        totalSize: 0,
        gzipSize: 0,
        chunkCount: 0,
        largestChunk: '',
        largestChunkSize: 0,
      };
    }

    const largestChunk = current.chunks.reduce((largest, chunk) => 
      chunk.size > largest.size ? chunk : largest, current.chunks[0]
    );

    return {
      totalSize: current.totalSize,
      gzipSize: current.gzipSize,
      chunkCount: current.chunks.length,
      largestChunk: largestChunk?.name || '',
      largestChunkSize: largestChunk?.size || 0,
    };
  }
}

// Initialize bundle analyzer
export const bundleAnalyzer = new BundleAnalyzer({
  enabled: import.meta.env.PROD,
  threshold: {
    warning: 500, // 500KB warning
    error: 1000,  // 1MB error
  },
  trackOverTime: true,
  endpoint: '/api/analytics/bundle-metrics',
});

// Export for use in components
export default bundleAnalyzer;

// Helper to manually trigger bundle analysis
export const analyzeBundle = (): BundleMetrics => {
  return bundleAnalyzer.captureMetrics();
};

// Export bundle size report
export const getBundleReport = () => {
  return bundleAnalyzer.getBundleSizeReport();
};