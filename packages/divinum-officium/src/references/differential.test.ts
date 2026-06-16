// Differential test: setupstring() (layering + conditional processing +
// @-inclusion resolution) against the real Perl, over a broad sample of real
// files × languages × versions. Skipped when the DO checkout isn't present.

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { defaultContext } from '../conditions/context'
import { createFsLoader } from '../node/fsLoader'
import { contentDo, hasFixtures, perlHarness, v1Versions } from '../node/testFixtures'
import { createSession, type DoArea, setupstring } from './resolve'

const harness = perlHarness('setupstring')
const versions = v1Versions
const langs = ['Latin', 'English', 'Portugues']

type Request = {
  version: string
  lang: string
  fname: string
  area: DoArea
  resolve: 'all'
  dayname0: string
}

function sampleFnames(area: DoArea, group: string, count: number): string[] {
  const dir = join(contentDo, area, 'Latin', group)
  if (!existsSync(dir)) return []
  const names = readdirSync(dir)
    .filter((n) => n.endsWith('.txt'))
    .sort()
  // Deterministic spread across the directory.
  const step = Math.max(1, Math.floor(names.length / count))
  return names.filter((_, i) => i % step === 0).map((n) => `${group}/${n.replace(/\.txt$/, '')}`)
}

describe.skipIf(!hasFixtures)('setupstring vs real Perl', () => {
  it('matches on sampled files across languages and versions', { timeout: 600_000 }, async () => {
    const requests: Request[] = []
    const fnames: Array<[DoArea, string]> = [
      ...sampleFnames('horas', 'Sancti', 24).map((f): [DoArea, string] => ['horas', f]),
      ...sampleFnames('horas', 'Tempora', 24).map((f): [DoArea, string] => ['horas', f]),
      ...sampleFnames('horas', 'SanctiM', 8).map((f): [DoArea, string] => ['horas', f]),
      ...sampleFnames('horas', 'Commune', 8).map((f): [DoArea, string] => ['horas', f]),
      ...sampleFnames('missa', 'Sancti', 12).map((f): [DoArea, string] => ['missa', f]),
      ...sampleFnames('missa', 'Tempora', 12).map((f): [DoArea, string] => ['missa', f]),
      // Known-nasty fixtures.
      ['horas', 'Sancti/01-25'],
      ['horas', 'Sancti/12-25'],
      ['horas', 'Tempora/Quad6-4'],
      ['horas', 'Psalterium/Common/Prayers'],
      ['missa', 'Ordo/Ordo'],
    ]
    for (const [area, fname] of fnames) {
      for (const version of versions) {
        for (const lang of langs) {
          requests.push({ version, lang, fname, area, resolve: 'all', dayname0: '' })
        }
      }
    }

    const result = spawnSync('perl', [harness], {
      input: `${requests.map((r) => JSON.stringify(r)).join('\n')}\n`,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 1024,
    })
    expect(result.status, result.stderr.slice(0, 4000)).toBe(0)
    const perlOutputs = result.stdout.trim().split('\n')
    expect(perlOutputs.length).toBe(requests.length)

    const loader = createFsLoader(contentDo)
    const mismatches: string[] = []

    for (let i = 0; i < requests.length; i++) {
      const req = requests[i]
      const perl = JSON.parse(perlOutputs[i]) as Record<string, string>
      const session = createSession({
        loader,
        ctx: defaultContext({ version: req.version, missa: req.area === 'missa' }),
        area: req.area,
        lang: req.lang,
      })
      const ours = (await setupstring(session, req.fname, { resolve: 'all' })) ?? {}

      const allKeys = [...new Set([...Object.keys(perl), ...Object.keys(ours)])].sort()
      for (const key of allKeys) {
        if ((perl[key] ?? '<absent>') !== (ours[key] ?? '<absent>')) {
          mismatches.push(
            `${req.area}/${req.lang}/${req.fname} [${req.version}] #${key}\n  perl: ${JSON.stringify(perl[key]?.slice(0, 200))}\n  ts:   ${JSON.stringify(ours[key]?.slice(0, 200))}`,
          )
        }
      }
    }

    expect(
      mismatches.length,
      `${mismatches.length} section mismatches; first 8:\n${mismatches.slice(0, 8).join('\n')}`,
    ).toBe(0)
  })
})
