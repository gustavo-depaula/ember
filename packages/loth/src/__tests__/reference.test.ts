import { createHash } from 'node:crypto'
import { addDays } from '@ember/liturgical'
import { describe, expect, it } from 'vitest'
import { lothDay } from '../day'
import { assembleHour, formsOf, type HourPart } from '../hour'
import type { Form } from '../index-types'
import { type Hour, officeOf } from '../office'
import { blockText } from '../text'
import { calendar, corpus, on } from './corpus'
import reference from './reference.json'

// `reference.json` is what the Brazilian breviary app the corpus was drawn
// from gives for every hour of every day of 2020-2040: three bytes of a hash
// of the letters and digits of each hour (`own`: the office it opens with;
// `other`: the second one a memorial allows), and the day's celebration and
// psalter week. The engine shares no code with that app, so agreeing with it
// hour for hour is the test that it is the same breviary.

const hours = reference.hours as Hour[]
const own = Buffer.from(reference.own, 'base64')
const other = Buffer.from(reference.other, 'base64')

function hash(parts: HourPart[]): string {
  const letters = parts
    .flatMap((part) => part.blocks.map(blockText))
    .join('')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .toLowerCase()
  return createHash('sha1').update(letters).digest().subarray(0, 3).toString('hex')
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
        const expected: [Form | undefined, string][] = [
          [first, at(own, i, h)],
          [second, at(other, i, h)],
        ]
        for (const [form, want] of expected) {
          if (!form || want === '000000') continue
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
