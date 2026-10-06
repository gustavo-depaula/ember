// Every page of the site, as data. The catch-all route builds from this list,
// and so do the sitemap and each page's hreflang links, so a page cannot exist
// without being reachable and declared.
import { getEntry } from '@/content/contentIndex'
import { getDrbBooks } from '@/lib/content'
import { listBookNodes, listBooks } from '~/lib/books'
import { isLocalized, listEntries } from '~/lib/catalog'
import { bootCorpus } from '~/lib/corpus'
import { calendarYears, liturgyDates } from '~/lib/dates'
import { officeDates, officeForms } from '~/lib/liturgy'
import { type Locale, locales } from '~/lib/locale'
import { indexedChurches, places } from '~/lib/massTimes/data'
import { listPrayers } from '~/lib/prayers'
import { saintsCatalog } from '~/lib/saints'
import { today } from '~/lib/today'
import { href, isoDate, type OfficeHour, officeHours } from '~/routes'

export type Page =
  | { view: 'home' }
  | { view: 'library' }
  | { view: 'prayers' }
  | { view: 'prayer'; id: string; day?: number }
  | { view: 'collections' }
  | { view: 'collection'; id: string }
  | { view: 'books' }
  | { view: 'book'; id: string }
  | { view: 'chapter'; id: string; nodeId: string }
  | { view: 'reading'; id: string }
  | { view: 'bible' }
  | { view: 'bibleBook'; book: string }
  | { view: 'bibleChapter'; book: string; chapter: number }
  | { view: 'saints' }
  | { view: 'saint'; id: string }
  | { view: 'calendarMonth'; year: number; month: number }
  | { view: 'calendarDay'; date: string }
  | { view: 'mass'; date: string; today?: boolean }
  | { view: 'latinMass'; date: string; today?: boolean }
  | { view: 'office'; date: string; hour?: OfficeHour; today?: boolean; form?: string }
  | { view: 'massTimes' }
  | { view: 'churchShell' }
  | { view: 'church'; id: string }
  | { view: 'place'; country: string; place: string }
  | { view: 'search' }
  | { view: 'plans' }
  | { view: 'plan'; id: string }
  | { view: 'voices' }

export type PageEntry = {
  locale: Locale
  path: string
  page: Page
  /** The page's path in each locale where it is a page in its own right. */
  alternates: Partial<Record<Locale, string>>
  /** Set when this locale only mirrors another's content: search engines credit that one. */
  canonical?: string
}

type Draft = {
  page: Page
  path: (locale: Locale) => string
  /** Locales the page is generated in. Defaults to both. */
  locales?: readonly Locale[]
  /** Whether the corpus has this content in the locale's own language. Defaults to yes. */
  localized?: (locale: Locale) => boolean
}

function catalogDraft(page: Page, id: string, path: (locale: Locale) => string): Draft {
  const entry = getEntry(id)
  return { page, path, localized: (l) => (entry ? isLocalized(entry, l) : true) }
}

