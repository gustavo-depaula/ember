// Lectionary citations ("Lk 10:25-37", "Lc 10, 25-37") → the chapter in the
// site's Douay-Rheims, so the Mass of the day leads into the Bible. Only the
// book and chapter are read; an abbreviation not in the table gets no link.
import type { Locale } from './locale'

const shared: Record<string, string> = {
  gn: 'genesis',
  ex: 'exodus',
  lv: 'leviticus',
  nm: 'numbers',
  dt: 'deuteronomy',
  '1 sm': '1-kings',
  '2 sm': '2-kings',
  '1 sam': '1-kings',
  '2 sam': '2-kings',
  tb: 'tobias',
  est: 'esther',
  is: 'isaias',
  jer: 'jeremias',
  lam: 'lamentations',
  ez: 'ezechiel',
  dn: 'daniel',
  dan: 'daniel',
  am: 'amos',
  na: 'nahum',
  mt: 'matthew',
  rom: 'romans',
  '1 cor': '1-corinthians',
  '2 cor': '2-corinthians',
  gal: 'galatians',
  heb: 'hebrews',
  '1 tim': '1-timothy',
  '2 tim': '2-timothy',
  col: 'colossians',
  phil: 'philippians',
}

const tables: Record<Locale, Record<string, string>> = {
  'en-US': {
    ...shared,
    jos: 'josue',
    jgs: 'judges',
    ru: 'ruth',
    '1 kgs': '3-kings',
    '2 kgs': '4-kings',
    '1 chr': '1-paralipomenon',
    '2 chr': '2-paralipomenon',
    ezr: '1-esdras',
    neh: '2-esdras',
    jdt: 'judith',
    jb: 'job',
    ps: 'psalms',
    prv: 'proverbs',
    eccl: 'ecclesiastes',
    sg: 'canticles',
    wis: 'wisdom',
    sir: 'ecclesiasticus',
    bar: 'baruch',
    hos: 'osee',
    jl: 'joel',
    ob: 'abdias',
    jon: 'jonas',
    mi: 'micheas',
    hb: 'habacuc',
    zep: 'sophonias',
    hg: 'aggeus',
    zec: 'zacharias',
    mal: 'malachias',
    '1 mc': '1-machabees',
    '2 mc': '2-machabees',
    mk: 'mark',
    lk: 'luke',
    jn: 'john',
    john: 'john',
    acts: 'acts',
    eph: 'ephesians',
    '1 thess': '1-thessalonians',
    '2 thess': '2-thessalonians',
    ti: 'titus',
    phlm: 'philemon',
    jas: 'james',
    '1 pet': '1-peter',
    '2 pet': '2-peter',
    '1 jn': '1-john',
    '2 jn': '2-john',
    '3 jn': '3-john',
    jude: 'jude',
    rev: 'apocalypse',
  },
  'pt-BR': {
    ...shared,
    js: 'josue',
    jz: 'judges',
    rt: 'ruth',
    '1 rs': '3-kings',
    '2 rs': '4-kings',
    '1 cr': '1-paralipomenon',
    '2 cr': '2-paralipomenon',
    esd: '1-esdras',
    ne: '2-esdras',
    jt: 'judith',
    jó: 'job',
    sl: 'psalms',
    pr: 'proverbs',
    ecl: 'ecclesiastes',
    ct: 'canticles',
    sb: 'wisdom',
    eclo: 'ecclesiasticus',
    br: 'baruch',
    os: 'osee',
    jl: 'joel',
    joel: 'joel',
    ab: 'abdias',
    jn: 'jonas',
    mq: 'micheas',
    hab: 'habacuc',
    sf: 'sophonias',
    ag: 'aggeus',
    zc: 'zacharias',
    ml: 'malachias',
    '1 mac': '1-machabees',
    '2 mac': '2-machabees',
    mc: 'mark',
    lc: 'luke',
    jo: 'john',
    at: 'acts',
    rm: 'romans',
    ef: 'ephesians',
    fl: 'philippians',
    cl: 'colossians',
    '1 ts': '1-thessalonians',
    '2 ts': '2-thessalonians',
    tt: 'titus',
    fm: 'philemon',
    hebr: 'hebrews',
    tg: 'james',
    '1 pd': '1-peter',
    '2 pd': '2-peter',
    '1 jo': '1-john',
    '2 jo': '2-john',
    '3 jo': '3-john',
    jd: 'jude',
    ap: 'apocalypse',
  },
}

// The lectionary numbers the Psalms as the Hebrew does; the Douay-Rheims
// follows the Vulgate, one behind for most of the Psalter.
function vulgatePsalm(n: number): number {
  if (n >= 11 && n <= 113) return n - 1
  if (n === 114 || n === 115) return 113
  if (n === 116) return 114
  if (n >= 117 && n <= 146) return n - 1
  return n
}

// Chapters per book, for the books a citation can be misread in: a letter of
// one chapter is cited by verse alone ("Jude 17-23"), and Joel's fourth chapter
// in the Hebrew is the Vulgate's third.
const singleChapter = new Set(['abdias', 'philemon', '2-john', '3-john', 'jude'])
const chapterCount: Record<string, number> = {
  joel: 3,
  psalms: 150,
  philippians: 4,
  ecclesiastes: 12,
}

export type BibleRef = { book: string; chapter: number }

export function bibleRefFor(citation: string, locale: Locale): BibleRef | undefined {
  const match = /^\s*(?:cf\.\s*)?((?:[1-3]\s?)?[A-Za-zÀ-ÿ]+)\.?\s*(\d+)(?:\s*\((\d+)\))?/i.exec(
    citation,
  )
  if (!match) return undefined
  const key = match[1].toLowerCase().replace(/^([1-3])\s?/, '$1 ')
  const book = tables[locale][key]
  if (!book) return undefined
  if (singleChapter.has(book)) return { book, chapter: 1 }
  const chapter = Number(match[2])
  if (chapter > (chapterCount[book] ?? 150)) return undefined
  // "Ps 23(22)" already names the Vulgate number in parentheses.
  if (book === 'psalms')
    return { book, chapter: match[3] ? Number(match[3]) : vulgatePsalm(chapter) }
  return { book, chapter }
}
