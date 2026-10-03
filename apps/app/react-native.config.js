// MapLibre draws the Mass Times map on Android only (iOS uses Apple Maps
// through expo-maps), so keep its pod and codegen out of the iOS build.
module.exports = {
  dependencies: {
    '@maplibre/maplibre-react-native': { platforms: { ios: null } },
  },
}
