// Allows serving the web build from a sub-folder (portfolio hub, GitHub Pages):
//   EXPO_BASE_URL=/eleventh-demo/dist npx expo export --platform web
module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, baseUrl: process.env.EXPO_BASE_URL || '' },
});
