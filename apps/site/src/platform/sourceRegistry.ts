// The site's source registry. Sources that read the corpus are the app's own;
// sources that fetch third-party copyrighted text at runtime (iBreviary,
// Vatican News, Opus Dei, the Catechism) are never run here, because a built
// page would redistribute what the app only caches on-device. Those sections
// render a pointer to the app instead.
import type { Primitive } from '@/content/primitives'
import { bibleChapterSource } from '@/sources/bible-chapter'
import { doHourSource } from '@/sources/divinum-officium/do-hour'
import { doMassSource } from '@/sources/divinum-officium/do-mass'
import { lothHourSource } from '@/sources/loth/source'
import { missalMassSource, missalProperSource } from '@/sources/missal-mass'
import { psalmodySource } from '@/sources/psalmody'
import type { ContentSource } from '@/sources/types'

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

export const appOnlyMarker = 'ember:app-only'

function appOnly(id: string): ContentSource {
  return {
    id,
    version: '1',
    prefsDeps: ['lang'],
    fetch: async (): Promise<Primitive> => ({
      type: 'link',
      text: { primary: appOnlyMarker },
      href: appOnlyMarker,
    }),
  }
}

registerSource(bibleChapterSource)
registerSource(psalmodySource)
registerSource(doMassSource as ContentSource)
registerSource(doHourSource as ContentSource)
registerSource(missalMassSource as ContentSource)
registerSource(missalProperSource as ContentSource)

// The Brazilian Liturgy of the Hours is in the corpus; the other languages'
// comes from iBreviary, which only the app reads.
registerSource(lothHourSource(appOnly('producer/breviary-of-the-day')) as ContentSource)

for (const id of [
  'producer/ccc-chapter',
  'producer/ccc-compendium',
  'producer/gospel-of-the-day',
  'producer/word-of-the-pope',
  'producer/opus-dei-gospel-commentary',
  'producer/opus-dei-meditation',
  'producer/breviary-of-the-day',
  'producer/office-of-readings-reading',
]) {
  registerSource(appOnly(id))
}
