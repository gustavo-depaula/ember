#!/usr/bin/env node
// Writes the reference the new calendar is tested against: for every date in a
// span of years, the ids of what upstream's own calendar selects (ids only, no
// text, so the file can be committed).
//
//   node scripts/missal/golden.mjs 2020 2040 > packages/missal/src/__tests__/upstream-calendar.json

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { oracleDay } from './oracle.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const anchors = JSON.parse(
  readFileSync(join(here, '../../research/missale-romanum/consult/anchors.json'), 'utf8'),
)
const idOf = (link) => anchors[link.replace('.html', '')] ?? `?${link}`

const from = Number(process.argv[2])
const to = Number(process.argv[3])
const days = {}
for (let year = from; year <= to; year++) {
  for (let d = new Date(year, 0, 1, 12); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
    const day = oracleDay(d, 'latin')
    const ids = (links) =>
      Object.fromEntries(Object.entries(links).map(([key, link]) => [key, idOf(link)]))
    days[day.date] = {
      cycle: day.cycle,
      weekdayCycle: day.weekdayCycle,
      mass: ids(day.mass),
      readings: ids(day.readings),
      saints: Object.values(ids(day.saints)),
    }
  }
}
process.stdout.write(`${JSON.stringify(days)}\n`)
