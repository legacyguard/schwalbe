
import type { ErrorInfo } from 'react';

/**
 * Comprehensive Logging System for LegacyGuard
 * Provides structured logging with different levels and transports
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  context?: string | undefined;
  data?: Record<string, any> | undefined;
  error?: Error | undefined;
  level: LogLevel;
  message: string;
  requestId?: string | undefined;
  tags?: string[] | undefined;
  timestamp: Date;
  userId?: string | undefined;
}

export interface LoggerConfig {
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  level: LogLevel;
  maxFiles: number;
  maxFileSize: number;
  redactSensitiveData: boolean;
}

export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private queue: LogEntry[] = [];
  private isProcessing = false;

  private constructor(config: LoggerConfig) {
    this.config = config;
  }

  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      const defaultConfig: LoggerConfig = {
        level: LogLevel.INFO,
        enableConsole: true,
        enableFile: false,
        enableRemote: false,
        maxFileSize: 10 * 1024 * 1024,
        maxFiles: 5,
        redactSensitiveData: true,
      };
      Logger.instance = new Logger({ ...defaultConfig, ...config });
    } else if (config) {
      // Logger already initialized, configuration changes ignored
    }
    return Logger.instance;
  }

  public debug(
    message: string,
    data?: Record<string, any>,
    context?: string
  ): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  public info(
    message: string,
    data?: Record<string, any>,
    context?: string
  ): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  public warn(
    message: string,
    data?: Record<string, any>,
    context?: string
  ): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  public error(
    message: string,
    error?: Error,
    data?: Record<string, any>,
    context?: string
  ): void {
    this.log(LogLevel.ERROR, message, data, context, error);
  }

  public fatal(
    message: string,
    error?: Error,
    data?: Record<string, any>,
    context?: string
  ): void {
    this.log(LogLevel.FATAL, message, data, context, error);
  }

  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, any>,
    context?: string,
    error?: Error
  ): void {
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: context ?? '',
      data: data ? (this.config.redactSensitiveData
        ? this.redactSensitiveData(data)
        : data) : undefined,
      error,
    };

    this.queue.push(entry);
    this.processQueue();
  }

  private redactSensitiveData(
    data?: Record<string, any>
  ): Record<string, any> | undefined {
    if (!data) return data;

    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'ssn',
      'creditCard',
      'bankAccount',
      'routingNumber',
      'pin',
      'passphrase',
    ];

    const redacted = { ...data };

    for (const key in redacted) {
      if (
        sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
      ) {
        redacted[key] = '[REDACTED]';
      } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
        redacted[key] = this.redactSensitiveData(
          redacted[key] as Record<string, any>
        );
      }
    }

    return redacted;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    try {
      while (this.queue.length > 0) {
        const entry = this.queue.shift();
        if (entry) {
          await this.writeLog(entry);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    try {
      if (this.config.enableConsole) {
        this.writeToConsole(entry);
      }

      if (this.config.enableFile) {
        await this.writeToFile(entry);
      }

      if (this.config.enableRemote) {
        await this.writeToRemote(entry);
      }
    } catch (_error) {
      // Failed to write log - error handling will be implemented
    }
  }

  private writeToConsole(entry: LogEntry): void {
    const logMethod = this.getConsoleMethod(entry.level);
    const logMessage = this.formatLogMessage(entry);

    if (entry.error) {
      logMethod(logMessage, entry.error);
    } else {
      logMethod(logMessage, entry.data || '');
    }
  }

  private getConsoleMethod(
    level: LogLevel
  ): (message: string, ...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug.bind(console);
      case LogLevel.INFO:
        return console.info.bind(console);
      case LogLevel.WARN:
        return console.warn.bind(console);
      case LogLevel.ERROR:
        return console.error.bind(console);
      case LogLevel.FATAL:
        return console.error.bind(console);
      default:
        return console.log.bind(console);
    }
  }

  private formatLogMessage(entry: LogEntry): string {
    const level = LogLevel[entry.level];
    const context = entry.context ? `[${entry.context}]` : '';
    return `[${entry.timestamp.toISOString()}] ${level} ${context} ${entry.message}`;
  }

  private async writeToFile(_entry: LogEntry): Promise<void> {
    // TODO: Implement file logging
    throw new Error('File logging not yet implemented');
  }

  private async writeToRemote(_entry: LogEntry): Promise<void> {
    // TODO: Implement remote logging
    throw new Error('Remote logging not yet implemented');
  }

  public createChildLogger(context: string): Logger {
    return new Proxy(this, {
      get(target, prop) {
        if (
          typeof prop === 'string' &&
          ['debug', 'info', 'warn', 'error', 'fatal'].includes(prop)
        ) {
          return (message: string, data?: Record<string, any>) => {
            const method = prop as keyof Logger;
            if (method === 'debug' || method === 'info' || method === 'warn') {
              return target[method](message, data, context);
            } else if (method === 'error' || method === 'fatal') {
              return target[method](message, undefined, data, context);
            }
            return target[method];
          };
        }
        return target[prop as keyof Logger];
      },
    });
  }
}

// Convenience exports
export const logger = Logger.getInstance();

// Performance monitoring utilities
export class PerformanceMonitor {
  private static marks = new Map<string, number>();

  public static mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  public static measure(
    name: string,
    startMark: string,
    endMark?: string
  ): number {
    const start = this.marks.get(startMark);
    if (!start) {
      throw new Error(`Mark ${startMark} not found`);
    }

    const end = endMark ? this.marks.get(endMark) : performance.now();
    if (!end) {
      throw new Error(`Mark ${endMark} not found`);
    }

    const duration = end - start;
    logger.debug(`Performance: ${name} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  public static clearMarks(): void {
    this.marks.clear();
  }
}

// Request context for logging
export interface RequestContext {
  ip?: string;
  requestId: string;
  userAgent?: string;
  userId?: string;
}

export class RequestLogger {
  private static contexts = new Map<string, RequestContext>();

  public static setContext(requestId: string, context: RequestContext): void {
    this.contexts.set(requestId, context);
  }

  public static getContext(requestId: string): RequestContext | undefined {
    return this.contexts.get(requestId);
  }

  public static clearContext(requestId: string): void {
    this.contexts.delete(requestId);
  }

  public static logWithContext(
    level: LogLevel,
    message: string,
    data?: Record<string, any>,
    requestId?: string
  ): void {
    const context = requestId ? this.getContext(requestId) : undefined;
    const enrichedData = {
      ...data,
      requestId,
      userId: context?.userId,
      ip: context?.ip,
    };

    if (level === LogLevel.DEBUG) {
      logger.debug(message, enrichedData, 'request');
    } else if (level === LogLevel.INFO) {
      logger.info(message, enrichedData, 'request');
    } else if (level === LogLevel.WARN) {
      logger.warn(message, enrichedData, 'request');
    } else if (level === LogLevel.ERROR) {
      logger.error(message, undefined, enrichedData, 'request');
    } else if (level === LogLevel.FATAL) {
      logger.fatal(message, undefined, enrichedData, 'request');
    }
  }
}

// Error boundary for React components
export interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  hasError: boolean;
}

export function logComponentError(
  error: Error,
  errorInfo: ErrorInfo,
  componentName?: string
): void {
  logger.error(
    `React Error Boundary: ${componentName || 'Unknown Component'}`,
    error,
    {
      componentName,
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    }
  );
}
