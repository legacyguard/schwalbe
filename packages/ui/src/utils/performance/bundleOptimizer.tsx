import React, { lazy } from 'react'
import { loadable } from '@loadable/component'
import type { ComponentType } from 'react'
import { BundleAnalyzer } from './bundleAnalyzer'

export class BundleOptimizer {
  private analyzer: BundleAnalyzer
  private chunkRegistry: Map<string, any> = new Map()

  constructor() {
    this.analyzer = new BundleAnalyzer()
  }

  // Dynamic imports for code splitting
  createLazyComponent(importFn: () => Promise<any>, fallback?: ComponentType) {
    return lazy(importFn)
  }

  // Loadable components for better loading states
  createLoadableComponent(importFn: () => Promise<any>, options?: any) {
    return loadable(importFn, {
      fallback: options?.fallback || this.createFallback('loading', 'Loading...'),
      ...options
    })
  }

  private createFallback(className: string, message: string) {
    return React.createElement('div', { className }, message)
  }

  // Route-based code splitting
  getRouteChunks() {
    return {
      // Authentication routes
      AuthRoutes: this.createLoadableComponent(
        () => import('../../components/auth/AuthRoutes'),
        { fallback: this.createFallback('auth-loading', 'Načítavam autentifikáciu...') }
      ),

      // Dashboard routes
      DashboardRoutes: this.createLoadableComponent(
        () => import('../../components/dashboard/DashboardRoutes'),
        { fallback: this.createFallback('dashboard-loading', 'Načítavam dashboard...') }
      ),

      // Document management routes
      DocumentRoutes: this.createLoadableComponent(
        () => import('../../components/documents/DocumentRoutes'),
        { fallback: this.createFallback('document-loading', 'Načítavam dokumenty...') }
      ),

      // Settings routes
      SettingsRoutes: this.createLoadableComponent(
        () => import('../../components/settings/SettingsRoutes'),
        { fallback: this.createFallback('settings-loading', 'Načítavam nastavenia...') }
      ),

      // Admin routes (only for admin users)
      AdminRoutes: this.createLoadableComponent(
        () => import('../../components/admin/AdminRoutes'),
        { fallback: this.createFallback('admin-loading', 'Načítavam admin panel...') }
      )
    }
  }

  // Feature-based code splitting
  getFeatureChunks() {
    return {
      // Sofia AI Assistant
      SofiaAssistant: this.createLoadableComponent(
        () => import('../../components/sofia/SofiaAssistant'),
        {
          fallback: this.createFallback('sofia-loading', 'Sofia sa pripravuje...'),
          ssr: false // Client-side only for AI features
        }
      ),

      // OCR Processing
      OCRProcessor: this.createLoadableComponent(
        () => import('../../components/documents/OCRProcessor'),
        { fallback: this.createFallback('ocr-loading', 'Pripravujem OCR...') }
      ),

      // Will Generator
      WillGenerator: this.createLoadableComponent(
        () => import('../../components/legal/WillGenerator'),
        { fallback: this.createFallback('will-loading', 'Načítavam generátor testamentu...') }
      ),

      // Time Capsule
      TimeCapsule: this.createLoadableComponent(
        () => import('../../components/timecapsule/TimeCapsule'),
        { fallback: this.createFallback('capsule-loading', 'Pripravujem časovú kapsulu...') }
      ),

      // Analytics Dashboard
      AnalyticsDashboard: this.createLoadableComponent(
        () => import('../../components/analytics/AnalyticsDashboard'),
        { fallback: this.createFallback('analytics-loading', 'Načítavam analytiku...') }
      ),

      // 3D Animations (heavy dependency)
      ThreeDAnimations: this.createLoadableComponent(
        () => import('../../components/animations/ThreeDAnimations'),
        {
          fallback: this.createFallback('3d-loading', 'Pripravujem 3D animácie...'),
          ssr: false
        }
      )
    }
  }

  // Library-based code splitting
  getLibraryChunks() {
    return {
      // Chart libraries (heavy)
      Charts: this.createLoadableComponent(
        () => import('../../components/charts/ChartComponents'),
        { fallback: this.createFallback('charts-loading', 'Načítavam grafy...') }
      ),

      // PDF processing
      PDFProcessor: this.createLoadableComponent(
        () => import('../../utils/pdfProcessor'),
        { fallback: this.createFallback('pdf-loading', 'Pripravujem PDF processor...') }
      ),

      // Image processing
      ImageProcessor: this.createLoadableComponent(
        () => import('../../utils/imageProcessor'),
        { fallback: this.createFallback('image-loading', 'Pripravujem image processor...') }
      ),

      // Rich text editor
      RichTextEditor: this.createLoadableComponent(
        () => import('../../components/editor/RichTextEditor'),
        { fallback: this.createFallback('editor-loading', 'Načítavam editor...') }
      )
    }
  }

