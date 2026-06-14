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

// Office versions whose hours are fully differentially verified (every date ×
// hora matches the Perl char-for-char). The strict hours differential runs
// these.
export const verifiedHourVersions = [
  'Rubrics 1960 - 1960',
  'Divino Afflatu - 1954',
  'Monastic - 1963',
  'Divino Afflatu - 1939',
  'Reduced - 1955',
  'Monastic Divino 1930',
  'Monastic Tridentinum 1617',
]

// Versions imported and selectable, but with known, journaled text divergences
// in specific hours (Phase-1 follow-ups): the Tridentine Matins psalm
// scheme/lessons, and the Barroux Saturday-BVM Sext chapter. The smoke test
// asserts these assemble for the full matrix without throwing — the
// crash/regression guard — without asserting exact text.
export const partialHourVersions = [
  'Tridentine - 1570',
  'Tridentine - 1888',
  'Tridentine - 1906',
  'Monastic - 1963 - Barroux',
]
