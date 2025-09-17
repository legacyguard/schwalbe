// PostCSS Configuration for Vite + Tailwind CSS
// Optimized configuration with performance improvements

export default {
  plugins: {
    // Tailwind CSS - Utility-first CSS framework
    '@tailwindcss/postcss': {},

    // Autoprefixer - Adds vendor prefixes automatically
    autoprefixer: {
      // Target modern browsers for better performance
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'not ie 11',
      ],
      // Enable CSS Grid support
      grid: 'autoplace',
      // Remove outdated prefixes
      remove: true,
      // Add prefixes based on Can I Use data
      add: true,
      // Enable flexbox prefixes
      flexbox: true,
    },
  },
};
