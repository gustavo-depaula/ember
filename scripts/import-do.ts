// Manages the pinned Divinum Officium checkout at <repo root>/.divinum-officium
// (gitignored). Re-syncing to a newer upstream commit = update pinnedCommit,
// run `pnpm import:do && pnpm build:do`, review the content/do diff.

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export const doRepoUrl = 'https://github.com/DivinumOfficium/divinum-officium.git'
export const pinnedCommit = 'b94d5f28410ab767d108e7a3defe55c8a93fe649'
export const doCloneDir = resolve(__dirname, '..', '.divinum-officium')

function git(args: string, cwd: string = doCloneDir): string {
  return execSync(`git ${args}`, { cwd, encoding: 'utf8' }).trim()
}

export function ensureDoCheckout(): { commit: string; commitDate: string } {
  if (!existsSync(doCloneDir)) {
    console.log(`Cloning ${doRepoUrl} into ${doCloneDir}…`)
    execSync(`git clone --depth 1 ${doRepoUrl} ${doCloneDir}`, { stdio: 'inherit' })
  }
  if (git('rev-parse HEAD') !== pinnedCommit) {
    console.log(`Checking out pinned commit ${pinnedCommit}…`)
    git(`fetch --depth 1 origin ${pinnedCommit}`)
    git(`checkout --detach ${pinnedCommit}`)
  }
  const commit = git('rev-parse HEAD')
  const commitDate = git('log -1 --format=%cI')
  console.log(`Divinum Officium at ${commit} (${commitDate})`)
  return { commit, commitDate }
}

if (require.main === module) {
  ensureDoCheckout()
}
