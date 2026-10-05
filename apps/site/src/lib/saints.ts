import { loadHolyCardCatalog } from '@/features/saints/data/holyCards'
import { loadSaintCollect, type SaintCollect } from '@/features/saints/data/saintCollect'
import { loadSaintLife } from '@/features/saints/data/saintLife'
import {
  type AlbumShelf,
  albumShelves,
  buildSaintsCatalog,
  type SaintEntry,
  type SaintsCatalog,
} from '@/features/saints/data/saintsCatalog'
import { assetUrl } from './assets'
import { type TileData, tileFor } from './catalog'
import { ofTexts } from './config'
import { bootCorpus } from './corpus'
import { type Locale, withLocale } from './locale'
import { markdownHtml } from './markdown'

const catalogs = new Map<Locale, Promise<SaintsCatalog>>()

/** The holy cards, localized: the app's own catalog build. */
export function saintsCatalog(locale: Locale): Promise<SaintsCatalog> {
  let catalog = catalogs.get(locale)
  if (!catalog) {
    catalog = bootCorpus()
      .then(loadHolyCardCatalog)
      .then((data) => withLocale(locale, () => buildSaintsCatalog(data?.cards, locale)))
    catalogs.set(locale, catalog)
  }
  return catalog
}

export type SaintShelf = { key: AlbumShelf; saints: SaintEntry[] }

export async function saintShelves(locale: Locale): Promise<SaintShelf[]> {
  const { saints } = await saintsCatalog(locale)
  return albumShelves
    .map((key) => ({ key, saints: saints.filter((s) => s.shelf === key) }))
    .filter((shelf) => shelf.saints.length)
}

export function saintsOn(catalog: SaintsCatalog, date: Date): SaintEntry[] {
  return catalog.saints.filter(
    (s) => s.feast?.month === date.getMonth() + 1 && s.feast.day === date.getDate(),
  )
}

function corpusHtml(markdown: string): string {
  return markdownHtml(markdown).replace(/corpus:\/\/[0-9a-f]{64}\.\w+/g, (uri) => assetUrl(uri))
}

export type SaintPage = {
  saint: SaintEntry
  life?: { opening: string; rest?: string; minutes: number }
  collect?: SaintCollect
  pray: { title?: string; tiles: TileData[] }[]
  read: { title?: string; tiles: TileData[] }[]
  collections: TileData[]
  related: SaintEntry[]
}

export async function loadSaintPage(id: string, locale: Locale): Promise<SaintPage | undefined> {
  const catalog = await saintsCatalog(locale)
  const saint = catalog.byId[id]
  if (!saint) return undefined
  return withLocale(locale, async () => {
    const life = saint.lifeChapter ? await loadSaintLife(saint.lifeChapter, locale) : undefined
    const shelves = (groups: SaintEntry['pray']) =>
      groups
        .map((g) => ({
          title: g.title,
          tiles: g.refs.flatMap((ref) => tileFor(ref, locale) ?? []),
        }))
        .filter((g) => g.tiles.length)
    return {
      saint,
      life: life && {
        opening: corpusHtml(life.opening),
        rest: life.rest ? corpusHtml(life.rest) : undefined,
        minutes: life.minutes,
      },
      collect: ofTexts && saint.proper ? await loadSaintCollect(saint.proper, locale) : undefined,
      pray: shelves(saint.pray),
      read: shelves(saint.read),
      collections: saint.collections.flatMap((ref) => tileFor(ref, locale) ?? []),
      related: saint.relatedCards.flatMap((other) => catalog.byId[other] ?? []),
    }
  })
}
