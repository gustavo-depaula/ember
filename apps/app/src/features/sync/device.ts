import { Platform } from 'react-native'

import { emit } from '@/db/events'
import { randomId } from '@/lib/id'

import { randomHex } from './keys'

// A device of an account: the id the relay knows it by, the token it presents,
// and the name it gives itself in the account's log.

export function newDevice() {
  return { id: randomId(), token: randomHex(32) }
}

/**
 * What tells this phone from every other, where the system has such a thing:
 * it stays the same while the app is installed and differs on another phone.
 * Kept beside the account and never sent anywhere. Undefined in a browser.
 */
export async function hardwareId(): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined
  const { requireOptionalNativeModule } = require('expo') as typeof import('expo')
  if (!requireOptionalNativeModule('ExpoApplication')) return undefined
  const application = require('expo-application') as typeof import('expo-application')
  if (Platform.OS === 'android') return application.getAndroidId()
  return (await application.getIosIdForVendorAsync()) ?? undefined
}

function defaultDeviceName(): string {
  if (Platform.OS === 'android') {
    const { Brand, Model } = Platform.constants
    const brand = Brand ? Brand.charAt(0).toUpperCase() + Brand.slice(1) : ''
    return Model.toLowerCase().startsWith(brand.toLowerCase()) ? Model : `${brand} ${Model}`.trim()
  }
  if (Platform.OS === 'ios') return Platform.isPad ? 'iPad' : 'iPhone'
  const agent = typeof navigator === 'undefined' ? '' : navigator.userAgent
  const browser = ['Firefox', 'Edg', 'Chrome', 'Safari'].find((name) => agent.includes(name))
  const system = ['Windows', 'Mac', 'Android', 'iPhone', 'iPad', 'Linux'].find((name) =>
    agent.includes(name),
  )
  return [browser === 'Edg' ? 'Edge' : browser, system].filter(Boolean).join(' · ') || 'Browser'
}

export function nameDevice(deviceId: string, name = defaultDeviceName()): Promise<void> {
  return emit({ type: 'DeviceNamed', deviceId, name, platform: Platform.OS, at: Date.now() })
}
