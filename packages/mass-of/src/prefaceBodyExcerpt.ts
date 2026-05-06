/**
 * Pull a short, *prayed* phrase out of a preface body — the bit a user
 * would actually hear at Mass — to use as the card-style excerpt.
 *
 * Why not the title's subtitle? "O mistério pascal" / "A vida nova em
 * Cristo" are the canonical Roman Missal subtitles. They look like
 * spoken text but aren't; they teach the user nothing about *what is
 * about to be prayed*. The user explicitly asked for "the words that
 * are prayed".
 *
 * Why not the body's first line? Every preface opens with the
 * boilerplate "Vere dignum / É verdadeiramente justo, é nosso dever e
 * salvação..." — identical across most prefaces. Useless for picking.
 *
 * Strategy: walk `preface.body.lines[lang]`, keep only `text` segments,
 * concatenate. (Fall back to `body.plain[lang]` and skip past the
 * `Na verdade…` opening if `lines` is missing or empty.) Find the
 * *latest* boilerplate-end marker in the first ~600 chars (e.g. "Senhor
 * nosso." / "todo-poderoso." / "em todo tempo,") and take everything
 * after it. Strip leading conjunctions ("mas,", "porque,", "but,",
 * "for,") that connect to the boilerplate. Truncate at the first
 * sentence boundary, falling back to a soft word cap. If the heuristic
 * finds nothing, return undefined and the caller falls back to the
 * title-subtitle.
 */

type RichSegment = { type?: string; text?: string }
type PrefaceLike = { body?: unknown }

const BOILERPLATE_END_MARKERS: Record<string, RegExp[]> = {
  'pt-BR': [
    /\bsenhor nosso\b[.,]?/gi,
    /\btodo[- ]poderoso\b[.,]?/gi,
    /\bem todo (?:o )?tempo\b[.,]?/gi,
    /\bem todo (?:o )?lugar\b[.,]?/gi,
  ],
  en: [
    /\bthrough christ our lord\b[.,]?/gi,
    /\balmighty (?:and eternal )?god\b[.,]?/gi,
    /\bat all times\b[.,]?/gi,
    /\bin every place\b[.,]?/gi,
  ],
  la: [
    /\bper christum dominum nostrum\b[.,]?/gi,
    /\bomn[ií]potens (?:ae|æ)t[eé]rne deus\b[.,]?/gi,
    /\bsemper et ub[ií]que\b[.,]?/gi,
  ],
}

const PRAYER_START_MARKERS: Record<string, RegExp> = {
  'pt-BR': /\bna verdade,\s+é digno e justo\b/i,
  en: /\bit is truly right (?:and just|and our duty)\b/i,
  la: /\bvere dignum et iustum est\b/i,
}

const LEADING_CONJUNCTION_RE = /^(?:mas|porque|but|for|sed|quia|enim|nam|etenim|que|e)[,.]?\s+/i

function bodyTextForLang(body: unknown, lang: string): string {
  if (!body || typeof body !== 'object') return ''
  const lines = (body as { lines?: Record<string, unknown> }).lines?.[lang]
  if (Array.isArray(lines)) {
    const parts: string[] = []
    for (const line of lines) {
      if (!Array.isArray(line)) continue
      for (const seg of line as RichSegment[]) {
        if (seg && seg.type === 'text' && typeof seg.text === 'string') parts.push(seg.text)
      }
    }
    if (parts.length > 0) return normalize(parts.join(' '))
  }
  const plain = (body as { plain?: Record<string, unknown> }).plain?.[lang]
  if (typeof plain === 'string') return normalize(plain)
  return ''
}

function normalize(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;])/g, '$1')
    .trim()
}

function stripThroughPrayerStart(text: string, lang: string): string {
  const startRe = PRAYER_START_MARKERS[lang]
  const m = startRe ? text.match(startRe) : null
  return m && m.index !== undefined ? text.slice(m.index) : text
}

function findLastBoilerplateEnd(text: string, markers: RegExp[]): number {
  const window = text.slice(0, 600)
  let maxEnd = -1
  for (const re of markers) {
    re.lastIndex = 0
    for (;;) {
      const m = re.exec(window)
      if (m === null) break
      const end = m.index + m[0].length
      if (end > maxEnd) maxEnd = end
    }
  }
  return maxEnd
}

function truncateAtSentence(s: string, max: number): string {
  if (s.length <= max) return s
  const slice = s.slice(0, max)
  const lastDot = slice.lastIndexOf('.')
  if (lastDot > Math.floor(max * 0.4)) return slice.slice(0, lastDot + 1).trim()
  const lastSpace = slice.lastIndexOf(' ')
  return `${(lastSpace > 0 ? slice.slice(0, lastSpace) : slice).trim()}…`
}

function excerptForLang(preface: PrefaceLike, lang: string): string | undefined {
  const text = stripThroughPrayerStart(bodyTextForLang(preface.body, lang), lang)
  const markers = BOILERPLATE_END_MARKERS[lang]
  if (!text || !markers) return undefined
  const end = findLastBoilerplateEnd(text, markers)
  if (end < 0) return undefined

  let after = text.slice(end).trim()
  for (let i = 0; i < 3; i++) {
    const next = after.replace(LEADING_CONJUNCTION_RE, '')
    if (next === after) break
    after = next.trim()
  }
  if (after.length < 20) return undefined
  return truncateAtSentence(after, 160)
}

export function prefaceBodyExcerpts(preface: PrefaceLike): {
  'pt-BR'?: string
  'en-US'?: string
  la?: string
} {
  return {
    'pt-BR': excerptForLang(preface, 'pt-BR'),
    'en-US': excerptForLang(preface, 'en'),
    la: excerptForLang(preface, 'la'),
  }
}
