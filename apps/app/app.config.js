const appJson = require('./app.json')

const IS_DEV = process.env.APP_VARIANT === 'development'

module.exports = {
  ...appJson.expo,
  name: IS_DEV ? 'Ember (Dev)' : appJson.expo.name,
  ios: {
    ...appJson.expo.ios,
    bundleIdentifier: IS_DEV
      ? `${appJson.expo.ios.bundleIdentifier}.dev`
      : appJson.expo.ios.bundleIdentifier,
  },
  android: {
    ...appJson.expo.android,
    package: IS_DEV ? `${appJson.expo.android.package}.dev` : appJson.expo.android.package,
  },
}
