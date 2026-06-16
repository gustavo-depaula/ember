// Port of the conditional-directive grammar from Divinum Officium's
// web/cgi-bin/DivinumOfficium/SetupString.pl. The regexes mirror the Perl
// originals exactly — including their quirks (only the last repeated stopword
// is captured; the scope phrase can match empty) — because every data file was
// authored against that engine. Evaluation (vero) happens at runtime per
// rubric version; this module only recognizes and decomposes the syntax.

export type ConditionalDirective = {
  // Raw captured stopword. Perl's `($stopwords_regex\b)*` keeps only the last
  // repetition, so in practice this is a single word ('', 'si', 'sed', …).
  stopwords: string
  // Raw condition expression ('rubrica 1960', 'tempore paschali et feria 2', …).
  expr: string
  // Raw scope/instruction phrase ('', 'dicitur', 'hi versus omittuntur', …).
  scope: string
}

export type LineConditional = ConditionalDirective & {
  // Content remaining on the line after the conditional directive.
  sequel: string
}

const stopwordsPattern = 'sed|vero|atque|attamen|si|deinde'

const scopePattern = [
  '(?:\\bloco\\s+(?:hu[ij]us\\s+versus|horum\\s+versuum)\\b)?',
  '\\s*',
  '(?:\\b(?:',
  '(?:dicitur|dicuntur)(?:\\s+semper)?',
  '|(?:hic\\s+versus\\s+)?omittitur',
  '|(?:hoc\\s+versus\\s+)?omittitur',
  '|(?:hæc\\s+versus\\s+)?omittuntur',
  '|(?:hi\\s+versus\\s+)?omittuntur',
  '|(?:haec\\s+versus\\s+)?omittuntur',
  ')\\b)?',
].join('')

const conditionalPattern = `\\(\\s*((?:${stopwordsPattern})\\b)*(.*?)(${scopePattern})?\\s*\\)`

const lineConditionalRegex = new RegExp(`^\\s*${conditionalPattern}\\s*(.*)$`, 'i')

// Mirrors process_conditional_lines' `^\s*$conditional_regex\s*(.*)$` check.
export function matchLineConditional(line: string): LineConditional | undefined {
  if (!line.includes('(')) return undefined
  const m = lineConditionalRegex.exec(line)
  if (!m) return undefined
  // Trimming mirrors Perl's effective handling: vero() strips the expression,
  // and the scope/stopword regexes are unanchored.
  return {
    stopwords: (m[1] ?? '').trim(),
    expr: (m[2] ?? '').trim(),
    scope: (m[3] ?? '').trim(),
    sequel: m[4] ?? '',
  }
}

const sectionHeaderRegex = new RegExp(
  `^\\s*\\[([\\p{L}\\p{N}_ #,:-]+)\\](?:\\s*${conditionalPattern})?`,
  'iu',
)

export type SectionHeader = {
  name: string
  // Raw condition expression. Perl only consults the expression at section
  // headers (stopwords and scope are matched but ignored); absent or empty
  // both mean "section applies".
  condition?: string
}

// Mirrors setupstring_parse_file's header detection: the line must literally
// start with '[' (no leading whitespace, despite the regex's `^\s*`).
export function matchSectionHeader(line: string): SectionHeader | undefined {
  if (!line.startsWith('[')) return undefined
  const m = sectionHeaderRegex.exec(line)
  if (!m) return undefined
  const condition = m[3]?.trim()
  return condition ? { name: m[1], condition } : { name: m[1] }
}
