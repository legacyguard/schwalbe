import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // Server Configuration
    server: {
      // Use IPv6 host to listen on all network interfaces
      host: '::',
      // Default port (will auto-increment if busy)
      port: 8080,
      // Automatically open browser on server start
      open: false,
      // Enable CORS for development
      cors: true,
      // Proxy configuration for API calls (if needed)
      // proxy: {
      //   '/api': {
      //     target: 'http://localhost:3000',
      //     changeOrigin: true,
      //   }
      // },
      // HMR (Hot Module Replacement) configuration
      hmr: {
        // Use WebSocket for HMR
        protocol: 'ws',
        // Don't specify port - let Vite use the same as server port
        // This prevents HMR connection issues when port changes
      },
      // Watch options for file changes
      watch: {
        // Ignore node_modules to improve performance
        ignored: ['**/node_modules/**', '**/dist/**'],
      },
    },

    // Build Configuration
    build: {
      // Output directory
      outDir: 'dist',
      // Assets directory (relative to outDir)
      assetsDir: 'assets',
      // Enable source maps for production debugging
      sourcemap: mode === 'development',
      // Enable CSS minification
      cssMinify: mode === 'production',
      // Report bundle size
      reportCompressedSize: true,
      // Minification options
      minify: mode === 'production' ? 'terser' : false,
      // Chunk size warning limit (in KB) - increased for large app
      chunkSizeWarningLimit: 1500,
      // Target browsers
      target: 'esnext',
      // CSS code splitting
      cssCodeSplit: true,
      // Assets inline limit (4kb)
      assetsInlineLimit: 4096,
      // Rollup options for advanced configuration
      rollupOptions: {
        output: {
          // Manual chunking for better caching and performance
          manualChunks: id => {
            // Core React libraries
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router')
            ) {
              return 'react-vendor';
            }

            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }

            // Authentication
            if (id.includes('@clerk')) {
              return 'auth-vendor';
            }

            // Supabase and database
            if (id.includes('@supabase') || id.includes('postgrest')) {
              return 'database-vendor';
            }

            // UI component libraries
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }

            // Charts and data visualization
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts-vendor';
            }

            // Tanstack libraries
            if (id.includes('@tanstack')) {
              return 'tanstack-vendor';
            }

            // Utility libraries
            if (
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('date-fns') ||
              id.includes('class-variance-authority') ||
              id.includes('lucide-react')
            ) {
              return 'utils-vendor';
            }

            // Sofia personality system
            if (
              id.includes('src/components/sofia') ||
              id.includes('src/lib/sofia') ||
              (id.includes('src/hooks/use') && id.includes('sofia'))
            ) {
              return 'sofia-system';
            }

            // Animation and micro-interaction system
            if (
              id.includes('src/components/animations') ||
              id.includes('src/lib/animation') ||
              id.includes('enhanced-button') ||
              id.includes('enhanced-card') ||
              id.includes('enhanced-input')
            ) {
              return 'animation-system';
            }

            // Emergency and family shield system
            if (
              id.includes('src/components/emergency') ||
              id.includes('FamilyProtection') ||
              id.includes('family-shield') ||
              id.includes('emergency-access')
            ) {
              return 'family-shield';
            }

            // Legacy garden system
            if (
              id.includes('src/components/garden') ||
              id.includes('Legacy') ||
              (id.includes('garden') && !id.includes('node_modules'))
            ) {
              return 'legacy-garden';
            }

            // Dashboard and layout components
            if (
              id.includes('DashboardLayout') ||
              id.includes('AppSidebar') ||
              id.includes('src/components/layout')
            ) {
              return 'dashboard-layout';
            }

            // Pages - split by feature
            if (id.includes('src/pages/vault') || id.includes('Vault')) {
              return 'vault-page';
            }
            if (id.includes('src/pages/settings') || id.includes('Settings')) {
              return 'settings-page';
            }
            if (
              id.includes('src/pages/onboarding') ||
              id.includes('Onboarding')
            ) {
              return 'onboarding-page';
            }

            // Legal pages
            if (
              id.includes('src/pages/legal') ||
              id.includes('TermsOfService') ||
              id.includes('PrivacyPolicy') ||
              id.includes('SecurityPolicy')
            ) {
              return 'legal-pages';
            }

            // Landing page and marketing
            if (
              id.includes('src/pages/LandingPage') ||
              id.includes('Blog') ||
              id.includes('ComponentShowcase')
            ) {
              return 'marketing-pages';
            }

            // All other node_modules as separate vendor chunks
            if (id.includes('node_modules')) {
              const chunks = id.split('node_modules/')[1];
              const packageName = chunks.split('/')[0];

              // Group small packages together
              const smallPackages = [
                'crypto-js',
                'tweetnacl',
                'buffer',
                'process',
              ];
              if (smallPackages.includes(packageName)) {
                return 'crypto-vendor';
              }

              return `vendor-${packageName.replace('@', '').replace('/', '-')}`;
            }
          },
          // Asset file naming
          assetFileNames: assetInfo => {
            const info = assetInfo.name?.split('.');
            const ext = info?.[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
              return `assets/images/[name]-[hash][extname]`;
            }
            if (/woff2?|ttf|otf|eot/i.test(ext || '')) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          // Chunk file naming
          chunkFileNames: 'assets/js/[name]-[hash].js',
          // Entry file naming
          entryFileNames: 'assets/js/[name]-[hash].js',
        },
        // Add bundle analyzer plugin in production
        ...(mode === 'production' && {
          plugins: [
            {
              name: 'bundle-analyzer',
              generateBundle(options, bundle) {
                // Log bundle sizes
                const sizes = Object.entries(bundle).map(([name, asset]) => ({
                  name,
                  size:
                    asset.type === 'chunk'
                      ? asset.code?.length || 0
                      : asset.source?.length || 0,
                }));
                // console.log('📦 Bundle Analysis:', sizes);
              },
            },
          ],
        }),
      },
    },

    // Plugin Configuration
    plugins: [
      // React plugin with SWC for fast compilation
      react(),
    ].filter(Boolean),

    // Module Resolution
    resolve: {
      // Aliases for cleaner imports
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
      },
      // Extensions to resolve
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },

    // CSS Configuration
    css: {
      // CSS modules configuration
      modules: {
        // Local scope by default for CSS modules
        localsConvention: 'camelCaseOnly',
        // Generate scoped class names
        generateScopedName:
          mode === 'production'
            ? '[hash:base64:8]'
            : '[name]__[local]__[hash:base64:5]',
      },
      // PostCSS is configured separately in postcss.config.js
      // Preprocessor options if using SCSS/Less/Stylus
      preprocessorOptions: {
        // scss: {
        //   additionalData: `@import "@/styles/variables.scss";`
        // }
      },
    },

    // Optimization Configuration
    optimizeDeps: {
      // Pre-bundle these dependencies for faster cold start
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@clerk/clerk-react',
        'framer-motion',
        '@supabase/supabase-js',
      ],
      // Force optimization of these dependencies
      force: true,
    },

    // Environment Variables
    define: {
      // Define global constants
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __DEV__: mode === 'development',
    },

    // Performance options
    esbuild: {
      // Drop console and debugger in production
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      // Legal comments in output
      legalComments: 'none',
      // Target for esbuild
      target: 'es2022',
      // Enable tree shaking
      treeShaking: true,
      // Minify identifiers
      minifyIdentifiers: mode === 'production',
      // Minify syntax
      minifySyntax: mode === 'production',
      // Minify whitespace
      minifyWhitespace: mode === 'production',
    },

    // Preview server configuration (for production preview)
    preview: {
      host: '::',
      port: 4173,
      strictPort: false,
    },

    // Worker configuration
    worker: {
      format: 'es',
      rollupOptions: {
        output: {
          entryFileNames: 'assets/worker/[name]-[hash].js',
        },
      },
    },
  };
});
