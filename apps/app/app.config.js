const { withInfoPlist } = require('expo/config-plugins')

const { androidFonts } = require('./plugins/androidFonts')

module.exports = ({ config }) => {
  // Apple Team ID: prefer $APPLE_TEAM_ID at config eval time. If the env var
  // isn't set, fall back to whatever is in app.json so `expo config` /
  // `expo prebuild` don't fail just because the dev hasn't exported the var
  // yet. Real EAS builds set APPLE_TEAM_ID via the EAS secret.
  const teamId =
    process.env.APPLE_TEAM_ID ||
    (config.ios && config.ios.appleTeamId) ||
    'REPLACE_WITH_APPLE_TEAM_ID'
  config.ios = { ...(config.ios || {}), appleTeamId: teamId }
  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins.map((p) =>
      p === 'expo-font' ? [p, { android: { fonts: androidFonts } }] : p,
    )
  }

  // Permissions that libraries add and the app never exercises. Each one Play
  // reviews: a sensitive permission asks for a declaration, and a media
  // foreground service for a demo video.
  config.android = {
    ...config.android,
    blockedPermissions: [
      // expo-image-picker: only the library is opened, through the system
      // photo picker, which needs no permission.
      'android.permission.CAMERA',
      // expo-audio: nothing records.
      'android.permission.RECORD_AUDIO',
      // expo-audio background playback, for the creators' audio player — a
      // feature with no route yet. Drop these two lines when it ships.
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK',
      // The template's debug overlay permission, in the release manifest too.
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
  }

  const IS_DEV = process.env.APP_VARIANT === 'development'
  // expo-dev-client declares local-network access for finding Metro, and its
  // own release strip phase leaves the keys in the archive. A store build has
  // no dev launcher to use them, and App Review reads every usage string.
  if (!IS_DEV) {
    return withInfoPlist(config, (c) => {
      delete c.modResults.NSLocalNetworkUsageDescription
      delete c.modResults.NSBonjourServices
      return c
    })
  }
  return {
    ...config,
    name: 'Ember (Dev)',
    ios: {
      ...config.ios,
      bundleIdentifier: `${config.ios.bundleIdentifier}.dev`,
    },
    android: {
      ...config.android,
      package: `${config.android.package}.dev`,
    },
  }
}
