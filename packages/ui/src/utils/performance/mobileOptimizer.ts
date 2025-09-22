export class MobileOptimizer {
  private isMobile: boolean
  private isTablet: boolean
  private touchDevice: boolean
  private viewportWidth: number
  private viewportHeight: number

  constructor() {
    this.isMobile = this.detectMobile()
    this.isTablet = this.detectTablet()
    this.touchDevice = this.detectTouch()
    this.viewportWidth = window.innerWidth
    this.viewportHeight = window.innerHeight

    this.setupViewportListener()
    this.setupOrientationListener()
  }

  // Mobile device detection
  private detectMobile(): boolean {
    return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  private detectTablet(): boolean {
    return /iPad|Android(?=.*Tablet)|Android(?=.*(?:(?!Mobile).*))/.test(navigator.userAgent)
  }

  private detectTouch(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }

  // Viewport optimization
  private setupViewportListener() {
    window.addEventListener('resize', () => {
      this.viewportWidth = window.innerWidth
      this.viewportHeight = window.innerHeight
      this.optimizeForViewport()
    })
  }

  private setupOrientationListener() {
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.optimizeForOrientation()
      }, 100) // Delay to ensure accurate viewport dimensions
    })
  }

  // Touch optimization
  optimizeTouchInteractions() {
    return {
      // Minimum touch target size (44px recommended)
      minTouchTarget: 44,

      // Touch delay elimination
      eliminateTouchDelay: () => {
        document.addEventListener('touchstart', () => {}, { passive: true })
      },

      // Improved scrolling
      optimizeScrolling: () => {
        document.body.style.overscrollBehavior = 'none'
        document.body.style.touchAction = 'pan-x pan-y'
      },

      // Touch feedback
      addTouchFeedback: (element: HTMLElement) => {
        element.style.webkitTapHighlightColor = 'rgba(0,0,0,0.1)'
        element.style.userSelect = 'none'

        element.addEventListener('touchstart', () => {
          element.style.backgroundColor = 'rgba(0,0,0,0.05)'
        }, { passive: true })

        element.addEventListener('touchend', () => {
          setTimeout(() => {
            element.style.backgroundColor = ''
          }, 150)
        }, { passive: true })
      }
    }
  }

  // Performance optimizations for mobile
  getMobilePerformanceSettings() {
    const deviceRam = (navigator as any).deviceMemory || 4
    const connectionType = (navigator as any).connection?.effectiveType || '4g'

    return {
      // Image quality based on device and connection
      imageQuality: this.getOptimalImageQuality(deviceRam, connectionType),

      // Animation settings
      animations: this.getMobileAnimationSettings(),

      // Bundle optimization
      bundleSettings: this.getMobileBundleSettings(),

      // Memory management
      memorySettings: this.getMemorySettings(deviceRam)
    }
  }

  private getOptimalImageQuality(ram: number, connection: string) {
    if (ram <= 2 || connection === '2g' || connection === 'slow-2g') {
      return { quality: 60, maxWidth: 800 }
    } else if (ram <= 4 || connection === '3g') {
      return { quality: 75, maxWidth: 1200 }
    } else {
      return { quality: 85, maxWidth: 1920 }
    }
  }

  private getMobileAnimationSettings() {
    if (this.isMobile) {
      return {
        duration: 0.3, // Shorter animations
        easing: 'ease-out', // Simpler easing
        reduced: true,
        useTransform: true, // Hardware acceleration
        avoidLayoutAnimations: true
      }
    }

    return {
      duration: 0.5,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      reduced: false,
      useTransform: true,
      avoidLayoutAnimations: false
    }
  }

  private getMobileBundleSettings() {
    return {
      lazyLoadingThreshold: this.isMobile ? 100 : 200, // Smaller threshold for mobile
      preloadCount: this.isMobile ? 2 : 5,
      chunkSize: this.isMobile ? 'small' : 'medium',
      prioritizeCritical: this.isMobile
    }
  }

  private getMemorySettings(ram: number) {
    return {
      cacheSize: ram <= 2 ? 'small' : ram <= 4 ? 'medium' : 'large',
      imageCache: ram <= 2 ? 10 : ram <= 4 ? 25 : 50,
      componentCache: ram <= 2 ? 5 : ram <= 4 ? 15 : 30
    }
  }

  // Responsive design optimization
  getResponsiveSettings() {
    const breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    }

    const currentBreakpoint = this.viewportWidth <= breakpoints.mobile ? 'mobile' :
                             this.viewportWidth <= breakpoints.tablet ? 'tablet' : 'desktop'

    return {
      currentBreakpoint,

      // Layout settings per breakpoint
      layout: {
        mobile: {
          columns: 1,
          spacing: 16,
          fontSize: 'small',
          componentSize: 'compact'
        },
        tablet: {
          columns: 2,
          spacing: 24,
          fontSize: 'medium',
          componentSize: 'medium'
        },
        desktop: {
          columns: 3,
          spacing: 32,
          fontSize: 'large',
          componentSize: 'large'
        }
      }[currentBreakpoint],

      // Feature availability per breakpoint
      features: {
        mobile: {
          hover: false,
          multiSelect: false,
          dragDrop: false,
          contextMenu: false,
          tooltips: false
        },
        tablet: {
          hover: this.touchDevice ? false : true,
          multiSelect: true,
          dragDrop: true,
          contextMenu: true,
          tooltips: this.touchDevice ? false : true
        },
        desktop: {
          hover: true,
          multiSelect: true,
          dragDrop: true,
          contextMenu: true,
          tooltips: true
        }
      }[currentBreakpoint]
    }
  }

  // Viewport optimization
  private optimizeForViewport() {
    const settings = this.getResponsiveSettings()

    // Update CSS custom properties
    document.documentElement.style.setProperty('--columns', settings.layout.columns.toString())
    document.documentElement.style.setProperty('--spacing', `${settings.layout.spacing}px`)
    document.documentElement.style.setProperty('--font-size', settings.layout.fontSize)

    // Dispatch viewport change event
    window.dispatchEvent(new CustomEvent('viewportChange', {
      detail: { settings, width: this.viewportWidth, height: this.viewportHeight }
    }))
  }

  private optimizeForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight

    document.documentElement.classList.toggle('landscape', isLandscape)
    document.documentElement.classList.toggle('portrait', !isLandscape)

    // Adjust Sofia position for mobile landscape
    if (this.isMobile && isLandscape) {
      document.documentElement.style.setProperty('--sofia-position', 'top-right')
    } else {
      document.documentElement.style.setProperty('--sofia-position', 'bottom-right')
    }
  }

  // Sofia mobile optimization
  optimizeSofiaForMobile() {
    return {
      // Mobile-specific Sofia settings
      buttonSize: this.isMobile ? 48 : 56,
      chatWidth: this.isMobile ? '100%' : '400px',
      chatHeight: this.isMobile ? '70vh' : '600px',

      // Position optimization
      position: {
        mobile: {
          bottom: 16,
          right: 16,
          zIndex: 1000
        },
        tablet: {
          bottom: 24,
          right: 24,
          zIndex: 1000
        },
        desktop: {
          bottom: 32,
          right: 32,
          zIndex: 1000
        }
      }[this.getResponsiveSettings().currentBreakpoint],

      // Interaction optimization
      interactions: {
        tapToOpen: this.touchDevice,
        hoverPreview: !this.touchDevice,
        swipeGestures: this.touchDevice,
        voiceInput: this.isMobile
      }
    }
  }

  // Document management mobile optimization
  optimizeDocumentManagement() {
    return {
      // Upload optimization
      upload: {
        useCamera: this.isMobile,
        maxFiles: this.isMobile ? 1 : 5,
        dragDrop: !this.touchDevice,
        chunkSize: this.isMobile ? 512 * 1024 : 1024 * 1024 // 512KB vs 1MB
      },

      // Viewer optimization
      viewer: {
        thumbnailSize: this.isMobile ? 'small' : 'medium',
        previewQuality: this.getMobilePerformanceSettings().imageQuality,
        paginationSize: this.isMobile ? 10 : 20,
        virtualScrolling: this.isMobile
      },

      // Search optimization
      search: {
        instantSearch: !this.isMobile, // Debounced on mobile
        debounceDelay: this.isMobile ? 500 : 200,
        maxResults: this.isMobile ? 10 : 25
      }
    }
  }

  // Network-aware optimization
  getNetworkOptimizations() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const { effectiveType, downlink, rtt } = connection

      return {
        preloadStrategy: effectiveType === '4g' ? 'aggressive' :
                        effectiveType === '3g' ? 'moderate' : 'conservative',

        imageFormat: effectiveType === '4g' ? 'webp' :
                    effectiveType === '3g' ? 'webp' : 'jpeg',

        compressionLevel: effectiveType === '4g' ? 'medium' :
                         effectiveType === '3g' ? 'high' : 'maximum',

        adaptiveQuality: {
          video: effectiveType === '4g' ? 'high' : 'medium',
          images: effectiveType === '4g' ? 85 : 70,
          animations: effectiveType === '4g' ? 'full' : 'reduced'
        }
      }
    }

    return {
      preloadStrategy: 'moderate',
      imageFormat: 'webp',
      compressionLevel: 'medium',
      adaptiveQuality: {
        video: 'medium',
        images: 75,
        animations: 'reduced'
      }
    }
  }

  // PWA optimization for mobile
  optimizeForPWA() {
    return {
      // Service worker optimization
      serviceWorker: {
        cacheStrategy: this.isMobile ? 'cache-first' : 'network-first',
        cacheSize: this.getMobilePerformanceSettings().memorySettings.cacheSize,
        offlinePages: ['/', '/dashboard', '/documents']
      },

      // App shell optimization
      appShell: {
        criticalCSS: this.isMobile,
        inlineStyles: this.isMobile,
        deferNonCritical: this.isMobile
      },

      // Manifest optimization
      manifest: {
        startUrl: this.isMobile ? '/?utm_source=pwa' : '/',
        display: this.isMobile ? 'standalone' : 'browser',
        orientation: this.isMobile ? 'portrait' : 'any'
      }
    }
  }

  // Battery optimization
  optimizeForBattery() {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const batteryLevel = battery.level
        const isCharging = battery.charging

        if (batteryLevel < 0.2 && !isCharging) {
          // Enable battery saver mode
          this.enableBatterySaver()
        } else if (batteryLevel > 0.5 || isCharging) {
          // Enable full features
          this.enableFullFeatures()
        }
      })
    }
  }

  private enableBatterySaver() {
    document.documentElement.classList.add('battery-saver')

    // Reduce animations
    document.documentElement.style.setProperty('--animation-duration-multiplier', '0.5')

    // Reduce background sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({ type: 'BATTERY_SAVER', enabled: true })
      })
    }
  }

  private enableFullFeatures() {
    document.documentElement.classList.remove('battery-saver')
    document.documentElement.style.setProperty('--animation-duration-multiplier', '1')

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({ type: 'BATTERY_SAVER', enabled: false })
      })
    }
  }

  // Accessibility optimization for mobile
  optimizeMobileAccessibility() {
    return {
      // Touch targets
      minTouchSize: 44,
      touchSpacing: 8,

      // Focus management
      focusRing: this.touchDevice ? 'minimal' : 'standard',
      focusTrapping: true,

      // Screen reader optimization
      announcements: this.isMobile ? 'minimal' : 'detailed',

      // Gesture support
      swipeGestures: this.touchDevice,
      pinchZoom: this.touchDevice && !this.isTablet
    }
  }

  // Performance monitoring for mobile
  monitorMobilePerformance() {
    const metrics = {
      frameRate: 0,
      memoryUsage: 0,
      networkSpeed: 0,
      batteryLevel: 1,
      thermalState: 'normal'
    }

    // Monitor frame rate
    let frames = 0
    let lastTime = Date.now()

    const countFrames = () => {
      frames++
      const now = Date.now()

      if (now - lastTime >= 1000) {
        metrics.frameRate = Math.round((frames * 1000) / (now - lastTime))
        frames = 0
        lastTime = now

        // Adjust performance based on frame rate
        if (metrics.frameRate < 30) {
          this.reducePerformance()
        }
      }

      requestAnimationFrame(countFrames)
    }

    countFrames()

    // Monitor memory (if available)
    if ('memory' in performance) {
      setInterval(() => {
        metrics.memoryUsage = (performance as any).memory.usedJSHeapSize
      }, 5000)
    }

    return metrics
  }

  private reducePerformance() {
    // Reduce animation complexity
    document.documentElement.classList.add('reduced-performance')

    // Dispatch performance warning
    window.dispatchEvent(new CustomEvent('performanceWarning', {
      detail: { recommendation: 'reduce_animations' }
    }))
  }

  // Cleanup
  cleanup() {
    window.removeEventListener('resize', this.optimizeForViewport)
    window.removeEventListener('orientationchange', this.optimizeForOrientation)
  }
}