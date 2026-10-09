import { efVersion, emberDays } from '@ember/divinum-officium'
import { addDays, format } from 'date-fns'

import type { DayCalendar, LocalizedText } from './calendar-types'
import { type Transfers, universalTransfers } from './of-temporal'
import {
  computeEaster,
  getAshWednesday,
  getLiturgicalSeason,
  type LiturgicalCalendarForm,
  normalizeDate,
} from './season'

export type AbstinenceLevel = 'full' | 'partial' | 'penance-required' | 'none'

export type DayObligations = {
  holyDay: boolean
  fast: boolean
  abstinence: AbstinenceLevel
  details: LocalizedText[]
}

type JurisdictionRules = {
  fridayOutsideLent: AbstinenceLevel
}

const jurisdictionRules: Record<string, JurisdictionRules> = {
  US: { fridayOutsideLent: 'penance-required' },
  BR: { fridayOutsideLent: 'full' },
}

const defaultRules: JurisdictionRules = { fridayOutsideLent: 'full' }

function getRules(jurisdiction: string | undefined): JurisdictionRules {
  return (jurisdiction && jurisdictionRules[jurisdiction]) || defaultRules
}

// The Ember days come from the Divinum Officium engine's own reckoning, the one
// that picks the Extraordinary Form's Mass, so the fast falls on the day the
// Mass is the Ember Mass.
function isEmberDay(key: string, year: number): boolean {
  return emberDays(year, efVersion).some((week) => week.days.includes(key))
}

function getEfVigilDates(year: number): Date[] {
  const easter = computeEaster(year)
  const pentecost = addDays(easter, 49)
  const vigilPentecost = addDays(pentecost, -1) // Saturday before Pentecost
  const vigilImmaculate = new Date(year, 11, 7) // Dec 7
  const vigilChristmas = new Date(year, 11, 24) // Dec 24
  return [vigilPentecost, vigilImmaculate, vigilChristmas]
}

function isEfVigilDay(date: Date, year: number): { isVigil: boolean; dropped: boolean } {
  const key = format(date, 'yyyy-MM-dd')
  const vigils = getEfVigilDates(year)
  const match = vigils.find((v) => format(v, 'yyyy-MM-dd') === key)
  if (!match) return { isVigil: false, dropped: false }
  // If vigil falls on Sunday, obligation is dropped
  return { isVigil: true, dropped: date.getDay() === 0 }
}

function isInEasterOctave(date: Date, easter: Date): boolean {
  const diff = date.getTime() - easter.getTime()
  const days = diff / 86_400_000
  return days >= 0 && days <= 6
}

function isFridaySolemnity(date: Date, easter: Date, calendar: Map<string, DayCalendar>): boolean {
  if (date.getDay() !== 5) return false
  if (isInEasterOctave(date, easter)) return true
  const day = calendar.get(format(date, 'yyyy-MM-dd'))
  if (!day?.principal) return false
  const rank = day.principal.rank
  return rank === 'solemnity' || rank === 'I_class'
}

function isHolyDay(date: Date, calendar: Map<string, DayCalendar>): boolean {
  const day = calendar.get(format(date, 'yyyy-MM-dd'))
  return day?.principal?.entry.holyDayOfObligation === true
}

