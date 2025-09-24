import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    commonjs()
  ],

  // Build configuration
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
        format: 'es',
        manualChunks: {
          // Vendor chunk for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI components chunk
          ui: ['framer-motion', 'lucide-react'],
          // Third party services
          services: ['@supabase/supabase-js', '@sentry/react'],
        },
        // Use content-based hashing for better cache invalidation
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      external: (id) => {
        // Externalize CommonJS modules that might cause issues
        if (id.includes('react-ga4')) {
          return false; // Don't externalize, let rollup handle it
        }
        return false;
      }
    },
    // Increase chunk size warning limit for better performance
    chunkSizeWarningLimit: 1000,
    // Ensure CommonJS modules are properly handled
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs']
    }
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: false,
  },

  // Preview server configuration
  preview: {
    port: 3000,
    host: true,
  },

  // Path resolution
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@/components/ui', replacement: path.resolve(__dirname, './src/components/ui') },
    ]
  },

  // Environment variables
  define: {
    // Ensure NODE_ENV is available in the app
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    // Fix CommonJS compatibility issues
    'global': 'globalThis',
    // Fix React 18 compatibility for packages expecting default export
    'React.default': 'React',
    'React': 'React'
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react',
      '@supabase/supabase-js',
    ],
    // Ensure React is properly resolved
    exclude: ['react-helmet-async', 'react-router', 'react-router-dom']
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },
});