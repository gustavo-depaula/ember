import type { AccountView, Profile } from '@ember/relay'
import { Platform } from 'react-native'

import { resetDatabase } from '@/db/client'
import { emit, exportLog, replayAll, useEventStore } from '@/db/events'
import { getDb } from '@/db/instance'
import { broadcastChange } from '@/lib/db-shared/manager'
import { randomId } from '@/lib/id'

import { saveBackup } from './backup'
import { accountStatements, forgetAccountSql, push, sync, withSyncHeld } from './engine'
import { accountKeys, newSecret, randomHex, sealFor } from './keys'
import { relay } from './relay'
import { type Account, useSync } from './state'

// The public half of the key that opens recovery copies; its secret half is
// kept offline by whoever runs the relay. Empty: no recovery copies are made.
const recoveryKey =
  process.env.EXPO_PUBLIC_SYNC_RECOVERY_KEY ??
  '3fefe661c06eb3a3be365f6f97e23fd0e97e01bee2d8b7b9bb94decf1f74634b'

export const canKeepRecoveryCopy = recoveryKey !== ''

function signedIn(): Account {
  const { account } = useSync.getState()
  if (!account) throw new Error('This device has no account')
  return account
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

export function nameDevice(deviceId: string, name: string): Promise<void> {
  return emit({ type: 'DeviceNamed', deviceId, name, platform: Platform.OS, at: Date.now() })
}

function newDevice() {
  return { id: randomId(), token: randomHex(32) }
}

/** Opens an account with this device as its first. What is here becomes the account's. */
export async function startAccount(): Promise<void> {
  const secret = newSecret()
  const keys = accountKeys(secret)
  const device = newDevice()
  await relay.createAccount(keys.account, keys.auth, device)
  const account = { secret, device: device.id, token: device.token }
  await getDb().runBatchInTx(accountStatements(account))
  useSync.setState({ account })
  await nameDevice(device.id, defaultDeviceName())
  await sync()
}

/**
 * Makes this device one of the account `secret` opens. What the device held
 * is replaced by the account's log, after a copy of it is saved as a file.
 */
export async function joinAccount(secret: string): Promise<void> {
  const keys = accountKeys(secret)
  const device = newDevice()
  await relay.addDevice(keys.account, keys.auth, device)
  const account = { secret, device: device.id, token: device.token }

  const db = getDb()
  const held = await db.getFirstAsync<{ n: number }>('SELECT count(*) AS n FROM events')
  if (held?.n) await saveBackup(await exportLog())
  await db.runBatchInTx([{ sql: 'DELETE FROM events' }, ...accountStatements(account)])
  await replayAll()
  broadcastChange({ kind: 'invalidate', tags: ['log'] })
  useSync.setState({ account })
  await sync()
  await nameDevice(device.id, defaultDeviceName())
}

/** Takes the account off this device and leaves what the device holds as it is. */
async function forgetAccount(): Promise<void> {
  // The log goes back to being this device's alone: nothing in it has been
  // sent anywhere, and it lists no devices.
  await getDb().runBatchInTx([
    { sql: forgetAccountSql },
    { sql: 'UPDATE events SET synced = 0' },
    { sql: "DELETE FROM events WHERE type IN ('DeviceNamed', 'DeviceRemoved')" },
  ])
  useSync.setState({ account: undefined, syncedAt: undefined, state: 'ok' })
  await replayAll()
  broadcastChange({ kind: 'invalidate', tags: ['log'] })
}

/** Whether everything written here has reached the account. */
export async function sendPending(): Promise<boolean> {
  const account = signedIn()
  return push(account, accountKeys(account.secret)).then(
    () => true,
    () => false,
  )
}

/**
 * Removes this device from the account and erases Ember's data on it; the
 * account and its other devices are untouched. Call `sendPending` first:
 * what hasn't reached the account goes with the device.
 */
export async function removeThisDevice(): Promise<void> {
  const account = signedIn()
  const keys = accountKeys(account.secret)
  await emit({ type: 'DeviceRemoved', deviceId: account.device })
  await push(account, keys).catch(() => undefined)
  await relay.removeDevice(keys.account, account.token, account.device)
  await resetDatabase()
}

/** Removes another device: the relay turns it away, and it erases itself when it next asks. */
export async function removeDevice(deviceId: string): Promise<void> {
  const account = signedIn()
  await relay.removeDevice(accountKeys(account.secret).account, account.token, deviceId)
  await emit({ type: 'DeviceRemoved', deviceId })
}

/** Deletes the account and, through it, erases every other device; this one keeps everything. */
export function keepOnlyHere(): Promise<void> {
  const account = signedIn()
  return withSyncHeld(async () => {
    await relay.deleteAccount(accountKeys(account.secret).account, account.token)
    await forgetAccount()
  })
}

/** Deletes the account and erases every device, this one included. */
export async function deleteAccount(): Promise<void> {
  const account = signedIn()
  await relay.deleteAccount(accountKeys(account.secret).account, account.token)
  await resetDatabase()
}

export function loadAccountView(): Promise<AccountView> {
  const account = signedIn()
  return relay.view(accountKeys(account.secret).account, account.token)
}

/**
 * Saves what the person tells about themselves. With an email or a phone and
 * `recoverable`, a copy of the account's secret goes too, sealed for the
 * recovery key, so the account can be handed back to whoever answers there.
 */
export async function saveProfile(profile: Profile, recoverable: boolean): Promise<void> {
  const account = signedIn()
  const recovery =
    (profile.email || profile.phone) && recoverable && canKeepRecoveryCopy
      ? sealFor(recoveryKey, account.secret)
      : null
  await relay.saveProfile(accountKeys(account.secret).account, account.token, {
    ...profile,
    recovery,
  })
}

export function useThisDevice() {
  const id = useSync((s) => s.account?.device)
  return useEventStore((s) => (id ? s.devices.get(id) : undefined))
}