  // Conditional loading based on user features
  getUserBasedChunks(userFeatures: string[]) {
    const chunks: any = {}

    if (userFeatures.includes('premium')) {
      chunks.PremiumFeatures = this.createLoadableComponent(
        () => import('../../components/premium/PremiumFeatures')
      )
    }

    if (userFeatures.includes('admin')) {
      chunks.AdminPanel = this.createLoadableComponent(
        () => import('../../components/admin/AdminPanel')
      )
    }

    if (userFeatures.includes('analytics')) {
      chunks.AdvancedAnalytics = this.createLoadableComponent(
        () => import('../../components/analytics/AdvancedAnalytics')
      )
    }

    return chunks
  }

  // Preload critical chunks
  async preloadCriticalChunks() {
    const criticalChunks = [
      () => import('../../components/dashboard/Dashboard'),
      () => import('../../components/sofia/SofiaButton'),
      () => import('../../components/auth/AuthState')
    ]

    return Promise.all(criticalChunks.map(chunk => chunk()))
  }

  // Bundle analysis and optimization
  async analyzeBundleSize() {
    return this.analyzer.analyze({
      entryPoints: ['src/main.tsx'],
      format: 'esm',
      bundle: true,
      splitting: true,
      metafile: true,
      target: ['es2020'],
      treeShaking: true
    })
  }

  // Tree shaking optimization
  getTreeShakingConfig() {
    return {
      // Mark side-effect free packages
      sideEffects: [
        '*.css',
        '*.scss',
        '*.sass',
        '*.less',
        './src/styles/**/*'
      ],

      // Optimize imports
      optimizeImports: {
        'lodash': 'lodash-es',
        'date-fns': 'date-fns/esm',
        'recharts': 'recharts/es6',
        '@mui/material': '@mui/material/esm',
        'framer-motion': 'framer-motion/dist/es'
      }
    }
  }

  // Dead code elimination
  eliminateDeadCode() {
    const unusedFeatures = this.analyzer.findUnusedFeatures()

    return {
      unusedComponents: unusedFeatures.components,
      unusedUtilities: unusedFeatures.utilities,
      unusedStyles: unusedFeatures.styles,
      recommendations: this.generateOptimizationRecommendations(unusedFeatures)
    }
  }

  private generateOptimizationRecommendations(unusedFeatures: any) {
    const recommendations = []

    if (unusedFeatures.components.length > 0) {
      recommendations.push({
        type: 'remove_unused_components',
        items: unusedFeatures.components,
        potentialSavings: `${unusedFeatures.components.length * 2}KB`
      })
    }

    if (unusedFeatures.utilities.length > 0) {
      recommendations.push({
        type: 'remove_unused_utilities',
        items: unusedFeatures.utilities,
        potentialSavings: `${unusedFeatures.utilities.length * 0.5}KB`
      })
    }

    return recommendations
  }

  // Performance monitoring
  monitorChunkLoadTimes() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes('chunk')) {
            console.log(`Chunk ${entry.name} loaded in ${entry.duration}ms`)

            // Send to analytics
            this.sendChunkMetrics({
              chunkName: entry.name,
              loadTime: entry.duration,
              size: entry.transferSize || 0
            })
          }
        }
      })

      observer.observe({ entryTypes: ['resource'] })
    }
  }

  private sendChunkMetrics(metrics: any) {
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'chunk_load', {
        chunk_name: metrics.chunkName,
        load_time: metrics.loadTime,
        chunk_size: metrics.size
      })
    }
  }

  // Webpack bundle analysis
  generateBundleReport() {
    return {
      totalSize: this.analyzer.getTotalBundleSize(),
      chunkSizes: this.analyzer.getChunkSizes(),
      duplicatedModules: this.analyzer.findDuplicatedModules(),
      largestModules: this.analyzer.getLargestModules(),
      treeshakingOpportunities: this.analyzer.getTreeshakingOpportunities()
    }
  }
}
