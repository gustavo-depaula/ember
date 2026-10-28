import { addDays } from '@ember/liturgical'
import { describe, expect, it } from 'vitest'
import { assembleHour, formsOf, type HourPart } from '../hour'
import { type Hour, hours, officeOf } from '../office'
import { blockText, wordsOfBlocks } from '../text'
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

// And it must be whole: an hour of its kind never goes without these, and no
// part is a label with nothing after it. (The archive the corpus was drawn
// from had both faults: second Vespers of Christ the King that stopped at the
// responsory, and the Sunday's antiphon of the Gospel canticle left blank.)
const always: Record<Hour, string[]> = {
  invitatory: [],
  readings: ['psalm-1', 'reading-1', 'reading-2', 'prayer'],
  lauds: ['psalm-1', 'reading', 'canticle', 'intercessions', 'prayer'],
  vespers: ['psalm-1', 'reading', 'canticle', 'intercessions', 'prayer'],
  terce: ['psalm-1', 'reading', 'prayer'],
  sext: ['psalm-1', 'reading', 'prayer'],
  none: ['psalm-1', 'reading', 'prayer'],
  compline: ['psalm-1', 'reading', 'canticle', 'prayer'],
}
const label = /^(ant\d?|[rv])?$/

function faults(hour: Hour, parts: HourPart[]): string[] {
  const slots = parts.map((part) => part.slot.replace(/~\d+$/, ''))
  if (slots.includes('whole')) return []
  const missing = always[hour].filter((slot) => !slots.includes(slot)).map((slot) => `no ${slot}`)
  const blank = parts
    .filter((part) => !part.slot.startsWith('head') && part.slot !== 'psalmody')
    .filter((part) => label.test(wordsOfBlocks(part.blocks)))
    .map((part) => `${part.slot} is blank`)
  // The Gospel canticle has an antiphon: before it, or (Saint Mary on
  // Saturday) several to choose from under its name and again after it.
  const canticle = hour === 'lauds' || hour === 'vespers'
  const antiphon = !canticle || slots.includes('canticle-ant') || slots.includes('canticle-ant-end')
  return [...missing, ...blank, ...(antiphon ? [] : ['no antiphon to the Gospel canticle'])]
}

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
        for (const fault of faults(hour, parts))
          broken.push(`${date.toDateString()} ${hour} ${form}: ${fault}`)
      }
    }
  }
  return broken
}

it('holds for every year of the reference', async () => {
  expect(await sweep(2020, 2040)).toEqual([])
}, 300_000)

it('assembles every hour of 2041-2050', async () => {
  expect(await sweep(2041, 2050)).toEqual([])
}, 300_000)

// Found against the Latin edition: 11 January fell on a Saturday in every
// year I of the reference, and the layers took that for the day's reading.
describe('a day the reference never had', () => {
  it('reads the Friday after the Epiphany as a Friday, whatever its year of the readings', async () => {
    const office = officeOf(on('2041-01-11'), 'readings', calendar)
    const parts = await assembleHour(office, 'season', corpus)
    const reading = parts.find((part) => part.slot === 'reading-1')
    expect(reading?.blocks.map(blockText).join('\n')).toContain('Isaías 65,13-25')
  })
})
