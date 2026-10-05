import { ensureManifestBody, getEntry } from '@/content/contentIndex'
import type {
  CollectionBlock,
  CollectionItemManifest,
  CollectionSection,
} from '@/content/manifestTypes'
import { collectionShelves, unshelvedKey } from '@/features/collections/shelves'
import { artFor } from '@/features/explore/artMap'
import { localizeContent } from '@/lib/i18n'
import { entryTitle, listEntries, type TileData, tileFor } from './catalog'
import { bootCorpus } from './corpus'
import { type Locale, withLocale } from './locale'
import { proseHtml } from './markdown'

export type SectionView = {
  id: string
  title: string
  intro?: string
  tiles: TileData[]
  prose: string[]
  sections: SectionView[]
}

export type CollectionPage = {
  id: string
  title: string
  description?: string
  art?: string
  cover?: string
  prologue?: string
  sections: SectionView[]
  itemCount: number
}

function sectionView(section: CollectionSection, locale: Locale): SectionView {
  const tiles: TileData[] = []
  const prose: string[] = []
  const sections: SectionView[] = []
  for (const block of section.blocks as CollectionBlock[]) {
    if (block.kind === 'item') {
      const tile = tileFor(block.ref, locale)
      if (tile) tiles.push(block.label ? { ...tile, title: localizeContent(block.label) } : tile)
    } else if (block.kind === 'prose') {
      prose.push(proseHtml(localizeContent(block.body.body)))
    } else if (block.kind === 'section') {
      sections.push(sectionView(block, locale))
    }
    // `todo` blocks are editorial placeholders for works not yet in the corpus.
  }
  return {
    id: section.id,
    title: localizeContent(section.title),
    intro: section.description ? proseHtml(localizeContent(section.description.body)) : undefined,
    tiles,
    prose,
    sections,
  }
}

function countTiles(sections: SectionView[]): number {
  return sections.reduce((n, s) => n + s.tiles.length + countTiles(s.sections), 0)
}

export async function loadCollectionPage(
  id: string,
  locale: Locale,
): Promise<CollectionPage | undefined> {
  await bootCorpus()
  const entry = getEntry(id)
  if (!entry) return undefined
  const manifest = await ensureManifestBody<CollectionItemManifest>(entry.hash)
  return withLocale(locale, () => {
    const sections = manifest.sections.map((s) => sectionView(s, locale))
    return {
      id,
      title: entryTitle(entry),
      description: manifest.description
        ? localizeContent(manifest.description) || undefined
        : undefined,
      art: artFor(id)?.uri,
      cover: entry.cover,
      prologue: manifest.prologue ? proseHtml(localizeContent(manifest.prologue.body)) : undefined,
      sections: sections.filter((s) => s.tiles.length || s.sections.length || s.prose.length),
      itemCount: countTiles(sections),
    }
  })
}

export type Shelf = { key: string; tiles: TileData[] }

/** The collections on their shelves, in the app's order; the unplaced ones close the list. */
export async function loadCollectionShelves(locale: Locale): Promise<Shelf[]> {
  await bootCorpus()
  return withLocale(locale, () => {
    const all = new Map(listEntries('collection'))
    const placed = new Set<string>()
    const shelves: Shelf[] = collectionShelves.map((shelf) => ({
      key: shelf.key,
      tiles: shelf.ids.flatMap((id) => {
        if (!all.has(id)) return []
        placed.add(id)
        const tile = tileFor(id, locale)
        return tile ? [tile] : []
      }),
    }))
    const rest = [...all.keys()]
      .filter((id) => !placed.has(id))
      .flatMap((id) => tileFor(id, locale) ?? [])
      .sort((a, b) => a.title.localeCompare(b.title, locale))
    return [...shelves, { key: unshelvedKey, tiles: rest }].filter((s) => s.tiles.length)
  })
}
