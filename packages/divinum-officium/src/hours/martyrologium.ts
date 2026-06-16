// Port of specprima.pl::martyrologium + the lunar-calendar helpers gregor()
// and luna(). The day files are plain (do_read); Mobile.txt is sectioned.

import { getweek, leapyear, nextday } from '../kalendar/date'
import { sessionWithLang } from '../kalendar/officestring'
import { setupstring } from '../references/resolve'
import { isSectioned } from '../types'
import type { HoursState } from './state'

// Perl date_to_days: days since the 1970-01-01 epoch (proleptic Gregorian).
// Month is 0-based, mirroring the Perl callers.
function dateToDays(d: number, m: number, y: number): number {
  return Math.floor(Date.UTC(y, m, d, 12) / 86400000)
}

// 0-based day of year (Perl localtime yday).
function yday0(d: number, m: number, y: number): number {
  return dateToDays(d, m, y) - dateToDays(1, 0, y)
}

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

function ordinalSuffix(n: number, fullRange = true): string {
  if (fullRange && n > 3 && n < 21) return 'th'
  return n % 10 === 1 ? 'st' : n % 10 === 2 ? 'nd' : n % 10 === 3 ? 'rd' : 'th'
}

// Port of luna() — the simple epact-2008 lunar approximation (used outside
// 1900–2200).
export function luna(month: number, day: number, year: number, lang: string): [string, string] {
  const epact2008 = 23
  const edays = dateToDays(1, 0, 2008)
  const lunarmonth = 29.53059
  const t = dateToDays(day, month - 1, year) - edays + epact2008
  const mult = Math.floor(t / lunarmonth)
  let dist = Math.floor(t - mult * lunarmonth - 0.25)
  if (dist <= 0) dist = 30 + dist

  if (/Latin/i.test(lang)) {
    return [`Luna ${ordinals[dist - 1]}. Anno ${year}\n`, ' ']
  }
  const s1 = day % 10 === 1 ? 'st' : day % 10 === 2 ? 'nd' : day % 10 === 3 ? 'rd' : 'th'
  const s2 = dist % 10 === 1 ? 'st' : dist % 10 === 2 ? 'nd' : dist % 10 === 3 ? 'rd' : 'th'
  return [
    `${monthsEn[month - 1]} ${day}${s1} ${year}. The ${dist}${s2} day of the Moon.`,
    monthsEn[month - 1],
  ]
}

// Port of gregor() — the Gregorian epact computus (1900–2200).
export function gregor(month: number, day0: number, year: number, lang: string): [string, string] {
  let day = day0
  const golden = year % 19
  const epact = [29, 10, 21, 2, 13, 24, 5, 16, 27, 8, 19, 30, 11, 22, 3, 14, 25, 6, 17]
  const om = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 100]
  let leapday = 0

  om[12] = golden === 18 ? 29 : 30
  if (leapyear(year) && month > 2) om[1] = 30
  if (golden === 0) om.unshift(30)
  if (golden === 8 || golden === 11) om.unshift(30)

  if (leapyear(year) && month === 2 && day >= 24) {
    leapday = (day + 1) % 30
    if (day === 29) day = 24
  }

  const yday = yday0(day, month - 1, year)
  let numAcc = -epact[golden] - 1
  let i = 0
  while (numAcc < yday) {
    numAcc += om[i]
    i++
  }
  numAcc -= om[i - 1]
  const gday = yday - numAcc

  day = leapday || day

  if (/Latin/i.test(lang)) {
    return [`Luna ${ordinals[gday - 1]} Anno Dómini ${year}\n`, ' ']
  }
  const s1 = ordinalSuffix(day)
  const s2 = ordinalSuffix(gday)
  return [
    `${monthsEn[month - 1]} ${day}${s1} ${year}, the ${gday}${s2} day of the Moon,`,
    monthsEn[month - 1],
  ]
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

  let t = ''

  const weekKey = `${getweek(day, month, year, true)}-${(dayofweek + 1) % 7}`
  let mobileDir = 'Martyrologium'
  if (/1570/.test(version) && /Latin/i.test(lang)) mobileDir = 'Martyrologium1570'
  if (/1960|Newcal/.test(version) && /Latin/i.test(lang)) mobileDir = 'Martyrologium1960'
  if (/1955/.test(version) && /Latin/i.test(lang)) mobileDir = 'Martyrologium1955R'
  const a = (await setupstring(sessionWithLang(state.session, lang), `${mobileDir}/Mobile`)) ?? {}

  let mobile = ''
  let hd = false
  if (a[weekKey] !== undefined) mobile = `${a[weekKey]}\n`
  if (month === 10 && dayofweek === 6 && day > 23 && day < 31 && a['10-DU'] !== undefined) {
    // Perl reads the unset global %m here — the assignment always yields ''.
    mobile = ''
  }
  if (/Pasc0-1/i.test(weekKey)) hd = true
  if (/ex C9/i.test(state.day.winnerSections.Rank ?? '') && a.Defuncti !== undefined) {
    mobile = a.Defuncti ?? ''
    hd = true
  }
  if (month === 11 && day === 14 && /Monastic/i.test(version)) {
    mobile = a.DefunctiM ?? ''
    hd = true
  }
  if (hd) {
    t = `v. ${mobile}_\n${t}`
    mobile = ''
  }

  const fname = nextday(month, day, year)
  const [mStr, dStr] = fname.split('-')
  const m = Number(mStr)
  const d = Number(dStr)
  const y = m === 1 && d === 1 ? year + 1 : year

  let path = `Martyrologium/${fname}`
  const variant =
    /1570/.test(version) && /Latin/i.test(lang)
      ? 'Martyrologium1570'
      : /1960|Newcal/.test(version) && /Latin/i.test(lang)
        ? 'Martyrologium1960'
        : /1955/.test(version) && /Latin/i.test(lang)
          ? 'Martyrologium1955R'
          : ''
  if (variant && (await state.session.loader.exists(`horas/Latin/${variant}/${fname}`))) {
    path = `${variant}/${fname}`
  }

  const lines = await readMartyrologiumLines(state, path, lang)
  if (lines.length > 0) {
    const [lunaStr, mo] = year >= 1900 && year < 2200 ? gregor(m, d, y, lang) : luna(m, d, y, lang)

    if (/Latin/i.test(lang)) {
      lines[0] += ` ${lunaStr}`
    } else {
      let found = false
      const dateRegex = new RegExp(`^U[p]+on.*?${mo}[, ]*`, 'i')
      for (let i = 0; i < lines.length; i++) {
        if (dateRegex.test(lines[i])) {
          lines[i] = lines[i].replace(dateRegex, `${lunaStr} `)
          found = true
          break
        }
      }
      if (!found) {
        lines.unshift(lunaStr, '_\n')
      }
    }

    let prefix = 'v. '
    for (const line of lines) {
      if (line.length > 3 && !/^\/:/.test(line) && !/\([,;:]+[zZ]?\)/.test(line)) {
        t += `${prefix}${line}\n`
      } else {
        t += `${line}\n`
      }
      prefix = 'r. '

      if (mobile && /_/.test(line)) {
        t += `${prefix}${mobile}`
        mobile = ''
      }
    }
  }
  t += await state.texts.prayer('Conclmart', lang)
  return t
}
