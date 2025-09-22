export class AnimationOptimizer {
  private rafId: number | null = null
  private animationQueue: Array<() => void> = []
  private isReducedMotion: boolean = false

  constructor() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.setupAnimationLoop()
  }

  // Optimized requestAnimationFrame loop
  private setupAnimationLoop() {
    const loop = () => {
      if (this.animationQueue.length > 0) {
        const animations = this.animationQueue.splice(0, this.animationQueue.length)
        animations.forEach(animation => {
          try {
            animation()
          } catch (error) {
            console.warn('Animation error:', error)
          }
        })
      }
      this.rafId = requestAnimationFrame(loop)
    }

    this.rafId = requestAnimationFrame(loop)
  }

  // Queue animation for optimal performance
  queueAnimation(animation: () => void) {
    if (this.isReducedMotion) {
      // Skip animations for users who prefer reduced motion
      return
    }

    this.animationQueue.push(animation)
  }

  // Sofia firefly animation optimization
  optimizeSofiaAnimations() {
    return {
      // Reduced animation set for performance
      lightweightAnimations: {
        float: {
          y: [0, -10, 0],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }
        },
        glow: {
          opacity: [0.7, 1, 0.7],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }
        }
      },

      // Full animation set for high-performance devices
      fullAnimations: {
        complexFlight: {
          x: [0, 50, -20, 0],
          y: [0, -30, 20, 0],
          rotate: [0, 15, -10, 0],
          transition: {
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut'
          }
        },
        particleEffect: {
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            staggerChildren: 0.1
          }
        }
      }
    }
  }

  // 3D animation optimization
  optimize3DAnimations() {
    const supportsWebGL = this.checkWebGLSupport()
    const devicePerformance = this.getDevicePerformance()

    return {
      trustBox: {
        // Low performance settings
        low: {
          segments: 8,
          wireframe: true,
          shadows: false,
          antialiasing: false,
          pixelRatio: 1
        },
        // Medium performance settings
        medium: {
          segments: 16,
          wireframe: false,
          shadows: true,
          antialiasing: false,
          pixelRatio: Math.min(window.devicePixelRatio, 2)
        },
        // High performance settings
        high: {
          segments: 32,
          wireframe: false,
          shadows: true,
          antialiasing: true,
          pixelRatio: window.devicePixelRatio
        }
      },

      selectedConfig: devicePerformance === 'high' && supportsWebGL ? 'high' :
                     devicePerformance === 'medium' && supportsWebGL ? 'medium' : 'low'
    }
  }

  // Framer Motion optimization
  getFramerMotionConfig() {
    const devicePerformance = this.getDevicePerformance()

    if (this.isReducedMotion) {
      return {
        initial: false,
        animate: false,
        transition: { duration: 0 }
      }
    }

    const configs = {
      low: {
        transition: {
          type: 'tween',
          duration: 0.3,
          ease: 'easeOut'
        }
      },
      medium: {
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: 0.5
        }
      },
      high: {
        transition: {
          type: 'spring',
          stiffness: 400,
          damping: 25,
          mass: 0.5
        }
      }
    }

    return configs[devicePerformance as keyof typeof configs] || configs.medium
  }

  // CSS animation optimization
  optimizeCSSAnimations() {
    return {
      // Use transform and opacity for better performance
      preferredProperties: ['transform', 'opacity'],

      // Avoid these properties for animations
      avoidedProperties: ['width', 'height', 'top', 'left', 'padding', 'margin'],

      // Will-change optimization
      willChangeOptimization: (element: HTMLElement, properties: string[]) => {
        element.style.willChange = properties.join(', ')

        // Clean up after animation
        setTimeout(() => {
          element.style.willChange = 'auto'
        }, 1000)
      },

      // Hardware acceleration
      enableHardwareAcceleration: (element: HTMLElement) => {
        element.style.transform = element.style.transform || 'translateZ(0)'
      }
    }
  }

  // Performance-based animation selection
  getOptimalAnimations(context: 'onboarding' | 'dashboard' | 'documents' | 'celebration') {
    const devicePerformance = this.getDevicePerformance()
    const batteryLevel = this.getBatteryLevel()

    const animationSets = {
      onboarding: {
        minimal: {
          fadeIn: { opacity: [0, 1], duration: 0.3 },
          slideUp: { y: [20, 0], opacity: [0, 1], duration: 0.4 }
        },
        standard: {
          fadeIn: { opacity: [0, 1], duration: 0.5 },
          slideUp: { y: [30, 0], opacity: [0, 1], duration: 0.6 },
          scale: { scale: [0.9, 1], duration: 0.5 }
        },
        enhanced: {
          fadeIn: { opacity: [0, 1], duration: 0.7 },
          slideUp: { y: [50, 0], opacity: [0, 1], duration: 0.8 },
          scale: { scale: [0.8, 1], duration: 0.7 },
          bounce: { y: [0, -10, 0], duration: 1.2, repeat: 2 }
        }
      },

      dashboard: {
        minimal: {
          cardHover: { scale: 1.02, duration: 0.2 }
        },
        standard: {
          cardHover: { scale: 1.05, y: -5, duration: 0.3 },
          progressAnimation: { width: ['0%', '100%'], duration: 1 }
        },
        enhanced: {
          cardHover: { scale: 1.05, y: -8, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', duration: 0.3 },
          progressAnimation: { width: ['0%', '100%'], duration: 1.5 },
          mosaicGrowth: { scale: [0, 1], rotate: [0, 360], duration: 0.8 }
        }
      },

      documents: {
        minimal: {
          uploadProgress: { width: ['0%', '100%'], duration: 0.5 }
        },
        standard: {
          uploadProgress: { width: ['0%', '100%'], duration: 1 },
          documentAppear: { opacity: [0, 1], y: [20, 0], duration: 0.4 }
        },
        enhanced: {
          uploadProgress: { width: ['0%', '100%'], duration: 1.5 },
          documentAppear: { opacity: [0, 1], y: [30, 0], scale: [0.9, 1], duration: 0.6 },
          categoryCompletion: { scale: [1, 1.2, 1], duration: 0.5 }
        }
      },

      celebration: {
        minimal: {
          success: { scale: [1, 1.1, 1], duration: 0.3 }
        },
        standard: {
          success: { scale: [1, 1.2, 1], duration: 0.5 },
          confetti: { y: [-100, 100], opacity: [1, 0], duration: 2 }
        },
        enhanced: {
          success: { scale: [1, 1.3, 1], rotate: [0, 10, 0], duration: 0.7 },
          confetti: { y: [-100, 100], x: [-50, 50], opacity: [1, 0], duration: 3 },
          fireworks: { scale: [0, 2], opacity: [1, 0], duration: 1.5 }
        }
      }
    }

    // Select animation level based on performance and battery
    let animationLevel: 'minimal' | 'standard' | 'enhanced' = 'standard'

    if (devicePerformance === 'low' || batteryLevel < 0.2 || this.isReducedMotion) {
      animationLevel = 'minimal'
    } else if (devicePerformance === 'high' && batteryLevel > 0.5) {
      animationLevel = 'enhanced'
    }

    return animationSets[context][animationLevel]
  }

  // Device performance detection
  private getDevicePerformance(): 'low' | 'medium' | 'high' {
    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 4

    // Check memory (if available)
    const memory = (navigator as any).deviceMemory || 4

    // Check if running on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

    if (cores >= 8 && memory >= 8 && !isMobile) {
      return 'high'
    } else if (cores >= 4 && memory >= 4) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  // WebGL support detection
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch {
      return false
    }
  }

  // Battery level detection
  private getBatteryLevel(): number {
    if ('getBattery' in navigator) {
      return (navigator as any).getBattery().then((battery: any) => battery.level)
    }
    return 1 // Assume full battery if not available
  }

  // Animation performance monitoring
  monitorAnimationPerformance() {
    let frameCount = 0
    let lastTime = performance.now()
    let fps = 60

    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        frameCount = 0
        lastTime = currentTime

        // Adjust animations based on FPS
        if (fps < 30) {
          this.degradeAnimations()
        } else if (fps > 55) {
          this.enhanceAnimations()
        }
      }

      requestAnimationFrame(measureFPS)
    }

    measureFPS()
    return { getCurrentFPS: () => fps }
  }

  // Degrade animations for better performance
  private degradeAnimations() {
    document.documentElement.style.setProperty('--animation-duration-multiplier', '0.5')
    document.documentElement.style.setProperty('--animation-complexity', 'low')
  }

  // Enhance animations for high-performance devices
  private enhanceAnimations() {
    document.documentElement.style.setProperty('--animation-duration-multiplier', '1')
    document.documentElement.style.setProperty('--animation-complexity', 'high')
  }

  // Intersection Observer for animation triggers
  createAnimationTrigger(
    elements: Element[],
    animationCallback: (element: Element) => void,
    options: IntersectionObserverInit = {}
  ) {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.queueAnimation(() => animationCallback(entry.target))
          observer.unobserve(entry.target)
        }
      })
    }, defaultOptions)

    elements.forEach(element => observer.observe(element))
    return observer
  }

  // Cleanup
  cleanup() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.animationQueue = []
  }
}