// Port of specprima.pl::martyrologium and the lunar-calendar helpers
// (_luna_table / _luna_day / _luna). Upstream replaced the old epact computus
// (gregor/luna) with the letter tables printed in the Martyrologia themselves.
// The day files are plain (do_read); Mobile.txt is sectioned.

import { dateToYdays, getweek, leapyear, nextday } from '../kalendar/date'
import { sessionWithLang } from '../kalendar/officestring'
import { setupstring } from '../references/resolve'
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
  if (leapyear(year) && (month > 2 || (month === 2 && day > 23))) yday -= 1

  let luna = lunaTable(yday, letter)
  if (aurNum === 1 && month === 1 && letter !== 'P' && day + lunaTable(1, letter) < 32) luna -= 1
  return luna
}

// Port of _luna — the dated heading line. Only the Latin and the default
// (English) branches are ported; DO's other vernaculars are out of v1 scope.
export function luna(month: number, day: number, year: number, lang: string): string {
  const lday = lunaDay(month, day, year)

  if (/Latin/i.test(lang)) {
    return `Luna ${ordinals[lday - 1]}. Anno Dómini ${year}\n`
  }
  return `${monthsEn[month - 1]} ${day}${numberSuffix(day)} ${year}, the ${lday}${numberSuffix(lday)} day of the Moon,`
}

// Read a plain Martyrologium day file with the per-file language fallback.
async function readMartyrologiumLines(
  state: HoursState,
  path: string,
  lang: string,
): Promise<string[]> {
  for (const l of [lang, state.session.fallbackLang, 'Latin']) {
    const file = await state.session.loader.load(`horas/${l}/${path}`)
    if (!file) continue
    if (isSectioned(file)) continue
    const lines = [...file.lines]
    while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
    return lines
  }
  return []
}

// Port of martyrologium($lang).
export async function martyrologium(state: HoursState, lang: string): Promise<string> {
  const ctx = state.day.ctx
  const { version, year, month, day, dayofweek } = ctx

  // Upstream picks the version's Martyrologium dir and falls back to the base
  // one when that dir doesn't exist for this language. Only Latin carries the
  // variants, so the probe is on the dir's Mobile file.
  let dir = 'Martyrologium'
  if (/1570/.test(version)) dir += '1570'
  if (/1960|Newcal/.test(version)) dir += '1960'
  if (/1955/.test(version)) dir += '1955R'
  if (
    dir !== 'Martyrologium' &&
    !(await state.session.loader.exists(`horas/${lang}/${dir}/Mobile`))
  ) {
    dir = 'Martyrologium'
  }

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
    (await setupstring(sessionWithLang(state.session, lang), `${dir}/Mobile`)) ?? {}
  const mobile = mobileFile[mobileKey]

  const [mStr, dStr] = nextday(month, day, year).split('-')
  const m = Number(mStr)
  const d = Number(dStr)
  const fname = `${mStr}-${dStr}`

  let path = `${dir}/${fname}`
  if (!(await state.session.loader.exists(`horas/${lang}/${path}`))) {
    path = `Martyrologium/${fname}`
  }

  const lines = await readMartyrologiumLines(state, path, lang)
  let output = ''

  if (lines.length > 0) {
    const lunaStr = luna(m, d, m === 1 && d === 1 ? year + 1 : year, lang)

    if (/Latin/i.test(lang)) {
      lines[0] += ` ${lunaStr}`
    } else {
      // FINDDATE: replace the printed date with the luna line; when no date
      // line is found (the loop falls through, including on the first '_'
      // separator), prepend it instead.
      const dateLine = /^Upon the \d+ ?.. day of \S+/i
      let found = false
      for (let i = 0; i < lines.length; i++) {
        if (dateLine.test(lines[i])) {
          lines[i] = lines[i].replace(dateLine, `${lunaStr} `)
          found = true
          break
        }
        if (/^\s*_\s*/.test(lines[i])) break
      }
      if (!found) lines.unshift(lunaStr, '_\n')
    }

    output = `${lines.map((l) => (l.length > 4 && !/^\/:/.test(l) ? `r. ${l}` : l)).join('\n')}\n`
    output = output.replace(/^r/, 'v')
    if (mobile) output = output.replace('_', () => `r. ${mobile}`)
    output = output.replace(/_\n/g, '')
  }

  return output + (await state.texts.prayer('Conclmart', lang))
}
