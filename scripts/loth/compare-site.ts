// Holds the engine to the published site: every hour of every day file under
// `liturgia_horas/dados/` of the archive (the JSON the site serves), read
// through `content/loth/` by the engine alone.
//
//   npx tsx scripts/loth/compare-site.ts <archive>/liturgia_horas/dados

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { LothCalendar } from '../../packages/loth/src/day'
import { assembleHour, formsOf, type LothSource } from '../../packages/loth/src/hour'
import { type Hour, officeOf } from '../../packages/loth/src/office'
import { wordsOf, wordsOfBlocks } from '../../packages/loth/src/text'
import { amended, asInTheReference } from '../../packages/loth/src/__tests__/corpus'
import { withoutSlips } from './corrections'

const site = process.argv[2]
const corpus = join(__dirname, '../../content/loth')
const cache = new Map<string, unknown>()
const read = <T>(path: string): T | undefined => {
  if (!cache.has(path)) {
    const file = join(corpus, path)
    cache.set(path, existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined)
  }
  return cache.get(path) as T | undefined
}
const source: LothSource = {
  calendar: async () => read<LothCalendar>('calendar.json') as LothCalendar,
  index: async (hour) => read(`index/${hour}.json`),
  parts: async (bundle) => read(`parts/${bundle}.json`),
  extras: async () => read('extras.json') ?? {},
}

const hourOf: Record<string, Hour> = {
  invitatorio: 'invitatory',
  leituras: 'readings',
  laudes: 'lauds',
  terca: 'terce',
  sexta: 'sext',
  nona: 'none',
  vesperas: 'vespers',
  completas: 'compline',
}

const ofHtml = (html: string) =>
  wordsOf(
    withoutSlips(html)
      .replace(/<br\s*\/?>|<\/(p|div)>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"'),
  )

async function main() {
  const calendar = await source.calendar()
  let hours = 0
  let alternatives = 0
  const differences: string[] = []
  for (const year of readdirSync(site).filter((name) => /^\d{4}$/.test(name))) {
    for (const file of readdirSync(join(site, year))) {
      const day = JSON.parse(readFileSync(join(site, year, file), 'utf8'))
      const [y, m, d] = day.data.split('-').map(Number)
      const date = new Date(y, m - 1, d, 12)
      for (const theirs of day.horas) {
        const hour = hourOf[theirs.slug]
        const office = officeOf(date, hour, calendar)
        const [first, second] = formsOf(office)
        const mine = async (form: typeof first) =>
          wordsOfBlocks((await assembleHour(office, form, source)).flatMap(asInTheReference))
        // The site is the archive, faults and all.
        if (amended(office)) continue
        hours++
        if ((await mine(first)) !== ofHtml(theirs.html)) differences.push(`${day.data} ${hour}`)
        if (theirs.alternativa?.html && second) {
          alternatives++
          if ((await mine(second)) !== ofHtml(theirs.alternativa.html))
            differences.push(`${day.data} ${hour} (${theirs.alternativa.rotulo})`)
        }
      }
    }
  }
  console.log(`${hours} hours and ${alternatives} second offices compared, ${differences.length} differ`)
  for (const difference of differences.slice(0, 40)) console.log('  ', difference)
}

main()
