// The app is set upright and turns only where a screen asks it to (the prayer
// page, through expo-screen-orientation). `orientation: "default"` lets iOS
// declare landscape in its Info.plist, which it must for any screen to turn,
// and the screen-orientation plugin's `initialOrientation` starts it upright.
// Android has no such initial lock: without this its activity would turn on
// every screen until the JavaScript locks it. Upright here, the module's
// `unlockAsync` still turns it at runtime.

const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins')

function withPortraitActivity(config) {
  return withAndroidManifest(config, (c) => {
    const activity = AndroidConfig.Manifest.getMainActivityOrThrow(c.modResults)
    activity.$['android:screenOrientation'] = 'portrait'
    return c
  })
}

module.exports = withPortraitActivity
