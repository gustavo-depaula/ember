// Decides how much of the website a deploy has to render, by comparing what is
// about to be built with the state of the last published build.
//
//   node plan-build.mjs plan <state.json> <catalog.json> <plan.json>
//     writes plan.json: the books to render, every one when the site code changed.
//   node plan-build.mjs state <catalog.json> <plan.json> <state.json>
//     writes the state to publish once the upload has succeeded.
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const readJson = (file) => JSON.parse(readFileSync(file, 'utf-8'))

// Everything a page's markup can depend on besides the corpus. git's tree hashes
// cost nothing to read and change with any file under them.
function codeDigest() {
  const trees = ['apps/site', 'apps/app/src', 'apps/app/assets', 'packages', 'pnpm-lock.yaml']
  const hashes = trees.map((tree) =>
    execFileSync('git', ['rev-parse', `HEAD:${tree}`], { encoding: 'utf-8' }).trim(),
  )
  const settings = Object.entries(process.env)
    .filter(([name]) => name.startsWith('EMBER_SITE_') && name !== 'EMBER_SITE_PLAN')
    .sort()
  return createHash('sha256')
    .update(JSON.stringify([hashes, settings]))
    .digest('hex')
}

const bookHashes = (catalogFile) =>
  Object.fromEntries(
    Object.entries(readJson(catalogFile).items)
      .filter(([, entry]) => entry.kind === 'book')
      .map(([id, entry]) => [id, entry.hash]),
  )

const [command, ...args] = process.argv.slice(2)

if (command === 'plan') {
  const [stateFile, catalogFile, planFile] = args
  const code = codeDigest()
  const state = existsSync(stateFile) ? readJson(stateFile) : undefined
  const books = bookHashes(catalogFile)
  const base = dirname(planFile)
  const changedBooks =
    state?.code === code
      ? Object.keys(books).filter((id) => state.books[id] !== books[id])
      : undefined
  writeFileSync(
    planFile,
    JSON.stringify({
      code,
      partial: !!changedBooks,
      changedBooks: changedBooks ?? Object.keys(books),
      cards: state?.code === code ? state.cards : {},
      keptPagesFile: join(base, 'kept-pages.txt'),
      cardsFile: join(base, 'cards.json'),
    }),
  )
  console.log(
    changedBooks
      ? `[plan] ${changedBooks.length} of ${Object.keys(books).length} books to render`
      : '[plan] site code changed or first build: rendering every book',
  )
} else if (command === 'state') {
  const [catalogFile, planFile, stateFile] = args
  const plan = readJson(planFile)
  writeFileSync(
    stateFile,
    JSON.stringify({
      code: plan.code,
      books: bookHashes(catalogFile),
      cards: readJson(plan.cardsFile),
    }),
  )
} else {
  throw new Error('usage: plan-build.mjs plan|state ...')
}
