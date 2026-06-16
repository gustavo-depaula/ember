import type { BilingualRichText, BilingualText } from '@ember/content-engine'
import type { Localized, Reading, ReadingOption, ReadingSet } from '@ember/missal-schema'
import type {
  ChoiceRichTextOption,
  ContainerPrimitive,
  Primitive,
  VersesPrimitive,
} from '@/content/primitives'
import { cycleKeyFor } from '@/lib/mass-of/loaders'
import { brt, bt, heading, joinLine, type LangPrefs, rubric, text } from '../helpers'
import { deoGratias, gloryToYou } from '../responses'

/** The people's reply that seals each reading — the priest's "Palavra do
 * Senhor."/"Palavra da Salvação." is in the propers; the response is fixed. */
const readingResponse: Record<string, Localized | undefined> = {
  firstReading: deoGratias,
  secondReading: deoGratias,
  gospel: gloryToYou,
}

export { cycleKeyFor }

const slotLabels: Record<string, { pt: string; en: string }> = {
  firstReading: { pt: 'Primeira Leitura', en: 'First Reading' },
  psalm: { pt: 'Salmo Responsorial', en: 'Responsorial Psalm' },
  secondReading: { pt: 'Segunda Leitura', en: 'Second Reading' },
  sequence: { pt: 'Sequência', en: 'Sequence' },
  gospelAcclamation: { pt: 'Aclamação ao Evangelho', en: 'Gospel Acclamation' },
  gospel: { pt: 'Evangelho', en: 'Gospel' },
}

const bodyLength = (body: BilingualRichText): number =>
  body.primary.reduce((n, line) => n + line.reduce((m, s) => m + s.text.length, 0), 0)

/**
 * Distinguish a reading slot's options so the picker chips aren't all identical.
 * The common case is a long/short form (e.g. Gospel "2, 22-40" vs "2, 22-32") —
 * the longer body is the long form. Falls back to appending the citation.
 */
function optionLabels(
  base: BilingualText,
  options: ReadingOption[],
  bodies: BilingualRichText[],
  lang: LangPrefs,
): BilingualText[] {
  if (options.length <= 1) return options.map(() => base)
  if (options.length === 2) {
    const [a, b] = bodies.map(bodyLength)
    const longIdx = a >= b ? 0 : 1
    return options.map((_, i) => {
      const form =
        i === longIdx
          ? bt({ 'pt-BR': 'Forma longa', 'en-US': 'Long form' }, lang)
          : bt({ 'pt-BR': 'Forma breve', 'en-US': 'Short form' }, lang)
      return form ?? base
    })
  }
  return options.map((opt, i) => {
    const cit = bt(opt.citation ?? opt.body.citation, lang)
    return cit
      ? { primary: `${base.primary} — ${cit.primary}` }
      : { primary: `${base.primary} ${i + 1}` }
  })
}

function readingPicker(slot: string, reading: Reading, lang: LangPrefs): Primitive[] {
  const l = slotLabels[slot]
  const label = bt({ 'pt-BR': l.pt, 'en-US': l.en }, lang) ?? { primary: l.pt }
  const bodies = reading.options.map((opt) => brt(opt.body, lang) ?? { primary: [] })
  const labels = optionLabels(label, reading.options, bodies, lang)
  const options: ChoiceRichTextOption[] = reading.options.map((opt, i) => {
    const o: ChoiceRichTextOption = { id: `opt-${i}`, label: labels[i], body: bodies[i] }
    const citation = bt(opt.citation ?? opt.body.citation, lang)
    const intro = bt(opt.introduction, lang)
    if (citation) o.citation = citation
    if (intro) o.introduction = intro
    return o
  })
  const picker: ContainerPrimitive = {
    type: 'container',
    behavior: {
      kind: 'choice-rich-text',
      label,
      overrideKey: `of.reading.${slot}`,
      selectedId: options[0]?.id,
      // After the Gospel announcement ("✠ Proclamação…") the people answer
      // before the text is read.
      ...(slot === 'gospel' ? { precedingResponse: bt(gloryToYou, lang) } : {}),
      options,
    },
  }
  // The reading's closing dialogue — priest's acclamation (℣ "Palavra do
  // Senhor."/"Palavra da Salvação.") and the people's reply (℟ "Graças a
  // Deus."/"Glória a vós, Senhor.") — as a versicle/response pair, not a rubric.
  const conclusion = bt(reading.options.find((o) => o.conclusion)?.conclusion, lang)
  const reply = bt(readingResponse[slot], lang)
  const dialogue: VersesPrimitive['items'] = []
  if (conclusion) dialogue.push({ role: 'v', text: conclusion })
  if (reply) dialogue.push({ role: 'r', text: reply })
  return dialogue.length > 0 ? [picker, { type: 'verses', style: 'vr', items: dialogue }] : [picker]
}

