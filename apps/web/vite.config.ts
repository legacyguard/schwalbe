import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react()
  ],

  // Build configuration
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: process.env.NODE_ENV !== 'production',
    rollupOptions: {
      output: {
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
    },
    // Increase chunk size warning limit for better performance
    chunkSizeWarningLimit: 1000,
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
      { find: '@/components/ui', replacement: path.resolve(__dirname, './src/components/ui/index') },
    ]
  },

  // Environment variables
  define: {
    // Ensure NODE_ENV is available in the app
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
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
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },
});