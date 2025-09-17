/** @type {import('next').NextConfig} */

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {
  typescript: {
    // Allow local dev to proceed, but CI will enforce type errors (see CI job)
    ignoreBuildErrors: process.env.CI ? false : true,
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  
  // React Native Web compatibility
  webpack: (config, { isServer }) => {
    // Alias react-native to react-native-web for web compatibility
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
      'react-native/': 'react-native-web/',
    };

    // Handle react-native modules that don't work on web
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      path: false,
      crypto: false,
    };

    // Exclude problematic react-native modules from bundling
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'react-native': 'react-native-web',
      });
    }

    return config;
  },

  // Transpile packages that need it
  transpilePackages: [
    '@schwalbe/shared',
    '@schwalbe/logic', 
    'react-native-web',
  ],

  // Image optimization
  images: {
    domains: ['images.unsplash.com'],
  },

  // Environment variable configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

export default withNextIntl(nextConfig);