module.exports = ({ config }) => {
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
