const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add the parent directory to the watch folders
config.watchFolders = [
  path.resolve(__dirname, '..'), // Parent directory (EZournals root)
];

// Configure the resolver to look in parent directory
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
  ],
};

module.exports = config;
