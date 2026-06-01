/**
 * Build the Saint of the Day artifacts from the Pictorial Lives of the Saints book
 * + the existing saint-of-the-day flow.
 *
 * Outputs:
 *   - apps/app/src/features/saints/data/saintOfDayNames.ts — bilingual lookup
 *     (name + first chapter's reflection) used by the home/Explore cards.
 *   - content/practices/saint-of-the-day/flow.json — regenerated with bilingual
 *     labels on every per-day option and a nested `select` for multi-saint days.
 *
 * Inputs (the day → chapters editorial mapping is read from the current flow.json
 * so this is idempotent — re-running produces no diff once migrated):
 *   - content/practices/saint-of-the-day/flow.json
 *   - content/books/pictorial-lives-of-saints/book.json
 *   - content/books/pictorial-lives-of-saints/{en-US,pt-BR}/<chapter>.md
 *
 * Usage: node scripts/build-saint-of-day.mjs
 */
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const flowPath = resolve(root, 'content/practices/saint-of-the-day/flow.json')
const bookPath = resolve(root, 'content/books/pictorial-lives-of-saints/book.json')
const enChaptersDir = resolve(root, 'content/books/pictorial-lives-of-saints/en-US')
const ptChaptersDir = resolve(root, 'content/books/pictorial-lives-of-saints/pt-BR')
const dataOutPath = resolve(root, 'apps/app/src/features/saints/data/saintOfDayNames.ts')

const NUMBER_PREFIX = /^\d+\.\s*/
const TAB_ID_PREFIX = /^[a-z]{3}-\d{2}-/
const REFLECTION_RE = /^\*\*(?:Reflection|Reflexão)\*\*—(.+)$/m

function stripNumberPrefix(s) {
  return s.replace(NUMBER_PREFIX, '')
}

// Recursively flatten the book's toc into a { chapterId: { 'en-US', 'pt-BR' } } map.
function buildTitleMap(book) {
  const titles = {}
  function walk(node) {
    if (Array.isArray(node)) {
      for (const child of node) walk(child)
      return
    }
    if (node && typeof node === 'object') {
      if (node.id && node.title) titles[node.id] = node.title
      if (Array.isArray(node.children)) walk(node.children)
    }
  }
  walk(book.toc ?? [])
  return titles
}

// Pull the reflection paragraph from a chapter's markdown (first match wins).
function readReflection(dir, chapterId) {
  const path = resolve(dir, `${chapterId}.md`)
  let text
  try {
    text = readFileSync(path, 'utf8')
  } catch {
    return undefined
  }
  const m = text.match(REFLECTION_RE)
  if (!m) return undefined
  return m[1].trim()
}

// Walk a per-day option's sections and collect chapter refs in order. Handles
// both the flat shape ([prose, divider, prose]) and the migrated shape (a
// single `select` wrapping per-saint options).
function collectChapters(sections) {
  const chapters = []
  function walk(node) {
    if (!node || typeof node !== 'object') return
    if (Array.isArray(node)) {
      for (const item of node) walk(item)
      return
    }
    if (node.type === 'prose' && typeof node.chapter === 'string') {
      chapters.push(node.chapter)
      return
    }
    if (node.type === 'select' && Array.isArray(node.options)) {
      for (const opt of node.options) walk(opt.sections ?? [])
      return
    }
  }
  walk(sections)
  return chapters
}

const flow = JSON.parse(readFileSync(flowPath, 'utf8'))
const book = JSON.parse(readFileSync(bookPath, 'utf8'))
const titles = buildTitleMap(book)

// Find the outer `select on: dateKey` that holds the per-day options.
const dateSelect = flow.sections.find((s) => s?.type === 'select' && s.on === 'dateKey')
if (!dateSelect || !Array.isArray(dateSelect.options)) {
  throw new Error('Could not find outer select on dateKey in saint-of-the-day flow.json')
}

const dataEntries = []

