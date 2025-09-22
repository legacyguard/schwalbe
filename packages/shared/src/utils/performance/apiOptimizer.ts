export class APIOptimizer {
  private requestCache = new Map<string, { data: any; timestamp: number; etag?: string }>()
  private pendingRequests = new Map<string, Promise<any>>()
  private rateLimiter = new Map<string, { count: number; resetTime: number }>()

  constructor(
    private baseURL: string = '',
    private defaultTimeout: number = 30000
  ) {}

  // HTTP client with optimizations
  createOptimizedClient() {
    return {
      get: this.optimizedGet.bind(this),
      post: this.optimizedPost.bind(this),
      put: this.optimizedPut.bind(this),
      delete: this.optimizedDelete.bind(this),
      patch: this.optimizedPatch.bind(this)
    }
  }

  // Optimized GET with caching and deduplication
  private async optimizedGet(
    url: string,
    options: {
      cache?: boolean
      cacheTTL?: number
      dedupe?: boolean
      timeout?: number
      retry?: number
    } = {}
  ) {
    const {
      cache = true,
      cacheTTL = 5 * 60 * 1000, // 5 minutes
      dedupe = true,
      timeout = this.defaultTimeout,
      retry = 3
    } = options

    const cacheKey = `GET:${url}`

    // Check cache first
    if (cache) {
      const cached = this.getCachedResponse(cacheKey, cacheTTL)
      if (cached) {
        return { data: cached.data, fromCache: true }
      }
    }

    // Deduplicate concurrent requests
    if (dedupe && this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)
    }

    // Create request with optimizations
    const requestPromise = this.executeRequest('GET', url, null, {
      timeout,
      retry,
      cacheKey: cache ? cacheKey : undefined
    })

    if (dedupe) {
      this.pendingRequests.set(cacheKey, requestPromise)
      requestPromise.finally(() => {
        this.pendingRequests.delete(cacheKey)
      })
    }

    return requestPromise
  }

  // Optimized POST with retry and rate limiting
  private async optimizedPost(
    url: string,
    data: any,
    options: {
      timeout?: number
      retry?: number
      rateLimit?: { key: string; limit: number; window: number }
    } = {}
  ) {
    const { timeout = this.defaultTimeout, retry = 3, rateLimit } = options

    // Apply rate limiting
    if (rateLimit) {
      await this.checkRateLimit(rateLimit.key, rateLimit.limit, rateLimit.window)
    }

    return this.executeRequest('POST', url, data, { timeout, retry })
  }

  // Optimized PUT
  private async optimizedPut(url: string, data: any, options: any = {}) {
    const { timeout = this.defaultTimeout, retry = 3 } = options
    return this.executeRequest('PUT', url, data, { timeout, retry })
  }

  // Optimized DELETE
  private async optimizedDelete(url: string, options: any = {}) {
    const { timeout = this.defaultTimeout, retry = 3 } = options

    // Invalidate cache entries related to this resource
    this.invalidateCacheByPattern(url)

    return this.executeRequest('DELETE', url, null, { timeout, retry })
  }

  // Optimized PATCH
  private async optimizedPatch(url: string, data: any, options: any = {}) {
    const { timeout = this.defaultTimeout, retry = 3 } = options

    // Invalidate cache for this resource
    this.invalidateCacheByPattern(url)

    return this.executeRequest('PATCH', url, data, { timeout, retry })
  }

  // Core request execution with retry logic
  private async executeRequest(
    method: string,
    url: string,
    data: any,
    options: {
      timeout: number
      retry: number
      cacheKey?: string
    }
  ): Promise<any> {
    const { timeout, retry, cacheKey } = options
    let lastError: Error

    for (let attempt = 1; attempt <= retry; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...this.getCompressionHeaders(),
            ...this.getCacheHeaders(cacheKey)
          },
          body: data ? JSON.stringify(data) : undefined,
          signal: controller.signal
        }

        const response = await fetch(`${this.baseURL}${url}`, requestOptions)
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const responseData = await response.json()

        // Cache successful GET responses
        if (method === 'GET' && cacheKey) {
          this.setCachedResponse(cacheKey, responseData, response.headers.get('etag'))
        }

        return { data: responseData, status: response.status, fromCache: false }

      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        if (this.isNonRetryableError(error)) {
          break
        }

        // Exponential backoff
        if (attempt < retry) {
          await this.delay(Math.pow(2, attempt) * 1000)
        }
      }
    }

    throw lastError!
  }

  // Batch API requests
  async batchRequests<T>(
    requests: Array<{
      method: string
      url: string
      data?: any
      options?: any
    }>,
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = []

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize)

      const batchPromises = batch.map(req => {
        switch (req.method.toUpperCase()) {
          case 'GET':
            return this.optimizedGet(req.url, req.options)
          case 'POST':
            return this.optimizedPost(req.url, req.data, req.options)
          case 'PUT':
            return this.optimizedPut(req.url, req.data, req.options)
          case 'DELETE':
            return this.optimizedDelete(req.url, req.options)
          case 'PATCH':
            return this.optimizedPatch(req.url, req.data, req.options)
          default:
            throw new Error(`Unsupported method: ${req.method}`)
        }
      })

      const batchResults = await Promise.allSettled(batchPromises)

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value)
        } else {
          console.error('Batch request failed:', result.reason)
          results.push(null as any)
        }
      })
    }

    return results
  }

  // Document-specific API optimizations
  getDocumentAPIOptimizations() {
    return {
      // Optimized document upload with chunking
      uploadDocument: async (
        file: File,
        onProgress?: (progress: number) => void
      ) => {
        const chunkSize = 1024 * 1024 // 1MB chunks
        const totalChunks = Math.ceil(file.size / chunkSize)
        const uploadId = this.generateUploadId()

        try {
          // Initialize upload
          await this.optimizedPost('/api/documents/upload/init', {
            uploadId,
            fileName: file.name,
            fileSize: file.size,
            totalChunks
          })

          // Upload chunks
          for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
            const start = chunkIndex * chunkSize
            const end = Math.min(start + chunkSize, file.size)
            const chunk = file.slice(start, end)

            const formData = new FormData()
            formData.append('uploadId', uploadId)
            formData.append('chunkIndex', chunkIndex.toString())
            formData.append('chunk', chunk)

            await this.uploadChunk(formData)

            if (onProgress) {
              onProgress((chunkIndex + 1) / totalChunks)
            }
          }

          // Finalize upload
          return this.optimizedPost('/api/documents/upload/finalize', {
            uploadId
          })

        } catch (error) {
          // Cleanup on error
          await this.optimizedDelete(`/api/documents/upload/${uploadId}`)
          throw error
        }
      },

      // Optimized document processing status polling
      pollProcessingStatus: async (documentId: string) => {
        const maxAttempts = 30
        const baseDelay = 1000

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const response = await this.optimizedGet(
            `/api/documents/${documentId}/status`,
            { cache: false }
          )

          if (response.data.status === 'completed' || response.data.status === 'failed') {
            return response.data
          }

          // Progressive delay
          const delay = Math.min(baseDelay * Math.pow(1.5, attempt), 10000)
          await this.delay(delay)
        }

        throw new Error('Processing timeout')
      },

      // Optimized OCR data retrieval
      getOCRData: async (documentId: string) => {
        return this.optimizedGet(`/api/documents/${documentId}/ocr`, {
          cache: true,
          cacheTTL: 60 * 60 * 1000 // 1 hour cache for OCR data
        })
      }
    }
  }

  // Sofia AI API optimizations
  getSofiaAPIOptimizations() {
    return {
      // Optimized chat with context caching
      sendMessage: async (
        message: string,
        context: any,
        conversationId?: string
      ) => {
        return this.optimizedPost('/api/sofia/chat', {
          message,
          context,
          conversationId
        }, {
          timeout: 15000, // Longer timeout for AI responses
          rateLimit: {
            key: 'sofia_chat',
            limit: 10,
            window: 60000 // 10 requests per minute
          }
        })
      },

      // Batch context analysis
      analyzeContextBatch: async (contexts: any[]) => {
        return this.batchRequests(
          contexts.map(context => ({
            method: 'POST',
            url: '/api/sofia/analyze',
            data: { context }
          })),
          3 // Process 3 at a time
        )
      },

      // Optimized personality state updates
      updatePersonalityState: async (userId: string, state: any) => {
        return this.optimizedPatch(`/api/sofia/personality/${userId}`, state, {
          timeout: 5000
        })
      }
    }
  }

  // Analytics API optimizations
  getAnalyticsAPIOptimizations() {
    return {
      // Cached analytics dashboard data
      getDashboardAnalytics: async (userId: string, timeframe: string = '30d') => {
        return this.optimizedGet(
          `/api/analytics/dashboard/${userId}?timeframe=${timeframe}`,
          {
            cache: true,
            cacheTTL: 15 * 60 * 1000 // 15 minutes cache
          }
        )
      },

      // Batch event tracking
      trackEventsBatch: async (events: any[]) => {
        const batchSize = 50
        const batches = []

        for (let i = 0; i < events.length; i += batchSize) {
          batches.push(events.slice(i, i + batchSize))
        }

        return Promise.all(
          batches.map(batch =>
            this.optimizedPost('/api/analytics/events/batch', { events: batch })
          )
        )
      },

      // Compressed large analytics payloads
      sendLargeAnalyticsData: async (data: any) => {
        return this.optimizedPost('/api/analytics/bulk', data, {
          timeout: 60000 // 60 seconds for large data
        })
      }
    }
  }

  // Caching utilities
  private getCachedResponse(key: string, ttl: number) {
    const cached = this.requestCache.get(key)
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached
    }
    this.requestCache.delete(key)
    return null
  }

  private setCachedResponse(key: string, data: any, etag?: string | null) {
    // Limit cache size
    if (this.requestCache.size > 200) {
      const firstKey = this.requestCache.keys().next().value
      this.requestCache.delete(firstKey)
    }

    this.requestCache.set(key, {
      data,
      timestamp: Date.now(),
      etag: etag || undefined
    })
  }

  private invalidateCacheByPattern(pattern: string) {
    const keysToDelete = []
    for (const key of this.requestCache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.requestCache.delete(key))
  }

  // Rate limiting
  private async checkRateLimit(key: string, limit: number, windowMs: number) {
    const now = Date.now()
    const limiter = this.rateLimiter.get(key)

    if (!limiter || now > limiter.resetTime) {
      this.rateLimiter.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return
    }

    if (limiter.count >= limit) {
      const waitTime = limiter.resetTime - now
      throw new Error(`Rate limit exceeded. Try again in ${waitTime}ms`)
    }

    limiter.count++
  }

  // Compression headers
  private getCompressionHeaders() {
    return {
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Encoding': 'gzip'
    }
  }

  // Cache headers
  private getCacheHeaders(cacheKey?: string) {
    if (!cacheKey) return {}

    const cached = this.requestCache.get(cacheKey)
    if (cached?.etag) {
      return { 'If-None-Match': cached.etag }
    }

    return {}
  }

  // Utility methods
  private isNonRetryableError(error: any): boolean {
    if (error.name === 'AbortError') return true
    if (error.message?.includes('HTTP 4')) return true // 4xx errors
    return false
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private generateUploadId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async uploadChunk(formData: FormData): Promise<any> {
    const response = await fetch(`${this.baseURL}/api/documents/upload/chunk`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Performance monitoring
  getPerformanceMetrics() {
    const metrics = {
      cacheHitRate: 0,
      averageResponseTime: 0,
      errorRate: 0,
      requestCount: 0
    }

    // Calculate metrics from stored data
    return metrics
  }

  // Request interceptors
  addRequestInterceptor(interceptor: (config: any) => any) {
    // Implementation for request interceptors
  }

  addResponseInterceptor(interceptor: (response: any) => any) {
    // Implementation for response interceptors
  }

  // Cleanup
  clearCache() {
    this.requestCache.clear()
    this.pendingRequests.clear()
    this.rateLimiter.clear()
  }
}