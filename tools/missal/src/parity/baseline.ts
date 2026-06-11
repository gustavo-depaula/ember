import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Old-corpus (ember-extra) language keys. Note: `en`, not `en-US`. */
export const baselineLangs = ['la', 'es', 'en', 'pt-BR', 'it', 'fr', 'de'] as const
export type BaselineLang = (typeof baselineLangs)[number]

const baselineLangSet = new Set<string>(baselineLangs)

export interface BaselineMass {
  id: string
  path: string
  /** Every localized string in the file (titles, plain bodies, citations…). */
  strings: Array<{ lang: BaselineLang; text: string }>
}

/**
 * Collect every localized string from an old-corpus mass JSON: any object
 * whose keys are corpus language codes with string values is a Localized /
 * plain block. `lines` subtrees are skipped — their text duplicates `plain`.
 */
export function extractStrings(value: unknown): BaselineMass['strings'] {
  const out: BaselineMass['strings'] = []

  function walk(node: unknown): void {
    if (Array.isArray(node)) {
      for (const item of node) walk(item)
      return
    }
    if (node === null || typeof node !== 'object') return
    const obj = node as Record<string, unknown>

    const keys = Object.keys(obj)
    const langKeys = keys.filter((k) => baselineLangSet.has(k))
    if (langKeys.length > 0 && langKeys.every((k) => typeof obj[k] === 'string')) {
      for (const k of langKeys) {
        const text = obj[k] as string
        if (text.trim()) out.push({ lang: k as BaselineLang, text })
      }
      // A Localized object can't also contain nested content worth walking.
      const rest = keys.filter((k) => !baselineLangSet.has(k))
      for (const k of rest) walk(obj[k])
      return
    }

    for (const [k, v] of Object.entries(obj)) {
      if (k === 'lines') continue // duplicates plain at text level
      walk(v)
    }
  }

  walk(value)
  return out
}

function jsonFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...jsonFiles(path))
    else if (entry.name.endsWith('.json')) out.push(path)
  }
  return out.sort()
}

/** Load all masses from the old corpus' data/masses tree. */
export function loadBaselineMasses(baselineDataDir: string): BaselineMass[] {
  const out: BaselineMass[] = []
  for (const path of jsonFiles(join(baselineDataDir, 'masses'))) {
    const data = JSON.parse(readFileSync(path, 'utf-8')) as { id?: string }
    if (!data.id) continue
    out.push({ id: data.id, path, strings: extractStrings(data) })
  }
  return out
}
