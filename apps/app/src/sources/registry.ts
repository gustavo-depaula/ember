import { bibleChapterSource } from './bible-chapter'
import { cccChapterSource } from './ccc-chapter'
import { cccCompendiumSource } from './ccc-compendium'
import { psalmodySource } from './psalmody'
import type { ContentSource } from './types'
import { gospelOfTheDaySource, wordOfThePopeSource } from './vatican-news'

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
registerSource(gospelOfTheDaySource as ContentSource)
registerSource(wordOfThePopeSource as ContentSource)
