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

// Simplified router resolution now that we pin react-router-dom to v6
const routerProdPlugin = () => ({
  name: 'react-router-prod-bundle',
  enforce: 'pre' as const,
  resolveId() { return null },
  load() { return null }
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
  // RN stub plugin runs first, then UI stub, then React
  plugins: [rnStubPlugin(), tamaguiStubPlugin(), routerProdPlugin(), cookieCjsPlugin(), uiStubPlugin(), react()],
  resolve: {
    conditions: ['browser', 'module', 'production'],
    mainFields: ['browser', 'main', 'module'],
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: /^@schwalbe\/shared\/config\//, replacement: path.resolve(__dirname, '../../packages/shared/src/config/') },
      { find: /^@schwalbe\/shared\/services\//, replacement: path.resolve(__dirname, '../../packages/shared/src/services/') },
      { find: '@schwalbe/logic', replacement: path.resolve(__dirname, '../../packages/logic/src') },
      { find: '@schwalbe/shared', replacement: path.resolve(__dirname, '../../packages/shared/src/index-minimal.ts') },
      // Map UI subpaths to web stubs for build compatibility
      { find: /^@schwalbe\/ui\/(.+)$/, replacement: path.resolve(__dirname, './src/stubs/ui/$1') },
      { find: '@schwalbe/ui', replacement: path.resolve(__dirname, './src/stubs/ui/index') },
      // Alias react-native to react-native-web
      { find: /^react-native$/, replacement: 'react-native-web' },
      { find: /^react-native\/(.*)$/, replacement: 'react-native-web/dist/$1' },
      // Force production entry points to avoid dev ESM warnings
      { find: /react-router\/dist\/development\/.+/, replacement: path.resolve(__dirname, '../../node_modules/react-router/dist/index.js') },
      { find: /react-router-dom\/dist\/development\/.+/, replacement: path.resolve(__dirname, '../../node_modules/react-router-dom/dist/index.js') },
      { find: 'react-router/dist/development', replacement: path.resolve(__dirname, '../../node_modules/react-router/dist/index.js') },
      { find: 'react-router-dom/dist/development', replacement: path.resolve(__dirname, '../../node_modules/react-router-dom/dist/index.js') },
      { find: 'react-router', replacement: path.resolve(__dirname, '../../node_modules/react-router/dist/index.js') },
      { find: 'react-router-dom', replacement: path.resolve(__dirname, '../../node_modules/react-router-dom/dist/index.js') },
      // Ensure cookie exports provide parse/serialize
      { find: /^cookie$/, replacement: path.resolve(__dirname, './src/shims/cookie.ts') },
      { find: /cookie\/dist\/index\.js$/, replacement: path.resolve(__dirname, './src/shims/cookie.ts') },
      
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
    include: ['react-native-web'],
    exclude: ['react-native','@tamagui/react-native-media-driver','@tamagui/animations-react-native']
  },
  ssr: {
    noExternal: ['react-native','@tamagui/react-native-media-driver','@tamagui/animations-react-native']
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: (id: string) => id.includes('@tamagui/react-native-media-driver') || id.includes('@tamagui/animations-react-native'),
    },
    commonjsOptions: {
      include: [],
      exclude: [/node_modules\/react-native/]
    }
  },
});
