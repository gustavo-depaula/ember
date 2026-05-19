import { cccCompendiumSource } from '@ember/sources'
import { bibleChapterSource } from './bible-chapter'
import { cccChapterSource } from './ccc-chapter'
import { psalmodySource } from './psalmody'
import type { ContentSource } from './types'

const sources = new Map<string, ContentSource>()

export function registerSource(s: ContentSource): void {
  sources.set(s.id, s)
}

export function unregisterSource(id: string): void {
  sources.delete(id)
}

export function getSource(id: string): ContentSource | undefined {
  return sources.get(id)
}

registerSource(cccCompendiumSource as ContentSource)
registerSource(cccChapterSource)
registerSource(bibleChapterSource)
registerSource(psalmodySource)
