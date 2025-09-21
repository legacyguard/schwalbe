/**
 * Structured logging utility that replaces console.* calls
 * Logs to Supabase error_log table for production environments
 * Ensures no PII is exposed in logs
 */

import { supabaseClient } from '../supabase/client';

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Log context interface
interface LogContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

class Logger {
  private static instance: Logger;
  private supabaseClient: any;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';

    // Use the shared Supabase client
    this.supabaseClient = supabaseClient;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Sanitize data to remove potential PII
   */
  private sanitize(data: any): any {
    if (typeof data === 'string') {
      // Remove email addresses
      data = data.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
      // Remove phone numbers (basic pattern)
      data = data.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');
      // Remove credit card numbers
      data = data.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');
      // Remove SSN-like patterns
      data = data.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]');
    } else if (typeof data === 'object' && data !== null) {
      const sanitized: any = Array.isArray(data) ? [] : {};
      for (const key in data) {
        // Skip sensitive keys
        if (['password', 'token', 'secret', 'apiKey', 'authorization'].includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitize(data[key]);
        }
      }
      return sanitized;
    }
    return data;
  }

  /**
   * Log to Supabase error_log table
   */
  private async logToDatabase(level: LogLevel, message: string, context: LogContext = {}) {
    if (!this.supabaseClient) return;

    try {
      const sanitizedContext = this.sanitize(context);
      
      await this.supabaseClient
        .from('error_log')
        .insert({
          level,
          message: this.sanitize(message),
          context: sanitizedContext,
          stack: context.stack || null
        });
    } catch (error) {
      // Fallback to console in case of database error
      if (this.isDevelopment) {
        console.error('Failed to log to database:', error);
      }
    }
  }

  /**
   * Generic log method
   */
  private log(level: LogLevel, message: string, context: LogContext = {}) {
    const sanitizedMessage = this.sanitize(message);
    const sanitizedContext = this.sanitize(context);

    // In development, log to console
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${sanitizedMessage}`;
      
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(logMessage, sanitizedContext);
          break;
        case LogLevel.INFO:
          console.info(logMessage, sanitizedContext);
          break;
        case LogLevel.WARN:
          console.warn(logMessage, sanitizedContext);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          console.error(logMessage, sanitizedContext);
          break;
      }
    }

    // Log to database for warn, error, and critical levels
    if ([LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL].includes(level)) {
      this.logToDatabase(level, message, context);
    }
  }

  // Public methods
  public debug(message: string, context: LogContext = {}) {
    this.log(LogLevel.DEBUG, message, context);
  }

  public info(message: string, context: LogContext = {}) {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context: LogContext = {}) {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, context: LogContext = {}) {
    // Capture stack trace for errors
    if (!context.stack && Error.captureStackTrace) {
      const err = new Error();
      Error.captureStackTrace(err, this.error);
      context.stack = err.stack;
    }
    this.log(LogLevel.ERROR, message, context);
  }

  public critical(message: string, context: LogContext = {}) {
    // Capture stack trace for critical errors
    if (!context.stack && Error.captureStackTrace) {
      const err = new Error();
      Error.captureStackTrace(err, this.critical);
      context.stack = err.stack;
    }
    this.log(LogLevel.CRITICAL, message, context);
    
    // For critical errors, also trigger email alert if Resend is configured
    this.sendCriticalAlert(message, context);
  }

  /**
   * Send critical error alerts via Resend
   */
  private async sendCriticalAlert(message: string, context: LogContext) {
    if (this.isDevelopment) {
      console.error('[ALERT] Critical error should trigger email:', message);
      return;
    }

    // Dynamically import to avoid circular dependencies
    try {
      const { sendCriticalAlert } = await import('./resend');
      await sendCriticalAlert(message, context);
    } catch (error) {
      // Fallback if Resend is not configured
      console.error('[ALERT] Failed to send critical alert email:', error);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions
export const debug = (message: string, context?: LogContext) => logger.debug(message, context);
export const info = (message: string, context?: LogContext) => logger.info(message, context);
export const warn = (message: string, context?: LogContext) => logger.warn(message, context);
export const error = (message: string, context?: LogContext) => logger.error(message, context);
export const critical = (message: string, context?: LogContext) => logger.critical(message, context);

export default logger;