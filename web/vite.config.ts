
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
  loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({ jsxRuntime: 'automatic' }),
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
      },
      dedupe: ['react', 'react-dom'],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@clerk/clerk-react',
        'framer-motion',
        '@supabase/supabase-js',
      ],
      force: true,
    },

    server: {
      host: '::',
      port: 8080,
      open: false,
      cors: true,
      hmr: { protocol: 'ws' },
      watch: { ignored: ['**/node_modules/**', '**/dist/**'] },
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      cssMinify: mode === 'production',
      reportCompressedSize: true,
      minify: mode === 'production' ? 'terser' : false,
      chunkSizeWarningLimit: 1500,
      target: 'es2020',
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      modulePreload: { polyfill: true },
      rollupOptions: {
        output: {
          entryFileNames: 'assets/js/[name]-[hash].js',
          chunkFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'react-vendor';
              }
            }
          },
        },
      },
    },

    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: mode === 'production' ? '[hash:base64:8]' : '[name]__[local]__[hash:base64:5]',
      },
      preprocessorOptions: {},
    },

    preview: {
      host: '::',
      port: 4173,
      strictPort: false,
    },

    worker: {
      format: 'es',
      rollupOptions: {
        output: { entryFileNames: 'assets/worker/[name]-[hash].js' },
      },
    },
  };
});
