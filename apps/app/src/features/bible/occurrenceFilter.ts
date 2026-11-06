/**
 * Narrowing a word's occurrences by its form: every Hiphil imperative of
 * שׁוב, every aorist passive of λύω. Each occurrence is read into a form —
 * feature → value, `{ stem: 'hiphil', form: 'imperative' }` — and the filter
 * offers, feature by feature, only the values the word really takes.
 */
export type Form = Record<string, string | undefined>

export type Facet = { feature: string; values: { value: string; count: number }[] }

/**
 * The features worth choosing by, in `order`, each with the values it takes
 * among `forms` and how often. A feature with one value narrows nothing, so it
 * is left out. Counts are within what `selection` already leaves, so a chip
 * never promises what choosing it would not show.
 */
export function facetsOf(forms: Form[], order: string[], selection: Form = {}): Facet[] {
  return order.flatMap((feature) => {
    // Count against the other features' choices, not this one's, so the
    // chosen chip's siblings stay offered with their own counts.
    const others = { ...selection, [feature]: undefined }
    const counts = new Map<string, number>()
    for (const form of forms) {
      const value = form[feature]
      if (value === undefined || !matches(form, others)) continue
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
    if (counts.size < 2 && selection[feature] === undefined) return []
    const values = [...counts].map(([value, count]) => ({ value, count }))
    return [{ feature, values: values.sort((a, b) => b.count - a.count) }]
  })
}

/** Whether a form has every value chosen. */
export function matches(form: Form, selection: Form): boolean {
  return Object.entries(selection).every(
    ([feature, value]) => value === undefined || form[feature] === value,
  )
}

/** The places, each once, in their order: a word twice in a verse is one line in the list. */
export function distinctPlaces<P extends readonly [string, number, number, ...unknown[]]>(
  places: P[],
): P[] {
  const seen = new Set<string>()
  return places.filter(([book, chapter, verse]) => {
    const key = `${book} ${chapter}:${verse}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
