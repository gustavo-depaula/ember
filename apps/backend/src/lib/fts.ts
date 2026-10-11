// Kept free of imports so the moderation desk, which runs under tsx, can use it too.

// User text → a safe FTS5 prefix query. Each alphanumeric token (Unicode-aware, so accented names
// work) becomes a quoted prefix term, e.g. `Sagra Fam` → `"sagra"* "fam"*` — enabling search-as-you-
// type while neutralizing FTS operator characters the user might type.
export function toPrefixMatchQuery(raw: string): string {
  const tokens = raw.match(/[\p{L}\p{N}]+/gu) ?? []
  return tokens.map((token) => `"${token}"*`).join(' ')
}
