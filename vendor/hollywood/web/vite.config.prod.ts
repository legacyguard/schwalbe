/**
 * Production-specific Vite configuration
 * Addresses React 19 compatibility and deployment issues
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          '@babel/plugin-transform-react-jsx',
          ['@babel/plugin-proposal-decorators', { legacy: true }],
        ],
      },
      jsxRuntime: 'automatic',
    }),
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@features': path.resolve(__dirname, './src/features'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/lib/utils'),
      '@config': path.resolve(__dirname, './src/config'),
      '@integrations': path.resolve(__dirname, './src/integrations'),
      // CRITICAL: Ensure single React instance in production
      'react': path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, '../../node_modules/react/jsx-dev-runtime'),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    mainFields: ['module', 'jsnext:main', 'jsnext', 'main'],
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@clerk/clerk-react',
      'framer-motion',
      '@supabase/supabase-js',
      'use-sync-external-store',
      'react-is',
      'react-error-boundary',
    ],
    exclude: [],
    esbuildOptions: {
      target: 'es2020',
      define: {
        global: 'globalThis',
      },
      splitting: true,
      format: 'esm',
    },
    force: true,
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps in production for performance
    cssCodeSplit: true,
    cssMinify: true,
    reportCompressedSize: true,
    minify: 'terser',
    chunkSizeWarningLimit: 1500,
    target: 'es2020',
    assetsInlineLimit: 4096,
    modulePreload: {
      polyfill: true,
    },
    manifest: true,
    
    rollupOptions: {
      maxParallelFileOps: 2,
      experimentalCacheExpiry: 10,
      external: [],
      output: {
        // CRITICAL: Fix MIME type issues and React 19 compatibility
        format: 'es',
        generatedCode: {
          preset: 'es2015',
          arrowFunctions: true,
          constBindings: true,
        },
        entryFileNames: 'assets/js/[name]-[hash].js',
        chunkFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        sourcemapExcludeSources: false,
        sourcemapPathTransform: (relativeSourcePath, sourcemapPath) => {
          return relativeSourcePath.replace(/^..\//, './');
        },
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        
        // CRITICAL: React 19 compatibility - keep problematic packages together
        manualChunks: (id: string) => {
          const problematicPackages = [
            'use-sync-external-store',
            'react-is',
            'react-redux',
            '@tanstack/react-query',
            'zustand',
            'jotai',
            'recoil',
          ];
          
          if (problematicPackages.some(pkg => id.includes(pkg))) {
            return undefined; // Keep in main bundle
          }
          
          // Core React libraries
          if (id.includes('react') && !problematicPackages.some(pkg => id.includes(pkg))) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'react-vendor';
            }
          }
          
          // React Router
          if (id.includes('react-router') && !id.includes('use-sync-external-store')) {
            return 'router-vendor';
          }
          
          // Other vendor chunks
          if (id.includes('framer-motion')) return 'animation-vendor';
          if (id.includes('@clerk')) return 'auth-vendor';
          if (id.includes('@supabase')) return 'database-vendor';
          if (id.includes('@radix-ui')) return 'ui-vendor';
          if (id.includes('recharts')) return 'charts-vendor';
          if (id.includes('@tanstack')) return 'tanstack-vendor';
          
          // Application code
          if (id.includes('src/components/sofia')) return 'sofia-system';
          if (id.includes('src/components/emergency')) return 'family-shield';
          if (id.includes('src/components/garden')) return 'legacy-garden';
          if (id.includes('src/pages/vault')) return 'vault-page';
          if (id.includes('src/pages/settings')) return 'settings-page';
          
          // Node modules
          if (id.includes('node_modules')) {
            const packageName = id.split('node_modules/')[1]?.split('/')[0];
            if (packageName) {
              return `vendor-${packageName.replace('@', '').replace('/', '-')}`;
            }
          }
        },
      },
    },
  },
});