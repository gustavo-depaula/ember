// Runtime context for conditional evaluation — the globals the Perl engine
// keeps in package scope (version, date parts, the day's winner, the hour…).
// Built by the kalendar (M3); hand-constructed in tests.

export type RubricContext = {
  // Full DO version string, e.g. 'Rubrics 1960 - 1960', 'Divino Afflatu - 1954',
  // 'Monastic - 1963'. Predicates regex-match against it.
  version: string
  day: number
  month: number
  year: number
  // 0 = Sunday … 6 = Saturday (Perl's $dayofweek).
  dayofweek: number
  // August–December scripture-week id ('101-3' style) or '' (Perl's $monthday).
  monthday: string
  // 'Matutinum' | 'Laudes' | 'Prima' | 'Tertia' | 'Sexta' | 'Nona' | 'Vespera'
  // | 'Completorium'; the `ad` subject answers 'missam' when assembling Mass.
  hora: string
  missa: boolean
  missanumber?: number
  // dayname[0] = tempora position id ('Adv1', 'Quad6-5', 'Pent03', …),
  // dayname[1] = winner office title, dayname[2] = secondary title.
  dayname: [string, string, string]
  // Winner file id ('Sancti/01-25', 'Tempora/Pent03-0') and its [Rule] text.
  winner: string
  winnerRule: string
  commemoratio: string
  commune: string
  votive: string
  dioecesis: string
}

export function defaultContext(overrides: Partial<RubricContext> = {}): RubricContext {
  return {
    version: 'Rubrics 1960 - 1960',
    day: 1,
    month: 1,
    year: 2026,
    dayofweek: 0,
    monthday: '',
    hora: 'Laudes',
    missa: false,
    dayname: ['', '', ''],
    winner: '',
    winnerRule: '',
    commemoratio: '',
    commune: '',
    votive: '',
    dioecesis: '',
    ...overrides,
  }
}

// Port of SetupString.pl::get_tempus_id — maps the tempora position to the
// liturgical-season id that `tempore` predicates match against.
export function getTempusId(ctx: RubricContext): string {
  const { day, month, dayofweek, version, hora, monthday } = ctx
  const vespOrComp = /Vespera/i.test(hora) || /Completorium/i.test(hora)
  const octOrNov = /^(10|11)\d-/.test(monthday)
  const d = ctx.dayname[0]

  if (/^Adv/.test(d)) return 'Adventus'
  if (/^Nat/.test(d)) {
    return month === 1 && (day >= 6 || (day === 5 && vespOrComp)) ? 'Epiphaniæ' : 'Nativitatis'
  }
  if (/^Epi/.test(d)) {
    if (month === 1 && day <= 13) return 'Epiphaniæ'
    if (month === 1 || (month === 2 && (day === 1 || (day === 2 && !vespOrComp)))) {
      return 'post Epiphaniam post partum'
    }
    if (month === 2) return 'post Epiphaniam'
    return 'post Pentecosten in hieme'
  }
  const quadp = /^Quadp(\d)/.exec(d)
  if (quadp && (Number(quadp[1]) < 3 || dayofweek < 3)) {
    return month === 1 || (month === 2 && (day === 1 || (day === 2 && !vespOrComp)))
      ? 'Septuagesimæ post partum'
      : 'Septuagesimæ'
  }
  const quad = /^Quad(\d)/.exec(d)
  if (quad && Number(quad[1]) < 5) return 'Quadragesimæ'
  if (/^Quad/.test(d)) return 'Passionis'
  if (/^Pasc0/.test(d)) {
    return vespOrComp && dayofweek === 6 ? 'Vigilia Paschalis' : 'Octava Paschæ'
  }
  const pasc = /^Pasc(\d)/.exec(d)
  if (pasc) {
    const n = Number(pasc[1])
    if (n < 5 || (n === 5 && (dayofweek < 3 || (!vespOrComp && dayofweek === 3)))) {
      return 'post Octavam Paschæ'
    }
    if (/^Pasc6-(5|6)/.test(d)) return 'post Octavam Ascensionis'
    if (n < 7) return 'Octava Ascensionis'
    return 'Octava Pentecostes'
  }
  if (/^Pent01/.test(d) && dayofweek === 4) return 'Corpus Christi post Pentecosten'
  const pent = /^Pent0(\d)/.exec(d)
  if (pent) {
    const n = Number(pent[1])
    if (
      ((n === 1 && dayofweek > 4 && !(dayofweek === 6 && vespOrComp)) ||
        (n === 2 && (dayofweek < 5 || (dayofweek === 6 && vespOrComp)))) &&
      !/19(?:55|6)/.test(version)
    ) {
      return 'Octava Corpus Christi post Pentecosten'
    }
    if (n === 2 && dayofweek === 5 && !/1570/.test(version)) return 'SSmi Cordis post Pentecosten'
    if (
      ((n === 2 && dayofweek > 5 && !(dayofweek === 6 && vespOrComp)) ||
        (n === 3 && (dayofweek < 6 || (dayofweek === 6 && vespOrComp)))) &&
      /Divino/i.test(version)
    ) {
      return 'Octava SSmi Cordis post Pentecosten'
    }
  }
  if (/^Pent/.test(d) && !octOrNov) return 'post Pentecosten'
  return 'post Pentecosten in hieme'
}

