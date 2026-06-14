// Differential test: assembleHour against the real Pofficium.pl (the
// two-language officium CLI), compared as normalized word streams. Skipped
// when the DO checkout isn't present.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createFsLoader } from '../node/fsLoader'
import {
  contentDo,
  doClone,
  goldenLib,
  hasFixtures,
  partialHourVersions,
  verifiedHourVersions,
} from '../node/testFixtures'
import { charContext, charDivergence, htmlCells, toWords } from '../node/wordStream'
import { assembleHour } from './assemble'

const pofficium = join(doClone, 'web', 'cgi-bin', 'horas', 'Pofficium.pl')

const horas = [
  'Matutinum',
  'Laudes',
  'Prima',
  'Tertia',
  'Sexta',
  'Nona',
  'Vespera',
  'Completorium',
] as const

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
  [12, 26, 2026], // St Stephen — octave of Christmas commemorated at Vespers
  [8, 15, 2026], // Assumption (I. cl. on a Saturday — concurrence with Sunday)
  [1, 1, 2026], // Circumcision / octave day of Christmas
  [11, 2, 2026], // All Souls (Office of the Dead at the major hours)
]

// Extract one column of the hour from Pofficium's HTML: cells alternate
// Latin/vernacular from the first 'Incipit' cell until the 'Post Divinum
// officium' framing cell.
function perlHourColumn(html: string, column: 0 | 1): string {
  const cells = htmlCells(html)
  // The hour body starts right after the 'Ante Divinum officium' framing cell.
  // The 1570/1955/196x/Altovadensis layouts print no framing cells at all
  // (print_content's antepost flag) — there the body starts at the first cell.
  let start = cells.findIndex((c) => /^\s*Ante Divinum officium\s*$/.test(c))
  start = start !== -1 ? start + 1 : 0
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

// Known, journaled Phase-1.5 divergences inside otherwise-verified versions.
// The English column of the Corpus Christi 12-lesson Nocturn III antiphon: the
// older Monastic versions inherit the Latin antiphon (the English file carries
// no translation of that section), where our setupstring layering resolves an
// English one. Tracked here so the rest of each version's 16×8 matrix stays
// strictly verified; remove the entry when the layering edge case is fixed.
const knownHourDivergences = new Set([
  'Monastic Divino 1930|6-11-2026|Matutinum|English',
  'Monastic Tridentinum 1617|6-11-2026|Matutinum|English',
])

const hasHourFixtures = hasFixtures && existsSync(goldenLib)

describe.skipIf(!hasHourFixtures)('assembleHour vs real Pofficium', () => {
  // Portugues fallback smoke test: the vernacular column falls back per file
  // (pt → en → la at setupstring level) — compare a small matrix.
  it('matches the Portugues fallback column', { timeout: 1_800_000 }, async () => {
    const loader = createFsLoader(contentDo)
    const failures: string[] = []
    const version = 'Rubrics 1960 - 1960'
    for (const [month, day, year] of [
      [6, 10, 2026],
      [12, 25, 2026],
    ] as Array<[number, number, number]>) {
      for (const hora of ['Laudes', 'Prima', 'Vespera'] as const) {
        const result = spawnSync(
          'perl',
          [
            pofficium,
            `date1=${month}-${day}-${year}`,
            `command=pray${hora}`,
            `version=${version}`,
            'lang1=Latin',
            'lang2=Portugues',
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
          lang2: 'Portugues',
        })
        const perlWords = toWords(perlHourColumn(result.stdout, 1))
        const ourWords = toWords((ours.vernacular ?? []).join('\n'))
        const divergence = charDivergence(perlWords, ourWords)
        if (divergence !== -1) {
          failures.push(
            `${month}-${day}-${year} ${hora} pt: diverges at char ${divergence}\n` +
              `  perl: …${charContext(perlWords, divergence)}…\n` +
              `  ours: …${charContext(ourWords, divergence)}…`,
          )
        }
      }
    }
    expect(failures.length, failures.join('\n')).toBe(0)
  })

  for (const version of verifiedHourVersions) {
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
            ['Latin', toWords(perlHourColumn(result.stdout, 0)), ours.latin.join('\n')],
            [
              'English',
              toWords(perlHourColumn(result.stdout, 1)),
              (ours.vernacular ?? []).join('\n'),
            ],
          ] as const) {
            if (knownHourDivergences.has(`${version}|${month}-${day}-${year}|${hora}|${label}`)) {
              continue
            }
            const ourWords = toWords(ourText)
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

  // Partial versions: assert they assemble for the whole matrix without
  // throwing (the crash/regression guard — the class of bug that breaks the
  // app on Hermes). Text divergences in their known-incomplete hours
  // (Tridentine Matins, Barroux Sext) are journaled Phase-1 follow-ups, not
  // asserted here.
  for (const version of partialHourVersions) {
    it(`assembles without throwing — ${version}`, { timeout: 1_800_000 }, async () => {
      const loader = createFsLoader(contentDo)
      for (const [month, day, year] of dates) {
        for (const hora of horas) {
          await assembleHour({ loader, day, month, year, version, hora, lang2: 'English' })
        }
      }
    })
  }
})
