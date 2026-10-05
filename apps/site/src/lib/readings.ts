import { resolveFlow } from '@ember/content-engine'
import { getCollectionsForItem, getEntry } from '@/content/contentIndex'
import { createEngineContext } from '@/content/engineContext'
import type { Primitive } from '@/content/primitives'
import { getChapterManifest, loadChapterContent, prefetchChapterProse } from '@/content/resolver'
import { localizeContent } from '@/lib/i18n'
import { bootCorpus } from './corpus'
import { type Locale, withLocale } from './locale'
import { toPrimitives } from './practice'
import { today } from './today'

export type ReadingPage = {
  id: string
  title: string
  subtitle?: string
  minutes?: number
  primitives: Primitive[]
  collections: { id: string; name: string }[]
}

/** A standalone chapter (the corpus' articles), rendered as the app renders it. */
export async function loadReadingPage(
  id: string,
  locale: Locale,
): Promise<ReadingPage | undefined> {
  await bootCorpus()
  return withLocale(locale, async () => {
    const manifest = getChapterManifest(id)
    if (!manifest) return undefined
    await prefetchChapterProse(id, [])
    const content = await loadChapterContent(id)
    if (!content) return undefined
    const ec = createEngineContext(id, { contentLanguage: locale })
    const rendered = resolveFlow(content, { date: today }, ec)
    return {
      id,
      title: localizeContent(manifest.title),
      subtitle: manifest.subtitle ? localizeContent(manifest.subtitle) : undefined,
      minutes: manifest.estimatedMinutes,
      primitives: await toPrimitives(rendered, locale, today),
      collections: getCollectionsForItem(manifest.id).flatMap((collectionId) => {
        const entry = getEntry(collectionId)
        return entry?.name ? [{ id: collectionId, name: localizeContent(entry.name) }] : []
      }),
    }
  })
}
