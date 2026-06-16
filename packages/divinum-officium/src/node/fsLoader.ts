// Filesystem DoLoader over content/do — for scripts and tests only (Node).
// Not re-exported from the package index so the app bundle never sees node:fs.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { type DoLoader, memoizedLoader } from '../loader'
import { parseDoFile } from '../parser/sectioned'

// content/do mirrors the upstream files verbatim as `.txt`; parse on read,
// exactly as the corpus loader does in the app.
export function createFsLoader(contentDoRoot: string): DoLoader {
  return memoizedLoader({
    async load(path) {
      const file = join(contentDoRoot, `${path}.txt`)
      if (!existsSync(file)) return undefined
      return parseDoFile(path, readFileSync(file, 'utf8'))
    },
    async exists(path) {
      return existsSync(join(contentDoRoot, `${path}.txt`))
    },
  })
}
