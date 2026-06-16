/**
 * Copy the auxiliary content served alongside the content-addressed corpus
 * (Bible, CCC, the liturgical calendar + Mass fragments, …) into
 * `_site/hearth/v2/`. The deploy workflow does this with a shell loop; this
 * script does the same locally so `pnpm build:corpus` produces a corpus that
 * the app (and the renderApp test harness) can fetch from in full.
 *
 * Usage: node scripts/copy-hearth-aux.mjs [outDir=_site/hearth/v2]
 */
import { cpSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, process.argv[2] ?? '_site/hearth/v2')

// Same set the deploy workflow serves alongside the corpus.
const auxDirs = ['art', 'bible', 'catechism', 'lectionary', 'liturgical', 'saints']

for (const dir of auxDirs) {
  const src = resolve(root, 'content', dir)
  if (!existsSync(src)) continue
  cpSync(src, resolve(outDir, dir), { recursive: true })
  console.log(`  copied content/${dir} → hearth/${dir}`)
}
