// Differential test: every conditional-bearing section in the imported corpus
// is run through BOTH the real Perl process_conditional_lines (via the
// perl-harness) and the TS port, across the three v1 versions, and the
// outputs must be identical. Skipped when the DO checkout isn't present.

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { SectionedDoFile } from '../parser/sectioned'
import { defaultContext } from './context'
import { processConditionalLines } from './evaluate'

const repoRoot = join(__dirname, '..', '..', '..', '..')
const contentDo = join(repoRoot, 'content', 'do')
const harness = join(__dirname, '..', '..', 'test', 'perl-harness', 'process-lines.pl')
const hasFixtures = existsSync(join(repoRoot, '.divinum-officium')) && existsSync(contentDo)

const versions = ['Rubrics 1960 - 1960', 'Divino Afflatu - 1954', 'Monastic - 1963']

type Vector = { version: string; lines: string[]; source: string }

function collectVectors(): Vector[] {
  const vectors: Vector[] = []
  const roots = [
    'horas/Latin/Tempora',
    'horas/Latin/Sancti',
    'horas/Latin/Commune',
    'horas/Latin/TemporaM',
    'horas/Latin/SanctiM',
    'horas/Latin/CommuneM',
    'horas/Latin/Psalterium',
    'missa/Latin/Tempora',
    'missa/Latin/Sancti',
    'missa/Latin/Ordo',
    'horas/Ordinarium',
  ]
  for (const root of roots) {
    const dir = join(contentDo, root)
    if (!existsSync(dir)) continue
    for (const name of readdirSync(dir).sort()) {
      if (!name.endsWith('.json')) continue
      const parsed = JSON.parse(readFileSync(join(dir, name), 'utf8')) as
        | SectionedDoFile
        | { lines: string[] }
      const sections =
        'sections' in parsed
          ? parsed.sections.map((s) => ({ lines: s.lines, label: `${root}/${name}#${s.name}` }))
          : [{ lines: parsed.lines, label: `${root}/${name}` }]
      for (const { lines, label } of sections) {
        if (!lines.some((l) => l.startsWith('('))) continue
        for (const version of versions) vectors.push({ version, lines, source: label })
      }
    }
  }
  return vectors
}

describe.skipIf(!hasFixtures)('processConditionalLines vs real Perl', () => {
  it('matches on every conditional-bearing section across all v1 versions', () => {
    const vectors = collectVectors()
    expect(vectors.length).toBeGreaterThan(1000)

    const input = `${vectors.map((v) => JSON.stringify({ version: v.version, lines: v.lines })).join('\n')}\n`
    const result = spawnSync('perl', [harness], {
      input,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    })
    expect(result.status, result.stderr).toBe(0)

    const perlOutputs = result.stdout.trim().split('\n')
    expect(perlOutputs.length).toBe(vectors.length)

    const mismatches: string[] = []
    vectors.forEach((v, i) => {
      const perl = JSON.parse(perlOutputs[i]) as string[]
      const ours = processConditionalLines(v.lines, defaultContext({ version: v.version }))
      if (JSON.stringify(ours) !== JSON.stringify(perl)) {
        mismatches.push(
          `${v.source} [${v.version}]\n  perl: ${JSON.stringify(perl)}\n  ts:   ${JSON.stringify(ours)}`,
        )
      }
    })
    expect(
      mismatches,
      `${mismatches.length} mismatches\n${mismatches.slice(0, 10).join('\n')}`,
    ).toEqual([])
  })
})
