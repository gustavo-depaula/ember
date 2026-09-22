// Filesystem DoLoader over the upstream web/www tree (content/do submodule) —
// for scripts and tests only (Node). Not re-exported from the package index so
// the app bundle never sees node:fs.

import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { type DoLoader, memoizedLoader } from '../loader'
import { parseDoFile } from '../parser/sectioned'

// A DO file id is its path without `.txt`; the few extensionless upstream
// files (horas.dialog, missa.setup, …) keep their bare name.
function resolveFile(root: string, path: string): string | undefined {
  const txt = join(root, `${path}.txt`)
  if (existsSync(txt)) return txt
  const bare = join(root, path)
  return statSync(bare, { throwIfNoEntry: false })?.isFile() ? bare : undefined
}

// Parse on read, exactly as the corpus loader does in the app.
export function createFsLoader(wwwRoot: string): DoLoader {
  return memoizedLoader({
    async load(path) {
      const file = resolveFile(wwwRoot, path)
      if (!file) return undefined
      return parseDoFile(path, readFileSync(file, 'utf8'))
    },
    async exists(path) {
      return resolveFile(wwwRoot, path) !== undefined
    },
  })
}
