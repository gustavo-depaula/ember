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
    config.plugins = config.plugins.map((p) => {
      if (Array.isArray(p) && p[0] === 'react-native-device-activity' && p[1]) {
        return [p[0], { ...p[1], appleTeamId: teamId }]
      }
      return p
    })
  }

  const IS_DEV = process.env.APP_VARIANT === 'development'
  if (!IS_DEV) return config
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
