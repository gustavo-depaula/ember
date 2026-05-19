// Param validators for ContentSource `fetch()`. Throwing here surfaces as
// a useQuery error in the preprocessor and routes through the practice-level
// retry UI.

type Params = Record<string, unknown> | undefined

export function requireString(producerId: string, params: Params, key: string): string {
  const v = params?.[key]
  if (typeof v !== 'string' || v.length === 0)
    throw new Error(`${producerId}: param "${key}" must be a non-empty string (got ${String(v)})`)
  return v
}

export function requirePositiveInt(producerId: string, params: Params, key: string): number {
  const raw = params?.[key]
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  if (!Number.isInteger(n) || n < 1)
    throw new Error(`${producerId}: param "${key}" must be a positive integer (got ${String(raw)})`)
  return n
}

export function requireArray<T>(producerId: string, params: Params, key: string): T[] {
  const raw = params?.[key]
  if (!Array.isArray(raw) || raw.length === 0)
    throw new Error(`${producerId}: param "${key}" must be a non-empty array`)
  return raw as T[]
}
