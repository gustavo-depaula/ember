import { getEntry } from '@/content/contentIndex'
import { getManifest, getManifestIconKey } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'

/**
 * Resolve a template practice `ref` (bare, e.g. `rosary`) to its display name +
 * icon key. Prefers the warmed practice manifest, falls back to the catalog
 * hint, then the raw ref — so a row never shows nothing while content warms.
 */
export function resolvePracticeName(ref: string): string {
  const manifest = getManifest(ref)
  if (manifest) return localizeContent(manifest.name)
  const entry = getEntry(`practice/${ref}`)
  if (entry?.name) return localizeContent(entry.name)
  return ref
}

export function resolvePracticeIcon(ref: string): string {
  if (getManifest(ref)) return getManifestIconKey(ref)
  return getEntry(`practice/${ref}`)?.icon ?? 'prayer'
}
