
/**
 * Health Check System
 * Phase 5A: Production Operations & DevOps
 */

interface HealthCheckResult {
  duration: number;
  message: string;
  metadata?: Record<string, unknown>;
  status: 'degraded' | 'healthy' | 'unhealthy';
  timestamp: number;
}

interface HealthCheckConfig {
  interval: number;
  retries: number;
  timeout: number;
}

interface SystemHealth {
  checks: Record<string, HealthCheckResult>;
  overall: 'degraded' | 'healthy' | 'unhealthy';
  timestamp: number;
  uptime: number;
  version: string;
}

type HealthCheckFunction = () => Promise<HealthCheckResult>;

export class HealthCheckService {
  private checks: Map<string, HealthCheckFunction> = new Map();
  private config: HealthCheckConfig;
  private lastResults: Map<string, HealthCheckResult> = new Map();
  private startTime: number = Date.now();

  constructor(config: HealthCheckConfig) {
    this.config = config;
  }

  /**
   * Register a health check
   */
  registerCheck(name: string, checkFunction: HealthCheckFunction): void {
    this.checks.set(name, checkFunction);
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<SystemHealth> {
    const checkResults: Record<string, HealthCheckResult> = {};
    const checkPromises: Promise<void>[] = [];

    // Run all checks concurrently
    for (const [name, checkFn] of this.checks.entries()) {
      const checkPromise = this.runSingleCheck(name, checkFn)
        .then(result => {
          checkResults[name] = result;
          this.lastResults.set(name, result);
        })
        .catch(error => {
          const errorResult: HealthCheckResult = {
            status: 'unhealthy',
            message: `Health check failed: ${error.message}`,
            duration: 0,
            timestamp: Date.now(),
          };
          checkResults[name] = errorResult;
          this.lastResults.set(name, errorResult);
        });

      checkPromises.push(checkPromise);
    }

    // Wait for all checks to complete
    await Promise.all(checkPromises);

    // Calculate overall health
    const overall = this.calculateOverallHealth(Object.values(checkResults));

    return {
      overall,
      checks: checkResults,
      uptime: Date.now() - this.startTime,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      timestamp: Date.now(),
    };
  }

  /**
   * Run a single health check with timeout and retries
   */
  private async runSingleCheck(
    name: string,
    checkFn: HealthCheckFunction
  ): Promise<HealthCheckResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retries; attempt++) {
      try {
        const startTime = performance.now();

        // Run check with timeout
        const result = await Promise.race([
          checkFn(),
          this.createTimeoutPromise(name),
        ]);

        const duration = performance.now() - startTime;

        return {
          ...result,
          duration,
          timestamp: Date.now(),
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.config.retries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }

    throw (
      lastError ||
      new Error(
        `Health check ${name} failed after ${this.config.retries} attempts`
      )
    );
  }

  /**
   * Create timeout promise for health check
   */
  private createTimeoutPromise(checkName: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `Health check ${checkName} timed out after ${this.config.timeout}ms`
          )
        );
      }, this.config.timeout);
    });
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(
    results: HealthCheckResult[]
  ): 'degraded' | 'healthy' | 'unhealthy' {
    if (results.length === 0) return 'unhealthy';

    const unhealthyCount = results.filter(r => r.status === 'unhealthy').length;
    const degradedCount = results.filter(r => r.status === 'degraded').length;

    if (unhealthyCount > 0) return 'unhealthy';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  }

  /**
   * Get the last known health status
   */
  getLastHealth(): null | SystemHealth {
    if (this.lastResults.size === 0) return null;

    const checks: Record<string, HealthCheckResult> = {};
    for (const [name, result] of this.lastResults.entries()) {
      checks[name] = result;
    }

    return {
      overall: this.calculateOverallHealth(Object.values(checks)),
      checks,
      uptime: Date.now() - this.startTime,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      timestamp: Date.now(),
    };
  }
}

// Create health check service instance
export const healthCheckService = new HealthCheckService({
  timeout: 5000, // 5 seconds
  interval: 30000, // 30 seconds
  retries: 2,
});

// Register default health checks

/**
 * Database connectivity check
 */
healthCheckService.registerCheck(
  'database',
  async (): Promise<HealthCheckResult> => {
    try {
      // Check if we can create a Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL || '',
        import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      );

      // Simple query to test connectivity
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        throw error;
      }

      return {
        status: 'healthy',
        message: 'Database connection successful',
        duration: 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 0,
        timestamp: Date.now(),
      };
    }
  }
);

/**
 * Local storage availability check
 */
healthCheckService.registerCheck(
  'localStorage',
  async (): Promise<HealthCheckResult> => {
    try {
      const testKey = '__health_check_test__';
      const testValue = 'test';

      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (retrieved !== testValue) {
        throw new Error('Local storage write/read test failed');
      }

      return {
        status: 'healthy',
        message: 'Local storage is functional',
        duration: 0,
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Local storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 0,
        timestamp: Date.now(),
      };
    }
  }
);

/**
 * Memory usage check
 */
healthCheckService.registerCheck(
  'memory',
  async (): Promise<HealthCheckResult> => {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const totalMB = memory.totalJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;

        const usagePercent = (usedMB / limitMB) * 100;

        let status: 'degraded' | 'healthy' | 'unhealthy';
        let message: string;

        if (usagePercent < 60) {
          status = 'healthy';
          message = `Memory usage is normal (${usagePercent.toFixed(1)}%)`;
        } else if (usagePercent < 80) {
          status = 'degraded';
          message = `Memory usage is elevated (${usagePercent.toFixed(1)}%)`;
        } else {
          status = 'unhealthy';
          message = `Memory usage is critical (${usagePercent.toFixed(1)}%)`;
        }

        return {
          status,
          message,
          duration: 0,
          timestamp: Date.now(),
          metadata: {
            usedMB: Math.round(usedMB),
            totalMB: Math.round(totalMB),
            limitMB: Math.round(limitMB),
            usagePercent: Math.round(usagePercent),
          },
        };
      } else {
        return {
          status: 'degraded',
          message: 'Memory monitoring not supported in this browser',
          duration: 0,
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 0,
        timestamp: Date.now(),
      };
    }
  }
);

/**
 * Network connectivity check
 */
healthCheckService.registerCheck(
  'network',
  async (): Promise<HealthCheckResult> => {
    try {
      const startTime = performance.now();

      // Use a simple fetch to test network connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
      });

      const duration = performance.now() - startTime;

      if (!response.ok && response.status !== 404) {
        throw new Error(
          `Network request failed with status: ${response.status}`
        );
      }

      let status: 'degraded' | 'healthy' | 'unhealthy';
      let message: string;

      if (duration < 1000) {
        status = 'healthy';
        message = `Network connectivity is good (${Math.round(duration)}ms)`;
      } else if (duration < 3000) {
        status = 'degraded';
        message = `Network connectivity is slow (${Math.round(duration)}ms)`;
      } else {
        status = 'unhealthy';
        message = `Network connectivity is very slow (${Math.round(duration)}ms)`;
      }

      return {
        status,
        message,
        duration,
        timestamp: Date.now(),
        metadata: {
          responseTime: Math.round(duration),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Network check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 0,
        timestamp: Date.now(),
      };
    }
  }
);

// Export convenience functions
export const runHealthCheck = () => healthCheckService.runHealthChecks();
export const getLastHealthStatus = () => healthCheckService.getLastHealth();
export const registerHealthCheck = (
  name: string,
  checkFn: HealthCheckFunction
) => healthCheckService.registerCheck(name, checkFn);
