import type { Lang, Line, Localized, OrderChoiceOption, OrderSegment, RichText } from '@ember/missal-schema'
import { langs } from '@ember/missal-schema'

/**
 * The upstream separates interchangeable formulas with a localized "Or"
 * rubric. The set is small and closed; matching it per language lets one pass
 * carve the greeting's eight formulas, the Our Father's invitations, etc. The
 * marker must be a *rubric* line (prayer text starting with "O…" is never a
 * marker), so false positives can't happen.
 */
const orMarker: Partial<Record<Lang, RegExp>> = {
  'pt-BR': /^ou\b/i,
  la: /^vel\b/i,
  'en-US': /^or\b/i,
  es: /^o bien\b/i,
  it: /^oppure\b/i,
  fr: /^ou\b/i,
  de: /^oder\b/i,
}

/** A bare-ordinal option label ("1", "2", …) — used when the alternatives have
 * no natural short name (greeting formulas, invitations). Language-independent. */
export function ordinalLabel(i: number): Localized {
  const n = String(i + 1)
  return { 'pt-BR': n, 'en-US': n, la: n }
}

const joinLine = (line: Line): string => line.map((s) => s.text).join('')
const isRubricOnly = (line: Line): boolean =>
  line.length > 0 && line.every((s) => s.type === 'rubric')
const isMarker = (line: Line, lang: Lang): boolean => {
  const re = orMarker[lang]
  return Boolean(re && isRubricOnly(line) && re.test(joinLine(line).trim()))
}

interface SplitLang {
  intro: Line[]
  alternates: Line[][]
  continuation: Line[]
}

/**
 * Split one language's lines into: leading stage-direction rubrics (intro),
 * the run of pick-one alternatives (separated by "Or" markers), and the shared
 * continuation that follows (the people's response, the fixed prayer, …). The
 * alternates run ends at the first non-marker rubric after the first
 * alternative — that rubric is a stage direction introducing the shared part.
 */
function splitLang(lines: Line[], lang: Lang): SplitLang {
  const intro: Line[] = []
  let i = 0
  while (i < lines.length && isRubricOnly(lines[i]) && !isMarker(lines[i], lang)) {
    intro.push(lines[i])
    i++
  }
  const alternates: Line[][] = [[]]
  let started = false
  for (; i < lines.length; i++) {
    const line = lines[i]
    if (isMarker(line, lang)) {
      alternates.push([]) // the marker itself is a separator — dropped
      continue
    }
    // The alternatives are prayed text; the shared continuation opens with a
    // stage direction. Break at the first line that STARTS with a rubric (even
    // a mixed rubric+text line like "Após um momento de silêncio… o sacerdote
    // diz:"), not only rubric-only lines.
    if (started && line[0]?.type === 'rubric') break
    alternates[alternates.length - 1].push(line)
    started = true
  }
  return { intro, alternates: alternates.filter((a) => a.length > 0), continuation: lines.slice(i) }
}

const collect = (per: Partial<Record<Lang, Line[]>>): RichText => ({ lines: per })
const nonEmpty = (rt: RichText): boolean => Object.keys(rt.lines).length > 0

/**
 * Turn a body whose head is a run of interchangeable formulas into segments:
 * `[text(intro)?, choice(formulas), text(continuation)?]`. Options are
 * assembled by index across languages (option 0 = each language's first
 * formula, the editio-typica one); languages with national additions simply
 * contribute more options. Returns `undefined` when no language has ≥2
 * alternatives, so the caller keeps the flat body.
 */
export function splitAlternates(
  body: RichText,
  choiceLabel: Localized,
  optionLabel: (i: number) => Localized,
): OrderSegment[] | undefined {
  const per = langs
    .map((l) => [l, body.lines[l]] as const)
    .filter((e): e is [Lang, Line[]] => Boolean(e[1]?.length))
    .map(([l, lines]) => [l, splitLang(lines, l)] as const)
  if (per.length === 0) return undefined

  const maxAlternates = Math.max(...per.map(([, s]) => s.alternates.length))
  if (maxAlternates < 2) return undefined

  const out: OrderSegment[] = []

  const intro = collect(Object.fromEntries(per.map(([l, s]) => [l, s.intro]).filter(([, v]) => (v as Line[]).length)))
  if (nonEmpty(intro)) out.push({ kind: 'text', body: intro })

  const options: OrderChoiceOption[] = []
  for (let k = 0; k < maxAlternates; k++) {
    const optBody = collect(
      Object.fromEntries(
        per.map(([l, s]) => [l, s.alternates[k]]).filter(([, v]) => (v as Line[] | undefined)?.length),
      ),
    )
    options.push({ label: optionLabel(k), segments: [{ kind: 'text', body: optBody }] })
  }
  out.push({ kind: 'choice', label: choiceLabel, options })

  const cont = collect(Object.fromEntries(per.map(([l, s]) => [l, s.continuation]).filter(([, v]) => (v as Line[]).length)))
  if (nonEmpty(cont)) out.push({ kind: 'text', body: cont })

  return out
}
