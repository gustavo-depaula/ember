// Differential test: assembleMass against the real Cmissa.pl, compared as
// normalized word streams (rendering is ours; the assembled CONTENT and its
// order must match). Skipped when the DO checkout isn't present.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createFsLoader } from '../node/fsLoader'
import { contentDo, doClone, goldenLib, hasFixtures, v1Versions } from '../node/testFixtures'
import { assembleMass } from './assemble'

const cmissa = join(doClone, 'web', 'cgi-bin', 'missa', 'Cmissa.pl')

// Mass versions only — the Monastic office uses the Roman missal.
const versions = v1Versions.filter((v) => !/Monastic/.test(v))

// Dates spanning seasons, ranks, commemorations, ember days, octaves.
const dates: Array<[number, number, number]> = [
  [6, 10, 2026], // feria-time III. cl. feast + commemoration
  [12, 25, 2026], // Christmas
  [12, 8, 2026], // Immaculate Conception
  [3, 29, 2026], // Palm Sunday
  [4, 5, 2026], // Easter
  [5, 14, 2026], // Ascension
  [5, 24, 2026], // Pentecost
  [6, 4, 2026], // Corpus Christi
  [9, 23, 2026], // September Ember Wednesday
  // All Souls (11-2) is excluded: DO's multiple-Mass mechanism (missanumber)
  // renders 'Introitus missing' without a user selection — multi-Mass support
  // is a TODO for M8.
  [11, 1, 2026], // All Saints
  [2, 2, 2027], // Candlemas
  [8, 15, 2026], // Assumption
  [1, 25, 2026], // Septuagesima-time Sunday
  [7, 14, 2026], // summer feria-time saint
]

// Normalize either side to a comparable word stream: lowercase, 1960 i/j
// folding both ways, accents kept, punctuation and markers dropped.
function toWords(text: string): string[] {
  const stripped = text
    .split('\n')
    // Versicle/dialog markers render as glyphs or red initials in the HTML;
    // drop them on both sides.
    .map((l) => l.replace(/^\s*!?\s*(?:[VRSMAOCDP]|v|r|Ant|Ps)\.\s*/, ''))
    .join('\n')
  const words = stripped
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/œ/g, 'oe')
    .replace(/[jv]/g, (c) => (c === 'j' ? 'i' : 'u'))
    .replace(/[^a-z0-9áéíóúýǽàèìòùâêîôûäëïöüãõ ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  // The Perl renders 'v. Cognóvi' as a split red initial ('C' 'ognóvi');
  // merge any single letter into the following word — applied identically to
  // both streams so genuine one-letter Latin words stay comparable.
  const merged: string[] = []
  for (let i = 0; i < words.length; i++) {
    if (/^[a-záéíóúýǽ]$/.test(words[i]) && i + 1 < words.length) {
      merged.push(words[i] + words[i + 1])
      i++
    } else {
      merged.push(words[i])
    }
  }
  return merged
}

function perlColumn(html: string, column: 0 | 1): string {
  // Cells alternate col1/col2 inside the main table.
  const cells = [...html.matchAll(/<TD[^>]*>([\s\S]*?)<\/TD>/gi)].map((m) => m[1])
  const mine = cells.filter((_, i) => i % 2 === column)
  let text = mine.join('\n')
  text = text.replace(/<BR\s*\/?>/gi, '\n')
  text = text.replace(/<[^>]+>/g, ' ')
  text = text.replace(/&nbsp;|&ensp;|&emsp;/g, ' ')
  text = text.replace(/&amp;/g, '&')
  return text
}

function trimToMass(words: string[]): string[] {
  // Drop the Ante/Post devotional framing Cmissa prints around the Mass:
  // start at the Incipit section head, stop before the thanksgiving block.
  let start = words.findIndex((w) => w === 'incipit' || w === 'beginning')
  if (start === -1) start = 0
  const endMarkers = [
    ['gratiarum', 'actio', 'post', 'missam'],
    ['thanksgiving', 'after', 'mass'],
  ]
  let end = words.length
  outer: for (const marker of endMarkers) {
    for (let i = start; i < words.length - marker.length; i++) {
      if (marker.every((w, j) => words[i + j] === w)) {
        end = i
        break outer
      }
    }
  }
  // Cmissa's word-count footer ('4820 words') precedes the Post block.
  for (let i = start; i < end - 1; i++) {
    if (/^\d+$/.test(words[i]) && words[i + 1] === 'words') {
      end = Math.min(end, i)
      break
    }
  }
  return words.slice(start, end)
}

const hasMassFixtures = hasFixtures && existsSync(goldenLib)

describe.skipIf(!hasMassFixtures)('assembleMass vs real Cmissa', () => {
  it('matches the assembled word stream for sampled dates × versions', {
    timeout: 900_000,
  }, async () => {
    const loader = createFsLoader(contentDo)
    const failures: string[] = []

    for (const version of versions) {
      for (const [month, day, year] of dates) {
        const result = spawnSync(
          'perl',
          [
            cmissa,
            `date1=${month}-${day}-${year}`,
            `version1=${version}`,
            `version2=${version}`,
            'lang1=Latin',
            'lang2=English',
            'command=pray',
            'rubrics=1',
          ],
          {
            encoding: 'utf8',
            maxBuffer: 256 * 1024 * 1024,
            env: { ...process.env, PERL5LIB: goldenLib },
            cwd: join(doClone, 'web', 'cgi-bin', 'missa'),
          },
        )
        expect(result.status, result.stderr.slice(0, 2000)).toBe(0)

        const ours = await assembleMass({ loader, day, month, year, version, lang2: 'English' })

        for (const [label, perlWords, ourText] of [
          ['Latin', trimToMass(toWords(perlColumn(result.stdout, 0))), ours.latin.join('\n')],
          [
            'English',
            trimToMass(toWords(perlColumn(result.stdout, 1))),
            (ours.vernacular ?? []).join('\n'),
          ],
        ] as const) {
          const ourWords = trimToMass(toWords(ourText))
          const divergence = firstDivergence(perlWords, ourWords)
          if (divergence !== -1) {
            failures.push(
              `${month}-${day}-${year} [${version}] ${label}: diverges at word ${divergence}\n` +
                `  perl: …${perlWords.slice(Math.max(0, divergence - 6), divergence + 8).join(' ')}…\n` +
                `  ours: …${ourWords.slice(Math.max(0, divergence - 6), divergence + 8).join(' ')}…`,
            )
          }
        }
      }
    }

    expect(
      failures.length,
      `${failures.length} failures; first 6:\n${failures.slice(0, 6).join('\n')}`,
    ).toBe(0)
  })
})

function firstDivergence(a: string[], b: string[]): number {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return i
  }
  return a.length === b.length ? -1 : n
}
