/**
 * Recombine a per-language-split structure (shape + per-language payloads)
 * into the multilingual shape that v1 callers (mass-of, etc.) expect.
 *
 * Build pipeline emits, for OF Mass propers:
 *   - shape:    the JSON tree with every localized leaf replaced by `null`
 *   - per-lang: the JSON tree with every localized leaf collapsed to that
 *               language's value
 *
 * This function walks both in parallel and rebuilds `{ [lang]: value }` at
 * every site where shape was `null`. Pure — no I/O or React dependencies.
 */

export function mergeLangs(shape: unknown, payloads: Record<string, unknown>): unknown {
  if (shape === null) {
    const merged: Record<string, unknown> = {}
    for (const [lang, payload] of Object.entries(payloads)) {
      if (payload !== null && payload !== undefined) merged[lang] = payload
    }
    return merged
  }
  if (Array.isArray(shape)) {
    return shape.map((v, i) =>
      mergeLangs(
        v,
        Object.fromEntries(Object.entries(payloads).map(([l, p]) => [l, (p as unknown[])?.[i]])),
      ),
    )
  }
  if (shape && typeof shape === 'object') {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(shape)) {
      out[k] = mergeLangs(
        (shape as Record<string, unknown>)[k],
        Object.fromEntries(
          Object.entries(payloads).map(([l, p]) => [
            l,
            (p as Record<string, unknown> | null | undefined)?.[k],
          ]),
        ),
      )
    }
    return out
  }
  return shape
}
