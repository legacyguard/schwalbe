import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin to remap @schwalbe/ui imports to web stubs early
const uiStubPlugin = () => ({
  name: 'ui-stub',
  enforce: 'pre' as const,
  resolveId(source: string) {
    if (source === '@schwalbe/ui') {
      return path.resolve(__dirname, './src/stubs/ui/index')
    }
    if (source.startsWith('@schwalbe/ui/')) {
      const rest = source.substring('@schwalbe/ui/'.length)
      return path.resolve(__dirname, './src/stubs/ui', rest)
    }
    return null
  },
})

// Plugin to aggressively replace react-native with react-native-web
const rnStubPlugin = () => ({
  name: 'rn-web-replace',
  enforce: 'pre' as const,
  resolveId(source: string, importer?: string) {
    // Replace react-native with react-native-web
    if (source === 'react-native') {
      return 'react-native-web'
    }
    if (source.startsWith('react-native/')) {
      const subpath = source.substring('react-native/'.length)
      return `react-native-web/dist/${subpath}`
    }
    return null
  },
  load(id: string) {
    // Intercept any actual react-native files that slip through and return empty
    if (id.includes('/node_modules/react-native/') && !id.includes('/node_modules/react-native-web/')) {
      return 'export {}'
    }
    return null
  },
})

// Plugin to stub Tamagui native-only modules to empty during web build
const tamaguiStubPlugin = () => ({
  name: 'tamagui-native-stub',
  enforce: 'pre' as const,
  resolveId(source: string) {
    if (
      source === '@tamagui/react-native-media-driver' ||
      source.startsWith('@tamagui/react-native-media-driver/') ||
      source === '@tamagui/animations-react-native' ||
      source.startsWith('@tamagui/animations-react-native/')
    ) {
      return path.resolve(__dirname, './src/stubs/empty.js')
    }
    return null
  },
})

// Ensure cookie dist ESM is redirected to CJS entry exporting parse/serialize
const cookieCjsPlugin = () => ({
  name: 'cookie-cjs-redirect',
  enforce: 'pre' as const,
  resolveId(source: string) {
    if (source.endsWith('/cookie/dist/index.js') || source === 'cookie/dist/index.js') {
      return path.resolve(__dirname, './src/shims/cookie.ts')
    }
    return null
  },
  load(id: string) {
    if (id.endsWith('/cookie/dist/index.js')) {
      return `export * from '${path.resolve(__dirname, './src/shims/cookie.ts').replace(/\\/g, '/')}'`
    }
    return null
  }
})

export default defineConfig({
  base: '/assets/',
  // RN stub plugin runs first, then UI stub, then React
  plugins: [rnStubPlugin(), tamaguiStubPlugin(), cookieCjsPlugin(), uiStubPlugin(), react()] as any,
  resolve: {
    conditions: ['browser', 'module', 'production'],
    mainFields: ['browser', 'main', 'module'],
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: /^@schwalbe\/shared\/config\//, replacement: path.resolve(__dirname, '../../packages/shared/src/config/') },
      { find: /^@schwalbe\/shared\/services\//, replacement: path.resolve(__dirname, '../../packages/shared/src/services/') },
      { find: '@schwalbe/logic', replacement: path.resolve(__dirname, '../../packages/logic/src') },
      { find: /^@schwalbe\/shared\/(.+)$/, replacement: path.resolve(__dirname, '../../packages/shared/src/$1') },
      { find: '@schwalbe/shared', replacement: path.resolve(__dirname, '../../packages/shared/src/index.ts') },
      // Map UI subpaths to web stubs for build compatibility
      { find: /^@schwalbe\/ui\/(.+)$/, replacement: path.resolve(__dirname, './src/stubs/ui/$1') },
      { find: '@schwalbe/ui', replacement: path.resolve(__dirname, './src/stubs/ui/index') },
      // Alias react-native to react-native-web
      { find: /^react-native$/, replacement: 'react-native-web' },
      { find: /^react-native\/(.*)$/, replacement: 'react-native-web/dist/$1' },
      // Ensure cookie exports provide parse/serialize
      { find: /^cookie$/, replacement: path.resolve(__dirname, './src/shims/cookie.ts') },
      { find: /cookie\/dist\/index\.js$/, replacement: path.resolve(__dirname, './src/shims/cookie.ts') },
      // Fix Supabase postgrest-js ESM/CJS issue
      { find: '@supabase/postgrest-js', replacement: path.resolve(__dirname, '../../node_modules/@supabase/postgrest-js/dist/cjs/index.js') },
      
    ],
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  server: {
    port: 3000,
    host: true,
  },
  optimizeDeps: {
    include: ['react-native-web', '@supabase/supabase-js'],
    exclude: ['react-native','@tamagui/react-native-media-driver','@tamagui/animations-react-native']
  },
  ssr: {
    noExternal: ['react-native','@tamagui/react-native-media-driver','@tamagui/animations-react-native']
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 300, // Warn for chunks larger than 300KB
    rollupOptions: {
      external: (id: string) => id.includes('@tamagui/react-native-media-driver') || id.includes('@tamagui/animations-react-native'),
      output: {
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name]-[hash][extname]';
          }
          return '[name]-[hash][extname]';
        },
        manualChunks: (id: string) => {
          // Vendor libraries
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Animation libraries
            if (id.includes('framer-motion') || id.includes('@react-spring') || id.includes('@react-three')) {
              return 'vendor-animation';
            }
            // UI libraries
            if (id.includes('lucide-react') || id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Date and utility libraries
            if (id.includes('date-fns') || id.includes('lodash') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'vendor-utils';
            }
            // i18n libraries
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            // Other vendor libraries
            return 'vendor-misc';
          }

          // Application code chunking
          // Sofia AI and personality system
          if (id.includes('/sofia-') || id.includes('/components/sofia-') || id.includes('personality')) {
            return 'app-sofia';
          }
          // Professional and legal features
          if (id.includes('/professional/') || id.includes('/legal/')) {
            return 'app-professional';
          }
          // Will wizard
          if (id.includes('/will/')) {
            return 'app-will';
          }
          // Video and family features
          if (id.includes('/video/') || id.includes('/family/') || id.includes('/emergency/')) {
            return 'app-family';
          }
          // Documents
          if (id.includes('/documents/')) {
            return 'app-documents';
          }
          // Analytics and motion components
          if (id.includes('/motion/') || id.includes('/animations/') || id.includes('Analytics')) {
            return 'app-motion';
          }
          // Shared utilities and hooks
          if (id.includes('/utils/') || id.includes('/hooks/') || id.includes('/lib/')) {
            return 'app-shared';
          }
          // Services
          if (id.includes('/services/')) {
            return 'app-services';
          }
        }
      }
    },
    commonjsOptions: {
      include: [/@supabase\/.*/, /node_modules/],
      exclude: [/node_modules\/react-native/]
    }
  },
});
