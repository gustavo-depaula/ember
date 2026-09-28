/**
 * Every warmed manifest body in one file, keyed by content hash. A returning
 * launch reads this instead of ~500 separate blobs: the per-blob read cost
 * (a JSI stat, an async native read, a decode) — not the JSON parse — was most
 * of the warm that held the splash. Hash keys make it self-validating (a body
 * is correct for its hash forever), so it never needs invalidating; the warm
 * rewrites it whenever it loads something new, keeping only what the current
 * catalog references.
 */

import * as expoFs from 'expo-file-system'
import { Platform } from 'react-native'
import { idbReadText, idbWriteFile } from '@/lib/idb-fs'

const fileName = 'manifest-snapshot-v1.json'

const nativeFs = Platform.OS !== 'web' ? expoFs : undefined

function snapshotFile() {
  if (!nativeFs) throw new Error('snapshotFile() called on web')
  return new nativeFs.File(nativeFs.Paths.document, fileName)
}

async function readText(): Promise<string | undefined> {
  if (Platform.OS === 'web') return idbReadText(fileName)
  const f = snapshotFile()
  return f.exists ? f.text() : undefined
}

/** Undefined when absent or unreadable (e.g. a write cut short) — callers fall back to blobs. */
export async function readManifestSnapshot(): Promise<Record<string, unknown> | undefined> {
  try {
    const text = await readText()
    return text ? (JSON.parse(text) as Record<string, unknown>) : undefined
  } catch {
    return undefined
  }
}

export async function writeManifestSnapshot(bodies: Record<string, unknown>): Promise<void> {
  const text = JSON.stringify(bodies)
  if (Platform.OS === 'web') {
    await idbWriteFile(fileName, text)
    return
  }
  snapshotFile().write(text)
}
