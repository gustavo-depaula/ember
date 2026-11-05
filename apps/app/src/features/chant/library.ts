// The chant library's reading of its books: which page a day opens at, where a
// chant is sung, the occasions it gathers, and how a search finds a chant.
//
// Plain functions over the books the corpus ships (scripts/chant-books.py lays
// out the Graduale and the Antiphonale), so the website can share them.

import { createDirectorium, type Directorium, efVersion, resolveDay } from '@ember/divinum-officium'
import { type BlockTone, jewelTones } from '@/features/explore/bgColor'
import { localizeContent } from '@/lib/i18n'
import { matchWords, normalizeForSearch, searchWords } from '@/lib/search'
import { createCorpusDoLoader } from '@/sources/divinum-officium/loader'
import { type ChantBook, type ChantBookSection, chantSummary } from './chants'
import type { ChantGenre } from './textKey'

export const gradualeId = 'chant-book/graduale'
export const antiphonaleId = 'chant-book/antiphonale'

/** A day of the 1962 calendar, as the library needs it: the office that wins it. */
export type ChantDay = {
  date: Date
  /** `Tempora/Pent24-0.txt`, `Sancti/11-11.txt` */
  winner: string
  /** The week of the season: `Pent24`, `Adv1`. */
  week: string
  weekday: number
}

let directorium: Promise<Directorium> | undefined

/** The days from `from` on, as the Divinum Officium calendar the Latin Mass uses resolves them. */
export async function chantDays(from: Date, count: number): Promise<ChantDay[]> {
  const loader = createCorpusDoLoader()
  directorium ??= createDirectorium(loader)
  // A failed build must not be remembered as the answer.
  directorium.catch(() => {
    directorium = undefined
  })
  const shared = await directorium
  return Promise.all(
    Array.from({ length: count }, async (_, i) => {
      const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i)
      const day = await resolveDay({
        loader,
        directorium: shared,
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        version: efVersion,
        missa: true,
        sections: false,
      })
      return { date, winner: day.winner, week: day.dayname[0], weekday: day.dayofweek }
    }),
  )
}

/**
 * The page of a book a day is sung from: the feast's own, the third Mass of
 * Christmas on Christmas Day, else the Sunday's, which a weekday without
 * propers of its own repeats.
 */
export function sectionOfDay(book: ChantBook, day: ChantDay): ChantBookSection | undefined {
  const file = /^(Tempora|Sancti)\w*\/(.+?)\.txt$/.exec(day.winner)
  if (!file) return undefined
  const [, folder, name] = file
  const byId = (id: string) => book.sections.find((s) => s.id === id.toLowerCase())
  const own = `${folder === 'Tempora' ? 'tempora' : 'sancti'}-${name}`
  return (
    byId(own) ??
    byId(`${own}m3`) ??
    (folder === 'Tempora' ? byId(`tempora-${name.replace(/-\d$/, '-0')}`) : undefined) ??
    byId(`tempora-${day.week}-0`)
  )
}

/** Where a chant is sung: each book and page that prints it. */
export type ChantPlace = { book: ChantBook; section: ChantBookSection }

export function placesOfChants(books: ChantBook[]): Map<string, ChantPlace[]> {
  const places = new Map<string, ChantPlace[]>()
  for (const book of books) {
    for (const section of book.sections) {
      for (const chant of section.chants) {
        const list = places.get(chant) ?? []
        list.push({ book, section })
        places.set(chant, list)
      }
    }
  }
  return places
}

/** The order a search and a list set the genres in: the Mass's, then the Office's. */
export const genreOrder: ChantGenre[] = ['in', 'gr', 'al', 'tr', 'se', 'of', 'co', 'an', 'hy', 'rb']

