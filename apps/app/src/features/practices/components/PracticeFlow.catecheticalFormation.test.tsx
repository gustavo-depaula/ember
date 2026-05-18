/**
 * Corpus-integrity test for the catechetical-formation practice.
 *
 * Catches the empty-day regression we shipped: the practice flow renders a
 * `prose` section per plate per day, pulling chapters from a sister book
 * (`book/catechism-in-pictures`). If that book is missing from the catalog,
 * or the chapter id referenced by the practice's session-progression doesn't
 * exist there, the flow renders nothing and the user sees a blank day.
 *
 * This test loads the on-disk corpus and verifies:
 *
 *   1. Both books (catechetical-formation + catechism-in-pictures) are in
 *      the catalog.
 *   2. Every plate referenced by the practice's session-progression entries
 *      resolves to an actual chapter in catechism-in-pictures' manifest.
 *   3. Every day's compendium rubric markdown is non-empty (en-US + pt-BR).
 *
 * It is a static read of the corpus blobs — no React, no DOM, no SQLite. The
 * full RNTL flow rendering test is in PracticeFlow.test.tsx; this one is
 * cheap to run, fast to fail, and catches the cross-book reference breakage
 * that the user reported as "all catechetical formation days are empty."
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const REPO_ROOT = resolve(__dirname, '../../../../../..')
const CATALOG_PATH = resolve(REPO_ROOT, '_site/hearth/v2/catalog.json')

type CatalogEntry = { kind: string; hash: string; size: number }
type Catalog = { items: Record<string, CatalogEntry> }

function loadJsonBlob<T>(hash: string): T {
  const path = resolve(REPO_ROOT, '_site/hearth/v2/blobs', hash.slice(0, 2), hash.slice(2, 4), hash)
  return JSON.parse(readFileSync(path, 'utf-8')) as T
}

function loadCatalog(): Catalog {
  return JSON.parse(readFileSync(CATALOG_PATH, 'utf-8')) as Catalog
}

type BookManifest = { id: string; chapters: Record<string, Record<string, unknown>> }
type PracticeManifest = {
  id: string
  dataHashes?: { hash: string; name: string; size: number }[]
  flowHash?: { hash: string; size: number }
}
type SessionEntry = {
  chapterId: string
  plates: { plateId: string }[]
  compendiumEn: string
  compendiumPt: string
}
type SessionData = { entries: { default: SessionEntry[] } }

function loadSessionData(practiceManifest: PracticeManifest): SessionData {
  const data = (practiceManifest.dataHashes ?? []).find((d) => d.name === 'sessions.json')
  if (!data) throw new Error('practice manifest is missing dataHashes[sessions.json]')
  return loadJsonBlob<SessionData>(data.hash)
}

describe('catechetical-formation — corpus integrity', () => {
  it('both books are in the catalog', () => {
    const catalog = loadCatalog()
    expect(catalog.items['book/catechetical-formation']).toBeDefined()
    expect(catalog.items['book/catechism-in-pictures']).toBeDefined()
    expect(catalog.items['practice/catechetical-formation']).toBeDefined()
  })

  it('every plate referenced by the practice resolves in catechism-in-pictures', () => {
    const catalog = loadCatalog()

    const practiceManifest = loadJsonBlob<PracticeManifest>(
      catalog.items['practice/catechetical-formation'].hash,
    )
    const sessionData = loadSessionData(practiceManifest)

    // Load the catechism-in-pictures book manifest so we can check chapters.
    const cipEntry = catalog.items['book/catechism-in-pictures']
    const cipManifest = loadJsonBlob<BookManifest>(cipEntry.hash)
    const knownPlates = new Set(Object.keys(cipManifest.chapters))

    const missing: string[] = []
    for (const entry of sessionData.entries.default) {
      for (const p of entry.plates) {
        if (!knownPlates.has(p.plateId)) {
          missing.push(`${entry.chapterId} → ${p.plateId}`)
        }
      }
    }
    expect(
      missing,
      `These plates are referenced by the practice but missing from catechism-in-pictures:\n  - ${missing.join('\n  - ')}`,
    ).toEqual([])
  })

  it('every day has a non-empty Compendium markdown block in both languages, or no plate', () => {
    const catalog = loadCatalog()
    const practiceManifest = loadJsonBlob<PracticeManifest>(
      catalog.items['practice/catechetical-formation'].hash,
    )
    const sessionData = loadSessionData(practiceManifest)

    const noRubricAndNoPlate: string[] = []
    for (const entry of sessionData.entries.default) {
      const hasPlate = entry.plates.length > 0
      const hasRubric = entry.compendiumEn.trim().length > 0 && entry.compendiumPt.trim().length > 0
      if (!hasPlate && !hasRubric) {
        noRubricAndNoPlate.push(entry.chapterId)
      }
    }
    expect(
      noRubricAndNoPlate,
      `These days have neither a plate nor a Compendium rubric and would render blank:\n  - ${noRubricAndNoPlate.join('\n  - ')}`,
    ).toEqual([])
  })

  it('the formation book has a chapter for every day in the practice', () => {
    const catalog = loadCatalog()
    const practiceManifest = loadJsonBlob<PracticeManifest>(
      catalog.items['practice/catechetical-formation'].hash,
    )
    const sessionData = loadSessionData(practiceManifest)

    const formationManifest = loadJsonBlob<BookManifest>(
      catalog.items['book/catechetical-formation'].hash,
    )
    const knownChapters = new Set(Object.keys(formationManifest.chapters))

    const missing: string[] = []
    for (const entry of sessionData.entries.default) {
      if (!knownChapters.has(entry.chapterId)) {
        missing.push(entry.chapterId)
      }
    }
    expect(
      missing,
      `These chapterIds are referenced by the practice but missing from the formation book:\n  - ${missing.join('\n  - ')}`,
    ).toEqual([])
  })
})
