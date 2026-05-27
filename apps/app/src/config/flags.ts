export type FeatureFlags = {
  custody: boolean
  custodyBoundIOS: boolean
  custodyBoundAndroid: boolean
  // Which medievalist face backs the sacred-title voice ($title / rung 6).
  // Both are loaded; flip this to A/B them on real screens, then keep one.
  sacredTitleFace: 'junicode' | 'imfell'
}

export const flags: FeatureFlags = {
  custody: true,
  custodyBoundIOS: __DEV__,
  custodyBoundAndroid: false,
  sacredTitleFace: 'junicode',
}
