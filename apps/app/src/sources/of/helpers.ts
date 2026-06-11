import type { BilingualRichText, BilingualText, RichTextLine } from '@ember/content-engine'
import type { Lang, Localized, Prayer, PrayerOption, RichText } from '@ember/missal-schema'
import type {
  CalloutPrimitive,
  ChoiceRichTextOption,
  ContainerPrimitive,
  Primitive,
  VersesPrimitive,
} from '@/content/primitives'

/** Which languages the renderer pairs: primary always shown, secondary optional. */
export interface LangPrefs {
  primary: Lang
  secondary?: Lang
}

export function bt(loc: Localized | undefined, lang: LangPrefs): BilingualText | undefined {
  if (!loc) return undefined
  const primary =
    loc[lang.primary] ?? loc['pt-BR'] ?? loc['en-US'] ?? loc.la ?? Object.values(loc)[0]
  if (primary === undefined) return undefined
  const secondary = lang.secondary ? loc[lang.secondary] : undefined
  const out: BilingualText = { primary }
  if (secondary) out.secondary = secondary
  else if (lang.secondary) out.secondaryMissing = true
  return out
}

const emptyText: BilingualText = { primary: '' }
export const textOr = (
  loc: Localized | undefined,
  lang: LangPrefs,
  fallback = emptyText,
): BilingualText => bt(loc, lang) ?? fallback

export function brt(rt: RichText | undefined, lang: LangPrefs): BilingualRichText | undefined {
  if (!rt) return undefined
  const primary = (rt.lines[lang.primary] ??
    rt.lines['pt-BR'] ??
    rt.lines.la ??
    []) as RichTextLine[]
  const secondary = lang.secondary
    ? (rt.lines[lang.secondary] as RichTextLine[] | undefined)
    : undefined
  const out: BilingualRichText = { primary }
  if (secondary) out.secondary = secondary
  return out
}

export function text(value: BilingualText, style?: 'normal' | 'italic'): Primitive {
  return { type: 'text', text: value, ...(style ? { style } : {}) }
}

export const rubric = (value: BilingualText): Primitive => ({ type: 'rubric', text: value })
export const heading = (value: BilingualText, size: 'h1' | 'h2' = 'h2'): Primitive => ({
  type: 'heading',
  text: value,
  size,
})
export const divider: Primitive = { type: 'divider' }

export function sectionMarker(pt: string, en: string): CalloutPrimitive {
  return { type: 'callout', variant: 'section-marker', title: { primary: pt, secondary: en } }
}

export const group = (children: Primitive[]): ContainerPrimitive => ({
  type: 'container',
  behavior: { kind: 'group' },
  children,
})

export function collapsible(
  title: BilingualText,
  children: Primitive[],
  defaultOpen = false,
): ContainerPrimitive {
  return { type: 'container', behavior: { kind: 'collapsible', title, defaultOpen }, children }
}

export function colorScope(
  color: CalloutPrimitive['color'],
  children: Primitive[],
): ContainerPrimitive {
  return { type: 'container', behavior: { kind: 'color-scope', color: color ?? 'green' }, children }
}

export function choiceOption(
  id: string,
  label: BilingualText,
  opt: PrayerOption,
  lang: LangPrefs,
): ChoiceRichTextOption {
  const out: ChoiceRichTextOption = { id, label, body: brt(opt.body, lang) ?? { primary: [] } }
  const citation = bt(opt.body.citation, lang)
  if (citation) out.citation = citation
  return out
}

/** A people's-response rich text (rendered with the ℟ mark) from a localized
 * one-liner — the fixed "Amém"/"Graças a Deus"/"Glória a vós" replies. */
export function responseRichText(loc: Localized, lang: LangPrefs): BilingualRichText | undefined {
  const primary = loc[lang.primary] ?? loc['pt-BR'] ?? loc['en-US'] ?? loc.la
  if (!primary) return undefined
  const out: BilingualRichText = { primary: [[{ type: 'response', text: primary }]] }
  const sec = lang.secondary ? loc[lang.secondary] : undefined
  if (sec) out.secondary = [[{ type: 'response', text: sec }]]
  return out
}

