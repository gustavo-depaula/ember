// Engraves the scores the mockups show, with the app's own layout, to scores.json.
// Run from apps/app so `@/` resolves:  ../../node_modules/.bin/tsx ../../research/chant-ux-prototype/engrave.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseGabc } from '@/features/chant/gabc'
import { layoutScore } from '@/features/chant/layoutScore'
import { pointPsalm, toneOf } from '@/features/chant/psalmody'
import { scoreSvg } from '@/features/chant/scoreSvg'

const here = dirname(fileURLToPath(import.meta.url))
const content = resolve(here, '../../content')
const scores: Record<string, string> = {
  aveVerum: 'chants/ave-verum',
  introit: 'chant-propers/in-ad-te-levavi-132',
  gradual: 'chant-propers/gr-universi-1169',
  alleluia: 'chant-propers/al-ostende-nobis-1115',
  ant109: 'chant-propers/an-dixit-dominus-domino-2767',
  ant110: 'chant-propers/an-magna-opera-domini-2908',
}
// Sunday Vespers' first psalms, each pointed to the tone its antiphon names.
const psalms: Record<string, [string, number]> = {
  psalm109: ['ant109', 109],
  psalm110: ['ant110', 110],
}
const gloria = [
  'Glória Patri, et Fílio, * et Spirítui Sancto.',
  'Sicut erat in princípio, et nunc, et semper, * et in sǽcula sæculórum. Amen.',
]
const width = 342

const chant = (path: string) => parseGabc(readFileSync(resolve(content, `${path}.gabc`), 'utf8'))

async function main() {
  const out: Record<string, { headers: unknown; svg: string; lines: number }> = {}
  const engrave = async (key: string, headers: unknown, score: string) => {
    const layout = await layoutScore(score, { width, scale: 1 })
    out[key] = { headers, svg: scoreSvg(layout, { idPrefix: `${key}-` }), lines: layout.lines.length }
  }
  for (const [key, path] of Object.entries(scores)) {
    const { headers, score } = chant(path)
    await engrave(key, headers, score)
  }
  for (const [key, [antiphon, number]] of Object.entries(psalms)) {
    const { headers, score } = chant(scores[antiphon])
    const tone = toneOf(headers.mode, score)
    if (!tone) throw new Error(`no tone for ${antiphon}`)
    const verses = readFileSync(
      resolve(content, `do/web/www/horas/Latin/Psalterium/Psalmorum/Psalm${number}.txt`),
      'utf8',
    )
      .split('\n')
      .filter((line) => line.includes('*'))
      .map((line) => line.replace(/^\S+ /, ''))
    await engrave(key, { name: `Psalmus ${number}`, tone: tone.name }, pointPsalm(tone, [...verses, ...gloria]))
  }
  writeFileSync(resolve(here, 'scores.json'), JSON.stringify(out))
  console.log(
    Object.entries(out)
      .map(([k, v]) => `${k}: ${v.lines} lines`)
      .join(', '),
  )
}

main()
