// Engraves the scores the mockups show, with the app's own layout, to scores.json.
// Run from apps/app so `@/` resolves:  ../../node_modules/.bin/tsx ../../research/chant-ux-prototype/engrave.ts
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { parseGabc } from '@/features/chant/gabc'
import { layoutScore } from '@/features/chant/layoutScore'
import { scoreSvg } from '@/features/chant/scoreSvg'

const here = dirname(fileURLToPath(import.meta.url))
const content = resolve(here, '../../content')
const scores = {
  aveVerum: 'chants/ave-verum',
  introit: 'chant-propers/in-ad-te-levavi-132',
  gradual: 'chant-propers/gr-universi-1169',
  alleluia: 'chant-propers/al-ostende-nobis-1115',
}
const width = 342

async function main() {
const out: Record<string, unknown> = {}
for (const [key, path] of Object.entries(scores)) {
  const { headers, score } = parseGabc(readFileSync(resolve(content, `${path}.gabc`), 'utf8'))
  const layout = await layoutScore(score, { width, scale: 1 })
  out[key] = { headers, svg: scoreSvg(layout, { idPrefix: `${key}-` }), lines: layout.lines.length }
}
writeFileSync(resolve(here, 'scores.json'), JSON.stringify(out))
console.log(Object.entries(out).map(([k, v]) => `${k}: ${(v as { lines: number }).lines} lines`).join(', '))
}

main()