// Port of SetupString.pl::get_dayname_for_condition — the `die` subject.
export function getDaynameForCondition(ctx: RubricContext): string {
  const { day, month, year, winner, dayofweek, hora, commemoratio, dayname, winnerRule } = ctx
  const vespOrComp = /Vespera/i.test(hora) || /Completorium/i.test(hora)

  if (month === 1 && (day === 6 || (day === 5 && vespOrComp))) return 'Epiphaniæ'
  if (month === 1 && (day === 13 || (day === 12 && vespOrComp))) return 'Baptismatis Domini'
  if (/Quad6-[456]/.test(winner)) {
    if (/Quad6-4/.test(winner)) return 'in Cœna Domini'
    if (/Quad6-5/.test(winner)) return 'in Parasceve'
    return 'Sabbato Sancto'
  }
  if (/Pasc0-0/.test(winner) && vespOrComp && dayofweek === 6) return 'Vigilia Paschalis'
  if (/10-DU/.test(winner) || /10-DU/.test(commemoratio)) return 'regis DNJC'
  if (
    month === 11 &&
    (day === 2 ||
      (day === 3 && dayofweek === 1) ||
      (day === 1 && dayOfWeek(11, 1, year) !== 6 && vespOrComp))
  ) {
    return 'Omnium Defunctorum'
  }
  if (month === 11 && day === 3) return 'Malachiae'
  if (month === 11 && day === 4) return 'Caroli'
  if (month === 12 && day === 6) return 'Nicolai'
  if (month === 12 && day === 28) return 'Nat28'
  if (month === 12 && day === 29) return 'Nat29'
  if (/Doctor/i.test(dayname[1]) || /Doctor/i.test(dayname[2])) return 'doctorum'
  if (month === 8 && (day === 6 || (day === 5 && vespOrComp))) return 'transfigurationis'
  if (/09-15$|09-DT|Quad5-5$/.test(winner)) return 'septem doloris'
  if (/12-25/.test(winner)) return 'Nativitatis'
  // Perl returns the first match; both Epi1 returns can never be reached in
  // sequence, but we keep the first one it would produce.
  if (/Epi1-[1-6]/.test(dayname[0])) return 'post Dominicam infra Octavam Epiphaniæ'
  if (/08-20|00-VB/.test(winner)) return 'Bernardi'
  if (/3 lectio/i.test(winnerRule)) return '3 lectionum'
  return ''
}

// Day of week for a date: 0 = Sunday (matches Perl's Date::day_of_week usage).
export function dayOfWeek(month: number, day: number, year: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}
