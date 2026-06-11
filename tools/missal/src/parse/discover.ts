import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { Category, SourceLang } from './types'
import { alignedCategories, sourceLangs } from './types'

export interface AlignedFile {
  category: Category
  basename: string
  langPaths: Partial<Record<SourceLang, string>>
  estructuraPath?: string
}

function basenameFor(lang: SourceLang | '', filename: string): string {
  const stem = filename.replace(/\.html?$/i, '')
  const prefixLang = `m_${lang}_`
  if (lang && stem.startsWith(prefixLang)) return stem.slice(prefixLang.length)
  if (stem.startsWith('m_estructura_')) return stem.slice('m_estructura_'.length)
  return stem
}

function htmlFiles(dir: string): string[] {
  try {
    return readdirSync(dir)
      .filter((f) => /\.html?$/i.test(f))
      .sort()
  } catch {
    return []
  }
}

/**
 * Discover the aligned categories under <sourceRoot>/misal_v2: per-language
 * content files keyed by canonical basename, plus the matching estructura file.
 */
export function discoverAligned(sourceRoot: string): AlignedFile[] {
  const root = join(sourceRoot, 'misal_v2')
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
    throw new Error(`Not a Missale_romanum clone (missing misal_v2/): ${sourceRoot}`)
  }

  const out: AlignedFile[] = []
  for (const category of alignedCategories) {
    const byBasename = new Map<string, AlignedFile>()

    for (const lang of sourceLangs) {
      const dir = join(root, `m_${lang}`, category)
      for (const f of htmlFiles(dir)) {
        const basename = basenameFor(lang, f)
        let entry = byBasename.get(basename)
        if (!entry) {
          entry = { category, basename, langPaths: {} }
          byBasename.set(basename, entry)
        }
        entry.langPaths[lang] = join(dir, f)
      }
    }

    const estrDir = join(root, 'm_estructura', category)
    for (const f of htmlFiles(estrDir)) {
      const basename = basenameFor('', f)
      const entry = byBasename.get(basename)
      if (entry) entry.estructuraPath = join(estrDir, f)
      else byBasename.set(basename, { category, basename, langPaths: {}, estructuraPath: join(estrDir, f) })
    }

    out.push(...[...byBasename.values()].sort((a, b) => a.basename.localeCompare(b.basename)))
  }
  return out
}
