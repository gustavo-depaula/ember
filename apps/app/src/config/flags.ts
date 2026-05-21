export type FeatureFlags = {
  custody: boolean
  custodyBoundIOS: boolean
  custodyBoundAndroid: boolean
}

export const flags: FeatureFlags = {
  custody: __DEV__,
  custodyBoundIOS: false,
  custodyBoundAndroid: false,
}
