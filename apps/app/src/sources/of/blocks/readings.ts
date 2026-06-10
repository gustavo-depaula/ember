import type { Reading, ReadingSet } from '@ember/missal-schema'
import type { ChoiceRichTextOption, ContainerPrimitive, Primitive } from '@/content/primitives'
import { cycleKeyFor } from '@/lib/mass-of/loaders'
import { brt, bt, type LangPrefs, text } from '../helpers'

export { cycleKeyFor }

const slotLabels: Record<string, { pt: string; en: string }> = {
  firstReading: { pt: 'Primeira Leitura', en: 'First Reading' },
  psalm: { pt: 'Salmo Responsorial', en: 'Responsorial Psalm' },
  secondReading: { pt: 'Segunda Leitura', en: 'Second Reading' },
  sequence: { pt: 'Sequência', en: 'Sequence' },
  gospelAcclamation: { pt: 'Aclamação ao Evangelho', en: 'Gospel Acclamation' },
  gospel: { pt: 'Evangelho', en: 'Gospel' },
}

function readingPicker(slot: string, reading: Reading, lang: LangPrefs): ContainerPrimitive {
  const l = slotLabels[slot]
  const label = bt({ 'pt-BR': l.pt, 'en-US': l.en }, lang) ?? { primary: l.pt }
  const options: ChoiceRichTextOption[] = reading.options.map((opt, i) => {
    const o: ChoiceRichTextOption = {
      id: `opt-${i}`,
      label,
      body: brt(opt.body, lang) ?? { primary: [] },
    }
    const citation = bt(opt.citation ?? opt.body.citation, lang)
    const intro = bt(opt.introduction, lang)
    const conclusion = bt(opt.conclusion, lang)
    const response = opt.response
      ? brt(
          {
            lines: {
              [lang.primary]: [[{ type: 'response', text: opt.response[lang.primary] ?? '' }]],
            },
          },
          lang,
        )
      : undefined
    if (citation) o.citation = citation
    if (intro) o.introduction = intro
    if (conclusion) o.conclusion = conclusion
    if (response) o.response = response
    return o
  })
  return {
    type: 'container',
    behavior: {
      kind: 'choice-rich-text',
      label,
      overrideKey: `of.reading.${slot}`,
      selectedId: options[0]?.id,
      options,
    },
  }
}

/** Render the readings of a ReadingSet in liturgical order. */
export function renderReadingSet(set: ReadingSet, lang: LangPrefs): Primitive[] {
  const out: Primitive[] = []
  if (set.firstReading) out.push(readingPicker('firstReading', set.firstReading, lang))
  if (set.psalm) {
    // The psalm is option-shaped too, but its body lives in `responses`+`verses`;
    // render the first option's primary refrain + verses as text lines.
    const opt = set.psalm.options[0]
    const l = slotLabels.psalm
    out.push(text(bt({ 'pt-BR': l.pt, 'en-US': l.en }, lang) ?? { primary: l.pt }, 'italic'))
    const refrain = brt(opt?.responses[0], lang)
    if (refrain)
      out.push({
        type: 'verses',
        items: refrain.primary.map((line) => ({
          text: { primary: line.map((s) => s.text).join(' ') },
        })),
      })
    const verses = opt?.verses[lang.primary] ?? opt?.verses['pt-BR']
    if (verses) {
      out.push({
        type: 'verses',
        style: 'numbered',
        items: verses.map((block, i) => ({
          num: i + 1,
          text: { primary: block.map((line) => line.map((s) => s.text).join(' ')).join(' ') },
        })),
      })
    }
  }
  if (set.secondReading) out.push(readingPicker('secondReading', set.secondReading, lang))
  if (set.sequence) {
    const body = brt(set.sequence.body, lang)
    if (body)
      out.push({
        type: 'verses',
        header: bt({ 'pt-BR': 'Sequência', 'en-US': 'Sequence' }, lang),
        items: body.primary.map((line) => ({
          text: { primary: line.map((s) => s.text).join(' ') },
        })),
      })
  }
  if (set.gospelAcclamation) {
    const ga = set.gospelAcclamation.options[0]
    const verse = brt(ga?.verse, lang)
    if (verse)
      out.push(
        text(
          { primary: verse.primary.map((line) => line.map((s) => s.text).join(' ')).join(' ') },
          'italic',
        ),
      )
  }
  if (set.gospel) out.push(readingPicker('gospel', set.gospel, lang))
  return out
}
