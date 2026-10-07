import type { FlowSection } from '../types'

export function walkVarPath(vars: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.')
  const first = segments[0]
  if (first === undefined) return undefined
  let value: unknown = vars[first]
  for (let i = 1; i < segments.length; i++) {
    if (value === null || value === undefined) return undefined
    if (typeof value !== 'object') return undefined
    const seg = segments[i]
    if (seg === undefined) return undefined
    value = (value as Record<string, unknown>)[seg]
  }
  return value
}

export function isLocalized(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    ('en-US' in value || 'pt-BR' in value)
  )
}

function pickLanguage(text: Record<string, unknown>, language: string): unknown {
  return text[language] ?? text['en-US'] ?? text['pt-BR'] ?? Object.values(text).find(Boolean) ?? ''
}

// A var may itself be localized (a repeat entry's `name`, the `ordinal`). It
// takes the language of the string it lands in, so a heading template and the
// values spliced into it can never come from two different languages.
export function substituteTemplateVars(
  text: string,
  vars: Record<string, unknown>,
  language: string,
): string {
  return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const found = walkVarPath(vars, path)
    const value = isLocalized(found) ? pickLanguage(found, language) : found
    if (value === undefined || value === null) return match
    return typeof value === 'string' ? value : String(value)
  })
}

export function deepSubstitute(
  obj: unknown,
  vars: Record<string, unknown>,
  language: string,
): unknown {
  if (typeof obj === 'string') {
    // Whole-string `{{path}}` returns the raw value — lets includes pass
    // arrays/objects through (e.g. `params: { psalms: "{{psalms}}" }`), and
    // hands a localized var on whole so the renderer still sees every language.
    const whole = obj.match(/^\{\{([\w.]+)\}\}$/)
    if (whole?.[1]) {
      const value = walkVarPath(vars, whole[1])
      return value !== undefined ? value : obj
    }
    return substituteTemplateVars(obj, vars, language)
  }
  if (Array.isArray(obj)) return obj.map((item) => deepSubstitute(item, vars, language))
  if (isLocalized(obj)) {
    return Object.fromEntries(
      Object.entries(obj).map(([lang, v]) => {
        const out = deepSubstitute(v, vars, lang)
        return [lang, isLocalized(out) ? pickLanguage(out, lang) : out]
      }),
    )
  }
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      result[k] = deepSubstitute(v, vars, language)
    }
    return result
  }
  return obj
}

export function substituteInFlowSection(
  section: FlowSection,
  vars: Record<string, unknown>,
  language: string,
): FlowSection {
  return deepSubstitute(section, vars, language) as FlowSection
}
