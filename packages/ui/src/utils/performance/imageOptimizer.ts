export class ImageOptimizer {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')
    }
  }

  // WebP support detection
  supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  }

  // AVIF support detection
  supportsAVIF(): Promise<boolean> {
    return new Promise((resolve) => {
      const avif = new Image()
      avif.onload = avif.onerror = () => {
        resolve(avif.height === 2)
      }
      avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A='
    })
  }

  // Get optimal image format based on browser support
  async getOptimalFormat(): Promise<'avif' | 'webp' | 'jpg'> {
    if (await this.supportsAVIF()) return 'avif'
    if (await this.supportsWebP()) return 'webp'
    return 'jpg'
  }

  // Responsive image URLs generation
  generateResponsiveUrls(baseUrl: string, sizes: number[] = [320, 640, 960, 1280, 1920]) {
    const format = this.getOptimalFormat()

    return sizes.map(size => ({
      url: `${baseUrl}?w=${size}&f=${format}&q=80`,
      width: size,
      descriptor: `${size}w`
    }))
  }

  // Generate srcSet string
  generateSrcSet(baseUrl: string, sizes?: number[]): string {
    const urls = this.generateResponsiveUrls(baseUrl, sizes)
    return urls.map(url => `${url.url} ${url.descriptor}`).join(', ')
  }

  // Image compression
  async compressImage(
    file: File,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: 'webp' | 'jpeg' | 'png'
    } = {}
  ): Promise<Blob> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp'
    } = options

    return new Promise((resolve, reject) => {
      if (!this.canvas || !this.ctx) {
        reject(new Error('Canvas not supported'))
        return
      }

      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        )

        // Set canvas size
        this.canvas!.width = width
        this.canvas!.height = height

        // Draw and compress
        this.ctx!.drawImage(img, 0, 0, width, height)

        this.canvas!.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Compression failed'))
            }
          },
          `image/${format}`,
          quality
        )
      }

      img.onerror = () => reject(new Error('Image load failed'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Calculate optimal dimensions
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    // Scale down if needed
    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    return { width: Math.floor(width), height: Math.floor(height) }
  }

  // Progressive image loading
  createProgressiveImage(src: string, placeholder?: string): HTMLImageElement {
    const img = new Image()

    if (placeholder) {
      img.src = placeholder // Low quality placeholder
      img.style.filter = 'blur(5px)'
    }

    // Load high quality version
    const highQualityImg = new Image()
    highQualityImg.onload = () => {
      img.src = highQualityImg.src
      img.style.filter = 'none'
      img.style.transition = 'filter 0.3s ease'
    }
    highQualityImg.src = src

    return img
  }

  // Lazy loading with Intersection Observer
  setupLazyLoading(
    images: NodeListOf<HTMLImageElement> | HTMLImageElement[],
    options: IntersectionObserverInit = {}
  ) {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src

          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            observer.unobserve(img)
          }
        }
      })
    }, defaultOptions)

    images.forEach(img => {
      imageObserver.observe(img)
    })

    return imageObserver
  }

  // Image placeholder generation
  generatePlaceholder(width: number, height: number, color: string = '#f0f0f0'): string {
    if (!this.canvas || !this.ctx) {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="${color}"/>
        </svg>
      `)}`
    }

    this.canvas.width = width
    this.canvas.height = height
    this.ctx.fillStyle = color
    this.ctx.fillRect(0, 0, width, height)

    return this.canvas.toDataURL('image/png')
  }

  // BlurHash placeholder generation
  generateBlurHashPlaceholder(hash: string, width: number, height: number): string {
    // This would integrate with blurhash library
    // For now, return a simple gradient placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e0e0e0;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)"/>
      </svg>
    `)}`
  }

  // Optimize images for different contexts
  getOptimizedImageUrl(
    baseUrl: string,
    context: 'thumbnail' | 'card' | 'hero' | 'gallery' | 'avatar'
  ): string {
    const optimizations = {
      thumbnail: { w: 150, h: 150, q: 70, f: 'webp' },
      card: { w: 400, h: 300, q: 80, f: 'webp' },
      hero: { w: 1920, h: 1080, q: 85, f: 'webp' },
      gallery: { w: 800, h: 600, q: 85, f: 'webp' },
      avatar: { w: 100, h: 100, q: 75, f: 'webp' }
    }

    const params = optimizations[context]
    const queryParams = new URLSearchParams(params as any).toString()

    return `${baseUrl}?${queryParams}`
  }

  // Document image optimization for OCR
  async optimizeForOCR(file: File): Promise<Blob> {
    return this.compressImage(file, {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.95,
      format: 'jpeg'
    })
  }

  // Performance monitoring
  measureImageLoadTime(img: HTMLImageElement): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now()

      img.onload = () => {
        const loadTime = performance.now() - startTime
        resolve(loadTime)
      }
    })
  }

  // Image cache management
  private imageCache = new Map<string, string>()

  getCachedImage(url: string): string | null {
    return this.imageCache.get(url) || null
  }

  setCachedImage(url: string, dataUrl: string): void {
    // Limit cache size
    if (this.imageCache.size > 50) {
      const firstKey = this.imageCache.keys().next().value
      this.imageCache.delete(firstKey)
    }

    this.imageCache.set(url, dataUrl)
  }

  // Image preloading
  preloadImages(urls: string[]): Promise<void[]> {
    return Promise.all(
      urls.map(url =>
        new Promise<void>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => reject(new Error(`Failed to load ${url}`))
          img.src = url
        })
      )
    )
  }

  // Critical image preloading
  preloadCriticalImages(): Promise<void[]> {
    const criticalImages = [
      '/images/sofia-avatar.webp',
      '/images/logo.webp',
      '/images/onboarding-bg.webp'
    ]

    return this.preloadImages(criticalImages)
  }
}