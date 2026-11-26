import { requireOptionalNativeModule } from 'expo'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

// The local module (modules/install-source) arrived in a later build than the
// runtime it ships on: a binary without it never counts as TestFlight.
const installSource = requireOptionalNativeModule<{ isTestFlight(): boolean }>('InstallSource')

/** Whether this is an iOS install from TestFlight rather than the App Store. */
export function isTestFlight(): boolean {
  return Platform.OS === 'ios' && !!installSource?.isTestFlight()
}

/** Ember's App Store page, from the app config. */
export const appStoreUrl = Constants.expoConfig?.ios?.appStoreUrl
