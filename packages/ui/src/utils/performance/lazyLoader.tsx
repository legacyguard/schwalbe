import React, { lazy, ComponentType, LazyExoticComponent } from 'react'
import { BundleOptimizer } from './bundleOptimizer'

export class LazyLoader {
  private bundleOptimizer: BundleOptimizer
  private loadedComponents = new Set<string>()
  private preloadedComponents = new Map<string, Promise<any>>()

  constructor() {
    this.bundleOptimizer = new BundleOptimizer()
  }

  // Component lazy loading with retry logic
  createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: {
      retries?: number
      fallback?: ComponentType
      preload?: boolean
      id?: string
    } = {}
  ): LazyExoticComponent<T> {
    const { retries = 3, id } = options

    const retryImport = async (attempt = 1): Promise<{ default: T }> => {
      try {
        const module = await importFn()
        if (id) {
          this.loadedComponents.add(id)
        }
        return module
      } catch (error) {
        if (attempt < retries) {
          console.warn(`Import failed, retrying (${attempt}/${retries})`, error)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          return retryImport(attempt + 1)
        }
        throw error
      }
    }

    return lazy(retryImport)
  }

  // Route-based lazy loading
  getLazyRoutes() {
    return {
      // Main application routes
      Home: this.createLazyComponent(
        () => import('../../pages/Home'),
        { id: 'home', preload: true }
      ),

      Dashboard: this.createLazyComponent(
        () => import('../../pages/Dashboard'),
        { id: 'dashboard', preload: true }
      ),

      Documents: this.createLazyComponent(
        () => import('../../pages/Documents'),
        { id: 'documents' }
      ),

      Settings: this.createLazyComponent(
        () => import('../../pages/Settings'),
        { id: 'settings' }
      ),

      // Authentication routes
      Login: this.createLazyComponent(
        () => import('../../pages/auth/Login'),
        { id: 'login' }
      ),

      Register: this.createLazyComponent(
        () => import('../../pages/auth/Register'),
        { id: 'register' }
      ),

      // Feature routes
      WillGenerator: this.createLazyComponent(
        () => import('../../pages/WillGenerator'),
        { id: 'will-generator' }
      ),

      TimeCapsule: this.createLazyComponent(
        () => import('../../pages/TimeCapsule'),
        { id: 'time-capsule' }
      ),

      Analytics: this.createLazyComponent(
        () => import('../../pages/Analytics'),
        { id: 'analytics' }
      )
    }
  }

  // Component-based lazy loading
  getLazyComponents() {
    return {
      // Heavy components
      SofiaChat: this.createLazyComponent(
        () => import('../../components/sofia/SofiaChat'),
        { id: 'sofia-chat' }
      ),

      DocumentViewer: this.createLazyComponent(
        () => import('../../components/documents/DocumentViewer'),
        { id: 'document-viewer' }
      ),

      OCRProcessor: this.createLazyComponent(
        () => import('../../components/documents/OCRProcessor'),
        { id: 'ocr-processor' }
      ),

      ChartDashboard: this.createLazyComponent(
        () => import('../../components/charts/ChartDashboard'),
        { id: 'chart-dashboard' }
      ),

      // Modal components
      DocumentUploadModal: this.createLazyComponent(
        () => import('../../components/modals/DocumentUploadModal'),
        { id: 'upload-modal' }
      ),

      SettingsModal: this.createLazyComponent(
        () => import('../../components/modals/SettingsModal'),
        { id: 'settings-modal' }
      ),

      // 3D components
      TrustBox3D: this.createLazyComponent(
        () => import('../../components/3d/TrustBox3D'),
        { id: 'trust-box-3d' }
      ),

      OnboardingAnimations: this.createLazyComponent(
        () => import('../../components/animations/OnboardingAnimations'),
        { id: 'onboarding-animations' }
      )
    }
  }

  // Library-based lazy loading
  getLazyLibraries() {
    return {
      // Heavy libraries
      ThreeJS: this.createLazyComponent(
        () => import('../../lib/threeJS'),
        { id: 'threejs' }
      ),

      PDFLib: this.createLazyComponent(
        () => import('../../lib/pdfLib'),
        { id: 'pdf-lib' }
      ),

      TesseractOCR: this.createLazyComponent(
        () => import('../../lib/tesseractOCR'),
        { id: 'tesseract-ocr' }
      ),

      ChartLibraries: this.createLazyComponent(
        () => import('../../lib/chartLibraries'),
        { id: 'chart-libraries' }
      )
    }
  }

  // Intersection Observer based lazy loading
  createIntersectionLazyLoader<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    options: IntersectionObserverInit = {}
  ) {
    let hasLoaded = false
    let component: LazyExoticComponent<T> | null = null

    const defaultOptions = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
      ...options
    }

    return (props: any) => {
      const [isVisible, setIsVisible] = React.useState(false)
      const ref = React.useRef<HTMLDivElement>(null)

      React.useEffect(() => {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting && !hasLoaded) {
              setIsVisible(true)
              hasLoaded = true
              component = lazy(importFn)
            }
          },
          defaultOptions
        )

        if (ref.current) {
          observer.observe(ref.current)
        }

        return () => observer.disconnect()
      }, [])

      if (!isVisible || !component) {
        return <div ref={ref} className="lazy-placeholder" />
      }

      const Component = component
      return <Component {...props} />
    }
  }

  // Preload components based on user behavior
  async preloadByUserBehavior(userActions: string[]) {
    const preloadRules = {
      'document_upload': ['OCRProcessor', 'DocumentViewer'],
      'dashboard_visit': ['ChartDashboard', 'SofiaChat'],
      'settings_hover': ['SettingsModal'],
      'will_generation_interest': ['WillGenerator'],
      'family_features': ['TimeCapsule']
    }

    const componentsToPreload = new Set<string>()

    userActions.forEach(action => {
      const components = preloadRules[action as keyof typeof preloadRules]
      if (components) {
        components.forEach(comp => componentsToPreload.add(comp))
      }
    })

    return this.preloadComponents(Array.from(componentsToPreload))
  }

  // Preload components
  async preloadComponents(componentIds: string[]) {
    const lazyComponents = {
      ...this.getLazyComponents(),
      ...this.getLazyRoutes(),
      ...this.getLazyLibraries()
    }

    const preloadPromises = componentIds.map(async (id) => {
      if (this.preloadedComponents.has(id)) {
        return this.preloadedComponents.get(id)
      }

      const component = lazyComponents[id as keyof typeof lazyComponents]
      if (component) {
        // @ts-ignore - Access internal preload method
        const preloadPromise = component._payload._result || component._init()
        this.preloadedComponents.set(id, preloadPromise)
        return preloadPromise
      }
    })

    try {
      await Promise.all(preloadPromises)
      console.log(`Preloaded components: ${componentIds.join(', ')}`)
    } catch (error) {
      console.warn('Some components failed to preload:', error)
    }
  }

  // Priority-based loading
  async loadByPriority() {
    const priorities = {
      critical: ['Home', 'Dashboard', 'sofia-chat'],
      high: ['Documents', 'document-viewer', 'upload-modal'],
      medium: ['Settings', 'Analytics', 'chart-dashboard'],
      low: ['WillGenerator', 'TimeCapsule', 'trust-box-3d']
    }

    // Load critical first
    await this.preloadComponents(priorities.critical)

    // Load high priority with slight delay
    setTimeout(() => {
      this.preloadComponents(priorities.high)
    }, 1000)

    // Load medium priority when idle
    requestIdleCallback(() => {
      this.preloadComponents(priorities.medium)
    })

    // Load low priority when really idle
    requestIdleCallback(() => {
      setTimeout(() => {
        this.preloadComponents(priorities.low)
      }, 5000)
    })
  }

  // Network-aware loading
  async loadByNetworkCondition() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      const { effectiveType, downlink } = connection

      if (effectiveType === '4g' && downlink > 2) {
        // Fast connection - load everything
        await this.loadByPriority()
      } else if (effectiveType === '3g' || downlink > 0.5) {
        // Medium connection - load critical only
        await this.preloadComponents(['Home', 'Dashboard'])
      } else {
        // Slow connection - minimal loading
        console.log('Slow connection detected - minimal loading')
      }
    } else {
      // Unknown connection - load conservatively
      await this.preloadComponents(['Home', 'Dashboard'])
    }
  }

  // User preference based loading
  setupUserPreferenceLoading() {
    const userPreferences = {
      reducedData: localStorage.getItem('reduce-data') === 'true',
      prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      batterySaver: localStorage.getItem('battery-saver') === 'true'
    }

    if (userPreferences.reducedData || userPreferences.batterySaver) {
      // Load only critical components
      return this.preloadComponents(['Home', 'Dashboard'])
    }

    if (userPreferences.prefersReducedMotion) {
      // Skip animation-heavy components
      const nonAnimatedComponents = ['Documents', 'Settings', 'Analytics']
      return this.preloadComponents(nonAnimatedComponents)
    }

    // Normal loading
    return this.loadByPriority()
  }

  // Performance monitoring
  trackLazyLoadingPerformance() {
    const performanceData = {
      componentsLoaded: Array.from(this.loadedComponents),
      preloadedComponents: Array.from(this.preloadedComponents.keys()),
      loadTimes: new Map<string, number>()
    }

    // Monitor component load times
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes('lazy-component')) {
          performanceData.loadTimes.set(entry.name, entry.duration)
        }
      }
    })

    observer.observe({ entryTypes: ['measure'] })

    return performanceData
  }

  // Cleanup
  cleanup() {
    this.loadedComponents.clear()
    this.preloadedComponents.clear()
  }
}

// React hooks for lazy loading
export const useLazyLoader = () => {
  const [lazyLoader] = React.useState(() => new LazyLoader())

  React.useEffect(() => {
    // Setup user preference based loading on mount
    lazyLoader.setupUserPreferenceLoading()

    return () => {
      lazyLoader.cleanup()
    }
  }, [lazyLoader])

  return lazyLoader
}

// HOC for lazy loading
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  options: { preload?: boolean; priority?: 'critical' | 'high' | 'medium' | 'low' } = {}
) => {
  return React.forwardRef<any, P>((props, ref) => {
    const [isLoaded, setIsLoaded] = React.useState(false)

    React.useEffect(() => {
      if (options.preload) {
        setIsLoaded(true)
      }
    }, [])

    if (!isLoaded) {
      return <div className="component-loading">Načítavam...</div>
    }

    return <Component ref={ref} {...props} />
  })
}
