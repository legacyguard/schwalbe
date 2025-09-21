/**
 * Enhanced API client with comprehensive error handling
 * Centralized HTTP client with retry logic, error handling, and monitoring
 */

import {
  AppError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  ServerError,
  RateLimitError,
  ValidationError,
  ErrorType,
  ErrorSeverity,
  errorHandler
} from './error-handling'

export interface ApiRequestConfig {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  data?: any
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  retryDelay?: number
  skipErrorHandling?: boolean
}

export interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

export interface ApiErrorResponse {
  error: {
    message: string
    code: string
    details?: any
  }
  status: number
}

class ApiClient {
  private baseURL: string
  private defaultTimeout = 10000
  private defaultRetries = 3
  private defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  constructor(baseURL = '') {
    this.baseURL = baseURL
  }

  /**
   * Set default authorization header
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  /**
   * Remove authorization header
   */
  clearAuthToken() {
    delete this.defaultHeaders['Authorization']
  }

  /**
   * Main request method with comprehensive error handling
   */
  async request<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
    const {
      url,
      method = 'GET',
      data,
      headers = {},
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      retryDelay = 1000,
      skipErrorHandling = false
    } = config

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`
    const requestHeaders = { ...this.defaultHeaders, ...headers }

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    let lastError: Error
    let attempt = 0

    while (attempt <= retries) {
      attempt++

      try {
        const requestInit: RequestInit = {
          method,
          headers: requestHeaders,
          signal: controller.signal
        }

        if (data && method !== 'GET') {
          requestInit.body = typeof data === 'string' ? data : JSON.stringify(data)
        }

        const response = await fetch(fullUrl, requestInit)
        clearTimeout(timeoutId)

        // Handle HTTP error status codes
        if (!response.ok) {
          await this.handleHttpError(response, attempt, retries)
        }

        // Parse response
        const responseHeaders = this.parseHeaders(response.headers)
        let responseData: T

        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          responseData = await response.json()
        } else {
          responseData = (await response.text()) as any
        }

        return {
          data: responseData,
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders
        }

      } catch (error) {
        clearTimeout(timeoutId)
        lastError = error as Error

        // Handle specific error types
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            lastError = new AppError(
              'Request timeout',
              ErrorType.TIMEOUT,
              ErrorSeverity.MEDIUM,
              'REQUEST_TIMEOUT',
              { url, method, attempt },
              'Request took too long. Please try again.',
              true
            )
          } else if (error.message.includes('fetch')) {
            lastError = new NetworkError(
              `Network request failed: ${error.message}`,
              { url, method, attempt }
            )
          }
        }

        // Don't retry on the last attempt or for non-retryable errors
        if (attempt > retries || !this.isRetryableError(lastError)) {
          break
        }

        // Wait before retrying
        await this.delay(retryDelay * attempt)
      }
    }

    // Handle the final error
    if (!skipErrorHandling) {
      throw errorHandler.handle(lastError!, { url, method, attempts: attempt })
    } else {
      throw lastError!
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleHttpError(response: Response, attempt: number, maxRetries: number) {
    const status = response.status
    const url = response.url
    let errorBody: any = {}

    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        errorBody = await response.json()
      } else {
        errorBody = { message: await response.text() }
      }
    } catch {
      errorBody = { message: response.statusText }
    }

    const errorMessage = errorBody.message || errorBody.error?.message || response.statusText
    const errorCode = errorBody.code || errorBody.error?.code || `HTTP_${status}`

    const context = {
      url,
      status,
      attempt,
      maxRetries,
      responseBody: errorBody
    }

    switch (status) {
      case 400:
        throw new ValidationError(
          errorMessage || 'Invalid request data',
          { ...context, details: errorBody.details }
        )

      case 401:
        throw new AuthenticationError(
          errorMessage || 'Authentication required',
          context
        )

      case 403:
        throw new AuthorizationError(
          errorMessage || 'Access forbidden',
          context
        )

      case 404:
        throw new AppError(
          errorMessage || 'Resource not found',
          ErrorType.NOT_FOUND,
          ErrorSeverity.LOW,
          errorCode,
          context
        )

      case 429:
        const retryAfter = response.headers.get('Retry-After')
        throw new RateLimitError(
          errorMessage || 'Too many requests',
          retryAfter ? parseInt(retryAfter) : undefined,
          context
        )

      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(
          errorMessage || 'Server error occurred',
          context
        )

      default:
        if (status >= 400 && status < 500) {
          throw new AppError(
            errorMessage || 'Client error',
            ErrorType.CLIENT_ERROR,
            ErrorSeverity.MEDIUM,
            errorCode,
            context
          )
        } else if (status >= 500) {
          throw new ServerError(
            errorMessage || 'Server error',
            context
          )
        }
        break
    }
  }

  /**
   * Check if error should be retried
   */
  private isRetryableError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isRetryable
    }

    // Retry network errors and timeouts
    return error.message.includes('fetch') ||
           error.message.includes('timeout') ||
           error.name === 'AbortError'
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Parse response headers into object
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  /**
   * Convenience methods for different HTTP verbs
   */
  async get<T = any>(url: string, config: Omit<ApiRequestConfig, 'url' | 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'GET' })
  }

  async post<T = any>(url: string, data?: any, config: Omit<ApiRequestConfig, 'url' | 'method' | 'data'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'POST', data })
  }

  async put<T = any>(url: string, data?: any, config: Omit<ApiRequestConfig, 'url' | 'method' | 'data'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PUT', data })
  }

  async patch<T = any>(url: string, data?: any, config: Omit<ApiRequestConfig, 'url' | 'method' | 'data'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'PATCH', data })
  }

  async delete<T = any>(url: string, config: Omit<ApiRequestConfig, 'url' | 'method'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, url, method: 'DELETE' })
  }
}

// Create and export default instance
export const apiClient = new ApiClient()

// Export class for custom instances
export { ApiClient }

/**
 * Higher-order function to wrap API calls with error handling
 */
export function withErrorHandling<TArgs extends any[], TReturn>(
  apiCall: (...args: TArgs) => Promise<TReturn>
) {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      return await apiCall(...args)
    } catch (error) {
      throw errorHandler.handle(error as Error, {
        apiCall: apiCall.name,
        arguments: args
      })
    }
  }
}

/**
 * Utility for handling API responses with error checking
 */
export async function handleApiResponse<T>(
  responsePromise: Promise<ApiResponse<T>>
): Promise<T> {
  try {
    const response = await responsePromise
    return response.data
  } catch (error) {
    throw errorHandler.handle(error as Error)
  }
}