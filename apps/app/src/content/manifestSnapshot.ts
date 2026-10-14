/**
 * Every warmed manifest body in one file, keyed by content hash. A returning
 * launch reads this instead of ~500 separate blobs: the per-blob read cost
 * (a JSI stat, an async native read, a decode) — not the JSON parse — was most
 * of the warm that held the splash. Hash keys make it self-validating (a body
 * is correct for its hash forever), so it never needs invalidating; the warm
 * rewrites it whenever it loads something new, keeping only what the current
 * catalog references.
 */

import { File, Paths } from 'expo-file-system'

function snapshotFile() {
  return new File(Paths.document, 'manifest-snapshot-v1.json')
}

async function readText(): Promise<string | undefined> {
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
  snapshotFile().write(JSON.stringify(bodies))
}
