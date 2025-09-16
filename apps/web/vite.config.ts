import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Plugin to remap @schwalbe/ui imports to web stubs early
const uiStubPlugin = () => ({
  name: 'ui-stub',
  enforce: 'pre',
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

// Plugin to force-react-native to an empty module during build
const rnNullPlugin = () => ({
  name: 'rn-null',
  enforce: 'pre',
  resolveId(source: string) {
    if (source === 'react-native' || source.startsWith('react-native/')) {
      return '\0rn-empty'
    }
    return null
  },
  load(id: string) {
    if (id === '\0rn-empty') {
      return 'export {}'
    }
    // Also null-out any resolved absolute path to react-native files
    if (id.includes('/node_modules/react-native/')) {
      return 'export {}'
    }
    return null
  },
})

export default defineConfig({
  // Ensure RN null plugin runs first, then UI stub, then React
  plugins: [rnNullPlugin(), uiStubPlugin(), react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: /^@schwalbe\/shared\/config\//, replacement: path.resolve(__dirname, '../../packages/shared/src/config/') },
      { find: /^@schwalbe\/shared\/services\//, replacement: path.resolve(__dirname, '../../packages/shared/src/services/') },
      { find: '@schwalbe/logic', replacement: path.resolve(__dirname, '../../packages/logic/src') },
      { find: '@schwalbe/shared', replacement: path.resolve(__dirname, '../../packages/shared/src/index-minimal.ts') },
      // Map UI subpaths to web stubs for build compatibility
      { find: /^@schwalbe\/ui\//, replacement: path.resolve(__dirname, './src/stubs/ui/') + '/' },
      { find: '@schwalbe/ui', replacement: path.resolve(__dirname, './src/stubs/ui/index') },
      // Prevent RN packages from being parsed in web build
      { find: /^react-native(\/.*)?$/, replacement: path.resolve(__dirname, './src/stubs/empty.js') },
      { find: 'react-native', replacement: path.resolve(__dirname, './src/stubs/empty.js') },
      { find: /^@tamagui\/react-native-media-driver(\/.*)?$/, replacement: path.resolve(__dirname, './src/stubs/empty.js') },
      { find: '@tamagui/react-native-media-driver', replacement: path.resolve(__dirname, './src/stubs/empty.js') },
      { find: /^@tamagui\/animations-react-native(\/.*)?$/, replacement: path.resolve(__dirname, './src/stubs/empty.js') },
      { find: '@tamagui/animations-react-native', replacement: path.resolve(__dirname, './src/stubs/empty.js') },
    ],
  },
  server: {
    port: 3000,
    host: true,
  },
  optimizeDeps: {
    exclude: ['react-native','@tamagui/react-native-media-driver','@tamagui/animations-react-native']
  },
  ssr: {
    noExternal: ['react-native','@tamagui/react-native-media-driver','@tamagui/animations-react-native']
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: (id: string) => id.includes('react-native') || id.includes('@tamagui/react-native-media-driver') || id.includes('@tamagui/animations-react-native') || id.includes('/packages/ui/dist/') || id.includes('/packages/ui/src/'),
    },
    commonjsOptions: {
      exclude: [/node_modules\/react-native\//],
      ignore: ['react-native', /^react-native/]
    }
  },
});
