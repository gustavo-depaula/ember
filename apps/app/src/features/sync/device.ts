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
 * Kept beside the account and never sent anywhere. Undefined on the website.
 */
export async function hardwareId(): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined
  const { requireOptionalNativeModule } = require('expo') as typeof import('expo')
  if (!requireOptionalNativeModule('ExpoApplication')) return undefined
  const application = require('expo-application') as typeof import('expo-application')
  if (Platform.OS === 'android') return application.getAndroidId()
  return (await application.getIosIdForVendorAsync()) ?? undefined
}

// iOS gives the name its owner chose ("Gustavo's iPhone") only to an app
// holding Apple's user-assigned-device-name entitlement; any other app is told
// the bare family, "iPhone". Then the model tells two phones apart. A build
// from before expo-device has neither, and says the family.
function iosDeviceName(isPad: boolean): string {
  const family = isPad ? 'iPad' : 'iPhone'
  const { requireOptionalNativeModule } = require('expo') as typeof import('expo')
  if (!requireOptionalNativeModule('ExpoDevice')) return family
  const { deviceName, modelName } = require('expo-device') as typeof import('expo-device')
  if (deviceName && !/^(iPhone|iPad|iPod touch)$/.test(deviceName)) return deviceName
  return modelName ?? family
}

function defaultDeviceName(): string {
  if (Platform.OS === 'android') {
    const { Brand, Model } = Platform.constants
    const brand = Brand ? Brand.charAt(0).toUpperCase() + Brand.slice(1) : ''
    return Model.toLowerCase().startsWith(brand.toLowerCase()) ? Model : `${brand} ${Model}`.trim()
  }
  if (Platform.OS === 'ios') return iosDeviceName(Platform.isPad)
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