/** A jewel ground for a day's page: its season's, or Our Lady's, a martyr's, a dedication's. */
export function toneOfSection(section: ChantBookSection): BlockTone {
  const title = localizeContent(section.title)
  if (/Mari(æ|ae)|B\.\s*M\.\s*V|Virginis Mari|Septem Dolorum/i.test(title)) return jewelTones.marian
  if (/Dedicatione/.test(title)) return { from: '#2E3A4A', to: '#11161E' }
  if (/Martyr|Apostol|Pentecost(es|en)$|Cruc/i.test(title) && section.group !== 'pentecostes')
    return jewelTones.red
  switch (section.group) {
    case 'adventus':
    case 'septuagesima':
      return { from: '#4A2860', to: '#1F1030' }
    case 'quadragesima':
    case 'passio':
      return { from: '#3D1F52', to: '#180A22' }
    case 'nativitas':
    case 'pascha':
      return jewelTones.gold
    case 'epiphania':
    case 'pentecostes':
      return jewelTones.green
    default:
      return { from: '#5A1722', to: '#24090E' }
  }
}

export type OccasionId = 'marian' | 'defunct' | 'eucharist'

/** The occasions the library gathers across its books, each with the painting it borrows. */
export const occasions: { id: OccasionId; art: string }[] = [
  { id: 'marian', art: 'collection/marian' },
  { id: 'defunct', art: 'collection/for-the-dead' },
  { id: 'eucharist', art: 'collection/eucharistic' },
]

const occasionTitles: Record<OccasionId, RegExp> = {
  marian: /Mari(æ|ae)|B\.\s*M\.\s*V|Virginis Mari|Septem Dolorum|Sanctæ Mariæ Sabbato/i,
  defunct: /Defunct/i,
  eucharist: /Corporis Christi|Sanguinis/i,
}

// The prayers of the hymns-and-antiphons book an occasion also gathers.
const occasionChants: Record<OccasionId, RegExp> = {
  marian:
    /^(Alma Redemptoris|Ave Regina|Regina c|Salve Regina|Sub tuum|Ave Maria|Ave maris|Memorare|Litaniae Laur|Stabat)/i,
  defunct: /^(Lux aeterna|Subvenite|Dies irae|Requiem)/i,
  eucharist:
    /^(Adoro te|Ave verum|Pange lingua|Tantum ergo|O salutaris|Panis angelicus|Lauda Sion|Sacris solemniis|Verbum supernum|Ego sum panis)/i,
}

/** The pages of the books that belong to an occasion, and the prayers it gathers. */
export function occasionContents(
  books: ChantBook[],
  id: OccasionId,
): { places: ChantPlace[]; chants: string[] } {
  const places = books.flatMap((book) =>
    book.list === 'chants'
      ? []
      : book.sections
          .filter((s) => occasionTitles[id].test(localizeContent(s.title)))
          .map((section) => ({ book, section })),
  )
  const chants = books
    .filter((book) => book.list === 'chants')
    .flatMap((book) => book.sections.flatMap((s) => s.chants))
    .filter((chant) => occasionChants[id].test(chantSummary(chant).name))
  return { places, chants: [...new Set(chants)] }
}

/**
 * The chants a query finds: by their name first (an incipit is how a chant is
 * known), then by any words of what they sing. `texts` is the corpus's
 * `chant-text/all`, already folded the way `normalizeForSearch` folds a query.
 */
export function searchChants(
  query: string,
  chantIds: string[],
  texts: Record<string, string> | undefined,
): string[] {
  const q = fold(query)
  const tokens = searchWords(q)
  if (!tokens.length) return []
  const byName = chantIds.filter(
    (id) => matchWords(searchWords(fold(chantSummary(id).name)), tokens) !== undefined,
  )
  const named = new Set(byName)
  const byText = texts ? chantIds.filter((id) => !named.has(id) && texts[id]?.includes(q)) : []
  return [...byName, ...byText]
}

// Latin's ligatures spelled out, as scripts/build-corpus.py folds the chants' words.
function fold(text: string): string {
  return normalizeForSearch(
    text.replace(/æ/g, 'ae').replace(/Æ/g, 'Ae').replace(/œ/g, 'oe').replace(/Œ/g, 'Oe'),
  )
}
