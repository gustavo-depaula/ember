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

export function substituteTemplateVars(text: string, vars: Record<string, unknown>): string {
  return text.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    const value = walkVarPath(vars, path)
    if (value === undefined || value === null) return match
    return typeof value === 'string' ? value : String(value)
  })
}

export function deepSubstitute(obj: unknown, vars: Record<string, unknown>): unknown {
  if (typeof obj === 'string') {
    // Whole-string `{{path}}` returns the raw value — lets includes pass
    // arrays/objects through (e.g. `params: { psalms: "{{psalms}}" }`).
    const whole = obj.match(/^\{\{([\w.]+)\}\}$/)
    if (whole?.[1]) {
      const value = walkVarPath(vars, whole[1])
      return value !== undefined ? value : obj
    }
    return substituteTemplateVars(obj, vars)
  }
  if (Array.isArray(obj)) return obj.map((item) => deepSubstitute(item, vars))
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      result[k] = deepSubstitute(v, vars)
    }
    return result
  }
  return obj
}

export function substituteInFlowSection(
  section: FlowSection,
  vars: Record<string, unknown>,
): FlowSection {
  return deepSubstitute(section, vars) as FlowSection
}
