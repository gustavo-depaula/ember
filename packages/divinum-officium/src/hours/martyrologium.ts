// Port of specprima.pl::martyrologium and the lunar-calendar helpers
// (_luna_table / _luna_day / _luna). Upstream replaced the old epact computus
// (gregor/luna) with the letter tables printed in the Martyrologia themselves.
// A day file is sectioned: [Titulus], a [Martyrologium] index of @-references
// that the version conditionals reorder and prune, and one section per elogium.

import { vero } from '../conditions/evaluate'
import { dateToYdays, getweek, leapyear, nextday } from '../kalendar/date'
import { sessionWithLang } from '../kalendar/officestring'
import { type Sections, setupstring } from '../references/resolve'
import { isSectioned } from '../types'
import type { HoursState } from './state'

const ordinals = [
  'prima',
  'secúnda',
  'tértia',
  'quarta',
  'quinta',
  'sexta',
  'séptima',
  'octáva',
  'nona',
  'décima',
  'undécima',
  'duodécima',
  'tértia décima',
  'quarta décima',
  'quinta décima',
  'sexta décima',
  'décima séptima',
  'duodevicésima',
  'undevicésima',
  'vicésima',
  'vicésima prima',
  'vicésima secúnda',
  'vicésima tértia',
  'vicésima quarta',
  'vicésima quinta',
  'vicésima sexta',
  'vicésima séptima',
  'vicésima octáva',
  'vicésima nona',
  'tricésima',
]

const ordinalsPt = [
  'primeira',
  'segunda',
  'terceira',
  'quarta',
  'quinta',
  'sexta',
  'sétima',
  'oitava',
  'nona',
  'décima',
  'undécima',
  'duodécima',
  'décima terceira',
  'décima quarta',
  'décima quinta',
  'décima sexta',
  'décima sétima',
  'décima oitava',
  'décima nona',
  'vigésima',
  'vigésima primeira',
  'vigésima segunda',
  'vigésima terceira',
  'vigésima quarta',
  'vigésima quinta',
  'vigésima sexta',
  'vigésima sétima',
  'vigésima oitava',
  'vigésima nona',
  'trigésima',
]

const monthsEn = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function numberSuffix(n: number): string {
  if (n > 3 && n < 21) return 'th'
  return n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'
}

// Perl's % is non-negative for a positive modulus; JS's is not.
function mod(a: number, b: number): number {
  return ((a % b) + b) % b
}

// 'R' is F black — the letter column headings of the Martyrologium tables.
const martyrologiumLetters = 'abcdefghiklmnpqrstuABCDERFGHMNP'

// Port of _luna_table — the luna day for a year-day + table letter, as in the
// tables printed in the Martyrologia.
export function lunaTable(yday: number, letter: string): number {
  const pos = martyrologiumLetters.indexOf(letter) + 1
  const m = yday < 36 ? 30 : (mod(yday - 35, 59) || 59) < 29 ? 29 : 30
  const cycleDay = mod(yday, 59)
  let i = cycleDay < 36 ? pos : pos - 1

  if (cycleDay < 36) {
    if (pos > 25) i -= 1
    if (pos === 25 && cycleDay === 35) i += 1
  } else if (pos > 25) {
    i -= 2
  }

  if (yday > 58) {
    if (pos > 25 && cycleDay < 5) i -= 1
    if (pos === 26 && cycleDay === 5) i -= 1
  }

  return mod(i - 1 + cycleDay, m) + 1
}

// Port of _luna_day — golden number → table letter → luna day.
export function lunaDay(month: number, day: number, year: number): number {
  // DO calls error() outside 1582–2300; those years never reach the engine.
  const letters4aurea =
    year < 1700
      ? 'amDdqGgtNkBbnEerHhu'
      : year < 1900
        ? 'PlCcpFfsMiAamDdqGgt'
        : year < 2200
          ? 'NkBbnEerHhuPlCcpRfs'
          : 'MiAamDdqGgtNkBbnEer'

  const aurNum = (year % 19) + 1
  const letter = letters4aurea[aurNum - 1]
  let yday = dateToYdays(day, month, year)
  // the table is a common year's: in a leap year the 24th and 25th of
  // February have the same moon, and every day after the 24th is a day
  // behind the table
  if (leapyear(year) && (month > 2 || (month === 2 && day > 24))) yday -= 1

  let luna = lunaTable(yday, letter)
  if (aurNum === 1 && month === 1 && letter !== 'P' && day + lunaTable(1, letter) < 32) luna -= 1
  return luna
}

