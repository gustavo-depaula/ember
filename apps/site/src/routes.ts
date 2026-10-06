// The site's URL space. Section names are localized (`/prayers/`, `/pt/oracoes/`);
// item slugs are the corpus ids the app uses (`rosary`, `kempis-imitation-of-christ`),
// so a link, a saved item or a reading position means the same thing in both.
import { type Locale, localePrefix } from './lib/locale'

const sections = {
  'en-US': {
    prayers: 'prayers',
    collections: 'collections',
    books: 'books',
    readings: 'readings',
    bible: 'bible',
    saints: 'saints',
    calendar: 'calendar',
    mass: 'mass',
    latinMass: 'latin-mass',
    office: 'divine-office',
    massTimes: 'mass-times',
    plans: 'plans-of-life',
    voices: 'voices',
    search: 'search',
    library: 'library',
    day: 'day',
  },
  'pt-BR': {
    prayers: 'oracoes',
    collections: 'colecoes',
    books: 'livros',
    readings: 'leituras',
    bible: 'biblia',
    saints: 'santos',
    calendar: 'calendario',
    mass: 'missa',
    latinMass: 'missa-tridentina',
    office: 'oficio-divino',
    massTimes: 'horarios-de-missa',
    plans: 'planos-de-vida',
    voices: 'vozes',
    search: 'busca',
    library: 'biblioteca',
    day: 'dia',
  },
} as const satisfies Record<Locale, Record<string, string>>

export type Section = keyof (typeof sections)['en-US']

export const officeHours = [
  'Matutinum',
  'Laudes',
  'Prima',
  'Tertia',
  'Sexta',
  'Nona',
  'Vespera',
  'Completorium',
] as const
export type OfficeHour = (typeof officeHours)[number]

const hourSlugs: Record<Locale, Record<OfficeHour, string>> = {
  'en-US': {
    Matutinum: 'matins',
    Laudes: 'lauds',
    Prima: 'prime',
    Tertia: 'terce',
    Sexta: 'sext',
    Nona: 'none',
    Vespera: 'vespers',
    Completorium: 'compline',
  },
  'pt-BR': {
    Matutinum: 'matinas',
    Laudes: 'laudes',
    Prima: 'prima',
    Tertia: 'terca',
    Sexta: 'sexta',
    Nona: 'noa',
    Vespera: 'vesperas',
    Completorium: 'completas',
  },
}

function join(locale: Locale, ...parts: (string | number | undefined)[]): string {
  const path = parts.filter((p) => p !== undefined && p !== '').join('/')
  return `${localePrefix[locale]}/${path}${path ? '/' : ''}`
}

/** Corpus ids are `kind/slug`; URLs carry the slug. */
export function slugOf(id: string): string {
  const slash = id.indexOf('/')
  return slash === -1 ? id : id.slice(slash + 1)
}

export function isoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const href = {
  home: (l: Locale) => join(l),
  /**
   * The page that presents the app (apps/hearth), published at `/app/`. It
   * holds both languages and opens in the one asked for.
   */
  landing: (l: Locale) => (l === 'pt-BR' ? '/app/?lang=pt' : '/app/'),
  privacy: () => '/privacy.html',
  section: (l: Locale, section: Section) => join(l, sections[l][section]),
  prayer: (l: Locale, id: string) => join(l, sections[l].prayers, slugOf(id)),
  prayerDay: (l: Locale, id: string, day: number) =>
    join(l, sections[l].prayers, slugOf(id), `${sections[l].day}-${day}`),
  collection: (l: Locale, id: string) => join(l, sections[l].collections, slugOf(id)),
  book: (l: Locale, id: string) => join(l, sections[l].books, slugOf(id)),
  bookChapter: (l: Locale, id: string, chapter: string) =>
    join(l, sections[l].books, slugOf(id), chapter),
  reading: (l: Locale, id: string) => join(l, sections[l].readings, slugOf(id)),
  bibleBook: (l: Locale, book: string) => join(l, sections[l].bible, book),
  bibleChapter: (l: Locale, book: string, chapter: number) =>
    join(l, sections[l].bible, book, chapter),
  saint: (l: Locale, id: string) => join(l, sections[l].saints, id.replaceAll('_', '-')),
  calendarMonth: (l: Locale, year: number, month: number) =>
    join(l, sections[l].calendar, year, String(month).padStart(2, '0')),
  calendarDay: (l: Locale, date: Date) => join(l, sections[l].calendar, isoDate(date)),
  mass: (l: Locale, date?: Date) => join(l, sections[l].mass, date && isoDate(date)),
  latinMass: (l: Locale, date?: Date) => join(l, sections[l].latinMass, date && isoDate(date)),
  office: (l: Locale, date?: Date, hour?: OfficeHour) =>
    join(l, sections[l].office, date && isoDate(date), hour && hourSlugs[l][hour]),
  massTimesPlace: (l: Locale, ...place: string[]) => join(l, sections[l].massTimes, ...place),
  church: (l: Locale, id: string) =>
    join(l, sections[l].massTimes, l === 'pt-BR' ? 'igreja' : 'church', id),
  plan: (l: Locale, id: string) => join(l, sections[l].plans, slugOf(id)),
  voice: (l: Locale, id: string) => join(l, sections[l].voices, slugOf(id)),
}

/** The page for a corpus ref (`practice/rosary`, `book/x#chapter`), if the site has one. */
export function hrefForRef(l: Locale, ref: string): string | undefined {
  const [id, fragment] = ref.split('#')
  const kind = id.slice(0, id.indexOf('/'))
  if (kind === 'practice') return href.prayer(l, id)
  if (kind === 'collection') return href.collection(l, id)
  if (kind === 'chapter') return href.reading(l, id)
  if (kind === 'book') return fragment ? href.bookChapter(l, id, fragment) : href.book(l, id)
  if (kind === 'plan-of-life-template') return href.plan(l, id)
  if (kind === 'creator') return href.voice(l, id)
  return undefined
}

export const hourNames: Record<Locale, Record<OfficeHour, string>> = {
  'en-US': {
    Matutinum: 'Matins',
    Laudes: 'Lauds',
    Prima: 'Prime',
    Tertia: 'Terce',
    Sexta: 'Sext',
    Nona: 'None',
    Vespera: 'Vespers',
    Completorium: 'Compline',
  },
  'pt-BR': {
    Matutinum: 'Matinas',
    Laudes: 'Laudes',
    Prima: 'Prima',
    Tertia: 'Terça',
    Sexta: 'Sexta',
    Nona: 'Noa',
    Vespera: 'Vésperas',
    Completorium: 'Completas',
  },
}
