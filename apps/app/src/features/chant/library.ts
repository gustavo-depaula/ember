// The chant library's reading of its books: which page a day opens at, where a
// chant is sung, the occasions it gathers, and how a search finds a chant.
//
// Plain functions over the books the corpus ships (scripts/chant-books.py lays
// out the Graduale and the Antiphonale), so the website can share them.

import { createDirectorium, type Directorium, efVersion, resolveDay } from '@ember/divinum-officium'
import type { LiturgicalCategory, LiturgicalSeason } from '@ember/liturgical'
import { getEntriesByKind } from '@/content/contentIndex'
import { type BlockTone, toneForCelebration } from '@/features/explore/bgColor'
import { matchWords, normalizeForSearch, searchWords } from '@/lib/search'
import { createCorpusDoLoader } from '@/sources/divinum-officium/loader'
import { type ChantBook, type ChantBookSection, chantSummary } from './chants'
import { ordinaryOfDay } from './ordinary'
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
  /** Divinum Officium's rank, and the Common the office draws on: what the Kyriale's Mass is chosen by. */
  rank: number
  commune: string
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
      return {
        date,
        winner: day.winner,
        week: day.dayname[0],
        weekday: day.dayofweek,
        rank: day.rank,
        commune: day.commune,
      }
    }),
  )
}

/**
 * The page of a book a day is sung from: the feast's own, the third Mass of
 * Christmas on Christmas Day, else the Sunday's, which a weekday without
 * propers of its own repeats.
 */
export function sectionOfDay(book: ChantBook, day: ChantDay): ChantBookSection | undefined {
  // `TemporaM/…` and its like are a rubric's variant folder of the same day.
  const file = /^(Tempora|Sancti)\w*\/(.+?)\.txt$/.exec(day.winner)
  if (!file) return undefined
  const winner = `${file[1]}/${file[2]}`
  const byFile = (f: string) => book.sections.find((s) => s.file === f)
  return byFile(winner) ?? byFile(`${winner}m3`) ?? byFile(`Tempora/${day.week}-0`)
}

/** The page a book opens a day at: the Kyriale's Mass the day's rank chooses, the proper's page of the others. */
export function pageOfDay(book: ChantBook, day: ChantDay): ChantBookSection | undefined {
  if (book.id === 'chant-book/kyriale') {
    const id = ordinaryOfDay(day)
    return book.sections.find((s) => s.id === id)
  }
  return book.list === 'chants' ? undefined : sectionOfDay(book, day)
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

// A book's seasons as the calendar names them; a month of the saints falls back on the green of the year.
const seasonOfGroup: Record<string, LiturgicalSeason> = {
  adventus: 'advent',
  nativitas: 'christmas',
  epiphania: 'epiphany',
  septuagesima: 'septuagesima',
  quadragesima: 'lent',
  passio: 'lent',
  pascha: 'easter',
  pentecostes: 'post-pentecost',
}

// What kind of feast a Common is for, by Divinum Officium's numbering of the Commons.
const categoryOfCommon: [RegExp, LiturgicalCategory][] = [
  [/^C1[01]/, 'blessed_virgin_mary'],
  [/^C1/, 'apostle'],
  [/^C[23]/, 'martyr'],
  [/^C[45]a/, 'doctor_of_the_church'],
  [/^C5b/, 'religious'],
  [/^C[45]/, 'pastor'],
  [/^C6/, 'virgin'],
  [/^C7/, 'holy_woman'],
  [/^C8/, 'dedication'],
]

/** A jewel ground for a group of a book: its season's. */
export function toneOfGroup(group: string | undefined): BlockTone {
  return toneForCelebration(undefined, seasonOfGroup[group ?? ''] ?? 'ordinary')
}

/** A jewel ground for a day's page: the kind of feast its Common says, else its season's. */
export function toneOfSection(section: ChantBookSection): BlockTone {
  const category = categoryOfCommon.find(([common]) => common.test(section.common ?? ''))?.[1]
  return toneForCelebration(category, seasonOfGroup[section.group ?? ''] ?? 'ordinary')
}

export type OccasionId = 'marian' | 'defunct' | 'eucharist'

/** The occasions the library gathers across its books, each with the painting it borrows. */
export const occasions: { id: OccasionId; art: string }[] = [
  { id: 'marian', art: 'collection/marian' },
  { id: 'defunct', art: 'collection/for-the-dead' },
  { id: 'eucharist', art: 'collection/eucharistic' },
]

// The pages of an occasion: Our Lady's Commons and the feasts that draw on them,
// the Mass and Office of the dead, Corpus Christi and the Precious Blood.
const occasionPages: Record<OccasionId, (section: ChantBookSection) => boolean> = {
  marian: (s) => /^C1[01]/.test(s.common ?? ''),
  defunct: (s) => /^C9/.test(s.common ?? ''),
  eucharist: (s) => s.file === 'Tempora/Pent01-4' || s.file === 'Sancti/07-01',
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
    book.sections.filter(occasionPages[id]).map((section) => ({ book, section })),
  )
  const chants = books
    .filter((book) => book.list === 'chants')
    .flatMap((book) => book.sections.flatMap((s) => s.chants))
    .filter((chant) => occasionChants[id].test(chantSummary(chant).name))
  return { places, chants: [...new Set(chants)] }
}

/** A chant as a list or a search reads it, its name folded into words once. */
export type ChantEntry = {
  id: string
  name: string
  genre?: ChantGenre
  mode?: string
  words: string[]
}

/** Every chant of the catalog, ready to list and search. */
export function chantEntries(): ChantEntry[] {
  return getEntriesByKind('chant').map(([id]) => {
    const { name, genre, mode } = chantSummary(id)
    return { id, name, genre, mode, words: searchWords(fold(name)) }
  })
}

/**
 * The chants a query finds: by their name first (an incipit is how a chant is
 * known), then by any words of what they sing. `texts` is the corpus's
 * `chant-text/all`, already folded the way `normalizeForSearch` folds a query.
 */
export function searchChants(
  query: string,
  entries: ChantEntry[],
  texts: Record<string, string> | undefined,
): ChantEntry[] {
  const q = fold(query)
  const tokens = searchWords(q)
  if (!tokens.length) return []
  const byName = entries.filter((entry) => matchWords(entry.words, tokens) !== undefined)
  const named = new Set(byName)
  const byText = texts
    ? entries.filter((entry) => !named.has(entry) && texts[entry.id]?.includes(q))
    : []
  return [...byName, ...byText]
}

// Latin's ligatures spelled out, as scripts/build-corpus.py folds the chants' words.
function fold(text: string): string {
  return normalizeForSearch(
    text.replace(/æ/g, 'ae').replace(/Æ/g, 'Ae').replace(/œ/g, 'oe').replace(/Œ/g, 'Oe'),
  )
}