// Port of _luna — the dated heading line. Only the Latin, Portuguese and the
// default (English) branches are ported; DO's other vernaculars are out of scope.
export function luna(month: number, day: number, year: number, lang: string): string {
  const lday = lunaDay(month, day, year)

  if (/Latin/i.test(lang)) {
    return `Luna ${ordinals[lday - 1]}. Anno Dómini ${year}\n`
  }
  if (/Portugues/.test(lang)) return `Lua ${ordinalsPt[lday - 1]}. Ano do Senhor de ${year}`
  return `${monthsEn[month - 1]} ${day}${numberSuffix(day)} ${year}, the ${lday}${numberSuffix(lday)} day of the Moon,`
}

// Port of _chomped. Trailing spaces on a line belong to the text.
function chomped(text: string | undefined): string {
  return text === undefined ? '' : text.replace(/\n+$/, '')
}

// Port of _deaccent — the 1570 martyrology is printed without accents.
function deaccent(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{Mn}/gu, '')
    .replace(/\u00e6/g, 'ae')
    .replace(/\u00c6/g, 'Ae')
    .replace(/\u0153/g, 'oe')
    .replace(/\u0152/g, 'Oe')
}

// Port of _elogia_lines: a section's lines, without the '=' that escapes a
// structural one.
function elogiaLines(text: string | undefined, plain: boolean): string[] {
  if (text === undefined || !/\S/.test(text)) return []
  return chomped(plain ? deaccent(text) : text)
    .split('\n')
    .map((l) => l.replace(/^=/, ''))
}

// Port of _elogia_chain: the languages that are a column's own — itself,
// and the parents of a hyphenated name.
function elogiaChain(lang: string): string[] {
  const out = [lang]
  for (let l = lang; /-[^-]+$/.test(l); ) {
    l = l.replace(/-[^-]+$/, '')
    out.push(l)
  }
  return out
}

const olderBook: Record<string, number> = { 1570: 1, 1617: 1, 1888: 2, 1906: 2 }

// Port of _elogia_book: which of the older books a section's condition is
// for — 1, Gregory XIII's (rubrica 1570, 1617); 2, Benedict XIV's (rubrica
// 1888, 1906), or the later when it names both; 0 when it names anything
// else. Without a condition, this version's book: 1, 2, or 3 after them.
function elogiaBook(state: HoursState, condition?: string): number {
  const ctx = state.day.ctx
  if (condition === undefined) {
    if (vero('rubrica 1570 aut rubrica 1617', ctx)) return 1
    return vero('rubrica 1888 aut rubrica 1906', ctx) ? 2 : 3
  }
  const books = [...condition.matchAll(/\brubrica\s+(\S+)/g)].map((m) => olderBook[m[1]] ?? 0)
  if (books.length === 0 || books.some((b) => !b)) return 0
  return Math.max(...books)
}