/** Join a line's segments into one string — a drop-cap glues to the next word
 * ("G" + "lória" → "Glória"), everything else is space-separated. */
export function joinLine(line: { type: string; text: string }[]): string {
  let out = ''
  let glue = false
  for (const s of line) {
    if (out === '') out = s.text
    else out += (glue ? '' : ' ') + s.text
    glue = s.type === 'dropCap'
  }
  return out
}

type Seg = { type: string; text: string }
const vrMarkerRe = /^[VR]\s*\/\.?/

/** A versicle/response line carries a "V/." or "R/." marker, or (the people's
 * acclamations) is made entirely of `response` segments. Returns the role. */
function vrRole(line: Seg[]): 'v' | 'r' | undefined {
  const first = line[0]
  if (first?.type === 'rubric') {
    const m = vrMarkerRe.exec(first.text.trim())
    if (m) return first.text.trim()[0] === 'V' ? 'v' : 'r'
  }
  if (line.length > 0 && line.every((s) => s.type === 'response')) return 'r'
  return undefined
}

/** Drop a leading "V/."/"R/." marker segment; join the rest of the line. */
function withoutMarker(line: Seg[]): string {
  const first = line[0]
  return first?.type === 'rubric' && vrMarkerRe.test(first.text.trim())
    ? joinLine(line.slice(1))
    : joinLine(line)
}

/**
 * Render a RichText as primitives, faithful to who-says-what:
 *  - rubric lines → burgundy stage directions;
 *  - versicle/response lines (V/. ℣, R/. ℟, or the people's `response` parts) →
 *    grouped into a `verses` vr block with the proper liturgical marks;
 *  - a mixed rubric+text line is classified by its opening segment — a line that
 *    opens with a stage direction is a rubric (quoted prayer fragments like
 *    "(Kýrie, eléison)" stay inline, never broken onto their own line);
 *  - everything else → bilingual body text.
 * Used for the fixed Order-of-Mass frames where there's no picker.
 */
export function lines(rt: RichText | undefined, lang: LangPrefs): Primitive[] {
  if (!rt) return []
  const primary = rt.lines[lang.primary] ?? rt.lines['pt-BR'] ?? rt.lines.la ?? []
  const secondary = lang.secondary ? rt.lines[lang.secondary] : undefined
  const out: Primitive[] = []
  let vr: VersesPrimitive['items'] = []
  const flushVr = () => {
    if (vr.length > 0) out.push({ type: 'verses', style: 'vr', items: vr })
    vr = []
  }

  primary.forEach((line, i) => {
    const sec = secondary?.[i]
    const role = vrRole(line)
    if (role) {
      const value: BilingualText = { primary: withoutMarker(line) }
      if (sec) value.secondary = withoutMarker(sec)
      vr.push({ role, text: value })
      return
    }
    flushVr()
    if (line.length === 0) return
    // A line is a rubric when it opens with one (a pure rubric, or a stage
    // direction that quotes prayer text); otherwise it's prayed body text.
    const value: BilingualText = { primary: joinLine(line) }
    if (sec) value.secondary = joinLine(sec)
    out.push(line[0].type === 'rubric' ? rubric(value) : text(value))
  })
  flushVr()
  return out
}

/** A choice-rich-text picker over a Prayer's options. `response`, when given,
 * is the people's reply rendered after each option (the orations' "Amém"). */
export function prayerPicker(args: {
  overrideKey: string
  label: BilingualText
  prayer: Prayer
  lang: LangPrefs
  defaultBlank?: boolean
  pickerStyle?: 'chips' | 'cards'
  response?: BilingualRichText
}): ContainerPrimitive {
  const options = args.prayer.options.map((opt, i) => {
    const o = choiceOption(`opt-${i}`, bt(opt.label, args.lang) ?? args.label, opt, args.lang)
    if (args.response) o.response = args.response
    return o
  })
  return {
    type: 'container',
    behavior: {
      kind: 'choice-rich-text',
      label: args.label,
      overrideKey: args.overrideKey,
      ...(args.defaultBlank ? {} : { selectedId: options[0]?.id }),
      ...(args.pickerStyle ? { pickerStyle: args.pickerStyle } : {}),
      options,
    },
  }
}
