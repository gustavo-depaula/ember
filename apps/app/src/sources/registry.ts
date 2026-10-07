import { bibleChapterSource } from './bible-chapter'
import { cccChapterSource } from './ccc-chapter'
import { cccCompendiumSource } from './ccc-compendium'
import { doHourSource } from './divinum-officium/do-hour'
import { doMassSource } from './divinum-officium/do-mass'
import { breviarySource, officeOfReadingsReadingSource } from './ibreviary'
import { lothHourSource } from './loth/source'
import { missalMassSource } from './missal-mass'
import { opusDeiGospelCommentarySource, opusDeiMeditationSource } from './opus-dei'
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
registerSource(missalMassSource as ContentSource)
registerSource(doMassSource as ContentSource)
registerSource(doHourSource as ContentSource)
registerSource(breviarySource as ContentSource)
registerSource(officeOfReadingsReadingSource as ContentSource)
registerSource(lothHourSource(breviarySource as ContentSource) as ContentSource)
registerSource(opusDeiGospelCommentarySource as ContentSource)
registerSource(opusDeiMeditationSource as ContentSource)
