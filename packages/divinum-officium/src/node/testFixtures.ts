// Shared fixture contract for the differential tests (Node-only): paths into
// the pinned Divinum Officium checkout, the imported corpus, the vendored
// Perl-harness deps, and the v1 version list. Tests skip when the checkout is
// absent (CI without the clone).

import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const repoRoot = join(__dirname, '..', '..', '..', '..')
export const contentDo = join(repoRoot, 'content', 'do')
export const doClone = join(repoRoot, '.divinum-officium')
export const goldenLib = join(repoRoot, '.do-golden-lib')

export const hasFixtures = existsSync(doClone) && existsSync(contentDo)

export function perlHarness(name: string): string {
  return join(__dirname, '..', '..', 'test', 'perl-harness', `${name}.pl`)
}

export const v1Versions = ['Rubrics 1960 - 1960', 'Divino Afflatu - 1954', 'Monastic - 1963']
