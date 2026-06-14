// Filesystem DoLoader over content/do — for scripts and tests only (Node).
// Not re-exported from the package index so the app bundle never sees node:fs.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { type DoLoader, memoizedLoader } from '../loader'
import type { ParsedDoFile } from '../types'

export function createFsLoader(contentDoRoot: string): DoLoader {
  return memoizedLoader({
    async load(path) {
      const file = join(contentDoRoot, `${path}.json`)
      if (!existsSync(file)) return undefined
      return JSON.parse(readFileSync(file, 'utf8')) as ParsedDoFile
    },
    async exists(path) {
      return existsSync(join(contentDoRoot, `${path}.json`))
    },
  })
}