for (const option of dateSelect.options) {
  const dateKey = option.id
  const chapters = collectChapters(option.sections ?? [])
  if (chapters.length === 0) {
    throw new Error(`Day ${dateKey} has no chapter refs`)
  }

  // Build bilingual joined name for the cycle label + card.
  const namePerLang = { 'en-US': [], 'pt-BR': [] }
  for (const chapter of chapters) {
    const title = titles[chapter]
    if (!title) throw new Error(`Chapter ${chapter} (day ${dateKey}) missing from book.json toc`)
    namePerLang['en-US'].push(stripNumberPrefix(title['en-US'] ?? ''))
    namePerLang['pt-BR'].push(stripNumberPrefix(title['pt-BR'] ?? title['en-US'] ?? ''))
  }
  const name = {
    'en-US': namePerLang['en-US'].join(' · '),
    'pt-BR': namePerLang['pt-BR'].join(' · '),
  }

  // First chapter that has reflections in both languages becomes the card subtitle.
  let reflection
  for (const chapter of chapters) {
    const en = readReflection(enChaptersDir, chapter)
    const pt = readReflection(ptChaptersDir, chapter)
    if (en && pt) {
      reflection = { 'en-US': en, 'pt-BR': pt }
      break
    }
  }

  dataEntries.push({ dateKey, name, reflection })

  // Rewrite the option in place: bilingual label + nested select for multi-saint days.
  option.label = name
  if (chapters.length === 1) {
    option.sections = [
      {
        type: 'prose',
        book: 'pictorial-lives-of-saints',
        chapter: chapters[0],
        langPolicy: 'book-default',
      },
    ]
  } else {
    option.sections = [
      {
        type: 'select',
        label: { 'en-US': 'Saint', 'pt-BR': 'Santo' },
        options: chapters.map((chapter) => {
          const title = titles[chapter]
          return {
            id: chapter.replace(TAB_ID_PREFIX, ''),
            label: {
              'en-US': stripNumberPrefix(title['en-US'] ?? ''),
              'pt-BR': stripNumberPrefix(title['pt-BR'] ?? title['en-US'] ?? ''),
            },
            sections: [
              {
                type: 'prose',
                book: 'pictorial-lives-of-saints',
                chapter,
                langPolicy: 'book-default',
              },
            ],
          }
        }),
      },
    ]
  }
}

writeFileSync(flowPath, `${JSON.stringify(flow, null, 2)}\n`, 'utf8')

// Emit the bilingual data file.
const dataLines = [
  '// AUTO-GENERATED by scripts/build-saint-of-day.mjs — do not edit by hand.',
  '// Per-day saint name + first available reflection from Pictorial Lives of the Saints.',
  'export type SaintOfDayEntry = {',
  "  name: { 'en-US': string; 'pt-BR': string }",
  "  reflection?: { 'en-US': string; 'pt-BR': string }",
  '}',
  '',
  'export const saintOfDay: Record<string, SaintOfDayEntry> = {',
]
for (const { dateKey, name, reflection } of dataEntries) {
  dataLines.push(`  '${dateKey}': {`)
  dataLines.push(
    `    name: { 'en-US': ${JSON.stringify(name['en-US'])}, 'pt-BR': ${JSON.stringify(name['pt-BR'])} },`,
  )
  if (reflection) {
    dataLines.push(
      `    reflection: { 'en-US': ${JSON.stringify(reflection['en-US'])}, 'pt-BR': ${JSON.stringify(reflection['pt-BR'])} },`,
    )
  }
  dataLines.push('  },')
}
dataLines.push('}')
dataLines.push('')

writeFileSync(dataOutPath, dataLines.join('\n'), 'utf8')

// Let biome own the final formatting (single quotes, line wrapping) so re-runs
// produce no diff against a previously-formatted tree.
const biome = spawnSync('pnpm', ['exec', 'biome', 'check', '--write', dataOutPath], {
  cwd: root,
  stdio: 'inherit',
})
if (biome.status !== 0) {
  console.warn('biome formatting step skipped or failed — run `pnpm exec biome check --write` manually.')
}

console.log(
  `Wrote ${dataEntries.length} days to ${dataOutPath} and rewrote ${flowPath} ` +
    `(${dataEntries.filter((e) => e.reflection).length} days with reflection).`,
)
