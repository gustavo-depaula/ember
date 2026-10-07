import { addDays } from '@ember/liturgical'
import { expect, it } from 'vitest'
import { assembleHour, formsOf } from '../hour'
import { hours, officeOf } from '../office'
import { blockText } from '../text'
import { calendar, corpus, on } from './corpus'

// The reference ends in 2040. After it, a saint's day falls on a day of the
// psalter it was never seen on, and the hour is put together from layers that
// were each checked, never from a whole hour that was. It must still be an
// hour, by the measure every hour of the reference's own years meets: it has
// its text, and it opens (or, at the Office of Readings of the Easter Vigil
// and the like, is one of the few kept whole).
const isAnHour = (slots: string[], text: string) =>
  text.length >= 800 &&
  slots.some((slot) => slot === 'whole' || slot === 'intro' || slot.startsWith('head'))

async function sweep(from: number, to: number): Promise<string[]> {
  const broken: string[] = []
  for (let date = on(`${from}-01-01`); date.getFullYear() <= to; date = addDays(date, 1)) {
    for (const hour of hours) {
      const office = officeOf(date, hour, calendar)
      for (const form of formsOf(office)) {
        const parts = await assembleHour(office, form, corpus)
        const slots = parts.map((part) => part.slot)
        const text = parts.flatMap((part) => part.blocks.map(blockText)).join('\n')
        if (!isAnHour(slots, text))
          broken.push(`${date.toDateString()} ${hour} ${form}: ${slots.join(' ')}`)
      }
    }
  }
  return broken
}

it('holds for the last ten years of the reference', async () => {
  expect(await sweep(2031, 2040)).toEqual([])
}, 300_000)

it('assembles every hour of 2041-2050', async () => {
  expect(await sweep(2041, 2050)).toEqual([])
}, 300_000)
