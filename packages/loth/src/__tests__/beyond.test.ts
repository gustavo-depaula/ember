import { addDays } from '@ember/liturgical'
import { expect, it } from 'vitest'
import { assembleHour, formsOf } from '../hour'
import { hours, officeOf } from '../office'
import { blockText } from '../text'
import { calendar, corpus, on } from './corpus'

// The reference ends in 2040. After it, a saint's day falls on a day of the
// psalter it was never seen on, and the hour is put together from layers that
// were each checked, never from a whole hour that was. It must still be an
// hour, which every hour of the reference's own years is by this measure:
// opened as the hour it is, and with its text.
it('assembles every hour of 2041-2050', async () => {
  const broken: string[] = []
  for (let date = on('2041-01-01'); date.getFullYear() <= 2050; date = addDays(date, 1)) {
    for (const hour of hours) {
      const office = officeOf(date, hour, calendar)
      for (const form of formsOf(office)) {
        const parts = await assembleHour(office, form, corpus)
        const slots = parts.map((part) => part.slot)
        const text = parts.flatMap((part) => part.blocks.map(blockText)).join('\n')
        if (text.length < 800 || !(slots.includes('head') || slots.includes('whole')))
          broken.push(`${date.toDateString()} ${hour} ${form}: ${slots.join(' ')}`)
      }
    }
  }
  expect(broken).toEqual([])
}, 300_000)
