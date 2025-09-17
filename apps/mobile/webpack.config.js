const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Disable service worker for now to avoid issues
      offline: false,
    },
    argv
  );

  // Ensure proper MIME types for JavaScript files
  if (config.devServer) {
    config.devServer.mimeTypes = {
      ...config.devServer.mimeTypes,
      'application/javascript': ['js', 'mjs', 'bundle'],
    };
    
    // Disable service worker in development
    config.devServer.hot = true;
    config.devServer.liveReload = true;
  }

  // Remove service worker plugin in development
  if (env.mode === 'development') {
    config.plugins = config.plugins.filter(
      plugin => plugin.constructor.name !== 'GenerateSW' && 
                plugin.constructor.name !== 'InjectManifest'
    );
  }

  return config;
};