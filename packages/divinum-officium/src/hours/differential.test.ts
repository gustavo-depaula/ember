// Differential test: assembleHour against the real Pofficium.pl (the
// two-language officium CLI), compared as normalized word streams. Skipped
// when the DO checkout isn't present.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createFsLoader } from '../node/fsLoader'
import { contentDo, doClone, goldenLib, hasFixtures, v1Versions } from '../node/testFixtures'
import { charContext, charDivergence, htmlCells, toWords } from '../node/wordStream'
import { assembleHour } from './assemble'

const pofficium = join(doClone, 'web', 'cgi-bin', 'horas', 'Pofficium.pl')

const horas = ['Prima', 'Tertia', 'Sexta', 'Nona', 'Completorium'] as const

// Dates spanning seasons, ranks, preces days, octaves, and Compline
// concurrence cases (eve of a I. cl. feast, Saturday before a Sunday).
const dates: Array<[number, number, number]> = [
  [6, 10, 2026], // feria-time III. cl. feast + commemoration
  [6, 11, 2026], // eve of the Sacred Heart (Compline concurrence)
  [12, 25, 2026], // Christmas
  [12, 8, 2026], // Immaculate Conception
  [12, 18, 2026], // Advent Friday (preces feriales, late-Advent antiphons)
  [2, 27, 2027], // Lent Saturday (preces; Compline → I. Lent Sunday)
  [4, 5, 2026], // Easter
  [5, 24, 2026], // Pentecost
  [9, 23, 2026], // September Ember Wednesday
  [11, 1, 2026], // All Saints
  [1, 25, 2026], // Septuagesima-time Sunday
  [7, 14, 2026], // summer feria-time saint
]

// Extract one column of the hour from Pofficium's HTML: cells alternate
// Latin/vernacular from the first 'Incipit' cell until the 'Post Divinum
// officium' framing cell.
function perlHourColumn(html: string, column: 0 | 1): string {
  const cells = htmlCells(html)
  // The hour body starts right after the 'Ante Divinum officium' framing cell
  // (offices like Compline of the Dead omit the Incipit heading entirely).
  let start = cells.findIndex((c) => /^\s*Ante Divinum officium\s*$/.test(c))
  if (start !== -1) start += 1
  else start = cells.findIndex((c) => /^\s*Incipit/.test(c))
  if (start === -1) return ''
  const out: string[] = []
  for (let i = start; i + column < cells.length; i += 2) {
    const cell = cells[i + column]
    if (
      /^\s*(?:Post Divinum officium|Versions)\s*$/.test(cells[i]) ||
      /^\s*Versions\b/.test(cells[i])
    ) {
      break
    }
    out.push(cell)
  }
  return out.join('\n')
}

// The Martyrologium data set is not imported yet (M8); our Prima emits an
// explicit unavailability note instead. Drop the block on both sides — the
// surrounding Pretiosa versicle and prayer stay compared.
function dropMartyrologium(text: string): string {
  return text
    .split('\n')
    .filter((l) => !/Martyrolog/i.test(l))
    .join('\n')
}

function perlMartyrologiumPruned(html: string, column: 0 | 1): string {
  const text = perlHourColumn(html, column)
  // The whole Martyrologium cell (heading + entry + Deo gratias + Conclmart)
  // is one cell; it survives as a single newline-joined chunk containing the
  // heading word — drop from its heading to the Pretiosa versicle.
  const lines = text.split('\n')
  const out: string[] = []
  let skipping = false
  for (const line of lines) {
    if (/Martyrolog/i.test(line)) skipping = true
    if (skipping && /Preti|Precious/i.test(line)) skipping = false
    if (!skipping) out.push(line)
  }
  return out.join('\n')
}

const hasHourFixtures = hasFixtures && existsSync(goldenLib)

describe.skipIf(!hasHourFixtures)('assembleHour vs real Pofficium', () => {
  for (const version of v1Versions) {
    it(`matches the assembled word stream — ${version}`, { timeout: 1_800_000 }, async () => {
      const loader = createFsLoader(contentDo)
      const failures: string[] = []

      for (const [month, day, year] of dates) {
        for (const hora of horas) {
          const result = spawnSync(
            'perl',
            [
              pofficium,
              `date1=${month}-${day}-${year}`,
              `command=pray${hora}`,
              `version=${version}`,
              'lang1=Latin',
              'lang2=English',
              'votive=Hodie',
            ],
            {
              encoding: 'utf8',
              maxBuffer: 256 * 1024 * 1024,
              env: { ...process.env, PERL5LIB: goldenLib },
              cwd: join(doClone, 'web', 'cgi-bin', 'horas'),
            },
          )
          expect(result.status, result.stderr.slice(0, 2000)).toBe(0)

          const ours = await assembleHour({
            loader,
            day,
            month,
            year,
            version,
            hora,
            lang2: 'English',
          })

          for (const [label, perlWords, ourText] of [
            ['Latin', toWords(perlMartyrologiumPruned(result.stdout, 0)), ours.latin.join('\n')],
            [
              'English',
              toWords(perlMartyrologiumPruned(result.stdout, 1)),
              (ours.vernacular ?? []).join('\n'),
            ],
          ] as const) {
            const ourWords = toWords(dropMartyrologium(ourText))
            const divergence = charDivergence(perlWords, ourWords)
            if (divergence !== -1) {
              failures.push(
                `${month}-${day}-${year} ${hora} [${version}] ${label}: diverges at char ${divergence}\n` +
                  `  perl: …${charContext(perlWords, divergence)}…\n` +
                  `  ours: …${charContext(ourWords, divergence)}…`,
              )
            }
          }
        }
      }

      expect(
        failures.length,
        `${failures.length} failures; first 8:\n${failures.slice(0, 8).join('\n')}`,
      ).toBe(0)
    })
  }
})
