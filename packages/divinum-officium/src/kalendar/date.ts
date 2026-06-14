// Port of DivinumOfficium::Date — liturgical date arithmetic. All functions
// are pure; day_of_week returns 0 = Sunday like the Perl.

export function leapyear(year: number): boolean {
  if (!year) return false
  return !(year % 4 !== 0 || (year % 100 === 0 && year % 400 !== 0))
}

const monthsup = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]

// Day number within the year (1-based).
export function dateToYdays(day: number, month: number, year: number): number {
  return monthsup[month - 1] + day + (month > 2 && leapyear(year) ? 1 : 0)
}

export function ydaysToDate(
  days: number,
  year: number,
): { day: number; month: number; year: number } {
  const months = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (leapyear(year)) months[2]++
  let month = 1
  let day = days
  while (day > months[month] && month < 13) {
    day -= months[month]
    month++
  }
  return { day, month, year }
}

export function dayOfWeek(day: number, month: number, year: number): number {
  return (
    (year * 365 +
      Math.floor((year - 1) / 4) -
      Math.floor((year - 1) / 100) +
      Math.floor((year - 1) / 400) -
      1 +
      dateToYdays(day, month, year)) %
    7
  )
}

// Gauss/Butcher computus (same algorithm as Date::Easter 1.22).
export function geteaster(year: number): { day: number; month: number } {
  const g = year % 19
  const c = Math.floor(year / 100)
  const h = (c - Math.floor(c / 4) - Math.floor((8 * c + 13) / 25) + 19 * g + 15) % 30
  const i =
    h -
    Math.floor(h / 28) *
      (1 - Math.floor(h / 28) * Math.floor(29 / (h + 1)) * Math.floor((21 - g) / 11))
  const j = (year + Math.floor(year / 4) + i + 2 - c + Math.floor(c / 4)) % 7
  const l = i - j
  const month = 3 + Math.floor((l + 40) / 44)
  const day = l + 28 - 31 * Math.floor(month / 4)
  return { day, month }
}

// Day-of-year of the first Sunday of Advent.
export function getadvent(year: number): number {
  const christmas = dateToYdays(25, 12, year)
  const christmasDow = dayOfWeek(25, 12, year) || 7
  return christmas - christmasDow - 21
}

// Port of getweek: the Tempora position id ('Adv1', 'Quad6', 'Pent03', …).
export function getweek(
  day: number,
  month: number,
  year: number,
  tomorrow = false,
  missa = false,
): string {
  let t = dateToYdays(day, month, year)
  if (tomorrow) t++
  const advent1 = getadvent(year)
  const christmas = dateToYdays(25, 12, year)
  const tDay = tomorrow ? day + 1 : day

  if (t >= advent1) {
    if (t < christmas) {
      const n = 1 + Math.floor((t - advent1) / 7)
      if (month === 11 || day < 25) return `Adv${n}`
    }
    return `Nat${tDay}`
  }

  const ordtime = 6 + 7 - dayOfWeek(6, 1, year)
  if (month === 1 && t < ordtime) return `Nat${String(tDay).padStart(2, '0')}`

  const easterDate = geteaster(year)
  const easter = dateToYdays(easterDate.day, easterDate.month, year)

  if (t < easter - 63) return `Epi${Math.floor((t - ordtime) / 7) + 1}`
  if (t < easter - 56) return 'Quadp1'
  if (t < easter - 49) return 'Quadp2'
  if (t < easter - 42) return 'Quadp3'
  if (t < easter) return `Quad${1 + Math.floor((t - (easter - 42)) / 7)}`
  if (t < easter + 56) return `Pasc${Math.floor((t - easter) / 7)}`

  const n = Math.floor((t - (easter + 49)) / 7)
  if (n < 23) return `Pent${String(n).padStart(2, '0')}`
  const wdist = Math.floor((advent1 - t + 6) / 7)
  if (wdist < 2) return 'Pent24'
  if (n === 23) return 'Pent23'
  return missa ? `PentEpi${8 - wdist}` : `Epi${8 - wdist}`
}

// Sancti file id (mm-dd) with DO's leap-day convention: the leap day is kept
// on 24 Feb (numbered 02-29) and subsequent February offices defer one day.
export function getSday(month: number, day: number, year: number): string {
  let d = day
  if (leapyear(year) && month === 2) {
    if (d === 24) d = 29
    else if (d > 24) d -= 1
  }
  return `${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// Sancti file id of the following day (for I. Vespers / tomorrow lookups).
export function nextday(month: number, day: number, year: number): string {
  const time = dateToYdays(day, month, year) + 1
  if (time > 365 && (!leapyear(year) || time === 367)) return getSday(1, 1, year + 1)
  const d = ydaysToDate(time, year)
  return getSday(d.month, d.day, d.year)
}

// Port of monthday: the August–December scripture-week id ('081-1' = Monday
// after the first Sunday of August), or '' outside that span.
export function monthday(
  day: number,
  month: number,
  year: number,
  modernstyle: boolean,
  tomorrow = false,
): string {
  if (month < 7) return ''
  const isLeap = leapyear(year) ? 1 : 0
  let dayOfYear = dateToYdays(day, month, year)
  if (tomorrow) dayOfYear++

  let litMonth = 0
  const firstSundays: number[] = []
  for (let m = 8; m <= 12; m++) {
    const firstOfMonth = monthsup[m - 1] + 1 + isLeap
    const dofweek = dayOfWeek(1, m, year)
    let firstSunday = firstOfMonth - dofweek
    if (dofweek >= 4 || (dofweek !== 0 && modernstyle)) firstSunday += 7
    firstSundays.push(firstSunday)
    if (dayOfYear >= firstSunday) litMonth = m
    else break
  }
  if (!litMonth) return ''

  let advent = 0
  if (litMonth > 10) {
    advent = getadvent(year)
    if (dayOfYear >= advent) return ''
  }

  let week = Math.floor((dayOfYear - firstSundays[litMonth - 8]) / 7)

  // 1960 rubrics: October's III. week vanishes in years when the first Sunday
  // of October falls on the 4th–7th.
  if (
    litMonth === 10 &&
    modernstyle &&
    week >= 2 &&
    ydaysToDate(firstSundays[10 - 8], year).day >= 4
  ) {
    week++
  }

  // November: the II. week vanishes most years (always with 1960 rubrics);
  // count backwards from Advent.
  if (litMonth === 11 && (week > 0 || modernstyle)) {
    week = 4 - Math.floor((advent - dayOfYear - 1) / 7)
    if (modernstyle && week === 1) week = 0
  }

  let dow = dayOfWeek(day, month, year)
  if (tomorrow) dow = (dow + 1) % 7

  return `${String(litMonth).padStart(2, '0')}${week + 1}-${dow}`
}
