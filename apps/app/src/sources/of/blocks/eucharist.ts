import type { MassFormulary, OrderOfMass } from '@ember/missal-schema'
import type { ChoiceRichTextOption, ContainerPrimitive } from '@/content/primitives'
import { brt, bt, type LangPrefs } from '../helpers'

/**
 * The day-preface picker, after the dialogue. `defaultBlank` — nothing renders
 * until the user identifies which preface the priest is praying.
 */
export function prefacePicker(f: MassFormulary, lang: LangPrefs): ContainerPrimitive | undefined {
  if (!f.prefaces || f.prefaces.length === 0) return undefined
  const options: ChoiceRichTextOption[] = f.prefaces.map((p) => {
    const o: ChoiceRichTextOption = {
      id: p.id,
      label: bt(p.label, lang) ?? { primary: p.id },
      body: brt(p.body, lang) ?? { primary: [] },
    }
    const excerpt = bt(p.excerpt, lang)
    if (excerpt) o.excerpt = excerpt
    return o
  })
  const label = bt({ 'pt-BR': 'Prefácio', 'en-US': 'Preface' }, lang) ?? { primary: 'Prefácio' }
  return {
    type: 'container',
    behavior: {
      kind: 'choice-rich-text',
      label,
      overrideKey: 'of.preface',
      pickerStyle: 'cards',
      options,
    },
  }
}

/** The Eucharistic Prayer picker, after the Sanctus. Cards previewing the opening words. */
export function eucharisticPrayerPicker(order: OrderOfMass, lang: LangPrefs): ContainerPrimitive {
  const options: ChoiceRichTextOption[] = order.eucharisticPrayers.map((ep) => {
    const o: ChoiceRichTextOption = {
      id: ep.id,
      label: bt(ep.label, lang) ?? { primary: ep.id },
      body: brt(ep.body, lang) ?? { primary: [] },
    }
    const excerpt = bt(ep.excerpt, lang)
    if (excerpt) o.excerpt = excerpt
    return o
  })
  const label = bt({ 'pt-BR': 'Oração Eucarística', 'en-US': 'Eucharistic Prayer' }, lang) ?? {
    primary: 'Oração Eucarística',
  }
  return {
    type: 'container',
    behavior: {
      kind: 'choice-rich-text',
      label,
      overrideKey: 'of.eucharistic-prayer',
      pickerStyle: 'cards',
      options,
    },
  }
}