// The app and the website both ask for 'of', so the Extraordinary Form's own
// discipline below (Lenten weekdays, Ember days, vigils) is reached only by the
// tests until a caller passes 'ef'.
export function getDayObligations(
  date: Date,
  form: LiturgicalCalendarForm,
  jurisdiction: string | undefined,
  calendar: Map<string, DayCalendar>,
  // Where the Ordinary Form's calendar keeps its movable solemnities.
  transfers: Transfers = universalTransfers,
): DayObligations {
  const d = normalizeDate(date)
  const year = d.getFullYear()
  const easter = computeEaster(year)
  const ashWednesday = getAshWednesday(year)
  const goodFriday = addDays(easter, -2)
  const key = format(d, 'yyyy-MM-dd')
  const dayOfWeek = d.getDay() // 0=Sun, 5=Fri
  const season = getLiturgicalSeason(d, form, transfers)
  const rules = getRules(jurisdiction)
  const isFriday = dayOfWeek === 5
  const isLent = season === 'lent'

  const holyDay = isHolyDay(d, calendar)
  let fast = false
  let abstinence: AbstinenceLevel = 'none'
  const details: LocalizedText[] = []

  const ashWedKey = format(ashWednesday, 'yyyy-MM-dd')
  const goodFriKey = format(goodFriday, 'yyyy-MM-dd')

  // Ash Wednesday: universal fast + full abstinence
  if (key === ashWedKey) {
    fast = true
    abstinence = 'full'
    details.push({
      'en-US': 'Ash Wednesday — fast and abstinence',
      'pt-BR': 'Quarta-Feira de Cinzas — jejum e abstinência',
    })
  }

  // Good Friday: universal fast + full abstinence
  if (key === goodFriKey) {
    fast = true
    abstinence = 'full'
    details.push({
      'en-US': 'Good Friday — fast and abstinence',
      'pt-BR': 'Sexta-Feira Santa — jejum e abstinência',
    })
  }

  // Friday abstinence (if not already set by Ash Wed / Good Friday)
  if (isFriday && abstinence === 'none') {
    // Solemnities on Friday exempt from abstinence
    if (isFridaySolemnity(d, easter, calendar)) {
      // No abstinence
    } else if (form === 'ef') {
      // EF: all Fridays year-round, full abstinence
      abstinence = 'full'
      details.push({ 'en-US': 'Friday abstinence', 'pt-BR': 'Abstinência de sexta-feira' })
    } else if (isLent) {
      // OF Lent: universal full abstinence
      abstinence = 'full'
      details.push({
        'en-US': 'Friday of Lent — abstinence',
        'pt-BR': 'Sexta-feira da Quaresma — abstinência',
      })
    } else {
      // OF outside Lent: per jurisdiction
      abstinence = rules.fridayOutsideLent
      if (abstinence === 'full') {
        details.push({ 'en-US': 'Friday abstinence', 'pt-BR': 'Abstinência de sexta-feira' })
      } else if (abstinence === 'penance-required') {
        details.push({ 'en-US': 'Friday penance', 'pt-BR': 'Penitência de sexta-feira' })
      }
    }
  }

  // EF-specific: Lenten weekday fasting (Mon-Sat during Lent, excluding Sundays)
  if (form === 'ef' && isLent && dayOfWeek !== 0 && !fast) {
    fast = true
    details.push({ 'en-US': 'Lenten weekday fast', 'pt-BR': 'Jejum de dia de semana na Quaresma' })
  }

  // EF-specific: Ember days
  if (form === 'ef' && isEmberDay(key, year)) {
    if (!fast) {
      fast = true
      details.push({ 'en-US': 'Ember day fast', 'pt-BR': 'Jejum das Têmporas' })
    }
    // Ember Friday: full abstinence (likely already set by Friday logic)
    // Ember Wed/Sat: partial abstinence
    if (dayOfWeek === 3 || dayOfWeek === 6) {
      if (abstinence !== 'full') {
        abstinence = 'partial'
        details.push({
          'en-US': 'Ember day — partial abstinence',
          'pt-BR': 'Têmporas — abstinência parcial',
        })
      }
    }
  }

  // EF-specific: Vigil fasts
  if (form === 'ef') {
    const vigil = isEfVigilDay(d, year)
    if (vigil.isVigil && !vigil.dropped) {
      if (!fast) {
        fast = true
        details.push({ 'en-US': 'Vigil fast', 'pt-BR': 'Jejum de vigília' })
      }
      if (abstinence === 'none') {
        abstinence = 'full'
        details.push({ 'en-US': 'Vigil abstinence', 'pt-BR': 'Abstinência de vigília' })
      }
    }
  }

  if (holyDay) {
    details.push({ 'en-US': 'Holy Day of Obligation', 'pt-BR': 'Dia Santo de Guarda' })
  }

  return { holyDay, fast, abstinence, details }
}
