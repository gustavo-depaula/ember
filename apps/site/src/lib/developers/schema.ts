// Reading the OpenAPI document's JSON Schemas as the API reference shows them: a type label
// whose named schemas link to their own entry, and an object's fields as rows.

export type JsonSchema = {
  $ref?: string
  type?: string
  const?: unknown
  enum?: unknown[]
  items?: JsonSchema
  anyOf?: JsonSchema[]
  oneOf?: JsonSchema[]
  allOf?: JsonSchema[]
  properties?: Record<string, JsonSchema>
  required?: string[]
  description?: string
  default?: unknown
  minimum?: number
  maximum?: number
  exclusiveMinimum?: number
  maxLength?: number
  minLength?: number
  maxItems?: number
  pattern?: string
  format?: string
}

export type TypePart = { text: string; schema?: string }

export const schemaAnchor = (name: string) => `schema-${name}`
const refName = (ref: string) => ref.slice(ref.lastIndexOf('/') + 1)

/**
 * `Church[]`, `string | null`, `{ churches: Church[], next?: string }`: a schema as a type, its
 * named parts linkable. `shape: false` names an object `object`, for a row whose fields follow it.
 */
export function typeParts(schema: JsonSchema, { shape = true } = {}): TypePart[] {
  if (schema.$ref) {
    const name = refName(schema.$ref)
    return [{ text: name, schema: name }]
  }
  if (schema.const !== undefined) return [{ text: JSON.stringify(schema.const) }]
  if (schema.enum) return [{ text: schema.enum.map((v) => JSON.stringify(v)).join(' | ') }]
  const union = schema.anyOf ?? schema.oneOf
  if (union)
    return joinParts(
      union.map((s) => typeParts(s)),
      ' | ',
    )
  if (schema.allOf)
    return joinParts(
      schema.allOf.map((s) => typeParts(s)),
      ' & ',
    )
  if (schema.type === 'array') {
    const items = schema.items ?? {}
    // `A | B[]` would read as a union with an array: a compound item type keeps its parentheses.
    const compound = (items.anyOf ?? items.oneOf ?? items.allOf ?? []).length > 1
    const inner = typeParts(items)
    return (
      compound ? [{ text: '(' }, ...inner, { text: ')[]' }] : [...inner, { text: '[]' }]
    ).reduce(mergeText, [])
  }
  if (schema.type === 'object' && schema.properties) {
    if (!shape) return [{ text: 'object' }]
    const fields = Object.entries(schema.properties).map(([name, field]) => [
      { text: `${name}${schema.required?.includes(name) ? '' : '?'}: ` },
      ...typeParts(field),
    ])
    return [{ text: '{ ' }, ...joinParts(fields, ', '), { text: ' }' }].reduce(mergeText, [])
  }
  return [{ text: schema.format === 'binary' ? 'bytes' : (schema.type ?? 'any') }]
}

function joinParts(parts: TypePart[][], separator: string): TypePart[] {
  return parts
    .flatMap((p, i) => (i ? [{ text: separator }, ...p] : p))
    .reduce(mergeText, [] as TypePart[])
}

// Adjacent plain text reads as one run.
function mergeText(out: TypePart[], part: TypePart): TypePart[] {
  const last = out[out.length - 1]
  if (last && !last.schema && !part.schema)
    return [...out.slice(0, -1), { text: last.text + part.text }]
  return [...out, part]
}

/** The limits a field's schema sets, in words: `1–100`, `default 25`, `matches ^…$`. */
export function constraints(schema: JsonSchema): string[] {
  const out: string[] = []
  const min = schema.minimum ?? schema.exclusiveMinimum
  const lowerBound = schema.exclusiveMinimum !== undefined ? `> ${min}` : `≥ ${min}`
  // zod writes a bare integer's ceiling as Number.MAX_SAFE_INTEGER: no limit worth stating.
  const max =
    schema.maximum !== undefined && schema.maximum < 2 ** 53 - 1 ? schema.maximum : undefined
  if (min !== undefined && max !== undefined && schema.exclusiveMinimum === undefined)
    out.push(`${min}–${max}`)
  else {
    if (min !== undefined) out.push(lowerBound)
    if (max !== undefined) out.push(`≤ ${max}`)
  }
  if (schema.minLength !== undefined) out.push(`at least ${schema.minLength} characters`)
  if (schema.maxLength !== undefined) out.push(`at most ${schema.maxLength} characters`)
  if (schema.maxItems !== undefined) out.push(`at most ${schema.maxItems} items`)
  if (schema.pattern) out.push(`matches ${schema.pattern}`)
  if (schema.default !== undefined) out.push(`default ${JSON.stringify(schema.default)}`)
  return out
}

export type FieldRow = { name: string; required: boolean; schema: JsonSchema; depth: number }

/** An object's fields, with the fields of an inline object nested beneath their parent. */
export function fieldRows(schema: JsonSchema, depth = 0): FieldRow[] {
  return Object.entries(schema.properties ?? {}).flatMap(([name, field]) => [
    { name, required: schema.required?.includes(name) ?? false, schema: field, depth },
    ...(field.type === 'object' && field.properties ? fieldRows(field, depth + 1) : []),
  ])
}
