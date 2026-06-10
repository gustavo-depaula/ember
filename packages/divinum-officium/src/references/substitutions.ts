// Port of SetupString.pl::do_inclusion_substitutions — the `:…` tail of an
// @-inclusion: s/pattern/replacement/flags edits and 1-based line selections
// (`3`, `2-5`, `!4` to deselect). Patterns are Perl regexes in the data; the
// simple ones in use translate directly to JS. A pattern JS can't compile is a
// data/upstream problem and throws.

const subRegex =
  /(?:s\/(?<s>[^/]*)\/(?<r>[^/]*)\/(?<f>[gism]*))|(?:(?<n>!?)(?<b>\d+)(-(?<e>\d+))?)/g

// Perl's `$` without /m matches at end-of-string OR just before a final
// newline; JS's matches only at the absolute end. Rewrite unescaped `$`
// anchors (outside character classes) to a lookahead with Perl semantics.
function toJsPattern(pattern: string, flags: string): string {
  if (flags.includes('m') || !pattern.includes('$')) return pattern
  let out = ''
  let inClass = false
  for (let i = 0; i < pattern.length; i++) {
    const c = pattern[i]
    if (c === '\\') {
      out += c + (pattern[i + 1] ?? '')
      i++
    } else if (c === '[') {
      inClass = true
      out += c
    } else if (c === ']') {
      inClass = false
      out += c
    } else if (c === '$' && !inClass) {
      out += '(?=\\n?$)'
    } else {
      out += c
    }
  }
  return out
}

export function applyInclusionSubstitutions(text: string, subs: string): string {
  let out = text
  for (const m of subs.matchAll(subRegex)) {
    const g = m.groups ?? {}
    if (g.b) {
      const start = Number(g.b) - 1
      const count = g.e ? Number(g.e) - start : 1
      // Perl's split drops trailing empty fields.
      const lines = out.split('\n')
      while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
      const selected = lines.splice(start, count)
      out = `${(g.n ? lines : selected).join('\n')}\n`
    } else if (g.s !== undefined) {
      // Perl applies the substitution through a double-quoted eval, so escape
      // sequences in the replacement interpolate (\n → newline; unknown \X
      // drops the backslash). $1-style references work the same in JS.
      const replacement = (g.r ?? '').replace(/\\(.)/g, (_, c: string) =>
        c === 'n' ? '\n' : c === 't' ? '\t' : c,
      )
      out = out.replace(new RegExp(toJsPattern(g.s, g.f ?? ''), g.f ?? ''), replacement)
    }
  }
  return out
}
