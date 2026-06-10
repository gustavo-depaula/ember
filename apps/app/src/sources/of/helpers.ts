import type { BilingualRichText, BilingualText, RichTextLine } from '@ember/content-engine'
import type { Lang, Localized, Prayer, PrayerOption, RichText } from '@ember/missal-schema'
import type {
  CalloutPrimitive,
  ChoiceRichTextOption,
  ContainerPrimitive,
  Primitive,
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

/**
 * Render a RichText as one primitive per line — rubric lines become rubrics,
 * everything else body text. Used for fixed Order-of-Mass frames where there's
 * no picker, just continuous prayer text.
 */
export function lines(rt: RichText | undefined, lang: LangPrefs): Primitive[] {
  if (!rt) return []
  const primary = rt.lines[lang.primary] ?? rt.lines['pt-BR'] ?? rt.lines.la ?? []
  const secondary = lang.secondary ? rt.lines[lang.secondary] : undefined
  return primary.map((line, i) => {
    const allRubric = line.length > 0 && line.every((s) => s.type === 'rubric')
    const value: BilingualText = { primary: line.map((s) => s.text).join(' ') }
    const sec = secondary?.[i]
    if (sec) value.secondary = sec.map((s) => s.text).join(' ')
    return allRubric ? rubric(value) : text(value)
  })
}

/** A choice-rich-text picker over a Prayer's options. */
export function prayerPicker(args: {
  overrideKey: string
  label: BilingualText
  prayer: Prayer
  lang: LangPrefs
  defaultBlank?: boolean
  pickerStyle?: 'chips' | 'cards'
}): ContainerPrimitive {
  const options = args.prayer.options.map((opt, i) =>
    choiceOption(`opt-${i}`, bt(opt.label, args.lang) ?? args.label, opt, args.lang),
  )
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
