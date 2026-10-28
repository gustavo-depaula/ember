// Expo's native modules, in a browser: there are none. The app's code asks
// for them only on a phone (`Platform.OS` is 'web' here), but the bundler
// follows every `require`.
export function requireOptionalNativeModule(): null {
  return null
}