/** Render the readings of a ReadingSet in liturgical order. */
const flattenRt = (rt: BilingualRichText): BilingualText => {
  const v: BilingualText = { primary: rt.primary.map((line) => joinLine(line)).join(' ') }
  if (rt.secondary) v.secondary = rt.secondary.map((line) => joinLine(line)).join(' ')
  return v
}

/** The Responsorial Psalm: a title, the ℟ refrain (+ any alternates), then each
 * stanza as its own block with the refrain repeated as a ℟ cue — the way it is
 * actually sung, not a flat numbered list. */
function renderPsalm(set: ReadingSet, lang: LangPrefs): Primitive[] {
  if (!set.psalm) return []
  const opt = set.psalm.options[0]
  const out: Primitive[] = [
    heading(
      bt({ 'pt-BR': slotLabels.psalm.pt, 'en-US': slotLabels.psalm.en }, lang) ?? {
        primary: slotLabels.psalm.pt,
      },
    ),
  ]
  const cite = bt(opt?.citation, lang)
  if (cite) out.push(rubric(cite))

  const refrains: VersesPrimitive['items'] = (opt?.responses ?? [])
    .map((r) => brt(r, lang))
    .filter((r): r is BilingualRichText => Boolean(r))
    .map((rf) => ({ role: 'r' as const, text: flattenRt(rf) }))
  if (refrains.length > 0) out.push({ type: 'verses', style: 'vr', items: refrains })

  const stanzas = opt?.verses[lang.primary] ?? opt?.verses['pt-BR'] ?? []
  const secStanzas = lang.secondary ? opt?.verses[lang.secondary] : undefined
  stanzas.forEach((stanza, si) => {
    const items = stanza.map((line, li) => {
      const t: BilingualText = { primary: joinLine(line) }
      const sline = secStanzas?.[si]?.[li]
      if (sline) t.secondary = joinLine(sline)
      return { text: t }
    })
    out.push({ type: 'verses', items })
    if (refrains[0]) out.push({ type: 'verses', style: 'vr', items: [refrains[0]] })
  })
  return out
}

export function renderReadingSet(set: ReadingSet, lang: LangPrefs): Primitive[] {
  const out: Primitive[] = []
  if (set.firstReading) out.push(...readingPicker('firstReading', set.firstReading, lang))
  out.push(...renderPsalm(set, lang))
  if (set.secondReading) out.push(...readingPicker('secondReading', set.secondReading, lang))
  if (set.sequence) {
    const body = brt(set.sequence.body, lang)
    if (body)
      out.push({
        type: 'verses',
        header: bt({ 'pt-BR': 'Sequência', 'en-US': 'Sequence' }, lang),
        items: body.primary.map((line) => ({ text: { primary: joinLine(line) } })),
      })
  }
  if (set.gospelAcclamation) {
    const ga = set.gospelAcclamation.options[0]
    const acc = brt(ga?.acclamation, lang)
    const verse = brt(ga?.verse, lang)
    // The Alleluia refrain (sung by all), then the proper verse — the upstream
    // verse field repeats the refrain glued to its front, so strip it.
    const accText = acc ? flattenRt(acc) : undefined
    // The acclamation is its own section, not a reply to the Second Reading: it
    // gets a heading like every other slot, and the refrain is an acclamation
    // sung by all — not a versicle/response dialogue, so no ℟ mark.
    if (accText || verse)
      out.push(
        heading(
          bt(
            { 'pt-BR': slotLabels.gospelAcclamation.pt, 'en-US': slotLabels.gospelAcclamation.en },
            lang,
          ) ?? { primary: slotLabels.gospelAcclamation.pt },
        ),
      )
    if (accText) out.push(text(accText))
    if (verse) {
      const v = flattenRt(verse)
      const strip = (s: string | undefined, prefix: string | undefined) =>
        s && prefix && s.startsWith(prefix) ? s.slice(prefix.length).trim() : s
      const primary = strip(v.primary, accText?.primary) ?? v.primary
      const out2: BilingualText = { primary }
      const sec = strip(v.secondary, accText?.secondary)
      if (sec) out2.secondary = sec
      if (primary) out.push(text(out2, 'italic'))
    }
  }
  if (set.gospel) out.push(...readingPicker('gospel', set.gospel, lang))
  return out
}
