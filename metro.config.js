const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
// Keep Metro's native/web conditions. Do not force "browser" on native:
// Firebase Authentication has different exports for each platform.
module.exports = config;
