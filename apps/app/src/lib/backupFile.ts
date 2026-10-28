import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { Platform, Share } from 'react-native'

import { exportLog, mergeLog } from '@/db/events'

// A `.pray` file is everything a person has done in Ember, to keep outside
// the app: a zip archive holding the event log as `exportLog` writes it.

const entry = 'ember.json'
// Plain bytes: a system told the file is a zip adds `.zip` to its name.
const fileType = 'application/octet-stream'

function fileName(): string {
  return `ember-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}.pray`
}

/** `log` as the bytes of a `.pray` file. */
export function pack(log: string): Uint8Array {
  return zipSync({ [entry]: strToU8(log) })
}

/** The log a `.pray` file holds. Throws when the bytes are not one. */
export function unpack(file: Uint8Array): string {
  const log = unzipSync(file)[entry]
  if (!log) throw new Error('Not an Ember file')
  return strFromU8(log)
}

/**
 * Keeps `log` as a file outside the database, so replacing what the database
 * holds is never the end of it. It goes to the app's documents under
 * `backups/`.
 */
export async function saveBackup(log: string): Promise<void> {
  const name = fileName()
  const fs = require('expo-file-system') as typeof import('expo-file-system')
  new fs.Directory(fs.Paths.document, 'backups/').create({ intermediates: true, idempotent: true })
  new fs.File(fs.Paths.document, `backups/${name}`).write(pack(log))
}

/**
 * Hands the person everything they have done in Ember as one file, to keep
 * wherever they like: Android asks for a folder, iOS opens the share sheet.
 * Resolves to false when they backed out.
 */
export async function exportBackup(): Promise<boolean> {
  const file = pack(await exportLog())
  const name = fileName()
  const fs = require('expo-file-system') as typeof import('expo-file-system')
  if (Platform.OS === 'android') {
    // The system's own folder picker: no storage permission, and the file
    // lands where the person can find it again.
    const folder = await fs.Directory.pickDirectoryAsync().catch((err: unknown) => {
      if (/cancel/i.test(String(err))) return undefined
      throw err
    })
    if (!folder) return false
    folder.createFile(name, fileType).write(file)
    return true
  }
  const shared = new fs.File(fs.Paths.cache, name)
  shared.write(file)
  const result = await Share.share({ url: shared.uri })
  return result.action !== Share.dismissedAction
}

async function choose(): Promise<Uint8Array | undefined> {
  const fs = require('expo-file-system') as typeof import('expo-file-system')
  const picked = await fs.File.pickFileAsync()
  return picked.canceled ? undefined : picked.result.bytes()
}

/**
 * Lets the person choose a `.pray` file and adds what it holds to what is
 * here: nothing already here is changed, and what the file shares with this
 * device is not added twice. Resolves to how many things were new, or
 * undefined when they backed out.
 */
export async function importBackup(): Promise<number | undefined> {
  const file = await choose()
  return file && mergeLog(unpack(file))
}
