import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// Plugin to remap @schwalbe/ui imports to web stubs early
const uiStubPlugin = () => ({
    name: 'ui-stub',
    enforce: 'pre',
    resolveId(source) {
        if (source === '@schwalbe/ui') {
            return path.resolve(__dirname, './src/stubs/ui/index');
        }
        if (source.startsWith('@schwalbe/ui/')) {
            const rest = source.substring('@schwalbe/ui/'.length);
            return path.resolve(__dirname, './src/stubs/ui', rest);
        }
        return null;
    },
});
// Plugin to aggressively replace react-native with react-native-web
const rnStubPlugin = () => ({
    name: 'rn-web-replace',
    enforce: 'pre',
    resolveId(source, importer) {
        // Replace react-native with react-native-web
        if (source === 'react-native') {
            return 'react-native-web';
        }
        if (source.startsWith('react-native/')) {
            const subpath = source.substring('react-native/'.length);
            return `react-native-web/dist/${subpath}`;
        }
        return null;
    },
    load(id) {
        // Intercept any actual react-native files that slip through and return empty
        if (id.includes('/node_modules/react-native/') && !id.includes('/node_modules/react-native-web/')) {
            return 'export {}';
        }
        return null;
    },
});
export default defineConfig({
    // RN stub plugin runs first, then UI stub, then React
    plugins: [rnStubPlugin(), uiStubPlugin(), react()],
    resolve: {
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
        include: ['react-native-web'],
        exclude: ['react-native', '@tamagui/react-native-media-driver', '@tamagui/animations-react-native']
    },
    ssr: {
        noExternal: ['react-native', '@tamagui/react-native-media-driver', '@tamagui/animations-react-native']
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            external: (id) => id.includes('@tamagui/react-native-media-driver') || id.includes('@tamagui/animations-react-native'),
        },
        commonjsOptions: {
            include: [],
            exclude: [/node_modules\/react-native/],
            ignore: ['react-native', /^react-native\//, /\/node_modules\/react-native\//]
        }
    },
});
