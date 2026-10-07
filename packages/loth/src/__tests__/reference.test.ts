import { createHash } from 'node:crypto'
import { addDays } from '@ember/liturgical'
import { describe, expect, it } from 'vitest'
import { lothDay } from '../day'
import { assembleHour, formsOf, type HourPart } from '../hour'
import type { Form } from '../index-types'
import { type Hour, type Office, officeOf } from '../office'
import { type Block, wordsOfBlocks } from '../text'
import { calendar, corpus, on } from './corpus'
import reference from './reference.json'

// `reference.json` is what the Brazilian breviary app the corpus was drawn
// from gives for every hour of every day of 2020-2040: three bytes of a hash
// of the letters and digits of each hour (`own`: the office it opens with;
// `other`: the second one a memorial allows), and the day's celebration and
// psalter week. The label of a versicle or response is not counted: the source
// writes the same one as "V." in one hour and "℣." in the next. The engine shares no code with that app, so agreeing with it
// hour for hour is the test that it is the same breviary.

// Where the reference is known to be at fault, and the corpus has the book's
// text. The Magnificat's antiphon of 17-23 December goes by the date, and on
// two evenings the reference has the next day's; and its second Vespers of
// Christ the King stop after the responsory.
const amended = (office: Office) => {
  const { date, hour } = office
  if (hour !== 'vespers') return false
  if (office.celebration?.id === 'tempore.solemnity.christ-the-king') return !office.firstVespers
  return (
    date.getMonth() === 11 &&
    ((date.getDate() === 17 && date.getDay() === 0) ||
      (date.getDate() === 22 && date.getDay() === 6))
  )
}

const hours = reference.hours as Hour[]
const own = Buffer.from(reference.own, 'base64')
const other = Buffer.from(reference.other, 'base64')

// Where the app set a text into the hour only as it was shown (the Sunday's
// antiphon of the Gospel canticle outside Ordinary Time), the reference has
// its label and nothing after; the corpus supplies the text, and here it is
// taken out again so the rest of the hour is still held to the reference.
const asInTheReference = (part: HourPart): Block[] =>
  part.supplied
    ? [{ k: 'p', lines: [part.blocks[0].lines[0].filter((seg) => typeof seg !== 'string')] }]
    : part.blocks

function hash(parts: HourPart[]): string {
  const words = wordsOfBlocks(parts.flatMap(asInTheReference))
  return createHash('sha1').update(words).digest().subarray(0, 3).toString('hex')
}

const at = (bytes: Buffer, day: number, hour: number) => {
  const i = (day * hours.length + hour) * 3
  return bytes.subarray(i, i + 3).toString('hex')
}

const dates = (() => {
  const list: Date[] = []
  for (let date = on(reference.from); list.length < reference.days.length; date = addDays(date, 1))
    list.push(date)
  return list
})()

describe('the calendar against the reference, 2020-2040', () => {
  it('keeps the same celebration and psalter week every day', () => {
    const differences = dates.flatMap((date, i) => {
      const day = lothDay(date, calendar)
      const mine = `${day.celebration?.id ?? ''}|${day.psalterWeek || ''}`
      return mine === reference.days[i]
        ? []
        : [`${date.toDateString()}: ${mine} ≠ ${reference.days[i]}`]
    })
    expect(differences).toEqual([])
  })
})

describe('every hour against the reference, 2020-2040', () => {
  for (const [h, hour] of hours.entries()) {
    it(`${hour}`, async () => {
      const differences: string[] = []
      let checked = 0
      for (const [i, date] of dates.entries()) {
        const office = officeOf(date, hour, calendar)
        const forms = formsOf(office)
        // The reference opens the Invitatory of an optional memorial with the
        // saint's antiphon, where every other hour opens with the weekday.
        const first: Form = hour === 'invitatory' && forms.length > 1 ? 'celebration' : forms[0]
        const second = forms.find((form) => form !== first)
        const expected = [
          [first, at(own, i, h)],
          [second, at(other, i, h)],
        ] as const
        for (const [form, want] of expected) {
          if (want === '000000' || amended(office)) continue
          checked++
          const got = hash(await assembleHour(office, form, corpus))
          if (got !== want) differences.push(`${date.toDateString()} ${form}`)
        }
      }
      expect(differences).toEqual([])
      expect(checked).toBeGreaterThanOrEqual(dates.length)
    }, 300_000)
  }
})
