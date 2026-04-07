import type { ReadingReference } from '@/lib/liturgical'

export type BookNameResolver = (slug: string) => string

const bookAbbreviations: Record<string, string> = {
  // OT — Pentateuch
  gen: 'genesis',
  ex: 'exodus',
  lev: 'leviticus',
  num: 'numbers',
  deut: 'deuteronomy',
  // OT — Historical
  josh: 'josue',
  judg: 'judges',
  ruth: 'ruth',
  '1sam': '1-kings',
  '2sam': '2-kings',
  '1kgs': '3-kings',
  '2kgs': '4-kings',
  '1chr': '1-paralipomenon',
  '2chr': '2-paralipomenon',
  ezra: '1-esdras',
  neh: '2-esdras',
  tob: 'tobias',
  jdt: 'judith',
  esth: 'esther',
  '1mac': '1-machabees',
  '2mac': '2-machabees',
  // OT — Wisdom
  job: 'job',
  ps: 'psalms',
  prov: 'proverbs',
  eccl: 'ecclesiastes',
  song: 'canticles',
  wis: 'wisdom',
  sir: 'ecclesiasticus',
  // OT — Prophets
  isa: 'isaias',
  jer: 'jeremias',
  lam: 'lamentations',
  bar: 'baruch',
  ezek: 'ezechiel',
  dan: 'daniel',
  hos: 'osee',
  joel: 'joel',
  amos: 'amos',
  obad: 'abdias',
  jonah: 'jonas',
  mic: 'micheas',
  nah: 'nahum',
  hab: 'habacuc',
  zeph: 'sophonias',
  hag: 'aggeus',
  zech: 'zacharias',
  mal: 'malachias',
  // NT — Gospels & Acts
  matt: 'matthew',
  mk: 'mark',
  lk: 'luke',
  jn: 'john',
  acts: 'acts',
  // NT — Pauline
  rom: 'romans',
  '1cor': '1-corinthians',
  '2cor': '2-corinthians',
  gal: 'galatians',
  eph: 'ephesians',
  phil: 'philippians',
  col: 'colossians',
  '1thess': '1-thessalonians',
  '2thess': '2-thessalonians',
  '1tim': '1-timothy',
  '2tim': '2-timothy',
  tit: 'titus',
  phlm: 'philemon',
  heb: 'hebrews',
  // NT — Catholic Epistles & Apocalypse
  jas: 'james',
  '1pet': '1-peter',
  '2pet': '2-peter',
  '1jn': '1-john',
  '2jn': '2-john',
  '3jn': '3-john',
  jude: 'jude',
  rev: 'apocalypse',
}

// Reverse map: slug → abbreviation
const slugToAbbrev: Record<string, string> = {}
for (const [abbr, slug] of Object.entries(bookAbbreviations)) {
  slugToAbbrev[slug] = abbr
}

function resolveBookSlug(abbr: string): string {
  return bookAbbreviations[abbr] ?? abbr
}

type BibleReference = Extract<ReadingReference, { type: 'bible' }>

function parseBiblePassage(passage: string, resolve: BookNameResolver): BibleReference {
  const trimmed = passage.trim()
  const match = trimmed.match(/^([\w-]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/)
  if (!match) {
    return { type: 'bible', book: trimmed, bookName: trimmed, chapter: 1 }
  }
  const slug = resolveBookSlug(match[1])
  const chapter = Number(match[2])
  const startVerse = match[3] ? Number(match[3]) : undefined
  const endVerse = match[4] ? Number(match[4]) : undefined
  return { type: 'bible', book: slug, bookName: resolve(slug), chapter, startVerse, endVerse }
}

export function parseTrackEntry(
  source: 'bible' | 'catechism',
  entry: string,
  bookName: BookNameResolver = (s) => s,
): ReadingReference[] {
  if (source === 'catechism') {
    const [start, end] = entry.split('-').map(Number)
    return [{ type: 'catechism', startParagraph: start, count: end - start + 1 }]
  }
  return entry.split(';').map((p) => parseBiblePassage(p, bookName))
}

export function formatVerseRange(startVerse?: number, endVerse?: number): string {
  if (startVerse === undefined) return ''
  if (endVerse !== undefined) return `:${startVerse}-${endVerse}`
  return `:${startVerse}`
}

export function formatTrackEntry(
  source: 'bible' | 'catechism',
  entry: string,
  bookName: BookNameResolver = (s) => s,
): string {
  if (source === 'catechism') {
    const [start, end] = entry.split('-').map(Number)
    return `CCC §${start}-${end}`
  }
  return entry
    .split(';')
    .map((p) => {
      const ref = parseBiblePassage(p.trim(), bookName)
      return `${ref.bookName} ${ref.chapter}${formatVerseRange(ref.startVerse, ref.endVerse)}`
    })
    .join('; ')
}

export function findEntryIndex(
  source: 'bible' | 'catechism',
  entries: string[],
  currentBook: string,
  currentChapter: number,
): number {
  if (source === 'catechism') {
    for (let i = 0; i < entries.length; i++) {
      const [start, end] = entries[i].split('-').map(Number)
      if (currentChapter >= start && currentChapter <= end) return i
    }
    return 0
  }
  const abbr = slugToAbbrev[currentBook] ?? currentBook
  const target = `${abbr} ${currentChapter}`
  const idx = entries.indexOf(target)
  if (idx >= 0) return idx
  for (let i = 0; i < entries.length; i++) {
    const refs = parseTrackEntry(source, entries[i])
    if (
      refs.some((r) => r.type === 'bible' && r.book === currentBook && r.chapter === currentChapter)
    )
      return i
  }
  return 0
}
