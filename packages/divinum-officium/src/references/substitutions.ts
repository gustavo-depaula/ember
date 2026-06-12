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
      const template = g.r ?? ''
      out = out.replace(new RegExp(toJsPattern(g.s, g.f ?? ''), g.f ?? ''), (...args) =>
        applyPerlReplacement(template, args),
      )
    }
  }
  return out
}

// Perl applies the substitution through a double-quoted eval: \n/\t
// interpolate, $1/\1 are group references, and \u titlecases the next
// character — including the first character of a following group reference
// (e.g. `s/.*; (.)/\u$1/`). Unknown \X drops the backslash.
function applyPerlReplacement(template: string, args: unknown[]): string {
  const groups: string[] = []
  for (let i = 1; i < args.length && typeof args[i] === 'string'; i++) {
    groups[i] = args[i] as string
  }
  let out = ''
  let titlecaseNext = false
  const emit = (s: string) => {
    if (titlecaseNext && s) {
      out += s[0].toUpperCase() + s.slice(1)
      titlecaseNext = false
    } else {
      out += s
    }
  }
  for (let i = 0; i < template.length; i++) {
    const c = template[i]
    if (c === '\\') {
      const next = template[i + 1] ?? ''
      i++
      if (next === 'n') emit('\n')
      else if (next === 't') emit('\t')
      else if (next === 'u') titlecaseNext = true
      else if (next === 'l') {
        // \l lowercases the next character.
        const rest = template.slice(i + 1)
        if (rest) {
          // handled by falling through with a lowercased emit on next char
          // (approximation: lowercase the immediate literal)
          const ch = rest[0]
          out += ch.toLowerCase()
          i++
        }
      } else if (/[1-9]/.test(next)) emit(groups[Number(next)] ?? '')
      else emit(next)
    } else if (c === '$' && /[1-9]/.test(template[i + 1] ?? '')) {
      emit(groups[Number(template[i + 1])] ?? '')
      i++
    } else {
      emit(c)
    }
  }
  return out
}
