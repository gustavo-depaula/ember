// Differential test: resolveDay (the precedence/occurrence port) against the
// real horascommon.pl, day by day over full years × the three v1 versions.
// This is the M3 fidelity gate. Skipped when the DO checkout isn't present.

import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createFsLoader } from '../node/fsLoader'
import { leapyear } from './date'
import { resolveDay } from './precedence'
import { num } from './state'

const repoRoot = join(__dirname, '..', '..', '..', '..')
const contentDo = join(repoRoot, 'content', 'do')
const doClone = join(repoRoot, '.divinum-officium')
const harnessSrc = join(__dirname, '..', '..', 'test', 'perl-harness', 'precedence.pl')
const hasFixtures = existsSync(doClone) && existsSync(contentDo)

const versions = ['Rubrics 1960 - 1960', 'Divino Afflatu - 1954', 'Monastic - 1963']
const years = [2025, 2026, 2027]

const monthLengths = (year: number) => [
  31,
  leapyear(year) ? 29 : 28,
  31,
  30,
  31,
  30,
  31,
  31,
  30,
  31,
  30,
  31,
]

type Req = { version: string; date: string }

describe.skipIf(!hasFixtures)('resolveDay vs real Perl precedence', () => {
  it('matches day-by-day over full years × versions', { timeout: 1_800_000 }, async () => {
    const requests: Req[] = []
    for (const version of versions) {
      for (const year of years) {
        const lengths = monthLengths(year)
        for (let month = 1; month <= 12; month++) {
          for (let day = 1; day <= lengths[month - 1]; day++) {
            requests.push({ version, date: `${month}-${day}-${year}` })
          }
        }
      }
    }

    const harness = join(doClone, 'web', 'cgi-bin', 'horas', '_ember-precedence.pl')
    copyFileSync(harnessSrc, harness)
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
      const perl = JSON.parse(perlOutputs[i]) as Record<string, unknown>
      const [month, day, year] = req.date.split('-').map(Number)
      const ours = await resolveDay({ loader, day, month, year, version: req.version })

      const fields: Array<[string, string | number, string | number]> = [
        ['winner', String(perl.winner), ours.winner],
        ['rank', num(String(perl.rank)), ours.rank],
        ['commemoratio', String(perl.commemoratio), ours.commemoratio],
        ['comrank', num(String(perl.comrank)), ours.comrank],
        ['commune', String(perl.commune), ours.commune],
        ['communetype', String(perl.communetype), ours.communetype],
        ['scriptura', String(perl.scriptura), ours.scriptura],
        ['dayname0', String(perl.dayname0), ours.dayname[0]],
        ['dayname1', String(perl.dayname1).trim(), ours.dayname[1].trim()],
        ['duplex', String(perl.duplex), String(ours.duplex)],
        ['laudes', String(perl.laudes), String(ours.laudes)],
        [
          'commemoentries',
          JSON.stringify(perl.commemoentries),
          JSON.stringify(ours.commemoentries),
        ],
        ['transfervigil', String(perl.transfervigil), ours.transfervigil],
        ['monthday', String(perl.monthday), ours.monthday],
      ]
      for (const [name, p, o] of fields) {
        if (p !== o) {
          mismatches.push(
            `${req.date} [${req.version}] ${name}: perl=${JSON.stringify(p)} ts=${JSON.stringify(o)}`,
          )
        }
      }
    }

    expect(
      mismatches.length,
      `${mismatches.length} mismatches; first 20:\n${mismatches.slice(0, 20).join('\n')}`,
    ).toBe(0)
  })
})
