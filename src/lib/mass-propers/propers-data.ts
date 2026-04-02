/**
 * Loads bundled Mass proper JSON files via require.context.
 *
 * Each JSON file has the shape:
 * {
 *   "Introitus": { "en": "...", "latin": "...", "pt-BR": "...", "citation": "..." },
 *   "Oratio": { ... },
 *   ...
 * }
 */

type RawProperSection = {
  en?: string
  latin?: string
  'pt-BR'?: string
  citation?: string
}

type RawProperFile = Record<string, RawProperSection>

const temporaCtx = require.context('../../assets/propers/tempora', false, /\.json$/)
const sanctiCtx = require.context('../../assets/propers/sancti', false, /\.json$/)

const temporaKeys = new Set(
  temporaCtx.keys().map((k: string) => k.replace(/^\.\//, '').replace(/\.json$/, '')),
)
const sanctiKeys = new Set(
  sanctiCtx.keys().map((k: string) => k.replace(/^\.\//, '').replace(/\.json$/, '')),
)

export function hasTempora(id: string): boolean {
  return temporaKeys.has(id)
}

export function hasSancti(id: string): boolean {
  return sanctiKeys.has(id)
}

export function loadTempora(id: string): RawProperFile | undefined {
  const key = `./${id}.json`
  if (!temporaKeys.has(id)) return undefined
  return temporaCtx(key) as RawProperFile
}

export function loadSancti(id: string): RawProperFile | undefined {
  const key = `./${id}.json`
  if (!sanctiKeys.has(id)) return undefined
  return sanctiCtx(key) as RawProperFile
}