// Port of _unrubric: the text without its rubrics — a line that is nothing
// but a rubric goes, and a rubric inside a line goes with the space before it.
function unrubric(text: string): string {
  if (!/\/:/.test(text)) return text
  const end = /\n$/.test(text) ? '\n' : ''
  const lines = chomped(text)
    .split('\n')
    .filter((l) => !/^\s*\/:.*:\/\s*$/.test(l))
    .map((l) => l.replace(/\s*\/:.*?:\//g, ''))
  return lines.join('\n') + end
}

// Port of _elogia_latin_says: whether the Latin column, in this version,
// prints words for the entry.
async function elogiaLatinSays(state: HoursState, mmdd: string, key: string): Promise<boolean> {
  const latin = await setupstring(
    sessionWithLang(state.session, 'Latin'),
    `Martyrologium/${mmdd}`,
    {
      resolve: 'none',
    },
  )
  const text = latin?.[key]
  return text !== undefined && /\S/.test(text) && !/^\s*@\S+\s*$/.test(text)
}

// One wording of an entry: the section's condition ('' for a plain
// section) and its text (undefined for a blank section).
type Wording = [condition: string, text: string | undefined]

// Port of _elogia_own: every wording a language's own file gives each key,
// conditional sections included (setupstring keeps only the one that holds).
// Upstream scans the raw file with a looser header pattern than the section
// parser's, so the parsed sections are re-scanned line by line with it.
async function elogiaOwn(
  state: HoursState,
  lang: string,
  mmdd: string,
): Promise<Record<string, Wording[]>> {
  const own: Record<string, Wording[]> = {}
  const file = await state.session.loader.load(`horas/${lang}/Martyrologium/${mmdd}`)
  if (!file || !isSectioned(file)) return own

  let key: string | undefined
  let cond = ''
  let buf: string[] = []
  const flush = () => {
    if (key === undefined) return
    while (buf.length > 0 && !/\S/.test(buf[buf.length - 1])) buf.pop()
    own[key] ??= []
    own[key].push([cond, buf.length > 0 ? `${buf.join('\n')}\n` : undefined])
  }
  for (const section of file.sections) {
    if (section.name !== '__preamble') {
      flush()
      key = section.name
      cond = section.condition ?? ''
      buf = []
    }
    for (const line of section.lines) {
      const header = /^\s*\[([^\]]+)\]\s*(?:\((.*)\))?/.exec(line)
      if (header) {
        flush()
        key = header[1]
        cond = header[2] ?? ''
        buf = []
      } else if (key !== undefined) {
        buf.push(line)
      }
    }
  }
  flush()
  return own
}

// Port of _elogia_own_first: the entry's text from the nearest language that
// has one of its own. A column falls back as far as the reader's fallback
// language and stops, where setupstring would always end in the Latin — and
// the fallback fills only what the Latin itself says: an entry the Latin has
// no words for is some book's own, not every column's that falls back on it.
async function elogiaOwnFirst(
  state: HoursState,
  s: Sections,
  lang: string,
  mmdd: string,
  key: string,
): Promise<string | undefined> {
  const value = s[key]
  if (/^Latin/i.test(lang)) return value

  const ctx = state.day.ctx
  const fallbackLang = state.session.fallbackLang
  const chain = elogiaChain(lang)
  if (fallbackLang && !chain.includes(fallbackLang) && (await elogiaLatinSays(state, mmdd, key))) {
    chain.push(fallbackLang)
  }

  for (const layer of chain) {
    const all = (await elogiaOwn(state, layer, mmdd))[key] ?? []
    if (all.length === 0) continue

    // The wordings this version reads. When there is none: a plain section
    // left blank beside wordings for an older book is a translation not yet
    // brought up to date, and a later version reads the older wording; with
    // no plain section at all, a wording for none but the older books is
    // theirs alone and the fallback is read instead, while one for some
    // other book (another recension) is still given.
    let mine = all.filter(([c, t]) => t !== undefined && vero(c, ctx))
    const lent = mine.length === 0
    if (lent) {
      const blank = all.some(([c]) => c === '')
      const current = elogiaBook(state)
      mine = all.filter(([c, t]) => {
        const book = elogiaBook(state, c)
        return t !== undefined && (blank ? !book || book < current : !book)
      })
      if (mine.length === 0) continue
    }

    // a version's own wording takes the place of the plain one
    const qualified = mine.filter(([c]) => c !== '')
    const texts = (qualified.length > 0 ? qualified : mine).map(([, t]) => t as string)

    // setupstring settled on one of this layer's own wordings; compared
    // chomped because it keeps the blank line before the next section.
    let text = texts[0]
    if (value !== undefined && texts.some((t) => chomped(t) === chomped(value))) text = value

    // a rubric goes with the book whose wording it is in: the kneeling and
    // the Ave its ceremonies call for are not lent along with its words
    return lent ? unrubric(text) : text
  }
  return undefined
}

// Port of _elogia_entry: the text an index line points at — '@:Key' in this
// day, or '@Martyrologium/MM-DD:Key' in another one.
async function elogiaEntry(
  state: HoursState,
  s: Sections,
  lang: string,
  mmdd: string,
  line: string,
  seen = false,
): Promise<string | undefined> {
  let day: string
  let text: string | undefined
  const other = /^@(Martyrologium\/(\d\d-\d\d)):(.+)$/.exec(line)
  const here = /^@:(.+)$/.exec(line)
  if (other) {
    const sections = await setupstring(sessionWithLang(state.session, lang), other[1], {
      resolve: 'none',
    })
    if (!sections) return undefined
    day = other[2]
    text = await elogiaOwnFirst(state, sections, lang, other[2], other[3])
  } else if (here) {
    day = mmdd
    text = await elogiaOwnFirst(state, s, lang, mmdd, here[1])
  } else {
    return undefined
  }

  // A language's note pointing at another day is not a note of where the
  // entry is said on this one: its book says it here as well, in the words
  // it has given it there.
  const note = text === undefined ? null : /^\s*(@Martyrologium\/(\d\d-\d\d):\S+)\s*$/.exec(text)
  if (note && note[2] !== day && !seen) return elogiaEntry(state, s, lang, mmdd, note[1], true)
  return text
}

// What 'the same day' is said back to when it opens the heading with nothing
// above it to be the same as: the date line takes its place.
const unsameRules: Record<string, Array<[RegExp, (m: string[]) => string]>> = {
  English: [
    [/^(?:Upon|On) the same (?:the )?(\d.*?\b(?:was|were)) also\b/, (m) => `Upon the ${m[1]}`],
    [/^(?:Upon|On) the same (?:the )?(?=\d)/, () => 'Upon the '],
    [/^(Upon|On) the same day\b/, (m) => `${m[1]} the morrow`],
    [/^(Upon|On) the morrow also\b/, (m) => `${m[1]} the morrow`],
  ],
  Francais: [[/^Le même (?=\d)/, () => 'Le ']],
}

// Port of _unsame.
function unsame(line: string, lang: string): string {
  for (const [re, to] of unsameRules[lang.replace(/-.*$/, '')] ?? []) {
    const m = re.exec(line)
    if (m) return line.replace(re, () => to(m))
  }
  return line
}

// Port of _heading: the day's title, which may call for entries by name (the
// feast announced above the rule). The call is answered only while the index
// still keeps that entry at the head of the day; `index` is emptied of
// whatever the title took, so nothing is said twice.
async function heading(
  state: HoursState,
  s: Sections,
  lang: string,
  mmdd: string,
  plain: boolean,
  index: string[],
): Promise<string[]> {
  const title = (s.Titulus ?? '').split('\n')
  const out: string[] = []
  let at = 0

  const said = async (i: number): Promise<string[]> =>
    index[i].startsWith('@')
      ? elogiaLines(await elogiaEntry(state, s, lang, mmdd, index[i]), plain)
      : elogiaLines(index[i], plain)

  titleLines: for (const line of title) {
    if (!line.startsWith('@')) {
      out.push(...elogiaLines(line, plain))
      continue
    }
    const want = line.replace(/\s+$/, '')
    const where = index.findIndex((l, i) => i >= at && l.replace(/\s+$/, '') === want)
    // A version that has not the entry has no feast to announce.
    if (where < 0) continue
    // A version that moved it down among the elogia: 'upon the same day' has
    // nothing left to be about. Entries that print nothing are stepped over.
    for (let i = at; i < where; i++) {
      if ((await said(i)).length > 0) break titleLines
    }
    out.push(...(await said(where)))
    at = where + 1
  }
  index.splice(0, at)
  if (out.length > 0) out[0] = unsame(out[0], lang)
  return out
}

// Port of martyrologium_elogia: the day's lines — the title, the separator,
// then the entries named by the [Martyrologium] index in its order. The index
// is resolved here rather than by setupstring so an entry the Latin never
// carried can still be listed.
async function martyrologiumElogia(
  state: HoursState,
  lang: string,
  mmdd: string,
): Promise<string[]> {
  const s = await setupstring(sessionWithLang(state.session, lang), `Martyrologium/${mmdd}`, {
    resolve: 'none',
  })
  if (!s || s.Martyrologium === undefined) return []

  const plain = /^Latin/i.test(lang) && /1570/.test(state.day.ctx.version)
  const index = s.Martyrologium.split('\n').filter((l) => /\S/.test(l))
  const lines = await heading(state, s, lang, mmdd, plain, index)

  const entries: string[] = []
  for (const line of index) {
    // A line that is not a reference is text in its own right.
    if (!line.startsWith('@')) {
      entries.push(...elogiaLines(line, plain))
      continue
    }
    const text = await elogiaEntry(state, s, lang, mmdd, line)
    // A language whose book says this entry inside another one keeps a note
    // of where instead of a translation; the words are already on the page.
    if (text !== undefined && /^\s*@\S+\s*$/.test(text)) continue
    entries.push(...elogiaLines(text, plain))
  }
  if (entries.length === 0) return lines
  if (lines.length === 0) return entries

  const sep = s.Separatio !== undefined ? chomped(s.Separatio) : '_'
  if (sep !== '') lines.push(sep)
  return [...lines, ...entries]
}

// FINDDATE: each language's printed date, replaced by (or joined to) the luna
// line. Tried in upstream's order on every line, whatever the language.
function replaceDate(line: string, lunaStr: string): string | undefined {
  const lower = lunaStr.charAt(0).toLowerCase() + lunaStr.slice(1)
  const rules: Array<[RegExp, (m: string[]) => string]> = [
    [/^(?:Upon|On) the \d+ ?.. day of \S+/i, () => `${lunaStr} `],
    [/^\d+\. (?:\(\d+.\) )?\S+/, () => lunaStr],
    [/^\d+ de \S+/i, () => lunaStr],
    [/^(Le(?: même)? \d+ .*?,)/i, (m) => `${m[1]} ${lower}, `],
    [
      /^((?:Le \d+ des|La veille des|Aux) (?:ides|calendes|nones).*?)[ \t]*$/i,
      (m) => `${m[1]}, ${lower}`,
    ],
    [/^((?:Nas?|Nos?) .*(?:Calendas|Nonas|Idos) de \S+\.)$/, (m) => `${m[1]} ${lunaStr}`],
  ]
  for (const [re, to] of rules) {
    const m = re.exec(line)
    if (m) return line.replace(re, () => to(m))
  }
  return undefined
}

// Port of martyrologium($lang).
export async function martyrologium(state: HoursState, lang: string): Promise<string> {
  const ctx = state.day.ctx
  const { version, year, month, day, dayofweek } = ctx

  let mobileKey = `${getweek(day, month, year, true)}-${(dayofweek + 1) % 7}`
  if (
    !/1570|1617|1888|1910/.test(version) &&
    month === 10 &&
    dayofweek === 6 &&
    day > 23 &&
    day < 31
  ) {
    mobileKey = '10-DU'
  }
  if (/ex C9/i.test(state.day.winnerSections.Rank ?? '')) mobileKey = 'Defuncti'
  if (month === 11 && day === 14 && /Monastic/.test(version)) mobileKey = 'DefunctiM'
  const mobileFile =
    (await setupstring(sessionWithLang(state.session, lang), 'Martyrologium/Mobile')) ?? {}
  const mobile = mobileFile[mobileKey]

  const [mStr, dStr] = nextday(month, day, year).split('-')
  const m = Number(mStr)
  const d = Number(dStr)

  const lines = await martyrologiumElogia(state, lang, `${mStr}-${dStr}`)
  let output = ''

  // a translation whose book announces no title, on a day this version
  // gives nothing to say but the closing line, still gives the date
  if (lines.length > 0 || !/^Latin/i.test(lang)) {
    // the moon and the date are the calendar's, not the file's: in a leap
    // year the 24th of February is read from 02-29 and the days after it
    // from the file before (see get_sday)
    const ld = m === 2 && d >= 24 && leapyear(year) ? (d === 29 ? 24 : d + 1) : d
    const lunaStr = luna(m, ld, m === 1 && d === 1 ? year + 1 : year, lang)

    // A heading that names the day of the month names the file's day. Only
    // the heading: an elogium may name some other date.
    if (ld !== d) {
      const dayOfFebruary = new RegExp(`\\b${d}(?:st|nd|rd|th)( day of February)`)
      for (let i = 0; i < lines.length; i++) {
        if (/^\s*_\s*$/.test(lines[i])) break
        lines[i] = lines[i].replace(dayOfFebruary, `${ld}${numberSuffix(ld)}$1`)
      }
    }

    if (/Latin/i.test(lang)) {
      lines[0] += ` ${lunaStr}`
    } else {
      // When no date line is found (the loop falls through, including on the
      // first '_' separator), the luna line is prepended instead.
      let found = false
      for (let i = 0; i < lines.length; i++) {
        const replaced = replaceDate(lines[i], lunaStr)
        if (replaced !== undefined) {
          lines[i] = replaced
          found = true
          break
        }
        if (/^\s*_\s*/.test(lines[i])) break
      }
      if (!found) lines.unshift(lunaStr, '_\n')
    }

    output = `${lines.map((l) => (l.length > 4 && !/^\/:/.test(l) ? `r. ${l}` : l)).join('\n')}\n`
    output = output.replace(/^r/, 'v')
    if (mobile && /\S/.test(mobile)) output = output.replace('_', () => `r. ${mobile}`)
    output = output.replace(/_\n/g, '')
    if (lang === 'Latin-gabc') output = `${lines.join('\n')}\n`
  }

  return output + (await state.texts.prayer('Conclmart', lang))
}
