export type FeatureFlags = {
  custody: boolean
  custodyBoundIOS: boolean
  custodyBoundAndroid: boolean
}

export const flags: FeatureFlags = {
  custody: __DEV__,
  custodyBoundIOS: __DEV__,
  custodyBoundAndroid: false,
}