async function drafts(): Promise<Draft[]> {
  await bootCorpus()
  const out: Draft[] = [
    { page: { view: 'home' }, path: href.home },
    { page: { view: 'library' }, path: (l) => href.section(l, 'library') },
    { page: { view: 'prayers' }, path: (l) => href.section(l, 'prayers') },
    { page: { view: 'collections' }, path: (l) => href.section(l, 'collections') },
    { page: { view: 'books' }, path: (l) => href.section(l, 'books') },
  ]
  for (const prayer of await listPrayers()) {
    out.push(
      catalogDraft({ view: 'prayer', id: prayer.id }, prayer.id, (l) => href.prayer(l, prayer.id)),
    )
    for (let day = 1; day <= prayer.dayCount; day++) {
      out.push(
        catalogDraft({ view: 'prayer', id: prayer.id, day }, prayer.id, (l) =>
          href.prayerDay(l, prayer.id, day),
        ),
      )
    }
  }
  for (const [id] of listEntries('collection')) {
    out.push(catalogDraft({ view: 'collection', id }, id, (l) => href.collection(l, id)))
  }
  for (const [id] of listEntries('chapter')) {
    out.push(catalogDraft({ view: 'reading', id }, id, (l) => href.reading(l, id)))
  }
  for (const book of await listBooks()) {
    if (bookFilter && !bookFilter.has(book.id)) continue
    out.push(catalogDraft({ view: 'book', id: book.id }, book.id, (l) => href.book(l, book.id)))
    for (const locale of locales) {
      for (const node of await listBookNodes(book.id, locale)) {
        out.push({
          page: { view: 'chapter', id: book.id, nodeId: node.nodeId },
          locales: [locale],
          path: (l) => href.bookChapter(l, book.id, node.nodeId),
        })
      }
    }
  }

  out.push({ page: { view: 'bible' }, path: (l) => href.section(l, 'bible') })
  // Scripture is the Douay-Rheims, in English: its pages live under English only.
  for (const book of await getDrbBooks()) {
    out.push({
      page: { view: 'bibleBook', book: book.id },
      locales: ['en-US'],
      path: (l) => href.bibleBook(l, book.id),
    })
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      out.push({
        page: { view: 'bibleChapter', book: book.id, chapter },
        locales: ['en-US'],
        path: (l) => href.bibleChapter(l, book.id, chapter),
      })
    }
  }

  out.push({ page: { view: 'saints' }, path: (l) => href.section(l, 'saints') })
  for (const saint of (await saintsCatalog('en-US')).saints) {
    out.push({ page: { view: 'saint', id: saint.id }, path: (l) => href.saint(l, saint.id) })
  }

  const iso = isoDate(today)
  out.push({
    page: { view: 'calendarMonth', year: today.getFullYear(), month: today.getMonth() + 1 },
    path: (l) => href.section(l, 'calendar'),
  })
  for (const year of calendarYears()) {
    for (let month = 1; month <= 12; month++) {
      out.push({
        page: { view: 'calendarMonth', year, month },
        path: (l) => href.calendarMonth(l, year, month),
      })
      const days = new Date(year, month, 0).getDate()
      for (let day = 1; day <= days; day++) {
        const date = new Date(year, month - 1, day)
        out.push({
          page: { view: 'calendarDay', date: isoDate(date) },
          path: (l) => href.calendarDay(l, date),
        })
      }
    }
  }

  out.push({ page: { view: 'mass', date: iso, today: true }, path: (l) => href.mass(l) })
  out.push({ page: { view: 'latinMass', date: iso, today: true }, path: (l) => href.latinMass(l) })
  for (const date of liturgyDates()) {
    const d = isoDate(date)
    out.push({ page: { view: 'mass', date: d }, path: (l) => href.mass(l, date) })
    out.push({ page: { view: 'latinMass', date: d }, path: (l) => href.latinMass(l, date) })
  }
  // The forms are the same in every language; only their names differ.
  for (const form of await officeForms('en-US')) {
    const slug = form.slug
    out.push({
      page: { view: 'office', date: iso, today: true, form: slug },
      path: (l) => href.office(l, undefined, undefined, slug),
    })
    for (const date of officeDates(form)) {
      const d = isoDate(date)
      out.push({
        page: { view: 'office', date: d, form: slug },
        path: (l) => href.office(l, date, undefined, slug),
      })
      for (const hour of officeHours) {
        out.push({
          page: { view: 'office', date: d, hour, form: slug },
          path: (l) => href.office(l, date, hour, slug),
        })
      }
    }
  }

  out.push({ page: { view: 'massTimes' }, path: (l) => href.section(l, 'massTimes') })
  out.push({
    page: { view: 'churchShell' },
    path: (l) => href.massTimesPlace(l, l === 'pt-BR' ? 'igreja' : 'church'),
  })
  for (const church of await indexedChurches()) {
    out.push({ page: { view: 'church', id: church.id }, path: (l) => href.church(l, church.id) })
  }
  for (const place of await places()) {
    out.push({
      page: { view: 'place', country: place.country, place: place.slug },
      path: (l) => href.massTimesPlace(l, place.country, place.slug),
    })
  }

  out.push({ page: { view: 'search' }, path: (l) => href.section(l, 'search') })
  out.push({ page: { view: 'plans' }, path: (l) => href.section(l, 'plans') })
  for (const [id] of listEntries('plan-of-life-template')) {
    out.push(catalogDraft({ view: 'plan', id }, id, (l) => href.plan(l, id)))
  }
  out.push({ page: { view: 'voices' }, path: (l) => href.section(l, 'voices') })
  return out
}

// EMBER_SITE_BOOKS=a,b limits the build to those books' chapters: the full
// library is some 40,000 pages, more than a design iteration needs.
const bookFilter = process.env.EMBER_SITE_BOOKS
  ? new Set(process.env.EMBER_SITE_BOOKS.split(',').map((id) => `book/${id.trim()}`))
  : undefined

function resolve(draft: Draft): PageEntry[] {
  const generated = draft.locales ?? locales
  const localized = generated.filter((l) => draft.localized?.(l) ?? true)
  // Content in neither site language (a Latin or Italian original) lives under English.
  const own = localized.length ? localized : generated.filter((l) => l === 'en-US')
  const home = own[0] ?? generated[0]
  const alternates = Object.fromEntries(own.map((l) => [l, draft.path(l)]))
  return generated.map((locale) => ({
    locale,
    path: draft.path(locale),
    page: draft.page,
    alternates: own.includes(locale) ? alternates : { [locale]: draft.path(locale) },
    canonical: own.includes(locale) ? undefined : draft.path(home),
  }))
}

let cached: Promise<PageEntry[]> | undefined

export function listPages(): Promise<PageEntry[]> {
  cached ??= drafts().then((all) => all.flatMap(resolve))
  return cached
}
