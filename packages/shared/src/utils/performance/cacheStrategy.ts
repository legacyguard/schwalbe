export class CacheStrategy {
  private memoryCache = new Map<string, CacheEntry>()
  private persistentCache: CacheStorage | null = null
  private cacheName = 'schwalbe-cache-v1'

  constructor() {
    this.initializePersistentCache()
  }

  // Initialize cache storage
  private async initializePersistentCache() {
    if ('caches' in window) {
      this.persistentCache = await caches.open(this.cacheName)
    }
  }

  // Multi-level caching strategy
  async get<T>(key: string, options: CacheGetOptions = {}): Promise<T | null> {
    const {
      level = 'both',
      fallbackToNetwork = false
    } = options

    // Level 1: Memory cache (fastest)
    if (level === 'memory' || level === 'both') {
      const memoryResult = this.getFromMemory<T>(key)
      if (memoryResult) {
        return memoryResult
      }
    }

    // Level 2: Persistent cache (medium speed)
    if (level === 'persistent' || level === 'both') {
      const persistentResult = await this.getFromPersistent<T>(key)
      if (persistentResult) {
        // Store in memory for next access
        this.setInMemory(key, persistentResult, 5 * 60 * 1000) // 5 min
        return persistentResult
      }
    }

    // Level 3: Network fallback (slowest)
    if (fallbackToNetwork) {
      return this.getFromNetwork<T>(key)
    }

    return null
  }

  // Set cache with multiple levels
  async set<T>(
    key: string,
    value: T,
    options: CacheSetOptions = {}
  ): Promise<void> {
    const {
      level = 'both',
      ttl = 30 * 60 * 1000, // 30 minutes default
      persist = false
    } = options

    // Memory cache
    if (level === 'memory' || level === 'both') {
      this.setInMemory(key, value, ttl)
    }

    // Persistent cache
    if (level === 'persistent' || level === 'both' || persist) {
      await this.setInPersistent(key, value, ttl)
    }
  }

  // Document-specific caching strategies
  getDocumentCacheStrategies() {
    return {
      // Document metadata (frequently accessed)
      documentMetadata: {
        get: (documentId: string) =>
          this.get(`doc_meta_${documentId}`, { level: 'memory' }),
        set: (documentId: string, metadata: any) =>
          this.set(`doc_meta_${documentId}`, metadata, {
            level: 'memory',
            ttl: 10 * 60 * 1000 // 10 minutes
          })
      },

      // Document content (large, less frequently accessed)
      documentContent: {
        get: (documentId: string) =>
          this.get(`doc_content_${documentId}`, { level: 'persistent' }),
        set: (documentId: string, content: any) =>
          this.set(`doc_content_${documentId}`, content, {
            level: 'persistent',
            ttl: 60 * 60 * 1000 // 1 hour
          })
      },

      // Thumbnails (medium size, often accessed)
      thumbnails: {
        get: (documentId: string) =>
          this.get(`thumb_${documentId}`, { level: 'both' }),
        set: (documentId: string, thumbnail: Blob) =>
          this.set(`thumb_${documentId}`, thumbnail, {
            level: 'both',
            ttl: 24 * 60 * 60 * 1000 // 24 hours
          })
      },

      // OCR results (expensive to compute)
      ocrResults: {
        get: (documentId: string) =>
          this.get(`ocr_${documentId}`, { level: 'persistent' }),
        set: (documentId: string, ocrData: any) =>
          this.set(`ocr_${documentId}`, ocrData, {
            level: 'persistent',
            ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
            persist: true
          })
      }
    }
  }

  // User-specific caching strategies
  getUserCacheStrategies() {
    return {
      // User profile (small, frequently accessed)
      userProfile: {
        get: (userId: string) =>
          this.get(`user_${userId}`, { level: 'memory' }),
        set: (userId: string, profile: any) =>
          this.set(`user_${userId}`, profile, {
            level: 'memory',
            ttl: 15 * 60 * 1000 // 15 minutes
          })
      },

      // User preferences (small, persistent)
      userPreferences: {
        get: (userId: string) =>
          this.get(`prefs_${userId}`, { level: 'both' }),
        set: (userId: string, preferences: any) =>
          this.set(`prefs_${userId}`, preferences, {
            level: 'both',
            ttl: 24 * 60 * 60 * 1000, // 24 hours
            persist: true
          })
      },

      // User analytics (large, background sync)
      userAnalytics: {
        get: (userId: string) =>
          this.get(`analytics_${userId}`, { level: 'persistent' }),
        set: (userId: string, analytics: any) =>
          this.set(`analytics_${userId}`, analytics, {
            level: 'persistent',
            ttl: 60 * 60 * 1000 // 1 hour
          })
      }
    }
  }

  // Sofia AI caching strategies
  getSofiaCacheStrategies() {
    return {
      // Conversation context (session-based)
      conversationContext: {
        get: (conversationId: string) =>
          this.get(`sofia_ctx_${conversationId}`, { level: 'memory' }),
        set: (conversationId: string, context: any) =>
          this.set(`sofia_ctx_${conversationId}`, context, {
            level: 'memory',
            ttl: 30 * 60 * 1000 // 30 minutes
          })
      },

      // User personality profile (persistent)
      personalityProfile: {
        get: (userId: string) =>
          this.get(`sofia_personality_${userId}`, { level: 'both' }),
        set: (userId: string, personality: any) =>
          this.set(`sofia_personality_${userId}`, personality, {
            level: 'both',
            ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
            persist: true
          })
      },

      // Quick responses (frequently used)
      quickResponses: {
        get: (contextHash: string) =>
          this.get(`sofia_quick_${contextHash}`, { level: 'memory' }),
        set: (contextHash: string, response: any) =>
          this.set(`sofia_quick_${contextHash}`, response, {
            level: 'memory',
            ttl: 5 * 60 * 1000 // 5 minutes
          })
      }
    }
  }

  // Cache invalidation strategies
  getInvalidationStrategies() {
    return {
      // Invalidate user-related caches
      invalidateUser: async (userId: string) => {
        const patterns = [
          `user_${userId}`,
          `prefs_${userId}`,
          `analytics_${userId}`,
          `sofia_personality_${userId}`
        ]
        await this.invalidateByPatterns(patterns)
      },

      // Invalidate document-related caches
      invalidateDocument: async (documentId: string) => {
        const patterns = [
          `doc_meta_${documentId}`,
          `doc_content_${documentId}`,
          `thumb_${documentId}`,
          `ocr_${documentId}`
        ]
        await this.invalidateByPatterns(patterns)
      },

      // Invalidate by tags
      invalidateByTag: async (tag: string) => {
        const keysToInvalidate = []

        // Check memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
          if (entry.tags?.includes(tag)) {
            keysToInvalidate.push(key)
          }
        }

        // Invalidate found keys
        await Promise.all(keysToInvalidate.map(key => this.delete(key)))
      },

      // Time-based invalidation
      invalidateExpired: async () => {
        const now = Date.now()
        const expiredKeys = []

        // Check memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
          if (entry.expiresAt && now > entry.expiresAt) {
            expiredKeys.push(key)
          }
        }

        // Remove expired entries
        expiredKeys.forEach(key => this.memoryCache.delete(key))
      }
    }
  }

  // Cache warming strategies
  getCacheWarmingStrategies() {
    return {
      // Warm essential user data
      warmUserData: async (userId: string) => {
        const userStrategies = this.getUserCacheStrategies()

        // Preload user profile and preferences
        await Promise.all([
          this.loadAndCache(`/api/users/${userId}`, userStrategies.userProfile.set.bind(null, userId)),
          this.loadAndCache(`/api/users/${userId}/preferences`, userStrategies.userPreferences.set.bind(null, userId))
        ])
      },

      // Warm recent documents
      warmRecentDocuments: async (userId: string) => {
        const docStrategies = this.getDocumentCacheStrategies()

        // Get recent documents list
        const recentDocs = await this.loadFromNetwork(`/api/users/${userId}/documents/recent`)

        // Preload metadata and thumbnails
        if (recentDocs) {
          await Promise.all(
            recentDocs.slice(0, 5).map(async (doc: any) => {
              await Promise.all([
                docStrategies.documentMetadata.set(doc.id, doc),
                this.loadAndCache(
                  `/api/documents/${doc.id}/thumbnail`,
                  docStrategies.thumbnails.set.bind(null, doc.id)
                )
              ])
            })
          )
        }
      },

      // Warm Sofia personality data
      warmSofiaData: async (userId: string) => {
        const sofiaStrategies = this.getSofiaCacheStrategies()

        await this.loadAndCache(
          `/api/sofia/personality/${userId}`,
          sofiaStrategies.personalityProfile.set.bind(null, userId)
        )
      }
    }
  }

  // Memory cache operations
  private getFromMemory<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)
    if (!entry) return null

    // Check expiration
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key)
      return null
    }

    // Update access time
    entry.lastAccessed = Date.now()
    return entry.value as T
  }

  private setInMemory<T>(key: string, value: T, ttl: number, tags?: string[]): void {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= 1000) { // Max 1000 entries
      this.evictLRU()
    }

    const entry: CacheEntry = {
      value,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: Date.now() + ttl,
      size: this.estimateSize(value),
      tags
    }

    this.memoryCache.set(key, entry)
  }

  // Persistent cache operations
  private async getFromPersistent<T>(key: string): Promise<T | null> {
    if (!this.persistentCache) return null

    try {
      const response = await this.persistentCache.match(key)
      if (!response) return null

      const data = await response.json()

      // Check expiration
      if (data.expiresAt && Date.now() > data.expiresAt) {
        await this.persistentCache.delete(key)
        return null
      }

      return data.value as T
    } catch (error) {
      console.warn('Persistent cache read error:', error)
      return null
    }
  }

  private async setInPersistent<T>(key: string, value: T, ttl: number): Promise<void> {
    if (!this.persistentCache) return

    try {
      const data = {
        value,
        createdAt: Date.now(),
        expiresAt: Date.now() + ttl
      }

      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${Math.floor(ttl / 1000)}`
        }
      })

      await this.persistentCache.put(key, response)
    } catch (error) {
      console.warn('Persistent cache write error:', error)
    }
  }

  // Network operations
  private async getFromNetwork<T>(key: string): Promise<T | null> {
    try {
      // Extract URL from cache key (implementation specific)
      const url = this.extractUrlFromKey(key)
      const response = await fetch(url)

      if (!response.ok) return null

      const data = await response.json()

      // Cache the network result
      await this.set(key, data, { level: 'both' })

      return data as T
    } catch (error) {
      console.warn('Network fallback error:', error)
      return null
    }
  }

  private async loadAndCache<T>(url: string, cacheSetterFn: (value: T) => Promise<void>): Promise<void> {
    try {
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        await cacheSetterFn(data)
      }
    } catch (error) {
      console.warn('Cache warming error:', error)
    }
  }

  private async loadFromNetwork(url: string): Promise<any> {
    try {
      const response = await fetch(url)
      return response.ok ? await response.json() : null
    } catch (error) {
      console.warn('Network load error:', error)
      return null
    }
  }

  // Utility methods
  private async invalidateByPatterns(patterns: string[]): Promise<void> {
    // Memory cache
    patterns.forEach(pattern => {
      for (const key of this.memoryCache.keys()) {
        if (key.includes(pattern)) {
          this.memoryCache.delete(key)
        }
      }
    })

    // Persistent cache
    if (this.persistentCache) {
      const keys = await this.persistentCache.keys()
      const keysToDelete = keys.filter(request =>
        patterns.some(pattern => request.url.includes(pattern))
      )

      await Promise.all(keysToDelete.map(key => this.persistentCache!.delete(key)))
    }
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey)
    }
  }

  private estimateSize(value: any): number {
    return JSON.stringify(value).length * 2 // Rough estimate
  }

  private extractUrlFromKey(key: string): string {
    // Implementation would map cache keys to URLs
    return `/api/${key.replace(/_/g, '/')}`
  }

  // Public utility methods
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key)
    if (this.persistentCache) {
      await this.persistentCache.delete(key)
    }
  }

  async clear(): Promise<void> {
    this.memoryCache.clear()
    if (this.persistentCache) {
      await this.persistentCache.delete(this.cacheName)
      this.persistentCache = await caches.open(this.cacheName)
    }
  }

  getCacheStats() {
    return {
      memorySize: this.memoryCache.size,
      memoryUsage: Array.from(this.memoryCache.values())
        .reduce((total, entry) => total + entry.size, 0),
      hitRate: this.calculateHitRate()
    }
  }

  private calculateHitRate(): number {
    // Implementation would track hits/misses
    return 0.75 // Placeholder
  }
}

// Types
interface CacheEntry {
  value: any
  createdAt: number
  lastAccessed: number
  expiresAt?: number
  size: number
  tags?: string[]
}

interface CacheGetOptions {
  level?: 'memory' | 'persistent' | 'both'
  fallbackToNetwork?: boolean
}

interface CacheSetOptions {
  level?: 'memory' | 'persistent' | 'both'
  ttl?: number
  persist?: boolean
  tags?: string[]
}