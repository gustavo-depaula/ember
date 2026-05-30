export type FeatureFlags = {
  custody: boolean
  custodyBoundIOS: boolean
  custodyBoundAndroid: boolean
}

export const flags: FeatureFlags = {
  custody: true,
  custodyBoundIOS: __DEV__,
  custodyBoundAndroid: false,
}
